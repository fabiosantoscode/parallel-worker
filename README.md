# parallel-worker [![Build Status](https://travis-ci.org/fabiosantoscode/parallel-worker.svg?branch=master)](https://travis-ci.org/fabiosantoscode/parallel-worker)

Get a worker or spawned node process to which you can talk to using a message channel.

## Usage (function mode)

Call worker(fn) with your function. It should synchronously return a value, return a promise for a value, or call a callback (second argument).

```javascript
const result = await worker(item => item + 1)
assert.equal(result, 2)
```

## Usage (async mode)

Send and receive messages to and from the worker.

```javascript
const w = worker((onMessage, send) => {
  onMessage(function (msg) {
    send(msg + 1)
  })
})

w.send(1)

w.on('message', function (msg) {
  assert.equal(msg, 2)
})
```
