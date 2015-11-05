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

	parser.yy._ = _;
	//AST Variable declaration and validation
	var varID = 0;
    function variable(name, access, type, scope, clazz, method, ASTNodeID){
    	varID += 1;
    	this.id = varID;
    	this.name = name;
    	this.access = access;
    	this.type = type;
    	this.scope = scope;
    	this.clazz = clazz;
    	this.method = method;
    	this.ASTNodeID = ASTNodeID;

    }

	var variablesDictionary = [];


	function lookupNodeVariables(bodyNodes){


	} 

	parser.yy.lookupNodeVariables = lookupNodeVariables;

	//AST generation methods and structures
	var ASTNodeID = 0;
	var ast = {
	    rootNode: {
	        type : "Program",
	        ASTNodeID: 0,
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
		ASTNodeID += 1;
		this.type = type;
		this.ASTNodeID = ASTNodeID;
	}
	parser.yy.node = node; 

	parser.yy.createLiteralNode = function createLiteralNode(value, raw, range){
		var literalNode = new node("Literal");
		literalNode.range = range;
		literalNode.value = value;
		literalNode.raw = raw;
		return literalNode;
	}

	parser.yy.createVarDeclarationNodeNoInit = function createVarDeclarationNodeNoInit(varName, declarationRange){
		var varDeclarationNode = new node("VariableDeclaration");
		varDeclarationNode.range = declarationRange;
		varDeclarationNode.kind = "var";
		varDeclarationNode.javaType = null;
		varDeclarationNode.declarations = [];


		var varDeclaratorNode = new node("VariableDeclarator");
		varDeclaratorNode.range = declarationRange;

		var idNode = new node("Identifier");
		idNode.range = declarationRange;
		idNode.name = varName;

		varDeclaratorNode.id = idNode;

		varDeclaratorNode.init = null;

		varDeclarationNode.declarations.push(varDeclaratorNode);

		return varDeclarationNode;
	}

	parser.yy.setVariableTypes = function setVariableTypes(type, nodes){
		_.each(nodes, function(node) {
			node.javaType = type;
		});
		return nodes;
	}

	parser.yy.createExpressionStatementNode =  function createExpressionStatementNode(expression, range){
		var expressionStatementNode = new node("ExpressionStatement");
		expressionStatementNode.range = range
		expressionStatementNode.expression = expression;
		return expressionStatementNode;
	}

	parser.yy.JSON = JSON;

	parser.yy.createConsoleLogExpression = function createConsoleLogExpression(arguments, range){
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


