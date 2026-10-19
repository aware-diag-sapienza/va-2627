// Shared helpers for the exercise runner: discovery, validation and rendering.
import { readdir, readFile, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const dirs = {
  templates: path.join(root, 'templates'),
  solutions: path.join(root, 'solutions'),
  workspace: path.join(root, 'workspace'),
  expected: path.join(root, 'expected')
}

// A spec is a `.vg` file: Vega-Lite JSON with the course extension.
const SPEC_EXT = '.vg'

const require = createRequire(import.meta.url)

export async function isFile (file) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

// File name without the spec extension (templates/E04-01-penguins.vg -> E04-01-penguins).
export function idOf (fileName) {
  return fileName.endsWith(SPEC_EXT) ? fileName.slice(0, -SPEC_EXT.length) : null
}

// Sorted file names of a directory (empty array if the directory is missing).
export async function listFiles (dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries.filter(e => e.isFile()).map(e => e.name).sort()
  } catch {
    return []
  }
}

// Ids of the specs of a directory, in file name order.
export async function listIds (dir) {
  return (await listFiles(dir)).filter(f => idOf(f)).map(idOf)
}

export function specPath (dir, id) {
  return path.join(dir, `${id}${SPEC_EXT}`)
}

// SVG rendered from a spec of `dir` (`workspace/` for the students, `expected/`
// for the reference solutions).
export function svgPath (dir, id) {
  return path.join(dir, `${id}.svg`)
}

// Finds the specs of `dir` whose id is `query` or starts with `query`.
// Returns the matching ids (0, 1 or more), so the caller can report ambiguity.
async function matchId (query, dir) {
  const ids = await listIds(dir)
  const clean = idOf(query) ?? query
  const exact = ids.filter(id => id === clean)
  return exact.length ? exact : ids.filter(id => id.startsWith(clean))
}

// First directory (in the given order) where `query` matches exactly one id.
export async function findSpec (query, searchDirs) {
  const ambiguous = []
  for (const dir of searchDirs) {
    const matched = await matchId(query, dir)
    if (matched.length === 1) return { dir, id: matched[0] }
    ambiguous.push(...matched)
  }
  return { dir: null, id: null, ambiguous }
}

// Vega-Lite, Vega and the schema validator are loaded on first use: `list`,
// `new` and `help` never need them and must stay fast.
let engine = null
async function getEngine () {
  if (!engine) {
    const [{ default: Ajv }, vega, vl] = await Promise.all([
      import('ajv'), import('vega'), import('vega-lite')
    ])
    const schema = require('vega-lite/vega-lite-schema.json')
    engine = {
      vega,
      vl,
      validate: new Ajv({ strict: false, validateFormats: false }).compile(schema)
    }
  }
  return engine
}

// Compiles a Vega-Lite spec to a Vega spec, collecting Vega-Lite warnings.
export async function compile (spec, warnings = []) {
  const { vl } = await getEngine()
  const logger = {
    level () { return logger },
    warn (...a) { warnings.push(a.map(String).join(' ')); return logger },
    info () { return logger },
    debug () { return logger },
    error (...a) { warnings.push(a.map(String).join(' ')); return logger }
  }
  return vl.compile(spec, { logger }).spec
}

function countMarks (scene) {
  let n = 0
  const walk = (mark) => {
    for (const item of mark.items || []) {
      if (mark.marktype === 'group') {
        for (const child of item.items || []) walk(child)
      } else if (mark.role === 'mark') {
        n++
      }
    }
  }
  walk(scene)
  return n
}

// Parses, validates, compiles and renders a spec.
// Returns { error, warnings, marks, svg } and never throws.
export async function inspect (file) {
  let spec
  try {
    spec = JSON.parse(await readFile(file, 'utf8'))
  } catch (e) {
    return { error: `invalid JSON: ${e.message}`, warnings: [], marks: 0 }
  }
  const { vega, validate } = await getEngine()
  if (!validate(spec)) {
    const first = [...new Set(validate.errors.map(e => `${e.instancePath || '/'} ${e.message}`))].slice(0, 2)
    return { error: `schema: ${first.join('; ')}`, warnings: [], marks: 0 }
  }
  const warnings = []
  try {
    const vgSpec = await compile(spec, warnings)
    const loader = vega.loader({ baseURL: path.dirname(file) + path.sep, mode: 'file' })
    const view = new vega.View(vega.parse(vgSpec), { loader, renderer: 'none', logLevel: vega.Error })
    await view.runAsync()
    const marks = countMarks(view.scenegraph().root)
    const svg = await view.toSVG()
    view.finalize()
    return { error: null, warnings, marks, svg }
  } catch (e) {
    return { error: `compile/render: ${e.message}`, warnings, marks: 0 }
  }
}

export function rel (file) {
  return path.relative(root, file) || file
}

export function describe (res) {
  if (res.error) return res.error
  if (res.warnings.length) return `${res.marks} marks, ${res.warnings.length} warning(s)`
  return `${res.marks} marks`
}
