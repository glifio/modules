declare module "leb128" {
  declare function encode(num: string | number): Buffer;
  declare function decode(buffer: Buffer | Uint8Array): string;

  export const unsigned = {
    encode,
    decode
  };
}
