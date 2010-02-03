/*  
  Afrous JavaScript - Core 
  version 1.1
  (c) 2007 - 2008 Shinichi Tomita (stomita@mashmatrix.com)

  Afrous Core is freely distributable under the terms of an MIT-style license.
  For details, see the Afrous web site: http://www.afrous.com/
*/

var afrous;
if (!afrous) afrous = {};

(function() {

afrous.lang = {

  /**
   * Adds the content of the second hash map (src param) in the first one (dest 
   * param). If a key is already defined in the first hash map, its value is 
   * overriden with the value which this key has in de second hash map.
   * tenga en el segundo
   * @param dest destination hash
   * @param src source hash
   */
  extend : function(dest, src) {
    for (var prop in src) {
      dest[prop] = src[prop];
    }
    return dest;
  }
  ,

  defineClass : function(props, superClass) {
    var f = function() {
      this.initialize.apply(this, arguments);
    }
    f.prototype = {};
    if (superClass && superClass.prototype) {
      afrous.lang.extend(f.prototype, superClass.prototype)
    }
    afrous.lang.extend(f.prototype, props);
    return f;
  }
  ,

  /**
   * Return the names of all the functions defined in a hash map.
   */
  keys : function(obj) {
    var keys = [];
    for (var prop in obj) {
      if (!afrous.lang.isFunction(obj[prop])) keys.push(prop);
    }
    return keys;
  }
  ,

  /**
   * Return all the functions defined in a hash map (they appears like values).
   */
  values : function(obj) {
    var values = [];
    for (var prop in obj) {
      if (!afrous.lang.isFunction(obj[prop])) values.push(obj[prop]);
    }
    return values;
  }
  ,

  forEach : function(arr, callback, thisObj) {
    for (var i=0,len=arr.length; i<len; i++) {
      callback.call(thisObj, arr[i], i, arr);
    }
  }
  ,

  map : function(arr, callback, thisObj) {
    for (var i=0,ret=[],len=arr.length; i<len; i++) {
      ret.push(callback.call(thisObj, arr[i], i, arr));
    }
    return ret;
  }
  ,

  filter : function(arr, callback, thisObj) {
    for (var i=0,ret=[],len=arr.length; i<len; i++) {
      if (callback.call(thisObj, arr[i], i, arr)) ret.push(arr[i]);
    }
    return ret;
  }
  ,

  find : function(arr, callback, thisObj) {
    for (var i=0,len=arr.length; i<len; i++) {
      if (callback.call(thisObj, arr[i], i, arr)) return arr[i];
    }
  }
  ,

  indexOf : function(arr, value) {
    for (var i=0,len=arr.length; i<len; i++) {
      if (arr[i]==value) return i;
    }
  }
  ,

  bind : function(func, thisObj) {
    return function() { func.apply(thisObj, arguments) }
  }
  ,

  /**
   * Returns a new function thats evaluate the function passed as param with 
   * a delay.
   * @param func the function
   * @param msec the delay in miliseconds
   */
  delay : function(func, msec) {
    return function() {
      var _this = this;
      var arg = arguments;
      window.setTimeout(function() {
        func.apply(_this, arg); 
      }, msec);
    }
  }
  ,

  poll : function(params) {
    var work = params.work;
    var scope = params.scope;
    var callback = params.callback || afrous.lang.emptyFunc; 
    var errback = params.errback || callback;
    var timeout = params.timeout;
    var interval = params.interval || 1000;
    var startTime = new Date().getTime();

    var PID = window.setInterval(function() {
      if (work()) {
        window.clearInterval(PID);
        callback.call(scope);
      } else if (timeout && startTime+timeout < new Date().getTime()) {
        cancel();
      }
    }, interval);

    function cancel() {
      if (PID) {
        window.clearInterval(PID);
        PID = null;
        errback.call(scope);
      }
    }

    return cancel;
  }
  ,

  isString : function(a) {
    return (typeof a == "string" || a instanceof String);
  }
  ,

  isObject : function(a) {
    if (typeof a == 'undefined') return false;
    return (typeof a == 'object' || a === null || afrous.lang.isArray(a));
  }
  ,

  isArray : function(a) {
    return a && a instanceof Array;
  }
  ,

  isFunction : function(a) {
    return typeof a == 'function' && a instanceof Function && a != '[object NodeList]'
  }
  ,

  isArrayLike : function(a) {
    return afrous.lang.isArray(a) || a && !afrous.lang.isString(a) && isFinite(a.length) 
  }
  ,

  isDOMNode : function(a) {
    return a && a.childNodes && afrous.lang.isArrayLike(a.childNodes)
  }
  ,

  isPrintable : function(a) {
    var t = typeof(a);
    return (t == 'string' || t == 'number' || t == 'boolean' ||
            t == 'undefined' || a === null || 
            a instanceof String || a instanceof Number || a instanceof Boolean ||
            a instanceof Date || afrous.lang.isDOMNode(a) );
  }
  ,

  isSerializable : function(a) {
    return afrous.lang.isPrintable(a) || afrous.lang.isObject(a); 
  }
  ,

  toString : function(a) {
    if (a===null) {
      return 'null';
    } else if (typeof(a)=='undefined') {
      return 'undefined';
    } else if (afrous.lang.isDOMNode(a)) {
      if (a.tagName) {
        return '<'+a.tagName.toLowerCase() + ' ' + afrous.lang.map(a.attributes || [], function(attr) {
          return attr.nodeName + '="' + attr.nodeValue + '"';
        }).join(' ')+'>';
      } else {
        return a.nodeName;
      }
    } else {
      return (a).toString();
    }
  }
  ,

  toJSON : function(obj) {
    if (afrous.lang.isPrintable(obj)) {
      if (obj===null) return 'null';
      if (typeof(obj)=='undefined') return 'undefined';
      if (typeof(obj)=='number') return (obj).toString();
      return '"' + afrous.lang.toString(obj)
                      .replace(/(\\|\")/g, '\\$1')
                      .replace(/\n|\r|\t/g, function(a){
                         return (a=='\n') ? '\\n':
                                (a=='\r') ? '\\r':
                                (a=='\t') ? '\\t': ''
                      }) + '"';
    } else if (afrous.lang.isArray(obj)) {
      return '['+
        afrous.lang.map(
          afrous.lang.filter(obj, function(a) {
            return afrous.lang.isSerializable(a);
          }),
          function(a) {
            return afrous.lang.toJSON(a);
          }
        ).join(',') + ']';
    } else {
      return '{'+
        afrous.lang.map(
          afrous.lang.filter(afrous.lang.keys(obj), function(propName) {
            return afrous.lang.isSerializable(obj[propName]);
          }),
          function(propName) {
            return '"'+propName+'":'+afrous.lang.toJSON(obj[propName]);
          }
        ).join(',')+'}';
    }
  }
  ,

  parseJSON : function(json) {
    return eval('('+json+')');
  }
  ,

  cast : function(type, obj) {
    var isArray = /\[\]$/.test(type);
    type = type.replace(/\[\]$/,'');
    if (isArray && !afrous.lang.isArray(obj)) {
      obj = obj && obj.split ? obj.split(/\s*,\s*/) : [ obj ];
    }
    var arr = isArray ? obj : [ obj ];
    arr = afrous.lang.map(arr, function(o) {
      try {
        otype = typeof(o); 
        ostr = afrous.lang.toString(o);
        switch (type.toLowerCase()) {
          case 'integer' : 
            return /^-?\d+$/.test(ostr) ? parseInt(ostr, 10) : NaN;
          case 'float' : 
            return /^-?\d*(\.\d+)?$/.test(ostr) ? parseFloat(ostr) : NaN;
          case 'boolean' :
            return !(!o || ostr.toLowerCase()=="false" || ostr=="0");
          case 'date' : 
            return new Date(o);
          case 'string' : 
            return o == null || otype == 'undefined' ? o : ostr;
          case 'domnode' : 
            return document.createTextNode(ostr);
          case 'object' : 
          default : 
            return o;
        }
      } catch (e) { 
        return; 
      }
    })
    return isArray ? arr : arr[0];
  }
  ,

  loadScript : function(scriptUrl) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = scriptUrl;
    afrous.dom.scriptContainerElem.appendChild(script);
  }
  ,

  emptyFunc : function() {},

  xmlToJson : function(sourceXml) {
	  var json = {};

	  if (sourceXml.nodeType == 1) {

	   if (sourceXml.attributes.length > 0) {
		 json['@attributes'] = {};
		for (var i = 0; i < sourceXml.attributes.length; i++) {
		  json['@attributes'][sourceXml.attributes[i].nodeName] = sourceXml.attributes[i].nodeValue;
		}
	   }

	  } else if (sourceXml.nodeType == 3) {
		json = sourceXml.nodeValue;
	  }


	  if (sourceXml.hasChildNodes()) {
	   for(var j = 0; j < sourceXml.childNodes.length; j++) {
		if (typeof( json[sourceXml.childNodes[j].nodeName]) == 'undefined') {
		  json[sourceXml.childNodes[j].nodeName] = afrous.lang.xmlToJson(sourceXml.childNodes[j]);
		} else {
		 if (typeof( json[sourceXml.childNodes[j].nodeName].length) == 'undefined') {
		  var old =  json[sourceXml.childNodes[j].nodeName];
		   json[sourceXml.childNodes[j].nodeName] = [];
		   json[sourceXml.childNodes[j].nodeName].push(old);
		 }
		  json[sourceXml.childNodes[j].nodeName].push(afrous.lang.xmlToJson(sourceXml.childNodes[j]));
		}

	   }
	  }

	  return  json;
 }
};

afrous.dom = {

  scriptContainerElem : (function() {
    return (document.getElementsByTagName('head')[0] || document.body);
  })()
  ,

  createElement : function(config, doc) {
    doc = doc || document;
    config = config || {}
    var el = doc.createElement(config.tagName || 'div');
    afrous.lang.forEach(
      afrous.lang.keys(config),
      function(key) {
        if (key=='tagName') return;
        if (key=='className') el.setAttribute('class', config[key]);
        else el.setAttribute(key, config[key]);
      }
    )
    return el;
  }
  ,

  getElementsByClassName : function(el, className, tagName) {
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
    afrous.lang.filter(el.getElementsByTagName(tagName || '*'), function(cn) {
      regexp.test(cn.className);
    })
  }
  ,

  addClass : function(el, className) {
    var regexp = new RegExp('(^|\\s)'+className+'(\\s|$)');
    if (!regexp.test(el.className||'')) {
      el.className = (el.className||'') + ' '+className;
    }
  }
  ,

  removeClass : function(el, className) {
    var regexp = new RegExp('(^|\\s)'+className+'(\\s|$)', 'g');
    el.className = (el.className||'').replace(regexp, ' ');
  }
  ,

  toHTML : function(el) {
    if (el.parentNode) el = el.cloneNode(true);
    var ptag = 'div';
    if (el.tagName=='td' || el.tagName=='th') ptag = 'tr';
    else if (el.tagName=='tr') ptag = 'tbody';
    else if (el.tagName=='tbody' || el.tagName=='thead') ptag = 'table';
    else if (el.tagName=='li') ptag = 'ul';
    else if (el.tagName=='option') ptag = 'select';
    var p = afrous.dom.createElement({ tagName : ptag });
    p.appendChild(el);
    return p.innerHTML;
  }
  ,

  toObject : function(el, depth) {
    var ignoreAttrs = /^(contentEditable|on.+)$/;
    depth = depth || 1;
    if (el.nodeType==3) {
      return el.nodeValue;
    } else if (el.nodeType==1) {
      var obj = {};
      obj.tagName = el.tagName.toLowerCase();
      afrous.lang.forEach(el.attributes, function(attr) {
        if (attr.nodeValue && !ignoreAttrs.test(attr.nodeName)) {
          obj['@'+attr.nodeName] = attr.nodeValue;
        }
      })
      if (depth>1) {
        afrous.lang.forEach(el.childNodes, function(cn) {
          var cobj = afrous.dom.toObject(cn, depth-1)
          var nodeName = cn.nodeName.toLowerCase();
          var val = obj[nodeName];
          if (val) {
            obj[nodeName] = (afrous.lang.isArray(val) ? val : [ val ]).concat(cobj);
          } else {
            obj[nodeName] = cobj;
          }
        })
      }
      return obj;
    }
  }
  ,

  parseHTML : function(html) {
    var div = afrous.dom.createElement();
    if (/^<t[dh].*<\/t[dh]>$/i.test(html)) {
      div.innerHTML = '<table><tbody><tr>'+html+'</tr></tbody></table>'; 
      return div.getElementsByTagName('tr')[0].firstChild;
    } else if (/^<tr.*<\/tr>$/i.test(html)) {
      div.innerHTML = '<table><tbody>'+html+'</tbody></table>'; 
      return div.getElementsByTagName('tbody')[0].firstChild;
    } else if (/^<tbody.*<\/tbody>$/i.test(html)) {
      div.innerHTML = '<table>'+html+'</table>'; 
      return div.getElementsByTagName('table')[0].firstChild;
    } else if (/^<li.*<\/li>$/i.test(html)) {
      div.innerHTML = '<ul>'+html+'</ul>';
      return div.getElementsByTagName('ul')[0].firstChild;
    } else if (/^<option.*<\/option>$/i.test(html)) {
      div.innerHTML = '<select>'+html+'</select>';
      return div.getElementsByTagName('select')[0].firstChild;
    } else {
      div.innerHTML = html;
      return div.firstChild;
    }
  }
  ,

  writeValue : function(/*HTHMLDomElement*/el, /*Object*/value) {
    if (typeof value=='undefined' || value === null) {
      // nothing 
    } else if (afrous.lang.isDOMNode(value)) {
      if (value.ownerDocument === el.ownerDocument) {
        if (value.parentNode) {
          value = value.cloneNode(true);
        }
        el.appendChild(value);
      } else {
        el.innerHTML = afrous.dom.toHTML(value);
      }
    } else if (value instanceof Renderer) {
      value.render(el);
    } else if (afrous.lang.isArrayLike(value)) {
      afrous.lang.forEach(value, function(v) {
        afrous.dom.writeValue(el, v);
      });
    } else {
      el.appendChild(document.createTextNode(afrous.lang.toString(value)));
    }
  }

};

afrous.string = {

  escapeHTML : function(str) {
    return str ? 
           str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;') :
           ''; 
  }

};


afrous.async = {

  responder : function(callback) {
    if (typeof (callback) == 'function') {
      return { onSuccess : callback, onFailure : callback };
    } else if (callback.onSuccess && typeof (callback.onSuccess) == 'function' &&
               callback.onFailure && typeof (callback.onFailure) == 'function') {
      return callback;
    } else {
      throw 'Given callback object is not function or responder';
    }
  }
  ,

  map : function(arr, func, callback) {
    callback = afrous.async.responder(callback);
    var next = callback.onSuccess;
    var count = arr.length;
    var rarr = new Array(arr.length);
    if (count==0) callback.onSuccess(rarr);
    afrous.lang.forEach(arr, function(a, i) {
      func.call(null, a, i, arr, {
        onSuccess : function(ret) {
          rarr[i] = ret;
          count--;
          if (count==0) next(rarr);
        },
        onFailure : function(error) {
          rarr[i] = error;
          count--;
          next = callback.onFailure;
          if (count==0) next(rarr);
        }
      })
    })
  }
  ,

  iterate : function(arr, func, callback) {
    callback = afrous.async.responder(callback);
    var error = false;
    var rarr = new Array(arr.length);

    _iterate(0);

    function _iterate(i) {
      if (i<arr.length) {
        func.call(null, arr[i], i, arr, {
          onSuccess : function(ret) {
            rarr[i] = ret;
            _iterate(i+1);
          },
          onFailure : function(error) {
            rarr[i] = error;
            error = true;
            _iterate(i+1);
          }
        });
      } else {
        (error ? callback.onFailure : callback.onSuccess)(rarr);
      }
    }

  }
  ,

  sync : function(funcs, callback) {
    callback = aforus.lang.responder(callback);

    function exec(context, i, funcs) {
      if (i>=funcs.length) {
        callback.onSuccess(context);
        return;
      }
      var func = funcs[i]; 
      var label = func.toString().match(/^function\s+([^\(]*)/) ? 
                  RegExp.$1 :
                  '_func'+i;
      func.call(thisObj, context, {
        onSuccess : function(result) {
          context[label] = result;
          exec(context, i+1, funcs);
        },
        onFailure : function(error) {
          context[label] = error;
          callback.onFailure(context);
        }
      })
    }

    exec({}, 0, funcs);
  }

};


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
    callback = afrous.async.responder(callback);
    params = afrous.lang.extend({
      timeout : 10000
    }, params);

    afrous.debug.log(params.method + ' ' + params.path);

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
      return afrous.lang.parseJSON(req.responseText); 
    } else if (mimeType=='text/xml' || mimeType=='application/xml' || 
               mimeType=='application/atom') {
      return req.responseXML || new DOMParser().parseFromString(req.responseText, 'text/xml'); 
    } else if (mimeType=='text/html') {
      var bodyHTML = req.responseText.replace(/.*<body.*?>/i, '').replace(/<\/body>.*/i, '');
      var iframe = afrous.dom.createElement({
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
    var iframe = afrous.dom.createElement({
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
      callback = afrous.async.responder(callback);
      options = afrous.lang.extend({
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

      afrous.debug.log(script.src);

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

      afrous.dom.scriptContainerElem.appendChild(script); 

      window.setTimeout(function() {
        if (callbackContainer[callbackName]) {
          callbackContainer[callbackName] = afrous.lang.emptyFunc; // suppress error
          script.parentNode.removeChild(script);
          callback.onFailure({ error : 'timeout' });
        }
      }, options.timeout)

    }
  }

};


afrous.url = {

  urlEncode: function(clearString) {
    var output = '';
    var x = 0;
    clearString = clearString.toString();
    var regex = /(^[a-zA-Z0-9_.]*)/;
    while (x < clearString.length)
    {
      var match = regex.exec(clearString.substr(x));
      if (match != null && match.length > 1 && match[1] != '')
      {
        output += match[1];
        x += match[1].length;
      }
      else
      {
        if (clearString[x] == ' ')
          output += '+';
        else
        {
          var charCode = clearString.charCodeAt(x);
          var hexVal = charCode.toString(16);
          output += '%' + ( hexVal.length < 2 ? '0' : '' ) + hexVal.toUpperCase();
        }
        x++;
      }
    }
    return output;
  }
  ,

  getUrlParameters: function (url)
  {
    if(!url)
      url = window.location.href;
    var urlParam = url.split('?')[1];
    if(urlParam != null)
    {
      var paramsArray = urlParam.split('&');
      var params = {};
      for(var i=0; i<paramsArray.length; i++)
      {
        var param = paramsArray[i].split('=');
        if(param.length == 2)
          params[param[0]] = param[1];
      }
      return params;
    }
    return {};
  }
}


afrous.debug = {
  log : (typeof console!='undefined' ?
         function(o) { afrous.debug.on && console.log(afrous.lang.toJSON(o)) } : 
         afrous.lang.emptyFunc)
};


/* ---------------------------------------------------------------------- */

/**
 * Broadcaster
 */
var Broadcaster = afrous.lang.defineClass({
    
  _className : 'Broadcaster',
    
  initialize : function() {
    this.events = {};
  }
  ,

  addListener : function(event, func, scope) {
    var listener = { scope : scope, func : func };
    if (this.events[event]) {
      this.events[event].push(listener);
    } else {
      this.events[event] = [ listener ];
    }
  }
  ,

  removeListener : function(event, func) {
    if (this.events[event]) {
      this.events[event] = afrous.lang.filter(this.events[event], function(listener) {
        return listener.func != func;
      });
    }
  }
  ,

  fire : function(event) {
    var arg = Array.prototype.slice.call(arguments, 1);
    afrous.lang.forEach(this.events[event] || [], function(listener) {
      listener.func.apply(listener.scope, arg);
    });
  }
  
}) 



/* ---------------------------------------------------------------------- */

/**
 * UnitAction
 */
var UnitAction = afrous.lang.defineClass({
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
    afrous.lang.extend(this, props);
    this.inputs = {};
    var _this = this;
    afrous.lang.forEach(props.inputs || [], function(inputDef) {
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

/**
 * UnitActionPackage
 */
var UnitActionPackage = afrous.lang.defineClass({
  // namespace : String
  // icon : String
  // uactions : Hash(String, UnitAction)

  _className : 'UnitActionPackage',

  initialize : function(namespace, props) {
    this.namespace = namespace;
    afrous.lang.extend(this, props || {});
    this.uactions = {};
    this.loaded = false;
    var _this = this;
    this.setup(function() {
      _this.loaded = true;
    })
  }
  ,

  listUnitActions : function() {
    return afrous.lang.values(this.uactions);
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
    // Nothing default
    callback();
  }

}, Broadcaster /* super class */);


/**
 * UnitActionPackageRegistry
 */
var UnitActionPackageRegistry = afrous.lang.defineClass({ 
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
      var scriptURL = afrous.lang.find(
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
    var s = afrous.lang.find(this.scripts, function(s){ return s==scriptUrl });
    if (s && !overwrite) return;
    if (!s) this.scripts.push(scriptUrl);
    afrous.lang.loadScript(scriptUrl);
  }
  ,

  scriptBaseURL : (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i=0; i<scripts.length; i++) {
      var m = scripts[i].src.match(/(.*)\/afrous-core\.js$/);
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
      afrous.lang.forEach(afrous.lang.values(procdef.actions), function(actionDef) {
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
    afrous.lang.poll({
      work : function() {
        var p = afrous.packages;
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
    return afrous.lang.values(this.packages);
  }
  ,

  toConfig : function() {
    var _this = this;
    return afrous.lang.map(
      afrous.lang.keys(this.nsmap),
      function(namespace) {
        return { namespace : namespace, url : _this.nsmap[namespace] };
      }
    );
  }

}, Broadcaster /* superclass */);


afrous.packages = new UnitActionPackageRegistry();


/* ---------------------------------------------------------------------- */


/**
 * ProcessDef
 */
var ProcessDef = afrous.lang.defineClass({
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

    afrous.lang.forEach(config.params || [], function(pconfig) {
      _this.addParamDef(pconfig);
    });
    this.output = config.output;

    afrous.lang.forEach(config.actions || [], function(aconfig) {
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
      params : afrous.lang.values(this.params),
      output : this.output || '',
      actions : afrous.lang.map(
                  afrous.lang.values(this.actions).sort(function(a1, a2) {
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
    return afrous.lang.toJSON(this.toConfig());
  }
  ,

  destroy : function() {
    var _this = this;
    afrous.lang.forEach(afrous.lang.values(this.actions), function(actionDef) {
      actionDef.removeListener('change', _this.onChange);
      actionDef.destroy();
    });

    this.onDestroy();
  }

}, Broadcaster /* super class */)

/**
 * ActionDef
 */
var ActionDef = afrous.lang.defineClass({
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


var ProcessRegistry = afrous.lang.defineClass({
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

    afrous.lang.loadScript(afrous.config.PROCESS_REGISTRY_URL + '?id=' + key);

  }
  ,

  loadProcessDef : function(key, callback) {
    var procdef, config;
    if (procdef = this.processes[key]) {
      if (typeof callback == 'function') callback(procdef);
      return procdef;
    } else if (config = this.configs[key]) {
      procdef = this.processes[key] = new ProcessDef(config);
      if (typeof callback == 'function') callback(procdef);
      return procdef;
    } else {
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


afrous.processes = new ProcessRegistry();


/* ---------------------------------------------------------------------- */

/**
 * ProcessInstance
 */
var ProcessInstance = afrous.lang.defineClass({
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
    callback = afrous.async.responder(callback);
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
      value = afrous.lang.cast(paramDef.type, value);
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
        var value = afrous.lang.cast(paramDef.type, paramDef['default']); 
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
    callback = afrous.async.responder(callback);
    var vars = EL.extractVars(expr) || [];
    var _this = this;
    afrous.async.map(
      vars,
      function(v, i, vars, cb) {
        cb = afrous.async.responder(cb);
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
          afrous.lang.forEach(results, function(result) {
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
    afrous.lang.forEach(afrous.lang.values(this.actions), function(action) {
      action.destroy();
    })
  }

}, Broadcaster /* superclass */);


/**
 * ProcessParam
 */
var ProcessParam = afrous.lang.defineClass({
  // value : Object
  // timestamp : integer
  
  _className : 'ProcessParam',

  initialize : function(value) {
    this.value = value;
    this.timestamp = new Date().getTime();
  }
  ,

  evaluate : function(callback) {
    afrous.lang.delay(callback.onSuccess, 1)
               .call(callback, { value : this.value, timestamp : this.timestamp })
  }

})


/**
 * ActionInstance
 */
var ActionInstance = afrous.lang.defineClass({
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
    if (afrous.debug.on) {
      this.addListener('status', this.statusDebug, this);
    }
 
  }
  ,

  prepareInnerParams : function(callback) {
    callback = afrous.async.responder(callback);
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
      afrous.lang.delay(this.prepare, 1)
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
        afrous.lang.delay(callback.onSuccess, this.definition.uaction.waittime || 1)
                   .call(callback, { value : this.value, timestamp : this.timestamp });
      } catch(e) { 
        afrous.debug.log(e)
      }
    }

    this.changeStatus(ActionInstance.Status.WAIT);
  }
  ,

  error : function(request, error) {
    this.changeStatus(ActionInstance.Status.ERROR);
    
    while(this.callbackQueue.length>0) {
      var callback = this.callbackQueue.pop();
      afrous.lang.delay(callback.onFailure, this.definition.uaction.waittime || 1)
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
    afrous.debug.log(this.definition.name + ': ' + this.status);
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


/**
 * ActionRequest
 */
var ActionRequest = afrous.lang.defineClass({
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
                              afrous.lang.cast(inputDef.type, value) :
                              value;
        }
        next.onSuccess();
      },
      onFailure : next.onFailure
    })
  }

})



/**
 * EL
 */
var EL = new function() {

  // recursively scans object's properties
  function scanObject(obj, matchFn, applyFn) {

    if (matchFn(obj)) return applyFn(obj);

    if (afrous.lang.isPrintable(obj)) { // leaf property, pseudo primitive.
      return obj;
    } else if (afrous.lang.isArray(obj)) { // array
      return afrous.lang.map(obj, function(o) { return scanObject(o, matchFn, applyFn) });
    } else { // normal object
      var ret = {};
      for (var key in obj) {
        ret[key] = scanObject(obj[key], matchFn, applyFn);
      }
      return ret;
    }
  }



  return {

    extractVars : function(obj) {
      var refs = [];
      var hash = {};
      scanObject(obj, afrous.lang.isString, _extractVars);
      return refs;

      // ad-hoc program, not lexically valid for all type of inputs ...
      function _extractVars(str) {
        var m = str.match(/\${([^}]*)}/g);
        if (m) {
          for (var i=0; i<m.length; i++) {
            var vars = m[i].replace(/"[^"]*"/g, '""') // eliminate string literals
                           .replace(/'[^']*'/g, "''") // 
                           .match(/[a-zA-Z_][\w\[\]\.]*/g);
            for (var j=0; j<vars.length; j++) {
              var v = vars[j].replace(/[\.\[].*/, ''); // eliminate property accessor
              if (!hash[v]) {
                hash[v] = true;
                refs.push(v);
              }
            }
          }
        }
      }
    }
    ,

    evaluate: function(context, obj) {
      return scanObject(obj, afrous.lang.isString, _evalReference);

      function _evalReference(str) {
        try {
          if (str.match(/^\${([^}]*)}$/)) {
            var v = RegExp.$1;
            with (context) { return eval('('+v+')') }
          } else {
            return str.replace(/\${([^}]*)}/g, function(s, p1) { 
              with (context) { return eval('('+p1+')') }
            })
          }
        } catch (e) {
          return null
        }
      }
    }

  }

}


/* ---------------------------------------------------------------------- */

/**
 * RenderingUnitAction
 */
var RenderingUnitAction = afrous.lang.defineClass({

  _className : 'RenderingUnitAction',

  execute : function(/*ActionRequest*/request, /*Responder*/callback) {
    callback.onSuccess(new Renderer(this, request.params));
  }
  ,

  render : function(/*Hash object*/params, /*HTMLDomElement*/el) {
    // override me !
    el.innerHTML = '<h1>hello</h1>';
  }

}, UnitAction /* super class */);


/**
 * Renderer
 */
var Renderer = afrous.lang.defineClass({

  _className : 'Renderer',

  initialize : function(/*RenderingUnitAction*/raction, /*Hash object*/params) {
    this.raction = raction;
    this.params = params;
  }
  ,

  render : function(/*HTMLDomElement*/el) {
    this.raction.render(this.params, el);
  }

});

/* ---------------------------------------------------------------------- */

if (typeof DOMParser == "undefined") {
  DOMParser = function () {}

  DOMParser.prototype.parseFromString = function (str, contentType) {
    if (typeof ActiveXObject != "undefined") {
      var d = new ActiveXObject("MSXML.DomDocument");
      d.loadXML(str);
      return d;
    } else if (typeof XMLHttpRequest != "undefined") {
      var req = new XMLHttpRequest;
      req.open("GET", "data:" + (contentType || "application/xml") +
                     ";charset=utf-8," + encodeURIComponent(str), false);
      if (req.overrideMimeType) {
        req.overrideMimeType(contentType);
      }
      req.send(null);
      return req.responseXML;
    }
  }
}

/* ---------------------------------------------------------------------- */


afrous.UnitAction = UnitAction;
afrous.UnitActionPackage = UnitActionPackage;
afrous.UnitActionPackageRegistry = UnitActionPackageRegistry;

afrous.ProcessDef = ProcessDef;
afrous.ActionDef = ActionDef;
afrous.ProcessRegistry = ProcessRegistry;

afrous.ProcessParam = ProcessParam;
afrous.ProcessInstance = ProcessInstance;
afrous.ActionInstance = ActionInstance;
afrous.ActionRequest = ActionRequest;


afrous.RenderingUnitAction = RenderingUnitAction;
afrous.Renderer = Renderer;


afrous.config = afrous.lang.extend({
//  LOGIN_URL : 'http://app.afrous.com/app/auth/info',
  ABOUT_URL : './about.html',
  EMPTY_URL : afrous.baseURL+'/empty.html',
  SAVE_URL  : afrous.baseURL+'/save.html',
  JSONP_PROXY_URL      : afrous.baseURL+'/JSONPProxy',
  LIBRARY_SEARCH_URL   : afrous.baseURL+'/Libraries',
  PROCESS_OPEN_URL     : afrous.baseURL+'/OpenMashup',
  PROCESS_SAVE_URL     : afrous.baseURL+'/SaveMashup',
  PROCESS_SAVE_LOC_ULR : afrous.baseURL+'/SaveJson',
  PROCESS_PRIVATE_URL  : afrous.baseURL+'/LoadMashups',
  PROCESS_REGISTRY_URL : afrous.baseURL+'/ShowMashup',
  WADL_CRE_SERVICE_URL : afrous.baseURL+'/ServiceCreator'
}, afrous.config || {});

})()

