
var allTests = {
  hashTests: require('./hashTests.js')
}

function runTests() {
  var numSuccess = 0;
  var numFailure = 0;
  console.log('RUNNING TESTS...');
  for (var groupName in allTests) {
    var testGroup = allTests[groupName];
    var success = true;
    console.log('🤖 RUNNING GROUP: ' + groupName);
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
        console.log('✅   ' + testGroup[testCase].description);
        numSuccess += 1;
      } else {
        console.log('🚫   ' + testGroup[testCase].description );
        if (error) {
          console.log('\t↳ ERROR: ' + error);
        }
        numFailure += 1;
        success = false;
      }
    }
    console.log((success?'✅':'🚫') + ' GROUP ' + groupName + ' completed.');
  }
  var numTests = (numSuccess + numFailure);
  console.log((numFailure==0?'✅ ':'🚫 ') + numTests + ' test' + (numTests==1?'':'s') + ' completed with ' + numFailure + ' error' + (numFailure==1?
  '.':'s.'));
}

runTests();
