import { Stream } from "xstream";
import { KeyAction } from "./actions";
import { KeyEvent } from "./events";
export interface KeyControllerActor {
    readonly dispatch: (action: KeyAction) => void;
    readonly listen: () => Stream<KeyEvent>;
}
