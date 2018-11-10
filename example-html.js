const worker = require('.')

async function main() {
  const res = await worker(item => item + 1, 1)

  console.log({res})

  const w = worker.async((onMessage, send) => {
    onMessage((msg) => {
      setTimeout(() => { send(msg + 1) })
    })
  })

  w.send(1)

  w.on('message', msg => {
    console.log({msg})
    w.stop()
  })
}

main().catch(err => { console.error(err) })
