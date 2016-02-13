// lexical grammar

%lex
%options ranges

D                 [0-9]
NZ                [1-9]
Ds                ("0"|{NZ}{D}*)
EXPO              ([Ee][+-]?{Ds})
BSL               "\\".
%s                comment

%%



"//".*                /* skip comments */
"/*"                  this.begin('comment');
<comment>"*/"         this.popState();
<comment>.            /* skip comment content*/
\s+                   /* skip whitespace */

"{"                   return 'EMBRACE'; /* Basic Syntax */
"}"                   return 'UNBRACE';
"("                   return 'LEFT_PAREN';
")"                   return 'RIGHT_PAREN';
"["                   return 'LEFT_BRACKET';
"]"                   return 'RIGHT_BRACKET';
","                   return 'COMMA';
"?"                   return 'QUESTION_MARK';
":"                   return 'COLON';
";"                   return 'LINE_TERMINATOR';

"System.out.println"  return "SYSOUT";
"System.out.print"  return "SYSOUT";
"sysout"              return "SYSOUT";


"public"              return 'public';
"private"             return 'private';

"static"              return 'static';
"main"                return 'main';

"final"               return 'final';

"void"                return 'void';

"package"             return 'KEYWORD_PACKAGE'; /* Keywords */
"import"              return 'KEYWORD_IMPORT';
"if"                  return 'KEYWORD_IF';
"else"                return 'KEYWORD_ELSE';
"while"               return 'KEYWORD_WHILE';
"do"                  return 'KEYWORD_DO';
"for"                 return 'KEYWORD_FOR';
"break"               return 'break';
"continue"            return 'continue';
"switch"              return 'switch';
"case"                return 'case';
"default"             return 'default';

"true"                return 'TRUE_LITERAL';
"false"               return 'FALSE_LITERAL';

"class"               return 'KEYWORD_CLASS';
"extends"             return 'KEYWORD_EXTENDS';
"interface"           return 'KEYWORD_INTERFACE';
"abstract"            return 'KEYWORD_ABSTRACT';
"this"                return 'KEYWORD_THIS';
"super"               return 'KEYWORD_SUPER';

"new"                 return 'KEYWORD_NEW';
"return"              return 'KEYWORD_RETURN';

"boolean"             return 'PRIMITIVE_BOOLEAN';
"int"                 return 'PRIMITIVE_INTEGER';
"double"              return 'PRIMITIVE_DOUBLE';
"String"              return 'STRING_TYPE';

"ArrayList"           return 'KEYWORD_ARRAYLIST';
"List"                return 'KEYWORD_LIST';

"java.util.ArrayList" return 'PACKAGE_ARRAYLIST';
"java.util.List"      return 'PACKAGE_LIST';
"java.util.*"         return 'PACKAGE_UTIL';

"<<"                  return 'OPERATOR_LEFTSHIFT';
">>>"                 return 'OPERATOR_ZEROFILL_RIGHTSHIFT';
">>"                  return 'OPERATOR_RIGHTSHIFT';
"<="                  return 'OPERATOR_LESS_THAN_EQUAL';
"<"                   return 'OPERATOR_LESS_THAN';
"=="                  return 'OPERATOR_EQUAL';
">="                  return 'OPERATOR_GREATER_THAN_EQUAL';
">"                   return 'OPERATOR_GREATER_THAN';
"!="                  return 'OPERATOR_NOT_EQUAL';
"||"                  return 'OPERATOR_LOGICAL_OR';
"|"                   return 'OPERATOR_INCLUSIVE_OR';
"^"                   return 'OPERATOR_XOR';
"&&"                  return 'OPERATOR_LOGICAL_AND';
"&"                   return 'OPERATOR_INCLUSIVE_AND';
"~"                   return 'OPERATOR_BITWISE_NEGATION';
"!"                   return 'OPERATOR_NEGATION';
"="                   return 'OPERATOR_ASSIGNMENT';
"+="                  return '+=';
"-="                  return '-=';
"*="                  return '*=';
"/="                  return '/=';
"%="                  return '%=';
"++"                  return 'OPERATOR_INCREMENT';
"+"                   return 'OPERATOR_ADDITION';
"--"                  return 'OPERATOR_DECREMENT';
"-"                   return 'OPERATOR_SUBTRACTION';
"*"                   return 'OPERATOR_MULTIPLICATION';
"/"                   return 'OPERATOR_DIVISON';
"%"                   return 'OPERATOR_MODULO';
"."                   return 'OPERATOR_CALL';

"null"                return 'NULL_LITERAL';

