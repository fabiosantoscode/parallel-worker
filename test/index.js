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
})
