import { InvocResult, Subcall } from '../types'

const subcallExitsWithCode0 = (subcall: Subcall): boolean => {
  if (subcall.MsgRct.ExitCode !== 0) return false
  if (Array.isArray(subcall.Subcalls) && subcall.Subcalls.length > 0) {
    return subcall.Subcalls.every(subcallExitsWithCode0)
  }
  return true
}

const allCallsExitWithCode0 = (invocResult: InvocResult): boolean => {
  if (invocResult.MsgRct.ExitCode !== 0) return false
  if (invocResult.ExecutionTrace.MsgRct.ExitCode !== 0) return false
  if (!invocResult.ExecutionTrace.Subcalls) return true
  return invocResult.ExecutionTrace.Subcalls.every(subcallExitsWithCode0)
}

export default allCallsExitWithCode0
