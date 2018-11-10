import fs from 'fs'
import path from 'path'
import { v3 as murmur } from 'murmurhash'
import { EventEmitter } from 'events'
import getIstanbulDecl from './get-istanbul-decl'
import spawn from './spawn'
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
    }, function sendMessage(msg) {
      process.send(circularJson.parse(msg))
    })`
  )
}

interface AsyncWorker extends NodeJS.EventEmitter {
  send: (msg: any) => void
}

type AsyncWorkerFn = (
  onMessage: (fn: (msg: any) => void) => void,
  sendMessage: (msg: any) => void
) => any

module.exports = (fn: AsyncWorkerFn): AsyncWorker => {
  const fnStr = wrap(fn.toString())
  let filename
  let counter = 0
  do {
    filename = path.join(__dirname, 'tmp', murmur(fnStr) + '.' + counter++ + '.js')
  } while (fs.existsSync(filename))
  const cp = spawn(fnStr, filename)

  const ret = new EventEmitter() as AsyncWorker

  cp.on('message', (msg: any) => {
    ret.emit('message', msg)
  })
  ret.send = (msg: any) => {
    cp.send(circularJson.stringify(msg))
  }

  return ret
}
