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
- promise (server side only)

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

Identifier names are ignored unless an `__` prefix is added in the assertion.
If an `__` prefix is found, the identifier name will be matched, but the `__` prefix will be dropped.

An extra property of skip can also be provided for advanced filtering.
It takes a list of abstract node types and properties to ignore and auto-match.
See the Mozilla Parser API for more information:
https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

    assertion.skip = [{"type" : "ForInStaTement", "prop": "left"},
                      {"type" : "ForInStatement", "prop": "right"}];
