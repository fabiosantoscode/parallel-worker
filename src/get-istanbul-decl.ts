
export default (fnStr: string) => {
  const istanbulVariableMatch = fnStr.match(/\{(cov_.*?)[[.]/)
  return 'var ' + (istanbulVariableMatch ? istanbulVariableMatch[1] : '_cov$$') + ' = {s: [], f: [], b: ' + '[' + Array(1000).join('[],') + '[]]' + '}'
}
