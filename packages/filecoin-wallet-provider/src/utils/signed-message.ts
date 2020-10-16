import { LotusMessage } from "@glif/filecoin-message";

export interface SignedMessage {
  Message: LotusMessage
  Signature: {
    Type: number
    Data: string
  }
}