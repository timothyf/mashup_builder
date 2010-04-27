/**
 * UnitAction
 */
var UnitAction = mb.lang.defineClass({
  // type : String
  // label : String
  // description : String
  // isInputAdaptive : Boolean
  // inputs : Hash(String, InputDef) 
  // pack : UnitActionPackage
  // 
  // InputDef : {
  //   name : String
  //   type : String
  //   label : String
  //   description : String
  //   default : Object
  // }

  _className : 'UnitAction',

  initialize : function(props) {
    mb.lang.extend(this, props);
    this.inputs = {};
    var _this = this;
    mb.lang.forEach(props.inputs || [], function(inputDef) {
      _this.inputs[inputDef.name] = inputDef;
    })
  }
  ,
  getQualifiedType : function() {
    return this.pack.namespace + '.' + this.type;
  }
  ,
  prepare : function(/*ActionRequest*/request, /*Responder*/next) {
    request.readAll(next);
  }
  ,
  execute : function(/*ActionRequest*/request, /*Responder*/callback) {
    callback.onSuccess();
  }
  ,
  prepareInnerParams : function(/*ActionRequest*/request, /*Responder*/callback) {
    callback.onSuccess();
  }
})


var UnitActionPackage = mb.lang.defineClass({
  _className : 'UnitActionPackage',

  initialize : function(namespace, props) {
    this.namespace = namespace;
    mb.lang.extend(this, props || {});
    this.uactions = {};
    this.loaded = false;
    var _this = this;
    this.setup(function() {
      _this.loaded = true;
    })
  }
  ,
  listUnitActions : function() {
    return mb.lang.values(this.uactions);
  }
  ,
  findUnitAction : function(type) {
    return this.uactions[type]; 
  }
  ,
  register : function(uaction) {
    this.uactions[uaction.type] = uaction;
    uaction.pack = this;
  }
  ,
  setup : function(callback) { 
    callback();
  }
}, Broadcaster /* super class */);


var UnitActionPackageRegistry = mb.lang.defineClass({ 
  // scripts : Array(String)
  // nsmap : Hash(String, String)
  // packages : Hash(String, UnitActionPackage)
  
  _className : 'UnitActionPackageRegistry',

  initialize : function() {
    // superclass init
    Broadcaster.prototype.initialize.apply(this);

    this.scripts = [];
    this.nsmap = {};
    this.packages = {};
  }
  ,
  register : function(pack, scriptname) {
    this.packages[pack.namespace] = pack;
    if (scriptname) {
      var regexp = new RegExp("/"+scriptname.replace(/\./g, '\\.')+"$");
      var scriptURL = mb.lang.find(
        this.scripts, 
        function(scriptURL){ return regexp.test(scriptURL) }
      );
      if (scriptURL) this.nsmap[pack.namespace] = scriptURL;
      else this.nsmap[pack.namespace] = scriptname;
    }
    this.fire('register', pack);
  }
  ,
  unregister : function(namespace) {
    if (this.packages[namespace]) delete this.packages[namespace];
    if (this.nsmap[namespace]) delete this.nsmap[namespace]; 
    this.fire('unregister', namespace);
  }
  ,
  findPackage : function(namespace) {
    return this.packages[namespace];
  }
  ,
  findUnitAction : function(nstype) {
    var namespace = nstype.split('.').slice(0,-1).join('.');
    var type = nstype.split('.').pop();
    var pack = this.packages[namespace]; 
    return pack && pack.findUnitAction(type);
  }
  ,
  loadScript : function(scriptUrl, overwrite) {
    var s = mb.lang.find(this.scripts, function(s){ return s==scriptUrl });
    if (s && !overwrite) return;
    if (!s) this.scripts.push(scriptUrl);
    mb.lang.loadScript(scriptUrl);
  }
  ,
  scriptBaseURL : (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i=0; i<scripts.length; i++) {
      var m = scripts[i].src.match(/(.*)\/mb-core\.js$/);
      if (m) {
        var scriptBaseURL = m[1];
        if (scriptBaseURL.indexOf('./')==0) {
          scriptBaseURL = location.href.replace(/[^\/]*$/,'') + scriptBaseURL.substring(2);
        }
        return scriptBaseURL;
      }
    }
  })()
  ,
  getDependencies : function(processDef) {
    var reg = this;
    var nsscript = {};
    function _getDependentScripts(procdef) {
      mb.lang.forEach(mb.lang.values(procdef.actions), function(actionDef) {
        var namespace = actionDef.uaction.pack.namespace;
        var scriptURL = reg.nsmap[namespace];
        if (scriptURL) nsscript[namespace] = scriptURL;
        if (actionDef.innerProcess) _getDependentScripts(actionDef.innerProcess);
      });
    }
    _getDependentScripts(processDef);
    return nsscript;
  }
  ,
  waitLoadComplete : function(namespaces, onLoaded, onTimeout) {
    mb.lang.poll({
      work : function() {
        var p = mb.packages;
        for (var i=0; i<namespaces.length; i++) {
          if (!p.findPackage(namespaces[i])) return false;
        }
        return true;
      },
      callback : onLoaded,  
      errback : onTimeout,
      timeout : 10000,
      interval : 500
    });
  }
  ,
  listPackages : function() {
    return mb.lang.values(this.packages);
  }
  ,
  toConfig : function() {
    var _this = this;
    return jQuery.map(
      mb.lang.keys(this.nsmap),
      function(namespace) {
        return { namespace : namespace, url : _this.nsmap[namespace] };
      }
    );
  }
}, Broadcaster /* superclass */);


