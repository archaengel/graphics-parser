const chai = require('chai');

const { expect } = chai;

const {
  drop,
  unaryMethod,
} = require('../src/Util');

describe('Util', () => {
  describe('unaryMethod', () => {
    it('returns a function', () => {
      const result = unaryMethod(x => 2 * x, 'double');
      expect(typeof result).to.equal('function');
    });

    it('calls instance method if present', () => {
      const result = unaryMethod(x => 2 * x, 'double');
      const obj = { double: x => 'instance' };
      expect(result(obj)).to.equal('instance');
    });

    it('calls supplied method if no instance method is present', () => {
      const result = unaryMethod(x => 2 * x, 'double');
      expect(result(3)).to.equal((6));
    });
  });

  describe('drop', () => {
    it('drops first elements in array up to given index', () => {
      const result = drop(3)([1, 2, 3, 4, 5]);
      expect(result).to.deep.equal([4, 5]);
    });
  });
});
