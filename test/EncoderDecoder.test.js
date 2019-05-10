const chai = require('chai');

const { expect } = chai;

const {
  decode,
  encode,
} = require('../src/EncoderDecoder');

describe('Encoder', () => {
  describe('encode', () => {
    it('returns "7f7f" when given 8191', () => {
      const result = encode(8191);
      expect(result).to.equal('7f7f')
    });

    it('returns "5000" when given 2048', () => {
      const result = encode(2048);
      expect(result).to.equal('5000');
    });
  });

  describe('Decoder', () => {
    describe('decode', () => {
      it('returns 0 when given "4000"', () => {
        const result = decode('4000');
        expect(result).to.equal(0);
      });

      it('returns -8192 when given "0000"', () => {
        const result = decode('0000');
        expect(result).to.equal(-8192);
      });
    });
  });
});
