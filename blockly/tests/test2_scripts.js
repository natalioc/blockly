//Audio Description Scripts for part 2 

//Training Example from stefik 
var array = "variable i equals 0. variable k equals 0. while i less than 2, increase k by 1, if i is equal to 0 increase k by 1, else decrease k by 1, increase i by 1, print k";



//Example 6 from Stefik 
var task2_stefik = ["variable i equals 0", "variable d equals 4", "If d not equals d.", "While i less than d", "if 2 equals i or 1 equals i", "if 2 equals i", "else", "if 0 equals i.", "if 0 equals i.", "increase i by 1.", "if d equals d."];

//KW code
var task2_kw = [];
task2_kw[0] = "variable i equals 0";
task2_kw[1] = "loop 10 times";
task2_kw[2] = "print i";
task2_kw[3] = "if i equals 5";
task2_kw[4] = "print Halfway";
task2_kw[5] = "increase i by 1";


//CSCI140 examples

//1)
var task2_1 = ["variable count equals 1.", " variable y equals 6.", "while count less than 6", "increase y by i", "increase count by 1", "print y." ];
var indent_1 = [0,0,0,1,1,0];
//2)
var task2_2 = ["variable num equals 1.", "while num < 10", "print num", "increase num by 2"];
var indent_2 = [0,0,1,1];
//3)
var task2_3 = ["variable num equals 1", "while num < 10", "increase num by 2","print num"];
var indent_3 = [0,0,1,1];
//4)
var task2_4 = ["variable sum equals 0","variable x equals 0", "while x less than 10","increase x by 1","if x is divisible by 3","increase x by 2","increase sum by x","print x","print sum"];
var indent_4 = [0,0,0,1,1,2,1,1,0];
//5)
var task2_5 = ["variable x equals 2","variable y equals 2","variable num equals 1","while num less than 10","print num","increase num by 2","if x greater than 0","print A","else","print B","print C"];
var indent_5 = [0,0,0,0,1,1,1,2,2,1];
//6)
var task2_6 = ["variable i equals 5.","variable x equals 5","if x less than equals 20","if x less than 10","if x is less than or equal to 0","if i less than equals 10","print Hello"];
var indent_6 = [0,0,0,1,2,3,2,3,2,1,0];

var task= ["variable i equals 3","variable j equals 5","if i + j equals 8","print i + j","while i is less than 10","if i is less than 5","increment i by 1","else","increment i by 2","print i+j"]
var indent= [1,1,1,2,1,2,3,2,3,1]