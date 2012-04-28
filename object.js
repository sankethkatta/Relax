/*hello = function(one, two, three) {
  this.loggedin= one
  this.user= two
  this.error= three
}
hello.loggedin = 'hi'
newobj = new hello(24, 24, 34);
console.log(hello.loggedin)
console.log(newobj.loggedin)
*/

foo = function(param, callback) {
  ints = [2, 3, 4, 5, 6, 7, 7, 8, 89, 9];
  
  callback(ints[param]);
}

foo(5, function(foundnum){
  console.log(foundnum);
});

