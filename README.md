# classy.js

An intuitive simple class constructor with extendable features.

## Dependencies

Just [Lodash ^3.10.0](http://lodash.com/).

## Usage

```javascript

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
```

## Documentation

`Classy` is the only variable exported.

### Classy(name, _[options, superclass]_)

Creates a `Classy` constructor that is composed from a `ClassyBuilder`.

- _`String`_ `name`: is the name of the class, can be access by `MyClass.$name`;
- _`Object`_ `options`: a set of initial properties for `MyClass`;
- _`Object`_ `superclass`: a set of personalized methods that can extend `Classy` or powerfull rewrite original methods;

#### Example

```javascript
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

```


