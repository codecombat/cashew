var cashew = require('../../cashew.js');
// Empty Program
describe("AST: Empty program", function() {
	var code = '';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
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

describe("AST: Variable declaration", function() {
  var code = 'public class MyClass { public static void main(String[] args) { int x; }}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
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
                    64,
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

describe("AST: Assignments", function() {
  var code = 'public class VariableClass { public static void main(String[] args) { int i1, i2; i1 = 0; i2 = 2; }}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    29,
    99
  ],
  "body": [
    {
      "type": "VariableDeclaration",
      "range": [
        70,
        80
      ],
      "kind": "var",
      "javaType": "int",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            74,
            76
          ],
          "id": {
            "type": "Identifier",
            "range": [
              74,
              76
            ],
            "name": "__0"
          },
          "init": null
        },
        {
          "type": "VariableDeclarator",
          "range": [
            78,
            80
          ],
          "id": {
            "type": "Identifier",
            "range": [
              78,
              80
            ],
            "name": "__1"
          },
          "init": null
        }
      ]
    },
    {
      "type": "ExpressionStatement",
      "range": [
        82,
        89
      ],
      "expression": {
        "type": "AssignmentExpression",
        "range": [
          82,
          89
        ],
        "operator": "=",
        "left": {
          "type": "Identifier",
          "range": [
            82,
            84
          ],
          "name": "__0"
        },
        "right": {
          "type": "CallExpression",
          "range": [
            82,
            89
          ],
          "arguments": [
            {
              "type": "Literal",
              "range": [
                87,
                88
              ],
              "value": 0,
              "raw": "0"
            },
            {
              "type": "Literal",
              "range": [
                82,
                84
              ],
              "value": "__0"
            },
            {
              "type": "Literal",
              "range": [
                82,
                89
              ],
              "value": 7,
              "raw": "7"
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              82,
              89
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                82,
                89
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  82,
                  89
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  82,
                  89
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                82,
                89
              ],
              "name": "validateSet"
            },
            "computed": false
          }
        }
      }
    },
    {
      "type": "ExpressionStatement",
      "range": [
        90,
        97
      ],
      "expression": {
        "type": "AssignmentExpression",
        "range": [
          90,
          97
        ],
        "operator": "=",
        "left": {
          "type": "Identifier",
          "range": [
            90,
            92
          ],
          "name": "__1"
        },
        "right": {
          "type": "CallExpression",
          "range": [
            90,
            97
          ],
          "arguments": [
            {
              "type": "Literal",
              "range": [
                95,
                96
              ],
              "value": 2,
              "raw": "2"
            },
            {
              "type": "Literal",
              "range": [
                90,
                92
              ],
              "value": "__1"
            },
            {
              "type": "Literal",
              "range": [
                90,
                97
              ],
              "value": 19,
              "raw": "19"
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              90,
              97
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                90,
                97
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  90,
                  97
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  90,
                  97
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                90,
                97
              ],
              "name": "validateSet"
            },
            "computed": false
          }
        }
      }
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return assignment AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("AST: Logic operators", function() {
  var code = 'public class LogicalClass { public static void main(String[] args) { boolean a1 = true && false; boolean n3 = !true; }}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    28,
    118
  ],
  "body": [
    {
      "type": "VariableDeclaration",
      "range": [
        69,
        95
      ],
      "kind": "var",
      "javaType": "boolean",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            77,
            95
          ],
          "id": {
            "type": "Identifier",
            "range": [
              77,
              95
            ],
            "name": "__0"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              82,
              95
            ],
            "arguments": [
              {
                "type": "LogicalExpression",
                "range": [
                  82,
                  95
                ],
                "operator": "&&",
                "left": {
                  "type": "Literal",
                  "range": [
                    82,
                    86
                  ],
                  "value": true,
                  "raw": "true"
                },
                "right": {
                  "type": "Literal",
                  "range": [
                    90,
                    95
                  ],
                  "value": false,
                  "raw": "false"
                }
              },
              {
                "type": "Literal",
                "range": [
                  77,
                  79
                ],
                "value": "__0"
              },
              {
                "type": "Literal",
                "range": [
                  82,
                  95
                ],
                "value": 3,
                "raw": "3"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                82,
                95
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  82,
                  95
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    82,
                    95
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    82,
                    95
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  82,
                  95
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "VariableDeclaration",
      "range": [
        97,
        115
      ],
      "kind": "var",
      "javaType": "boolean",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            105,
            115
          ],
          "id": {
            "type": "Identifier",
            "range": [
              105,
              115
            ],
            "name": "__1"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              110,
              115
            ],
            "arguments": [
              {
                "type": "UnaryExpression",
                "range": [
                  110,
                  115
                ],
                "operator": "!",
                "prefix": "true",
                "argument": {
                  "type": "Literal",
                  "range": [
                    111,
                    115
                  ],
                  "value": true,
                  "raw": "true"
                }
              },
              {
                "type": "Literal",
                "range": [
                  105,
                  107
                ],
                "value": "__1"
              },
              {
                "type": "Literal",
                "range": [
                  110,
                  115
                ],
                "value": 16,
                "raw": "16"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                110,
                115
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  110,
                  115
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    110,
                    115
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    110,
                    115
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  110,
                  115
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return Logic operators AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("AST: Math operations", function() {
  var code = 'public class MyClass { public static void main(String[] args) { int i1 = 10; int i2 = 2; int i3,i4; i3  = i1 + i2; i4 = i1 * i2; }}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    23,
    130
  ],
  "body": [
    {
      "type": "VariableDeclaration",
      "range": [
        64,
        75
      ],
      "kind": "var",
      "javaType": "int",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            68,
            75
          ],
          "id": {
            "type": "Identifier",
            "range": [
              68,
              75
            ],
            "name": "__0"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              73,
              75
            ],
            "arguments": [
              {
                "type": "Literal",
                "range": [
                  73,
                  75
                ],
                "value": 10,
                "raw": "10"
              },
              {
                "type": "Literal",
                "range": [
                  68,
                  70
                ],
                "value": "__0"
              },
              {
                "type": "Literal",
                "range": [
                  73,
                  75
                ],
                "value": 1,
                "raw": "1"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                73,
                75
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  73,
                  75
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    73,
                    75
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    73,
                    75
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  73,
                  75
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "VariableDeclaration",
      "range": [
        77,
        87
      ],
      "kind": "var",
      "javaType": "int",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            81,
            87
          ],
          "id": {
            "type": "Identifier",
            "range": [
              81,
              87
            ],
            "name": "__1"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              86,
              87
            ],
            "arguments": [
              {
                "type": "Literal",
                "range": [
                  86,
                  87
                ],
                "value": 2,
                "raw": "2"
              },
              {
                "type": "Literal",
                "range": [
                  81,
                  83
                ],
                "value": "__1"
              },
              {
                "type": "Literal",
                "range": [
                  86,
                  87
                ],
                "value": 13,
                "raw": "13"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                86,
                87
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  86,
                  87
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    86,
                    87
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    86,
                    87
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  86,
                  87
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "VariableDeclaration",
      "range": [
        89,
        98
      ],
      "kind": "var",
      "javaType": "int",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            93,
            95
          ],
          "id": {
            "type": "Identifier",
            "range": [
              93,
              95
            ],
            "name": "__2"
          },
          "init": null
        },
        {
          "type": "VariableDeclarator",
          "range": [
            96,
            98
          ],
          "id": {
            "type": "Identifier",
            "range": [
              96,
              98
            ],
            "name": "__3"
          },
          "init": null
        }
      ]
    },
    {
      "type": "ExpressionStatement",
      "range": [
        100,
        114
      ],
      "expression": {
        "type": "AssignmentExpression",
        "range": [
          100,
          114
        ],
        "operator": "=",
        "left": {
          "type": "Identifier",
          "range": [
            100,
            102
          ],
          "name": "__2"
        },
        "right": {
          "type": "CallExpression",
          "range": [
            100,
            114
          ],
          "arguments": [
            {
              "type": "CallExpression",
              "range": [
                106,
                113
              ],
              "arguments": [
                {
                  "type": "Identifier",
                  "range": [
                    106,
                    108
                  ],
                  "name": "__0"
                },
                {
                  "type": "Identifier",
                  "range": [
                    111,
                    113
                  ],
                  "name": "__1"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  106,
                  113
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    106,
                    113
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      106,
                      113
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      106,
                      113
                    ],
                    "name": "ops"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    106,
                    113
                  ],
                  "name": "add"
                },
                "computed": false
              }
            },
            {
              "type": "Literal",
              "range": [
                100,
                102
              ],
              "value": "__2"
            },
            {
              "type": "Literal",
              "range": [
                100,
                114
              ],
              "value": 38,
              "raw": "38"
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              100,
              114
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                100,
                114
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  100,
                  114
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  100,
                  114
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                100,
                114
              ],
              "name": "validateSet"
            },
            "computed": false
          }
        }
      }
    },
    {
      "type": "ExpressionStatement",
      "range": [
        115,
        128
      ],
      "expression": {
        "type": "AssignmentExpression",
        "range": [
          115,
          128
        ],
        "operator": "=",
        "left": {
          "type": "Identifier",
          "range": [
            115,
            117
          ],
          "name": "__3"
        },
        "right": {
          "type": "CallExpression",
          "range": [
            115,
            128
          ],
          "arguments": [
            {
              "type": "CallExpression",
              "range": [
                120,
                127
              ],
              "arguments": [
                {
                  "type": "Identifier",
                  "range": [
                    120,
                    122
                  ],
                  "name": "__0"
                },
                {
                  "type": "Identifier",
                  "range": [
                    125,
                    127
                  ],
                  "name": "__1"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  120,
                  127
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    120,
                    127
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      120,
                      127
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      120,
                      127
                    ],
                    "name": "ops"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    120,
                    127
                  ],
                  "name": "mul"
                },
                "computed": false
              }
            },
            {
              "type": "Literal",
              "range": [
                115,
                117
              ],
              "value": "__3"
            },
            {
              "type": "Literal",
              "range": [
                115,
                128
              ],
              "value": 57,
              "raw": "57"
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              115,
              128
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                115,
                128
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  115,
                  128
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  115,
                  128
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                115,
                128
              ],
              "name": "validateSet"
            },
            "computed": false
          }
        }
      }
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return Math operations AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("AST: String concatenation", function() {
  var code = 'public class ConcatenationClass { public static void main(String[] args) { String x = "String "; String y = "concatenation"; x = x + y; }}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    34,
    137
  ],
  "body": [
    {
      "type": "VariableDeclaration",
      "range": [
        75,
        95
      ],
      "kind": "var",
      "javaType": "String",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            82,
            95
          ],
          "id": {
            "type": "Identifier",
            "range": [
              82,
              95
            ],
            "name": "__0"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              86,
              95
            ],
            "arguments": [
              {
                "type": "Literal",
                "range": [
                  86,
                  95
                ],
                "value": "String ",
                "raw": "\"String \""
              },
              {
                "type": "Literal",
                "range": [
                  82,
                  83
                ],
                "value": "__0"
              },
              {
                "type": "Literal",
                "range": [
                  86,
                  95
                ],
                "value": 1,
                "raw": "1"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                86,
                95
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  86,
                  95
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    86,
                    95
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    86,
                    95
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  86,
                  95
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "VariableDeclaration",
      "range": [
        97,
        123
      ],
      "kind": "var",
      "javaType": "String",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            104,
            123
          ],
          "id": {
            "type": "Identifier",
            "range": [
              104,
              123
            ],
            "name": "__1"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              108,
              123
            ],
            "arguments": [
              {
                "type": "Literal",
                "range": [
                  108,
                  123
                ],
                "value": "concatenation",
                "raw": "\"concatenation\""
              },
              {
                "type": "Literal",
                "range": [
                  104,
                  105
                ],
                "value": "__1"
              },
              {
                "type": "Literal",
                "range": [
                  108,
                  123
                ],
                "value": 13,
                "raw": "13"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                108,
                123
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  108,
                  123
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    108,
                    123
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    108,
                    123
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  108,
                  123
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "ExpressionStatement",
      "range": [
        125,
        135
      ],
      "expression": {
        "type": "AssignmentExpression",

        "range": [
          125,
          135
        ],
        "operator": "=",
        "left": {
          "type": "Identifier",
          "range": [
            125,
            126
          ],
          "name": "__0"
        },
        "right": {
          "type": "CallExpression",
          "range": [
            125,
            135
          ],
          "arguments": [
            {
              "type": "CallExpression",
              "range": [
                129,
                134
              ],
              "arguments": [
                {
                  "type": "Identifier",
                  "range": [
                    129,
                    130
                  ],
                  "name": "__0"
                },
                {
                  "type": "Identifier",
                  "range": [
                    133,
                    134
                  ],
                  "name": "__1"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  129,
                  134
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    129,
                    134
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      129,
                      134
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      129,
                      134
                    ],
                    "name": "ops"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    129,
                    134
                  ],
                  "name": "add"
                },
                "computed": false
              }
            },
            {
              "type": "Literal",
              "range": [
                125,
                126
              ],
              "value": "__0"
            },
            {
              "type": "Literal",
              "range": [
                125,
                135
              ],
              "value": 33,
              "raw": "33"
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              125,
              135
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                125,
                135
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  125,
                  135
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  125,
                  135
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                125,
                135
              ],
              "name": "validateSet"
            },
            "computed": false
          }
        }
      }
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return String concatenation AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });
  
describe("AST: If-else Clause", function() {
  var code = 'public class IfClass { public static void main(String[] args) { int a = 10; if (a == 10) { System.out.println(\"that\'s correct\"); } else { System.out.println(\"that\'s incorrect\"); }}}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    23,
    180
  ],
  "body": [
    {
      "type": "VariableDeclaration",
      "range": [
        64,
        74
      ],
      "kind": "var",
      "javaType": "int",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            68,
            74
          ],
          "id": {
            "type": "Identifier",
            "range": [
              68,
              74
            ],
            "name": "__0"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              72,
              74
            ],
            "arguments": [
              {
                "type": "Literal",
                "range": [
                  72,
                  74
                ],
                "value": 10,
                "raw": "10"
              },
              {
                "type": "Literal",
                "range": [
                  68,
                  69
                ],
                "value": "__0"
              },
              {
                "type": "Literal",
                "range": [
                  72,
                  74
                ],
                "value": 1,
                "raw": "1"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                72,
                74
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  72,
                  74
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    72,
                    74
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    72,
                    74
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  72,
                  74
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "IfStatement",
      "range": [
        76,
        179
      ],
      "test": {
        "type": "BinaryExpression",
        "range": [
          80,
          87
        ],
        "operator": "==",
        "left": {
          "type": "Identifier",
          "range": [
            80,
            81
          ],
          "name": "__0"
        },
        "right": {
          "type": "Literal",
          "range": [
            85,
            87
          ],
          "value": 10,
          "raw": "10"
        }
      },
      "consequent": {
        "type": "BlockStatement",
        "range": [
          89,
          130
        ],
        "body": [
          {
            "type": "ExpressionStatement",
            "range": [
              91,
              128
            ],
            "expression": {
              "type": "CallExpression",

              "range": [
                91,
                128
              ],
              "arguments": [
                {
                  "type": "Literal",

                  "range": [
                    110,
                    126
                  ],
                  "value": "that's correct",
                  "raw": "\"that's correct\""
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  91,
                  128
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    91,
                    128
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      91,
                      128
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      91,
                      128
                    ],
                    "name": "functions"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    91,
                    128
                  ],
                  "name": "print"
                },
                "computed": false
              }
            }
          }
        ]
      },
      "alternate": {
        "type": "BlockStatement",
        "range": [
          136,
          179
        ],
        "body": [
          {
            "type": "ExpressionStatement",
            "range": [
              138,
              177
            ],
            "expression": {
              "type": "CallExpression",
              "range": [
                138,
                177
              ],
              "arguments": [
                {
                  "type": "Literal",
                  "range": [
                    157,
                    175
                  ],
                  "value": "that's incorrect",
                  "raw": "\"that's incorrect\""
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  138,
                  177
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    138,
                    177
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      138,
                      177
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      138,
                      177
                    ],
                    "name": "functions"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    138,
                    177
                  ],
                  "name": "print"
                },
                "computed": false
              }
            }
          }
        ]
      }
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return an IF clause AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("AST: For loop", function() {
  var code = 'public class ForClass { public static void main(String[] args) { for (int i = 0 ; i < 10; i++ ){ System.out.println(i); }}}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    24,
    122
  ],
  "body": [
    {
      "type": "ForStatement",
      "range": [
        65,
        121
      ],
      "init": {
        "type": "VariableDeclaration",
        "range": [
          70,
          79
        ],
        "kind": "var",
        "javaType": "int",
        "declarations": [
          {
            "type": "VariableDeclarator",
            "range": [
              74,
              79
            ],
            "id": {
              "type": "Identifier",
              "range": [
                74,
                79
              ],
              "name": "__0"
            },
            "init": {
              "type": "CallExpression",
              "range": [
                78,
                79
              ],
              "arguments": [
                {
                  "type": "Literal",
                  "range": [
                    78,
                    79
                  ],
                  "value": 0,
                  "raw": "0"
                },
                {
                  "type": "Literal",
                  "range": [
                    74,
                    75
                  ],
                  "value": "__0"
                },
                {
                  "type": "Literal",
                  "range": [
                    78,
                    79
                  ],
                  "value": 1,
                  "raw": "1"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  78,
                  79
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    78,
                    79
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      78,
                      79
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      78,
                      79
                    ],
                    "name": "functions"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    78,
                    79
                  ],
                  "name": "validateSet"
                },
                "computed": false
              }
            }
          }
        ]
      },
      "test": {
        "type": "BinaryExpression",
        "range": [
          82,
          88
        ],
        "operator": "<",
        "left": {
          "type": "Identifier",
          "range": [
            82,
            83
          ],
          "name": "__0"
        },
        "right": {
          "type": "Literal",
          "range": [
            86,
            88
          ],
          "value": 10,
          "raw": "10"
        }
      },
      "update": {
        "type": "AssignmentExpression",
        "range": [
          90,
          93
        ],
        "operator": "=",
        "left": {
          "type": "Identifier",
          "range": [
            90,
            91
          ],
          "name": "__0"
        },
        "right": {
          "type": "CallExpression",
          "range": [
            90,
            93
          ],
          "arguments": [
            {
              "type": "CallExpression",
              "range": [
                90,
                93
              ],
              "arguments": [
                {
                  "type": "Identifier",
                  "range": [
                    90,
                    91
                  ],
                  "name": "__0"
                },
                {
                  "type": "Literal",
                  "range": [
                    91,
                    93
                  ],
                  "value": 1,
                  "raw": "1"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  90,
                  93
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    90,
                    93
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      90,
                      93
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      90,
                      93
                    ],
                    "name": "ops"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    90,
                    93
                  ],
                  "name": "add"
                },
                "computed": false
              }
            },
            {
              "type": "Literal",
              "range": [
                90,
                91
              ],
              "value": "__0"
            },
            {
              "type": "Literal",
              "range": [
                90,
                93
              ],
              "value": 24,
              "raw": "24"
            }
          ],
          "callee": {
            "type": "MemberExpression",
            "range": [
              90,
              93
            ],
            "object": {
              "type": "MemberExpression",
              "range": [
                90,
                93
              ],
              "object": {
                "type": "Identifier",
                "range": [
                  90,
                  93
                ],
                "name": "___JavaRuntime"
              },
              "property": {
                "type": "Identifier",
                "range": [
                  90,
                  93
                ],
                "name": "functions"
              },
              "computed": false
            },
            "property": {
              "type": "Identifier",
              "range": [
                90,
                93
              ],
              "name": "validateSet"
            },
            "computed": false
          }
        }
      },
      "body": {
        "type": "BlockStatement",
        "range": [
          95,
          121
        ],
        "body": [
          {
            "type": "ExpressionStatement",
            "range": [
              97,
              119
            ],
            "expression": {
              "type": "CallExpression",
              "range": [
                97,
                119
              ],
              "arguments": [
                {
                  "type": "Identifier",
                  "range": [
                    116,
                    117
                  ],
                  "name": "__0"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  97,
                  119
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    97,
                    119
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      97,
                      119
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      97,
                      119
                    ],
                    "name": "functions"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    97,
                    119
                  ],
                  "name": "print"
                },
                "computed": false
              }
            }
          }
        ]
      }
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return an For loop AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });

