import fs from 'fs'
import { fork, spawn } from 'child_process'
import semver from 'semver'

export default (fnStr, filename) => {
  const fileExists = fs.existsSync(filename)
  if (!fileExists) fs.writeFileSync(filename, fnStr)
  return spawn(process.argv[0], [filename], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
}
