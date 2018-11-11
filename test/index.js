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

      w.stop()
      done()
    })
  })
  it('can read stdout of the worker', function (done) {
    this.timeout(10000)
    let called = 0
    const w = worker.async(function (onMessage, send) {
      console.log('hello world')
      console.error('hey, slow down')
    })

    w.on('stdout', function (d) {
      called++
      assert.equal(d, 'hello world\n')
    })

    w.on('stderr', function (e) {
      assert.equal(e, 'hey, slow down\n')
      called++
    })

    setTimeout(() => {
      assert.equal(called, 2)
      done()
    }, 500)
  })
})
