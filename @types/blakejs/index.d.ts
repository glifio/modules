declare module "blakejs" {
  export function blake2b(
    input: string | Uint8Array,
    key: Uint8Array | null,
    outlen?: number
  ): Uint8Array;
}
