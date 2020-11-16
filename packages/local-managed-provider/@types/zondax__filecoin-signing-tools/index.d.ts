declare module "@zondax/filecoin-signing-tools/nodejs/filecoin_signer_wasm" {
  export * from "@zondax/filecoin-signing-tools";
}

declare module "@zondax/filecoin-signing-tools" {
  export interface ExtendedKey {
    address: string;
    public_raw: Uint8Array;
    private_raw: Uint8Array;
    public_hexstring: string;
    private_hexstring: string;
    public_base64: string;
    private_base64: string;
  }

  export interface MessageParams {
    From: string;
    To: string;
    Value: string;
    GasPrice: string;
    GasLimit: number;
    GasFeeCap: string;
    GasPremium: string;
    Nonce: number;
    Method: number;
    Params: string;
  }

  export interface TransactionSignLotusResponse {
    Message: MessageParams;
    Signature: {
      Type: number;
      Data: string;
    };
  }

  export function keyRecover(
    privateKey: string,
    testnet?: boolean
  ): ExtendedKey;
  export function keyRecoverBLS(
      privateKey: string,
      testnet?: boolean
  ): ExtendedKey;
  export function transactionSignLotus(
    message: MessageParams,
    privateKey: string
  ): TransactionSignLotusResponse;
  export function verifySignature(signature: any, message: any): any;
  export function transactionSerialize(message: any): any;
}
