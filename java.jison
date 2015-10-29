/*NOT IN USE, FOR TESTS PURPOSE ONLY*/

/* lexical grammar */
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


"public"              return 'public';
"private"             return 'private';

"static"              return 'static';

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
"&="                  return '&=';
"^="                  return '^=';
"|="                  return '|=';
"<<="                 return '<<=';
">>="                 return '>>=';
">>>="                return '>>>=';
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
%left OPERATOR_LESS_THAN OPERATOR_GREATER_THAN OPERATOR_LESS_THAN_EQUAL OPERATOR_GREATER_THAN_EQUAL OPERATOR_INSTANCEOF
%left OPERATOR_LEFTSHIFT OPERATOR_RIGHTSHIFT OPERATOR_ZEROFILL_RIGHTSHIFT
%left OPERATOR_ADDITION OPERATOR_SUBTRACTION
%left OPERATOR_MULTIPLICATION OPERATOR_DIVISION OPERATOR_MODULO
%right PRE_INCREMENT PRE_DECREMENT U_PLUS U_MINUS OPERATOR_BITWISE_NEGATION OPERATOR_NEGATION
%right POST_INCREMENT POST_DECREMENT

/*Start to read the file*/

%start compilation_unit

%% /* language grammar */

/*** ROOT ***/

compilation_unit
  : EOF
    {console.log(new yy.ASTNode())}
  | package_declaration EOF
    {}
  | import_declarations EOF
    {}
  | type_declarations EOF
    {}
  | package_declaration import_declarations EOF
    {}
  | package_declaration type_declarations EOF
    {}
  | import_declarations type_declarations EOF
    {}
  | package_declaration import_declarations type_declarations EOF
    {}
  ;

/*** 19.3 Lexical Structure ***/

literal
  : integer_literal
    {}
  | floating_point_literal
    {}
  | boolean_literal
    {}
  | string_literal
    {}
  | null_literal
    {}
  ;

integer_literal
  : DECIMAL_INTEGER_LITERAL
    {}
  ;

floating_point_literal
  : FLOATING_POINT_LITERAL
    {}
  ;

boolean_literal
  : TRUE_LITERAL
    {}
  | FALSE_LITERAL
    {}
  ;

string_literal
  : STRING_LITERAL
    {}
  ;

null_literal
  : NULL_LITERAL
    {}
  ;


/*** COMPILATION UNIT ***/

package_declaration
  : KEYWORD_PACKAGE IDENTIFIER LINE_TERMINATOR
    {}
  ;

import_declarations
  : import_declaration
    {}
  | import_declarations import_declaration
    {}
  ;

import_declaration
  : KEYWORD_IMPORT name LINE_TERMINATOR
    {}
  ;

type_declarations
  : type_declaration
    {}
  ;

type_declaration
  : class_declaration
    {}
  ;

/**
Modifiers:

  Modifier

  Modifiers Modifier

Modifier: one of public private static

  abstract final
  */
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
    

/* TODO Modifiers_{opt} class Identifier Super_{opt} Interfaces_{opt} ClassBody */
class_declaration
  : KEYWORD_CLASS IDENTIFIER class_body
    {}
  | 'public' KEYWORD_CLASS IDENTIFIER class_body
    {}
  ;

/*** CLASS ***/

class_body
  : EMBRACE class_body_declarations UNBRACE 
    {}
  ;

class_body_declarations
  : class_body_declaration
    {}
  | class_body_declarations class_body_declaration
    {}
  ;

class_body_declaration
  : class_member_declaration
    {}
  ;

class_member_declaration
  : field_declaration
    {}
  | method_declaration
    {}
  ;

/*** CLASS MEMBER DECLARATIONS ***/

field_declaration
  : type variable_declarators LINE_TERMINATOR
    {}
  | modifiers type variable_declarators LINE_TERMINATOR
    {}
  ;

method_declaration
  : method_header method_body
    {}
  ;

/*** METHOD DECLARATIONS ***/

method_header
  // TODO throws_opt
  : modifiers type method_declarator
    {}
  | type method_declarator
    {}
  | modifiers 'void' method_declarator
    {}
  | 'void' method_declarator
    {}
  ;

method_declarator
  : IDENTIFIER LEFT_PAREN formal_parameter_list RIGHT_PAREN
    {}
  | IDENTIFIER LEFT_PAREN RIGHT_PAREN
    {}
  | IDENTIFIER LEFT_PAREN type LEFT_BRACKET RIGHT_BRACKET IDENTIFIER RIGHT_PAREN
    {}
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
    {}
  ;