mb.packages = new UnitActionPackageRegistry();

mb.UnitAction = UnitAction;
mb.UnitActionPackage = UnitActionPackage;
mb.UnitActionPackageRegistry = UnitActionPackageRegistry;


var ActionInstance = mb.lang.defineClass({
  // definition : ActionDef
  // process : ProcessInstance
  // callbackQueue : Responder[] 
  // status : String
  // value : Object
  // timestamp : integer
  
  _className : 'ActionInstance',
  
  initialize : function(definition, process) {
    // superclass init
    Broadcaster.prototype.initialize.apply(this);

    this.definition = definition;
    this.process = process;
    this.callbackQueue = [];
    this.status = ActionInstance.Status.WAIT;

    this.addListener('change', this.process.onValueChange, this.process);
    this.definition.addListener('change', this.clear, this);
    this.definition.addListener('destroy', this.destroy, this);
    if (mb.debug.on) {
      this.addListener('status', this.statusDebug, this);
    }
 
  }
  ,
  prepareInnerParams : function(callback) {
    callback = mb.async.responder(callback);
    var uaction = this.definition.uaction;
    var request = new ActionRequest(this);
    uaction.prepare(request, {
      onSuccess : function() {
        uaction.prepareInnerParams(request, callback);
      },
      onFailure : callback.onFailure
    });
  }
  ,
  evaluate : function(callback) {
    this.callbackQueue.push(callback);
    if (this.status == ActionInstance.Status.WAIT) {
      mb.lang.delay(this.prepare, 1)
                 .call(this, new ActionRequest(this));
    }
  }
  ,
  prepare : function(request) {
    this.changeStatus(ActionInstance.Status.PREPARE)
    var _this = this;
    this.definition.uaction.prepare(request, {
      onSuccess : function() {
        if (!_this.definition.uaction.nocaching && _this.timestamp && request.timestamp < _this.timestamp) {
          // using previous cache
          _this.dispatch(request);
        } else {
          _this.execute(request); 
        }
      },
      onFailure : function(error) {
        _this.error(request, error)
      }
    })
  }
  ,
  execute : function(request) {
    this.changeStatus(ActionInstance.Status.EXECUTE);
    var _this = this;
    try {
      this.definition.uaction.execute(request, {
        onSuccess : function(value) {
          _this.value = value;
          _this.timestamp = new Date().getTime();
          _this.fire('change', _this.definition.name, _this.value);
          _this.dispatch(request);
        },
        onFailure : function(error) {
          _this.error(request, error)
        }
      });
    } catch (e) {
      this.error(request, e);
    }
  }
  ,
  dispatch : function(request) {
    this.changeStatus(ActionInstance.Status.DISPATCH);
    while(this.callbackQueue.length>0) {
      try {
        var callback = this.callbackQueue.pop();
        mb.lang.delay(callback.onSuccess, this.definition.uaction.waittime || 1)
                   .call(callback, { value : this.value, timestamp : this.timestamp });
      } catch(e) { 
        mb.debug.log(e)
      }
    }
    this.changeStatus(ActionInstance.Status.WAIT);
  }
  ,
  error : function(request, error) {
    this.changeStatus(ActionInstance.Status.ERROR); 
    while(this.callbackQueue.length>0) {
      var callback = this.callbackQueue.pop();
      mb.lang.delay(callback.onFailure, this.definition.uaction.waittime || 1)
                 .call(callback, error)
    }
    this.changeStatus(ActionInstance.Status.WAIT);
  }
  ,
  clear : function() {
    this.timestamp = 0;
  }
  ,
  changeStatus : function(status) {
    this.status = status;
    this.fire('status', status);
  }
  ,
  statusDebug : function(status) {
    mb.debug.log(this.definition.name + ': ' + this.status);
  }
  ,
  destroy : function() {
    this.definition.removeListener('change', this.clear);
    this.definition.removeListener('destroy', this.destroy);
    delete this.process.actions[this.definition.name];
  }
}, Broadcaster /* superclass */)

ActionInstance.Status = {
  WAIT : 'WAIT',
  PREPARE : 'PREPARE',
  EXECUTE : 'EXECUTE',
  DISPATCH : 'DISPATCH',
  ERROR : 'ERROR'
}


var ActionRequest = mb.lang.defineClass({
  // action : ActionInstance
  // timestamp : Number
  // params : Hash(String, Object)
  _className : 'ActionRequest',

  initialize : function(action) {
    this.action = action;
    this.params = {};
    this.timestamp = 0;
  }
  ,
  readParam : function(name, next) {
    var obj = {};
    obj[name] = this.action.definition.inputs[name];
    this.read(obj, next);
  }
  ,
  readAll : function(next) {
    var inputs = this.action.definition.inputs;
    if (inputs) {
      this.read(inputs, next);
    } else {
      next.onSuccess();
    }
  }
  ,
  read : function(obj, next) {
    var _this = this;
    this.action.process.evaluate(obj, {
      onSuccess : function(result) {
        if (!_this.timestamp || result.timestamp > _this.timestamp) {
          _this.timestamp = result.timestamp;
        } 
        for (var name in result.value) {
          var value = result.value[name];
          var inputDef = _this.action.definition.uaction.inputs[name];
          _this.params[name] = inputDef ? 
                              mb.lang.cast(inputDef.type, value) :
                              value;
        }
        next.onSuccess();
      },
      onFailure : next.onFailure
    })
  }
})

mb.ActionInstance = ActionInstance;
mb.ActionRequest = ActionRequest;