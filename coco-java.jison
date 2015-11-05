// lexical grammar
%lex

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

"System.out.println"    return "SYSOUT";


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
"switch"              return 'switch';
"case"                return 'case';
"default"             return 'default';

"true"                return 'TRUE_LITERAL';
"false"               return 'FALSE_LITERAL';

"class"               return 'KEYWORD_CLASS';

"return"              return 'return';

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
      return yy.ast.createRoot($1,@$.range);
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
      $$ = new yy.createLiteralNode($1, $1, @$.range);

    }
  ;

floating_point_literal
  : FLOATING_POINT_LITERAL
    {
      $$ = new yy.createLiteralNode($1, $1, @$.range);
    }
  ;

boolean_literal
  : TRUE_LITERAL
    {
      $$ = new yy.createLiteralNode($1, $1, @$.range);
    }
  | FALSE_LITERAL
    {
      $$ = new yy.createLiteralNode($1, $1, @$.range);
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
      $$ = new yy.createLiteralNode(value, $1, @$.range);
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
        $$ = $4
    }
  | KEYWORD_CLASS IDENTIFIER class_body
    {}
  ;

// Modifiers

modifiers
  : modifier
    {}
  | modifiers modifier
    {}
  ;

modifier
  : 'public'
    {}
  | 'private'
    {}
  | 'static'
    {}
  | 'final'
    {}
  ;

// Class

class_body
  : EMBRACE class_body_declarations UNBRACE 
    { $$ = $2 }
  ;

class_body_declarations
  : class_body_declaration
    { $$ = [$1]}
  | class_body_declarations class_body_declaration
    { $1.push($2); $$ = $1}
  ;

class_body_declaration
  : class_member_declaration
    {$$ = $1}
  ;

class_member_declaration
  : field_declaration
    {}
  | method_declaration
    {$$ = $1}
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
      return yy.ast.createRoot($2,@$.range);
    }
  ;

// Method Declarations

method_header
  : modifiers type method_declarator
    {} 
  | modifiers 'void' method_declarator
    {}
  ;