/*** VARIABLE DECLARATORS ***/

variable_declarators
  : variable_declarator
    {}
  | variable_declarators COMMA variable_declarator
    {}
  ;

variable_declarator
  : variable_declarator_id
    {}
  | variable_declarator_id OPERATOR_ASSIGNMENT variable_initializer
    {}
  ;

variable_declarator_id
  : IDENTIFIER
    {}
  ;

variable_initializer
  : expression
    {}
  ;

/*** TYPE ***/

type
  : primitive_type
    {}
  | STRING_TYPE
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

/*** 19.11 BLOCKS AND STATEMENTS ***/

block
  : EMBRACE UNBRACE
    {}
  | EMBRACE block_statements UNBRACE
    {}
  ;

block_statements
  : block_statement
    {}
  | block_statements block_statement
    {}
  ;

block_statement
  : local_variable_declaration_statement
    {}
  | statement
    {}
  ;

local_variable_declaration_statement
  : local_variable_declaration LINE_TERMINATOR
    {}
  ;

local_variable_declaration
  : type variable_declarators
    {}
  | modifiers type variable_declarators
    {}
  ;

/*** STATEMENTS ***/

statement
  : statement_without_trailing_substatement
    {}
  // TODO labeled_statement
  | if_then_statement
    {}
  | if_then_else_statement
    {}
  | while_statement
    {}
  | for_statement
    {}
  ;

statement_no_short_if
  : statement_without_trailing_substatement
    {}
  | labeled_statement_no_short_if
    {}
  | if_then_else_statement_no_short_if
    {}
  | while_statement_no_short_if
    {}
  | for_statement_no_short_if
    {}
  ;

statement_without_trailing_substatement
  : block
    {}
  | empty_statement
    {}
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

break_statement
  : 'break' LINE_TERMINATOR
    {}
  ;

statement_expression
  : assignment
    {}
  | post_increment_expression
    {}
  | post_decrement_expression
    {}
  | method_invocation
    {}
  // TODO class_instance_creation_expression
  ;

return_statement
  : 'return' expression
    {}
  | 'return'
    {}
  ;

/*** CONTROL STRUCTURES: BRANCHING ***/

if_then_statement
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN if_then_statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN if_then_else_statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN while_statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN for_statement
    {}
  ;

if_then_else_statement
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement KEYWORD_ELSE statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN labeled_statement_no_short_if KEYWORD_ELSE statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN if_then_else_statement_no_short_if KEYWORD_ELSE statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN while_statement_no_short_if KEYWORD_ELSE statement
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN for_statement_no_short_if KEYWORD_ELSE statement
    {}
  ;

