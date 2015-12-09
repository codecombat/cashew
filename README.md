# Cashew

JavaScript-based Java parser.  Outputs an abstract syntax tree as specified by the
[Mozilla Parser API](https://developer.mozilla.org/en/SpiderMonkey/Parser_API).

## Language Support

Java is the target language.


### Coming Soon!
This is a work in progress please do not rely on this for production usage

## Using Cashew

Cashew ("cashew.js" file) is the Java transpiller. To run it simply serve the html and js files or install it using "npm install cashew-js". 
then call function "Cashew" with the code as parameter.

    var cashew  = require('cashew-js');
    var ast = cashew.Cashew(stringCode);

Cashew provides a runtime "___JavaRuntime" with functions used by the transpilled code to run. The parser will automatically include the call of the "main method" from the first class of the code. 

### How cashew works?
Cashew uses [jison](http://zaach.github.io/jison/)  to transpile Java code into JavaScript. The grammar used by cashew is "coco-java.jison" (read more about jison grammars [here](http://zaach.github.io/jison/docs/#specifying-a-language) ).
You can also find the compiled parser in the coco-java.js file and more details about it. Cashew use a embeded version of [UNDERSCORE](http://underscorejs.org/)  to do some tricks with the ast nodes.


Cashew web uses [ESCODEGEN](https://github.com/estools/escodegen) in the web interface to generate the JavaScript code from the AST produced by the parser.


## Testing


You can test basics [here](https://rawgit.com/codecombat/cashew/master/cashew-worker.html)!

You can also run some unit tests [here](https://cdn.rawgit.com/codecombat/cashew/master/test/Runner.html)!

## Get in touch

Please use the [GitHub issues](https://github.com/codecombat/cashew/issues), or [email Carlos](mailto:carlos@codecombat.com)
