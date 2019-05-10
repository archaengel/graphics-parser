const Tuple = require('./Tuple');

const {
  curry,
} = require('./Util');

const slopeBetween = curry((p1, p2) => (p2._2 - p1._2) / (p2._1 - p1._1));

const lineBetween = curry((p1, p2, x) => {
  const slope = slopeBetween(p1)(p2);
  const [x1, y1] = [p1._1, p1._2];
  const y = slope * (x - x1) + y1;
  return Tuple(x, y);
});

const sameSide = curry((b, x, y) => x <= b === y <= b);

const subVectors = curry((v1, v2) => Tuple(v1._1 - v2._1, v1._2 - v2._2));

const crossProd = curry((v1, v2) => (v1._1 * v2._2) - (v1._2 * v2._1));

const dotProd = curry((v1, v2) => (v1._1 * v2._1) + (v1._2 * v2._2));

const leftHandTest = curry((v1, v2, p1) => ((v2._1 - v1._1)
                                            * (p1._2 - v1._2)
                                            - (p1._1 - v1._1)
                                            * (v2._2 - v1._2)) > 0);

const inBoxWithBounds = curry((upper, lower, p1) => {
  const rightUpper = Tuple(upper, upper);
  const rightLower = Tuple(upper, lower);
  const leftUpper = Tuple(lower, upper);
  const leftLower = Tuple(lower, lower);

  return leftHandTest(rightUpper)(leftUpper)(p1)
          && leftHandTest(leftUpper)(leftLower)(p1)
          && leftHandTest(leftLower)(rightLower)(p1)
          && leftHandTest(rightLower)(rightUpper)(p1);
});

const inBox = inBoxWithBounds(8191)(-8192);

const intersection = curry((p1, p2, q1, q2) => {
  const r = subVectors(p2)(p1);
  const s = subVectors(q2)(q1);
  const numerator = crossProd(subVectors(q1)(p1))(r);
  const denom = crossProd(r)(s);

  if (numerator === 0 || denom === 0) return false;

  const u = numerator / denom;
  const t = crossProd(subVectors(q1)(p1))(s) / denom;
  if ((t >= 0 && t <= 1) && (u >= 0 && u <= 1)) {
    const intersectionY = Math.round(p1._2 + t * r._2);
    const intersectionX = Math.round(p1._1 + t * r._1);
    const intersectionPoint = Tuple(intersectionX, intersectionY);

    return intersectionPoint;
  }
  return false;
});


const areIntersecting = curry((p1, p2, q1, q2) => Tuple.is(intersection(p1)(p2)(q1)(q2)));

const isIntersectingBoxWithBounds = curry((upper, lower, p1, p2) => {
  const rightUpper = Tuple(upper, upper);
  const rightLower = Tuple(upper, lower);
  const leftUpper = Tuple(lower, upper);
  const leftLower = Tuple(lower, lower);

  const left = areIntersecting(leftUpper)(leftLower)(p1)(p2);
  const bottom = areIntersecting(leftLower)(rightLower)(p1)(p2);
  const right = areIntersecting(rightLower)(rightUpper)(p1)(p2);
  const top = areIntersecting(rightUpper)(leftUpper)(p1)(p2);

  return left || bottom || right || top;
});

const isIntersectingBox = isIntersectingBoxWithBounds(8191)(-8192);

const crossesWithBounds = curry((bTuple, p1, p2) => {
  const before = inBox(p1);
  const after = inBox(p2);

  return !before && !after
    ? isIntersectingBox(p1)(p2)
    : before !== after;
});

const dist = curry((p, q) => Math.sqrt((q._1 - p._1) ** 2 + (q._2 - p._2) ** 2));

const intersectsBoxWithBounds = curry((upper, lower, p1, p2) => {
  const rightUpper = Tuple(upper, upper);
  const rightLower = Tuple(upper, lower);
  const leftUpper = Tuple(lower, upper);
  const leftLower = Tuple(lower, lower);

  const left = intersection(leftUpper)(leftLower)(p1)(p2);
  const bottom = intersection(leftLower)(rightLower)(p1)(p2);
  const right = intersection(rightLower)(rightUpper)(p1)(p2);
  const top = intersection(rightUpper)(leftUpper)(p1)(p2);

  const result = [left, bottom, right, top]
    .filter(Tuple.is)
    .reduce((acc, curr) => (dist(curr)(p1) < acc ? curr : acc), Infinity);

  return result;
});

const intersectsBoxAt = intersectsBoxWithBounds(8191, -8192);

const crosses = crossesWithBounds(Tuple(8191, -8192));

module.exports = {
  areIntersecting,
  crosses,
  crossProd,
  dotProd,
  inBox,
  intersectsBoxAt,
  isIntersectingBox,
  leftHandTest,
  lineBetween,
  sameSide,
  slopeBetween,
  subVectors,
};
