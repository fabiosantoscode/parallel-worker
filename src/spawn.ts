import fs from 'fs'
import { fork, spawn } from 'child_process'
const semver = require('semver')

export default (fnStr: string, filename: string): any => {
  const tempFileExists = fs.existsSync(filename)
  if (!tempFileExists) fs.writeFileSync(filename, fnStr)
  return semver.satisfies(process.version, '^0.10.0')
    ? fork(filename, [], { stdio: ['pipe', 'pipe', 'inherit', 'ipc'] })
    : spawn(process.argv[0], [filename], { stdio: ['pipe', 'pipe', 'inherit', 'ipc'] })
}
