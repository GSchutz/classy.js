describe("Classy", function() {

  beforeAll(function() {
    MyClass = Classy('MyClass');
  });

  describe("when Classy constructor is instantiated", function() {

    it("should return a Classy instance", function() {
      expect(MyClass instanceof Classy.constructor).toBeTruthy();
    });


    describe("when Classy instance is instantiated", function() {
      it("should return a ClassyWrapper (MyClass Constructor)", function() {
        var myClassInstance = MyClass();

        expect(myClassInstance instanceof MyClass.constructor).toBeTruthy();
      });
    });


    describe("when MyClass instance is $remove (MyClass(obj).$remove())", function() {
      it("should push itself inside MyClass.$data and return the added instance", function() {
        var myClassInstance = MyClass();

        var ret = myClassInstance.$add();

        expect(MyClass.$data()).toContain(myClassInstance);
        expect(myClassInstance).toEqual(ret);
      });
    });
    

    describe("when MyClass call $add (MyClass.$add(obj))", function() {
      it("should push obj inside MyClass.$data and return MyClass", function() {
        var myClassInstance = MyClass();

        var ret = MyClass.$add(myClassInstance);

        expect(MyClass.$data()).toContain(myClassInstance);
        expect(MyClass).toEqual(ret);
      });
    });


    describe("when MyClass instance is $remove (MyClass(obj).$remove())", function() {
      it("should pull itself from MyClass.$data and return the removed instance", function() {
        var myClassInstance = MyClass({}).$add();

        var ret = myClassInstance.$remove();

        expect(MyClass.$data()).not.toContain(myClassInstance);
        expect(myClassInstance).toEqual(ret);
      });
    });
    

    describe("when MyClass call $remove (MyClass.$remove(obj))", function() {
      it("should pull obj from MyClass.$data and return MyClass", function() {
        var myClassInstance = MyClass({}).$add();

        var ret = MyClass.$remove(myClassInstance);

        expect(MyClass.$data()).not.toContain(myClassInstance);
        expect(MyClass).toEqual(ret);
      });
    });
    
    // be shure to maintain the position for next and prev specs
    describe("when dealing with relative items", function() {
      var ret, myClassInstance;

      describe("when MyClass call $current (MyClass.$current())", function() {
        it("should save argument as the selected instance", function() {
          myClassInstance = MyClass({name: 'selected'}).$add();

          ret = MyClass.$current(myClassInstance);

          expect(MyClass.$current()).toEqual(myClassInstance);
          expect(MyClass).toEqual(ret);
        });
      });

      describe("when called from instance", function() {
        it("should save caller as the selected instance", function() {
          myClassInstance = MyClass({name: 'selected'}).$add();

          ret = myClassInstance.$current();

          expect(MyClass.$current()).toEqual(myClassInstance);
          expect(myClassInstance).toEqual(ret);
        });
      });

      describe("when $prev is called from MyClass", function() {
        it("should return the item before the selected instance or before the passed instance as argument", function() {
          // add items
          var prev = MyClass({name: 'prev'}).$add();
          var middle = MyClass({name: 'middle'}).$add().$current();
          var next = MyClass({name: 'next'}).$add();

          ret = MyClass.$prev();
          expect(prev).toEqual(ret);

          ret = MyClass.$prev(next);
          expect(middle).toEqual(ret);
        });
      });

      describe("when $prev is called from instance", function() {
        it("should return the item before the caller instance", function() {
          // add items
          var prev = MyClass({name: 'prev'}).$add();
          var middle = MyClass({name: 'middle'}).$add().$current();
          var next = MyClass({name: 'next'}).$add();

          ret = next.$prev();

          expect(middle).toEqual(ret);
        });
      });

    });

  });

  describe('When Super Class is passed', function() {
    var MyClass, SuperClass;

    function SuperClass() {
      this.returnString = function() {
        return "string";
      };

      this.$add = function(data) {
        // super is a self destructive method
        // after composing to ClassyWrapper it will be removed from Classy

        if (data.name) {
          // ok, continue, run the original method
          // the arguments will be already available
          return this.$super();
        } else {
          throw new Error('The property name is required');
        }
      };
    }

    beforeAll(function() {
      superClassInstance = new SuperClass();

      MyClass = Classy('MyClassSuper', {}, superClassInstance);
    });

    it("should be possible to access all SuperClass methods from MyClass", function() {

      for (i in superClassInstance) {
        expect(MyClass[i]).toBeTruthy();
      }
    });

    it("should be possible to rewrite Classy methods and access the original method from this.$super", function() {
      
      expect(function() {
        MyClass({}).$add();
      }).toThrow();

      expect(function() {
        MyClass({name: "Jack Daniels"}).$add();
      }).not.toThrow();
    });

    describe('When call a Super Class method', function() {
      it("should return as expected only called from a Classy instance", function() {

        var myClassInstance = MyClass({name: "Colb"});

        expect(MyClass.returnString).toBeDefined();
        expect(MyClass.returnString()).toEqual("string");

        expect(myClassInstance.returnString).toBeUndefined();
      });
    });

  });

});
