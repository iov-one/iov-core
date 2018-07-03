# Architecture

This is a fundamental question of how we want to organize the apps
that needs to be clarified to proceed on the design of the key management.

## Stream State Changes to UI (listener)

Simplest is a bunch of functions that do stuff (add accounts, save
accounts, unlock accounts, sign transactions). As many may involve
I/O (reading from disk, talking with ledger), they must all be async
functions (return Promises).

Now many of these functions can update state somehow, and those
changes must be represented properly in a UI (which probably uses
some sort of redux store). All kinds of Promises resolving to
various state changes seems like a recipe for errors, so
we think to just emit events on state change. The UI can then
take the stream of change events emitted from `watchState`
and feed that into a dispatcher, same way UI actions feed into the
dispatcher.

## Handling Errors

So, we just call a method and go on, content that the UI will update
once the new accounts are created, or other action happens.
However, what happens if there is an error? How do we communicate this?

Maybe we don't just fire and forget, but rather get a promise back
from calling the method. We can `.catch()` any errors that are
returned and in this case dispatch another (UI) event to report the
failure.

But if we only return a Promise here in order to emit a failure event,
why can't the KeyController just emit those failure events directly.
We are guaranteed to eventually get an event describing the
desired state change or a failure event.

## Unifying actions

At this point, all methods that modify state should have the
form `(a: A, b: B, ...) => void`. Hmm... we could combine
those arguments into `(action: Action) => void`, which looks
very much like a redux dispatcher.

Then we could conceive of just unifying the API to look like:

```typescript
interface KeyController {
  dispatch: (action: Action) => void;

  // just call a remote dispatcher with each result
  listen: (uiDispatcher: (event: Event) => void);

  // or the more general presentation, reactive streams
  // kc.listen().map(uiDispatcher) would be the same as above
  listen: () => Stream<Event>;
}
```

Huh, now we conceive of multiple parts that each accept a stream
of inputs into their own dispatch method, and export a stream
of outputs to any listener, and we can connect two pieces
to close the loop. We have multiple state stores, but they are
all coupled with reactive streams so changes propogate everywhere.

Awesome, so much symmetry!

## Performing Calculations

Not so fast.... sometime we actually do care about the results
and want to use them in a workflow, not just send them to any
listener. What about signing a transaction?

When I sign a transaction, I may want to do something like:

```typescript
const nonce = await node.getNonce(account);
const signableBytes = codec.signableBytes(tx, nonce, chainID);
const sig = await keyControl.signTransaction(user, account, signableBytes)
const signedTx = {...tx, sigs: [...tx.sigs, sig]}
const postable = codec.postableBytes(signedTx);
const result = await node.sendTx(postable);
return txSuccessEvent(result.txId);
```

I want to use the KeyController to perform a calculation
and then feed the results into the next step of a longer
workflow. How do I represent this?

## Two types of flow

**Proposal**
(after discussion and reflection, I like this, but please give feedback)

**Async Actions** Just like when we call a website to perform an action
in redux. We get a promise back, which we can resolve to some state.
This is the case that should be used when we want to perform a
state-changing action on a remote system. This allows us to handle
success and failure modes at least, or possible use the result for
other actions. Here we can use standard promise chaining
(or async/await) to perform sequential computation.

