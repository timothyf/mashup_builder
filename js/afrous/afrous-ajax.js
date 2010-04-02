afrous.ajax = {

  createXMLHttpRequest : function() { 
    if (window.XMLHttpRequest) {
      // safari seems not allowing XMLHttpRequest in opened window
      if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
        var w = (function(w){
          return w.opener ? arguments.callee(w.opener) : w; 
        })(window);
        return new w.XMLHttpRequest();
      } else {
        return new XMLHttpRequest();
      }
    } else if (window.ActiveXObject) {
      try {
        return new ActiveXObject("Msxml2.XMLHTTP");
      } catch(e) {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
  }
  ,
 
  request : function(params, callback) {
    callback = mbuilder.async.responder(callback);
    params = mbuilder.lang.extend({
      timeout : 10000
    }, params);

    mbuilder.debug.log(params.method + ' ' + params.path);

    var req = this.createXMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState==4) {
        if (req.status>=200 && req.status<=206) {
          var result = afrous.ajax.parseResponse(params.mimeType, req);
          callback.onSuccess(result);
        } else {
          callback.onFailure(req.responseText);
        }
      }
    };

    req.open(params.method, params.path, true);
    req.setRequestHeader('If-Modified-Since', 'Wed, 15 Nov 1995 00:00:00 GMT');
    if (params.contentType) {
	    req.setRequestHeader('Content-Type', params.contentType);
    }
    req.send(params.data);
  }
  ,

  parseResponse : function(mimeType, req) {
    if (mimeType=='text/json' || mimeType=='application/json') {
      return mbuilder.lang.parseJSON(req.responseText); 
    } else if (mimeType=='text/xml' || mimeType=='application/xml' || 
               mimeType=='application/atom') {
      return req.responseXML || new DOMParser().parseFromString(req.responseText, 'text/xml'); 
    } else if (mimeType=='text/html') {
      var bodyHTML = req.responseText.replace(/.*<body.*?>/i, '').replace(/<\/body>.*/i, '');
      var iframe = mbuilder.dom.createElement({
        tagName : 'iframe',
        style : 'width:0px; heiht:0px; visibility:hidden; position:absolute;'
      });
      document.body.appendChild(iframe);
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write('<html><head></head><body></body></html>');
      doc.close();
      doc.getElementsByTagName('body')[0].innerHTML = bodyHTML;
      return doc.documentElement;
    } else {
      return req.responseText;
    }
  }
  ,

  iframeRequest : function(path, callback) {
    var iframe = mbuilder.dom.createElement({
      tagName : 'iframe',
      style : 'width:0px; heiht:0px; visibility:hidden; position:absolute;'
    });
    if (document.all) { // if IE
      iframe.onreadystatechange = function () {
        if (iframe.readyState == "complete") {
          onContentReady();
          iframe.onreadystatechange = null;
        }
      }
    } else {
      iframe.onload = onContentReady;
    }
    document.body.appendChild(iframe);
    iframe.contentWindow.location.href = path;

    function onContentReady() {
      callback({
        document : iframe.contentWindow.document,
        cleanup : function() {
          iframe.parentNode.removeChild(iframe);
        }
      });
    }

  }
  ,

  jsonp : {
    count : 0,
    callbacks : {},

    invoke : function (url, callback, options) {
      callback = mbuilder.async.responder(callback);
      options = mbuilder.lang.extend({
        charset : 'utf-8',
        jsonpParam : 'callback',
        globalCallback : false,
        timeout : 30000
      }, options || {})

      var index = '_'+(this.count++);
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = options.charset;
      var callbackContainer = options.globalCallback ? window : afrous.ajax.jsonp.callbacks;
      var callbackPrefix = options.globalCallback ? '' : 'afrous.ajax.jsonp.callbacks.';
      var callbackName = options.globalCallback ? 'afrous_ajax_jsonp_callbacks'+index : index; 
      script.src = url + (url.indexOf('?')>0 ? '&' : '?') + 
                   options.jsonpParam + '=' + callbackPrefix + callbackName;

      mbuilder.debug.log(script.src);

      callbackContainer[callbackName] = function() {
        if (callbackContainer[callbackName]) {
          script.parentNode.removeChild(script);
          callback.onSuccess(
            arguments.length==1 ?
            arguments[0] :
            Array.prototype.slice.apply(arguments)
          );
          delete callbackContainer[callbackName];
        }
      }

      mbuilder.dom.scriptContainerElem.appendChild(script); 

      window.setTimeout(function() {
        if (callbackContainer[callbackName]) {
          callbackContainer[callbackName] = mbuilder.lang.emptyFunc; // suppress error
          script.parentNode.removeChild(script);
          callback.onFailure({ error : 'timeout' });
        }
      }, options.timeout)
    }
  }
};
