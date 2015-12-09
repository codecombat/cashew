var cashew = require('../../cashew.js');
var escodegen = require('escodegen');

describe("Runtime: variable declaration and assigment", function() {
    function submitCode () {
        var code ='public class MyClass'
                  + '{' 
                  +   'public static String output()'
                  +    '{'
                  +      'int x = 10;'
                  +      'return x;' 
                  +    '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return MyClass.output();})(cashew.___JavaRuntime);";
        return js;
        }
  it("x should have 10", function() {
    expect(eval(submitCode())).toEqual(10);
  });
});
//
describe("Runtime: Logical operators and if/else", function() {
    function submitCode () {
        var code ='public class LogicalClass'
                  +   '{'
                  +   'public static String output()'
                  +     '{'
                  +      'boolean testTrue = true;'
                  +      'boolean testFalse = false;'
                  +      'if(testTrue && testFalse){'
                  +          'return "Print not Expected";'
                  +      '}else{'
                  +          'return "Print Expected";'
                  +      '}'
                  +      '}'
                  +   '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return LogicalClass.output();})(cashew.___JavaRuntime);";
        return js;
        }
     
  it("should print \"Print Expected\"" , function() {
    expect(eval(submitCode())).toEqual("Print Expected");
  });
});
//
describe("Runtime: Math operations", function() {
  
    function submitCode () {

        var code ='public class MathClass'
                   + '{'
                   +  'public static String output()'
                   + '{'
                   +     'int i1 = 10;'
                   +     'int i2 = 2;'
                   +     'int i4, i5, i6, i7, i8;'
                   +     'i4  = i1 + i2;'
                   +     'i5 = i1 - i2;'
                   +     'i6 = i1 * i2;'
                   +     'i7 = i1 / i2;'
                   +     'i8 = i1 % i2;'
                   +     'return i4+i5+i6-i7+i8;'
                   +  '}}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return MathClass.output();})(cashew.___JavaRuntime);";
        return js;
        }

  it("should equal \"35\"" , function() {
    expect(eval(submitCode())).toEqual(35);
  });
});
//
describe("Runtime: String concatenation", function() {
  
    function submitCode () {

        var code ='public class ConcatenationClass' 
                  + '{' 
                  +  'public static String output()'
                  +  '{' 
                  +    'String x = "String ";' 
                  +    'String y = "concatenation";' 
                  +    'x = x + y;' 
                  +    'return x;'
                  +  '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return ConcatenationClass.output();})(cashew.___JavaRuntime);";
        return js;
        }
  it("should print \"correct\"" , function() {
    expect(eval(submitCode())).toEqual("String concatenation");
  });
});
//
describe("Runtime: If-else clause", function() {
  
    function submitCode () {

        var code ='public class IfClass' 
                  + '{'
                  +  'public static String output()'
                  +  '{' 
                  +   'int a = 10;' 
                  +   'if (a == 10)' 
                  +     '{' 
                  +       'return "correct";'
                  +     '}'
                  +   'else' 
                  +     '{' 
                  +       'return "incorrect";' 
                  +     '}'
                  +  '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return IfClass.output();})(cashew.___JavaRuntime);";
        return js;
        }
  it("should print \"correct\"" , function() {
    expect(eval(submitCode())).toEqual("correct");
  });
});
//
describe("Runtime: For loop", function() {
  
    function submitCode () {

        var code ="public class ForClass"
                  +"{"
                  +"   public static String output()"
                  +   "{"
                  +       "int x = 0;"
                  +       "for (int i = 0 ; i < 10; i++ ){"
                  +           "x = x + i;"
                  +       "}"
                  +       "return x;"
                  +   "}"
                  +"}";
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return ForClass.output();})(cashew.___JavaRuntime);";
        return js;
        }

  it("x should be 45" , function() {
    expect(eval(submitCode())).toEqual(45);
    
  });
});
//
describe("Runtime: While Loop", function() {
  
    function submitCode () {

        var code ='public class WhileClass'
                  + '{'
                  +   'public static String output()'
                  +   '{'
                  +       'int i = 0;'
                  +       'while(i < 10){'
                  +           'i+= 1;'
                  +       '}'
                  +        'return i;' 
                  +     '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return WhileClass.output();})(cashew.___JavaRuntime);";
        return js;
        }

  it("i should be 10" , function() {
    expect(eval(submitCode())).toEqual(10);
  });
});
// Milestone 7
describe("Runtime: Two dimensions array", function() {
  
    function submitCode () {

        var code ='public class ArrayClass'
                  + '{'
                  +   'public static String output()'
                  +   '{'
                  +      'int[][] i = new int[3][2];'
                  +      'i[0][0] = 1;'
                  +      'i[0][1] = 1;'
                  +      'i[1][0] = 2;'
                  +      'i[1][1] = 2;'
                  +      'i[2][0] = 3;'
                  +      'i[2][1] = 3;'
                  +     'return i[2][1];'
                  +   '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return Array.output();})(cashew.___JavaRuntime);";
        return js;
        }

  it("i[2][1] should equal 3" , function() {
    expect(eval(submitCode())).toEqual(3);
  });
});
//
describe("Runtime: Ternary If", function() {
  
    function submitCode () {

        var code ='public class TernaryClass'
                  + '{'
                  +   'public static String output()'
                  +   '{'
                  +        'int i = 100;'
                  +        'i >= 100 ? return Correct" : return "Incorrect";' 
                  +   '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return TernaryClass.output();})(cashew.___JavaRuntime);";
        return js;
        }

  it("Should print \"Correct\"" , function() {
    expect(eval(submitCode())).toEqual("Correct");
  });
});

describe("Runtime: Switch", function() {
  
    function submitCode () {

        var code ='public class SwitchClass'
                  + '{'
                  +   'public static String output()'
                  +   '{'
                  +      'int i = 10;'
                  +      'switch(i){'
                  +         'case 0: return "That is zero";'
                  +         'case 1: return "That is one"; break;'
                  +         'default: return "That is not zero nor one";'
                  +   '}}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "return SwitchClass.output();})(cashew.___JavaRuntime);";
        return js;
        }

  it("Should print \"That is not zero nor one\"" , function() {
    expect(eval(submitCode())).toEqual("That is not zero nor one");
  });
});
