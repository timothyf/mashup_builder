/**
 * Ajax Package
 */

(function() {

var ajax = new afrous.UnitActionPackage('Ajax');

ajax.register(new afrous.UnitAction({
  type : 'XMLHttp',
  label : 'XMLHttp call',
  description : '',
  inputs : [
    { name : 'path',
      label : 'Request Path',
      type : 'String' },
    { name : 'method',
      label : 'Method',
      type : 'String',
      options : ['GET','POST'] },
    { name : 'mimeType',
      label : 'MIME Type',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    afrous.ajax.request({
      path : request.params['path'],
      method : request.params['method'] || 'GET',
      mimeType : request.params['mimeType']
    }, callback);
  }

}));

ajax.register(new afrous.UnitAction({
  type : 'JSONP',
  label : 'JSONP call',
  description : '',
  inputs : [
    { name : 'url',
      label : 'Service URL',
      type : 'String',
      size : 'large' },
    { name : 'formatField',
      label : 'Response format',
      type : 'String',
      options : ['JSONP', 'JSON', 'XML'],
      selected : 'JSONP' },
    { name : 'jsonpParam',
      label : 'JSONP callback parameter',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var format = request.params['formatField'];
    var url        = null;
    var jsonpParam = null;
    if(format == 'JSON' || format == 'XML')
    {
      var proxy      = afrous.config.JSONP_PROXY_URL+"?responseFormat="+format+"&url=";
      var urlEncoded = afrous.url.urlEncode(request.params['url']);
      url = proxy + urlEncoded;
      jsonpParam = "callback";
    }
    else
    {
      url = request.params['url'];
      jsonpParam = request.params['jsonpParam'];
    }

    afrous.ajax.jsonp.invoke(
      url,
      callback,
      { jsonpParam : jsonpParam });
  }
}))

// if in afrous editor
if (afrous.editor) {
  afrous.packages.loadScript(afrous.packages.scriptBaseURL + '/operators/ajax-operators-widgets.js');
}

afrous.packages.register(ajax, afrous.packages.scriptBaseURL + '/operators/ajax-operators.js');

})();
