class InfinityList {
  constructor(generator) {
    this.generator = generator;
    this[Symbol.iterator] = generator;
  }

  concat(b) {
    const gen = this.generator;
    const res = new InfinityList(function* () {
      yield* gen();
      yield* b.generator();
    });

    return res;
  }

  drop(n) {
    const gen = this.generator;
    const res = new InfinityList(function* () {
      const iter = gen();
      for (let i = 0; i < n; i++) iter.next();
      yield* iter;
    });

    return res;
  }

  head() {
    const iter = this.generator();
    return iter.next().value;
  }

  map(f) {
    const gen = this.generator;
    const res = new InfinityList(function* () {
      const iter = gen();
      for (const val of iter) {
        yield f(val);
      }
    });

    return res;
  }

  tail() {
    const gen = this.generator;
    const res = new InfinityList(function* () {
      const iter = gen();
      iter.next();
      yield* iter;
    });

    return res;
  }

  take(n) {
    const res = [];
    const iter = this.generator();
    for (let i = 0; i < n; i = 0 | i + 1) {
      res.push(iter.next().value);
    }

    return new List(res);
  }
}

class List extends InfinityList {
  constructor(_arr) {
    if (!Array.isArray(_arr)) {
      throw Error(`expected array, got ${_arr}`);
    }
    const arr = new Array(_arr.length);
    for (let i = 0, j = _arr.length; i < j; i++) {
      if (Array.isArray(_arr[i])) {
        arr[i] = new List(_arr[i]);
      } else {
        arr[i] = _arr[i];
      }
    }
    super(function* () {
      yield* arr;
    });

    this.value = arr;
    this.length = arr.length;
  }

  chain(f) {
    return List.concat(this.map(f));
  }

  concat(b) {
    return b instanceof List ? new List(this.value.concat(b.value))
      : super.concat(b);
  }

  drop(n) {
    return n === 0 ? this : this.tail().drop(n - 1);
  }

  filter(f) {
    return this.chain(m => (f(m) ? List.pure(m) : List.empty));
  }

  foldl(f, acc) {
    return this.value.length === 0 ? acc
      : this
        .tail()
        .foldl(f, f(acc, this.head()));
  }

  reduce(f, acc) {
    // same as foldl()
    return this.value.length === 0 ? acc
      : this
        .tail()
        .foldl(f, f(acc, this.head()));
  }

  last() {
    return this.value[this.value.length - 1];
  }

  map(f) {
    const res = new Array(this.value.length);
    for (let i = 0, j = res.length; i < j; i++) {
      res[i] = f(this.value[i]);
    }

    return new List(res);
  }

  of(...args) {
    return new List(args);
  }

  tail() {
    return new List(this.value.slice(1));
  }

  toArray() {
    return this.reduce((acc, x) => (x instanceof List ? acc.concat([x.toArray()])
      : acc.concat(x)), []);
  }
}

List.pure = x => new List([x]);
List.concat = xs => (xs.length === 0
  ? List.empty
  : xs.head().concat(List.concat(xs.tail())));
List.empty = new List([]);
List.of = List.prototype.of;

module.exports = List;
