const List = require('./List');
const StateT = require('./StateT');
const Tuple = require('./Tuple');

const {
  compose,
  curry,
  drop,
  take,
} = require('./Util');

const {
  decode,
} = require('./EncoderDecoder');

const {
  crosses,
  inBox,
  intersectsBoxAt,
} = require('./Geometry');

const mts = StateT(List);

const item = mts
  .modify(t => Tuple(t._1, t._2.slice(1)))
  .chain(
    t => (t._2[0] === undefined
      ? mts.empty()
      : mts.of(t._2[0])),
  );

const sat = p => item
  .chain(
    x => (p(x)
      ? mts.of(x)
      : mts.empty()),
  );

const seq = curry((p, q) => p.chain(x => q.chain(y => mts.of(x.concat(y)))));

const char = c => sat(x => c === x);

const lower = sat(x => x >= 'a' && x <= 'z');

const upper = sat(x => x >= 'A' && x <= 'Z');

const digit = sat(x => x >= '0' && x <= '9');

const letter = lower.concat(upper);

const alphanum = letter.concat(digit);

const leadingDigit = sat(x => x >= '0' && x <= '7');

const leadingByte = seq(leadingDigit)(alphanum);

const trailingByte = seq(alphanum)(alphanum);

const encodedNumber = seq(leadingByte)(trailingByte);

const many = function (p) {
  return p.chain(x => many(p).chain(xs => mts.of(x.concat(xs))))
    .concat(mts.of(''));
};

const many1 = function (p) {
  return p.chain(x => many(p).chain(xs => mts.of(x.concat(xs))));
};

const mvPrefix = char('C').chain(x => char('0').chain(y => mts.of('MV')));

const encodedCoords = seq(encodedNumber)(encodedNumber);

const mvCoords = encodedCoords.chain(n => mts.modify((t) => {
  const relX = compose(decode, take(4))(n);
  const relY = compose(decode, drop(4))(n);
  const x = t._1._1._1 + relX;
  const y = t._1._1._2 + relY;
  const pos = Tuple(x, y);

  return Tuple(Tuple(pos, t._1._2), t._2);
}).chain(oldState => mts.get.chain((newState) => {
  const oldPos = oldState._1._1;
  const newPos = newState._1._1;
  const isDown = newState._1._2;
  const next = newState._2[0] ? newState._2[0] : 10;
  const penMsg = inBox(oldPos) ? 'PEN UP' : 'PEN DOWN';
  const isFinal = !(next >= '0' && next <= '7');
  const coordStr = ` (${newPos._1}, ${newPos._2})`;
  const intersection = intersectsBoxAt(oldPos)(newPos);
  const crossStr = `${inBox(newPos) ? 'MV' : ''} (${intersection._1}, ${intersection._2});\n${penMsg};\n`;
  const result = crosses(oldPos)(newPos) && isDown
    ? `${crossStr}${inBox(newPos) ? `MV${coordStr};\n` : ''}`
    : isDown && inBox(newPos) && !isFinal
      ? coordStr
      : isFinal && inBox(newPos)
        ? `${coordStr};\n`
        : '';

  return mts.of(result);
})));

const mvCmd = seq(mvPrefix)(many1(mvCoords));

const clrPrefix = seq(char('F'))(char('0'));

const clrCmd = clrPrefix.chain(x => mts.modify(t => Tuple(Tuple(Tuple(0, 0), t._1._2), t._2)).chain(y => mts.of('CLR;\n')));

const penPrefix = seq(char('8'))(char('0')).chain(x => mts.of('PEN'));

const penCmd = seq(penPrefix)(encodedNumber
  .chain((x) => {
    const up = decode(x) === 0;
    return mts.modify(t => (up
      ? Tuple(Tuple(Tuple(t._1._1._1, t._1._1._2), false), t._2) : Tuple(Tuple(Tuple(t._1._1._1, t._1._1._2), true), t._2)))
      .chain(y => mts.of(up ? ' UP;\n' : ' DOWN;\n'));
  }));

const colorPrefix = seq(char('A'))(char('0')).chain(x => mts.of('CO'));

const unencodedNumber = encodedNumber.chain(x => mts.of(` ${decode(x)}`));

const twoUnencodedNumbers = seq(unencodedNumber)(unencodedNumber);

const fourUnencodedNumbers = seq(twoUnencodedNumbers)(twoUnencodedNumbers);

const colorCmd = seq(colorPrefix)(fourUnencodedNumbers).chain(x => mts.of(`${x};\n`));

const junkLeading = sat(x => !(x >= '0' && x <= '7')
                      && x !== 'C' && x !== 'A'
                      && x !== '8' && x !== 'F');

const junkByte = seq(junkLeading)(alphanum);

const twoAlphanum = seq(alphanum)(alphanum);

const fourAlphanum = seq(twoAlphanum)(twoAlphanum);

const junkPrefix = seq(junkByte)(many1(fourAlphanum)).chain(x => mts.of(''));

const commandParse = many1(clrCmd.concat(penCmd).concat(junkPrefix).concat(mvCmd).concat(colorCmd));

const runWithState = curry(
  (parser, state) => parser
    .run(state)
    .reduce((acc, curr) => (curr._1.length > acc._1.length ? curr : acc), Tuple('', ''))._1,
);

const parse = runWithState(commandParse);

module.exports = {
  char,
  clrCmd,
  colorCmd,
  colorPrefix,
  digit,
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
  parse,
  penCmd,
  penPrefix,
  sat,
  seq,
  trailingByte,
  upper,
};
