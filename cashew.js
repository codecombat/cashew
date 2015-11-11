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

var variablesDictionary;

var Parser = function(javaCode){
	variablesDictionary = [];
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

	function getRuntimeFunctions(range){
		var functions = new node("MemberExpression");
		functions.range = range;
		var runtime = createIdentifierNode("___JavaRuntime", range);

		var runtimeMethod =  createIdentifierNode("functions", range);

		functions.object = runtime;
		functions.property = runtimeMethod;
		functions.computed = false;
		return functions;
	}

	getVariableType = function(varName){
		console.log(variablesDictionary);
		var varType = "unknown";
		_.each(variablesDictionary, function(variableEntry){
			if(variableEntry.name == varName){
				varType = variableEntry.type;
			}
		});
		return varType;
	}

	getArgumentForName = function(name, range){
		return createLiteralNode(name, "\""+name + "\"", range);
	}

	getArgumentForVariable = function(name, range){
		return createIdentifierNode(name, range);
	}

	getArgumentForNumber = function(number, range){
		return createLiteralNode(number, number, range);

	}

	/** AST Variable declaration and validation **/

	var varEntryId = 0;
	variableEntry = function(varName, varAccess, varType, varScope, varClazz, varMethod, varASTNodeID){
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

	//
	//This method is going to look for all the references using a variable from this block and bellow it
	//TODO: make this more clear
	findUpdateChildren = function(block, variable){
		if (block.body == undefined){
			return;
		}else if(_.isArray(block.body)){
			_.each(block.body, function(node){
				if(node.type == "VariableDeclaration"){
					if(node.declarations[0].id.name == variable.name){
						node.declarations[0].id.name = "__" + variable.id;
					}
				}else if(node.type == "ExpressionStatement" ){
					if(node.expression.type == "AssignmentExpression"){
						if (node.expression.left.name == variable.name){
							node.expression.left.name = "__" + variable.id;
						}
						_.each(node.expression.right.arguments, function(argNode){
							if(argNode.type == "Identifier" && argNode.name == variable.name){
								argNode.name = "__" + variable.id;
							}
						});
						// Convert variable to variable name in order to identify the variable
						if(node.expression.right.arguments[1].type == "Identifier" && node.expression.right.arguments[1].name == "__" + variable.id){
							node.expression.right.arguments[1].type = "Literal";

							node.expression.right.arguments[1].name = undefined;

							node.expression.right.arguments[1].value = "__" + variable.id;
							node.expression.right.arguments[1].raw = "\"" + node.expression.right.arguments[1].value + "\"";
						}
					}else if (node.expression.type == "CallExpression"){
						_.each(node.expression.arguments, function(argNode){
							if(argNode.type == "Identifier" && argNode.name == variable.name){
								argNode.name = "__" + variable.id;
							}
						});
					}
				}
			});
		}
	}

	parser.yy.createUpdateMethodVariableReference = function createUpdateMethodVariableReference(variableNodes, methodProperties, block){
		if (variablesDictionary.length > 0) {

		}else{
			_.each(variableNodes, function(variableNode){
				var newVar = new variableEntry(variableNode.declarations[0].id.name, "", variableNode.javaType, 
					"method", "", methodProperties.methodSignature, variableNode.ASTNodeID);
				findUpdateChildren(block, newVar);
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

		var varIdentifier = createIdentifierNode(varName, varRange); 

		assignmentExpressionNode.left = varIdentifier;

		var setNode = new node("CallExpression");
		setNode.range = assignmentRange;
		setNode.arguments = [];
		setNode.arguments.push(expressionNode);
		setNode.arguments.push(getArgumentForVariable(varName, varRange));
		setNode.arguments.push(getArgumentForNumber(assignmentNode.ASTNodeID, assignmentRange));
		var callee = new node("MemberExpression");
		callee.range = assignmentRange;

		var functions = getRuntimeFunctions(assignmentRange);

		var setProperty = createIdentifierNode("validateSet", assignmentRange);

		callee.object = functions;
		callee.property = setProperty;
		callee.computed  = false;


		setNode.callee = callee;

		assignmentExpressionNode.right = setNode;

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

	node = function(type){
		ASTNodeID += 1;
		this.type = type;
		this.ASTNodeID = ASTNodeID;
	}

	createLiteralNode = function(value, raw, range){
		var literalNode = new node("Literal");
		literalNode.range = range;
		literalNode.value = value;
		literalNode.raw = raw;
		return literalNode;
	}

	createIdentifierNode = function(name, range){
		var identifierNode = new node("Identifier");
		identifierNode.range = range;
		identifierNode.name = name;
		return identifierNode;
	}

	parser.yy.createLiteralNode = createLiteralNode;

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

		var functions = getRuntimeFunctions(range);

		var printProperty = createIdentifierNode("print", range);

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
		},
		validateSet: function(value, variable, ASTNodeID){
			//Removes the '__' from the variable name
			var index = parseInt(variable.substring(2));
			var varType = variablesDictionary[index].type;
			
			switch (varType){
				case 'int':
					if (typeof value === 'number'){
						if (value % 1 === 0){
							return value;
						}
					}
					throw new SyntaxError("This is not an int maybe a cast is missing");
				
					break;
				case 'double':
					if (typeof value === 'number'){
							return value;
					}
					throw new SyntaxError("This is not a double maybe a cast is missing");
					break;
				case 'boolean':
					if (typeof value === 'boolean'){
							return value;
					}
					throw new SyntaxError("This is not a boolean maybe a cast is missing");
					break;
				case 'String':
					if (typeof value === 'string'){
							return value;
					}
					throw new SyntaxError("This is not a String maybe a cast is missing");
					break;
				default:
					break;

			}
		}
	},
	ops : {
		add: function(arg1, arg2){
			return arg1 + arg2;
		},
		sub: function(arg1, arg2){
			return arg1 - arg2;
		},
		mul: function(arg1, arg2){
			return arg1 * arg2;
		},
		div: function(arg1, arg2){
			return arg1 / arg2;
		},
		mod: function(arg1, arg2){
			return arg1 % arg2;
		}
	}
}


