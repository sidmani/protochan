// This file is a part of the protochan project.
// https://github.com/sidmani/protochan
// https://www.sidmani.com/?postid=3

// Copyright (c) 2018 Sid Mani
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var allTests = {
  miner: require('./minerTests/group.js'),
  hash: require('./hashTests/group.js'),
  header: require('./headerTests/headerTests.js'),
  block: require('./blockTests/group.js'),
  chain: require('./chainTests/group.js'),
  board: require('./boardTests/group.js')
}

function runTests() {
  var verbose = (process.argv.indexOf('-v') > -1);
  var noCatch = (process.argv.indexOf('-n') > -1);

  let debugIdx = process.argv.indexOf('-d');
  var debug = (debugIdx > -1 ? process.argv[debugIdx+1] : undefined);

  if (debugIdx > -1 && !debug) {
    process.stdout.write('Error: -d option must specify name.\n');
    return;
  }

  var numSuccess = 0;
  var numFailure = 0;
  console.log('RUNNING TESTS...');
  for (var groupName in allTests) {
    if (debug && groupName !== debug) {
      continue;
    }
    var testGroup = allTests[groupName];
    var success = true;
    process.stdout.write('🤖 RUNNING GROUP: ' + groupName + ' (' + testGroup.length + (verbose?')\n':') '));
    for (testCase in testGroup) {
      let testPass = true;
      let error = undefined;
      if (testGroup[testCase].dual) {
        try {
          testGroup[testCase].fn(true);
          // ok
        } catch (e) {
          if (noCatch) {
            throw e;
          }
          testPass = false;
        }

        try {
          testGroup[testCase].fn(false);
          testPass = false;
        } catch (e) {
          // ok
        }
      } else {
        try {
          testGroup[testCase].fn();
          testPass = true;
        } catch (e) {
          if (noCatch && !testGroup[testCase].shouldFail) {
            throw e;
          } else {
            error = e;
            testPass = false;
          }
        }

        if (testGroup[testCase].shouldFail) {
          testPass = !testPass;
        }
      }

      printTestOutput(testGroup[testCase], testPass, error, verbose, testGroup[testCase].dual);

      if (testPass) {
        numSuccess += 1;
      } else {
        numFailure += 1;
        success = false;
      }
    }
    if (verbose) {
      process.stdout.write((success?'✅':'🚫') + ' GROUP ' + groupName + ' completed.' + '\n');
    } else {
      process.stdout.write('\n');
    }
  }
  var numTests = (numSuccess + numFailure);
  process.stdout.write((numFailure==0?'✅ ':'🚫 ') + numTests + ' test' + (numTests==1?'':'s') + ' completed with ' + numFailure + ' error' + (numFailure==1?
  '.\n':'s.\n'));

  process.exit(numFailure);
};

function printTestOutput(testCase, pass, error, verbose, dual) {
  if (pass) {
    process.stdout.write('✅');
    if (verbose) {
      if (dual) {
        process.stdout.write(' 🔄 ' + testCase.description + '\n');
      } else {
        process.stdout.write('    ' + testCase.description + '\n');
      }
    }
  } else {
    process.stdout.write('🚫');
    if (verbose) {
      if (dual) {
        process.stdout.write(' 🔄 ' + testCase.description + '\n');
      } else {
        process.stdout.write('    ' + testCase.description + '\n');
      }
      if (error) {
        process.stdout.write('     ↳ ERROR: ' + error +'\n');
      }
    }
  }
}

runTests();
