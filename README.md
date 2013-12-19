codecheck.js
============

codecheck.js allows you to check JavaScript code structure against a set of goals in JavaScript.
In general, it gives you the ability to check a list of whitelist code snippets and blacklist code snippets against
a sample of code.

codecheck.js can be used either client or server side.
Client side supports all modern browser, and also IE8+.


Each whitelist and blacklist item is generalized to an assertion.
Each assertion is itself a mini JavaScript program to match the structure
of the sample code against.

The API is very simple. It has 2 important methods:

1. `addAssertion` which takes in a sample of code to match against. It also
   takes in an extra object which can carry extra state.
2. `parseSample` which parses the sample and performs a match against all
   added assertions.  Its callback passes an error if one occurs.

The API has 2 important members which should be used after a parseSample call:

1. `assertions` holds an array of assertions that were added. Each one has a `hit` property. This property does not take into consideration if the item is marked as a whitelist or blacklist item.
2. `allSatisfied` will hold true if all whitelist items are matched, and all blacklist items are NOT matched.

Example Usage of the API:
-------------------------

    var checker = new CodeChecker();
    checker.addAssertion("x = 3;");
    checker.addAssertion("x++", { blacklist: true, otherProps: "hi" });
    checker.parseSample("if (x) { x = 3; }", function(err) {
      console.log('whitelist hit? ' + checker.assertions[0].hit); // true
      console.log('blacklist hit? ' + checker.assertions[1].hit); // false
      console.log('all satisfied? ' + checker.allSatisfied); // true
    });

Dependencies:
-------------

- acorn.js
- underscore

Demo:
-----

http://codefirefox.com/exercise/intro-exercise

Tests:
------

Client side tests for the exercise module can also be run simply by
loading ../test/clientside.html on the browser you want to test the exercise
framework against.

Server side tests are run by using:

```npm test````


Assertions:
-----------

Each assertion will match as long as it appears somewhere in the sample of
code.  Even an assertion like `while (x) break;`  will match even if there
is an if statement before the break on the sample code.

Strict Identifier names:
------------------------

Identifier names are ignored unless an `__` prefix is added in the assertion.
If an `__` prefix is found, the identifier name will be matched, but the `__` prefix will be dropped.

Tracked / Captured Identifier tracking:
---------------------------------------

Strict identifier names are important if you want to make sure a person is typing things like `document.window` but it is not
ideal for tracking a variable throughout a program.

To do that you should use tracked / captured identifiers in your assertion.

The same idea applies as strict identifier names, but instead of using a `__` prefix, you use a `$` prefix.

You can use any number of tracked identifiers in a single assertion.

The following assertion: 

    var $v1 = 3;
    var $v2 = 2;
    $v2 = 3;
    
Would match this code:

    var var1 = 3;
    var var2 = 2;
    var2 = 3;

Capturing can happen on the first encounter of the $ anywhere to the code sample.
Even if it is on the right hand side of an assignment, or within a block.

Advanced Skip usage:
--------------------

An extra property of skip can also be provided for advanced filtering.
It takes a list of abstract node types and properties to ignore and auto-match.
See the Mozilla Parser API for more information:
https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

    assertion.skip = [{"type" : "ForInStaTement", "prop": "left"},
                      {"type" : "ForInStatement", "prop": "right"}];
