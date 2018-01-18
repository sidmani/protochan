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
  hashTests: require('./hashTests.js'),
}

function runTests() {
  var verbose = (process.argv.indexOf('-v') > -1);
  var numSuccess = 0;
  var numFailure = 0;
  console.log('RUNNING TESTS...');
  for (var groupName in allTests) {
    var testGroup = allTests[groupName];
    var success = true;
    process.stdout.write('🤖 RUNNING GROUP: ' + groupName + (verbose?'\n':' '));
    for (testCase in testGroup) {
      var testPass = false;
      var error;
      try {
        testPass = testGroup[testCase].fn();
      }
      catch (e) {
        error = e;
        testPass = false;
      }
      if (testPass) {
        if (verbose) {
          process.stdout.write('✅   ' + testGroup[testCase].description + '\n');
        } else {
          process.stdout.write('✅');
        }
        numSuccess += 1;
      } else {
        if (verbose) {
          process.stdout.write('🚫   ' + testGroup[testCase].description + '\n');
          if (error) {
            process.stdout.write('     ↳ ERROR: ' + error +'\n');
          }
        } else {
          process.stdout.write('🚫');
        }
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
}

runTests();