[A-Z][a-zA-Z0-9_]*   return 'CLASS_IDENTIFIER';
[a-zA-Z][a-zA-Z0-9_]*   return 'IDENTIFIER'; /* Varying form */
({Ds}"."{Ds}?{EXPO}?[fFdD]?|"."{Ds}{EXPO}?[fFdD]?|{Ds}{EXPO}[fFdD]?|{Ds}{EXPO}?[fFdD])/([^\w]|$)   return 'FLOATING_POINT_LITERAL';
{Ds}          return 'DECIMAL_INTEGER_LITERAL';
"\"\""                return 'STRING_LITERAL';
"\""([^"]|{BSL})*"\"" return 'STRING_LITERAL';

<<EOF>>               return 'EOF';
.                     return 'INVALID';

/lex

%right OPERATOR_ASSIGNMENT
%right TERNARY
%left OPERATOR_LOGICAL_OR
%left OPERATOR_LOGICAL_AND
%left OPERATOR_INCLUSIVE_OR
%left OPERATOR_XOR
%left OPERATOR_INCLUSIVE_AND
%left OPERATOR_EQUAL OPERATOR_NOT_EQUAL
%left OPERATOR_LESS_THAN OPERATOR_GREATER_THAN OPERATOR_LESS_THAN_EQUAL OPERATOR_GREATER_THAN_EQUAL
%left OPERATOR_LEFTSHIFT OPERATOR_RIGHTSHIFT OPERATOR_ZEROFILL_RIGHTSHIFT
%left OPERATOR_ADDITION OPERATOR_SUBTRACTION
%left OPERATOR_MULTIPLICATION OPERATOR_DIVISION OPERATOR_MODULO
%right OPERATOR_BITWISE_NEGATION OPERATOR_NEGATION
%right POST_INCREMENT POST_DECREMENT

// Start to read the file
%start compilation_unit

%% // language grammar

compilation_unit
  : EOF
    {
      return yy.ast.createRoot(null,@$.range);
    }
  | class_declarations EOF
    {
      return yy.ast.createRoot($1,@$.range);
    }
  | import_declarations class_declarations EOF
    {
      var rootNode = yy.ast.createRoot($2,@$.range);
      yy._.each($1, function(import){
        rootNode.body.splice(1,0,import);
      });
      return rootNode;
    }
  ;

import_declarations
  : import_declaration
    {
      $$ = [$1];
    }
  | import_declarations import_declaration
    { 
      $1.push($2);
      $$ = $1;
    }
  ;

import_declaration
  : KEYWORD_IMPORT package_name LINE_TERMINATOR
    {
      $$ = yy.createImportNodeForName($2);
    }
  ;

package_name
  : PACKAGE_ARRAYLIST
    {}
  | PACKAGE_LIST
    {}
  | PACKAGE_UTIL
    {}
  ;

// Lexical Structure

literal
  : integer_literal
    {
      $$ = $1;
    }
  | floating_point_literal
    {
      $$ = $1;
    }
  | boolean_literal
    {
      $$ = $1;
    }
  | string_literal
    {
      $$ = $1;
    }
  | null_literal
    {
      $$ = $1;
    }
  ;

integer_literal
  : DECIMAL_INTEGER_LITERAL
    {
      $$ = new yy.createLiteralNode(parseInt($1), $1, @$.range, "int");

    }
  ;

floating_point_literal
  : FLOATING_POINT_LITERAL
    {

      $$ = new yy.createLiteralNode(parseFloat($1), $1, @$.range, "double");
    }
  ;

boolean_literal
  : TRUE_LITERAL
    {
      $$ = new yy.createLiteralNode($1 == "true", $1, @$.range);
    }
  | FALSE_LITERAL
    {
      $$ = new yy.createLiteralNode($1 == "true", $1, @$.range);
    }
  ;

string_literal
  : STRING_LITERAL
    {
      var value = $1.replace("\"", "").replace("\"", "");
      $$ = new yy.createLiteralNode(value, $1, @$.range);
    }
  ;

null_literal
  : NULL_LITERAL
    {
      $$ = new yy.createLiteralNode(null, $1, @$.range);
    }
  ;


// Compilation Unit

class_declarations
  : class_interface_declaration
    { 
      $$ = [$1];
    }
  | class_declarations class_interface_declaration
    {
      $1.push($2);
      $$ = $1;
    }
  ;

class_interface_declaration
  : abstract_class_declaration
    {
      $$ = $1;
    }
  | class_declaration
    {
      $$ = $1;
    }
  | interface_declaration
    {
      $$ = $1;
    }
  ;

class_declaration
  : 'public' KEYWORD_CLASS CLASS_IDENTIFIER class_body
    { 
      var bodyNodes = $4;
      var variables = [];
      yy._.each(bodyNodes, function(bodyNode){
        if(bodyNode.type == "VariableDeclaration"){
          variables.push(bodyNode);
        }
      });
      $$ = yy.createSimpleClassDeclarationNode($3, @3.range, bodyNodes, @4.range, @$.range);
    }
  | 'public' KEYWORD_CLASS CLASS_IDENTIFIER KEYWORD_EXTENDS CLASS_IDENTIFIER class_body
    {
      var bodyNodes = $6;
      var variables = [];
      yy._.each(bodyNodes, function(bodyNode){
        if(bodyNode.type == "VariableDeclaration"){
          variables.push(bodyNode);
        }
      });
      $$ = yy.createClassExtendedDeclarationNode($3, @3.range, $6, @6.range, $5, @5.range, @$.range);
    }
  | KEYWORD_CLASS CLASS_IDENTIFIER class_body 
    {
      var bodyNodes = $3;
      var variables = [];
      yy._.each(bodyNodes, function(bodyNode){
        if(bodyNode.type == "VariableDeclaration"){
          variables.push(bodyNode);
        }
      });
      $$ = yy.createSimpleClassDeclarationNode($2, @2.range, $3, @3.range, @$.range);
    }
  | KEYWORD_CLASS CLASS_IDENTIFIER KEYWORD_EXTENDS CLASS_IDENTIFIER class_body
    {
      var bodyNodes = $5;
      var variables = [];
      yy._.each(bodyNodes, function(bodyNode){
        if(bodyNode.type == "VariableDeclaration"){
          variables.push(bodyNode);
        }
      });
      $$ = yy.createClassExtendedDeclarationNode($2, @2.range, $5, @5.range, $4, @4.range, @$.range);
    }
  ;

// Modifiers

modifiers
  : modifier
    {
      $$ = [$1];
    }
  | modifiers modifier
    {
      $1.push($2);
      $$ = $1;
    }
  ;

modifier
  : 'public'
    {
      $$ = $1;
    }
  | 'private'
    {
      $$ = $1;
    }
  | 'static'
    {
      $$ = $1;
    }
  | 'final'
    {
      $$ = $1;
    }
  ;

// Class

class_body
  : EMBRACE class_body_declarations UNBRACE 
    {
      $$ = $2;
    }
  | EMBRACE UNBRACE
    {
      $$ = [];
    }
  ;

class_body_declarations
  : class_body_declaration
    {
      if($1.constructor == Array){
        $$ = $1
      }else{
        $$ = [$1];
      }
    }
  | class_body_declarations class_body_declaration
    {
      if($2.constructor == Array){
        //do nothing since array will only be the creation of the constructor
      }else{
        $1.push($2)
      }
      $$ = $1;
    }
  ;

class_body_declaration
  : class_member_declaration
    {
      $$ = $1;
    }
  ;

class_member_declaration
  : constructor_declaration
    {
      $$ = [];
    }
  | field_declaration
    {
      $$ = $1;
    }
  | method_declaration
    {
      $$ = $1;
    }
  ;

// Class Member Declarations

field_declaration
  : variable_declaration LINE_TERMINATOR
    {
      $$ = yy.createFieldVariableNode(null, $1, @$.range);
    }
  | modifiers variable_declaration LINE_TERMINATOR
    {
      $$ = yy.createFieldVariableNode($1, $2, @$.range);
    }
  ;

method_declaration
  : method_header method_body
    {
      $$ = yy.createMethodDeclarationNode($1, @1.range, $2, @2.range, @$.range);
    }
  ;

// Constructor declarations
constructor_declaration
  : modifiers CLASS_IDENTIFIER LEFT_PAREN RIGHT_PAREN method_body
    {
      var signature = $2 + $3 + $4;
      var details = yy.createMethodSignatureObject($2, signature, [], @$.range)
      $5.details = details;
      yy.createOverrideDefaultConstructor($1, $5);
    }
  | modifiers CLASS_IDENTIFIER LEFT_PAREN formal_parameter_list RIGHT_PAREN method_body
    {
      var paramList = "";
      yy._.each($4, function(param){
        paramList += param.type + " ";
      });
      paramList = paramList.trim();
      var signature = $2 + $3 + paramList + $5;
      var details = yy.createMethodSignatureObject($2, signature, $4, @$.range)
      $6.details = details;
      yy.createOverrideDefaultConstructor($1, $6);
    }
  ;

// Method Declarations

method_header
  : modifiers type method_declarator
    {
      var modifiersText = "";
      var modifiers = [];
      _.each($1, function(modifier){
          modifiersText += (modifier + ' ');
          modifiers.push(modifier);
      });
      $3.returnType = $2;
      $3.modifiers = modifiers;
      $$ = $3;
    } 
  | modifiers 'void' method_declarator
    { 
      var modifiersText = "";
      var modifiers = [];
      _.each($1, function(modifier){
          modifiersText += (modifier + ' ');
          modifiers.push(modifier);
      });
      $3.returnType = $2;
      $3.modifiers = modifiers;
      $$ = $3;
    }
  ;

method_declarator
  : 'main' LEFT_PAREN STRING_TYPE LEFT_BRACKET RIGHT_BRACKET IDENTIFIER  RIGHT_PAREN
    { 
      var signature = $1 +  $2 + $3 + $4 + $5 + " " + $6 + $7;
      $$ = yy.createMethodSignatureObject($1, signature, null, @$.range);
      $$.params = [];
    } 
  | IDENTIFIER LEFT_PAREN formal_parameter_list RIGHT_PAREN
    {
      var paramList = "";
      yy._.each($3, function(param){
        paramList += param.type + " ";
      });
      paramList = paramList.trim();
      var signature = $1 + $2 + paramList + $4;
      $$ = yy.createMethodSignatureObject($1, signature, $3, @$.range);
      $$.params = $3;
    }
  | IDENTIFIER LEFT_PAREN RIGHT_PAREN
    {
      var signature = $1 +  $2 + $3;
      $$ = yy.createMethodSignatureObject($1, signature, null, @$.range);
      $$.params = [];
    }
  ;

formal_parameter_list
  : formal_parameter
    {
      $$ = [$1];
    }
  | formal_parameter_list COMMA formal_parameter
    {
      $1.push($3); 
      $$ = $1; 
    }
  ;

formal_parameter
  : type variable_declarator_id
    {
      $$ = {'type' : $1, 'paramName' : $2, 'range' : @$.range};
    }
  | type LEFT_BRACKET RIGHT_BRACKET variable_declarator_id
    {
      $$ = {'type' : $1 + $2 + $3, 'paramName' : $4, 'range' : @$.range};
    }
  | type LEFT_BRACKET RIGHT_BRACKET LEFT_BRACKET RIGHT_BRACKET variable_declarator_id
    {
      $$ = {'type' : $1 + $2 + $3 + $4 + $5, 'paramName' : $6, 'range' : @$.range};
    }

  ;

method_body
  : block
    { 
      $$ = $1;
    }
  ;

// Type

type
  : primitive_type
    {}
  | STRING_TYPE
    {} 
  | CLASS_IDENTIFIER
    {}
  ;

primitive_type
  : numeric_type
    {}
  | PRIMITIVE_BOOLEAN
    {}
  ;

numeric_type
  : integral_type
    {}
  | floating_point_type
    {}
  ;

integral_type
  : PRIMITIVE_INTEGER 
    {}
  ;

floating_point_type
  : PRIMITIVE_DOUBLE
    {}
  ;

list_type
  : KEYWORD_ARRAYLIST
    {}
  | KEYWORD_LIST
    {}
  ;

// Blocks

block
  : EMBRACE UNBRACE
    { 
      $$ = [];
    }
  | EMBRACE block_statements UNBRACE
    {
      var blockStatements = yy._.flatten($2);
      var variables = [];
        yy._.each(blockStatements, function(statements){
          if(statements.type == "VariableDeclaration"){
            variables.push(statements);
          }
        });
      $$ = blockStatements;

    }
  ;

block_statements
  : block_statement
    { 
      $$ = [$1];
    }
  | block_statements block_statement
    { 
      $1.push($2); 
      $$ = $1; 
    }
  ;

block_statement
  : variable_declaration_statement
    { 
      $$ = $1;
    }
  | statement
    { 
      $$ = $1;
    }
  ;

variable_declaration_statement
  : variable_declaration LINE_TERMINATOR
    { 
      $$ = $1;
    }
  ;

// Statements 

statement
  : statement_without_trailing_substatement
    { 
      $$ = $1;
    }
  | if_then_statement
    { 
      $$ = $1;
    }
  | if_then_else_statement
    {
      $$ = $1;
    }
  | while_statement
    {
      $$ = $1;
    }
  | for_statement
    {
      $$ = $1;
    }
  ;

statement_without_trailing_substatement
  : block
    {
      $$ = $1;
    }
  | empty_statement
    { 
      $$ = $1;
    }    
  | expression_statement
    {
      $$ = $1;
    }
  | switch_statement
    {
      $$ = $1;
    }
  | do_statement
    {
      $$ = $1;
    }
  | break_statement
    {
      $$ = $1;
    }
  | log_statement
    { 
      $$ = yy.createExpressionStatementNode($1, @$.range); 
    }
  | continue_statement
    {
      $$ = $1;
    }
  | return_statement
    {
      $$ = $1;
    }
  // TODO throw_statement
  // TODO try_statement
  ;

empty_statement
  : LINE_TERMINATOR
    {
      $$ = yy.createEmptyStatement(@$.range);
    }
  ;

expression_statement
  : statement_expression LINE_TERMINATOR
    {
      $$ = $1;
    }
  | method_invocation LINE_TERMINATOR
    {
      $$ = yy.createExpressionStatementNode($1, @$.range);
    }
  ;

//FIXME: Return without any validation so we can integrate with Aether
return_statement
  : KEYWORD_RETURN expression LINE_TERMINATOR
    {
      $$ = yy.createReturnStatementNode($2, @$.range);
    }
  | KEYWORD_RETURN LINE_TERMINATOR
    {
      $$ = yy.createReturnStatementNode(null, @$.range);
    }
  ;

break_statement
  : 'break' LINE_TERMINATOR
    {
      $$ = yy.createBreakStatement(@$.range);
    }
  ;

continue_statement
  : 'continue' LINE_TERMINATOR
    {
      $$ = yy.createContinueStatement(@$.range);
    }
  ;

log_statement
  : SYSOUT 'LEFT_PAREN' expression 'RIGHT_PAREN' 'LINE_TERMINATOR'
    {
      $$ = yy.createConsoleLogExpression($1,$3, @$.range);
    }
  ;

statement_expression
  : pre_increment_expression
    {
      $$ = $1;
    }
  | pre_decrement_expression
    {
      $$ = $1;
    }
  | post_increment_expression
    {
      $$ = $1;
    }
  | post_decrement_expression
    {
      $$ = $1;
    }
  | assignment
    {
      $$ = $1;
    }
  ;

//Just using the side effect of the increment-decrement operators
pre_increment_expression
  : OPERATOR_INCREMENT postfix_expression %prec PRE_INCREMENT
    {
      var incrementOne = new yy.createLiteralNode(parseInt('1'), '1', @1.range, "int");
      var addExpression = yy.createMathOperation('+', $2, incrementOne, @$.range);
      $$ = yy.createVariableAttribution($2.name, @2.range, @$.range, addExpression);
    }
  ;

pre_decrement_expression
  : OPERATOR_DECREMENT postfix_expression  %prec PRE_DECREMENT
    {
      var decrementOne = new yy.createLiteralNode(parseInt('1'), '1', @1.range, "int");
      var subExpression = yy.createMathOperation('-', $2, decrementOne, @$.range);
      $$ = yy.createVariableAttribution($2.name, @2.range, @$.range, subExpression);
    }
  ;

post_increment_expression
  : postfix_expression OPERATOR_INCREMENT %prec POST_INCREMENT
    {
      var incrementOne = new yy.createLiteralNode(parseInt('1'), '1', @2.range, "int");
      var addExpression = yy.createMathOperation('+', $1, incrementOne, @$.range);
      $$ = yy.createVariableAttribution($1.name, @1.range, @$.range, addExpression);
    }
  ;

post_decrement_expression
  : postfix_expression OPERATOR_DECREMENT %prec POST_DECREMENT
    {
      var decrementOne = new yy.createLiteralNode(parseInt('1'), '1', @2.range, "int");
      var subExpression = yy.createMathOperation('-', $1, decrementOne, @$.range);
      $$ = yy.createVariableAttribution($1.name, @1.range, @$.range, subExpression);
    }
  ;

// Variable Declarators

variable_declaration
  : type variable_declarators
    {
      $$ = yy.createVarDeclarationNode($1, $2, @$.range);
    }
  | type LEFT_BRACKET RIGHT_BRACKET LEFT_BRACKET RIGHT_BRACKET array_declarators
    {
      $$ = yy.createVarDeclarationNode($1 + $2 + $3 + $4 + $5, $6, @$.range);
    }
  | type LEFT_BRACKET RIGHT_BRACKET array_declarators
    {
      $$ = yy.createVarDeclarationNode($1 + $2 + $3, $4, @$.range);
    }
  | list_type OPERATOR_LESS_THAN type OPERATOR_GREATER_THAN arraylist_declarator
    {
      // TODO: yy.validateArrayListTypes($3, $5);
      $$ = yy.createVarDeclarationNode($3, $5, @$.range);
    }
  ;

variable_declarators
  : variable_declarator
    {
      $$ = [$1];
    }
  | variable_declarators COMMA variable_declarator
    {
      $1.push($3); 
      $$ = $1;
    }
  ;


variable_declarator
  : variable_declarator_id
    {
      $$ = yy.createVarDeclaratorNodeNoInit($1, @$.range);
    }
  | variable_initializer
    {
      $$ = $1;
    }
  ;

variable_declarator_id
  : IDENTIFIER
    {
      $$ = $1;
    }
  ;

variable_initializer
  : variable_declarator_id OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVarDeclaratorNodeWithInit($1, @1.range, $3, @3.range, @$.range);
    }
  ;


array_declarators
  : array_declarator
    {
      $$ = [$1];
    }
  | array_declarators COMMA array_declarator
    {
      $1.push($3); 
      $$ = $1;
    }
  ;

array_declarator
  : array_declarator_id
    {
      $$ = yy.createVarDeclaratorNodeNoInit($1, @$.range);
    }
  | array_initializer
    {
      $$ = $1;
    }
  ;

array_declarator_id
  : IDENTIFIER
    {
      $$ = $1;
    }
  ;

array_initializer
  : array_declarator_id OPERATOR_ASSIGNMENT array_expression
    {
      $$ = yy.createArrayWithInitNode($1, @1.range, $3, @$.range);
    }
  ;

array_expression
  : KEYWORD_NEW type LEFT_BRACKET expression RIGHT_BRACKET LEFT_BRACKET expression RIGHT_BRACKET
    {
      $$ = yy.createTwoDimensionalArray([$4, $7], @$.range);
    }
  | KEYWORD_NEW type LEFT_BRACKET expression RIGHT_BRACKET 
    {
      $$ = yy.createArrayWithNullInitialization($4, @$.range);
    }
  | EMBRACE primary_expression_list UNBRACE
    {
      $$ = yy.createArrayFromInitialArray($2, @$.range);
    }
  | KEYWORD_NEW type LEFT_BRACKET RIGHT_BRACKET EMBRACE primary_expression_list UNBRACE
    {
      $$ = yy.createArrayFromInitialArray($6, @$.range);
    }
  | KEYWORD_NEW type LEFT_BRACKET RIGHT_BRACKET LEFT_BRACKET RIGHT_BRACKET EMBRACE primary_expression_list UNBRACE
    {
      $$ = yy.createArrayFromInitialArray($8, @$.range);
    }
  ;
 
arraylist_declarator
  : arraylist_declarator_id
    {
      $$ = yy.createSimpleListNode($1, @$.range);
    }
  | arraylist_initializer
    {
      $$ = $1;
    }
  ;

arraylist_declarator_id
  : IDENTIFIER
    {
      $$ = $1;
    }
  ;

arraylist_initializer
  : arraylist_declarator_id OPERATOR_ASSIGNMENT arraylist_expression
    {
      $$ = yy.createListWithInitNode($1, @1.range, $3, @$.range);
    }
  ;

arraylist_expression
  : KEYWORD_NEW list_type OPERATOR_LESS_THAN type OPERATOR_GREATER_THAN LEFT_PAREN RIGHT_PAREN
    { 
      $$ = yy.createListInitialization($4, @$.range);
    }
  ;

primary_expression_list
  : primary_expression_value
    {
      $$ = [$1];
    }
  | primary_expression_list COMMA primary_expression_value
    {
      $1.push($3); 
      $$ = $1;
    }
  ;

primary_expression_value
  : expression 
    {
      $$ = $1;
    }
  | EMBRACE primary_expression_list UNBRACE
    {
      $$ = $2;
    }
  ;

assignment
  : variable_invocation OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $3);
    }
  | IDENTIFIER OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $3);
    }
  | variable_invocation '+=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('+', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '+=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('+', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | variable_invocation '-=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('-', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '-=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('-', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | variable_invocation '*=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('*', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '*=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('*', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | variable_invocation '/=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('/', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '/=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('/', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | variable_invocation '%=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('%', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '%=' expression
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('%', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | variable_invocation LEFT_BRACKET expression RIGHT_BRACKET LEFT_BRACKET expression RIGHT_BRACKET OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $9, $3, $6);
    }
  | IDENTIFIER LEFT_BRACKET expression RIGHT_BRACKET LEFT_BRACKET expression RIGHT_BRACKET OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $9, $3, $6);
    }
  | variable_invocation LEFT_BRACKET expression RIGHT_BRACKET OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $6, $3);
    }
  | IDENTIFIER LEFT_BRACKET expression RIGHT_BRACKET OPERATOR_ASSIGNMENT expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $6, $3);
    }
  | variable_invocation LEFT_BRACKET expression RIGHT_BRACKET OPERATOR_ASSIGNMENT array_expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $6, $3);
    }
  | IDENTIFIER LEFT_BRACKET expression RIGHT_BRACKET OPERATOR_ASSIGNMENT array_expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $6, $3);
    }
  | variable_invocation OPERATOR_ASSIGNMENT array_expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $3);
    }
  | IDENTIFIER OPERATOR_ASSIGNMENT array_expression
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $3);
    }
  ;

