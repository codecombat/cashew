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
(function(root, mod) {
	if (typeof exports == "object" && typeof module == "object") return mod(exports);
	if (typeof define == "function" && define.amd) return define(["export"], mod);
	mod(root.cashew || (root.cashew = {}));
})(this, function(exports){

var variablesDictionary;

exports.Cashew = function(javaCode){
	variablesDictionary = [];
	
	//parser helpers
	parser.yy._ = _;

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

	function getRuntimeOps(range){
		var functions = new node("MemberExpression");
		functions.range = range;
		var runtime = createIdentifierNode("___JavaRuntime", range);

		var runtimeMethod =  createIdentifierNode("ops", range);

		functions.object = runtime;
		functions.property = runtimeMethod;
		functions.computed = false;
		return functions;
	}

	getVariableType = function(varName){
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


	// auxiliary functions

	//
	//This method is going to recursively look for all the references using a variable from this block and bellow it
	//TODO: make this more clear
	findUpdateChildren = function(ast, variable) {
	  for (var k in ast) {
	    if (typeof ast[k] == "object" && ast[k] !== null) {
	     	var node = ast[k];
	     	if(node.type !== undefined && node.type === "VariableDeclarator"){
				if(node.id.name == variable.name){
					node.id.name = "__" + variable.id;
				}
			}
			if(node.type === "LogicalExpression" || node.type === "BinaryExpression"){
				if(node.left.name == variable.name){
					node.left.name = "__" + variable.id;
				}
				if(node.right.name == variable.name){
					node.right.name = "__" + variable.id;
				}
			}
			if( node.type === "SwitchStatement"){
				if(node.discriminant.type === "Identifier" && node.discriminant.name == variable.name){
					node.discriminant.name = "__" + variable.id;
				}
			}
			if(node.type === "UnaryExpression" || node.type === "ReturnStatement"){
				if(node.argument.type === "Identifier" && node.argument.name == variable.name){
					node.argument.name = "__" + variable.id;
				}
			}
			if(node.type === "CallExpression"){
				if(node.name == variable.name){
					node.name = "__" + variable.id;	
				}
				_.each(node.arguments, function(argNode){
					if(argNode.type == "Identifier" && argNode.name == variable.name){
						argNode.name = "__" + variable.id;
					}
				});
				if(node.callee.property.name == "validateSet" && node.callee.object.object.name == "___JavaRuntime"){
					if(node.arguments[1].type == "Identifier" && node.arguments[1].name == "__" + variable.id){
						node.arguments[1].type = "Literal";

						node.arguments[1].name = undefined;

						node.arguments[1].value = "__" + variable.id;
					}
				}
			}
			if(node.type !== undefined && node.type == "AssignmentExpression"){

				if (node.left.name == variable.name){
					node.left.name = "__" + variable.id;
				}
				_.each(node.right.arguments, function(argNode){
					if(argNode.type == "Identifier" && argNode.name == variable.name){
						argNode.name = "__" + variable.id;
					}
				});
			}
			
			ast[k] = node;
			ast[k] = findUpdateChildren(ast[k], variable);
	    }
	  }
	  return ast;
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

	var createLiteralNode = parser.yy.createLiteralNode = function createLiteralNode(value, raw, range){
		var literalNode = new node("Literal");
		literalNode.range = range;
		literalNode.value = value;
		literalNode.raw = ""+raw;
		return literalNode;
	}

	var createIdentifierNode = parser.yy.createIdentifierNode = function createIdentifierNode(name, range){
		var identifierNode = new node("Identifier");
		identifierNode.range = range;
		identifierNode.name = name;
		return identifierNode;
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

	parser.yy.createUpdateBlockVariableReference = function createUpdateBlockVariableReference(variableNodes, block){
		_.each(variableNodes, function(variableNode){
			_.each(variableNode.declarations, function(varNode){
				var newVar = new variableEntry(varNode.id.name, "", variableNode.javaType, 
					"", "", "", variableNode.ASTNodeID);
				findUpdateChildren(block, newVar);
				variablesDictionary.push(newVar);
			});
		});
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

	var createVariableAttribution = parser.yy.createVariableAttribution = function createVariableAttribution(varName, varRange, assignmentRange, expressionNode){
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

	parser.yy.createEmptyStatement = function createEmptyStatement(range){
		var emptyStatement = new node("EmptyStatement");
		emptyStatement.range = range;
		return emptyStatement;
	}

	parser.yy.createMathOperation = function createMathOperation(op, left, right, range){
		var operation;
		switch (op){
			case '+':
				operation = "add";
				break;
			case '-':
				operation = "sub";
				break;
			case '*':
				operation = "mul";
				break;
			case '/':
				operation = "div";
				break;
			case '%':
				operation = "mod";
				break;
			default:
				throw SyntaxError('Invalid Operation');
				break;
		}

		var operationNode = new node("CallExpression");
		operationNode.range = range;
		operationNode.arguments = [];
		operationNode.arguments.push(left);
		operationNode.arguments.push(right);
		var callee = new node("MemberExpression");
		callee.range = range;

		var ops = getRuntimeOps(range);

		var opsProperty = createIdentifierNode(operation, range);

		callee.object = ops;
		callee.property = opsProperty;
		callee.computed  = false;

		operationNode.callee = callee;

		return operationNode;
	}

	parser.yy.createExpression = function createExpression(op, type, left, right, range){
		var logicalNode = new node(type);
		logicalNode.range = range;
		logicalNode.operator = op;
		logicalNode.left = left;
		logicalNode.right = right;
		return logicalNode;
	}

	parser.yy.createUnaryExpression = function createExpression(op, expression, range){
		var unaryNode = new node("UnaryExpression");
		unaryNode.range = range;
		unaryNode.operator = op;
		unaryNode.prefix = "true";
		unaryNode.argument = expression;
		return unaryNode;
	}

	parser.yy.createTernaryNode = function createTernaryNode(testExpression, consequentExpression, alternateExpression, expressionRange){
		var ternaryNode = new node("ConditionalExpression");
		ternaryNode.range = expressionRange;
		ternaryNode.test = testExpression;
		ternaryNode.consequent = consequentExpression;
		ternaryNode.alternate = alternateExpression;
		return ternaryNode;
	}

	parser.yy.createIdentifierNode = function createIdentifierNode(name , range){
		var identifierNode = new node("Identifier");
		identifierNode.range = range;
		identifierNode.name = name;
		return identifierNode;
	}

	parser.yy.createVarDeclarationNode = function createVarDeclarationNode(type, declarators, declarationRange){
		var varDeclarationNode = new node("VariableDeclaration");
		varDeclarationNode.range = declarationRange;
		varDeclarationNode.kind = "var";
		varDeclarationNode.javaType = type;
		varDeclarationNode.declarations = [];

		varDeclarationNode.declarations = varDeclarationNode.declarations.concat(declarators);

		return varDeclarationNode;
	}

	parser.yy.createVarDeclaratorNodeNoInit = function createVarDeclarationNodeNoInit(varName, declarationRange){
		var varDeclaratorNode = new node("VariableDeclarator");
		varDeclaratorNode.range = declarationRange;

		var idNode = createIdentifierNode(varName, declarationRange);

		varDeclaratorNode.id = idNode;

		varDeclaratorNode.init = null;

		return varDeclaratorNode;
	}

	parser.yy.createVarDeclaratorNodeWithInit = function createVarDeclarationNodeWithInit(varName, varRange, assignment, assignmentRange, declarationRange){
		var varDeclaratorNode = new node("VariableDeclarator");
		varDeclaratorNode.range = declarationRange;

		var idNode = createIdentifierNode(varName, declarationRange);

		varDeclaratorNode.id = idNode;

		var initNode = new node("CallExpression");
		initNode.range = assignmentRange;
		initNode.arguments = [];
		initNode.arguments.push(assignment);
		initNode.arguments.push(getArgumentForVariable(varName, varRange));
		initNode.arguments.push(getArgumentForNumber(assignment.ASTNodeID, assignmentRange));
		var callee = new node("MemberExpression");
		callee.range = assignmentRange;

		var functions = getRuntimeFunctions(assignmentRange);

		var initProperty = createIdentifierNode("validateSet", assignmentRange);

		callee.object = functions;
		callee.property = initProperty;
		callee.computed  = false;

		initNode.callee = callee;

		varDeclaratorNode.init = initNode;

		return varDeclaratorNode;
	}

	parser.yy.createExpressionStatementNode =  function createExpressionStatementNode(expression, range){
		var expressionStatementNode = new node("ExpressionStatement");
		expressionStatementNode.range = range
		expressionStatementNode.expression = expression;
		return expressionStatementNode;
	}

	parser.yy.createReturnStatementNode =  function createReturnStatementNode(expression, range){
		var returnStatementNode = new node("ReturnStatement");
		returnStatementNode.range = range
		returnStatementNode.argument = expression;
		return returnStatementNode;
	}

	var createSimpleIfNode = parser.yy.createSimpleIfNode = function createSimpleIfNode(testExpression, consequentBlock, consequentRange, ifRange){
		var simpleIf = new node("IfStatement");
		simpleIf.range = ifRange;
		simpleIf.test = testExpression;

		consequentNode = new node("BlockStatement");
		consequentNode.range = consequentRange;
		consequentNode.body = [];
		consequentNode.body = consequentNode.body.concat(consequentBlock);

		simpleIf.consequent = consequentNode;
		simpleIf.alternate = null;

		return simpleIf;
	}

	parser.yy.createSimpleIfElseNode = function createSimpleIfElseNode(testExpression, consequentBlock, consequentRange, alternateBlock, alternateRange, ifRange){
		var ifElseNode = createSimpleIfNode(testExpression, consequentBlock, consequentRange, ifRange);

		alternateNode = new node("BlockStatement");
		alternateNode.range = alternateRange;
		alternateNode.body = [];
		alternateNode.body = alternateNode.body.concat(alternateBlock);

		ifElseNode.alternate = alternateNode;

		return ifElseNode;
	}

	var createSimpleArrayNode = parser.yy.createSimpleArrayNode = function createSimpleArrayInit(varName, varRange, range){
		var simpleArray = new node("VariableDeclarator");
		simpleArray.range = range;

		var idNode = createIdentifierNode(varName, varRange);
		simpleArray.id = idNode;

		var nodeArray = new node("ArrayExpression")
		nodeArray.elements = [];
		simpleArray.init = nodeArray;

		return simpleArray;
	}

	var createArrayWithInitNode = parser.yy.createArrayWithInitNode = function createArrayWithInitNode(varName, varRange, initNode, range){
		var nullArray = createSimpleArrayNode(varName, varRange,range);
		nullArray.init = initNode;
		return nullArray;
	}

	var createArrayWithNullInitialization = parser.yy.createArrayWithNullInitialization = function createArrayWithNullInitialization(nodeExp){
		var nodeArray = new node("ArrayExpression")
			, size = nodeExp.value || 0;
		nodeArray.elements = [];

		// TODO: Validar a expressão que declara o tamanho do array.
		_(parseInt(size)).times(function(){
			var literal = new node("Literal");
			literal.value = null;
			literal.raw = "null";
			nodeArray.elements.push(literal);
		});
		return nodeArray;
	}

	parser.yy.createSwitchNode = function createSwitchNode(discriminant, cases, range){
		var switchNode = new node("SwitchStatement");
		switchNode.range = range;
		switchNode.discriminant = discriminant;
		switchNode.cases = [];
		switchNode.cases = switchNode.cases.concat(cases);
		return switchNode;
	}

	parser.yy.createDefaultSwitchNode = function createDefaultSwitchNode(range){
		return createCaseSwitchNode(null, range);
	}

	parser.yy.addSwitchCaseStatements = function addSwitchCaseStatements(cases, block){
		cases[cases.length -1].consequent = block;
		return cases;
	}

	var createCaseSwitchNode = parser.yy.createCaseSwitchNode = function createCaseSwitchNode(testExpression, range){
		var caseNode = new node("SwitchCase");
		caseNode.range = range;
		caseNode.test = testExpression;
		caseNode.consequent = [];
		return caseNode;
	}

	parser.yy.createSimpleWhileNode = function createSimpleWhileNode(testExpression, whileBlock, blockRange, whileRange){
		var simpleWhile = new node("WhileStatement");
		simpleWhile.range = whileRange;
		simpleWhile.test = testExpression;

		blockNode = new node("BlockStatement");
		blockNode.range = blockRange;
		blockNode.body = [];
		blockNode.body = blockNode.body.concat(whileBlock);

		simpleWhile.body = blockNode;

		return simpleWhile;
	}

	parser.yy.createDoWhileNode = function createDoWhileNode(testExpression, whileBlock, blockRange, whileRange){
		var doWhile = new node("DoWhileStatement");
		doWhile.range = whileRange;
		doWhile.test = testExpression;

		blockNode = new node("BlockStatement");
		blockNode.range = blockRange;
		blockNode.body = [];
		blockNode.body = blockNode.body.concat(whileBlock);

		doWhile.body = blockNode;

		return doWhile;
	}

	parser.yy.createBreakStatement = function createBreakStatement(range){
		var breakNode = new node("BreakStatement");
		breakNode.range = range;

		return breakNode;
	}

	parser.yy.createContinueStatement = function createContinueStatement(range){
		var continueNode = new node("ContinueStatement");
		continueNode.range = range;

		return continueNode;
	}

	parser.yy.createForStatement = function createForStatement(forInit, testExpression, updateExpressions, updateRange, forBlock, blockRange, forRange){
		var forNode = new node("ForStatement");
		forNode.range = forRange;
		forNode.init = forInit;
		forNode.test = testExpression;

		if(updateExpressions.length == 1){
			forNode.update = updateExpressions[0].expression;
		}else if(updateExpressions.length > 1){
			var sequenceNode = new node("SequenceExpression");
			sequenceNode.range = updateRange;
			sequenceNode.expressions = [];
			_.each(updateExpressions, function(updateExp){
				sequenceNode.expressions.push(updateExp.expression);
			});
			forNode.update = sequenceNode;
		}

		blockNode = new node("BlockStatement");
		blockNode.range = blockRange;
		blockNode.body = [];
		blockNode.body = blockNode.body.concat(forBlock);

		forNode.body = blockNode;

		return forNode;
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
	

	ast = parser.parse(javaCode);
	return ast;
}

exports.wrapFunction = function(ast){
	node = function(type){
		this.type = type;
	}
	astBody = ast.body;

	fooFunctNode = new node("FunctionDeclaration")
	fooId = new node("Identifier");
	fooId.name = "foo";
	fooFunctNode.id = fooId;
	fooFunctNode.params = [];

	fooBody = new node("BlockStatement");
	fooBody.body = [];
		functReturn = new node("ReturnStatement");
			functReturnArgument = new node("CallExpression");
				functReturnArgumentCallee = new node("MemberExpression");
				functReturnArgumentCallee.computed = false;
					functReturnArgumentCalleeObject = new node("FunctionExpression");
					functReturnArgumentCalleeObject.params = [];
					functReturnArgumentCalleeObject.defaults = [];
						functReturnArgumentCalleeObjectBody = new node("BlockStatement");
						functReturnArgumentCalleeObjectBody.body = astBody;
					functReturnArgumentCalleeObject.body = functReturnArgumentCalleeObjectBody;
					functReturnArgumentCalleeObject.generator = false;
					functReturnArgumentCalleeObject.expression = false;
				functReturnArgumentCallee.object = functReturnArgumentCalleeObject;
					functReturnArgumentCalleeProperty = new node("Identifier");
					functReturnArgumentCalleeProperty.name = "call";
				functReturnArgumentCallee.property = functReturnArgumentCalleeProperty;
			functReturnArgument.callee = functReturnArgumentCallee;
			functReturnArgument.arguments = [];
				functReturnArgumentArgumentThis = new node("ThisExpression");
			functReturnArgument.arguments.push(functReturnArgumentArgumentThis);

		functReturn.argument = functReturnArgument;

	fooBody.body.push(functReturn);
	fooFunctNode.body = fooBody;

	ast.body = [];
	ast.body.push(fooFunctNode);

	return ast;
}

exports.toNode = function(p){
  var node = new node();
  for(var prop in p){
    node[prop] = p[prop];
  }
  return node;
  function node(){}
}

_Object = (function() {

	var id = 0;

	function generateId() { 
		return id++; 
	};

	_Object.prototype.id = function() {
		var newId = generateId();

		this.id = function() { return newId; };

		return newId;
	};

	function _Object() {
		this.id = generateId();
	};

	_Object.prototype.equals = function(other) {
		return this === other;
	};

	_Object.prototype.toString= function() {
		return this.constructor.name + "@" + this.id;
	};

	return _Object;

})();


exports.___JavaRuntime = { 
	extend : function(child, parent) { 
		hasProp = {}.hasOwnProperty;
		for (var key in parent) { 
			if (hasProp.call(parent, key)) child[key] = parent[key]; 
		} 
		function ctor() { 
			this.constructor = child; 
		} 
		ctor.prototype = parent.prototype; 
		child.prototype = new ctor(); 
		child.__super__ = parent.prototype; 
		
		return child; 
	},

 	_Object : _Object,

	functions : {
		print: function(str){
			console.log(str);
		},
		validateSet: function(value, variable, ASTNodeID){
			if(typeof value === "function")
				value = value();
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


});