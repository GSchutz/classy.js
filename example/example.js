////////////
// README //
////////////

/////////////////
// Basic Usage //
/////////////////

var User = Classy('User', {
  $defaults: {
    name: ''
  }
});

var john = User({name: 'John'});

john.$add();
// or User.$add(john);

User.$data();
// → [{name: 'John'}]

john.$change('name', 'John Nash');
// → {name: 'John Nash'}

john.$remove();

User.$data();
// → []

////////////
// Classy //
////////////

function SuperClass() {
  var private = "This is my SuperClass";

  this.myOwnMethod = function() {
    // do something
    return this;
  };

  this.$add = function(data) {
    // set a property as required
    if (data.email) {
      // ok, continue, run the original method
      // the arguments will be already available
      return this.$super();
    } else {
      throw new Error('The property email is required');
    }
  };
}

var options = {
  $pk: 'id',
  $defaults: {
    name: "My Default Name"
  },
  $hasMany: {}
}

var User = Classy( 'User', options, new SuperClass() );

var john = User({});

try {
  john = john.$add();
} catch (e) {
  console.log(e.message);
  // → "The property email is required"
}

console.log(john);
// → {name: "My Default Name", id: 1} 

console.log(User.$data());
// → []
