declare module '@glif/filecoin-rpc-client' {
  export interface Config {
    apiAddress: string
    token?: string
  }

  export interface Request {
    (methodName: string, ...params: any[]): Promise<any>
  }

  export default class LotusRpcEngine {
    constructor(config: Config)
    request: Request
    apiAddress: string
    token: string
  }
  export function request(address: string): boolean
}
