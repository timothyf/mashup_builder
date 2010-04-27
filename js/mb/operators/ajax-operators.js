/**
 * Ajax Package
 */

(function() {

var ajax = new mb.UnitActionPackage('Ajax');

ajax.register(new mb.UnitAction({
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
    mb.ajax.request({
      path : request.params['path'],
      method : request.params['method'] || 'GET',
      mimeType : request.params['mimeType']
    }, callback);
  }

}));

ajax.register(new mb.UnitAction({
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
      var proxy      = mb.config.JSONP_PROXY_URL+"?responseFormat="+format+"&url=";
      var urlEncoded = mb.url.urlEncode(request.params['url']);
      url = proxy + urlEncoded;
      jsonpParam = "callback";
    }
    else
    {
      url = request.params['url'];
      jsonpParam = request.params['jsonpParam'];
    }

    mb.ajax.jsonp.invoke(
      url,
      callback,
      { jsonpParam : jsonpParam });
  }
}))

// if in mb editor
if (mb.editor) {
  mb.packages.loadScript(mb.packages.scriptBaseURL + '/operators/ajax-operators-widgets.js');
}

mb.packages.register(ajax, mb.packages.scriptBaseURL + '/operators/ajax-operators.js');

})();
