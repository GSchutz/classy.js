(function(exports) {

  function mixin(object, source, options) {
    var chain = true;
    
    if (options === false) {
      chain = false;
    } else if (_.isObject(options) && 'chain' in options) {
      chain = options.chain;
    }

    //options = options || {};

    // set each method (in source) for object
    for(methodName in source) {
      prop = source[methodName];
      // this will set the methods to the global stats
      object[methodName] = prop;

      if (_.isFunction(prop)) {
        // this will set the methods to the wrapped object.
        // But now, we already have a collection defined, 
        // so we just pass it to the original function;
        // object.prototype[methodName] = prop;
        object.prototype[methodName] = (function(prop, options){

          function mixed() {
            //if (_.isEmpty(arguments))
              //arguments = options.args;

            // $wrapped is just one (or) the first argument,
            // so we pass to the first arguments;

            if (chain || !_.isEmpty(prop.prototype)) {

              var args = [this];
              Array.prototype.push.apply(args, arguments);

              // in this mixin we just execute the method, and mantain the wrapped
              prop.apply(this, args);

              // this.$wrapped = prop.apply(this, args);

              return this;
            }

            var args = [];
            Array.prototype.push.apply(args, arguments);

            return prop.apply(this, args);
          }

          if (!_.isEmpty(prop.prototype)) {
            //mixin.call(this, mixed, prop.prototype, {chain: false, args: arguments});

            return mixed;
          } else {
            return mixed;
          }

          return mixed;

          //F.prototype = prop.prototype;

        }.call(object, prop, options));
      } else {
        // only mix functions
        // console.log('do nothing?', methodName);
      }
    }

    return object;
  }
  
  function mixin2(object, source, chain) {
    chain = !chain;

    for(var methodName in source) {
      if (_.isFunction(source[methodName])) {
        object.prototype[methodName] = function(method, methodName) {
          function mixed() {
            if (chain) {
              var args = [this];
              Array.prototype.push.apply(args, arguments);
               
              method.apply(this, args);
              
              // return the current class when mixed
              return this;
            } 

            var args = [];
            Array.prototype.push.apply(args, arguments);

            return prop.apply(this, args);
          }
          return mixed;
        }.call(source, source[methodName], methodName);
      } else {
        object.prototype[methodName] = source[methodName];
      }
    }
    return object;
  }

  var ai = {};


  var extensions = [];
  var extensions_proto = [];

  function Class(name, methods, inherits) {
    
    var classed = {};

    methods = methods || {};

    // methods = _.defaults(methods, {
    //   $pk: 'id'
    // });
    
    // prevent injection on eval
    name = name.toLowerCase().replace(/[^a-z0-1_A-Z]/g, '');
    var Name = _.capitalize(name.replace(/[^a-z0-1_A-Z]/g, ''));
    var NameWrapper = (Name + "Wrapper").replace(/[^a-z0-1_A-Z]/g, '');


    ai[name] = 1;

    var defaults = methods.$defaults || {};

    function hasMany() {
      if (methods.$hasMany) {
        _.each(methods.$hasMany, function(r, k) {
          defaults[k] = r.$constructor();
        });
      }
    }
    
    eval('function '+Name+'(o){\
      hasMany();\
      var defs = _.defaults(_.cloneDeep(defaults), {\
        id: ai[name]\
      });\
      o = _.defaults(o || {}, defs);\
      _.assign(this,o);\
      ai[name] += 1;\
    }');
    
    eval('function '+NameWrapper+'(value){\
      var u = new '+Name+'(value);\
      _.assign(this,u);\
      this.$wrapped = u;\
    }');

    var constructor;
    
    eval('var '+name+' = constructor = function '+name+'(value){\
      if (value instanceof '+NameWrapper+')\
        return value;\
      return new '+NameWrapper+'(value);\
    }');
       
    // eval(name+'.$data = [];');
    // eval(name+'.$current = null;');
    // eval(name+'.$current = $current.bind('+name+');');
    // eval(name+'.$add = $add.bind('+name+');');

    var listeners = {};

    function dispatch(listener) {
      var args = Array.prototype.slice.call(arguments, 1);

      if (listeners[listener]) {
        _.each(listeners[listener], function(callback) {
          callback.apply(this, args);
        }, this);
      }

      return;
    }
      
      
    function Classy() {
      var current = null;
      var data = [];
      var indexed = {};
      var index = methods.$index || 'id';

      this.$on = function(listener, callback) {
        listeners[listener] = listeners[listener] || [];

        if (_.isFunction(callback))
          listeners[listener].push(callback);

        return this;
      };

      this.$constructor = function() {
        return Class(name, methods);
      };
      
      this.$current = function (c) {
        if (!_.isUndefined(c)) {
          current = (c && c.id) ? this.$data(c) : null;
          return this;
        } else {
          return current;
        }
      };

      this.$first = function() {
        return _.first(data);
      };

      this.$last = function() {
        return _.last(data);
      };

      this.$next = function() {
        var k = _.indexOf(data, this.$current());

        return (k > -1) ? (data[k+1] ? data[k+1] : false) : false;
      };

      this.$prev = function() {
        var k = _.indexOf(data, this.$current());

        return (k > -1) ? (data[k-1] ? data[k-1] : false) : false;
      };

      this.$goNext = function() {
        var k = _.indexOf(data, this.$current());

        this.$current(data[k+1] ? data[k+1] : this.$current());

        return this;
      };

      this.$goPrev = function() {
        var k = _.indexOf(data, this.$current());

        this.$current(data[k-1] ? data[k-1] : this.$current());

        return this;
      };

      this.$add = function(u) {
        u = constructor(u);

        data.push(u);
        indexed[u[index]] = u;

        dispatch.call(this, '$add', u);

        return this;
      };

      this.$load = function(data) {
        this.$removeAll();

        _.each(data, function(d) {
          this(d).$add();
        }, this);

        return this;
      };

      this.$removeAll = function() {
        data.length = 0;
        // WARNING
        // to not remove the assigment, use the code above
        // for (var j in indexed) delete indexed[j];
        indexed = {};

        ai[name] = 1;
        current = null;

        dispatch.call(this, '$removeAll');

        return this;
      };

      this.$removeAt = function(at, n) {
        var rem = data.splice(at, n || 1);

        _.each(rem, function(k) {
          if (_.isEqual(current, k))
            current = null;
          delete indexed[k[index]];
        });

        delete rem;

        dispatch.call(this, '$removeAt', at, n);

        return this;
      };

      this.$remove = function(u) {
        delete indexed[u[index]];
        _.pull(data, u);

        if (_.isEqual(current, u))
          current = null;

        dispatch.call(this, '$remove', u);

        return this;
      };

      this.$data = function(i) {
        return _.isFinite(i) 
          ? data[i] 
          : (_.isObject(i) ? _.find(data, i) : data);
      };

      this.$filter = function(ff) {
        return _.filter(data, ff);
      };

      this.$find = function(ff) {
        return _.find(data, ff);
      };

      this.$export = function() {
        return _.filter(data, function(d) {
          return d.$value();
        });
      };

      this.$change = function(a, b) {
        var k;
        if (_.isFinite(a))
          k = a;
        else
          k = _.findIndex(data, {id: a.id});

        if (data[k])
          data[k] = this(b);

        return this;
      };

      this.$set = function(u, key, value) {
        if (_.isArray(key)) {
          // TODO
        } else if(_.isPlainObject(key)) {
          this.$change(a, b);
        } else {
          u[key] = value;
          u.$wrapped[key] = u[key];
        }

        return this;
      };

      this.$push = function(u, key, value) {

        if (_.isArray(u[key])) {
          u[key].push(value);
          u.$wrapped[key] = u[key];
        }

        return this;
      };

      this.$pull = function(u, key, value) {
        if (_.isArray(u[key])) {
          _.pull(u[key], value);
          u.$wrapped[key] = u[key];
        }

        return this;
      };

      this.$concat = function(u, key, value) {
        if (_.isArray(u[key])) {
          u[key] = u[key].concat(value);
          u.$wrapped[key] = u[key];
        }

        return this;
      };

      this.$indexed = function(k) {
        return k ? indexed[k] : indexed;
      };

      // FIXME
      _.each(extensions, function(e) {
        if (e.options.chain)
          _.assign(this, e.extension);
      }, this);

      // FIXME
      _.each(extensions_proto, function(e) {
        if (e.options.chain)
          _.assign(this, e.extension);
      }, this);

      // FIXME
      if (methods && !methods.prototype)
        _.assign(this, methods);
    }

    // methods only for the constructor not his instances
    function ClassyProto() {}

    // unchainable methods
    function ClassyUnchain() {}

    ClassyUnchain.prototype.$value = function(u) {
      var n = {};

      _.each(this, function(v, k) {
        if (_.indexOf(k, '$') !== 0)
          n[k] = v;
      }, this);

      return n;
    };

    if (methods && methods.$unchain) {
      mixin(ClassyUnchain, methods.$unchain, false);
    }

    // FIXME
    if (methods && methods.prototype) {
      Classy.prototype = methods.prototype;
    }

    if (inherits)
      eval('mixin('+name+', inherits, true);');

    function $extend(_o) {
      eval('mixin('+name+', _o, true);');
      return this;
    }
    eval(''+name+'.$extend = $extend;');
    
    // function $current(c) {
    //   if (c) {
    //     eval(name+'.$current = c');
    //     return this;
    //   } else {
    //     return eval(name+'.$current');
    //   }
    // }
    // function $add(u) {
    //   eval(name+'.$data.push(u);');
    //   return this;
    // };
  
    // _.each(new Classy(), function(d, k) {
    //   eval(''+name+'.'+k+' = d;');
    // });

    eval('mixin('+name+', new Classy(), true);');

    eval('mixin('+name+', new ClassyUnchain(), false);');

    // eval('mixin('+name+', '+name+');');
    eval(NameWrapper+'.prototype = '+name+'.prototype;');


    // private methods for the Constructor only
    _.each(new ClassyProto(), function(d, k) {
      eval(''+name+'.'+k+' = d;');
    });

    
    return eval(name);
  }

  Class.$extend = function(obj, options) {
    _.defaults(options, {
      chain: true
    });

    obj = {
      extension: obj,
      options: options
    };

    if (_.isPlainObject(obj)) {
      extensions.push(obj);
    } else {
      extensions_proto.push(obj);
    }

    return Class;
  };

  if (exports.Classy) {
    console.info("The library Classy is already loaded.");
  } else {
    exports.Classy = Class;
  }

}(window));
