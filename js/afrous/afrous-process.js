
var ProcessDef = mbuilder.lang.defineClass({
  // name : String
  // params : Hash(String, ParamDef)
  // output : String(EL) 
  // actions : Hash(String, ActionDef)
  // 
  // ParamDef : ({
  //   name : String
  //   type : String
  //   label : String
  //   description : String
  //   default : Object
  // })

  _className : 'ProcessDef',

  initialize : function(config) {
    // superclass init
    Broadcaster.prototype.initialize.apply(this);

    this.params = {};
    this.actions = {};
    this.actionCount = 0;
    if (config) {
      this.loadConfig(config);
    }
  }
  ,
  loadConfig : function(config) {
    var _this = this;
    this.name = config.name;
    this.description = config.description;

    mbuilder.lang.forEach(config.params || [], function(pconfig) {
      _this.addParamDef(pconfig);
    });
    this.output = config.output;

    mbuilder.lang.forEach(config.actions || [], function(aconfig) {
      _this.addActionDef(new ActionDef(aconfig));
    })

    this.onChange();
  }
  ,
  onChange : function() {
    this.fire('change');
  }
  ,
  onDestroy : function() {
    this.fire('destroy');
  }
  ,
  setName : function(name) {
    this.name = name;
    this.onChange();
  }
  ,
  setDescription: function(description) {
    this.description = description;
  }
  ,
  setOutput : function(output) {
    this.output = output;
    this.onChange();
  }
  ,
  addParamDef : function(paramDef) {
    if (this.params[paramDef.name]) {
      throw 'Given param name is already defined';
    }
    this.params[paramDef.name] = paramDef;
    this.onChange();
  }
  ,
  removeParamDef : function(name) {
    if (this.params[name]) delete this.params[name];
    this.onChange();
  }
  ,
  addActionDef : function(actionDef) {
    if (this.actions[actionDef.name]) {
      throw 'Given action name is already defined';
    }
    this.actions[actionDef.name] = actionDef;
    actionDef.order = this.actionCount++;
    actionDef.addListener('change', this.onChange, this);
    this.onChange();
  }
  ,
  removeActionDef : function(name) {
    var actionDef = this.actions[name];
    if (actionDef) {
      actionDef.removeListener('change', this.onChange);
      actionDef.destroy();
      delete this.actions[name];
      this.onChange();
    }
  }
  ,
  findActionDef : function(name) {
    return this.actions[name];
  }
  ,
  toConfig : function() {
    return {
      name : this.name || '',
      description : this.description || '',
      requires : afrous.packages.getDependencies(this),
      params : mbuilder.lang.values(this.params),
      output : this.output || '',
      actions : jQuery.map(
                  mbuilder.lang.values(this.actions).sort(function(a1, a2) {
                    return a1.order - a2.order;
                  }),
                  function(action) {
                    return action.toConfig();
                  }
                )
    };
  }
  ,
  serialize : function() {
    return mbuilder.lang.toJSON(this.toConfig());
  }
  ,
  destroy : function() {
    var _this = this;
    mbuilder.lang.forEach(mbuilder.lang.values(this.actions), function(actionDef) {
      actionDef.removeListener('change', _this.onChange);
      actionDef.destroy();
    });

    this.onDestroy();
  }
}, Broadcaster /* super class */)


var ActionDef = mbuilder.lang.defineClass({
  // name : String
  // uaction : UnitAction
  // inputs : Hash(String, String)
  // nocaching : Boolean
  // innerProcess : ProcessDef?
  // order : Integer
  
  _className : 'ActionDef',

  initialize : function(config) {
    // superclass init
    Broadcaster.prototype.initialize.apply(this);
    if (config) {
      this.loadConfig(config)
    }
  }
  ,
  loadConfig : function(config) {
    this.name = config.name;
    this.type = config.type;
    this.uaction = afrous.packages.findUnitAction(config.type);
    if (!this.uaction) throw "No UnitAction registered : "+config.type;
    this.inputs = config.inputs;
    this.nocaching = config.nocaching || false;
    if (config.innerProcess) {
      this.setInnerProcess(new ProcessDef(config.innerProcess));
    }
    this.config = config;
    this.onChange();
  }
  ,
  setName : function(name) {
    this.name = name;
    this.onChange();
  }
  ,
  setInputs : function(inputs) {
    this.inputs = inputs;
    this.onChange();
  }
  ,
  setInnerProcess : function(innerProcess) {
    this.innerProcess = innerProcess;
    this.innerProcess.addListener('change', this.onChange, this);
  }
  ,
  onChange : function() {
    this.fire('change');
  }
  ,
  onDestroy : function() {
    this.fire('destroy');
  }
  ,
  toConfig : function() {
    this.config.name = this.name;
    this.config.type = this.type;
    if (this.inputs) this.config.inputs = this.inputs;
    if (this.innerProcess) {
      this.config.innerProcess = this.innerProcess.toConfig();
      delete this.config.innerProcess['params'];
    }
    return this.config;
  }
  ,
  destroy : function() {
    if (this.innerProcess) {
      this.innerProcess.removeListener('change', this.onChange);
    }

    this.onDestroy();
  }
}, Broadcaster /* super class */);


