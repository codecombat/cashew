describe("Runtime: variable declaration and assigment", function() {
  beforeEach(function() {
        console.oldLog = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log = value;
    };
    function submitCode () {

        var code ='public class MyClass'
                  + '{' 
                  +  'public static void main(String[]args)'
                  +  '{'
                  +    'int x;' 
                  +    'x=10;' 
                  +    'System.out.println(x);'
                  +  '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("x should have 10", function() {
    expect($log).toEqual(10);
  });
});
//
describe("Runtime: Logical operators and if/else", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class LogicalClass'
                  +   '{'
                  +   'public static void main(String[] args)'
                  +     '{'
                  +      'boolean testTrue = true;'
                  +      'boolean testFalse = false;'
                  +      'if(testTrue && testFalse){'
                  +          'System.out.println("Print not Expected");'
                  +      '}else{'
                  +          'System.out.println("Print Expected");'
                  +      '}'
                  +      '}'
                  +   '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("should print \"Print Expected\"" , function() {
    expect($log01).toEqual("Print Expected");
  });
});
//
describe("Runtime: Math operations", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class MathClass'
                   + '{'
                   +  'public static void main(String[] args)'
                   + '{'
                   +     'int i1 = 10;'
                   +     'int i2 = 2;'
                   +     'int i4, i5, i6, i7, i8;'
                   +     'i4  = i1 + i2;'
                   +     'i5 = i1 - i2;'
                   +     'i6 = i1 * i2;'
                   +     'i7 = i1 / i2;'
                   +     'i8 = i1 % i2;'
                   +     'System.out.println(i4+i5+i6-i7+i8);'
                   +  '}}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("should equal \"35\"" , function() {
    expect($log01).toEqual(35);
  });
});
//
describe("Runtime: String concatenation", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class ConcatenationClass' 
                  + '{' 
                  +  'public static void main(String[] args)'
                  +  '{' 
                  +    'String x = "String ";' 
                  +    'String y = "concatenation";' 
                  +    'x = x + y;' 
                  +    'System.out.println(x);'
                  +  '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("should print \"correct\"" , function() {
    expect($log01).toEqual("String concatenation");
  });
});
//
describe("Runtime: If-else clause", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class IfClass' 
                  + '{'
                  +  'public static void main(String[] args)'
                  +  '{' 
                  +   'int a = 10;' 
                  +   'if (a == 10)' 
                  +     '{' 
                  +       'System.out.println(\"correct\");'
                  +     '}'
                  +   'else' 
                  +     '{' 
                  +       'System.out.println(\"incorrect\");' 
                  +     '}'
                  +  '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("should print \"correct\"" , function() {
    expect($log01).toEqual("correct");
  });
});
//
describe("Runtime: For loop", function() {
  beforeEach(function() {
        console.oldLog02 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log02 = value;
    };
    function submitCode () {

        var code ="public class ForClass"
                  +"{"
                  +"   public static void main(String[] args)"
                  +   "{"
                  +       "for (int i = 0 ; i < 10; i++ ){"
                  +           "System.out.println(i);"
                  +       "}"
                  +   "}"
                  +"}";
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("last \"i\" should be 9" , function() {
    expect($log02).toEqual(9);
  });
});
//
describe("Runtime: While Loop", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class WhileClass'
                  + '{'
                  +   'public static void main(String[] args)'
                  +   '{'
                  +       'int i = 0;'
                  +       'while(i < 10){'
                  +           'System.out.println(i);'
                  +           'i = i +1;'
                  +       '}}}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("last \"i\" should be 9" , function() {
    expect($log01).toEqual(9);
  });
});
// Milestone 7
describe("Runtime: Two dimensions array", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class ArrayClass'
                  + '{'
                  +   'public static void main(String[] args)'
                  +   '{'
                  +      'int[][] i = new int[3][2];'
                  +      'i[0][0] = 1;'
                  +      'i[0][1] = 1;'
                  +      'i[1][0] = 2;'
                  +      'i[1][1] = 2;'
                  +      'i[2][0] = 3;'
                  +      'i[2][1] = 3;'
                  +     'System.out.println(i[2][1]);'
                  +   '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("i[2][1] should equal 3" , function() {
    expect($log01).toEqual(3);
  });
});
//
describe("Runtime: Ternary If", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class TernaryClass'
                  + '{'
                  +   'public static void main(String[] args)'
                  +   '{'
                  +        'int i = 100;'
                  +        'i >= 100 ? System.out.println(“Correct”) : System.out.println(“Incorrect”);' 
                  +   '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("Should print \"Correct\"" , function() {
    expect($log01).toEqual("Correct");
  });
});

describe("Runtime: Switch", function() {
  beforeEach(function() {
        console.oldLog01 = console.log;
    console.log = function(value)
    {
        console.oldLog(value);
        window.$log01 = value;
    };
    function submitCode () {

        var code ='public class SwitchClass'
                  + '{'
                  +   'public static void main(String[] args)'
                  +   '{'
                  +      'int i1 = 10;'
                  +      'switch(i){'
                  +         'case 0: System.out.println(\"That is zero\");'
                  +         'case 1: System.out.println(\"That is one\"); break;'
                  +         'case default: System.out.println(\"That is not zero nor one\");'
                  +   '}'
                  + '}';
        var Cashew = cashew.Cashew;
        var parsedAST = Cashew(code);
        var js = escodegen.generate(parsedAST);
        js = "(function(___JavaRuntime){" + js + "})(cashew.___JavaRuntime);";
        return js;
        }
eval(submitCode());
  });
     
  it("Should print \"That is not zero nor one\"" , function() {
    expect($log01).toEqual("That is not zero nor one");
  });
});