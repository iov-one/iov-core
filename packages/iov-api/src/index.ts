// export the most commonly needed pieces to pull together higher-level apps,
// even if they come from other repos. We also pull in all types here.

// this should serve as an entry point into the whole monorepo.

export { Ed25519SimpleAddressKeyringEntry, UserProfile } from "@iov/keycontrol";
export * from "@iov/types";

export { bnsConnector, Web4Write, withConnectors } from "./web4write";
