import { WorkerFn, AsyncWorkerFn, AsyncWorker } from './types'
import { EventEmitter } from 'events'

const urlStart = 'data:text/javascript;charset=utf-8,'

function async (fn: AsyncWorkerFn): AsyncWorker {
  const wrap = (fn: string) => `
    (${fn})(function onMessage(fn) {
      self.addEventListener('message', function (msg) {
        fn(msg.data)
      })
    }, function send(msg) {
      self.postMessage(msg)
    })
  `

  const worker = new Worker(urlStart + wrap(fn.toString()))

  const ret = new EventEmitter() as AsyncWorker

  worker.addEventListener('message', (msg: any) => {
    ret.emit('message', msg.data)
  })
  ret.send = (msg) => {
    worker.postMessage(msg)
  }
  ret.stop = () => {
    worker.terminate()
  }

  return ret
}

module.exports = (fn: WorkerFn, ...args: any[]): any => {
  const wrap = (fn: string) => `
    self.onmessage = function (args) {
      Promise.resolve().then(function () { return (${fn}).apply(null, args.data) }).then(function (ret) {
        self.postMessage({value: ret})
      }, function (err) {
        self.postMessage({error: ret})
      })
    }
  `
  const worker = new Worker(urlStart + wrap(fn.toString()))

  worker.postMessage(args)

  return new Promise(resolve => {
    worker.onmessage = resolve
  }).then((ret: any) => {
    if (ret.data.error) throw ret.data.error
    return ret.data.value
  })
}

module.exports.async = async
