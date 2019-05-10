const {
  binaryToDecimal,
  binaryToHex,
  compose,
  concat,
  curry,
  decimalToBinary,
  drop,
  hexToBinary,
  pad,
  tail,
  take,
} = require('./Util');

const gOffset = 8192;

const encodeWithOffset = curry((offset, raw) => {
  const decimal = raw + offset;

  const hiByte = compose(
    pad(2),
    binaryToHex,
    take(8),
    tail,
    pad(16),
    decimalToBinary,
  )(decimal);

  const loByte = compose(
    pad(2),
    binaryToHex,
    concat('0'),
    drop(9),
    pad(16),
    decimalToBinary,
  )(decimal);

  return hiByte + loByte;
});

const encode = encodeWithOffset(gOffset);

const decodeWithOffset = curry((offset, encoded) => {
  const left = compose(
    pad(9),
    hexToBinary,
    take(2),
  )(encoded);

  const right = compose(
    pad(7),
    hexToBinary,
    drop(2),
  )(encoded);

  return binaryToDecimal(left + right) - offset;
});

const decode = decodeWithOffset(gOffset);

module.exports = {
  decode,
  encode,
};
