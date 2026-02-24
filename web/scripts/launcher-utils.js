const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

/**
 * robustly resolves the Next.js CLI path
 * @param {string} cwd - The directory to search for node_modules
 * @returns {string|undefined} The path to the Next.js CLI or undefined if not found
 */
function findNextCli(cwd) {
  const candidates = [
    path.resolve(cwd, 'node_modules', 'next', 'dist', 'bin', 'next'),
    path.resolve(cwd, 'node_modules', 'next', 'dist', 'bin', 'next.js'),
    path.resolve(cwd, 'node_modules', '.bin', 'next'),
  ]

  return candidates.find((p) => {
    try {
      fs.accessSync(p)
      return true
    } catch {
      return false
    }
  })
}

/**
 * Spawns a child process and returns a promise that resolves when it exits with code 0
 * @param {string} cmd - Command to run
 * @param {string[]} args - Arguments
 * @param {object} opts - Spawn options
 * @returns {Promise<void>}
 */
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}

module.exports = { findNextCli, run }
