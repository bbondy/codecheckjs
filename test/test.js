"use strict";

// Window isn't defined in node.js
if (typeof window === 'undefined') {

global.assert = require("assert");
global.CodeCheck = require('../');
global._ = require("underscore");
}

describe('CodeCheck', function() {
  it('supports basic exact matches for the JS language', function(done) {
    var samples = [
      // Function
      "function fn() {  }",
      "function fn() { ; }",

      // IfStatement
      "if (x) { }",
      "if (x) { ; }",

      // ForStatement
      "for (var x = 0; x < 10; x++) { }",
      "for (var x = 0; x < 10; x++) { ; }",

      // ForInStatement
      "for (var x in y) { }",
      "for (var x in y) { ; }",

      // DoWhileStatement
      "do { } while (x);",
      "do { ; } while (x);",

      // WhileStatement
      "while(x) { }",
      "while(x) { ; }",

      // VariableDeclaration
      "var x = 3;",

      // AssignmentExpression
      "x = 4;",

      // UpdateExpression
      "x++;", "x--;", "++x;", "--x;",

      // BreakStatement
      "while(x) { break; }",

      // ContinueStatement
      "while(x) { continue; }",

      // ReturnStatement
      "function fn(x) { return 3; }",
      
      // Sequential statements
      ";",

      // Sequential statements
      ";;",

      // Sequential statements in a block
      "{ ;; }",

      // Sequential statements in a conditional block
      "if(x) { ;; }",

      // Nested ifs
      "if(x) { if(y) { x++;} }",

      // Deeply nested ifs loops, and sequential statements
      "if(a) { x++; --x; if(b) if(c) while(d) if(e) { ;;;; x++; do (condition) ; while(y) }}",

      // Empty program
      "",

      // Expression
      "x < 3",

      // Switch
      "switch(x) { case 0: break; case 1: break; }",

      // try catch
      "try { x; throw x; } catch(e) { ; }",

      // Function call
      "fn();",

      // Object members
      "obj.fn();",
      "obj.x;",

      // Literals
      "1;",
      "true;",
      "'hello'",
      "\"hello\"",

      // ArrayExpression
      "[1,2,3]",

      //ObjectExpression
      "obj = { prop1: 'val1', prop2: 2 };",

      // Statements inside callbacks
      "obj.c(function(x) { y = 3.0; });"
    ];
    
    var count = 0;
    _.each(samples, function(sample) {
      var checker = new CodeCheck(); 
      checker.addAssertions([{ code: sample}]);
      checker.parseSample(sample, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(checker.assertions[0].hit);
        if (count == samples.length)
          done();
      });
    }, this);
  }); // end it

  it('works with empty block assertions when sample code is not empty', function(done) {
    var assertions = [
      // Function
      "function fn() { }",

      // IfStatement
      "if (x) {  }",

      // ForStatement
      "for (var x = 0; x < 10; x++) { }",

      // ForInStatement
      "for (var x in y) { }",

      // DoWhileStatement
      "do { } while (x);",

      // WhileStatement
      "while(x) { }"
    ];
    var samples = [
      // Function
      "function fn() { [1,2,3]; }",

      // IfStatement
      "if (x) { true; }",

      // ForStatement
      "for (var x = 0; x < 10; x++) { ; }",

      // ForInStatement
      "for (var x in y) { var x = {a: 'hi', b: 2}; }",

      // DoWhileStatement
      "do { x++; y--; if (x) { } } while (x);",

      // WhileStatement
      "while(x) { break; }"
    ];
    var count = 0;
    for (var i = 0; i < assertions.length; i++) {
      var s = assertions[i];
      var sampleCode = samples[i];
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion(s);
      checker.parseSample(sampleCode, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(checker.assertions[0].hit);
        if (count == assertions.length) {
          done();
        }
      });
    }
  }); // end it

  it('assertion lists match at arbitrary levels and ordering, they need not be top level', function(done) {
    var samples = [
      // Function
      "function fn() { x++; }",

      // If
      "if(x) { x++; }",

      // Nested loops
      "while(x) { while(y) x++; }",

      // Not the first statement in a series
      "var x = 3; x++;",

      // Not the first statement in a series inside a block
      "{ var x = 3; x++; }",

      // Not the only statement in a series
      "x++; var x = 3;",

      // Not the only statement in a series inside a block
      "{ x++; var x = 3; }"
    ];
    var count = 0;
    _.each(samples, function(sampleCode) {
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion('x++;');

      checker.parseSample(sampleCode, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(checker.assertions[0].hit);
        if (count == samples.length) {
          done();
        }
      });

    }, this);
  }); // end it

  // The difference here from the above is that the code samples are constant
  // and the assertions are changing
  it('assertions should not match when they are not fully satisfied', function(done) {
    var assertions = [
      // Function
      "function fn() { x++; }",

      // If
      "if(x) { x++; }",

      // Nested loops
      "while(x) { while(y) x++; }",

      // Not the first statement in a series
      "var x = 3; x++;",

      // Not the first statement in a series inside a block
      "{ var x = 3; x++; }",

      // Not the only statement in a series
      "x++; var x = 3;",

      // Not the only statement in a series inside a block
      "{ x++; var x = 3; }"
    ];
    var count = 0;
    _.each(assertions, function(assertion) {
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion(assertion);

      checker.parseSample("x++;", function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(!checker.assertions[0].hit);
        if (count == assertions.length) {
          done();
        }
      });

    }, this);
  }); // end it

  it('more than one assertion should be able to be checked on the same sample code with 1 instance of checker only using addAssertion API', function(done) {
    var assertions = [
      // Has an increment
      "x++;",

      // Has an increment
      "x++;",

      // Has an empty statement
      ";",

      // Has a literal
      "true",

      // Has an object property access
      "a.o;",

      // Has an if with an assignment in it
      "if (x) { x = 3; }"
    ];
    var count = 0;
    var checker = new CodeCheck(); 
    _.each(assertions, function(assertion) {
      // Create code to test against which contains all the statements
      checker.addAssertion(assertion);
    });

    checker.parseSample("if (x) { x = 3; x++;; true; a.o; }", function() {
      count++;
      assert.equal(checker.assertions.length, assertions.length);
      _.each(checker.assertions, function(assertion) {
        assert.ok(assertion.hit);
      });
      done();
    });
  }); // end it

  it('more than one assertion should be able to be checked on the same sample code with 1 instance of checker only using addAssertions API. Extra properties should be carried forward', function(done) {
    var assertions = [
      // Has an increment
      { code: "x++;", shouldMatch: true },

      // Has var x = 3
      { code: "var x = 3;", shouldMatch: true },

      // Has an increment
      { code: "x++;", shouldMatch: true  },

      // Has an empty statement
      { code: ";", shouldMatch: true },

      // Has an if with an assignment in it
      { code: "if (x) { x = 3; }", shouldMatch: true },

      // More than one capture for the same snippet should match
      { code: "if ($x) { $x = 3; }", shouldMatch: true },
      { code: "if ($y) { $y = 3; }", shouldMatch: true },

      // Just because old assertions match doesn't mean new assertions match
      { code: "while(1) {}", shouldMatch: false },
      { code: "if(x) { var x = 3;}", shouldMatch: false }

    ];
    var count = 0;
    var checker = new CodeCheck(); 
    checker.addAssertions(assertions);

    checker.parseSample("var x = 3; if (x) { x = 3; x++;; }", function() {
      count++;
      assert.equal(checker.assertions.length, assertions.length);
      _.each(checker.assertions, function(assertion) {
        assert.ok(assertion.hit && assertion.shouldMatch || 
                  !assertion.hit && !assertion.shouldMatch);
        assert.ok(typeof assertion.shouldMatch !== 'undefined');
      });
      done();
    });
  }); // end it

  it('block statements should match even if not provided on code sample', function(done) {
    var assertions = [
      // IfStatement
      "if (x) { ; }",

      // ForStatement
      "for (var x = 0; x < 10; x++) { ; }",

      // ForInStatement
      "for (var x in y) { ; }",

      // DoWhileStatement
      "do { ; } while (x);",

      // WhileStatement
      "while(x) { ; }",

      // Deeply nested ifs loops, and sequential statements
      "if(a) { if (b) { while(d) { ; } } }"
    ];

    var count = 0;
    _.each(assertions, function(assertion) {
      var checker = new CodeCheck(); 
      checker.addAssertion(assertion);
      checker.parseSample(assertion.replace(/{/g, '').replace(/}/g, ''), function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        _.each(checker.assertions, function(assertion) {
          assert.ok(assertion.hit);
        });
        if (count == assertions.length)
          done();
      });
    });
  }); // end it

  it('block statements should match even if not provided on assertions', function(done) {
    var samples = [
      // IfStatement
      "if (x) { ; }",

      // ForStatement
      "for (var x = 0; x < 10; x++) { ; }",

      // ForInStatement
      "for (var x in y) { ; }",

      // DoWhileStatement
      "do { ; } while (x);",

      // WhileStatement
      "while(x) { ; }",

      // Deeply nested ifs loops, and sequential statements
      "if(a) { if (b) { while(d) { ; } } }"
    ];

    var count = 0;
    _.each(samples, function(sample) {
      var checker = new CodeCheck(); 
      checker.addAssertion(sample.replace(/{/g, '').replace(/}/g, ''));
      checker.parseSample(sample, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        _.each(checker.assertions, function(assertion) {
          assert.ok(assertion.hit);
        });
        if (count == samples.length)
          done();
      });
    });
  }); // end it

  it('Assertions are allowed to match with blocks in between', function(done) {
    var assertions = [
      // break; statement in a while statement
      "while (x) { break; }",

      // nested ifs with an assignment inside
      "if (x) { if (y) { x = 1; }  }",

      // statement within block
      "{ x = 3; }",

      // if statement with 2 statements in it
      "if (x) { x = 3; obj.fn(); }"
    ];

    var samples = [
      // break; statement in a while statement with if in between
      "while (x) { if (y) { break; } };",

      // nested ifs but with loops around it
      "while(1) { if (x) { for (x in z) { if (y) { x = 1; } }  } }",

      // statement within block but has a different type of statement before it
      "{ var k = 3; x = 3; fn(); }",

      // if statement with more than 2 statements in it
      "if (x) { var x = 3; ; ; x = 3; obj.fn(); var x; fn(); }"
    ];

    var count = 0;
    for (var i = 0; i < assertions.length; i++) {
      var s = assertions[i];
      var sampleCode = samples[i];
      var checker = new CodeCheck(); 
      checker.addAssertion(s, '');
      checker.parseSample(sampleCode, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        _.each(checker.assertions, function(assertion) {
          assert.ok(assertion.hit);
        });
        if (count == samples.length)
          done();
      });
    }
  }); // end it


  it('Skip overrides should be honored', function(done) {
    var assertions = [
      {
        code: "for (x in y) { ; }",
        skip: [{"type" : "ForInStatement", "prop": "left"}, {"type" : "ForInStatement", "prop": "right"}]
      },
      {
        code: "if (x) if (y) x = 3;",
        skip: [{"type" : "IfStatement", "prop": "test"}]
      }
    ];


    var samples = [
      // var in the left
      {
        code: "for (var x in y) { ; }",
        assertion: 0,
        shouldMatch: true
      },
      // should skip the right thing (not body)
      {
        code: "for (var x in y) { x++; }",
        assertion: 0,
        shouldMatch: false
      },
      // array literal in the right
      {
        "code": "for (var x in [1,2,3]) { ; }",
        assertion: 0,
        shouldMatch: true
      },
      // null and a number instead of x, and y
      {
        "code": "if (null) if (3) x = 3;",
        assertion: 1,
        shouldMatch: true
      // true and y < 3 instead of x and y
      },
      {
        "code": "if (true) if (y < 3) x = 3;",
        assertion: 1,
        shouldMatch: true
      },
      // Should match the right thing
      {
        "code": "if (true) if (y < 3) x++;",
        assertion: 1,
        shouldMatch: false 
      }
    ];

    var count = 0;

    _.each(samples, function(s) {
      var shouldMatch = s.shouldMatch;
      var checker = new CodeCheck(); 
      checker.addAssertions([assertions[s.assertion]]);
      checker.parseSample(s.code, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        _.each(checker.assertions, function(assertion) {
          if (shouldMatch)
            assert.ok(assertion.hit);
          else
            assert.ok(!assertion.hit);
        });
        if (count == samples.length) {
          done();
        }
      });
    }, this);
  }); // end it

  it('Strict identifier name matching works', function(done) {
    var snippets = [
      // Diff names should match
      { code: "function fn() { }", assertion: "function xyz() { }", match: true},
      { code: "var x = 3;", assertion: "var y = 3;", match: true },
      { code: "x = 3;", assertion: "y = 3;", match: true },
      { code: "for(var x = 3; x < 10; x++) ;", assertion: "for(var y = 3; y < 10; y++) ;", match: true },
      { code: "if (x) ;", assertion: "if(y) ;", match: true },
      { code: "fn(x) ;", assertion: "fn2(y) ;", match: true },
      { code: "obj = { prop1: 'val1', prop2: 2 };", assertion: "obj = { prop3: 'val1', prop4: 2 };", match: true },

      { code: "Components.util.import('hi');", assertion: "__Components.__util.__import('hi')", match: true },

      // Strict names should match
      { code: "function fn() { }", assertion: "function __fn() { }", match: true},
      { code: "var x = 3;", assertion: "var __x = 3;", match: true },
      { code: "x = 3;", assertion: "__x = 3;", match: true },
      { code: "for(var x = 3; x < 10; x++) ;", assertion: "for(var __x = 3; __x < 10; __x++) ;", match: true },
      { code: "if (x) ;", assertion: "if(__x) ;", match: true },
      { code: "fn(x) ;", assertion: "__fn(y) ;", match: true },
      { code: "obj = { prop1: 'val1', prop2: 2 };", assertion: "obj = { __prop1: 'val1', __prop2: 2 };", match: true },

      // Strict names that are different should not match
      { code: "function fn1() { }", assertion: "function __fn() { }", match: false},
      { code: "var x1 = 3;", assertion: "var __x = 3;", match: false },
      { code: "x1 = 3;", assertion: "__x = 3;", match: false },
      { code: "for(var x1 = 3; x < 10; x++) ;", assertion: "for(var __x = 3; __x < 10; __x++) ;", match: false },
      { code: "for(var x = 3; x1 < 10; x++) ;", assertion: "for(var __x = 3; __x < 10; __x++) ;", match: false },
      { code: "for(var x = 3; x < 10; x1++) ;", assertion: "for(var __x = 3; __x < 10; __x++) ;", match: false },
      { code: "if (x1) ;", assertion: "if(__x) ;", match: false },
      { code: "__fn(x) ;", assertion: "__fn2(y) ;", match: false },
      { code: "obj = { prop1: 'val1', prop2: 2 };", assertion: "obj = { __prop3: 'val1', prop4: 2 };", match: false },
      { code: "obj = { prop1: 'val1', prop2: 2 };", assertion: "obj = { prop3: 'val1', __prop4: 2 };", match: false }
    ];
    var count = 0;
    _.each(snippets, function(snippet) {
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion(snippet.assertion);
      checker.parseSample(snippet.code, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(snippet.match && checker.assertions[0].hit || 
                  !snippet.match && !checker.assertions[0].hit);
        if (count == snippets.length) {
          done();
        }
      });
    }, this);
  }); // end it

  it('Tracked identifier names', function(done) {
    var snippets = [
      // Match a single variable
      { assertion: "var $a;", code: "var x;", match: true }

      // Create a variable declaration and use it in an if
      ,{ assertion: "var $a; if (y) { $a = 3; }", code: "var x; if(y) { x = 3; }", match: true }
      ,{ assertion: "var $a; if (y) { $a = 3; }", code: "var x; if(y) { z = 3; }", match: false }
      ,{ assertion: "var $a; if (y) { $a = 3; }", code: "var ABC; if(y) { z = 3; }", match: false }

      // You can use a tracked variable more than you need to
      ,{ assertion: "var $a = 3; if (y) { $a = 3; }", code: "var x = 3; if(x) { x = 3; x++; }", match: true }

      // Capture on the right hand side of an expression
      ,{ assertion: "var a = $a; $a = [];", code: "var y = z; z = [];", match: true }

      // Capture on an assignment
      ,{ assertion: "$a = a; $a = [];", code: "y = z; y = [];", match: true }
      ,{ assertion: "$a = a; $a = [];", code: "y = z; z = [];", match: false}

      // Capture on the right hand side of an assignment
      ,{ assertion: "a = $a; $a = [];", code: "y = z; z = [];", match: true }
      ,{ assertion: "a = $a; $a = [];", code: "y = z; y = [];", match: false }

      // Capture within an if test
      ,{ assertion: "var x = 0; if($1) { $1 = 3; }", code: "var x = 0; if(c) c = 3;", match: true }

      // Multi char variable name capture
      ,{ assertion: "var x = 0; if($abcd) { $abcd = 3; }", code: "var x = 0; if(c) c = 3;", match: true }
      ,{ assertion: "var x = 0; if($) { $a = 3; }", code: "var x = 0; if(abcdef) abcdef = 3;", match: true }

      // Capture within a block
      ,{ assertion: "var x = 0; if($abcd) { $abcd = 3; }", code: "var x = 0; if(c) c = 3;", match: true }
      ,{ assertion: "if (x) { $c = 0; } $c = 3;", code: "if(y) hello = 0; hello = 3;", match: true }

      // Use both a capture and a strict name check
      ,{ assertion: "var $a = __document.__window; alert($a)", code: "var hello = document.window; alert(hello);", match: true }
      ,{ assertion: "var $a = __document.__window; alert($a)", code: "var hello = document2.window; alert(hello);", match: false }
      ,{ assertion: "var $a = __document.__window; alert($a)", code: "var hello = document2.window; alert(hello);", match: false }
      ,{ assertion: "var $a = __document.__window; alert($a)", code: "var hello = document.window; alert(hello2);", match: false }

      // Test capturing 2 vars at once, make sure neither overwrite the other and are tracked differently
      ,{ assertion: "var $val1 = 3; var $val2 = 2; $val2 = 3;", code: "var x = 3; var y = 2; y = 3;", match: true }
      ,{ assertion: "var $val1 = 3; var $val2 = 2; $val2 = 3;", code: "var x = 3; var y = 2; x = 3;", match: false }
      ,{ assertion: "var $val1 = 3; var $val2 = 2; $val1 = 3;", code: "var x = 3; var y = 2; x = 3;", match: true }
      ,{ assertion: "var $val1 = 3; var $val2 = 2; $val1 = 3;", code: "var x = 3; var y = 2; y = 3;", match: false }

      // Complext match with lots of captures
      ,{ assertion: "var $promise = OS.File.read('topsecret.txt'); $promise.__then(function($data) { var $textDecoder = new __TextDecoder(); $textDecoder.decode($data) });", code: "Components.utils.import('resource://gre/modules/osfile.jsm'); var p = OS.File.read('topsecret.txt'); p.then(function(dat){ var t = new TextDecoder(); t.decode(dat); });", match: true }
      ,{ assertion: "var $promise = OS.File.read('topsecret.txt'); $promise.__then(function($data) { var $textDecoder = new __TextDecoder(); $textDecoder.decode($data) });", code: "Components.utils.import('resource://gre/modules/osfile.jsm'); var p = OS.File.read('topsecret.txt'); p.then(function(dat){ var t = new TextDecoder(); t.decode(data); });", match: false }

      // A captured var should be enforced for subsequent non nested statements
      , { assertion: "var $p1 = 3; $p1 = 4; $p1 = 5;", code: "var x = 3; x = 4; x = 5;", match: true }
      , { assertion: "var $p1 = 3; $p1 = 4; $p1 = 5;", code: "var x = 3; x = 4; y = 5;", match: false }
    ];
    var count = 0;
    _.each(snippets, function(snippet) {
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion(snippet.assertion);
      checker.parseSample(snippet.code, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(snippet.match && checker.assertions[0].hit || 
                  !snippet.match && !checker.assertions[0].hit);
        if (count == snippets.length) {
          done();
        }
      });
    }, this);
  }); // end it

  it('Context sensitive expression skips', function(done) {
    var snippets = [
      // Match an expression inside an if block
      { assertion: "if($$) { }", code: "if(x && y) { }", match: true }
      // Make sure it still checks other improtant things
      ,{ assertion: "if($$) { x++; }", code: "if(x && y) { }", match: false }

      // Match things in a block, but don't over match!
      ,{ assertion: "$$; var x = 3;", code: "x++; var x1 = 3;", match: true}
      ,{ assertion: "$$; var $x = 3;", code: "if(x) {} var z = 3;z=3;", match: true}
      ,{ assertion: "$$; var x = 3;", code: "x++;", match: false }
      ,{ assertion: "var x = 3; $$;", code: "x++;", match: false }

      // Match complex expression
      ,{ assertion: "if($$) { x = 3; }", code: "if(x) { x = 3;}", match: true }
      ,{ assertion: "if($$) { x = 3; }", code: "if(x && (y < 3)) { x = 3;}", match: true }

      // Match a literal or anything
      ,{ assertion: "var x = $$; ", code: "var x = 3;", match: true }
      ,{ assertion: "var x = $$; ", code: "var x = y;", match: true }
      ,{ assertion: "var x = $$; ", code: "var x = y()", match: true }
      ,{ assertion: "var x = $$;", code: "var x = 3;", match: true }

      ,{ assertion: "var $$;", code: "var x;", match: true }
      ,{ assertion: "var $$;", code: "var x = 3;", match: true }
    ];
    var count = 0;
    _.each(snippets, function(snippet) {
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion(snippet.assertion);
      checker.parseSample(snippet.code, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(snippet.match && checker.assertions[0].hit || 
                  !snippet.match && !checker.assertions[0].hit);
        if (count == snippets.length) {
          done();
        }
      });
    }, this);
  }); // end it

  it('Literals should match exactly unless wildcards are used', function(done) {
    var snippets = [
      // Literals should match exactly
      { assertion: "x = 3;", code: "x = 3;", match: true }
      ,{ assertion: "x = 3;", code: "x = 4;", match: false}
      ,{ assertion: "x = 'abc';", code: "x = 'abc';", match: true }
      ,{ assertion: "x = 'abcd';", code: "x = 'abc';", match: false }
      ,{ assertion: "x = true;", code: "x = true", match: true }
      ,{ assertion: "x = true;", code: "x = false", match: false }

      // String literals should match even if different quotes are used
      ,{ assertion: "x = 'abc';", code: "x = \"abc\";", match: true }

      // Expression shouldn't match literals unless they are wildcards
      ,{ assertion: "if (x) { }", code: "if (3) { }", match: false }
      ,{ assertion: "if ($$) { }", code: "if (3) { }", match: true }
      ,{ assertion: "x = $$;", code: "x = 3;", match: true }
      ,{ assertion: "x = $$;", code: "x = '3';", match: true }

      // Make sure literal matching doesn't interfere with strict identifier matching
      ,{ assertion: "__Components.__utils.__import('resource://gre/modules/osfile.jsm')", code: "Components.utils.import('resource://gre/modules/osfile.jsm')", match: true }
      ,{ assertion: "Components.utils.import('1resource://gre/modules/osfile.jsm')", code: "Components.utils.import('resource://gre/modules/osfile.jsm')", match: false }

      // Make sure literals work with tracked identifiers
      ,{ assertion: "$x = $$; $x = 3;", code: "x1 = '3'; x1 = 3", match: true }
      ,{ assertion: "$x = $$; $x = 3;", code: "x1 = '3'; x = 3", match: false }
    ];
    var count = 0;
    _.each(snippets, function(snippet) {
      // Create code to test against which contains all the statements
      var checker = new CodeCheck(); 
      checker.addAssertion(snippet.assertion);
      checker.parseSample(snippet.code, function() {
        count++;
        assert.equal(checker.assertions.length, 1);
        assert.ok(snippet.match && checker.assertions[0].hit || 
                  !snippet.match && !checker.assertions[0].hit);
        if (count == snippets.length) {
          done();
        }
      });
    }, this);
  }); // end it

}); // end describe
