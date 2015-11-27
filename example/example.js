function SuperClass() {
  this.$add = function(u) {
    

    if (u.coco)
    	this.$super(u);
    else
    	throw new TypeError('Property coco is required for class User');

    return this;
  };
}

// Classy.$extend(new Massy(), {chain: false});


// Classy.$extend({
// 	$$treta: function() {
// 		console.log("treta");
// 		return "treta";
// 	}
// });

var user = Classy('user', {
  test: function(el) {
    console.log(el);
    return this;
  }
}, new SuperClass());

window.user = user;

try {

	var joao = user({coco: 'joao'}).$add();
	
	var guilherme = user({name: 'guilherme'}).$add();

	console.log(user.$add(joao.$copy()));

	// console.log(user.$add(guilherme));

	guilherme.$set('name', "Guilherme A");


	var jorge = guilherme.$copy();


	console.log(guilherme);

} catch (e) {
	console.log(e, user.$data());
}



// console.log(user.$add(joao).$data());


// var car = Classy('car');

// var mondeo = car({name: 'mondeo'});

// console.log(mondeo.$add());
// console.log(car.$data());

// var Address = Classy('address', {
//   treta: function() {
//     console.log("treta");
//   }
// });

// // how to add pre-existed constructors
// var User = Classy('user', {
//   $hasMany: {
//     address: Address
//   }
// });


// var ruax = Address({name: "Rua X"}).$add();
// var ruaz = Address({name: "Rua Z"}).$add();

// ruax.treta();

// var jorge = User({name: "Jorge"}).$add();

// console.log(Address.$data());
// var ruax2 = jorge.address({name: "Rua X"}).$add();
// console.log(ruax2);
// ruax2.treta();

// console.log(jorge.address.$data());

