# Visual Analytics 2026-2027 – Exercises

> Google Classroom: `3vyzuwre`

This repository contains the practical part of the course: the text of the
exercises ([EXERCISES.md](EXERCISES.md)), the **templates** you start from, the
**reference solutions** with their rendered images, the **datasets**, and a
small Node.js runner that turns your Vega-Lite specs into SVG images.

Your own work lives in `workspace/`, which git ignores. That is what makes
`git pull` safe: the course material arrives, your exercises stay untouched and
no conflict is ever possible.

## Requirements

- Node.js >= 22.12 (`node -v`; there is a `.nvmrc` for nvm users)
- git
- a text editor and a browser: the runner writes an SVG you can open to look at
  the chart, next to the spec you are editing

## 1. Get the repository (once)

```bash
git clone <repository-url> va-exercises
cd va-exercises
npm install
npm run list
```

`npm run list` shows every exercise and where it exists:

```
ID                      TPL  SOL  WKS  SVG
E04-01-penguins-warmup   *    *    -    *

  TPL templates/   SOL solutions/   WKS workspace/ (yours)   SVG expected/
  1 template(s), 1 solution(s), 0 of your exercise(s)
```

An exercise is identified by its file name without extension
(`E04-01-penguins-warmup`). Every command also accepts a **unique prefix**
(`E04-01`).

## 2. Update it (before each session)

```bash
git pull
npm install          # only when the pull changed package.json / package-lock.json
```

`git pull` touches `templates/`, `solutions/`, `expected/`, `data/` and the
docs. It never touches `workspace/` (see [.gitignore](.gitignore)), so your
files cannot be overwritten and cannot conflict.

If `git pull` refuses to run, you have edited a tracked file by mistake: run
`git status`, then `git restore <file>` (or `git restore .`). Your own work must
stay in `workspace/`.

## 3. Do an exercise

```bash
npm run new E04-01               # copy the template into workspace/
npm run render E04-01            # render it -> workspace/E04-01-penguins-warmup.svg
```

Now edit `workspace/E04-01-penguins-warmup.vg`, save, and render again. The
runner tells you what went wrong when a spec does not compile or render:

```
ok   workspace/E04-01-penguins-warmup.vg  344 marks -> workspace/E04-01-penguins-warmup.svg
FAIL workspace/E04-01-penguins-warmup.vg: schema: /encoding/x/type must be equal to one of the allowed values
```

To compare with the reference answer, read `solutions/<id>.vg` and open the
rendered image in `expected/<id>.svg`.

## Commands

| Command | What it does |
|---|---|
| `npm run list` | List every exercise and where it exists |
| `npm run new <id>` | Copy the template of `<id>` into `workspace/` |
| `npm run render <id>` | Render your workspace copy of `<id>`, writing `workspace/<id>.svg` |
| `npm run render:all` | Render **all your exercises** in `workspace/` |
| `npm run compile <id>` | Print the Vega spec compiled from the Vega-Lite spec |
| `npm run help` | Show the command reference |

Notes:

- Several ids can be given at once: `npm run render E04-01 E05-02`.
- `render` always writes the SVG, and never into the tracked folders.
- `new` never overwrites: if the file is already in `workspace/`, it is skipped.
  To start again from the template, delete your file and run `new` again.
- `render:all` renders every spec in `workspace/`, so also files you named
  yourself; it keeps going after an error and exits with code `1` if any spec
  failed.

## Saving and submitting your exercises

Your exercises are **saved as normal files** in `workspace/`: there is nothing
to commit, and `git pull` will never remove them.

- `workspace/<id>.vg` — your attempt, the file you keep editing.
- `workspace/<id>.svg` — the rendering, written by `npm run render`; derived,
  safe to delete.

Because git ignores this folder, it is not backed up: copy `workspace/` to your
cloud drive if you want a safety net, or put it under version control in your own
private repository.

## Repository layout

```
EXERCISES.md    text of the exercises
templates/      starting point of each exercise     <id>.vg
solutions/      reference solution, same file name  <id>.vg
expected/       SVG rendering of each solution      <id>.svg
data/           datasets and DATASETS.md
workspace/      YOUR exercises — ignored by git
scripts/        the runner (va.mjs, lib.mjs)
```

Conventions every spec follows: Vega-Lite v6 JSON with the `.vg` extension, data
loaded from `../data/` with a relative URL, and file names
`E<lecture>-<nn>-<slug>.vg` (`F<n>` marks a "fix the broken spec" exercise).

## Which files may I edit?

Only `templates/`, `solutions/`, `expected/`, `data/`,
`EXERCISES.md`, `scripts/` and the package files are maintained by the
instructors and are overwritten by `git pull`. If you edit them, `git status`
shows them as modified and the next pull will complain; undo with
`git restore <file>`.

Keep the file name unchanged when you copy it into `workspace/`: the runner
looks exercises up by name (`npm run render E04-01`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| `error: Cannot find package ...` | `npm install` (and again after a `git pull` that changed the package files) |
| `error: no workspace file matches "..."` | Start the exercise with `npm run new <id>`; check the id with `npm run list` |
| `git pull` reports local changes | You edited a tracked file: `git status`, `git restore <file>` |
| `error: engine node is incompatible` | Use Node >= 22.12 (`nvm use` reads `.nvmrc`) |
| Chart empty / `renders no marks` | Missing or wrong field name: check `data/DATASETS.md` and the header of the CSV |
