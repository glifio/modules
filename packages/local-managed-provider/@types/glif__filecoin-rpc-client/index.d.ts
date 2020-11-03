declare module '@glif/filecoin-rpc-client' {
  export interface Config {
    apiAddress: string
    token?: string
  }

  export type Request<A> = (methodName: string, ...params: any[]) => Promise<A>

  export default class LotusRpcEngine {
    constructor(config: Config)
    apiAddress: string
    token: string
    request<A>(methodName: string, ...params: any[]): Promise<A>
  }
  export function request(address: string): boolean
}