constructor_call
  : KEYWORD_NEW CLASS_IDENTIFIER LEFT_PAREN RIGHT_PAREN
    {
      $$ = yy.createConstructorCall($2, @2.range,[], @$.range);
    }
  | KEYWORD_NEW CLASS_IDENTIFIER LEFT_PAREN parameter_list RIGHT_PAREN
    {
      $$ = yy.createConstructorCall($2, @2.range, $4, @$.range);
    }
  | KEYWORD_NEW STRING_TYPE LEFT_PAREN parameter RIGHT_PAREN
    {
      $$ = $4;
    }
  ;

// Names

name
  : method_invocation
    {
      $$ = $1;
    }
  | IDENTIFIER
    { 
      $$ = yy.createIdentifierNode($1, @$.range); 
    }
  | IDENTIFIER LEFT_BRACKET expression RIGHT_BRACKET LEFT_BRACKET expression RIGHT_BRACKET
    {
      $$ = yy.createArrayIdentifierNode($1, @1.range, $3, @3.range, $6, @6.range, @$.range);
    }
  | IDENTIFIER LEFT_BRACKET expression RIGHT_BRACKET
    {
      $$ = yy.createArrayIdentifierNode($1, @1.range, $3, @3.range, null, null, @$.range);
    }
  ;

