const assert = require('assert')
const worker = require('..')

describe('parallel-worker', function () {
  it('spawns a worker that works in another process', function () {
    const w = worker(function (item) {
      return item + 1
    }, 1)

    return w.then(function (res) {
      assert.equal(res, 2)
    })
  })
  it('can spawn async workers', function (done) {
    const w = worker.async(function (onMessage, sendMessage) {
      onMessage(function (msg) {
        sendMessage(msg + 1)
      })
    })

    w.send(1)

    w.on('message', function (msg) {
      assert.equal(msg, 2)
      done()
    })
  })
})
