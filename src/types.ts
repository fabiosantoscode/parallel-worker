
export type WorkerFn = (...args: any[]) => any

export interface AsyncWorker extends NodeJS.EventEmitter {
  send: (msg: any) => void,
  stop: () => void
}

export type AsyncWorkerFn = (
  onMessage: (fn: (msg: any) => void) => void,
  sendMessage: (msg: any) => void
) => any

