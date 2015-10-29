# Cashew

JavaScript-based Java parser.  Outputs an abstract syntax tree as specified by the
[Mozilla Parser API](https://developer.mozilla.org/en/SpiderMonkey/Parser_API).

## Language Support

Java is the target language.


### Coming Soon!
This is a work in progress please do not rely on this for production usage

## Using Cashew

Cashew is right now an embryo embedded in the "cashew-worker.html" file. To run it simply serve the html and js files. The parser right now only takes code from the "main method".

### How cashew works?
Cashew uses [jison](http://zaach.github.io/jison/)  to transpile Java code into JavaScript, right now in order to simplify the changes to the grammar we're generating the parserusing the 'jison.js' at runtime. The grammar used by cashew is "coco-java.jison" (read more about jison grammars [here](http://zaach.github.io/jison/docs/#specifying-a-language) ).

Right now cashew is completely embedded in the html version but in the near future "cashew.js" will contain the parser and the JavaRuntime for the functions it needs.

Cashew also uses [ESCODEGEN](https://github.com/estools/escodegen) in the web interface to generate the JavaScript code from the AST produced by the parser.


## Testing


You can test basic syntax [here](https://rawgit.com/codecombat/cashew/master/cashew-worker.html)!



## Get in touch

Please use the [GitHub issues](https://github.com/codecombat/cashew/issues), or [email Carlos](mailto:carlos@codecombat.com)
