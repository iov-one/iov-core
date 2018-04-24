const add = function(a: number, b: number): number {
  return a+b;
}

describe('Sample', () => {
	it('1 + 1 = 2', () => {
        let two = add(1, 1)
        expect(two).toBe(2)
	});
});