**Reactive State Mirror** If we want to display the current
state of the system (list of accounts, current balance, etc),
the client can choose to mirror a subset of the state of the server.
We can add `GetState` and `SubscribeToStateChanges` functionality.
Such that on initial connect the client copies that substate
locally. It then subscribes to an event stream of all changes. Those
changes can be applied to the local state mirror via redux-like dispatcher
keeping the two in sync. Or course it could also be used in a fully
(functional) reactive programming style like
[cycle.js](https://cycle.js.org/).

An API should exist of multiple asynchronous actions for every
state transition that can be triggered from outside, and a
standardized subscription API to reactively mirror state.
The first part is pretty standard, the second one will be visited
in more detail in th next section.

## Reactively Mirroring State

We have some system state and we want to display it on a client.
Basically we need a local mirror of the state. This can be
acheived by:

* Querying on refresh (typical web pages, always show old state)
* Polling to auto-refresh (get responsiveness but kill the server)
* Subscribing to changes (websockets, etc.)

### Types of Subscriptions

A subscription will often look something like "Give me state +
Subscribe to all change events on that state". Assuming
"give me state" can be done efficiently and there is a
consistent connection between client and server, this can work well.
The client has no memory and just mirrors the server.
One of the most advanced examples of such an architecture
is [Rethink DB Change Feed API](https://rethinkdb.com/docs/changefeeds/javascript/)
You can optionally [include the initial value](https://rethinkdb.com/docs/changefeeds/javascript/#including-initial-values)
and get a callback on every change.

With modern javascript, we could replace the callback with
a streams and Observables, like
[RxJs](https://rxjs-dev.firebaseapp.com/) or
[xstream](http://staltz.github.io/xstream/). But the logic would
remain the same.

PostgreSQL has a concept of [streaming replication](https://www.postgresql.org/docs/10/static/protocol-replication.html)
and is designed for the case where we cannot copy the entire state
when a connection breaks. This may inform a design where the client
has a memory of information (eg. all transactions on many accounts,
the votes in an election) and after a short disconnect wants to update
the information reactively again. Rather than being forced to query
the entire state, or just streaming changes from the time of
reconnection (possibly losing some changes while disconnected),
we want to be able to query for "all changes since the last one I saw",
which we can pass to the server.

In the case of PostgreSQL, you first
[CREATE_REPLICATION_SLOT](https://www.postgresql.org/docs/10/static/protocol-replication.html#PROTOCOL-REPLICATION-CREATE-SLOT)
to create a queue, and start appending all change events from that
point on. When you want to start (or restart) replication,
you [START_REPLICATION](https://www.postgresql.org/docs/10/static/protocol-replication.html#id-1.10.5.9.4.1.5.1.8), which
`Instructs server to start streaming WAL,  starting at WAL location XXX/XXX.`
Note the use of two (long) integers to denote the location in a stream
of events.
`The receiving process can send replies back to the sender at any time`,
including
`The location of the last WAL byte + 1 received and written to disk in the standby.`
Once the receiving process has acknowledged receipt up to a given point,
the sending process is free to clean up this replication slot.
Otherwise it maintains history until memory limits and garbage
collection force a cleanup.

From the above, we can see how we can design a client with persistence
to maintain an offline-usable view as well as quickly reestablish
a live view of the state over flaky connections. This may sound a bit
theoretical, but if we aim for a mobile wallet, we should build
in such a mechanism for the client-server connections. If we want a
live view from another module in the same process, or another
process guaranteed to be on the same machine, the simpler
"change feed" is sufficient to maintain a smooth user experience.

### Filtering state

When the state we query is the unlocked public identities in a local
key store, it is simple enough to mirror the entire state in the UI and
decide what to display in the UI itself. However, if we wish to monitor
the balance of 3 accounts, we hardly have to stream the entire state
of a blockchain to do so. For this case we will we need some filter
on the connection, so only a targetted subset of the data is transmitted.

**TODO** Specify this out clearly...

^^^ This is the last open question of efficiently reactively streaming blockchain state ^^^

## A semi-concrete use case

Let's make a harder example, where maybe the actor model or
reactive streams start to make sense.

We connect to 3 different blockchains, I have a wallet UI (in chrome
extension), and a webapp connected. I have two accounts currently
unlocked. One is a software key to use for atomic swaps, and the
other is a ledger that manages long-term storage.

Wallet UI unlocks both account and queries balances.
See a good deal in the webapp, and initiate an atomic swap.
This goes to be signed by the software key and a confirmation
is presented in the wallet UI. After confirm, the offer signed
and posted to the blockchain, and my desired trade rate is stored
in my swap-bot (in the wallet UI).

While I am waiting for the counter-party to respond, I deside to move
1000 IOV off the ledger to my day-trader account. I initiate a transaction
to send this from the wallet UI and a transaction is sent to the ledger.
In the meantime, web4 receives a notification from the second chain in
the swap that an escrow is proposed. The counter is compared to the original
agreement, and as it matches, the trusted swap-bot creates a claim tx
and initiates it for signing (this may happen automatically or pop
up something on the UI). I click "okay" on the ledger app to finalize the
send transaction. Both transactions head to the chain, swaps and sends
are being resolved, and all account balances get updated.

This is a lot of data moving around at once. How do we model such a case
without going crazy?

This may seem a bit far-fetched, but once we provide this web4 API, and
some nice tools, we can allow all kinds of actions, like receiving state
channel payments and auto-claiming part every eg. 50 IOV tokens. Or
passing along multi-sig transactions to the next signatory on the message
after signing.

We should be able to handle information streams and automate many of the
responses by simple bots (IFTTT style). Hopefully this gives a bit of
inspiration of where to head with the architecture. I'm still not
sure what the proper architecture is to fulfill these use cases, but
I think simple promise chains won't work so well.

## Protecting internal class state against external manipulation

A class contains data and methods that operate on that data. Classes should distrust the outside world and make sure to all
state manipulation happens through a method that can verify the requested change
or update secondary data accoringly (e.g. flush a cache or recalculate a sum).

### Stategies to protect internal state

The following list shows ideas how to protect internal state against external
manipulation. In order to find the right case, you need to know if a type is immutable
or not.

* **immutable types:** primitives (string, number, boolean, null, undefined, symbol), ReadonlyArray of immutable type, ReadonlyDate
* **mutable types:** TypedArrays, Arrays, Date, other objects, classes, ReadonlyArray of mutable type,

#### Re-assignable members (no readonly keyword)

This can usually be avoided and is excpluded via the `readonly-keyword` tslint rule.

#### Private readonly immutable members

Example:

```ts
class Foo {
  private readonly isFoo: boolean = true;
  private readonly myName: string = "foo";
}
```

If those members should be exposed, either convert to public readonly immutable
member or use simple getter method.

```ts
class Foo {
  private readonly isFoo: boolean = true;

  public getIsFoo(): boolean {
    return this.isFoo;
  }
}
```

#### Private readonly mutable members

Example:

```ts
class Foo {
  public readonly privkey = new Uint8Array([0xaa, 0x22, 0xbb, 0x33]);
}
```

If those members should be exposed, use a defensive copy getter method,
since there is no general way to make mutable objects immutable.

```ts
class Foo {
  private readonly privkey = new Uint8Array([0xaa, 0x22, 0xbb, 0x33]);

  getPrivkey(): Uint8Array {
    return new Uint8Array(this.privkey);
  }
}

const foo = new Foo();
const privkey = foo.getPrivkey();
console.log(privkey); // Uint8Array [ 170, 34, 187, 51 ]
privkey[3] = 0xff;
console.log(privkey); // Uint8Array [ 170, 34, 187, 255 ]
console.log(foo.getPrivkey()); // Uint8Array [ 170, 34, 187, 51 ]
```

#### Public readonly immutable members

Example:

```ts
class Foo {
  public readonly isFoo = true;
  public readonly myName = "foo";
}

const foo = new Foo();
foo.isFoo = false; // compile error
foo.myName = "bar"; // compile error
```

Those are safe to use.

#### Public readonly mutable members

Example:

```ts
class Foo {
  public readonly privkey = new Uint8Array([0xaa, 0x22, 0xbb, 0x33]);
}
```

This is unsafe as a caller can manipulate internal state, e.g.

```ts
const foo = new Foo();
console.log(foo.privkey); // Uint8Array [ 170, 34, 187, 51 ]
foo.privkey[3] = 0xff;
console.log(foo.privkey); // Uint8Array [ 170, 34, 187, 255 ]
```

Since there is no general way to make mutable objects immutable,
defensive copies should be used in a getter method.

```ts
class Foo {
  private readonly privkey = new Uint8Array([0xaa, 0x22, 0xbb, 0x33]);

  public getPrivkey(): Uint8Array {
    return new Uint8Array(this.privkey);
  }
}

const foo = new Foo();
const privkey = foo.getPrivkey();
console.log(privkey); // Uint8Array [ 170, 34, 187, 51 ]
privkey[3] = 0xff;
console.log(privkey); // Uint8Array [ 170, 34, 187, 255 ]
console.log(foo.getPrivkey()); // Uint8Array [ 170, 34, 187, 51 ]
```

### Edge cases to consider

* Some mutable objects cannot be copied, so a different strategy than defensive copy must be applied.
* Some immutable objects can do damage anyway. E.g. a rxjs [Subject](http://reactivex.io/rxjs/manual/overview.html#subject) can be abused by a caller to spam messages to other listeners using the `next` method, so it must be converted into an Observable.
