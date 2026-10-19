#!/usr/bin/env node
// Student runner for the Visual Analytics 2026-2027 exercises.
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  compile, describe, dirs, findSpec, inspect, isFile, listFiles, listIds, rel,
  specPath, svgPath
} from './lib.mjs'

const HELP = `
Visual Analytics 2026-2027 - exercises

  npm run list                 list every exercise and where it exists
  npm run new <id>             copy the template of <id> into workspace/
  npm run render <id>          render your workspace copy, write workspace/<id>.svg
  npm run render:all           render every exercise in workspace/
  npm run compile <id>         print the Vega spec compiled from the Vega-Lite spec
  npm run help                 show this help

<id> is the file name without the .vg extension: the full id
(E04-01-penguins-warmup) or a unique prefix of it (E04-01).
`.trim()

// A mistake in the command line: reported with the usage text, exit code 2.
class UsageError extends Error {}

const [command, ...argv] = process.argv.slice(2)
const { flags, positionals } = parseArgs(argv)

function parseArgs (args) {
  const flags = new Set()
  const positionals = []
  for (const arg of args) {
    if (arg.startsWith('--')) flags.add(arg.slice(2))
    else positionals.push(arg)
  }
  return { flags, positionals }
}

const pad = (value, width) => String(value).padEnd(width)

// Centres a one-character mark under a column label ("TPL" -> " * ").
const center = (mark, width) => mark.padStart(Math.ceil((width + mark.length) / 2)).padEnd(width)

async function idsIn (dir, ext) {
  return (await listFiles(dir)).filter(f => f.endsWith(ext)).map(f => f.slice(0, -ext.length))
}

async function cmdList () {
  const [templates, solutions, workspace, expected] = await Promise.all([
    listIds(dirs.templates), listIds(dirs.solutions), listIds(dirs.workspace), idsIn(dirs.expected, '.svg')
  ])
  const ids = [...new Set([...templates, ...solutions, ...workspace, ...expected])].sort()
  if (!ids.length) {
    console.log('No exercise in the repository yet.')
    return 0
  }

  // Header and rows are built from the same columns and joined with the same
  // separator, so every mark sits under its label.
  const columns = [
    ['TPL', templates],
    ['SOL', solutions],
    ['WKS', workspace],
    ['SVG', expected]
  ]
  const width = Math.max(2, ...ids.map(id => id.length))
  console.log([pad('ID', width), ...columns.map(([label]) => label)].join('  '))
  for (const id of ids) {
    const marks = columns.map(([label, idsHere]) => center(idsHere.includes(id) ? '*' : '-', label.length))
    console.log([pad(id, width), ...marks].join('  ').trimEnd())
  }
  console.log(`
  TPL templates/   SOL solutions/   WKS workspace/ (yours)   SVG expected/
  ${templates.length} template(s), ${solutions.length} solution(s), ${workspace.length} of your exercise(s)`)

  if (!workspace.length) console.log('\n  Start an exercise with: npm run new <id>')
  return 0
}

async function cmdNew () {
  if (!positionals.length) throw new UsageError('which exercise? npm run new E04-01')

  await mkdir(dirs.workspace, { recursive: true })
  for (const query of positionals) {
    const { id, ambiguous } = await findSpec(query, [dirs.templates])
    if (!id) {
      throw new UsageError(ambiguous.length
        ? `"${query}" matches several templates: ${ambiguous.join(', ')}`
        : `no template matches "${query}". See npm run list`)
    }
    const dest = specPath(dirs.workspace, id)
    if (await isFile(dest)) {
      console.log(`skip  ${rel(dest)} exists`)
      continue
    }
    await cp(specPath(dirs.templates, id), dest)
    console.log(`new   ${rel(dest)}`)
  }
  console.log('\nEdit the file, then: npm run render <id>')
  return 0
}

// Renders each id and writes workspace/<id>.svg. A failing spec is reported and
// the other specs are still rendered.
async function renderJobs (ids) {
  let failures = 0
  for (const id of ids) {
    const file = specPath(dirs.workspace, id)
    const to = svgPath(dirs.workspace, id)
    const res = await inspect(file)
    if (res.error) {
      failures++
      console.log(`  FAIL ${rel(file)}: ${res.error}`)
      continue
    }
    await writeFile(to, res.svg)
    console.log(`${res.warnings.length ? 'WARN' : 'ok  '} ${rel(file)}  ${describe(res)} -> ${rel(to)}`)
    for (const w of res.warnings) console.log(`       warning: ${w}`)
  }
  console.log(`\n${failures ? `${failures} problem(s)` : 'ok'}: ${ids.length} spec(s) rendered`)
  return failures ? 1 : 0
}

async function cmdRender () {
  const all = flags.has('all')
  if (all && positionals.length) throw new UsageError('use either npm run render:all or an id')
  if (!all && !positionals.length) throw new UsageError('which exercise? npm run render E04-01 (or npm run render:all)')

  if (all) {
    const ids = await listIds(dirs.workspace)
    if (!ids.length) {
      console.log('workspace/ is empty: copy a template with npm run new <id>')
      return 0
    }
    return renderJobs(ids)
  }

  const ids = []
  for (const query of positionals) {
    const { id, ambiguous } = await findSpec(query, [dirs.workspace])
    if (!id) {
      throw new UsageError(ambiguous.length
        ? `"${query}" matches several files: ${ambiguous.join(', ')}`
        : `no workspace file matches "${query}". Start with: npm run new ${query}`)
    }
    ids.push(id)
  }
  return renderJobs(ids)
}

async function cmdCompile () {
  if (positionals.length !== 1) throw new UsageError('which spec? npm run compile E04-01')

  const arg = positionals[0]
  let file = await isFile(arg) ? path.resolve(arg) : null
  if (!file) {
    const { dir, id, ambiguous } = await findSpec(arg, [dirs.workspace, dirs.templates, dirs.solutions])
    if (!id) {
      throw new UsageError(ambiguous.length
        ? `"${arg}" matches several specs: ${ambiguous.join(', ')}`
        : `no spec matches "${arg}". See npm run list`)
    }
    file = specPath(dir, id)
  }
  console.log(JSON.stringify(await compile(JSON.parse(await readFile(file, 'utf8'))), null, 2))
  return 0
}

const commands = {
  list: cmdList,
  new: cmdNew,
  render: cmdRender,
  compile: cmdCompile,
  help: () => {
    console.log(HELP)
    return 0
  }
}

let code
try {
  const run = commands[command ?? 'help']
  if (!run) throw new UsageError(`unknown command "${command}"`)
  code = await run()
} catch (e) {
  if (e instanceof UsageError) {
    console.error(`error: ${e.message}\n`)
    console.error(HELP)
    code = 2
  } else {
    console.error(`error: ${e.message}`)
    code = 1
  }
}
process.exit(code)
