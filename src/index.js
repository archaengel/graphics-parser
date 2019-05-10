const Tuple = require('./Tuple');
const {
  parse,
} = require('./ParserCombinators');

const standardInput = process.stdin;

standardInput.setEncoding('utf-8');

console.log('Please input encoded command string.' +
            ' <C-c> or type "exit" to exit');

standardInput.on('data', (data) => {
  if (data === 'exit\n') {
    console.log('exiting...');
    process.exit();
  } else {
    const initState = Tuple(Tuple(Tuple(0, 0), false), data);
    console.log(parse(initState));
  }
});
