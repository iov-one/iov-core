// Chain Id is from eip-155.md
const env = process.env.ETH_ENV || "local"; // 'local', 'testnetRopsten'

const local: any = {
  env: "local",
  base: "http://localhost:7545",
  chainId: "5777",
  minHeight: -1,
};

const testnetRopsten: any = {
  env: "ropsten",
  base: "https://ropsten.infura.io/",
  chainId: "3",
  minHeight: 4284887,
};

const testnetRinkeby: any = {
  env: "rinkeby",
  base: "https://rinkeby.infura.io",
  chainId: "4", // ISSUE: returns 0x30fdc1 (decimal number 3210689)
  minHeight: 3211058,
};

const config: any = {
  local,
  testnetRopsten,
  testnetRinkeby,
};
export const TestConfig = config[env];