if_then_else_statement_no_short_if
  : KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN statement_without_trailing_substatement KEYWORD_ELSE statement_no_short_if
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN labeled_statement_no_short_if KEYWORD_ELSE statement_no_short_if
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN if_then_else_statement_no_short_if KEYWORD_ELSE statement_no_short_if
   {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN while_statement_no_short_if KEYWORD_ELSE statement_no_short_if
    {}
  | KEYWORD_IF LEFT_PAREN expression RIGHT_PAREN for_statement_no_short_if KEYWORD_ELSE statement_no_short_if
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
    

/*** CONTROL STRUCTURES: LOOPS ***/

while_statement
  : KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN statement
    {}
  ;

while_statement_no_short_if
  : KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN statement_no_short_if
    {}
  ;
do_statement
  : KEYWORD_DO statement KEYWORD_WHILE LEFT_PAREN expression RIGHT_PAREN LINE_TERMINATOR
    {}
  ;

for_statement
  : KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR for_update RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR LINE_TERMINATOR for_update RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR LINE_TERMINATOR RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR expression LINE_TERMINATOR for_update RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR expression LINE_TERMINATOR RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR LINE_TERMINATOR for_update RIGHT_PAREN statement
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR LINE_TERMINATOR RIGHT_PAREN statement
    {}
  ;

for_statement_no_short_if
  : KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR for_update RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR expression LINE_TERMINATOR RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR LINE_TERMINATOR for_update RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN for_init LINE_TERMINATOR LINE_TERMINATOR RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR expression LINE_TERMINATOR for_update RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR expression LINE_TERMINATOR RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR LINE_TERMINATOR for_update RIGHT_PAREN statement_no_short_if
    {}
  | KEYWORD_FOR LEFT_PAREN LINE_TERMINATOR LINE_TERMINATOR RIGHT_PAREN statement_no_short_if
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

/*** NAMES ***/

name
  : simple_name
    {}
  ;

simple_name
  : IDENTIFIER
    {}
  ;


/*** 19.12 EXPRESSIONS ***/

primary
  : primary_no_new_array
    {}
  ;

primary_no_new_array
  : literal
    {}
  | LEFT_PAREN expression RIGHT_PAREN
    {}
  | method_invocation
    {}
  ;

argument_list
  : expression
    {}
  | argument_list COMMA expression
    {}
  ;

method_invocation
  : name LEFT_PAREN RIGHT_PAREN
    {}
  | name LEFT_PAREN argument_list RIGHT_PAREN
    {}
  ;

postfix_expression
  : primary
    {}
  | name
    {}
  | post_increment_expression
    {}
  | post_decrement_expression
    {}
  ;

post_increment_expression
  : postfix_expression OPERATOR_INCREMENT %prec POST_INCREMENT
    {}
  ;

post_decrement_expression
  : postfix_expression OPERATOR_DECREMENT %prec POST_DECREMENT
    {}
  ;

unary_expression
  : pre_increment_expression
    {}
  | pre_decrement_expression
    {}
  | OPERATOR_SUBTRACTION unary_expression %prec U_MINUS
    {}
  | OPERATOR_ADDITION unary_expression %prec U_PLUS
    {}
  | unary_expression_not_plus_minus
    {}
  ;

pre_increment_expression
  : OPERATOR_INCREMENT unary_expression %prec PRE_INCREMENT
    {}
  ;

pre_decrement_expression
  : OPERATOR_DECREMENT unary_expression %prec PRE_DECREMENT
    {}
  ;

unary_expression_not_plus_minus
  : postfix_expression
    {}
  | OPERATOR_BITWISE_NEGATION unary_expression
    {}
  | OPERATOR_NEGATION unary_expression
    {}
  | cast_expression
    {}
  ;

/*
CastExpression:
  ( PrimitiveType Dims_opt ) UnaryExpression
  ( Expression ) UnaryExpressionNotPlusMinus
  ( Name Dims ) UnaryExpressionNotPlusMinus
*/
cast_expression
  : LEFT_PAREN primitive_type RIGHT_PAREN unary_expression
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

additive_expression
  : multiplicative_expression
    {}
  | additive_expression OPERATOR_ADDITION multiplicative_expression
    {}
  | additive_expression OPERATOR_SUBTRACTION multiplicative_expression
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

equality_expression
  : relational_expression
    {}
  | equality_expression OPERATOR_EQUAL relational_expression
    {}
  | equality_expression OPERATOR_NOT_EQUAL relational_expression
    {}
  ;

and_expression
  : equality_expression
    {}
  | and_expression OPERATOR_INCLUSIVE_AND equality_expression
    {}
  ;

exclusive_or_expression
  : and_expression
    {}
  | exclusive_or_expression OPERATOR_XOR and_expression
    {}
  ;

inclusive_or_expression
  : exclusive_or_expression
    {}
  | inclusive_or_expression OPERATOR_INCLUSIVE_OR exclusive_or_expression
    {}
  ;

conditional_and_expression
  : inclusive_or_expression
    {}
  | conditional_and_expression OPERATOR_LOGICAL_AND inclusive_or_expression
    {}
  ;

conditional_or_expression
  : conditional_and_expression
    {}
  | conditional_or_expression OPERATOR_LOGICAL_OR conditional_and_expression
    {}
  ;

conditional_expression
  : conditional_or_expression
    {}
  | conditional_or_expression QUESTION_MARK expression COLON conditional_expression %prec TERNARY
    {}
  ;

assignment_expression
  : conditional_expression
    {}
  | assignment
    {}
  ;

assignment
    : name OPERATOR_ASSIGNMENT assignment_expression
    {}
  | name '+=' assignment_expression
    {}
  | name '-=' assignment_expression
    {}
  | name '*=' assignment_expression
    {}
  | name '/=' assignment_expression
    {}
  // TODO FieldAccess and ArrayAccess
  ;


assignment_operator
  : OPERATOR_ASSIGNMENT
    {}
  ;

expression
  : assignment_expression
    {}
  ;

constant_expression
  : expression
    {}
  ;

