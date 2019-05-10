const daggy = require('daggy');
const Tuple = require('./Tuple');

const StateT = function (M) {
  const StateT = daggy.tagged('StateT', ['run']);

  StateT.of = a => StateT(b => M.of(Tuple(a, b)));

  StateT.empty = () => StateT(b => M.empty);

  StateT.modify = fn => StateT(s => M.of(Tuple(s, fn(s))));

  StateT.get = StateT.modify(x => x);

  StateT.put = s => StateT.modify(_ => s);

  StateT.prototype.chain = function (fn) {
    const state = this;
    return StateT((s0) => {
      const result = state.run(s0);
      return result.chain(t => fn(t._1).run(t._2));
    });
  };

  StateT.prototype.concat = function (q) {
    const state = this;
    return StateT(s => state.run(s).concat(q.run(s)));
  };

  return StateT;
};

module.exports = StateT;
