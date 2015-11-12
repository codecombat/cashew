
// Empty Program
describe("Empty program", function() {
	var code = '';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
	var ast =  {
	  "type": "Program",
    "range": [0, 0],
	  "body": []
	};
  ast = toASTNodes(cashew, ast);
  it("Should return an empty program AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true);	
  });

  });

//Milestone 3 

describe("Variable declaration", function() {
  var code = 'public class MyClass { public static void main(String[] args) { int x; }}';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
              "type": "Program",
              "range": [
                23,
                72
              ],
              "body": [
                {
                  "type": "VariableDeclaration",
                  "range": [
                    68,
                    69
                  ],
                  "kind": "var",
                  "javaType": "int",
                  "declarations": [
                    {
                      "type": "VariableDeclarator",
                      "range": [
                        68,
                        69
                      ],
                      "id": {
                        "type": "Identifier",
                        "range": [
                          68,
                          69
                        ],
                        "name": "__0"
                      },
                      "init": null
                    }
                  ]
                }
              ]
            };
  ast = toASTNodes(cashew, ast);
  it("Should return variable declaration AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("Assignments", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return assignment AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("Logic operators", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return Logic operators AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("Math operations", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return Math operations AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("String concatenation", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return String concatenation AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });
  
describe("If Clause", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return an IF clause AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("For loop", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return an For loop AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("While loop", function() {
  var code = '  ';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
  var ast =  {
    "type": "Program",
    "range": [0, 0],
    "body": []
    };
  ast = toASTNodes(cashew, ast);
  xit("Should return a While loop AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });


// done

describe("System.out.println", function() {
  var code= 'public class MyClass{/** main method */public static void main(String[]args){System.out.println(\"Type your code here\");}}';
  var cashew = new Cashew();
  var parsedAST = cashew.parse(code);
	var ast ={
   "type": "Program",
    "range": [
      39,
      120
    ],
    "body": [
      {
        "type": "ExpressionStatement",
        "range": [
          77,
          119
        ],
        "expression": {
          "type": "CallExpression",
          "range": [
            77,
            119
          ],
          "arguments": [
            {
              "type": "Literal",
              "range": [
                96,
                117
              ],
              "value": "Type your code here",
              "raw": "\"Type your code here\""
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              77,
              119
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                77,
                119
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  77,
                  119
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  77,
                  119
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                77,
                119
              ],
              "name": "print"
            },
            "computed": false
          }
        }
      }
    ]
  };

  //ast = toASTNodes(cashew, ast);
	it("Should return a System.out.println AST", function() {
      expect( JSON.stringify(cleanAST(parsedAST)) == JSON.stringify(ast)).toBe(true);
	});

});



// auxiliary functions
function cleanAST(ast) {
  for (var k in ast) {
    if (typeof ast[k] == "object" && ast[k] !== null) {
     ast[k] = cleanAST(ast[k]);
    } else {
      if(k === "ASTNodeID") {
        delete ast[k];
      }
    }
  }
  return ast;
}

function toASTNodes(parser, ast) {
  for (var k in ast) {
    if (typeof ast[k] == "object" && ast[k] !== null && ast[k] !== "Program") {
     // console.log("---"+ast[k]);
      //console.log("TESTE");
      if(!Array.isArray(ast[k]))
        ast[k] = toASTNodes(parser, parser.toNode(ast[k]));
      else 
        ast[k] = toASTNodes(parser, ast[k]);
    }
  }
  return ast;
}