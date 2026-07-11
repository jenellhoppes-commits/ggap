import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const scanRoots = ['src/views', 'src/components']
const sourceRoots = ['src']

const walk = (dir, matcher, result = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path, matcher, result)
    } else if (matcher(path)) {
      result.push(path)
    }
  }
  return result
}

const vueFiles = scanRoots.flatMap((dir) => walk(join(root, dir), (path) => path.endsWith('.vue')))
const sourceFiles = sourceRoots.flatMap((dir) => walk(join(root, dir), (path) => /\.(vue|ts|tsx|js|json)$/.test(path)))

const tablePattern = /<n-data-table[\s\S]*?(?:\/>|<\/n-data-table>)/g
const mojibakePattern = /�|\?|\?|\?|\?|\?|\?|||||||/

const failures = []
let tableCount = 0

for (const file of vueFiles) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(tablePattern)) {
    tableCount += 1
    const table = match[0]
    const line = text.slice(0, match.index).split('\n').length
    const label = `${relative(root, file)}:${line}`

    if (!/:pagination=| pagination=/.test(table)) {
      failures.push(`${label} missing pagination`)
    }

    if (/:columns=/.test(table) && !/withTableSorters\(/.test(table)) {
      failures.push(`${label} missing withTableSorters`)
    }
  }
}

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8')
  if (mojibakePattern.test(text)) {
    failures.push(`${relative(root, file)} contains mojibake-like text`)
  }
}

const summary = {
  tableCount,
  failureCount: failures.length,
  failures
}

if (failures.length > 0) {
  console.error(JSON.stringify(summary, null, 2))
  process.exit(1)
}

console.log(JSON.stringify(summary, null, 2))
