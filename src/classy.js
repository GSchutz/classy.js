(function(exports) {
  
  function mixin(object, source, options) {
    for(var methodName in source) {
    if (_.isFunction(source[methodName])) {
      object.prototype[methodName] = function(method, methodName) {
        function mixed() {
        var args = [this];
        Array.prototype.push.apply(args, arguments);
         
        method.apply(this, args);
        
        // return the current class when mixed
        return this;
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

  function Class(name, methods) {
    
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

    if (methods.$hasMany) {
      _.each(methods.$hasMany, function(r, k) {
        defaults[k] = r.$constructor();
      });
    }
    
    eval('function '+Name+'(o){\
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
    
    eval('function '+name+'(value){\
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
        });
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
        if (c) {
          current = c;
          return this;
        } else {
          return current ? current : _.first(data);
        }
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
        data.push(u);
        indexed[u[index]] = u;

        dispatch.call(this, '$add', u);

        return this;
      };

      this.$load = function(data) {
        _.each(data, function(d) {
          this(d).$add();
        }, this);

        return this;
      };

      this.$remove = function(u) {
        delete indexed[u[index]];
        _.pull(data, u);

        dispatch.call(this, '$remove', u);

        return this;
      };

      this.$data = function(i) {
        return _.isFinite(i) 
          ? data[i] 
          : (_.isPlainObject(i) ? _.find(data, i) : data);
      };

      this.$filter = function(o) {
        return _.filter(data, o);
      };

      this.$set = function(u, key, value) {
        if (_.isArray(key)) {
          // TODO
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

      if (methods && !methods.prototype)
        _.assign(this, methods);
    }

    if (methods && methods.prototype)
      Classy.prototype = methods.prototype;
    
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
  
    _.each(new Classy(), function(d, k) {
      eval(''+name+'.'+k+' = d;');
    });

    eval('mixin('+name+', '+name+');');
    eval(NameWrapper+'.prototype = '+name+'.prototype;');
    
    return eval(name);
  }
  
  exports.Classy = Class;

}(window));
