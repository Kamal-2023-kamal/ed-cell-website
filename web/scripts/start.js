// Cross-platform start runner for Next.js
// Keeps "npm run start" unchanged while ensuring consistent behavior

const { spawn } = require('child_process')
const path = require('path')
const { findNextCli } = require('./launcher-utils')

const cwd = path.resolve(__dirname, '..')
const port = process.env.PORT || process.env.SERVER_PORT || '3000'
const host = process.env.HOST || '0.0.0.0'
const env = { ...process.env, PORT: port, SERVER_PORT: port }

// Resolve Next CLI robustly
const nextCli = findNextCli(cwd)

if (!nextCli) {
  console.error('[start] Next CLI not found. Did you run npm install?')
  process.exit(1)
}

console.log(`[start] Using Next CLI: ${nextCli}`)
const child = spawn(process.execPath, [nextCli, 'start', '-H', host, '-p', port], {
  cwd,
  env,
  stdio: 'inherit',
})

child.on('close', (code) => process.exit(code))
child.on('error', (err) => { console.error(err); process.exit(1) })