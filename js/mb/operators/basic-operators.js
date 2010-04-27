/**
 * Basic Package
 */ 
var basic = new mb.UnitActionPackage('Basic');

basic.register(new mb.UnitAction({
  type : 'Object',
  label : 'New Object',
  description : 'Create new object, extending from base object.',
  inputs : [
    { name : 'object',
      label : 'base object',
      type : 'Object' }
  ],
  allowDynamicInput : true,
  execute : function(request, callback) {
    var obj = request.params['object'] || {};
    if (mb.lang.isObject(obj)) {
      obj = mb.lang.extend({}, obj); 
      var params = mb.lang.extend({}, request.params);
      delete params['object'];
      mb.lang.extend(obj, params)
    }
    callback.onSuccess(obj);
  }
}));

basic.register(new mb.UnitAction({
  type : 'KeyValue',
  label : 'Key/Value Pair List',
  description : 'Create an array from an object, which contains key/value pair of the object properties.',
  inputs : [
    { name : 'object',
      label : 'object',
      type : 'Object' }
  ]
  ,
  execute : function(request, callback) {
    var obj = request.params['object'];
    var keyvalues = jQuery.map(
      mb.lang.keys(obj), 
      function(key){
        return { key : key, value : obj[key] };
      }
    );
    callback.onSuccess(keyvalues);
  }
}));

basic.register(new mb.UnitAction({
  type : 'Branch',
  label : 'Branch',
  description : 'Branch evaluation path according to given condition. Note that evaluation occurs only in choosen path.',
  inputs : [
    { name : 'condition',
      label : 'condition',
      type : 'Boolean' }
    ,
    { name : 'ifTrue',
      label : 'if condition is true',
      type : 'Object' }
    ,
    { name : 'ifFalse',
      label : 'if condition is false',
      type : 'Object' }
  ]
  ,
  prepare : function(request, next) {
    request.readParam('condition', next);
  }
  ,
  execute : function(request, callback) {
    if (request.params['condition']) {
      request.readParam('ifTrue', {
        onSuccess : function() { callback.onSuccess(request.params['ifTrue']) },
        onFailure : callback.onFailure
      });
    } else {
      request.readParam('ifFalse', {
        onSuccess : function() { callback.onSuccess(request.params['ifFalse']) },
        onFailure : callback.onFailure
      });
    }
  } 
}));


basic.register(new mb.UnitAction({
  type : 'Cast',
  label : 'Cast',
  description : 'Force-casting given value to specified type.',
  inputs : [
    { name : 'value',
      label : 'value to cast',
      type : 'Object' },
    { name : 'type',
      label : 'data type',
      type : 'String',
      options : ['integer', 'float', 'string', 'date' ] },
    { name : 'isarray',
      label : 'array?',
      type : 'Boolean',
      options : ['true','false'] }
  ],
  execute : function(request, callback) {
    var value = request.params['value'];
    var type = request.params['type'];
    var isArray = request.params['isarray'];
    if (!value || !type) callback.onFailure();
    if (isArray) type += '[]';

    callback.onSuccess(mb.lang.cast(type, value));
  }
}));

mb.packages.register(basic);
