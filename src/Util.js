function curry(fn) {
  const arity = fn.length;

  return function $curry(...args) {
    if (args.length < arity) {
      return $curry.bind(null, ...args);
    }

    return fn.call(null, ...args);
  };
}

const compose = (...fns) => (...args) => fns.reduceRight((res, f) => [f.call(null, ...res)], args)[0];

const unaryMethod = curry((fn, str, x) => (typeof x[str] === 'function' ? x[str]() : fn(x)));

const headUndecorated = xs => xs[0];

const head = unaryMethod(headUndecorated, 'head');

const tailUndecorated = xs => xs.slice(1);

const tail = unaryMethod(tailUndecorated, 'tail');

const concat = xs => ys => xs.concat(ys);

const baseToDecimal = base => numInBase => parseInt(numInBase, base);

const decimalToBase = base => decimal => decimal.toString(base);

const drop = curry((n, xs) => xs.slice(n));

const pad = curry((padDepth, str) => str.padStart(padDepth, '0'));

const take = curry((number, arr) => arr.slice(0, number));

const decimalToBinary = decimalToBase(2);
const decimalToHex = decimalToBase(16);
const binaryToDecimal = baseToDecimal(2);
const hexToDecimal = baseToDecimal(16);
const binaryToHex = compose(decimalToHex, binaryToDecimal);
const hexToBinary = compose(decimalToBinary, hexToDecimal);

module.exports = {
  binaryToHex,
  binaryToDecimal,
  compose,
  concat,
  curry,
  decimalToBinary,
  drop,
  head,
  hexToBinary,
  unaryMethod,
  pad,
  tail,
  take,
};
