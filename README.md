# parallel-worker [![Build Status](https://travis-ci.org/fabiosantoscode/parallel-worker.svg?branch=master)](https://travis-ci.org/fabiosantoscode/parallel-worker)

Get a worker or spawned node process to which you can talk to using a message channel.

Works in the browser and node.

## Usage (function mode)

Call worker(fn) with your function. It should synchronously return a value, or return a promise for a value.

```javascript
const result = await worker(item => item + 1)
assert.equal(result, 2)
```

## Usage (async mode)

Send and receive messages to and from the worker.

```javascript
const w = worker.async((onMessage, send) => {
  onMessage(function (msg) {
    send(msg + 1)
  })
})

w.send(1)

w.on('message', function (msg) {
  assert.equal(msg, 2)
})

// ...

w.stop()
```
