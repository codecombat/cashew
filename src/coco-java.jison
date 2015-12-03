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
"new"                 return 'KEYWORD_NEW';
"return"              return 'KEYWORD_RETURN';

"boolean"             return 'PRIMITIVE_BOOLEAN';
"int"                 return 'PRIMITIVE_INTEGER';
"double"              return 'PRIMITIVE_DOUBLE';
"String"              return 'STRING_TYPE';

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

"null"                return 'NULL_LITERAL';

[a-zA-Z][a-zA-Z0-9_]*   return 'IDENTIFIER'; /* Varying form */
({Ds}"."{Ds}?{EXPO}?[fFdD]?|"."{Ds}{EXPO}?[fFdD]?|{Ds}{EXPO}[fFdD]?|{Ds}{EXPO}?[fFdD])/([^\w]|$)   return 'FLOATING_POINT_LITERAL';
{Ds}[lL]?\b           return 'DECIMAL_INTEGER_LITERAL';
"\"\""                return 'STRING_LITERAL';
"\""([^"]|{BSL})*"\"" return 'STRING_LITERAL';
"."                   return 'SEPARATOR_DOT';

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
     
     //yy.ast.insert($1);
    }
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
      $$ = new yy.createLiteralNode(parseInt($1), $1, @$.range);

    }
  ;

