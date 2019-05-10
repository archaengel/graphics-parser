const chai = require('chai');

const { expect } = chai;

const StateT = require('../src/StateT');
const List = require('../src/List');

describe('StateT', () => {
  const mts = StateT(List);

  it('should return a List of Tuple when run with List', () => {
    expect(mts.of(3).run(4).head()._1).to.equal(3);
    expect(mts.of(3).run(4).head()._2).to.equal(4);
  });

  it('should return empty List when empty is called on StateT', () => {
    expect(mts.empty().run(4)).to.equal(List.empty);
  });

  it('should chaining (mts.of) and running should be the same as Id', () => {
    expect(mts.of(3).chain(mts.of).run(4).head()._1).to.equal(mts.of(3).run(4).head()._1);
  });

  it('should impliment List\'s concat method', () => {
    const actual = mts.of(5).concat(mts.of(8)).run(3);
    const expected = mts.of(5).run(3).concat(mts.of(8).run(3));
    expect(actual.head()._1).to.equal(expected.head()._1);
  });

  it('should have get which replicates state', () => {
    const actual = mts.get.run(5);
    expect(actual.head()._1).to.equal(5);
    expect(actual.head()._2).to.equal(5);
  });

  it('should have modify which modifies state with given function', () => {
    const testFn = x => `${x}!`;
    const actual = mts.modify(testFn).run(4);
    expect(actual.head()._2).to.equal('4!');
  });

  it('should have put which replaces current state', () => {
    const actual = mts.put('a').run(5);
    expect(actual.head()._2).to.equal('a');
  });
});
