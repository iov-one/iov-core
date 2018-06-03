import {
  AddressString,
  ClientNameString,
  ClientTokenString,
  NonceBuffer,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  Transaction,
  TTLBuffer
} from "@iov/types";
import { Stream } from "xstream";
import { PasswordString, UsernameString } from "./accounts";
import {
  ImportPrivateKey,
  PrivateAction,
  SignTransaction
} from "./actions_private";

// do we listen as one giant blob, or a separate listener
// for each subset of the state tree
type StateWatcher = () => Stream<KeybaseState>;
type UserWatcher = () => Stream<UsernameString>;

// this makes sense for eg. create account, which will just
// show response by updating state sent to StateWatcher
// type PrivateDispatcher = (action: PrivateAction) => void;

// this makes sense for signmessage, which wants to pass the
// return value into another pipe.
// unless we have some WatchAllSignedMessages() stream....

// Do we have one generate function, or specific types ones?
// Can we use overloading to define all possible
// request/response pairs on one dispath function
type PrivateDispatcher = (action: PrivateAction) => Promise<any>;
type SignDispatcher = (action: SignTransaction) => Promise<Transaction>;
type ImportDispatcher = (action: ImportPrivateKey) => Promise<true>; // ??

interface KeybaseState {
  readonly users: ReadonlyArray<UsernameString>;
  readonly activeKey: PublicKeyString | null;
}

/*
dispatch(action) .... reducer(action, state) => state

components: props: (state) => state.foo.bar
*/

/*
dispatch(action) => promise(success|failure)
like async middleware / axios....

watch(state, 'foo.bar') => Stream<Updates>

you may want to compose all these streams into one reactive state....

combine(watch1, watch2, watch3).map((w1, w2, w3) => ({
  foo: w1,
  bar: w2,
  baz: w3
})).subscribe(state => dispatch({type: SET_STATE, data: state}));

watch1.subscribe(state => dispatch({type: UPDATE_FOO,  data: state}));
watch2.subscribe(state => dispatch({type: UPDATE_BAR,  data: state}));
watch3.subscribe(state => dispatch({type: UPDATE_BAZ,  data: state}));
*/
