function SuperClass() {

  this.go = function() {
    console.log(this == User);
    return this;
  };

  this.$add = function() {
    // super is a self destructive method
    console.log('using $super method');
    return this.$super();
  };
}

var User = Classy('user', {
  $defaults: {
    name: "",
    treta: "hight"
  }
}, new SuperClass());

var lola = User({name: "lola", treta:"low"});

console.log(lola.$add());

var kate = User({name: "kate"}).$add();
var rose = User({name: "rose"}).$add();

console.log(rose);

console.log(lola.$next());


// 1) SuperClass
// example of a super class that can control/rewrite original methods
// function SuperClass() {
//   this.$add = function(u) {
//     if (u.name) {
//       // use the $super method to execute the original method
//     	this.$super(u);
//     } else {
//     	throw new TypeError('Property name is required for class User');
//     }

//     return this;
//   };
// }

// var user = Classy('user', {
//   test: function(el) {
//     console.log(el);
//     return this;
//   }
// }, new SuperClass());

// window.user = user;

// try {
// 	var joao = user({name: 'joao'}).$add();
	
//   // user guilherme will not be added to $data
// 	var guilherme = user({tr: 'guilherme'}).$add();

// } catch (e) {
// 	console.log(e);
// }

// Rewrite Classy
