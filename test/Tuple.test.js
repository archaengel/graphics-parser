const chai = require('chai');

const { expect } = chai;

const Tuple = require('../src/Tuple');

describe('Tuple', () => {
  it('should have property "._1"', () => {
    expect(Tuple(3, 4)._1).to.equal(3);
  });

  it('should have property "._2"', () => {
    expect(Tuple(3, 4)._2).to.equal(4);
  });
});