describe("AST: While loop", function() {
  var code = 'public class WhileClass { public static void main(String[] args) { int i = 0; while(i < 10){ System.out.println(i); i = i +1; }}}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
  var ast =  {
  "type": "Program",
  "range": [
    26,
    128
  ],
  "body": [
    {
      "type": "VariableDeclaration",
      "range": [
        67,
        76
      ],
      "kind": "var",
      "javaType": "int",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "range": [
            71,
            76
          ],
          "id": {
            "type": "Identifier",
            "range": [
              71,
              76
            ],
            "name": "__0"
          },
          "init": {
            "type": "CallExpression",
            "range": [
              75,
              76
            ],
            "arguments": [
              {
                "type": "Literal",
                "range": [
                  75,
                  76
                ],
                "value": 0,
                "raw": "0"
              },
              {
                "type": "Literal",
                "range": [
                  71,
                  72
                ],
                "value": "__0"
              },
              {
                "type": "Literal",
                "range": [
                  75,
                  76
                ],
                "value": 1,
                "raw": "1"
              }
            ],
            "callee": {
              "type": "MemberExpression",
              "range": [
                75,
                76
              ],
              "object": {
                "type": "MemberExpression",
                "range": [
                  75,
                  76
                ],
                "object": {
                  "type": "Identifier",
                  "range": [
                    75,
                    76
                  ],
                  "name": "___JavaRuntime"
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    75,
                    76
                  ],
                  "name": "functions"
                },
                "computed": false
              },
              "property": {
                "type": "Identifier",
                "range": [
                  75,
                  76
                ],
                "name": "validateSet"
              },
              "computed": false
            }
          }
        }
      ]
    },
    {
      "type": "WhileStatement",
      "range": [
        78,
        127
      ],
      "test": {
        "type": "BinaryExpression",
        "range": [
          84,
          90
        ],
        "operator": "<",
        "left": {
          "type": "Identifier",
          "range": [
            84,
            85
          ],
          "name": "__0"
        },
        "right": {
          "type": "Literal",
          "range": [
            88,
            90
          ],
          "value": 10,
          "raw": "10"
        }
      },
      "body": {
        "type": "BlockStatement",
        "range": [
          91,
          127
        ],
        "body": [
          {
            "type": "ExpressionStatement",
            "range": [
              93,
              115
            ],
            "expression": {
              "type": "CallExpression",
              "range": [
                93,
                115
              ],
              "arguments": [
                {
                  "type": "Identifier",
                  "range": [
                    112,
                    113
                  ],
                  "name": "__0"
                }
              ],
              "callee": {
                "type": "MemberExpression",
                "range": [
                  93,
                  115
                ],
                "object": {
                  "type": "MemberExpression",
                  "range": [
                    93,
                    115
                  ],
                  "object": {
                    "type": "Identifier",
                    "range": [
                      93,
                      115
                    ],
                    "name": "___JavaRuntime"
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      93,
                      115
                    ],
                    "name": "functions"
                  },
                  "computed": false
                },
                "property": {
                  "type": "Identifier",
                  "range": [
                    93,
                    115
                  ],
                  "name": "print"
                },
                "computed": false
              }
            }
          },
          {
            "type": "ExpressionStatement",
            "range": [
              116,
              125
            ],
            "expression": {
              "type": "AssignmentExpression",
              "range": [
                116,
                125
              ],
              "operator": "=",
              "left": {
                "type": "Identifier",
                "range": [
                  116,
                  117
                ],
                "name": "__0"
              },
              "right": {
                "type": "CallExpression",
                "range": [
                  116,
                  125
                ],
                "arguments": [
                  {
                    "type": "CallExpression",
                    "range": [
                      120,
                      124
                    ],
                    "arguments": [
                      {
                        "type": "Identifier",
                        "range": [
                          120,
                          121
                        ],
                        "name": "__0"
                      },
                      {
                        "type": "Literal",
                        "range": [
                          123,
                          124
                        ],
                        "value": 1,
                        "raw": "1"
                      }
                    ],
                    "callee": {
                      "type": "MemberExpression",
                      "range": [
                        120,
                        124
                      ],
                      "object": {
                        "type": "MemberExpression",
                        "range": [
                          120,
                          124
                        ],
                        "object": {
                          "type": "Identifier",
                          "range": [
                            120,
                            124
                          ],
                          "name": "___JavaRuntime"
                        },
                        "property": {
                          "type": "Identifier",
                          "range": [
                            120,
                            124
                          ],
                          "name": "ops"
                        },
                        "computed": false
                      },
                      "property": {
                        "type": "Identifier",
                        "range": [
                          120,
                          124
                        ],
                        "name": "add"
                      },
                      "computed": false
                    }
                  },
                  {
                    "type": "Literal",
                    "range": [
                      116,
                      117
                    ],
                    "value": "__0"
                  },
                  {
                    "type": "Literal",
                    "range": [
                      116,
                      125
                    ],
                    "value": 32,
                    "raw": "32"
                  }
                ],
                "callee": {
                  "type": "MemberExpression",
                  "range": [
                    116,
                    125
                  ],
                  "object": {
                    "type": "MemberExpression",
                    "range": [
                      116,
                      125
                    ],
                    "object": {
                      "type": "Identifier",
                      "range": [
                        116,
                        125
                      ],
                      "name": "___JavaRuntime"
                    },
                    "property": {
                      "type": "Identifier",
                      "range": [
                        116,
                        125
                      ],
                      "name": "functions"
                    },
                    "computed": false
                  },
                  "property": {
                    "type": "Identifier",
                    "range": [
                      116,
                      125
                    ],
                    "name": "validateSet"
                  },
                  "computed": false
                }
              }
            }
          }
        ]
      }
    }
  ]
};
  ast = toASTNodes(cashew, ast);
  it("Should return a While loop AST", function() {
  expect(
      JSON.stringify(cleanAST(parsedAST)) === JSON.stringify(ast)
    ).toBe(true); 
    });
  });


// done

describe("AST: System.out.println", function() {
  var code= 'public class MyClass{/** main method */public static void main(String[]args){System.out.println(\"Type your code here\");}}';
  var Cashew = cashew.Cashew;
  var parsedAST = Cashew(code);
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
  ast = toASTNodes(cashew, ast);
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
//var parser = cashew.Cashew;
function toASTNodes(cashew, ast) {
  for (var k in ast) {
    if (typeof ast[k] == "object" && ast[k] !== null && ast[k] !== "Program") {
     // console.log("---"+ast[k]);
      //console.log("TESTE");
      if(!Array.isArray(ast[k]))
        ast[k] = toASTNodes(cashew, cashew.toNode(ast[k]));
      else 
        ast[k] = toASTNodes(cashew, ast[k]);
    }
  }
  return ast;
}
