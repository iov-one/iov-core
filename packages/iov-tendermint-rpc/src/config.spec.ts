export interface TendermintInstance {
  readonly url: string;
  readonly version: string;
  readonly appCreator: string;
}

/**
 * Tendermint instances to be tested.
 *
 * Testing legacy version: as a convention, the minor version number is encoded
 * in the port 111<version>, e.g. Tendermint 0.21.0 runs on port 11121. To start
 * a legacy version use
 *   TENDERMINT_VERSION=0.21.0 TENDERMINT_PORT=11121 ./scripts/tendermint/start.sh
 *   TENDERMINT_VERSION=0.25.0 TENDERMINT_PORT=11125 ./scripts/tendermint/start.sh
 *   TENDERMINT_VERSION=0.27.0 TENDERMINT_PORT=11127 ./scripts/tendermint/start.sh
 *
 * When more than 1 instances of tendermint are running, stop them manually:
 *   docker container ls | grep tendermint/tendermint
 *   docker container kill <container id from 1st column>
 */
export const tendermintInstances: ReadonlyArray<TendermintInstance> = [
  {
    url: "localhost:11125",
    version: "0.25.x",
    appCreator: "jae",
  },
  {
    url: "localhost:11127",
    version: "0.27.x",
    appCreator: "Cosmoshi Netowoko",
  },
];

export const defaultInstance: TendermintInstance = tendermintInstances[0];
