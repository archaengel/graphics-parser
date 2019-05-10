const chai = require('chai');

const { expect } = chai;

const Tuple = require('../src/Tuple');

const {
  areIntersecting,
  crosses,
  crossProd,
  dotProd,
  inBox,
  isIntersectingBox,
  intersectsBoxAt,
  leftHandTest,
  lineBetween,
  sameSide,
  slopeBetween,
  subVectors,
} = require('../src/Geometry');

describe('Geometry', () => {
  describe('slopeBetween', () => {
    it('returns a number equal to slope between two points', () => {
      const p1 = Tuple(2, 2);
      const p2 = Tuple(3, 6);
      const res = slopeBetween(p1)(p2);
      expect(typeof res).to.equal('number');
      expect(res).to.equal(4);
    });
  });

  describe('lineBetween', () => {
    it('returns a function', () => {
      const p1 = Tuple(3, 7);
      const p2 = Tuple(7, 2);
      const res = lineBetween(p1)(p2);
      expect(typeof res).to.equal('function');
    });

    it('returned function returns Tuple value when supplied with x', () => {
      const p1 = Tuple(3, 7);
      const p2 = Tuple(4, 2);
      const res = lineBetween(p1)(p2)(0);
      expect(Tuple.is(res)).to.be.true;
      expect(res._2).to.be.equal(22);
    });
  });

  describe('sameSide', () => {
    it('returns true if supplied nubmers are on same side of supplied boundary', () => {
      const res1 = sameSide(9)(10)(11);
      const res2 = sameSide(33)(2)(-1);
      expect(res1).to.be.true;
      expect(res2).to.be.true;
    });

    it('returns false if supplied nubmers are not on same side of supplied boundary', () => {
      const res1 = sameSide(9)(1)(11);
      const res2 = sameSide(33)(233)(-1);
      expect(res1).to.be.false;
      expect(res2).to.be.false;
    });
  });

  describe('crossProd', () => {
    it('returns cross product of two vectors', () => {
      const v1 = Tuple(2, 5);
      const v2 = Tuple(3, 4);
      const v3 = Tuple(-4, 8);
      expect(crossProd(v1)(v2)).to.equal(-7);
      expect(crossProd(v3)(v2)).to.equal(-40);
    });
  });

  describe('subVectors', () => {
    it('returns subtraction of vectors', () => {
      const v1 = Tuple(3, 0);
      const v2 = Tuple(2, 7);
      const v3 = Tuple(32, 8);
      expect(subVectors(v1)(v2)._1).to.equal(1);
      expect(subVectors(v1)(v2)._2).to.equal(-7);
      expect(subVectors(v1)(v3)._1).to.equal(-29);
      expect(subVectors(v1)(v3)._2).to.equal(-8);
    });
  });

  describe('dotProd', () => {
    it('returns dot product of vectors', () => {
      const v1 = Tuple(3, 38);
      const v2 = Tuple(12, 3);
      const v3 = Tuple(6, 19);
      expect(dotProd(v1)(v2)).to.equal(150);
      expect(dotProd(v1)(v3)).to.equal(740);
    });
  });

  describe('leftHandTest', () => {
    it('returns true if point is on left hand side of vector', () => {
      const v1 = Tuple(-8192, 8191);
      const v2 = Tuple(-8192, -8192);
      const p1 = Tuple(500, 500);
      expect(leftHandTest(v1)(v2)(p1)).to.be.true;
    });

    it('returns false if point is to the right of vector', () => {
      const v1 = Tuple(8191, -8192);
      const v2 = Tuple(8191, 8191);
      const p1 = Tuple(8500, 500);
      expect(leftHandTest(v1)(v2)(p1)).to.be.false;
    });
  });

  describe('inBox', () => {
    it('returns true if point is in sqaure', () => {
      const p1 = Tuple(500, 490);
      expect(inBox(p1)).to.be.true;
    });

    it('returns false if point is in sqaure', () => {
      const p1 = Tuple(8500, 490);
      expect(inBox(p1)).to.be.false;
    });
  });

  describe('areIntersecting', () => {
    it('returns true if line segments are intersecting', () => {
      const p1 = Tuple(-8200, 500);
      const p2 = Tuple(-1000, 8213);
      const q1 = Tuple(-8192, 8191);
      const q2 = Tuple(-8192, -8192);
      const res = areIntersecting(p1)(p2)(q1)(q2);
      expect(res).to.be.true;
    });

    it('returns false if line segments are not intersecting', () => {
      const p1 = Tuple(-8400, -8000);
      const p2 = Tuple(-8000, -8500);
      const q1 = Tuple(-8192, 8191);
      const q2 = Tuple(-8192, -8192);
      const res = areIntersecting(p1)(p2)(q1)(q2);
      expect(res).to.be.false;
    });
  });

  describe('isIntersectingBox', () => {
    it('returns true if line segment intersects with sides of box', () => {
      const p1 = Tuple(-8200, 500);
      const p2 = Tuple(-1000, 8213);
      const res = isIntersectingBox(p1)(p2);
      expect(res).to.be.true;
    });

    it('returns false if line segment avoids edges', () => {
      const p1 = Tuple(-8400, -8000);
      const p2 = Tuple(-8000, -8500);
      const res = isIntersectingBox(p1)(p2);
      expect(res).to.be.false;
    });
  });

  describe('crosses', () => {
    it('returns true if new position crosses into or out of box', () => {
      const p1 = Tuple(200, 500);
      const p2 = Tuple(300, 8199);
      const p3 = Tuple(8288, 466);
      const p4 = Tuple(0, 4);
      expect(crosses(p1)(p2)).to.be.true;
      expect(crosses(p3)(p4)).to.be.true;
    });

    it('returns false if new position doesn\'t cross into or out of box', () => {
      const p1 = Tuple(200, 8199);
      const p2 = Tuple(300, 8199);
      const p3 = Tuple(0, 466);
      const p4 = Tuple(0, 4);
      expect(crosses(p1)(p2)).to.be.false;
      expect(crosses(p3)(p4)).to.be.false;
    });

    it('returns true if new position clips through box', () => {
      const p1 = Tuple(300, 8199);
      const p2 = Tuple(8288, 466);
      expect(crosses(p1)(p2)).to.be.true;
    });

    it('returns false if new position remains outside of box', () => {
      const p1 = Tuple(-8900, 5000);
      const p2 = Tuple(-8900, 8990);
      expect(crosses(p1)(p2)).to.be.false;
    });
  });

  describe('intersectsBoxAt', () => {
    it('returns point of intersction', () => {
      const p1 = Tuple(8900, 0);
      const p2 = Tuple(8000, 0);
      const p3 = Tuple(0, 9000);
      const p4 = Tuple(0, 8000);
      const result1 = intersectsBoxAt(p1)(p2);
      const result2 = intersectsBoxAt(p3)(p4);
      expect(result1._1).to.equal(8191);
      expect(result2._2).to.equal(8191);
    });
  });
});
