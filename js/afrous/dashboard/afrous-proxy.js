/*
 * Afrous Dashboard - ExtJS Proxy for Afrous process
 *
 */
var AfrousProxy = function(config) {
  AfrousProxy.superclass.constructor.apply(this);
  Ext.apply(this, config);
}

Ext.extend(AfrousProxy, Ext.data.DataProxy, {
  load : function(params, reader, callback, scope, arg) {
    var context = {
      params : params,
      reader : reader,
      callback : callback,
      scope : scope,
      arg : arg
    };

    this.queryRecordSize(context);
  }
  ,

  setupProcess : function(next) {
    var _this = this;
    if (!this.procconf && this.key) {
      afrous.processes.loadProcessConfig(this.key, function(config) {
        _this.procconf = config;
        _this.procdef = new afrous.ProcessDef(_this.procconf)
        _this.proc = new afrous.ProcessInstance(_this.procdef);
        next();
      });
    } else {
      if (this.procconf && !this.procdef) {
        this.procdef = new afrous.ProcessDef(this.procconf);
        this.proc = new afrous.ProcessInstance(this.procdef);
      }
      next();
    }
  }
  ,

  queryRecordSize : function(context) {
    var _this = this;
    if (!this.proc) {
      this.setupProcess(function() { _this.queryRecordSize(context) });
      return;
    }
    var params = context.params;
    this.proc.setParam('condition', params.condition);
    this.proc.evaluate(this.recordSizeExpr, {
      onSuccess : function(result) { _this.receiveRecordSize(result.value, context) },
      onFailure : function(error) { _this.handleFailure(error, context) }
    })
  }
  ,

  receiveRecordSize : function(size, context) {
    context.size = size;
    this.queryRecords(context);
  }
  ,

  queryRecords : function(context) {
    var _this = this;
    if (!this.proc) {
      this.setupProcess(function() { _this.queryRecords(context) });
      return;
    }
    var params = context.params;
    this.proc.setParam('condition', params.condition);
    this.proc.setParam('start', params.start || 0);
    if (params.limit) this.proc.setParam('limit', params.limit);
    if (params.sort) this.proc.setParam('sort', params.sort);
    if (params.dir) this.proc.setParam('dir', params.dir);
    this.proc.evaluate(this.recordsExpr, {
      onSuccess : function(result) { _this.receiveRecords(result.value, context) },
      onFailure : function(error) { _this.handleFailure(error, context) }
    })
  }
  ,

  receiveRecords : function(records, context) {
    var o = {
      size : context.size,
      records : records
    }
    var result;
    try {
      result = context.reader.readRecords(o);
    } catch (e) {
      this.fireEvent("loadexception", this, o, context.arg, e);
      context.callback.call(context.scope, null, context.arg, false);
      return;
    }
    this.fireEvent("load", this, result, context.arg);
    context.callback.call(context.scope, result, context.arg, true);
  }
  ,

  handleFailure : function(error, context) {
    this.fireEvent("loadexception", this, null, context.arg);
    context.callback.call(context.scope, null, context.arg, false);
  }
  ,

  abort : function() {
    AfrousProxy.superclass.abort.apply(this, arguments);
  }

});

