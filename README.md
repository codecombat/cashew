# Cashew

JavaScript-based Java parser.  Outputs an abstract syntax tree as specified by the
[Mozilla Parser API](https://developer.mozilla.org/en/SpiderMonkey/Parser_API).

## Language Support

Java is the target language.


### Coming Soon!
This is a work in progress please do not rely on this for production usage

## Using Cashew

Cashew is right now an embryo  in the "cashew.js" file used by the "cashew-worker.html". To run it simply serve the html and js files. Please notice that the parser right now only takes code from the "main method".

### How cashew works?
Cashew uses [jison](http://zaach.github.io/jison/)  to transpile Java code into JavaScript, right now in order to simplify the changes to the grammar we're generating the parser using the 'jison.js' at runtime for the web test (in the cashew.pre.js file), to use cashew prefer using cashew.js with the compiled parser.  The grammar used by cashew is "coco-java.jison" (read more about jison grammars [here](http://zaach.github.io/jison/docs/#specifying-a-language) ).
You can also find the compiled parser in the coco-java.js file and more details about it.


Cashew web uses [ESCODEGEN](https://github.com/estools/escodegen) in the web interface to generate the JavaScript code from the AST produced by the parser.


## Testing


You can test basic syntax [here](https://cdn.rawgit.com/codecombat/cashew/master/cashew-worker.html)!

You can also run some unit tests [here](https://cdn.rawgit.com/codecombat/cashew/master/test/Runner.html)!

## Get in touch

Please use the [GitHub issues](https://github.com/codecombat/cashew/issues), or [email Carlos](mailto:carlos@codecombat.com)
