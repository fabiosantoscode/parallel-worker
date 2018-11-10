import fs from 'fs'
import path from 'path'
import { v3 as murmur } from 'murmurhash'
import spawn from './spawn'
import getIstanbulDecl from './get-istanbul-decl'
const asyncMode = require('./async')
const circularJson = require('circular-json')

const wrap = (fnStr: string): string => {
  return (
    'var circularJson = require("circular-json")\n' +
    'var userAsyncFunction = require("user-async-function")\n' +
    getIstanbulDecl(fnStr) + '\n' +
    'process.on("message", function (msg) {\n' +
    '  msg = circularJson.parse(msg)\n' +
    '  userAsyncFunction.apply(null, [' + fnStr + '].concat(msg)).then(function (retVal) {\n' +
    '     process.send(circularJson.stringify({value: retVal}))\n' +
    '  }, function (error) {\n' +
    '     process.send(circularJson.stringify({error: error}))\n' +
    '  })\n' +
    '})\n'
  )
}

type WorkerFn = (...args: any[]) => any

module.exports = async (fn: WorkerFn, ...args: any[]) => {
  const fnStr = wrap(fn.toString())
  let filename
  let counter = 0
  do {
    filename = path.join(__dirname, 'tmp', murmur(fnStr) + '.' + counter + '.js')
  } while (fs.existsSync(filename))
  const cp = spawn(fnStr, filename)
  function waitForMessage (): Promise<any> {
    return new Promise(resolve => {
      cp.once('message', (msg: string) => resolve(circularJson.parse(msg)))
    })
  }

  setImmediate(() => { cp.send(circularJson.stringify(args)) })
  const { error, value } = await waitForMessage()

  fs.unlinkSync(filename)

  if (error) throw error
  return value
}

module.exports.async = asyncMode
