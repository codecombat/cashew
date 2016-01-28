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

var methodsDictionary;
var mainMethodCall;

exports.Cashew = function(javaCode){
	
	___JavaRuntime.variablesDictionary = [];
	methodsDictionary = [];
	constructorBodyNodes = undefined;
	constructorParams = undefined;
	mainMethodCall = undefined;
	
	//parser helpers
	cocoJava.yy._ = _;

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
		_.each(___JavaRuntime.variablesDictionary, function(variableEntry){
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

	getNullArgument = function(){
		return createLiteralNode(null, "null", [0,0]);
	}

	getArgumentForNumber = function(number, range){
		return createLiteralNode(number, number, range);

	}

	/** AST Variable declaration and validation **/

	var varEntryId = 0;
	variableEntry = function(varName, varAccess, varType, varScope, varClass, varMethod, varASTNodeID){
		this.id = varEntryId;
    	this.name = varName;
    	this.access = varAccess;
    	this.type = varType;
    	this.scope = varScope;
    	this.clazz = varClass;
    	this.method = varMethod;
    	this.ASTNodeID = varASTNodeID;
		varEntryId += 1;
	}

	cocoJava.yy.createMethodSignatureObject = function createMethodSignatureObject(methodIdentifier, methodSignature, params, range){
		var methodSignatureObject = {
			'methodName' : methodIdentifier,
			'methodSignature' : methodSignature,
			'range' : range,
			'returnType' : null,
			'modifiers' : null,
			'clazz' : "__TemporaryClassName",
			'params' : params,
		}
		return methodSignatureObject;
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
					node.javaType = variable.type;
					node.id.name = "__" + variable.id;
				}
			}
			if(node.type === "LogicalExpression" || node.type === "BinaryExpression"){
				if(node.left.name == variable.name){
					node.javaType = variable.type;
					node.left.name = "__" + variable.id;
				}
				if(node.right.name == variable.name){
					node.javaType = variable.type;
					node.right.name = "__" + variable.id;
				}
			}
			if( node.type === "SwitchStatement"){
				if(node.discriminant.type === "Identifier" && node.discriminant.name == variable.name){
					node.discriminant.javaType = variable.type;
					node.discriminant.name = "__" + variable.id;
				}
			}
			if(node.type === "UnaryExpression" || node.type === "ReturnStatement"){
				if(node.argument.type === "Identifier" && node.argument.name == variable.name){
					node.argument.javaType = variable.type;
					node.argument.name = "__" + variable.id;
				}
			}
			if(node.type === "CallExpression"){
				if(node.name && node.name == variable.name){
					node.javaType = variable.type;
					node.name = "__" + variable.id;	
				}
				_.each(node.arguments, function(argNode){
					if(argNode.type == "Identifier" && argNode.name == variable.name){
						node.javaType = variable.type;
						argNode.name = "__" + variable.id;
					}
				});
				if(node.callee.property && node.callee.property.name == "validateSet" && node.callee.object.object.name == "___JavaRuntime"){
					if(node.arguments[1].type == "Identifier" && node.arguments[1].name == "__" + variable.id){
						node.arguments[1].type = "Literal";

						node.arguments[1].name = undefined;

						node.arguments[1].value = "__" + variable.id;
						node.arguments[1].javaType = variable.type;
					}
				}
			}
			if(node.type === "Identifier"){
				if(node.name == variable.name){
					node.name = "__" + variable.id;
					node.javaType = variable.type;
				}
			}
			if(node.type === "ReturnStatement"){
				if(node.argument.name && node.argument.name == variable.name){
					node.argument.name = "__" + variable.id;
					node.javaType = variable.type;
				}
			}
			if(node.type !== undefined && node.type == "AssignmentExpression"){
				if (node.left.name && node.left.name == variable.name){
					node.left.name = "__" + variable.id;
					node.left.javaType = variable.type;
				}
				_.each(node.right.arguments, function(argNode){
					if(argNode.type == "Identifier" && argNode.name == variable.name){
						argNode.name = "__" + variable.id;
						argNode.javaType = variable.type;
					}
				});
			}
			
			ast[k] = node;
			ast[k] = findUpdateChildren(ast[k], variable);
	    }
	  }
	  return ast;
	}

	//This method is going to recursively look for all the references using method calls from this block and bellow it
	findUpdateMethodCalls = function(ast, returnType) {
		for (var k in ast) {
			if (typeof ast[k] == "object" && ast[k] !== null) {
	     		var node = ast[k];

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
	     	checkForMainMethod();
	     	if(mainMethodCall){
	     		this.rootNode.body.push(mainMethodCall);
	     	}
	     }

	     //inserting Object at the begining of the code so classes can extend it;
		_Object = {"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"Identifier","name":"_Object"},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"FunctionDeclaration","id":{"type":"Identifier","name":"_Object"},"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"__id"}},"right":{"type":"CallExpression","callee":{"type":"Identifier","name":"generateId"},"arguments":[]}}}]},"generator":false,"expression":false},{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"__id"},"init":{"type":"Literal","value":0,"raw":"0"}}],"kind":"var"},{"type":"FunctionDeclaration","id":{"type":"Identifier","name":"generateId"},"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"UpdateExpression","operator":"++","argument":{"type":"Identifier","name":"__id"},"prefix":false}}]},"generator":false,"expression":false},{"type":"ExpressionStatement","expression":{"type":"BinaryExpression","operator":"==","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"__type"}},"right":{"type":"Literal","value":"Object","raw":"\"Object\""}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"__id"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"newId"},"init":{"type":"CallExpression","callee":{"type":"Identifier","name":"generateId"},"arguments":[]}}],"kind":"var"},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"__id"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"Identifier","name":"newId"}}]},"generator":false,"expression":false}}},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"newId"}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"equals"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"other"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"BinaryExpression","operator":"===","left":{"type":"ThisExpression"},"right":{"type":"Identifier","name":"other"}}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"toString"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"BinaryExpression","operator":"+","left":{"type":"BinaryExpression","operator":"+","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"__type"}},"right":{"type":"Literal","value":"@","raw":"\"@\""}},"right":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"__id"}}}}]},"generator":false,"expression":false}}},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"_Object"}}]},"generator":false,"expression":false},"property":{"type":"Identifier","name":"call"}},"arguments":[{"type":"ThisExpression"}]}}};
		integerAndDouble = [{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"Identifier","name":"Integer"},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"Identifier","name":"Integer"},"right":{"type":"FunctionExpression","id":{"type":"Identifier","name":"Integer"},"params":[{"type":"Identifier","name":"value"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"call"}},"arguments":[{"type":"ThisExpression"}]}},{"type":"IfStatement","test":{"type":"BinaryExpression","operator":"==","left":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"value"},"property":{"type":"Identifier","name":"constructor"}},"right":{"type":"Identifier","name":"Number"}},"consequent":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"value"}},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Math"},"property":{"type":"Identifier","name":"floor"}},"arguments":[{"type":"Identifier","name":"value"}]}}}]},"alternate":{"type":"BlockStatement","body":[{"type":"ThrowStatement","argument":{"type":"NewExpression","callee":{"type":"Identifier","name":"SyntaxError"},"arguments":[{"type":"BinaryExpression","operator":"+","left":{"type":"Literal","value":"Integer expects an int not ","raw":"\"Integer expects an int not \""},"right":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"value"},"property":{"type":"Identifier","name":"constructor"}},"property":{"type":"Identifier","name":"name"}}}]}}]}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Integer"},"property":{"type":"Identifier","name":"prototype"}},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Object"},"property":{"type":"Identifier","name":"create"}},"arguments":[{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}}]}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Integer"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"__type"}},"right":{"type":"Literal","value":"Integer","raw":"'Integer'"}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Integer"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"intValue"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"value"}}}]},"generator":false,"expression":false}}},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"Integer"}}]},"generator":false,"expression":false},"property":{"type":"Identifier","name":"call"}},"arguments":[{"type":"ThisExpression"}]}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"Identifier","name":"Double"},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"Identifier","name":"Double"},"right":{"type":"FunctionExpression","id":{"type":"Identifier","name":"Double"},"params":[{"type":"Identifier","name":"value"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"call"}},"arguments":[{"type":"ThisExpression"}]}},{"type":"IfStatement","test":{"type":"BinaryExpression","operator":"==","left":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"value"},"property":{"type":"Identifier","name":"constructor"}},"right":{"type":"Identifier","name":"Number"}},"consequent":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"value"}},"right":{"type":"Identifier","name":"value"}}}]},"alternate":{"type":"BlockStatement","body":[{"type":"ThrowStatement","argument":{"type":"NewExpression","callee":{"type":"Identifier","name":"SyntaxError"},"arguments":[{"type":"BinaryExpression","operator":"+","left":{"type":"Literal","value":"Double expects an int not ","raw":"\"Double expects an int not \""},"right":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"value"},"property":{"type":"Identifier","name":"constructor"}},"property":{"type":"Identifier","name":"name"}}}]}}]}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Double"},"property":{"type":"Identifier","name":"prototype"}},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Object"},"property":{"type":"Identifier","name":"create"}},"arguments":[{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}}]}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Double"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"__type"}},"right":{"type":"Literal","value":"Double","raw":"'Double'"}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Double"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"doubleValue"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"value"}}}]},"generator":false,"expression":false}}},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"Double"}}]},"generator":false,"expression":false},"property":{"type":"Identifier","name":"call"}},"arguments":[{"type":"ThisExpression"}]}}}];
		stringAndArray = [{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"String"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"compareTo"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"other"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ForStatement","init":{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"i"},"init":{"type":"Literal","value":0,"raw":"0"}}],"kind":"var"},"test":{"type":"BinaryExpression","operator":"<","left":{"type":"Identifier","name":"i"},"right":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"length"}}},"update":{"type":"UpdateExpression","operator":"++","argument":{"type":"Identifier","name":"i"},"prefix":false},"body":{"type":"BlockStatement","body":[{"type":"IfStatement","test":{"type":"BinaryExpression","operator":"!=","left":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":true,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"i"}},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Literal","value":0,"raw":"0"}]},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"other"},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Identifier","name":"i"}]}},"consequent":{"type":"ReturnStatement","argument":{"type":"BinaryExpression","operator":"-","left":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":true,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"i"}},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Literal","value":0,"raw":"0"}]},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"other"},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Identifier","name":"i"}]}}},"alternate":null}]}},{"type":"ReturnStatement","argument":{"type":"BinaryExpression","operator":"-","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"length"}},"right":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"other"},"property":{"type":"Identifier","name":"length"}}}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"String"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"compareToIgnoreCase"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"other"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ForStatement","init":{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"i"},"init":{"type":"Literal","value":0,"raw":"0"}}],"kind":"var"},"test":{"type":"BinaryExpression","operator":"<","left":{"type":"Identifier","name":"i"},"right":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"length"}}},"update":{"type":"UpdateExpression","operator":"++","argument":{"type":"Identifier","name":"i"},"prefix":false},"body":{"type":"BlockStatement","body":[{"type":"IfStatement","test":{"type":"BinaryExpression","operator":"!=","left":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":true,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"i"}},"property":{"type":"Identifier","name":"toLowerCase"}},"arguments":[]},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Literal","value":0,"raw":"0"}]},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"other"},"property":{"type":"Identifier","name":"toLowerCase"}},"arguments":[]},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Identifier","name":"i"}]}},"consequent":{"type":"ReturnStatement","argument":{"type":"BinaryExpression","operator":"-","left":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":true,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"i"}},"property":{"type":"Identifier","name":"toLowerCase"}},"arguments":[]},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Literal","value":0,"raw":"0"}]},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"other"},"property":{"type":"Identifier","name":"toLowerCase"}},"arguments":[]},"property":{"type":"Identifier","name":"charCodeAt"}},"arguments":[{"type":"Identifier","name":"i"}]}}},"alternate":null}]}},{"type":"ReturnStatement","argument":{"type":"BinaryExpression","operator":"-","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"length"}},"right":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"other"},"property":{"type":"Identifier","name":"length"}}}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"String"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"_length"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"length"}}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Array"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"__defineGetter__"}},"arguments":[{"type":"Literal","value":"_length","raw":"\"_length\""},{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"length"}}}]},"generator":false,"expression":false}]}}];

		this.rootNode.body.unshift(stringAndArray[3]);
		this.rootNode.body.unshift(stringAndArray[2]);
		this.rootNode.body.unshift(stringAndArray[1]);
		this.rootNode.body.unshift(stringAndArray[0]);
		this.rootNode.body.unshift(integerAndDouble[0]);
		this.rootNode.body.unshift(integerAndDouble[1]);
		this.rootNode.body.unshift(_Object);
		
	     return this.rootNode;
	    }

	  };
	cocoJava.yy.ast = ast;

	node = function(type){
		ASTNodeID += 1;
		this.type = type;
		this.ASTNodeID = ASTNodeID;
	}

	var checkForMainMethod = function checkForMainMethod(){
		_.each(methodsDictionary, function(methodsEntry){
			if(methodsEntry.methodName == "main"){
				var expressionNode = new node("ExpressionStatement");
			     expressionNode.range = methodsEntry.range;

			     var expressionNodeExpression = new node("CallExpression");
			     expressionNodeExpression.range = methodsEntry.range;

			     var myClassIndentifier = createIdentifierNode(methodsEntry.clazz, methodsEntry.range);
			     var mainIdentifierProperty = createIdentifierNode("main", methodsEntry.range);
			     expressionNodeExpression.callee = createMemberExpressionNode(myClassIndentifier, mainIdentifierProperty, methodsEntry.range);

			     expressionNodeExpression.arguments = [];

			     expressionNode.expression = expressionNodeExpression;
			     mainMethodCall = expressionNode;
			}
		});
	}

	var createLiteralNode = cocoJava.yy.createLiteralNode = function createLiteralNode(value, raw, range){
		var literalNode = new node("Literal");
		literalNode.range = range;
		literalNode.value = value;
		literalNode.raw = ""+raw;
		return literalNode;
	}

	var createIdentifierNode = cocoJava.yy.createIdentifierNode = function createIdentifierNode(name, range){
		var identifierNode = new node("Identifier");
		identifierNode.range = range;
		identifierNode.name = name;
		return identifierNode;
	}

	var createArrayIdentifierNode = cocoJava.yy.createArrayIdentifierNode = function createArrayIdentifierNode(varName, varRange, index1Node, index1Range, index2Node, index2Range, range){
		var identifierNode = createMemberExpressionNode(createIdentifierNode(varName, varRange), index1Node, index1Range, true);
		if(index2Node){
			identifierNode = createMemberExpressionNode(identifierNode, index2Node, index2Range, true);
		}
		return identifierNode;
	}

	var createMemberExpressionNode = function createMemberExpressionNode(objectNode, propertyNode, range, computed){
		var memberExpressionNode = new node("MemberExpression");
		memberExpressionNode.computed = computed || false;
		memberExpressionNode.range = range;
		memberExpressionNode.object = objectNode;
		memberExpressionNode.property = propertyNode;
		return memberExpressionNode;
	}

	//FIXME disabling validations for now
	var createUpdateClassVariableReference = cocoJava.yy.createUpdateClassVariableReference = function createUpdateClassVariableReference(variableNodes, className, block){
		/*_.each(variableNodes, function(variableNode){
			_.each(variableNode.declarations, function(varNode){
				var newVar = new variableEntry(varNode.id.name, "", variableNode.javaType, 
					"class", className, "", variableNode.ASTNodeID);
				findUpdateChildren(block, newVar);
				___JavaRuntime.variablesDictionary.push(newVar);
			});
		});*/
	}

	cocoJava.yy.createUpdateMethodVariableReference = function createUpdateMethodVariableReference(variableNodes, methodProperties, block){
		/*_.each(variableNodes, function(variableNode){
			var newVar = new variableEntry(variableNode.declarations[0].id.name, "", variableNode.javaType, 
				"method", "", methodProperties.methodSignature, variableNode.ASTNodeID);
			findUpdateChildren(block, newVar);
			___JavaRuntime.variablesDictionary.push(newVar);
		});*/
	}

	createUpdateParamVariableReference = function createUpdateParamVariableReference(paramNodes, methodProperties, block){
		/*_.each(paramNodes, function(paramNode){
			var newVar = new variableEntry(paramNode.name, "", paramNode.javaType, 
				"method", "", methodProperties.methodSignature, paramNode.ASTNodeID);
			findUpdateChildren(block, newVar);
			findUpdateChildren(paramNodes, newVar);
			___JavaRuntime.variablesDictionary.push(newVar);
		});*/
	}

	cocoJava.yy.createUpdateBlockVariableReference = function createUpdateBlockVariableReference(variableNodes, block){
		/*_.each(variableNodes, function(variableNode){
			_.each(variableNode.declarations, function(varNode){
				var newVar = new variableEntry(varNode.id.name, "", variableNode.javaType, 
					"", "", "", variableNode.ASTNodeID);
				findUpdateChildren(block, newVar);
				___JavaRuntime.variablesDictionary.push(newVar);
			});
		});*/
	}

	var createMethodDeclarationNode = cocoJava.yy.createMethodDeclarationNode = function createMethodDeclarationNode(methodSignatureObject, headerRange, methodBodyNodes, methodBodyRange, range){
		if(methodSignatureObject.returnType == 'void'){
			_.each(methodBodyNodes , function(bodyNode){
				if(bodyNode.type === "ReturnStatement"){
					raise("Cannot return a value from method whose return type is void", range);
				}
			});
		}
		var isStatic = false;
		_.each(methodSignatureObject.modifiers, function(modifier){
			if (modifier == "static"){
				isStatic = true;
			}
		});

		var isPrivate = true;
		_.each(methodSignatureObject.modifiers, function(modifier){
			if (modifier == "public"){
				isPrivate = false;
			}
		});

		methodsDictionary.push(methodSignatureObject);
		var functionDeclarationNode = new node("ExpressionStatement");
		functionDeclarationNode.range = range;

		var functionDeclarationNodeAssignment = new node("AssignmentExpression");
		functionDeclarationNodeAssignment.range = range;
		functionDeclarationNodeAssignment.operator = '=';

		var functionDeclarationNodeAssignmentLeftObject;
		if(isStatic){
			functionDeclarationNodeAssignmentLeftObject = createIdentifierNode("__TemporaryClassName", [0,0]);
		}else{
			functionDeclarationNodeAssignmentLeftObject = createMemberExpressionNode(createIdentifierNode("__TemporaryClassName", [0,0]), createIdentifierNode("prototype", headerRange), headerRange);
		}

		var functionDeclarationNodeAssignmentLeft;
		if(isPrivate){
			functionDeclarationNodeAssignmentLeft =  createIdentifierNode(methodSignatureObject.methodName, headerRange);
		}else{
			functionDeclarationNodeAssignmentLeft = createMemberExpressionNode(functionDeclarationNodeAssignmentLeftObject, createIdentifierNode(methodSignatureObject.methodName, headerRange), range);
		}
			
		functionDeclarationNodeAssignment.left = functionDeclarationNodeAssignmentLeft;

		var functionDeclarationNodeAssignmentRight = new node("FunctionExpression");
		functionDeclarationNodeAssignmentRight.range = methodBodyRange;
		functionDeclarationNodeAssignmentRight.id = null;
		if(methodSignatureObject.params == null){
			functionDeclarationNodeAssignmentRight.params = [];
		}else{
			var paramNodes = [];
			_.each(methodSignatureObject.params, function(param){
				var newParam = createIdentifierNode(param.paramName, param.range);
				newParam.javaType = param.type;
				paramNodes.push(newParam);
			});
			createUpdateParamVariableReference(paramNodes, methodSignatureObject, methodBodyNodes);
			functionDeclarationNodeAssignmentRight.params = paramNodes;
		}
		functionDeclarationNodeAssignmentRight.defaults = [];
		functionDeclarationNodeAssignmentRightBody = new node("BlockStatement");
		functionDeclarationNodeAssignmentRightBody.range = methodBodyRange;
		functionDeclarationNodeAssignmentRightBody.body = [];
		functionDeclarationNodeAssignmentRightBody.body = functionDeclarationNodeAssignmentRightBody.body.concat(methodBodyNodes);
		functionDeclarationNodeAssignmentRight.body = functionDeclarationNodeAssignmentRightBody;
		functionDeclarationNodeAssignmentRight.generator = false;
		functionDeclarationNodeAssignmentRight.expression = false;

		var functionDeclarationNodeAssignmentMethod = new node("AssignmentExpression");
		functionDeclarationNodeAssignmentMethod.range = range;
		functionDeclarationNodeAssignmentMethod.operator = '='; 
		functionDeclarationNodeAssignmentMethod.left = createIdentifierNode(methodSignatureObject.methodName, headerRange);
		functionDeclarationNodeAssignmentMethod.right = functionDeclarationNodeAssignmentRight

		functionDeclarationNodeAssignment.right = functionDeclarationNodeAssignmentMethod;

		if (isStatic && !isPrivate){
			var functionDeclarationNodeAssignmentStatic = new node("AssignmentExpression");
			functionDeclarationNodeAssignmentStatic.range = range;
			functionDeclarationNodeAssignmentStatic.operator = '=';
			functionDeclarationNodeAssignmentStatic.right = functionDeclarationNodeAssignment.right;
			var leftObject = createMemberExpressionNode(createIdentifierNode("__TemporaryClassName", [0,0]), createIdentifierNode("prototype", headerRange), headerRange);
			var left = createMemberExpressionNode(leftObject, createIdentifierNode(methodSignatureObject.methodName, headerRange), range);
			functionDeclarationNodeAssignmentStatic.left = left;
			functionDeclarationNodeAssignment.right = functionDeclarationNodeAssignmentStatic;
		}

		functionDeclarationNode.expression = functionDeclarationNodeAssignment;
		functionDeclarationNode.details = methodSignatureObject;
		return functionDeclarationNode;
	}

	cocoJava.yy.createSimpleClassDeclarationNode = function createClassDeclarationNode(className, classNameRange, classBody, classBodyRange, range){
		return createClassExtendedDeclarationNode(className, classNameRange, classBody, classBodyRange, null, null, range);
	}
	
	var createClassExtendedDeclarationNode = cocoJava.yy.createClassExtendedDeclarationNode = function createClassExtendedDeclarationNode(className, classNameRange, classBody, classBodyRange, extensionName, extensionRange, range){ 
		var classNode = new node("ExpressionStatement");
		classNode.range = range;

		var classNameId = createIdentifierNode(className, classNameRange);

		var classNodeExpression = new node("AssignmentExpression");
		classNodeExpression.range = range;
		classNodeExpression.operator = '=';
		classNodeExpression.left = classNameId;

		var classNodeExpressionRightCallee = new node("FunctionExpression");
		classNodeExpressionRightCallee.range = range;
		classNodeExpressionRightCallee.id = null;
		classNodeExpressionRightCallee.params = [];
		classNodeExpressionRightCallee.defaults = [];

		var classNodeExpressionRightCalleeBody = new node("BlockStatement");
		classNodeExpressionRightCalleeBody.range = classBodyRange;
		classNodeExpressionRightCalleeBody.body = [];

		//Extract variables from the class
		var variableNodes = [];
		_.each(classBody, function(fieldNode){
			if(fieldNode.type == "ExpressionStatement" && fieldNode.expression.type == "SequenceExpression"){
				if(!fieldNode.expression.isPrivate){
					var constructorExpressions = [];
					var staticExpressions = [];
					_.each(fieldNode.expression.expressions, function(varNode){
						var lastMember = varNode.right.right;
						varNode.right.right = lastMember.left;
						constructorExpressions.push(varNode);
						lastMember.left.object.name = className;
						staticExpressions.push(lastMember);
					});
					//JSON clone
					variableNodes.push(JSON.parse(JSON.stringify(fieldNode)));
					fieldNode.expression.expressions = staticExpressions;
				}
				else if(fieldNode.expression.isPrivate && fieldNode.expression.isStatic){
					var constructorExpressions = [];
					var staticExpressions = [];
					_.each(fieldNode.expression.expressions, function(varNode){
						var lastMember = varNode.right;
						varNode.right = lastMember.left;
						constructorExpressions.push(varNode);
						lastMember.left.object.name = className;
						staticExpressions.push(lastMember);
					});
					//JSON clone
					variableNodes.push(JSON.parse(JSON.stringify(fieldNode)));
					fieldNode.expression.expressions = staticExpressions;
				}else{
					var constructorExpressions = [];
					_.each(fieldNode.expression.expressions, function(varNode){
						var lastMember = varNode;
						varNode = lastMember.left;
						constructorExpressions.push(varNode);
					});
					//JSON clone
					variableNodes.push(JSON.parse(JSON.stringify(fieldNode)));
					fieldNode.expression.expressions = [];
				}
					
			}
		});
		//Insert the constructor
		classNodeExpressionRightCalleeBody.body.push(createConstructorNode(className, constructorBodyNodes, constructorParams, classNameRange, variableNodes, extensionName));
		
		var typeNode = new node("ExpressionStatement");
		typeNode.range = range;
        var memberExpressionVar = createMemberExpressionNode(createMemberExpressionNode(createIdentifierNode(className, classNameRange), createIdentifierNode("prototype", classNameRange), classNameRange), createIdentifierNode("__type", [0,0]), range);
        var declarationNodeAssignment = new node("AssignmentExpression");
				declarationNodeAssignment.range = classNameRange;
				declarationNodeAssignment.operator = '=';
				declarationNodeAssignment.left = memberExpressionVar;
				declarationNodeAssignment.right = getArgumentForName(className, classNameRange);
		typeNode.expression = declarationNodeAssignment;

		//Clone the prototype to extend
		//MyClass.prototype = Object.create(_Object.prototype);
		var extensionClass;
		if(extensionName == null){
			extensionClass = createIdentifierNode("_Object", classNameRange);
		}else{
			extensionClass = createIdentifierNode(extensionName, extensionRange);
		}
		var extensionProto = createMemberExpressionNode(extensionClass, createIdentifierNode("prototype",classNameRange) ,classNameRange);
		var classProto = createMemberExpressionNode(createIdentifierNode(className, classNameRange), createIdentifierNode("prototype",classNameRange), classNameRange);

		var assignmentProto = new node("AssignmentExpression");
		assignmentProto.range = classNameRange;
		assignmentProto.operator = "=";
		assignmentProto.left = classProto;

		var objectCreate = new node("CallExpression");
		objectCreate.range = classNameRange;
		objectCreate.callee = createMemberExpressionNode(createIdentifierNode("Object", [0,0]),createIdentifierNode("create", [0,0]), classNameRange);
		objectCreate.arguments = [];
		objectCreate.arguments.push(extensionProto);

		assignmentProto.right = objectCreate;

		classNodeExpressionRightCalleeBody.body.push(createExpressionStatementNode(assignmentProto, classNameRange));

		//".class" = __type
		classNodeExpressionRightCalleeBody.body.push(typeNode);

		//Add Methods to the class
		classNodeExpressionRightCalleeBody.body = classNodeExpressionRightCalleeBody.body.concat(createMethodOverload(classBody));
		
		//Replaces __TemproaryClass in class body nodes and updates methods dictionary
		replaceTemporaryClassWithClassName(classNodeExpressionRightCalleeBody.body, className);
		_.each(methodsDictionary, function(methodSignature){
			if(methodSignature.clazz == "__TemporaryClassName"){
				methodSignature.clazz = className;
			}
		});

		//Return the class
		classNodeExpressionRightCalleeBody.body.push(createReturnStatementNode(createIdentifierNode(className, classNameRange), classNameRange));

		classNodeExpressionRightCallee.body = classNodeExpressionRightCalleeBody;
		classNodeExpressionRightCallee.generator = false;
		classNodeExpressionRightCallee.expression = false;

		var extensionExpressionXp = new node("CallExpression");
		extensionExpressionXp.range = range;
		extensionExpressionXp.callee = createMemberExpressionNode(classNodeExpressionRightCallee, createIdentifierNode("call", range), range);
		extensionExpressionXp.arguments = [];
		var args = new node("ThisExpression");
		args.range = range;
		extensionExpressionXp.arguments.push(args);


		classNodeExpression.right = extensionExpressionXp;

		classNode.expression = classNodeExpression;


		return classNode;
	}

	createMethodOverload = function createMethodOverload(classBodyNodes){
		var methodsWithOverload = [];
		var nodesWithoutOverload = [];
		var methodsWithOverloadDetails = [];
		var methodWithOverloadFunctionNode = [];
		for (var i = classBodyNodes.length - 1; i >= 0; i--) {
			var methodOverload = false;
			//determine if the node is a method
			if(classBodyNodes[i].details){
				var methodName = classBodyNodes[i].details.methodName;
				//if the current overload is not in the array yet, map it!
				if(methodsWithOverload.indexOf(methodName) == -1){
					for (var j = classBodyNodes.length - 1; j >= 0; j--) {
						//if its not the current Node and if it's not already in the overloaded methods
						if(i != j){
							//determine if the other node is a method
							if(classBodyNodes[j].details){
								//check if there's other methods with the same name
								if(methodName == classBodyNodes[j].details.methodName){
									methodOverload = true;
									methodsWithOverload.push(methodName);
									methodsWithOverloadDetails.push(classBodyNodes[j].details);
									//get function definitions for the nodes overloaded
									if(classBodyNodes[j].expression.right.type == "FunctionExpression"){
										methodWithOverloadFunctionNode.push(classBodyNodes[j].expression.right);
									}else if(classBodyNodes[j].expression.right.right.type == "FunctionExpression"){
										methodWithOverloadFunctionNode.push(classBodyNodes[j].expression.right.right);
									}else{
										methodWithOverloadFunctionNode.push(classBodyNodes[j].expression.right.right.right);
									}

								}
							}
						}
					}
					//if there's already a method with this name in the overload pile
					//the current should also be
					if(methodsWithOverload.indexOf(methodName) >= 0){
						//add the current to the overloaded pile
						methodsWithOverload.push(methodName);
						methodsWithOverloadDetails.push(classBodyNodes[i].details);
						//get function definitions for the nodes overloaded
						if(classBodyNodes[i].expression.right.type == "FunctionExpression"){
							methodWithOverloadFunctionNode.push(classBodyNodes[i].expression.right);
						}else if(classBodyNodes[i].expression.right.right.type == "FunctionExpression"){
							methodWithOverloadFunctionNode.push(classBodyNodes[i].expression.right.right);
						}else{
							methodWithOverloadFunctionNode.push(classBodyNodes[i].expression.right.right.right);
						}	
					}
					if(!methodOverload){
						nodesWithoutOverload.push(classBodyNodes[i]);
					}
				}
			}
		}
		for (var i = 0; i < methodsWithOverload.length; i++) {
			//check for duplicate sigatures in overloaded methods
			currentSignature = methodsWithOverloadDetails[i].methodSignature;
			for (var j = 0; j < methodsWithOverload.length; j++){
				//if the current signature matches any signature raise an exception
				if(i != j){
					if (currentSignature == methodsWithOverloadDetails[j].methodSignature){
						raise("Duplicated method signature " + currentSignature + "!", methodsWithOverloadDetails[j].range);
					}
				}
			}
		};
		for (var i = 0; i < methodsWithOverload.length; i++) {
			//keep the original method name in details
			methodsWithOverloadDetails[i].originalName = methodsWithOverload[i];
			//rename the signatures and build new methods
			methodsWithOverload[i] = methodsWithOverload[i] + i;
			var newExpressionStatement = new node("ExpressionStatement");
			newExpressionStatement.range = methodsWithOverloadDetails[i].range;
			newExpressionStatementAssign = new node("AssignmentExpression");
			newExpressionStatementAssign.range = methodsWithOverloadDetails[i].range;
			newExpressionStatementAssign.operator = "=";
			newExpressionStatementAssign.left = createIdentifierNode(methodsWithOverload[i]);
			newExpressionStatementAssign.right = methodWithOverloadFunctionNode[i];
			newExpressionStatement.expression = newExpressionStatementAssign;
			 methodWithOverloadFunctionNode[i] = newExpressionStatement;
		};
		//create the switcher
		var nodesWithOverload = [];
		var alreadyCreated = [];
		for (var i = 0; i < methodsWithOverload.length; i++) {
			var currentMethod = methodsWithOverloadDetails[i].originalName;
			if(alreadyCreated.indexOf(currentMethod) == -1){
				//only enter here once for each method name
				//creates a clone to preserve original
				methodsWithOverloadDetailsi = JSON.parse(JSON.stringify(methodsWithOverloadDetails[i]));
				alreadyCreated.push(currentMethod);
				range = methodsWithOverloadDetailsi.range; //get method range
				//creates a declaration with an empty body which will be created later
				methodsWithOverloadDetailsi.params = []; //remove all params because we will use arguments variable
				emptyBody = createMethodDeclarationNode(methodsWithOverloadDetailsi, range, [], range, range);
				nodesWithOverload.push(emptyBody);
			}
		};
		//All nodes with overload need a if/else system to determine which method it should call
		for (var i = 0; i < nodesWithOverload.length; i++) {
			var originalNameNode = nodesWithOverload[i].details.originalName;
			//going to look all methods and create the if/else for them;
			var ifCases = [];
			for (var j = 0; j < methodsWithOverload.length; j++) {
				//if the current nodeWithOverload is the same as the methodWithOverload
				//create a case for it
				if(originalNameNode == methodsWithOverloadDetails[j].originalName){
					//if there's no parameters arguments[0] == undefined
					if(methodsWithOverloadDetails[j].params.length == 0){
						ifCases.push(createIfForMatchingSignature([], methodsWithOverload[j]));
					}else{
						//needs to create a condition for each parameter
						var logicalTests = [];
						for (var k = 0; k < methodsWithOverloadDetails[j].params.length; k++) {
							var currentParameter = methodsWithOverloadDetails[j].params[k];
							logicalTest = createLogicalTestForIndexAndType(k,currentParameter.type);
							logicalTests.push(logicalTest);
						};
						ifCases.push(createIfForMatchingSignature(logicalTests, methodsWithOverload[j], methodsWithOverloadDetails[j].params.length));
					}
				}
			};
			//creates the new body for the overloaded body
			var overloadedBody = new node("BlockStatement");
			overloadedBody.range = nodesWithOverload[i].details.range;
			overloadedBody.body = ifCases;
			//check and push the overloaded body to the method body
			if(nodesWithOverload[i].expression.right.type == "FunctionExpression"){
				nodesWithOverload[i].expression.right.body = overloadedBody;
			}else if(nodesWithOverload[i].expression.right.right.type == "FunctionExpression"){
				nodesWithOverload[i].expression.right.right.body = overloadedBody;
			}else{
				nodesWithOverload[i].expression.right.right.right.body = overloadedBody;
			}
		};
		nodesWithoutOverload = nodesWithoutOverload.concat(nodesWithOverload);
		nodesWithoutOverload = nodesWithoutOverload.concat(methodWithOverloadFunctionNode);
		return nodesWithoutOverload;
	}

	var createIfForMatchingSignature = function createIfForMatchingSignature(conditions, functionNewName, paramsLength){
		var testExpression;
		var methodInvokeNodeExpressionArguments = [];
		if(conditions.length == 0){
			//the method has no parameters then arguments[0] == undefined
			testExpression = createExpression("==", "BinaryExpression", createArgumentArgumentsForIndex(0), createIdentifierNode("undefined",[0,0]), range);
		}
		else{
			//nest all conditions to match a signature starting from 1 to nest the first 2
			if(conditions.length == 1){
				testExpression = conditions[0];
			}else{
				for (var i = 1; i < conditions.length; i++) {
					testExpression = createExpression("&&", "LogicalExpression", conditions[i-1], conditions[i], [0,0]);
				};
			}
			//create a new Argument for each original argument
			for (var i = 0; i < paramsLength; i++) {
				methodInvokeNodeExpressionArguments.push(createArgumentArgumentsForIndex(i));
			};
		}

		var methodNode = createIdentifierNode(functionNewName, [0,0]);
		var methodInvokeNodeExpression = new node("CallExpression");
		methodInvokeNodeExpression.range = [0,0];
		methodInvokeNodeExpression.callee = methodNode;
		methodInvokeNodeExpression.arguments = methodInvokeNodeExpressionArguments;
		consequentBlock = createReturnStatementNode(methodInvokeNodeExpression, [0,0]);
		return createSimpleIfNode(testExpression, consequentBlock, [0,0], [0,0]);		
	}

	var createNestedLogicalTest = function createNestedLogicalTest(logicalTest1, logicalTest2){

	}

	var createLogicalTestForIndexAndType = function createLogicalTestForIndexAndType(index, type){
		range = [0,0];
		var left = createExpression("==", "BinaryExpression", createDetermineTypeForIndex(index),  getArgumentForName("?", [0,0]), range);
		var right = createExpression("==", "BinaryExpression", createDetermineTypeForIndex(index),  getArgumentForName(type, [0,0]), range);
		var logicalExpression = createExpression("||", "LogicalExpression", left, right, range);
		return logicalExpression;
	}

	var createDetermineTypeForIndex = function createDetermineTypeForIndex(index){
		var determineTypeNode = new node("CallExpression");
	 	determineTypeNode.range = [0,0];
	 	determineTypeNode.arguments = [];
	 	determineTypeNode.arguments.push(createArgumentArgumentsForIndex(index));
		var callee = new node("MemberExpression");
		callee.range = [0,0];

		var functions = getRuntimeFunctions([0,0]);

		var determineTypeProperty = createIdentifierNode("determineType", [0,0]);

		callee.object = functions;
		callee.property = determineTypeProperty;
		callee.computed  = false;

	 	determineTypeNode.callee = callee;
	 	return determineTypeNode;
	}

	var createArgumentArgumentsForIndex = function createArgumentArgumentsForIndex(index){
		var argumentNode = new node("MemberExpression");
		argumentNode.computed = true;
		argumentNode.object = createIdentifierNode("arguments",[0,0]);
		argumentNode.property = getArgumentForNumber(index, [0,0]);
		return argumentNode;
	}

	cocoJava.yy.createOverrideDefaultConstructor = function createOverrideDefaultConstructor(modifiers, methodBodyNodes){
		constructorBodyNodes = methodBodyNodes;
	}

	cocoJava.yy.createParameterizedConstructor = function createParameterizedConstructor(modifiers, params, methodBodyNodes){
		constructorBodyNodes = methodBodyNodes;
		constructorParams = params;
	}

	cocoJava.yy.createImportNodeForName  = function createImportNodeForName(name){
		//when importing other classes they shoud be here
		if(name == "java.util.ArrayList" || name == "java.util.List" || name == "java.util.*"){
			_ArrayList = {"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"Identifier","name":"_ArrayList"},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"FunctionDeclaration","id":{"type":"Identifier","name":"_ArrayList"},"params":[{"type":"Identifier","name":"type"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_type"}},"right":{"type":"Identifier","name":"type"}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"right":{"type":"ArrayExpression","elements":[]}}}]},"generator":false,"expression":false},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"right":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"Object"},"property":{"type":"Identifier","name":"create"}},"arguments":[{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_Object"},"property":{"type":"Identifier","name":"prototype"}}]}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"__type"}},"right":{"type":"Literal","value":"ArrayList","raw":"'ArrayList'"}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"size"}},"right":{"type":"FunctionExpression","id":null,"params":[],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"ReturnStatement","argument":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"length"}}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"add"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"index"},{"type":"Identifier","name":"object"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"IfStatement","test":{"type":"BinaryExpression","operator":"==","left":{"type":"Identifier","name":"object"},"right":{"type":"Identifier","name":"undefined"}},"consequent":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"push"}},"arguments":[{"type":"Identifier","name":"index"}]}},{"type":"ReturnStatement","argument":{"type":"Literal","value":true,"raw":"true"}}]},"alternate":{"type":"BlockStatement","body":[{"type":"IfStatement","test":{"type":"LogicalExpression","operator":"&&","left":{"type":"BinaryExpression","operator":">","left":{"type":"Identifier","name":"index"},"right":{"type":"Literal","value":0,"raw":"0"}},"right":{"type":"BinaryExpression","operator":"<","left":{"type":"Identifier","name":"index"},"right":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"length"}}}},"consequent":{"type":"BlockStatement","body":[{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"splice"}},"arguments":[{"type":"Identifier","name":"index"},{"type":"Literal","value":0,"raw":"0"},{"type":"Identifier","name":"object"}]}},{"type":"ReturnStatement","argument":{"type":"Literal","value":true,"raw":"true"}}]},"alternate":{"type":"BlockStatement","body":[{"type":"ThrowStatement","argument":{"type":"NewExpression","callee":{"type":"Identifier","name":"SyntaxError"},"arguments":[{"type":"Literal","value":"IndexoutofboundsException","raw":"\"IndexoutofboundsException\""}]}}]}}]}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"get"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"index"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"IfStatement","test":{"type":"LogicalExpression","operator":"||","left":{"type":"BinaryExpression","operator":"<","left":{"type":"Identifier","name":"index"},"right":{"type":"Literal","value":0,"raw":"0"}},"right":{"type":"BinaryExpression","operator":">","left":{"type":"Identifier","name":"index"},"right":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"length"}}}},"consequent":{"type":"BlockStatement","body":[{"type":"ThrowStatement","argument":{"type":"NewExpression","callee":{"type":"Identifier","name":"SyntaxError"},"arguments":[{"type":"Literal","value":"IndexoutofboundsException","raw":"\"IndexoutofboundsException\""}]}}]},"alternate":null},{"type":"ReturnStatement","argument":{"type":"MemberExpression","computed":true,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"index"}}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"set"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"index"},{"type":"Identifier","name":"object"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"old"},"init":null}],"kind":"var"},{"type":"IfStatement","test":{"type":"LogicalExpression","operator":"||","left":{"type":"BinaryExpression","operator":"<","left":{"type":"Identifier","name":"index"},"right":{"type":"Literal","value":0,"raw":"0"}},"right":{"type":"BinaryExpression","operator":">","left":{"type":"Identifier","name":"index"},"right":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"length"}}}},"consequent":{"type":"BlockStatement","body":[{"type":"ThrowStatement","argument":{"type":"NewExpression","callee":{"type":"Identifier","name":"SyntaxError"},"arguments":[{"type":"Literal","value":"IndexoutofboundsException","raw":"\"IndexoutofboundsException\""}]}}]},"alternate":null},{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"old"},"init":{"type":"MemberExpression","computed":true,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"index"}}}],"kind":"var"},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":true,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"index"}},"right":{"type":"Identifier","name":"object"}}},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"old"}}]},"generator":false,"expression":false}}},{"type":"ExpressionStatement","expression":{"type":"AssignmentExpression","operator":"=","left":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"Identifier","name":"_ArrayList"},"property":{"type":"Identifier","name":"prototype"}},"property":{"type":"Identifier","name":"remove"}},"right":{"type":"FunctionExpression","id":null,"params":[{"type":"Identifier","name":"index"}],"defaults":[],"body":{"type":"BlockStatement","body":[{"type":"IfStatement","test":{"type":"LogicalExpression","operator":"||","left":{"type":"BinaryExpression","operator":"<","left":{"type":"Identifier","name":"index"},"right":{"type":"Literal","value":0,"raw":"0"}},"right":{"type":"BinaryExpression","operator":">","left":{"type":"Identifier","name":"index"},"right":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"length"}}}},"consequent":{"type":"BlockStatement","body":[{"type":"ThrowStatement","argument":{"type":"NewExpression","callee":{"type":"Identifier","name":"SyntaxError"},"arguments":[{"type":"Literal","value":"IndexoutofboundsException","raw":"\"IndexoutofboundsException\""}]}}]},"alternate":null},{"type":"ReturnStatement","argument":{"type":"CallExpression","callee":{"type":"MemberExpression","computed":false,"object":{"type":"MemberExpression","computed":false,"object":{"type":"ThisExpression"},"property":{"type":"Identifier","name":"_arraylist"}},"property":{"type":"Identifier","name":"splice"}},"arguments":[{"type":"Identifier","name":"index"},{"type":"Literal","value":1,"raw":"1"}]}}]},"generator":false,"expression":false}}},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"_ArrayList"}}]},"generator":false,"expression":false},"property":{"type":"Identifier","name":"call"}},"arguments":[{"type":"ThisExpression"}]}}};
			return _ArrayList;
		}

	}

	cocoJava.yy.createFieldVariableNode = function createFieldVariableNode(modifiers, variableDeclarationNode, range){
		var isStatic = false;
		_.each(modifiers, function(modifier){
			if (modifier == "static"){
				isStatic = true;
				
			}
		});
		variableDeclarationNode.isStatic = isStatic;
		var isPrivate = undefined;
		_.each(modifiers, function(modifier){
			if (modifier == "public"){
				isPrivate = false;
			}if (modifier == "private"){
				isPrivate = true;
			}
		});
		variableDeclarationNode.isPrivate = isPrivate;

		if (isPrivate == undefined){
			//FIXME change this to a "NotImplementedException"
			raise("Field variables are only implemented as public or private", range);
		}else if(!isStatic && !isPrivate){
			//FIXME change this to a "NotImplementedException"
			raise("Instence variables are only implemented as private", range);
		}


		_.each(variableDeclarationNode.declarations, function(varNode){
			varNode.type = "AssignmentExpression";
			varNode.operator = "=";
			varNode.left = createMemberExpressionNode(createIdentifierNode("__TemporaryClassName", [0,0]), varNode.id, range);
			var prototypeClass;
			if(isStatic && !isPrivate){
				prototypeClass = new node("AssignmentExpression");
				prototypeClass.range = range;
				prototypeClass.operator = "=";
				prototypeClass.left = createMemberExpressionNode(createMemberExpressionNode(createIdentifierNode("__TemporaryClassName", [0,0]), createIdentifierNode("prototype", range), range), varNode.id, range);
				prototypeClassRight =  new node("AssignmentExpression");
				prototypeClassRight.range = range;
				prototypeClassRight.operator = "=";
				prototypeClassRight.left = createMemberExpressionNode(createIdentifierNode("this", [0,0]), varNode.id, range);
				if(varNode.init == null){
					prototypeClassRight.right = createIdentifierNode("undefined",[0,0]);
				}else{
					prototypeClassRight.right = varNode.init;
				}
				prototypeClass.right = prototypeClassRight;
			}else if (isStatic && isPrivate){
				prototypeClass = new node("AssignmentExpression");
				prototypeClass.range = range;
				prototypeClass.operator = "=";
				prototypeClass.left = createMemberExpressionNode(createIdentifierNode("this", [0,0]), varNode.id, range);
				if(varNode.init == null){
					prototypeClass.right = createIdentifierNode("undefined",[0,0]);
				}else{
					prototypeClass.right = varNode.init;
				}
			}else{
				varNode.left.object.name = "this";
				if(varNode.init == null){
					prototypeClass = createMemberExpressionNode(createIdentifierNode("this", [0,0]), varNode.id, range);
				}else{
					prototypeClass = varNode.init;
				}
			}
			
			varNode.right = prototypeClass;
			
			delete varNode.id;
			delete varNode.init;
		});
		variableDeclarationNode.type = "SequenceExpression";
		variableDeclarationNode.expressions = variableDeclarationNode.declarations;
		delete  variableDeclarationNode.declarations;

		return createExpressionStatementNode(variableDeclarationNode, range);
	}

	var replaceTemporaryClassWithClassName = function replaceTemporaryClassWithClassName(ast, className){
		for (var k in ast) {
		    if (typeof ast[k] == "object" && ast[k] !== null) {
				var node = ast[k];
				if(node.type !== undefined && node.type == 'Identifier' && node.name == '__TemporaryClassName'){
					node.name = className;
				}
				if(node.type !== undefined && node.type == 'Identifier' && node.name == 'length'){
					node.name = "_length";
				}
				ast[k] = node;
				ast[k] = replaceTemporaryClassWithClassName(ast[k], className);
			}
		}
		return ast;
	}

	var createConstructorNode = function createConstructorNode(className, methodBodyNodes, methodParams, range, variableNodes, extensionName){
		var constructorNode = new node("FunctionExpression");
		constructorNode.range = range;
		constructorNode.id = createIdentifierNode(className, range);

		if(methodParams == undefined){
			constructorNode.params = [];
		}else{
			var paramNodes = [];
			_.each(methodParams, function(param){
				var newParam = createIdentifierNode(param.paramName, param.range);
				newParam.javaType = param.type;
				paramNodes.push(newParam);
			});
			createUpdateClassVariableReference(paramNodes, className, methodBodyNodes);
			constructorNode.params = paramNodes;
		}
		constructorNode.defaults = [];

		var constructorNodeBody = new node("BlockStatement");
		constructorNodeBody.range = range;
		constructorNodeBody.body = [];

		var constructorCallNode = new node("CallExpression");
		constructorCallNode.range = range;

		var extensionClass;
		//extends
		if(extensionName == null){
			extensionClass = createIdentifierNode("_Object", range);
		}else{
			extensionClass = createIdentifierNode(extensionName, range);
		}
		var extensionExpression = new node("ExpressionStatement");
		extensionExpression.range = range;
		var extensionExpressionXp = new node("CallExpression");
		extensionExpressionXp.range = range;
		extensionExpressionXp.callee = createMemberExpressionNode(extensionClass, createIdentifierNode("call", range), range);
		extensionExpressionXp.arguments = [];
		var args = new node("ThisExpression");
		args.range = range;
		extensionExpressionXp.arguments.push(args);

		extensionExpression.expression = extensionExpressionXp;
		constructorNodeBody.body.push(extensionExpression);
		
		if(methodBodyNodes){
			constructorNodeBody.body = constructorNodeBody.body.concat(methodBodyNodes);
		}

		if(variableNodes){
			constructorNodeBody.body = constructorNodeBody.body.concat(variableNodes);
		}

		constructorNode.body = constructorNodeBody;
		constructorNode.generator = false;
		constructorNode.expression = false;

		var expressionConstructor = new node("ExpressionStatement");
		expressionConstructor.range = range;

		var expressionConstructorExpression = new node("AssignmentExpression");
		expressionConstructorExpression.range = range;
		expressionConstructorExpression.operator = "=";
		expressionConstructorExpression.left = createIdentifierNode(className, range);
		expressionConstructorExpression.right = constructorNode;
		
		expressionConstructor.expression = expressionConstructorExpression;

		return expressionConstructor;
	}

	cocoJava.yy.createInvokeNode = function createInvokeNode(nameOrObject, nameRange, invokeNode, invokeRange, range){
		var classObjectNode;
		if(typeof nameOrObject === "string"){
			classObjectNode = createIdentifierNode(nameOrObject, nameRange);
		}else{
			classObjectNode = nameOrObject;
		}
		var propertyNode, memberExpressionNode;
		if(typeof invokeNode === "string"){
			propertyNode = createIdentifierNode(invokeNode, invokeRange);
			memberExpressionNode = createMemberExpressionNode(classObjectNode, propertyNode, range);
			return memberExpressionNode;
		}else{
			propertyNode = invokeNode.callee;
			memberExpressionNode = createMemberExpressionNode(classObjectNode, propertyNode, range);
			invokeNode.callee = memberExpressionNode;
			return invokeNode;
		}
		
	}

	cocoJava.yy.createSimpleMethodInvokeNode = function createSimpleMethodInvokeNode(methodName, methodRange, argumentsNodes, range){
		var methodNode = createIdentifierNode(methodName, methodRange);
		var methodInvokeNodeExpression = new node("CallExpression");
		methodInvokeNodeExpression.range = range;
		methodInvokeNodeExpression.callee = methodNode;
		//TODO: Validate argument types
		methodInvokeNodeExpression.arguments = argumentsNodes;
		return methodInvokeNodeExpression;
	}

	cocoJava.yy.createConstructorCall = function createConstructorCall(methodName, methodRange, argumentsNodes, range){
		var constructorNode = new node("NewExpression");
		constructorNode.range = range;
		constructorNode.callee = createIdentifierNode(methodName, methodRange);
		//TODO: Validate argument types
		constructorNode.arguments = argumentsNodes;
		return constructorNode;
	}

	cocoJava.yy.createSuperInvokeNode = function createSuperInvokeNode(methodNode, superRange, range){
		var oldCallee = methodNode.callee;
		var innerMemberExpression = createMemberExpressionNode(createIdentifierNode("__TemporaryClassName", superRange), createIdentifierNode("__super__", superRange), range);
		var newCallee = createMemberExpressionNode(innerMemberExpression, oldCallee, range);
		methodNode.callee = newCallee;
		return methodNode;
	}

	cocoJava.yy.createSuperConstructorNode = function createSuperConstructorNode(superRange, argumentsNodes, range){
		var mostInnerMember = createMemberExpressionNode(createIdentifierNode("__TemporaryClassName", superRange), createIdentifierNode("__super__", superRange), superRange);
		var innerMemberExpression = createMemberExpressionNode(mostInnerMember, createIdentifierNode("constructor", superRange), superRange);
		var memberExpressionNode = createMemberExpressionNode(innerMemberExpression, createIdentifierNode("call", superRange), range);
		var superInvokeNodeExpression = new node("CallExpression");
		superInvokeNodeExpression.range = range;
		superInvokeNodeExpression.callee = memberExpressionNode;
		//TODO: Validate argument types
		superInvokeNodeExpression.arguments = argumentsNodes;
		return superInvokeNodeExpression;
	}

	var createVariableAttribution = cocoJava.yy.createVariableAttribution = function createVariableAttribution(varName, varRange, assignmentRange, expressionNode, index1, index2){
		var assignmentNode = new node("ExpressionStatement");
		assignmentNode.range = assignmentRange;

		var assignmentExpressionNode = new node("AssignmentExpression");
		assignmentExpressionNode.range = assignmentRange;
		assignmentExpressionNode.operator = '=';

		if(typeof varName === "string"){
			var varIdentifier = createIdentifierNode(varName, varRange); 
		}
		else{
			var varIdentifier = varName;
		}

		var assignmentNodeLeft;

		if(index1){
			assignmentNodeLeft = createMemberExpressionNode(varIdentifier, index1, varRange, true);
			if(index2){
				assignmentNodeLeft = createMemberExpressionNode(assignmentNodeLeft, index2, varRange, true);
			}
		}else{
			assignmentNodeLeft = varIdentifier;
		}
		assignmentExpressionNode.left = assignmentNodeLeft;

		if(expressionNode.type === "NewExpression"){
			assignmentExpressionNode.right = expressionNode;
		}else{
			//var setNode = createRuntimeCheckAssignment(varName, varRange, expressionNode, index1, index2, assignmentRange);
			//FIXME Removed Validations for now
			assignmentExpressionNode.right = expressionNode;
		}
		assignmentNode.expression = assignmentExpressionNode;
		return assignmentNode;
	}

	cocoJava.yy.createEmptyStatement = function createEmptyStatement(range){
		var emptyStatement = new node("EmptyStatement");
		emptyStatement.range = range;
		return emptyStatement;
	}

	cocoJava.yy.createMathOperation = function createMathOperation(op, left, right, range){
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
				raise('Invalid Operation', range);
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

	var createExpression = cocoJava.yy.createExpression = function createExpression(op, type, left, right, range){
		var logicalNode = new node(type);
		logicalNode.range = range;
		logicalNode.operator = op;
		logicalNode.left = left;
		logicalNode.right = right;
		return logicalNode;
	}

	cocoJava.yy.createUnaryExpression = function createExpression(op, expression, range){
		var unaryNode = new node("UnaryExpression");
		unaryNode.range = range;
		unaryNode.operator = op;
		unaryNode.prefix = "true";
		unaryNode.argument = expression;
		return unaryNode;
	}

	cocoJava.yy.createTernaryNode = function createTernaryNode(testExpression, consequentExpression, alternateExpression, expressionRange){
		var ternaryNode = new node("ConditionalExpression");
		ternaryNode.range = expressionRange;
		ternaryNode.test = testExpression;
		ternaryNode.consequent = consequentExpression;
		ternaryNode.alternate = alternateExpression;
		return ternaryNode;
	}

	cocoJava.yy.createVarDeclarationNode = function createVarDeclarationNode(type, declarators, declarationRange){
		var varDeclarationNode = new node("VariableDeclaration");
		varDeclarationNode.range = declarationRange;
		varDeclarationNode.kind = "var";
		varDeclarationNode.javaType = type;
		varDeclarationNode.declarations = [];

		varDeclarationNode.declarations = varDeclarationNode.declarations.concat(declarators);

		return varDeclarationNode;
	}

	cocoJava.yy.createVarDeclaratorNodeNoInit = function createVarDeclarationNodeNoInit(varName, declarationRange){
		var varDeclaratorNode = new node("VariableDeclarator");
		varDeclaratorNode.range = declarationRange;

		var idNode = createIdentifierNode(varName, declarationRange);
		varDeclaratorNode.id = idNode;
		varDeclaratorNode.init = null;

		return varDeclaratorNode;
	}

	cocoJava.yy.createVarDeclaratorNodeWithInit = function createVarDeclarationNodeWithInit(varName, varRange, assignment, assignmentRange, declarationRange){
		var varDeclaratorNode = new node("VariableDeclarator");
		varDeclaratorNode.range = declarationRange;

		var idNode = createIdentifierNode(varName, declarationRange);

		varDeclaratorNode.id = idNode;

		if(assignment.type === "NewExpression"){
			varDeclaratorNode.init = assignment;
		}else{
			//var initNode = createRuntimeCheckAssignment(varName, varRange, assignment, null, null, assignmentRange);
			//FIXME Removed Validations for now
			varDeclaratorNode.init = assignment;
		}
		return varDeclaratorNode;
	}

	var createRuntimeCheckAssignment = function createRuntimeCheckAssignment(varName, varRange, assignment, index1, index2, range){
		var initNode = new node("CallExpression");
		initNode.range = range;
		initNode.arguments = [];
		initNode.arguments.push(assignment);
		initNode.arguments.push(getArgumentForVariable(varName, varRange));
		initNode.arguments.push(getArgumentForVariable(varName, varRange));
		if(index1){
			initNode.arguments.push(index1);
		}else{
			initNode.arguments.push(getNullArgument());
		}
		if(index2){
			initNode.arguments.push(index2);
		}else{
			initNode.arguments.push(getNullArgument());
		}
		initNode.arguments.push(getArgumentForNumber(assignment.ASTNodeID, range));
		//FIXME changed validateSet to checkAssignment for now
		var callee = createMemberExpressionNode(getRuntimeFunctions(range), createIdentifierNode("checkAssignment", range), range, false);

		initNode.callee = callee;
		return initNode;
	}

	var createExpressionStatementNode = cocoJava.yy.createExpressionStatementNode =  function createExpressionStatementNode(expression, range){
		var expressionStatementNode = new node("ExpressionStatement");
		expressionStatementNode.range = range
		expressionStatementNode.expression = expression;
		return expressionStatementNode;
	}

	var createReturnStatementNode = cocoJava.yy.createReturnStatementNode =  function createReturnStatementNode(expression, range){
		var returnStatementNode = new node("ReturnStatement");
		returnStatementNode.range = range
		returnStatementNode.argument = expression;
		return returnStatementNode;
	}

	var createSimpleIfNode = cocoJava.yy.createSimpleIfNode = function createSimpleIfNode(testExpression, consequentBlock, consequentRange, ifRange){
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

	cocoJava.yy.createSimpleIfElseNode = function createSimpleIfElseNode(testExpression, consequentBlock, consequentRange, alternateBlock, alternateRange, ifRange){
		var ifElseNode = createSimpleIfNode(testExpression, consequentBlock, consequentRange, ifRange);

		alternateNode = new node("BlockStatement");
		alternateNode.range = alternateRange;
		alternateNode.body = [];
		alternateNode.body = alternateNode.body.concat(alternateBlock);

		ifElseNode.alternate = alternateNode;

		return ifElseNode;
	}

	var createSimpleListNode = cocoJava.yy.createSimpleListNode = function createSimpleListNode(varName, varRange, range){
		var simpleList = new node("VariableDeclarator");
		simpleList.range = range;

		var idNode = createIdentifierNode(varName, varRange);
		simpleList.id = idNode;

		var nodeList = new node("ExpressionStatement");
		simpleList.init = nodeList;

		return simpleList;
	}

	cocoJava.yy.createListWithInitNode = function createListWithInitNode(varName, varRange, initNode, range){
		var nullList = createSimpleListNode(varName, varRange, range);
		nullList.init = initNode;
		return nullList;
	}

	var createListInitialization = cocoJava.yy.createListInitialization = function createListInitialization(nodeType, range){
		var newExpressionNode = new node("NewExpression");
		newExpressionNode.range = range;
		var newExpressionNodecallee = createIdentifierNode("_ArrayList", range);
		newExpressionNode.callee = newExpressionNodecallee;
		newExpressionNode.arguments = [];
		newExpressionNode.arguments.push(getArgumentForName(nodeType, range));
		return newExpressionNode;
 	}

	var createSimpleArrayNode = cocoJava.yy.createSimpleArrayNode = function createSimpleArrayNode(varName, varRange, range){
		var simpleArray = new node("VariableDeclarator");
		simpleArray.range = range;

		var idNode = createIdentifierNode(varName, varRange);
		simpleArray.id = idNode;

		var nodeArray = new node("ArrayExpression")
		nodeArray.elements = [];
		simpleArray.init = nodeArray;

		return simpleArray;
	}

	cocoJava.yy.createArrayWithInitNode = function createArrayWithInitNode(varName, varRange, initNode, range){
		var nullArray = createSimpleArrayNode(varName, varRange, range);
		nullArray.init = initNode;
		return nullArray;
	}

	var createArrayWithNullInitialization = cocoJava.yy.createArrayWithNullInitialization = function createArrayWithNullInitialization(nodeExp, range){
		var nodeArray = new node("ArrayExpression")
			, size = nodeExp.value || 0;
		nodeArray.range = range;	
		nodeArray.elements = [];

		// TODO: Validar a expressão que declara o tamanho do array.
		_.times(parseInt(size),function(){
			var literal = getNullArgument();
			nodeArray.elements.push(literal);
		});
		return nodeArray;
	}

	cocoJava.yy.createTwoDimensionalArray = function createTwoDimensionalArray(nodesExp, range){
		var nodeArray = new node("ArrayExpression");
		nodeArray.range = range;
		nodeArray.elements = [];
		_.times(nodesExp[0].value, function(){
			if(nodesExp[1]){
				var literal = createArrayWithNullInitialization(nodesExp[1],range);
			}
			nodeArray.elements.push(literal);
		});
		return nodeArray;
	}

	var createArrayWithInitialization = cocoJava.yy.createArrayWithInitialization = function createArrayWithInitialization(values, range){
		var nodeArray = new node("ArrayExpression")
			, size = values.length;
		nodeArray.range = range;	
		nodeArray.elements = [];

		for (var i = 0; i < values.length; i++) {
			if(values[i].constructor == Array){
				nodeArray.elements.push(createArrayWithInitialization(values[i],range));
			}else{
				nodeArray.elements.push(values[i]);
			}
		};
		return nodeArray;
	}

	cocoJava.yy.validateDeclaratorsDimension = function validateDeclaratorsDimension(declaratorNodes, type){
		_.each(declaratorNodes, function(declaratorNode){
			if(declaratorNode.init.elements.length > 0 && declaratorNode.init.elements[0].type == "ArrayExpression"){
				raise("Invalid type for " + type, declaratorNode.range);
			}
		});
	}

	cocoJava.yy.createArrayFromInitialArray = function createArrayFromInitialArray(arrays, range){
		//determine if it's 1 or 2 dimension and validates if it's more than 2 dimension
		var dimensions = 1;
		for (var i = 0; i < arrays.length; i++) {
			if(arrays[i].constructor == Array){
				dimensions = 2;
			}
		}
		if(dimensions == 2){
			for (var i = 0; i < arrays.length; i++) {
				if(arrays[i].constructor != Array){
					raise("Incompatible types on array", range);
				}
				for(var j = 0; j < arrays[i].length; j++){
					if(arrays[i][j].constructor == Array){
						raise("More than 2-dimension arrays are not supported", range);
					}
				}
			}
		}
		return createArrayWithInitialization(arrays, range);
	}

	cocoJava.yy.createSwitchNode = function createSwitchNode(discriminant, cases, range){
		var switchNode = new node("SwitchStatement");
		switchNode.range = range;
		switchNode.discriminant = discriminant;
		switchNode.cases = [];
		switchNode.cases = switchNode.cases.concat(cases);
		return switchNode;
	}

	cocoJava.yy.createDefaultSwitchNode = function createDefaultSwitchNode(range){
		return createCaseSwitchNode(null, range);
	}

	cocoJava.yy.addSwitchCaseStatements = function addSwitchCaseStatements(cases, block){
		cases[cases.length -1].consequent = block;
		return cases;
	}

	var createCaseSwitchNode = cocoJava.yy.createCaseSwitchNode = function createCaseSwitchNode(testExpression, range){
		var caseNode = new node("SwitchCase");
		caseNode.range = range;
		caseNode.test = testExpression;
		caseNode.consequent = [];
		return caseNode;
	}

	cocoJava.yy.createSimpleWhileNode = function createSimpleWhileNode(testExpression, whileBlock, blockRange, whileRange){
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

	cocoJava.yy.createDoWhileNode = function createDoWhileNode(testExpression, whileBlock, blockRange, whileRange){
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

	cocoJava.yy.createBreakStatement = function createBreakStatement(range){
		var breakNode = new node("BreakStatement");
		breakNode.range = range;

		return breakNode;
	}

	cocoJava.yy.createContinueStatement = function createContinueStatement(range){
		var continueNode = new node("ContinueStatement");
		continueNode.range = range;

		return continueNode;
	}

	cocoJava.yy.createForStatement = function createForStatement(forInit, testExpression, updateExpressions, updateRange, forBlock, blockRange, forRange){
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

	cocoJava.yy.createEnhancedForStatement = function createEnhancedForStatement(typeVar, varName, varRange, arraylist, arraylistRange, forBlock, blockRange, range){
		//list._arrayList.forEach(function(varName){blocks});
		var enhancedForExpression = new node("ExpressionStatement");
		enhancedForExpression.range = range;

		enhancedForExpressionExpression = new node("CallExpression");
		enhancedForExpressionExpression.range = range;
		enhancedForExpressionExpression.callee = createMemberExpressionNode(createMemberExpressionNode(createIdentifierNode(arraylist,arraylistRange),createIdentifierNode("_arraylist",range),range), createIdentifierNode("forEach"),range);

		

		enhancedForExpressionArgument = new node("FunctionExpression");
		enhancedForExpressionArgument.range = range;
		enhancedForExpressionArgument.id = null;
		enhancedForExpressionArgument.params = [];
		enhancedForExpressionArgument.params.push(createIdentifierNode(varName, varRange));
		enhancedForExpressionArgument.defaults = [];

		enhancedForExpressionArgumentBlock = new node("BlockStatement");
		enhancedForExpressionArgumentBlock.range = blockRange;
		enhancedForExpressionArgumentBlock.body = forBlock;

		enhancedForExpressionArgument.body = enhancedForExpressionArgumentBlock;
		enhancedForExpressionArgument.generator = false;
		enhancedForExpressionArgument.expression = false;

		enhancedForExpressionExpression.arguments = [];
		enhancedForExpressionExpression.arguments.push(enhancedForExpressionArgument);	
		enhancedForExpression.expression = enhancedForExpressionExpression;

		return enhancedForExpression;
	}

	cocoJava.yy.createConsoleLogExpression = function createConsoleLogExpression(expression, range){
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

	cocoJava.yy.createClassCastNode = function createClassCastNode(type, typeRange, expression, range){
		var classCastNode = new node("CallExpression");
		classCastNode.range = range;
		classCastNode.arguments = [];
		if(type === "int" || type === "double"){
			classCastNode.arguments.push(getArgumentForName(type, typeRange));
		}else if(type === "Integer" || type === "Double" || type ===  "String" || type ===  "boolean" || type ===  "Boolean"){
			raise("Invalid Class cast", range);
		}else{
			classCastNode.arguments.push(createIdentifierNode(type, typeRange));
		}
		classCastNode.arguments.push(expression);
		classCastNode.callee = createMemberExpressionNode(getRuntimeFunctions(range),createIdentifierNode("classCast", range),range, false);
		return classCastNode;
	}

	//Get line number for when raising errors
	var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

	var getLineInfo = function(range) {
		offset = range[0];
	    for (var line = 1, cur = 0;;) {
			lineBreak.lastIndex = cur;
			var match = lineBreak.exec(javaCode);
			if (match && match.index < offset) {
				++line;
				cur = match.index + match[0].length;
			} else break;
		}
		return {line: line, column: offset - cur};
	}

	function raise(message, range) {
		var loc = getLineInfo(range);
		var err = new SyntaxError(message);
		err.pos = range[0]; err.loc = loc; err.range = range;
		throw err;
	}

	try{
		ast = cocoJava.parse(javaCode);
	}catch(err){
		if(err.hash){
			err.message = "Unexpected " + err.hash.text;
			if(err.hash.expected.indexOf("'LINE_TERMINATOR'") >= 0 ){
				err.message = err.message + " maybe a ';'' is missing!"
			};

			err.loc = {line: err.hash.line, column: err.hash.loc.first_column};
			err.range = err.hash.range
		}
		throw err;
	}
	
	return ast;
}

exports.wrapFunction = wrapFunction = function(ast, functionName, className, staticCall){
	node = function(type){
		this.type = type;
	}
	astBody = ast.body;

	//check if there's a different static call other than the main
	if(className !== undefined && className !== ""  && staticCall !== undefined &&  staticCall !== ""){
		var staticCallNode = new node("ReturnStatement");

	    var staticCallNodeExpression = new node("CallExpression");

	    var myClassIndentifier = new node("Identifier");
			myClassIndentifier.name = className;
	    var staticCallProperty = new node("Identifier");
			staticCallProperty.name = staticCall;

		var staticCallCalee = new node("MemberExpression");
			staticCallCalee.computed = false;
			staticCallCalee.object = myClassIndentifier;
			staticCallCalee.property = staticCallProperty;

	    staticCallNodeExpression.callee = staticCallCalee;

	    staticCallNodeExpression.arguments = [];

	    staticCallNode.argument = staticCallNodeExpression;
	    astBody.push(staticCallNode);
	}else if(astBody[astBody.length-1].expression.type === "CallExpression"){
		// transform the static call into return that same static call
		var staticCallNode = new node("ReturnStatement");
		staticCallNode.argument = astBody[astBody.length-1].expression;
		astBody[astBody.length-1] = staticCallNode
	}

	fooFunctNode = new node("FunctionDeclaration")
	fooId = new node("Identifier");
	if(functionName){
		fooId.name = functionName;
	}else{
		fooId.name = "foo";		
	}
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
/* These are included in the code directly

String.prototype.compareTo = function (other){
	for(var i = 0; i < this.length; i++){
		if(this[i].charCodeAt(0) != other.charCodeAt(i))
			return this[i].charCodeAt(0) - other.charCodeAt(i);

	}
	return this.length - other.length;
}
String.prototype.compareToIgnoreCase = function (other){
	for(var i = 0; i < this.length; i++){
		if(this[i].toLowerCase().charCodeAt(0) != other.toLowerCase().charCodeAt(i))
			return this[i].toLowerCase().charCodeAt(0) - other.toLowerCase().charCodeAt(i);

	}
	return this.length - other.length;
}

String.prototype._length = function(){
	return this.length;
}

Array.prototype.__defineGetter__("_length", function(){return this.length});

_Object = function() {

	function _Object() {
		this.__id = generateId();
	}

	var __id = 0;

	function generateId() { 
		return id++; 
	}

	_Object.prototype.__type == "Object";

	_Object.prototype.__id = function() {
		var newId = generateId();
		this.__id = function() { return newId; };
		return newId;
	};

	_Object.prototype.equals = function(other) {
		return this === other;
	};

	_Object.prototype.toString= function() {
		return this.__type + "@" + this.__id;
	};
	return _Object;

}.call(this);

Integer = function () {
    Integer = function Integer(value) {
        _Object.call(this);
        if(value.constructor == Number){
        	this.value = Math.floor(value);
        }else{
        	throw new SyntaxError("Integer*expects*an*int*not*" + value.constructor.name);
        }
    };
    Integer.prototype = Object.create(_Object.prototype);
    Integer.prototype.__type = 'Integer';
    Integer.prototype.intValue = function () {
        return this.value;
    };
    return Integer;
}.call(this);

Double = function () {
    Double = function Double(value) {
        _Object.call(this);
        if(value.constructor == Number){
        	this.value = value;
        }else{
        	throw new SyntaxError("Double*expects*an*int*not*" + value.constructor.name);
        }
    };
    Double.prototype = Object.create(_Object.prototype);
    Double.prototype.__type = 'Double';
    Double.prototype.doubleValue = function () {
        return this.value;
    };
    return Double;
}.call(this);

_ArrayList = function() {

	function _ArrayList(type) {
		this._type = type;
		this._arraylist = [];
	}
	_ArrayList.prototype = Object.create(_Object.prototype);
	_ArrayList.prototype.__type = 'ArrayList';
	_ArrayList.prototype.size = function() {
		return this._arraylist.length;
	};

	_ArrayList.prototype.add = function(index, object) {
		//hacky way so we can have method overload
		if (object == undefined) {
			//todo("validate type");
			this._arraylist.push(index);
			return true;
		} else {
			if (index > 0 && index < this._arraylist.length) {
				this._arraylist.splice(index, 0, object);
				return true;
			} else {
				throw new SyntaxError("Index out of bounds Exception");
			}
		}
	};

	_ArrayList.prototype.get = function(index) {
		if (index < 0 || index > this._arraylist.length) {
			throw new SyntaxError("Index out of bounds Exception");
		}
		return this._arraylist[index];
	};

	_ArrayList.prototype.set = function(index, object) {
		var old;
		if (index < 0 || index > this._arraylist.length) {
			throw new SyntaxError("Index out of bounds Exception");
		}
		var old = this._arraylist[index];
		//todo("validate type");
		this._arraylist[index] = object;
		return old;
	};

	_ArrayList.prototype.remove = function(index) {
		if (index < 0 || index > this._arraylist.length) {
			throw new SyntaxError("Index out of bounds Exception");
		}
		return this._arraylist.splice(index,1);
	};

	return _ArrayList;

}.call(this);
*/
exports.___JavaRuntime = ___JavaRuntime = { 
	variablesDictionary : [],
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

	functions : {
		print: function(str){
			console.log(str);
		},
		//FIXME: chaneged validateSet to checkAssignment, most validations will be in the AST soon
		checkAssignment: function(value, variable, arrayIndex1, arrayIndex2, javaType, range){
			if(typeof value === "function")
				value = value();

			var varRawType;

			if (javaType){
				varRawType = javaType.replace(/\[/g,'').replace(/\]/g,'');
				if(javaType.indexOf("[][]")>-1){
					//if either the new value and the variable are arrays
					if (value.constructor === Array){
						if(value[0].constructor === Array){
							//both are arrays: fine
						}else{
							throw new SyntaxError("Incompatible types");
						}
					}else{
						//if the value is an array but it's not 2-d
						throw new SyntaxError("Incompatible types");
					}
				} else if(javaType.indexOf("[]")>-1){
					//if both value and variables are arrays
					if (value.constructor === Array && arrayIndex1 == undefined){
						if(value[0].constructor === Array){
							//if value is a 2-d array
							throw new SyntaxError("Incompatible types");
						}else{
							//value is a 1-d array: fine
						}
					}else{
						//variable is array but value isn't
						throw new SyntaxError("Incompatible types");
					}
				}else{
					if(javaType == 'int' || javaType == 'Integer'){
						if(value.constructor == Number){
							return Math.floor(value);
						}else{
							throw new SyntaxError("Int cannot accept " + value.constructor);
						}
					}else if(javaType == 'double' || javaType == 'Double'){
						if(value.constructor == Number){
							return value;
						}else{
							throw new SyntaxError("Double cannot accept " + value.constructor);
						}
					}else if(javaType == 'String'){
						if(value.constructor  == String){
							return value;
						}else{
							throw new SyntaxError("String cannot accept " + value.constructor);
						}
					}	
				}
			}
			if(variable){
				//If the variable is assigned already we can try determine the type
				//Check first if the variable is an array
				if (variable.constructor == Array){
					if (variable[0].constructor == Array){
						//variable is a 2-d array
						if (value.constructor === Array){
							if(value[0].constructor === Array){
								// value is also a 2-d array: fine
							}else{
								//value isnt a 2-d array
								throw new SyntaxError("Incompatible types");
							}
						}else{
							//value isnt an array
							throw new SyntaxError("Incompatible types");
						}
					}else{
						//variable is a 1-d array
						if (value.constructor === Array){
							if(value[0].constructor === Array){
								//value isnt a 1-d array
								throw new SyntaxError("Incompatible types");
							}else{
								// value is also a 1-d array: fine
							}
						}
					}
				}else{
					//if it's not an array it could be an integer, double, string, userType
					if(variable.constructor == Number){
						if(variable % 1 != 0){
							//current variable is a double
							if(value.constructor == Number){
								return value;
							}else{
								throw new SyntaxError("Double cannot accept " + value.constructor);
							}
						}else{
							//current variable is an int
							if(value.constructor == Number){
								return Math.floor(value);
							}else{
								throw new SyntaxError("Int cannot accept " + value.constructor);
							}
						}
					}else if(variable.constructor == String){
						if(value.constructor  == String){
							return value;
						}else{
							throw new SyntaxError("String cannot accept " + value.constructor);
						}
					}
				}
			}else{
				//If we cant check returns the variable anyway
				return value;
			}
		},
		validateSet: function(value, variable, arrayIndex1, arrayIndex2, ASTNodeID){
			if(typeof value === "function")
				value = value();
			
			//Removes the '__' from the variable name
			var index = parseInt(variableName.substring(2));
			var varRawType = ___JavaRuntime.variablesDictionary[index].type;
			var type;
			//check the type
			if(___JavaRuntime.variablesDictionary[index].type.indexOf("[][]")>-1){
				//if either the new value and the variable are arrays
				if (value.constructor === Array){
					if(value[0].constructor === Array){
						if(value instanceof _Object){
							type = variable.type;
							type = type + "[][]"
						}else{
							type = varRawType;
						}
					}else if(arrayIndex1 != undefined && value[0].constructor !== Array){
						//if the assign contains 1 index the variable can receive an array
						varRawType = ___JavaRuntime.variablesDictionary[index].type.replace('[','').replace(']','');
						if(value instanceof _Object){
							type = variable.type;
							type = type + "[]"
						}else{
							type = varRawType;
						}
					}else{
						throw new SyntaxError("Incompatible types");
					}
				} else if (arrayIndex2 != undefined && value.constructor !== Array){
					//if the assign contains 2 indexes the variable can receive only the basic type
					varRawType = ___JavaRuntime.variablesDictionary[index].type.replace(/\[/g,'').replace(/\]/g,'');
				}else{
					//if the variable is an array but the value is incompatible
					throw new SyntaxError("Incompatible types");
				}
			} else if(___JavaRuntime.variablesDictionary[index].type.indexOf("[]")>-1){
				//if both value and variables are arrays
				if (value.constructor === Array && arrayIndex1 == undefined){
					if(value[0].constructor === Array){
						throw new SyntaxError("Incompatible types");
					}
					if(value instanceof _Object){
						type = variable.type;
						type = type + "[]"
					}else{
						type = varRawType;
					}
				}else if(arrayIndex1 != undefined){
					//if there's an index the array can recive only the basic type

					varRawType = ___JavaRuntime.variablesDictionary[index].type.replace('[','').replace(']','');
				}else{
					throw new SyntaxError("Incompatible types");
				}

			}
			
			if(arrayIndex1){
				if(typeof arrayIndex1 === "function")
					arrayIndex1 = arrayIndex1();
				if(typeof arrayIndex1 != 'number' || arrayIndex1 % 1 !== 0){
					throw new SyntaxError("Array index must be an integer");
				}else if(variable.constructor !== Array){
					throw new SyntaxError("Incompatible types");
				}else if(arrayIndex1 < 0 || arrayIndex1 >= variable.length){
					throw new SyntaxError("Array index out of bounds");
				}
			}
			if(arrayIndex2){
				if(typeof arrayIndex2 === "function")
					arrayIndex2 = arrayIndex2();
				if(typeof arrayIndex2 != 'number' || arrayIndex2 % 1 !== 0){
					throw new SyntaxError("Array index must be an integer");
				}else if(variable.constructor !== Array){
					throw new SyntaxError("Incompatible types");
				}else if(arrayIndex2 < 0 || arrayIndex2 >= variable[arrayIndex1].length){
					throw new SyntaxError("Array index out of bounds");
				}
			}
			switch (varRawType){
				case 'int':
					if (typeof value === 'number'){
						return Math.floor(value);
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
				case type:
					return value;
					break;
				default:
					break;
			}
		},
		determineType: function(value){
			if(value == undefined){
				return undefined;
			}
			if (value.constructor == Array){
				if (value[0].constructor == Array){
					if(value[0][0].constructor == Number){
						if(value[0][0] % 1 != 0){
							//current variable is a double array
							return "double[][]";
						}else{
							//current variable is an int
							return "int[][]";
						}
					}else if(value[0][0].constructor == String){
						return "String[][]";
					}else if(typeof value[0][0] == "object"){
						if(value[0][0].__type){
							return value[0][0].__type + "[][]";
						}
					}
				}else{
					//current variable is an 1-d array
					if(value[0].constructor == Number){
						if(value[0] % 1 != 0){
							//current variable is a double array
							return "double[]";
						}else{
							//current variable is an int
							return "int[]";
						}
					}else if(value[0].constructor == String){
						return "String[]";
					}else if(typeof value[0] == "object"){
						if(value[0].__type){
							return value[0].__type + "[]";
						}
					}
				}
		}else{
				//if it's not an array it could be an integer, double, string, userType
				if(value.constructor == Number){
					if(value % 1 != 0){
						//current variable is a double
						return "double";
					}else{
						//current variable is an int
						return "int";
					}
				}else if(value.constructor == String){
					return "String";
				}else if(typeof value == "object"){
					if(value.__type){
						return value.__type;
					}
				}
			}
			//if cant check the type its wildcard type
			return "?";
		},
		validateIndex: function(value, range){
			if(typeof value === "function")
				value = value();
			if (typeof value === 'number'){
						if (value % 1 === 0){
							return value;
						}else{
							throw new SyntaxError("Possible loss of precision, received double, expected int");
						}
			}
			throw new SyntaxError("Incompatible types, received "+ typeof value  +", expected int");

		},
		classCast: function(type, value){
			if(typeof type === "string"){
				if (typeof value === "number"){
						if(type === "int"){
							return Math.floor(value);
						}else{
							return value;
						}
					}
			}else{
				if(value instanceof type){
					return type;
				}else{
					throw new SyntaxError("Invalid Class cast");
				}
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
		},
	},
}


});