// Expressions 

expression
  : assignment_expression
    { 
      $$ = $1;
    }
  ;

  assignment_expression
  : conditional_expression
    {
      $$ = $1;
    } 
  | assignment LINE_TERMINATOR
    {
      $$ = $1;
    }
  ;

conditional_expression
  : conditional_or_expression
    { 
      $$ = $1; 
    }
  | conditional_or_expression QUESTION_MARK expression COLON conditional_expression %prec TERNARY
    {
      $$ = yy.createTernaryNode($1, $3, $5, @$.range);
    }
  ;

conditional_or_expression
  : conditional_and_expression
    {
      $$ = $1;
    }
  | conditional_or_expression OPERATOR_LOGICAL_OR conditional_and_expression
    {
      $$ = yy.createExpression($2, "LogicalExpression", $1, $3, @$.range);
    }
  ;

conditional_and_expression
  : inclusive_or_expression
    { 
      $$ = $1; 
    }
  | conditional_and_expression OPERATOR_LOGICAL_AND inclusive_or_expression
    {
      $$ = yy.createExpression($2, "LogicalExpression", $1, $3, @$.range);
    }
  ;

inclusive_or_expression
  : exclusive_or_expression
    { 
      $$ = $1; 
    }
  | inclusive_or_expression OPERATOR_INCLUSIVE_OR exclusive_or_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  ;

