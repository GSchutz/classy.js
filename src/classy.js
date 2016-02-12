(function(exports) {
  'use strict';

  function mixin(object, source, options) {
    var chain = true,
      supe = false,
      prototyped = true,
      unchainMethods = [];
    
    if (options === false) {
      chain = false;
    } else if (_.isObject(options)) {
      if ('chain' in options)
        chain = options.chain;
      if ('super' in options)
        supe = options.super;
      if ('prototyped' in options)
        prototyped = options.prototyped;
      unchainMethods = options.unchain || unchainMethods;
    }

    var pseudoObject = object;

    if (prototyped)
      pseudoObject = object.prototype

    // set each method (in source) for object
    for(var methodName in source) {
      var prop = source[methodName];

      if (_.isFunction(prop)) {
        // this will set the methods to the wrapped object.
        // But now, we already have a collection defined, 
        // so we just pass it to the original function;
        // object.prototype[methodName] = prop;

        if (supe && _.isFunction(object[methodName])) {
          // we save the original method object[methodName]
          var originalMethod = object[methodName];

          pseudoObject[methodName] = (function(prop, options, methodName) {

            function mixed() {

              // $wrapped is just one (or) the first argument,
              // so we pass to the first arguments;

              if (chain || !_.isEmpty(prop.prototype)) {

                var args = [this];
                Array.prototype.push.apply(args, arguments);

                // super is a self destructive method, after dispatch we remove
                // this prevent from accessing the method outside
                this.$super = function() {
                  var val = originalMethod.apply(this, args);
                  delete this.$super;
                  return val;
                };

                // in this mixin we just execute the method, and mantain the wrapped
                var res = prop.apply(this, args);

                return _.contains(unchainMethods, methodName) ? res : this;
              }

              var args = [];
              Array.prototype.push.apply(args, arguments);

              this.$super = function() {
                var val = originalMethod.apply(this, args);
                delete this.$super;
                return val;
              };

              return prop.apply(this, args);
            }

            return mixed;
          }.call(object, prop, options, methodName));
          
        } else {

          pseudoObject[methodName] = (function(prop, options, methodName) {

            function mixed() {

              // $wrapped is just one (or) the first argument,
              // so we pass to the first arguments;
              if (chain || !_.isEmpty(prop.prototype)) {

                var args = [this];
                Array.prototype.push.apply(args, arguments);

                // in this mixin we just execute the method, and mantain the wrapped
                var res = prop.apply(this, args);

                return _.contains(unchainMethods, methodName) ? res : this;
              }

              var args = [];
              Array.prototype.push.apply(args, arguments);

              return prop.apply(this, args);
            }

            return mixed;
          }.call(object, prop, options, methodName));
        }
      } else {
        // only mix functions
        // console.log('do nothing?', methodName);
        // object[methodName] = prop;
      }
    }

    return object;
  }

  // Classy instance list
  var classyList = [];
  
  function ClassyBuilder(name, options, inherits, listeners) {
    options = options || {};

    // counters
    var ID = 0;

    // expose the Class Constructor
    var context = function Classy(a, b) {
      // we need to check if is a ClassyWrapper instance and if the name of the constructor is the same
      if (a instanceof ClassyWrapper) {
        return a;
      }
      ID += 1;
      return new ClassyWrapper(a, b);
    };

    ///////////////////////
    // private variables //
    ///////////////////////

    var data = [];
    var indexed = {};
    var $pk = options.$pk || 'id';
    var unique = options.$unique || {};
    var current = null;
    options.$hasMany = options.$hasMany || {};
    listeners = listeners || {};

    /////////////////////
    // private methods //
    /////////////////////

    function dispatch(listener) {
      var args = Array.prototype.slice.call(arguments, 1);

      if (listeners[listener]) {
        _.each(listeners[listener], function(callback) {
          callback.apply(this, args);
        }, this);
      }

      return;
    }

    function applyHasMany(elem) {
      _.each(options.$hasMany, function(m, k) {
        var nm = m.$constructor();

        nm.$load(elem[k]);
        elem[k] = nm;
      });
    }

    function alreadyExist(newData) {
      var test = false;

      _.each(data, function(d) {
        _.each(unique, function(elem, k) {
          if (_.isFunction(unique[k])) {
            test = unique[k].call(context, d[k], newData[k], d, newData);
          }

          if (test)
            return true;
        });
        if (test)
          return true;
      });

      return test;
    }

    function pko(v) {
      var o = {};
      o[$pk] = v;

      return o;
    }

    ////////////////////////////
    // expose service methods //
    ////////////////////////////

    // there are two types of methods
    // wrapper manipulators and structure manipulators

    // 1) structure manipulators
    var structure = {}

    function $data(i) {

      return _.isFinite(i) 
        ? data[i] 
        : (_.isObject(i) ? _.find(data, pko(i[$pk])) : data);
    }

    function $dispatch(listener) {
      dispatch.apply(context, arguments);

      return context;
    }

    function $on(listener, callback) {
      if (!_.isArray(listener)) {
        listener = [listener];
      }

      _.each(listener, function(ltn) {
        listeners[ltn] = listeners[ltn] || [];

        if (_.isFunction(callback))
          listeners[ltn].push(callback);
      });

      return context;
    }

    function $constructor(n) {
      return classy(n || name, options, inherits, listeners);
    }
      
    function $current(c) {
      if (!_.isUndefined(c)) {
        current = (c && c[$pk]) ? $data(c) : null;
        return context;
      } else {
        return current;
      }
    }

    function $first() {
      return _.first(data);
    }

    function $last() {
      return _.last(data);
    }

    function $goNext() {
      var k = _.indexOf(data, current);

      $current(data[k+1] ? data[k+1] : current);

      return context;
    }

    function $goPrev() {
      var k = _.indexOf(data, current);

      $current(data[k-1] ? data[k-1] : current);

      return context;
    }

    function $removeAll() {
      data.length = 0;
      // WARNING
      // to not remove the assigment, use the code below
      // for (var j in indexed) delete indexed[j];
      indexed = {};

      // we can reset the ID and current
      ID = 0;
      current = null;

      dispatch.call(context, '$removeAll');

      return context;
    }

    function $removeAt(at, n) {
      var rem = data.splice(at, n || 1);

      _.each(rem, function(k) {
        if (_.isEqual(current, k))
          current = null;
        delete indexed[k[$pk]];
      });

      dispatch.call(context, '$removeAt', at, n);

      return context;
    }

    function $load(_data) {
      $removeAll();

      if (_data && _data.$data)
        _data = _data.$data();

      _.each(_data, function(d) {
        context(d).$add(true);
      });

      dispatch.call(context, '$load', _data);

      return context;
    }

    function $filter(o) {
      return _.filter(data, o);
    };

    function $find(o) {
      return _.find(data, o);
    };

    function $export() {
      return _.map(data, function(d) {
        return d.$value();
      });
    };

    function $indexed(k) {
      return k ? indexed[k] : indexed;
    };

    structure.$data = $data;
    structure.$dispatch = $dispatch;
    structure.$constructor = $constructor;
    structure.$first = $first;
    structure.$last = $last;
    structure.$goNext = $goNext;
    structure.$goPrev = $goPrev;
    structure.$load = $load;
    structure.$removeAll = $removeAll;
    structure.$removeAt = $removeAt;
    structure.$load = $load;
    structure.$filter = $filter;
    structure.$find = $find;
    structure.$export = $export;
    structure.$indexed = $indexed;

    // 2) wrapper manipulators
    var wrapper = {};

    function $add(elem, silent) {
      if (alreadyExist(elem))
        throw new Error('Unique constraint failed for Classy ' + name);

      elem = context(elem);

      data.push(elem);
      indexed[elem[$pk]] = elem;

      applyHasMany(elem);

      if (!silent)
        dispatch.call(context, '$add', elem);

      return context;
    }

    function $remove(elem) {
      delete indexed[elem[$pk]];
      _.pull(data, elem);

      if (_.isEqual(current, elem))
        current = null;

      dispatch.call(context, '$remove', elem);

      return context;
    }

    function $index(elem) {
      return _.findIndex(data, pko(elem[$pk]));
    }

    function $order(elem) {
      return $index(elem) + 1;
    }

    function $next(elem) {
      var k = _.indexOf(data, elem || current);

      return (k > -1) ? (data[k+1] ? data[k+1] : false) : false;
    }

    function $prev(elem) {
      var k = _.indexOf(data, elem || current);

      return (k > -1) ? (data[k-1] ? data[k-1] : false) : false;
    }

    function $change(a, b) {
      var k;

      _.each(b, function(c, k) {
        if (!methods.$hasMany[k]) {
          a[k] = c;
          // a.$wrapped[k] = c;
        }
      });

      dispatch.call(this, '$change', a, b);

      return this;
    }

    function $set(elem, key, value) {
      var oldValue;
      if (_.isArray(key)) {
        // TODO
      } else if(_.isPlainObject(key)) {
        $change(a, b);
      } else {
        oldValue = _.cloneDeep(elem[key]);

        elem[key] = value;
        // elem.$wrapped[key] = elem[key];
      }

      dispatch.call(this, '$set', elem, key, value, oldValue);

      return this;
    }

    function $push(elem, key, value) {

      if (_.isArray(elem[key])) {
        elem[key].push(value);
        // elem.$wrapped[key] = elem[key];
      }

      return this;
    }

    function $pull(elem, key, value) {
      if (_.isArray(elem[key])) {
        _.pull(elem[key], value);
        // elem.$wrapped[key] = elem[key];
      }

      return this;
    }

    function $concat(elem, key, value) {
      if (_.isArray(elem[key])) {
        elem[key] = elem[key].concat(value);
        // elem.$wrapped[key] = elem[key];
      }

      return this;
    }

    wrapper.$add = $add;
    wrapper.$remove = $remove;
    wrapper.$current = $current;
    wrapper.$index = $index;
    wrapper.$order = $order;
    wrapper.$next = $next;
    wrapper.$prev = $prev;
    wrapper.$change = $change;
    wrapper.$set = $set;
    wrapper.$push = $push;
    wrapper.$pull = $pull;
    wrapper.$concat = $concat;

    // all wrapper methods can be chain as default
    var unchainMethods = ['$index', '$order', '$next', '$prev'];

    var structureKeys = _.keys(structure);
    var wrapperKeys = _.keys(wrapper);

    // mix the inherits methods to each type
    if (inherits) {
      mixin(structure, _.pick(inherits, structureKeys), {chain: false, super: true, prototyped: false});
      mixin(wrapper, _.pick(inherits, wrapperKeys), {chain: true, super: true, prototyped: false});
    }

    // inherits the rest (fresh methods)
    if (inherits) {
      mixin(context, _.omit(inherits, wrapperKeys.concat(structureKeys)), {chain: false, prototyped: false});
    }

    // both methods are inserted in context
    _.assign(context, structure);
    _.assign(context, wrapper);

    // each element of (new Classy)() is a ClassyWrapper
    function ClassyWrapper(content) {
      var defs = options.$defaults || {};

      defs[$pk] = ID;

      _.defaults(content, defs);

      // set the defaults for the Object
      _.assign(this, content);

      this.$id = function $id() {
        return this[$pk];
      };

      this.$value = function $value() {
        var n = {};

        _.each(this, function(v, k) {
          if (_.indexOf(k, '$') !== 0)
            n[k] = v;

          if (options.$hasMany[k]) {
            n[k] = v.$export ? v.$export() : [];
          }
        });

        return n;
      };

      this.$isActive = function $isActive() {
        return (this === this.constructor.$current());
      };

      this.$copy = function $copy() {
        var v = this.$value();

        // remove the $pk key
        delete v[$pk];

        return context(v);
      };

      // rewrite some special methods (exceptions)
    }

    context.constructor = ClassyWrapper;

    mixin(ClassyWrapper, wrapper, {chain: true, super: true, unchain: unchainMethods});

    return context;
  }

  function classy(name, options, inherits, listeners) {
    if (!_.contains(classyList, name))
      classyList.push(name);
    else
      console.info("The class "+name+" already exist, may comflict with others.");

    return ClassyBuilder(name, options, inherits, listeners);
  }

  classy.mixin = mixin;


  if (exports.Classy) {
    console.info("The library Classy is already loaded.");
  } else {
    exports.Classy = classy;
  }

}(window));
