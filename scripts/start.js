// Cross-platform start runner for Next.js
// Detects "output: standalone" and runs the correct entrypoint
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { findNextCli } = require('./launcher-utils')

const cwd = path.resolve(__dirname, '..')
const port = process.env.PORT || process.env.SERVER_PORT || '3000'
const host = process.env.HOST || '0.0.0.0'
const env = { ...process.env, HOST: host, PORT: port, SERVER_PORT: port }

const standaloneDir = path.join(cwd, '.next', 'standalone')
const standaloneServer = path.join(standaloneDir, 'server.js')

function ensureAssetsForStandalone() {
  try {
    const targetNextDir = path.join(standaloneDir, '.next')
    const targetStatic = path.join(targetNextDir, 'static')
    const srcStatic = path.join(cwd, '.next', 'static')
    const targetPublic = path.join(standaloneDir, 'public')
    const srcPublic = path.join(cwd, 'public')

    if (!fs.existsSync(targetNextDir)) {
      fs.mkdirSync(targetNextDir, { recursive: true })
    }
    if (fs.existsSync(srcStatic) && !fs.existsSync(targetStatic)) {
      try {
        fs.symlinkSync(srcStatic, targetStatic, 'dir')
        console.log('[start] Linked .next/static into standalone')
      } catch {
        // fallback to copy
        fs.cpSync(srcStatic, targetStatic, { recursive: true })
        console.log('[start] Copied .next/static into standalone')
      }
    }
    if (fs.existsSync(srcPublic) && !fs.existsSync(targetPublic)) {
      try {
        fs.symlinkSync(srcPublic, targetPublic, 'dir')
        console.log('[start] Linked public into standalone')
      } catch {
        fs.cpSync(srcPublic, targetPublic, { recursive: true })
        console.log('[start] Copied public into standalone')
      }
    }
  } catch (err) {
    console.warn('[start] Failed to prepare assets for standalone:', err.message)
  }
}

function startStandalone() {
  ensureAssetsForStandalone()
  console.log('[start] Running standalone server:', standaloneServer)
  const child = spawn(process.execPath, [standaloneServer], {
    cwd: standaloneDir,
    env,
    stdio: 'inherit',
  })
  child.on('close', (code) => process.exit(code))
  child.on('error', (err) => {
    console.error('[start] Standalone server failed:', err)
    process.exit(1)
  })
}

function startNext() {
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
}

if (fs.existsSync(standaloneServer)) {
  startStandalone()
} else {
  startNext()
}
