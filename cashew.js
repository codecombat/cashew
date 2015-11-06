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

	//parser helpers
	parser.yy._ = _;
	parser.yy.JSON = JSON;


	/** AST Variable declaration and validation **/
	var variablesDictionary = [];

	var varEntryId = 0;
	variableEntry = function (varName, varAccess, varType, varScope, varClazz, varMethod, varASTNodeID){
		this.id = varEntryId;
    	this.name = varName;
    	this.access = varAccess;
    	this.type = varType;
    	this.scope = varScope;
    	this.clazz = varClazz;
    	this.method = varMethod;
    	this.ASTNodeID = varASTNodeID;
		this.clazz = varClazz
		varEntryId += 1;
	}


	parser.yy.createUpdateMethodVariableReference = function createUpdateMethodVariableReference(variableNodes, methodProperties, methodID){
		if (variablesDictionary.length > 0) {

		}else{
			_.each(variableNodes, function(variableNode){
				var newVar = new variableEntry(variableNode.declarations[0].id.name, "", variableNode.javaType, 
					"method", "", methodProperties.methodSignature, variableNode.ASTNodeID);
				variablesDictionary.push(newVar);
			});
		}
	} 

	parser.yy.createMethodSignatureObject = function createMethodSignatureObject(methodIdentifier, methodSignature){
		var methodSignatureObject = {
			'methodName' : methodIdentifier,
			'methodSignature' : methodSignature,
			'returnType' : null,
			'modifiers' : null
		}
		return methodSignatureObject;
	}

	parser.yy.createVariableAttribution = function createVariableAttribution(varName, varRange, assignmentRange, expressionNode){
		var assignmentNode = new node("ExpressionStatement");
		assignmentNode.range = assignmentRange;

		var assignmentExpressionNode = new node("AssignmentExpression");
		assignmentExpressionNode.range = assignmentRange;
		assignmentExpressionNode.operator = '=';

		var varIdentifier = new node("Identifier");
		varIdentifier.range = varRange;
		varIdentifier.name = varName;

		assignmentExpressionNode.left = varIdentifier;
		assignmentExpressionNode.right = expressionNode;

		assignmentNode.expression = assignmentExpressionNode;
		return assignmentNode;
	}

	/** AST generation methods and structures **/
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
	     if(node != null){
	     	this.rootNode.body = this.rootNode.body.concat(node);
	     }
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

	parser.yy.createIdentifierNode = function createIdentifierNode(name , range){
		var identifierNode = new node("Identifier");
		identifierNode.range = range;
		identifierNode.name = name;
		return identifierNode;
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

	parser.yy.createConsoleLogExpression = function createConsoleLogExpression(expression, range){
		var consoleLogNode = new node("CallExpression");
		consoleLogNode.range = range;
		consoleLogNode.arguments = [];
		consoleLogNode.arguments.push(expression);
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


