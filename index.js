// Simple launcher for panels where Startup Command is not editable
// Runs Next.js from the `web` directory: install -> build -> start

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { findNextCli, run } = require('./scripts/launcher-utils')

;(async () => {
  const port = process.env.PORT || process.env.SERVER_PORT || '3000'
  // Ensure both env names are available to child processes
  const env = { ...process.env, PORT: port, SERVER_PORT: port }

  const cwd = __dirname

  // Always run npm install to ensure native modules (like lightningcss) are installed for the current platform
  // This is critical when moving from Windows to Linux
  console.log('[launcher] Installing/Updating dependencies...')
  await run('npm', ['install'], { cwd, env })

  // Resolve Next CLI path robustly and run via node to avoid permission issues
  const nextCli = findNextCli(cwd)
  if (!nextCli) {
    console.error('Next CLI not found. Ensure dependencies are installed in ./web')
    process.exit(1)
  }

  console.log(`[launcher] Using Next CLI: ${nextCli}`)
  console.log('[launcher] Building production bundle...')
  // Force webpack build to avoid Turbopack memory issues and config conflicts
  await run(process.execPath, [nextCli, 'build', '--webpack'], { cwd, env })

  // Start production server and keep this parent process alive until it exits
  console.log('[launcher] Starting server...')
  const child = spawn(process.execPath, [nextCli, 'start', '-H', '0.0.0.0', '-p', port], { cwd, env, stdio: 'inherit' })
  child.on('close', (code) => process.exit(code))
  child.on('error', (err) => {
    console.error(err)
    process.exit(1)
  })
})().catch((err) => {
  console.error(err)
  process.exit(1)
})