exclusive_or_expression
  : and_expression
    { 
      $$ = $1; 
    }
  | exclusive_or_expression OPERATOR_XOR and_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  ;

and_expression
  : equality_expression
    { 
      $$ = $1; 
    }
  | and_expression OPERATOR_INCLUSIVE_AND equality_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  ;

equality_expression
  : relational_expression
    { 
      $$ = $1; 
    }
  | equality_expression OPERATOR_EQUAL relational_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  | equality_expression OPERATOR_NOT_EQUAL relational_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  ;

relational_expression
  : shift_expression
    { 
      $$ = $1; 
    }
  | relational_expression OPERATOR_LESS_THAN shift_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  | relational_expression OPERATOR_LESS_THAN_EQUAL shift_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  | relational_expression OPERATOR_GREATER_THAN shift_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  | relational_expression OPERATOR_GREATER_THAN_EQUAL shift_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  ;

shift_expression
  : additive_expression
    { 
      $$ = $1; 
    }
  | shift_expression OPERATOR_LEFTSHIFT additive_expression
    {
       $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  | shift_expression OPERATOR_RIGHTSHIFT additive_expression
    {
       $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  | shift_expression OPERATOR_ZEROFILL_RIGHTSHIFT additive_expression
    {
       $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  ;

additive_expression
  : multiplicative_expression
    { 
      $$ = $1; 
    }
  | additive_expression OPERATOR_ADDITION multiplicative_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  | additive_expression OPERATOR_SUBTRACTION multiplicative_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  ;

multiplicative_expression
  : unary_expression
    {
      $$ = $1;
    }
  | multiplicative_expression OPERATOR_MULTIPLICATION unary_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  | multiplicative_expression OPERATOR_DIVISON unary_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  | multiplicative_expression OPERATOR_MODULO unary_expression
    {
      $$ = yy.createMathOperation($2, $1, $3, @$.range);
    }
  ;

unary_expression
  : postfix_expression
    { 
      $$ = $1; 
    }
  | OPERATOR_SUBTRACTION unary_expression
    {
      $$ = yy.createUnaryExpression($1, $2, @$.range);
    }
  | OPERATOR_BITWISE_NEGATION unary_expression
    {
      $$ = yy.createUnaryExpression($1, $2, @$.range);
    }
  | OPERATOR_NEGATION unary_expression
    {
      $$ = yy.createUnaryExpression($1, $2, @$.range);
    }
  | cast_expression
    {}
  ;

postfix_expression
  : primary
    { 
      $$ = $1; 
    }
  | name
    { 
      $$ = $1;
    }
  ;

primary
  : literal
    {
      $$ = $1;
    }
  | constructor_call
    {
      $$ = $1;
    }
  | LEFT_PAREN expression RIGHT_PAREN
    {
      $$ = $2;
    }
  | KEYWORD_THIS
    {
      $$ = yy.createIdentifierNode("__ref", @$.range);
    }
  ;

method_invocation
  : simple_method_invocation
    {
      $$ = $1;
    }
  | property_invocation
    {
      $$ = $1;
    }
  ;

property_invocation
  : static_method_invocation
    {
      $$ = $1;
    }
  | instance_method_invocation
    {
      $$ = $1;
    }
  | super_method_invocation
    {
      $$ = $1;
    }
  | variable_invocation
    {
      $$ = $1;
    }
  ;

variable_invocation
  : CLASS_IDENTIFIER OPERATOR_CALL IDENTIFIER
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  | primary OPERATOR_CALL IDENTIFIER
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  | IDENTIFIER OPERATOR_CALL IDENTIFIER
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  | method_invocation OPERATOR_CALL IDENTIFIER
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  ;

static_method_invocation
  : CLASS_IDENTIFIER OPERATOR_CALL simple_method_invocation
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  ;

super_method_invocation
  : KEYWORD_SUPER OPERATOR_CALL simple_method_invocation
    {
      $$ = yy.createSuperInvokeNode($3, @1.range, @$.range);
    }
  | KEYWORD_SUPER LEFT_PAREN RIGHT_PAREN
    {
      $$ = yy.createSuperConstructorNode(@1.range, [], @$.range);
    }
  | KEYWORD_SUPER LEFT_PAREN parameter_list RIGHT_PAREN
    {
      $$ = yy.createSuperConstructorNode(@1.range, $3, @$.range);
    }
  ;

instance_method_invocation
  : IDENTIFIER OPERATOR_CALL simple_method_invocation
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  | primary OPERATOR_CALL simple_method_invocation
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  | method_invocation OPERATOR_CALL simple_method_invocation
    {
      $$ = yy.createInvokeNode($1, @1.range, $3, @3.range, @$.range);
    }
  ;


simple_method_invocation
  : IDENTIFIER LEFT_PAREN RIGHT_PAREN
    {
      $$ = yy.createSimpleMethodInvokeNode($1, @1.range, [], @$.range);
    }
  | IDENTIFIER LEFT_PAREN parameter_list RIGHT_PAREN
    {
      $$ = yy.createSimpleMethodInvokeNode($1, @1.range, $3, @$.range);
    }
  ;

parameter_list
  : parameter
    {
      $$ = [$1];
    }
  | parameter_list COMMA parameter
    {
      $1.push($3); 
      $$ = $1;
    }
  ;

parameter
  : expression
    {
      $$ = $1;
    }
  ;

cast_expression
  : LEFT_PAREN type RIGHT_PAREN unary_expression
    {
      $$ = yy.createClassCastNode($2, @2.range, $4, @$.range);
    }
  ;

while_statement
  : KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN statement
    {
      $$ = yy.createSimpleWhileNode($3, $5, @5.range, @$.range);
    }
  ;

do_statement
  : KEYWORD_DO statement KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN LINE_TERMINATOR
    {
      $$ = yy.createDoWhileNode($4, $2, @2.range, @$.range);
    }
  ;

for_statement
  : KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR for_update RIGHT_PAREN statement
    { 
      $$ = yy.createForStatement($3, $5, $7, @7.range, $9, @9.range, @$.range);
    }
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR expression LINE_TERMINATOR for_update RIGHT_PAREN statement
    { 
      $$ =  yy.createForStatement(null, $4, $6, @6.range, $8, @8.range, @$.range);
    }
  | KEYWORD_FOR LEFT_PAREN type IDENTIFIER COLON IDENTIFIER RIGHT_PAREN statement
    {
      $$ = yy.createEnhancedForStatement($3, $4, @4.range, $6, @6.range, $8, @8.range, @$.range);
    }
  ;


for_init
  : statement_expression_list
    {
      $$ = $1;
    }
  | variable_declaration
    {
      $$ = $1;
    }
  ;

for_update
  : statement_expression_list
    {
      $$ = $1;
    }
  ;

statement_expression_list
  : statement_expression
    {
      $$ = [$1];
    }
  | statement_expression_list COMMA statement_expression
    {
      $1.push($3);
      $$ = $1;
    }
  ;

if_then_statement
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement
    {
      $$ = yy.createSimpleIfNode($3, $5, @5.range, @$.range);
    }
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN if_then_statement
    {
      $$ = yy.createSimpleIfNode($3, $5, @5.range, @$.range);
    }
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN if_then_else_statement
    {
      $$ = yy.createSimpleIfNode($3, $5, @5.range, @$.range);
    }
  ;

if_then_else_statement
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement KEYWORD_ELSE statement
    {
      $$ = yy.createSimpleIfElseNode($3, $5, @5.range, $7, @7.range, @$.range);
    }
  ;

switch_statement
  : 'switch' LEFT_PAREN expression RIGHT_PAREN switch_block
    {
      $$ = yy.createSwitchNode($3, $5, @$.range);
    }
  ;

switch_block
  : EMBRACE UNBRACE
    {
      $$ = [];
    }
  | EMBRACE switch_block_statement_groups switch_labels UNBRACE
    {
      var blockStatements = yy._.flatten($2);
      blockStatements = blockStatements.concat($3);
      $$ = blockStatements;
    }
  | EMBRACE switch_labels UNBRACE
    {
      $$ = $2;
    }
  | EMBRACE switch_block_statement_groups UNBRACE
    {
      var blockStatements = yy._.flatten($2);
      $$ = blockStatements;
    }
  ;

switch_block_statement_groups
  : switch_block_statement_group
    {
      $$ = [$1];
    }
  | switch_block_statement_groups switch_block_statement_group
    {
      $1.push($2);
      $$ = $1;
    }
  ;

switch_block_statement_group
  : switch_labels block_statements
    {
      $$ = yy.addSwitchCaseStatements($1, $2);
    }
  ;

switch_labels
  : switch_label
    {
      $$ = [$1];
    }
  | switch_labels switch_label
    {
      $1.push($2);
      $$ = $1;
    }
  ;

switch_label
  : 'case' constant_expression COLON
    {
      $$ = yy.createCaseSwitchNode($2, @$.range);
    }
  | 'default' COLON
    {
      $$ = yy.createDefaultSwitchNode(@$.range);
    }
  ;

constant_expression
  : expression
    {
      $$ = $1;
    }
  ;