floating_point_literal
  : FLOATING_POINT_LITERAL
    {
      $$ = new yy.createLiteralNode(parseFloat($1), $1, @$.range);
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
  : class_declaration
    { 
      $$ = [$1];
    }
  | class_declarations class_declaration
    {
    }
  ;

class_declaration
  : 'public' KEYWORD_CLASS IDENTIFIER class_body
    { 
      $$ = $4;
    }
  | KEYWORD_CLASS IDENTIFIER class_body
    {}
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
  ;

class_body_declarations
  : class_body_declaration
    {
      $$ = [$1];
    }
  | class_body_declarations class_body_declaration
    {
      $1.push($2); 
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
  : field_declaration
    {}
  | method_declaration
    {
      $$ = $1;
    }
  ;

// Class Member Declarations

field_declaration
  : type variable_declarators LINE_TERMINATOR
    {}
  | modifiers type variable_declarators LINE_TERMINATOR
    {}
  ;

//So far only using main method, so this is the root prgram...
method_declaration
  : method_header method_body
    {
      $$ = yy.ast.createRoot($2,@$.range);
      return $$;
    }
  ;

// Method Declarations

method_header
  : modifiers type method_declarator
    {} 
  | modifiers 'void' method_declarator
    { 
      var modifiersText = "";
      var modifiers = [];
      _.each($1, function(modifier){
          modifiersText += (modifier + ' ');
          modifiers.push(modifier);
      });
      var updatedSignature = modifiersText + $2 + " " + $3.methodSignature;
      $3.methodSignature = updatedSignature;
      $3.returnType = $2;
      $3.modifiers = modifiers;
      $$ = $3;
    }
  ;

method_declarator
//FIXME make sure this is public and static
  : 'main' LEFT_PAREN STRING_TYPE LEFT_BRACKET RIGHT_BRACKET IDENTIFIER  RIGHT_PAREN
    { 
      var signature = $1 +  $2 + $3 + $4 + $5 + " " + $6 + $7;
      $$ = yy.createMethodSignatureObject($1, signature);
    } 
    //not using this yet
 /* | IDENTIFIER LEFT_PAREN formal_parameter_list RIGHT_PAREN
    {}
  | IDENTIFIER LEFT_PAREN RIGHT_PAREN
    {}

  | IDENTIFIER LEFT_PAREN type LEFT_BRACKET RIGHT_BRACKET IDENTIFIER RIGHT_PAREN
    {}*/
  ;

formal_parameter_list
  : formal_parameter
    {}
  | formal_parameter_list COMMA formal_parameter
    {}
  ;

formal_parameter
  : type variable_declarator_id
    {}
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
  //TODO User defined type
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

// Blocks

block
  : EMBRACE UNBRACE
    { 
      $$ = null;
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
      yy.createUpdateBlockVariableReference(variables, blockStatements);
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
  : local_variable_declaration_statement
    { 
      $$ = $1;
    }
  | statement
    { 
      $$ = $1;
    }
  ;

local_variable_declaration_statement
  : local_variable_declaration LINE_TERMINATOR
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
    {}
  | empty_statement
    { 
      $$ = $1;
    }    
  | assignment
    {
      $$ = $1; 
    }
  | expression_statement
    {
      $$ = $1;
    }
  | switch_statement
    {}
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
      $$ = consoleNode = yy.createConsoleLogExpression($3, @$.range);
    }
  ;

statement_expression
  : post_increment_expression
    {
      $$ = $1;
    }
  | post_decrement_expression
    {
      $$ = $1;
    }
  // TODO method_invocation
  // TODO class_instance_creation_expression
  ;


post_increment_expression
  : postfix_expression OPERATOR_INCREMENT %prec POST_INCREMENT
    {
      var incrementOne = new yy.createLiteralNode(parseInt('1'), '1', @2.range);
      var addExpression = yy.createMathOperation('+', $1, incrementOne, @$.range);
      $$ = yy.createVariableAttribution($1.name, @1.range, @$.range, addExpression);
    }
  ;

post_decrement_expression
  : postfix_expression OPERATOR_DECREMENT %prec POST_DECREMENT
    {
      var decrementOne = new yy.createLiteralNode(parseInt('1'), '1', @2.range);
      var subExpression = yy.createMathOperation('-', $1, decrementOne, @$.range);
      $$ = yy.createVariableAttribution($1.name, @1.range, @$.range, subExpression);
    }
  ;


// Variable Declarators

local_variable_declaration
  : type variable_declarators
    {
      $$ = yy.createVarDeclarationNode($1, $2, @$.range);
    }
  | type LEFT_BRACKET RIGHT_BRACKET LEFT_BRACKET RIGHT_BRACKET array_declarators
    {
      $$ = yy.createVarDeclarationNode($1, $6, @$.range);
    }
  | type LEFT_BRACKET RIGHT_BRACKET array_declarators
    {
      $$ = yy.createVarDeclarationNode($1, $4, @$.range);
    }
    /* | modifiers type variable_declarators {}*/
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
      $$ = yy.createSimpleArrayNode($1, @$.range);
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
      $$ = yy.createTwoDimensionalArray([$4, $7]);
    }
  | KEYWORD_NEW type LEFT_BRACKET expression RIGHT_BRACKET 
    {
      $$ = yy.createArrayWithNullInitialization($4);
    }
  | EMBRACE primary_list UNBRACE
    {

    }
  ;

primary_list
  : primary 
    {

    }
  | primary_list COMMA primary
    {

    }
  ;


assignment
  : IDENTIFIER OPERATOR_ASSIGNMENT expression LINE_TERMINATOR
    {
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, $3);
    }
  | IDENTIFIER '+=' expression LINE_TERMINATOR
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('+', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '-=' expression LINE_TERMINATOR
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('-', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '*=' expression LINE_TERMINATOR
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('*', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '/=' expression LINE_TERMINATOR
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('/', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  | IDENTIFIER '%=' expression LINE_TERMINATOR
    {
      var identifierVar = new yy.createIdentifierNode($1, @1.range);
      var addExpression = yy.createMathOperation('%', identifierVar, $3, @$.range);
      $$ = yy.createVariableAttribution($1, @1.range, @$.range, addExpression);
    }
  // TODO FieldAccess and ArrayAccess  
  ;

// Names

name
  : IDENTIFIER
    { 
      $$ = yy.createIdentifierNode($1, @$.range); 
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
  | assignment
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
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  ;

exclusive_or_expression
  : and_expression
    { 
      $$ = $1; 
    }
  | exclusive_or_expression OPERATOR_XOR and_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  ;

and_expression
  : equality_expression
    { 
      $$ = $1; 
    }
  | and_expression OPERATOR_INCLUSIVE_AND equality_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
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
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  | shift_expression OPERATOR_RIGHTSHIFT additive_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
    }
  | shift_expression OPERATOR_ZEROFILL_RIGHTSHIFT additive_expression
    {
      $$ = yy.createExpression($2, "BinaryExpression", $1, $3, @$.range);
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
  | LEFT_PAREN expression RIGHT_PAREN
    {
      $$ = $2;
    }
  //TODO method_invocation
  ;

cast_expression
  : LEFT_PAREN type RIGHT_PAREN unary_expression
    {}
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
      var variables = [];
      variables.push($3);
      var forBlock = yy.createForStatement($3, $5, $7, @7.range, $9, @9.range, @$.range);

      yy.createUpdateBlockVariableReference(variables, forBlock);

      $$ = forBlock;
    }
  ;


for_init
  : statement_expression_list
    {
      $$ = $1;
    }
  | local_variable_declaration
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