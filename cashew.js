/**
 *
 * Cashew is a JAVA parser written in JavaScript.
 *
 * Cashew is written by Lucas Farias and Rafael Monteiro and released under an MIT
 * license. It was written using (Jison)[https://github.com/zaach/jison] by Zaach.
 *
 * Git repository for Cashew are available at
 *
 *     https://github.com/codecombat/cashew.git
 *
 * Please use the [github bug tracker][ghbt] to report issues.
 *
 * [ghbt]: https://github.com/codecombat/cashew/issues
 *
 **/

var Parser = function(javaCode){
	
	//A little trick so we don't need to generate a static parser and can use a runtime generated parser
	var javaGrammar;
	jQuery.ajaxSetup({async:false});
	$.get("coco-java.jison",function(data){ javaGrammar = data});
			 
	var Parser= require("jison").Parser;
	var options = {'type' : 'slr'};
	var parser = new Parser(javaGrammar, options);
	var ast = {
	    rootNode: {
	        type : "Program",
	        range: [],
	        body : []
	    },
	    currentNode: this.rootNode,
	    createRoot: function(node, range) {
	     this.rootNode.range = range;
	     this.rootNode.body = this.rootNode.body.concat(node);
	     return this.rootNode;
	    }

	  };
	parser.yy.ast = ast;

	function node (type){
		this.type = type;
	}
	parser.yy.node = node; 

	function createLiteralNode(value, raw, range){
		var literalNode = new node("Literal");
		literalNode.range = range;
		literalNode.value = value;
		literalNode.raw = raw;
		return literalNode;
	}
	parser.yy.createLiteralNode = createLiteralNode;

	function createExpressionStatementNode(expression, range){
		var expressionStatementNode = new node("ExpressionStatement");
		expressionStatementNode.range = range
		expressionStatementNode.expression = expression;
		return expressionStatementNode;
	}
	parser.yy.createExpressionStatementNode = createExpressionStatementNode;


	parser.yy.JSON = JSON;

	function createConsoleLogExpression(arguments, range){
		var consoleLogNode = new node("CallExpression");
		consoleLogNode.range = range;
		consoleLogNode.arguments = [];
		consoleLogNode.arguments.push(arguments);
		var callee = new node("MemberExpression");
		callee.range = range;

		//TODO extract to a function
		var functions = new node("MemberExpression");
		functions.range = range;
		var runtime = new node("Identifier");
		runtime.range= range;
		runtime.name = "___JavaRuntime";

		var runtimeMethod = new node("Identifier");
		runtimeMethod.range= range;
		runtimeMethod.name = "functions";

		functions.object = runtime;
		functions.property = runtimeMethod;
		functions.computed = false;

		var printProperty = new node("Identifier");
		printProperty.range = range;
		printProperty.name = "print";

		callee.object = functions;
		callee.property = printProperty;
		callee.computed  = false;


		consoleLogNode.callee = callee;

		return consoleLogNode;
	}
	parser.yy.createConsoleLogExpression = createConsoleLogExpression;

	var ast = parser.parse(javaCode);
	return ast;
}



var ___JavaRuntime = { 
	functions : {
		print: function(str){
			console.log(str);
		}
	}
}
