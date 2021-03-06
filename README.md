# parallel-worker [![Build Status](https://travis-ci.org/fabiosantoscode/parallel-worker.svg?branch=master)](https://travis-ci.org/fabiosantoscode/parallel-worker)

Get a worker or spawned node process to which you can talk to using a message channel.

Works in the browser and node.

## function mode

Call worker(fn) with your function. It should synchronously return a value, or return a promise for a value.

```javascript
const result = await worker(item => item + 1)
assert.equal(result, 2)
```

## async mode

Send and receive messages to and from the worker.

Use the `stdout` and `stderr` events to subscribe to stdout and stderr streams on the worker, if you're in node. Subscribing to stdout and stderr does not work in the browser.

```javascript
const w = worker.async((onMessage, send) => {
  onMessage(function (msg) {
    send(msg + 1)
  })
})

w.send(1)

w.on('stdout', (d) => {
  console.log(d)
})
w.on('stderr', (d) => {
  console.error(d)
})
w.on('message', function (msg) {
  assert.equal(msg, 2)
})

// ...

w.stop()
```

## strings instead of functions

You can always use a string with a function instead of a real function. This is useful because you may want to require other modules with webpack.
