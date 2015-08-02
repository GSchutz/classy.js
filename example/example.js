

var user = Classy('user', {
  test: function(el) {
    console.log(el);
    return this;
  }
});

window.user = user;

var guilherme = user({name: 'guilherme'}).$add();
var joao = user({name: 'joao'});
// console.log(user.$add(guilherme));

guilherme.$set('name', "Guilherme A");

console.log(guilherme);
console.log(user.$add(joao).$data());


var car = Classy('car');

var mondeo = car({name: 'mondeo'});

console.log(mondeo.$add());
console.log(car.$data());

var Address = Classy('address', {
  treta: function() {
    console.log("treta");
  }
});

// how to add pre-existed constructors
var User = Classy('user', {
  $hasMany: {
    address: Address
  }
});


var ruax = Address({name: "Rua X"}).$add();
var ruaz = Address({name: "Rua Z"}).$add();

ruax.treta();

var jorge = User({name: "Jorge"}).$add();

console.log(Address.$data());
var ruax2 = jorge.address({name: "Rua X"}).$add();
console.log(ruax2);
ruax2.treta();

console.log(jorge.address.$data());

