import { sendChunks, Transport } from "./exchange";
// import { checkAndRemoveStatus, Transport } from "./exchange";

const AppCode = 128;
// const CmdSign = 2;
const CmdPubkey = 4;

export const getPublicKey = async (transport: Transport): Promise<Uint8Array> =>
  sendChunks(transport, AppCode, CmdPubkey, new Uint8Array([]));

// export const signTransaction = async (transport: Transport, transaction: Uint8Array): Promise<Uint8Array> {

// }