method_declarator
//FIXME make sure this is public and static
  : 'main' LEFT_PAREN STRING_TYPE LEFT_BRACKET RIGHT_BRACKET IDENTIFIER  RIGHT_PAREN
    {
       
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
    { $$ = $1 }
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
    {}
  | EMBRACE block_statements UNBRACE
    { $$ = $2 }
  ;

block_statements
  : block_statement
    { $$ = [$1]}
  | block_statements block_statement
    { $1.push($2); $$ = $1; }
  ;

block_statement
  : local_variable_declaration_statement
    {console.log("passou no local_variable");}
  | statement
    {}
  ;

local_variable_declaration_statement
  : local_variable_declaration LINE_TERMINATOR
    {console.log("passou no declaration msm");}
  ;

// Statements 

statement
  : statement_without_trailing_substatement
    {}
  | if_then_statement
    {}
  | if_then_else_statement
    {}
  | while_statement
    {}
  | for_statement
    {}
  | log_statement
    { $$ = yy.createExpressionStatementNode($1, @$.range); }
  ;

statement_without_trailing_substatement
  : block
    {}
  | empty_statement
    {}    
  | assignment
    {console.log("passou no assignment");}
  | expression_statement
    {}
  | switch_statement
    {}
  | do_statement
    {}
  | break_statement
    {}
  //TODO continue_statement
  | return_statement
    {}
  // TODO throw_statement
  // TODO try_statement
  ;

empty_statement
  : LINE_TERMINATOR
    {}
  ;

expression_statement
  : statement_expression LINE_TERMINATOR
    {}
  ;

return_statement
  : 'return' expression LINE_TERMINATOR
    {}
  | 'return' LINE_TERMINATOR
    {}
  ;

break_statement
  : 'break' LINE_TERMINATOR
    {}
  ;

log_statement
  : SYSOUT 'LEFT_PAREN' expression 'RIGHT_PAREN' 'LINE_TERMINATOR'
    {
      $$ = consoleNode = yy.createConsoleLogExpression($3, @$.range);
    }
  ;

statement_expression
  : post_increment_expression
    {}
  | post_decrement_expression
    {}
  // TODO method_invocation
  // TODO class_instance_creation_expression
  ;

// Variable Declarators

local_variable_declaration
  : type variable_declarators
    {}
 /* | modifiers type variable_declarators
    {}*/
  ;

variable_declarators
  : variable_declarator
    {}
  | variable_declarators COMMA variable_declarator
    {}
  ;


variable_declarator
  : variable_declarator_id
    {}
  | variable_initializer
    {}
  ;

variable_declarator_id
  : IDENTIFIER
    {}
  ;

variable_initializer
  : variable_declarator_id OPERATOR_ASSIGNMENT expression
    {}
  ;

assignment
  : IDENTIFIER OPERATOR_ASSIGNMENT expression LINE_TERMINATOR
    {}
  | IDENTIFIER '+=' expression LINE_TERMINATOR
    {console.log("passou no assignment +=");}
  | IDENTIFIER '-=' expression LINE_TERMINATOR
    {}
  | IDENTIFIER '*=' expression LINE_TERMINATOR
    {}
  | IDENTIFIER '/=' expression LINE_TERMINATOR
    {}
  // TODO FieldAccess and ArrayAccess
  ;

// Names

name
  : IDENTIFIER
    {}
  ;

// Expressions 

expression
  : conditional_expression
    {}
  ;

conditional_expression
  : conditional_or_expression
    {}
  //TODO TERNARY
  ;

conditional_or_expression
  : conditional_and_expression
    {}
  | conditional_or_expression OPERATOR_LOGICAL_OR conditional_and_expression
    {}
  ;

conditional_and_expression
  : inclusive_or_expression
    {}
  | conditional_and_expression OPERATOR_LOGICAL_AND inclusive_or_expression
    {}
  ;

inclusive_or_expression
  : exclusive_or_expression
    {}
  | inclusive_or_expression OPERATOR_INCLUSIVE_OR exclusive_or_expression
    {}
  ;

exclusive_or_expression
  : and_expression
    {}
  | exclusive_or_expression OPERATOR_XOR and_expression
    {}
  ;

and_expression
  : equality_expression
    {}
  | and_expression OPERATOR_INCLUSIVE_AND equality_expression
    {}
  ;

equality_expression
  : relational_expression
    {}
  | equality_expression OPERATOR_EQUAL relational_expression
    {}
  | equality_expression OPERATOR_NOT_EQUAL relational_expression
    {}
  ;

relational_expression
  : shift_expression
    {}
  | relational_expression OPERATOR_LESS_THAN shift_expression
    {}
  | relational_expression OPERATOR_LESS_THAN_EQUAL shift_expression
    {}
  | relational_expression OPERATOR_GREATER_THAN shift_expression
    {}
  | relational_expression OPERATOR_GREATER_THAN_EQUAL shift_expression
    {}
  ;

shift_expression
  : additive_expression
    {}
  | shift_expression OPERATOR_LEFTSHIFT additive_expression
    {}
  | shift_expression OPERATOR_RIGHTSHIFT additive_expression
    {}
  | shift_expression OPERATOR_ZEROFILL_RIGHTSHIFT additive_expression
    {}
  ;

additive_expression
  : multiplicative_expression
    {}
  | additive_expression OPERATOR_ADDITION multiplicative_expression
    {}
  | additive_expression OPERATOR_SUBTRACTION multiplicative_expression
    {}
  ;

multiplicative_expression
  : unary_expression
    {}
  | multiplicative_expression OPERATOR_MULTIPLICATION unary_expression
    {}
  | multiplicative_expression OPERATOR_DIVISON unary_expression
    {}
  | multiplicative_expression OPERATOR_MODULO unary_expression
    {}
  ;

unary_expression
  : postfix_expression
    {}
  | OPERATOR_BITWISE_NEGATION unary_expression
    {}
  | OPERATOR_NEGATION unary_expression
    {}
  | cast_expression
    {}
  ;

postfix_expression
  : primary
    {}
  | name
    {}
  ;

primary
  : literal
    {}
  | LEFT_PAREN expression RIGHT_PAREN
    {}
  //TODO method_invocation
  ;

cast_expression
  : LEFT_PAREN type RIGHT_PAREN unary_expression
    {}
  ;

while_statement
  : KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN statement
    {}
  ;

do_statement
  : KEYWORD_DO statement KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN LINE_TERMINATOR
    {}
  ;

for_statement
  : KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR name OPERATOR_INCREMENT RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR name OPERATOR_DECREMENT RIGHT_PAREN statement
    {}
  ;


for_init
  : statement_expression_list
    {}
  | local_variable_declaration
    {}
  ;

for_update
  : statement_expression_list
    {}
  ;

statement_expression_list
  : statement_expression
    {}
  | statement_expression_list COMMA statement_expression
    {}
  ;

if_then_statement
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement
    {}
  ;

if_then_else_statement
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement KEYWORD_ELSE statement
    {}
  ;

switch_statement
  : 'switch' LEFT_PAREN expression RIGHT_PAREN switch_block
    {}
  ;

switch_block
  : EMBRACE UNBRACE
    {}
  | EMBRACE switch_block_statement_groups switch_labels UNBRACE
    {}
  | EMBRACE switch_labels UNBRACE
    {}
  | EMBRACE switch_block_statement_groups UNBRACE
    {}
  ;



switch_block_statement_groups
  : switch_block_statement_group
    {}
  | switch_block_statement_groups switch_block_statement_group
    {}
  ;

switch_block_statement_group
  : switch_labels block_statements
    {}
  ;

switch_labels
  : switch_label
    {}
  | switch_labels switch_label
    {}
  ;

switch_label
  : 'case' constant_expression COLON
    {}
  | 'default' COLON
    {}
  ;

constant_expression
  : expression
    {}
  ;