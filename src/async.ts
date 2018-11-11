import fs from 'fs'
import path from 'path'
import { v3 as murmur } from 'murmurhash'
import { EventEmitter } from 'events'
import getIstanbulDecl from './get-istanbul-decl'
import spawn from './spawn'
import { AsyncWorker, AsyncWorkerFn, OutputListener } from './types'
const circularJson = require('circular-json')

const wrap = (fnStr: string): string => {
  const istanbulVariableMatch = fnStr.match(/\{(cov_.*?)[[.]/)
  return (
    `var circularJson = require("circular-json")
    ${getIstanbulDecl(fnStr)}
    ;(${fnStr})(function onMessage(fn) {
      process.on('message', function (msg) {
        msg = circularJson.parse(msg)
        fn(msg)
      })
    }, function send(msg) {
      process.send(circularJson.stringify(msg))
    })`
  )
}

module.exports = (fn: AsyncWorkerFn): AsyncWorker => {
  const fnStr = wrap(fn.toString())
  let filename: string
  let counter = 0
  do {
    filename = path.join(__dirname, 'tmp', murmur(fnStr) + '.' + counter++ + '.js')
  } while (fs.existsSync(filename))
  const cp = spawn(fnStr, filename)

  const ret = new EventEmitter() as AsyncWorker

  cp.on('message', (msg: any) => {
    ret.emit('message', msg)
  })
  cp.stdout.on('data', (d: Buffer) => { ret.emit('stdout', d.toString()) })
  cp.stderr.on('data', (d: Buffer) => { ret.emit('stderr', d.toString()) })
  ret.send = (msg: any) => {
    cp.send(circularJson.stringify(msg))
  }
  ret.stop = () => {
    fs.unlinkSync(filename)
    cp.kill()
  }

  return ret
}
