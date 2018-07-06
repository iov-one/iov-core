import { double } from "./index";

const isPending = () => true;

describe("Verify test framework", () => {
  it("Should run a simple case", () => {
    const ten = double(5);
    expect(ten).toBe(10);
  });

  it("Should mark simple case as pending", () => {
    if (isPending()) {
      pending();
    }
    fail("Should be pending");
  });
});
