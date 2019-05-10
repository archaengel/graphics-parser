const chai = require('chai');

const { expect } = chai;

const List = require('../src/List');
const Tuple = require('../src/Tuple');

const {
  char,
  clrCmd,
  colorCmd,
  colorPrefix,
  encodedNumber,
  item,
  junkPrefix,
  leadingByte,
  leadingDigit,
  letter,
  lower,
  many,
  many1,
  mvCmd,
  mvCoords,
  mvPrefix,
  penCmd,
  penPrefix,
  sat,
  seq,
  trailingByte,
  upper,
} = require('../src/ParserCombinators');

describe('ParserCombinators', () => {
  describe('item', () => {
    it('should consume first character of string', () => {
      const state = Tuple(Tuple(Tuple(10, 20), true), 'hello');
      const result = item.run(state).head();
      expect(result._1).to.equal('h');
      expect(Tuple.is(result._2._1)).to.be.true;
      expect(result._2._2).to.equal('ello');
    });

    it('should fail if state is empty string', () => {
      const state = Tuple(Tuple(Tuple(10, 20), true), '');
      const result = item.run(state).toArray();
      expect(result).to.deep.equal([]);
    });
  });

  describe('sat', () => {
    it('should consume first character if it satisfies predicate', () => {
      const state = Tuple(Tuple(Tuple(10, 20), true), 'abcd');
      const result = item.run(state).head();
      expect(result._1).to.equal('a');
      expect(Tuple.is(result._2._1)).to.be.true;
      expect(result._2._2).to.equal('bcd');
    });

    it('should fail if firs character does not satisfy predicate', () => {
      const state = Tuple(Tuple(Tuple(10, 20), true), 'bbcd');
      const result = sat(x => x === 'a').run(state).toArray();
      expect(result).to.deep.equal([]);
    });
  });

  describe('lower', () => {
    it('should consume first letter if lowercase', () => {
      const state = Tuple(Tuple(Tuple(10, 20), true), 'hello');
      const result = lower.run(state).head();
      expect(result._1).to.equal('h');
      expect(result._2._2).to.equal('ello');
    });

    it('should fail if passed string with head of uppercase', () => {
      const state = Tuple(Tuple(Tuple(10, 20), true), 'Hello');
      const result = lower.run(state).toArray();
      expect(result).to.deep.equal([]);
    });
  });

  describe('upper', () => {
    it('should consume first letter if uppercase', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'OhMyG');
      const result = upper.run(state).head();
      expect(result._1).to.equal('O');
      expect(result._2._2).to.equal('hMyG');
    });

    it('should fail if passed string with head of lowercase', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'ohokay');
      const result = upper.run(state).toArray();
      expect(result).to.deep.equal([]);
    });
  });

  describe('letter', () => {
    it('should pass if passed upper or lower string', () => {
      const stateL = Tuple(Tuple(Tuple(0, 0), true), 'lower');
      const stateU = Tuple(Tuple(Tuple(0, 0), true), 'UPPER');
      const resultL = letter.run(stateL).head();
      const resultU = letter.run(stateU).head();
      expect(resultL._1).to.equal('l');
      expect(resultL._2._2).to.equal('ower');
      expect(resultU._1).to.equal('U');
      expect(resultU._2._2).to.equal('PPER');
    });

    it('should fail if passed digit', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), '4|3(|)');
      const result = letter.run(state).toArray();
      expect(result).to.deep.equal([]);
    });
  });

  describe('many', () => {
    it('should return List of possible results', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'h!');
      const result = many(letter).run(state).toArray();
      const expected = List.of(Tuple('h', '!')).concat(List.of(Tuple('', 'h!'))).toArray();
      expect(result.map(t => t._2._2)).to.deep.equal(expected.map(t => t._2));
      expect(result.map(t => t._1)).to.deep.equal(expected.map(t => t._1));
    });
  });

  describe('many1', () => {
    it('should return List with one element if only one way to parse', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'H!');
      const result = many1(letter).run(state).toArray();
      const expected = List.of(Tuple('H', '!')).toArray();
      expect(result.map(t => t._2._2)).to.deep.equal(expected.map(t => t._2));
      expect(result.map(t => t._1)).to.deep.equal(expected.map(t => t._1));
    });
  });

  describe('mvPrefix', () => {
    it('should consume "C0" if present at beginning of string', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'C0398');
      const result = mvPrefix.run(state).head();
      expect(result._1).to.equal('MV');
      expect(result._2._2).to.equal('398');
    });

    it('should fail if "mv" is not present at beginning of string', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'hello');
      const result = mvPrefix.run(state).toArray();
      expect(result).to.deep.equal([]);
    });
  });

  describe('leadingDigit', () => {
    it('accepts leading char between "0" and "7"', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '1FA');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), '7FA');
      const result1 = leadingDigit.run(state1).head()._1;
      const result2 = leadingDigit.run(state2).head()._1;
      expect(result1).to.equal('1');
      expect(result2).to.equal('7');
    });

    it('fails if leading char is above "7" or letter', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '8FA');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), 'AFA');
      const result1 = leadingDigit.run(state1).toArray();
      const result2 = leadingDigit.run(state2).toArray();
      expect(result1).to.deep.equal([]);
      expect(result2).to.deep.equal([]);
    });
  });

  describe('seq', () => {
    it('correctly chains parsers', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'abcd');
      const result = seq(char('a'))(char('b')).run(state).head();
      expect(result._1).to.equal('ab');
      expect(result._2._2).to.equal('cd');
    });
  });

  describe('leadingByte', () => {
    it('consumes 2 char', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '1FA');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), '7FA');
      const result1 = leadingByte.run(state1).head()._1.length;
      const result2 = leadingByte.run(state2).head()._1.length;
      expect(result1).to.equal(2);
      expect(result2).to.equal(2);
    });

    it('fails if leading char is above "7"', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '8FA');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), 'AFA');
      const result1 = leadingByte.run(state1).toArray();
      const result2 = leadingByte.run(state2).toArray();
      expect(result1).to.deep.equal([]);
      expect(result2).to.deep.equal([]);
    });
  });

  describe('trailingByte', () => {
    it('consumes 2 char', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '1FA');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), '7FA');
      const result1 = trailingByte.run(state1).head()._1.length;
      const result2 = trailingByte.run(state2).head()._1.length;
      expect(result1).to.equal(2);
      expect(result2).to.equal(2);
    });
  });

  describe('encodedNumber', () => {
    it('consume 4 char', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '1FAAF');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), '6FBAF');
      const result1 = encodedNumber.run(state1).head()._1.length;
      const result2 = encodedNumber.run(state2).head()._1.length;
      expect(result1).to.equal(4);
      expect(result2).to.equal(4);
    });

    it('fails if leading char is above "7"', () => {
      const state1 = Tuple(Tuple(Tuple(0, 0), true), '8FFFA');
      const state2 = Tuple(Tuple(Tuple(0, 0), true), 'AAAFA');
      const result1 = leadingByte.run(state1).toArray();
      const result2 = leadingByte.run(state2).toArray();
      expect(result1).to.deep.equal([]);
      expect(result2).to.deep.equal([]);
    });
  });

  describe('mvCoords', () => {
    it('updates state with new coord', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), '50005500');
      const result = mvCoords.run(state).head()._2._1._1;
      expect(result._1).to.equal(2048);
      expect(result._2).to.equal(2688);
    });

    it('should print with brackets', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), '50005500');
      const result = mvCoords.run(state).head();
      expect(result._1).to.equal(' (2048, 2688);\n');
    });

    it('should prepend "PEN DOWN;\n" if pen crosses in and pen is down', () => {
      const state = Tuple(Tuple(Tuple(8192, 0), true), '0A055500');
      const result = mvCoords.run(state).head();
      expect(result._1.match('PEN DOWN;\n')[0]).to.equal('PEN DOWN;\n');
    });

    it('should print coordinate when it enters', () => {
      const state = Tuple(Tuple(Tuple(8192, 0), true), '0A055500');
      const result = mvCoords.run(state).head();
      const expected = 'MV (8191, 0);\nPEN DOWN;\nMV (1285, 2688);\n';
      expect(result._1).to.equal(expected);
    });
  });

  describe('mvPrefix', () => {
    it('parses "C0"', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'C0');
      const result = mvPrefix.run(state).head();
      expect(result._2._2).to.equal('');
    });

    it('prints "MV"', () => {
      const state = Tuple(Tuple(Tuple(0, 0), true), 'C0');
      const result = mvPrefix.run(state).head();
      expect(result._1).to.equal('MV');
    });
  });

  describe('mvCmd', () => {
    it('prints absolute coord', () => {
      const state = Tuple(Tuple(Tuple(10, 400), true), 'C050005500');
      const result = mvCmd.run(state).head();
      const expected = 'MV (2058, 3088);\n';
      expect(result._1).to.equal(expected);
    });

    it('prints all coords if pen is down', () => {
      const state = Tuple(Tuple(Tuple(10, 400), true), 'C05000550050005500');
      const result = mvCmd.run(state).head();
      const expected = 'MV (2058, 3088) (4106, 5776);\n';
      expect(result._1).to.equal(expected);
    });

    it('prints only last coord if pen is up', () => {
      const state = Tuple(Tuple(Tuple(10, 400), false), 'C05000550050005500');
      const result = mvCmd.run(state).head();
      expect(result._1).to.equal('MV (4106, 5776);\n');
    });

    it('prints intersecting coord and "PEN UP" when it exits box', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), 'C050005500');
      const result = mvCmd.run(state).head();
      const expected = 'MV (8191, 401);\nPEN UP;\n';
      expect(result._1).to.equal(expected);
    });
  });

  describe('clrCmd', () => {
    it('parses "F0"', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), 'F078');
      const result = clrCmd.run(state).head();
      expect(result._1).to.equal('CLR;\n');
    });

    it('resets pos to (0,0)', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), 'F078');
      const result = clrCmd.run(state).head();
      expect(result._2._1._1._1).to.equal(0);
    });
  });

  describe('penPrefix', () => {
    it('parses "80"', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), '8000');
      const result = penPrefix.run(state).head();
      expect(result._1).to.equal('PEN');
    });
  });

  describe('penCmd', () => {
    it('updates state', () => {
      const state1 = Tuple(Tuple(Tuple(8190, 400), true), '804000');
      const state2 = Tuple(Tuple(Tuple(8190, 400), true), '804001');
      const result1 = penCmd.run(state1).head();
      const result2 = penCmd.run(state2).head();
      expect(result1._2._1._2).to.be.false;
      expect(result2._2._1._2).to.be.true;
    });

    it('should print pen up or pen down appropriately', () => {
      const state1 = Tuple(Tuple(Tuple(8190, 400), true), '804000');
      const state2 = Tuple(Tuple(Tuple(8190, 400), true), '804001');
      const result1 = penCmd.run(state1).head();
      const result2 = penCmd.run(state2).head();
      expect(result1._1).to.equal('PEN UP;\n');
      expect(result2._1).to.equal('PEN DOWN;\n');
    });
  });

  describe('colorPrefix', () => {
    it('parses "A0"', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), 'A000');
      const result = colorPrefix.run(state).head();
      expect(result._1).to.equal('CO');
    });
  });

  describe('colorCmd', () => {
    it('parses four color values', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), 'A04000400040004000');
      const result = colorCmd.run(state).head();
      expect(result._1).to.equal('CO 0 0 0 0;\n');
    });
  });

  describe('junkPrefix', () => {
    it('consumes two chars', () => {
      const state = Tuple(Tuple(Tuple(8190, 400), true), '904000400040004000');
      const result = junkPrefix.run(state).head();
    });
  });
});