var ProcessRegistry = mbuilder.lang.defineClass({
  //configs : Hash(String, ProcessConf)
  //processes : Hash(String, ProcessDef) 
  //callbackQueues : Hash(String, Responder[])
  
  _className : 'ProcessRegistry',

  initialize : function() {
    this.configs = {};
    this.processes = {};
    this.callbackQueues = {};
  }
  ,
  loadProcessConfig : function(key, callback) {
    var config = this.configs[key]
    if (config) {
      if (typeof callback == 'function') callback(config);
      return config;
    }
    if (typeof callback == 'function') {
      var callbackQueue = this.callbackQueues[key]
      if (!callbackQueue) {
        callbackQueue = this.callbackQueues[key] = [];
      }
      callbackQueue.push(callback);
    }
    mbuilder.lang.loadScript(mbuilder.config.PROCESS_REGISTRY_URL + '?id=' + key);
  }
  ,
  loadProcessDef : function(key, callback) {
    var procdef, config;
    if (procdef = this.processes[key]) {
      if (typeof callback == 'function') callback(procdef);
      return procdef;
    } 
	else if (config = this.configs[key]) {
      procdef = this.processes[key] = new ProcessDef(config);
      if (typeof callback == 'function') callback(procdef);
      return procdef;
    } 
	else {
      var _this = this;
      this.loadProcessConfig(key, function() {
        _this.loadProcessDef(key, callback);
      });
    }
  }
  ,
  register : function(key, conf) {
    this.configs[key] = conf;
    var callbackQueue = this.callbackQueues[key];
    while (callbackQueue.length>0) {
      var callback = callbackQueue.pop();
      callback(conf);
    }
  }
});


mbuilder.processes = new ProcessRegistry();


var ProcessInstance = mbuilder.lang.defineClass({
  // definition : ProcessDef
  // parentProc : ProcessInstance?
  // actions : Hash(String, ActionInstance)
  // params : Hash(String, {
  //   value : Object
  //   timestamp : integer
  // }) 
  
  _className : 'ProcessInstance',

  initialize : function(definition, parentProc) {
    // superclass init
    Broadcaster.prototype.initialize.apply(this);

    this.definition = definition;
    this.parentProc = parentProc;
    this.actions = {};
    this.params = {}; 
  }
  ,
  start : function(callback) {
    callback = mbuilder.async.responder(callback);
    var _this = this;
    this.evaluate(this.definition.output, {
      onSuccess : function(result) {
        callback.onSuccess(result.value);
      },
      onFailure : callback.onFailure
    });
  }
  ,
  setParam : function(name, value) {
    var paramDef = this.definition.params[name];
    if (paramDef) {
      value = mbuilder.lang.cast(paramDef.type, value);
    }
    this.params[name] = new ProcessParam(value);
    this.onValueChange(name, value);
  }
  ,
  resolveRef : function(name) {
    var ref = this.params[name] || this.actions[name];
    if (!ref) {
      var paramDef = this.definition.params[name];
      if (paramDef && typeof paramDef['default'] != 'undefined') {
        var value = mbuilder.lang.cast(paramDef.type, paramDef['default']); 
        this.params[name] = new ProcessParam(value);
        ref = this.params[name];
      } else {
        var actionDef = this.definition.findActionDef(name);
        if (actionDef) {
          this.actions[name] = new ActionInstance(actionDef, this);
          ref = this.actions[name];
        } else if (this.parentProc) {
          ref = this.parentProc.resolveRef(name);
        }
      }
    }
    return ref;
  }
  ,
  evaluate : function(expr, callback) {
    callback = mbuilder.async.responder(callback);
    var vars = EL.extractVars(expr) || [];
    var _this = this;
    mbuilder.async.map(
      vars,
      function(v, i, vars, cb) {
        cb = mbuilder.async.responder(cb);
        var ref = _this.resolveRef(v);
        if (ref) {
          ref.evaluate({
            onSuccess : function(result) {
              cb.onSuccess({
                name : v,
                value : result.value, 
                timestamp : result.timestamp
              })
            },
            onFailure : cb.onFailure
          })
        } else {
          cb.onFailure();
        }
      }
      ,
      { 
        onSuccess : function(results) {
          var timestamp = 0;
          var context = {};
          mbuilder.lang.forEach(results, function(result) {
            timestamp = result.timestamp>timestamp ? result.timestamp : timestamp;
            context[result.name] = result.value;
          })
          var value = EL.evaluate(context, expr);
          callback.onSuccess({ timestamp : timestamp, value : value });
        }
        ,
        onFailure : callback.onFailure
      }
    )
  }
  ,
  onValueChange : function(name, value) {
    this.fire('refreshed', name, value);
  }
  ,
  destroy : function() {
    mbuilder.lang.forEach(mbuilder.lang.values(this.actions), function(action) {
      action.destroy();
    })
  }
}, Broadcaster /* superclass */);



var ProcessParam = mbuilder.lang.defineClass({
  // value : Object
  // timestamp : integer
  
  _className : 'ProcessParam',

  initialize : function(value) {
    this.value = value;
    this.timestamp = new Date().getTime();
  },
  evaluate : function(callback) {
    mbuilder.lang.delay(callback.onSuccess, 1)
               .call(callback, { value : this.value, timestamp : this.timestamp })
  }
})

mbuilder.ProcessDef = ProcessDef;
mbuilder.ActionDef = ActionDef;
mbuilder.ProcessRegistry = ProcessRegistry;
mbuilder.ProcessParam = ProcessParam;
mbuilder.ProcessInstance = ProcessInstance;
