
var mb;
if (!mb) mb = {};

mb.lang = {
  /**
   * Adds the content of the src hash map to the dest hash map. 
   * If a key is already defined in the dest hash map, its value is 
   * overriden with the value which this key has in the src hash map.
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
      mb.lang.extend(f.prototype, superClass.prototype)
    }
    mb.lang.extend(f.prototype, props);
    return f;
  }
  ,
  keys : function(obj) {
    var keys = [];
    for (var prop in obj) {
      if (!jQuery.isFunction(obj[prop])) keys.push(prop);
    }
    return keys;
  }
  ,
  values : function(obj) {
    var values = [];
    for (var prop in obj) {
      if (!jQuery.isFunction(obj[prop])) values.push(obj[prop]);
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
  find : function(arr, callback, thisObj) {
    for (var i=0,len=arr.length; i<len; i++) {
      if (callback.call(thisObj, arr[i], i, arr)) return arr[i];
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
    var callback = params.callback || mb.lang.emptyFunc; 
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
    return (typeof a == 'object' || a === null || jQuery.isArray(a));
  }
 /* ,
  isArray : function(a) {
    return a && a instanceof Array;
  }
  ,
  isFunction : function(a) {
    return typeof a == 'function' && a instanceof Function && a != '[object NodeList]'
  }*/
  ,
  isArrayLike : function(a) {
    return jQuery.isArray(a) || a && !mb.lang.isString(a) && isFinite(a.length) 
  }
  ,
  isDOMNode : function(a) {
    return a && a.childNodes && jQuery.isArrayLike(a.childNodes)
  }
  ,
  isPrintable : function(a) {
    var t = typeof(a);
    return (t == 'string' || t == 'number' || t == 'boolean' ||
            t == 'undefined' || a === null || 
            a instanceof String || a instanceof Number || a instanceof Boolean ||
            a instanceof Date || mb.lang.isDOMNode(a) );
  }
  ,
  isSerializable : function(a) {
    return mb.lang.isPrintable(a) || mb.lang.isObject(a); 
  }
  ,
  toString : function(a) {
    if (a===null) {
      return 'null';
    } else if (typeof(a)=='undefined') {
      return 'undefined';
    } else if (mb.lang.isDOMNode(a)) {
      if (a.tagName) {
        return '<'+a.tagName.toLowerCase() + ' ' + jQuery.map(a.attributes || [], function(attr) {
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
    if (mb.lang.isPrintable(obj)) {
      if (obj===null) return 'null';
      if (typeof(obj)=='undefined') return 'undefined';
      if (typeof(obj)=='number') return (obj).toString();
      return '"' + mb.lang.toString(obj)
                      .replace(/(\\|\")/g, '\\$1')
                      .replace(/\n|\r|\t/g, function(a){
                         return (a=='\n') ? '\\n':
                                (a=='\r') ? '\\r':
                                (a=='\t') ? '\\t': ''
                      }) + '"';
    } 
	else if (jQuery.isArray(obj)) {
      return '['+
        jQuery.map(
          jQuery.grep(obj, function(a) {
            return mb.lang.isSerializable(a);
          }),
          function(a) {
            return mb.lang.toJSON(a);
          }
        ).join(',') + ']';
    } 
	else {
      return '{'+
        mb.lang.map(
          jQuery.grep(mb.lang.keys(obj), function(propName) {
            return mb.lang.isSerializable(obj[propName]);
          }),
          function(propName) {
            return '"'+propName+'":'+mb.lang.toJSON(obj[propName]);
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
    if (isArray && !jQuery.isArray(obj)) {
      obj = obj && obj.split ? obj.split(/\s*,\s*/) : [ obj ];
    }
    var arr = isArray ? obj : [ obj ];
    arr = mb.lang.map(arr, function(o) {
      try {
        otype = typeof(o); 
        ostr = mb.lang.toString(o);
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
    mb.dom.scriptContainerElem.appendChild(script);
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
		  json[sourceXml.childNodes[j].nodeName] = mb.lang.xmlToJson(sourceXml.childNodes[j]);
		} else {
		 if (typeof( json[sourceXml.childNodes[j].nodeName].length) == 'undefined') {
		  var old =  json[sourceXml.childNodes[j].nodeName];
		   json[sourceXml.childNodes[j].nodeName] = [];
		   json[sourceXml.childNodes[j].nodeName].push(old);
		 }
		  json[sourceXml.childNodes[j].nodeName].push(mb.lang.xmlToJson(sourceXml.childNodes[j]));
		}
	   }
	  }
	  return  json;
 }
};

mb.dom = {
  scriptContainerElem : (function() {
    return (document.getElementsByTagName('head')[0] || document.body);
  })()
  ,
  createElement : function(config, doc) {
    doc = doc || document;
    config = config || {}
    var el = doc.createElement(config.tagName || 'div');
    mb.lang.forEach(
      mb.lang.keys(config),
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
    jQuery.grep(el.getElementsByTagName(tagName || '*'), function(cn) {
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
    var p = mb.dom.createElement({ tagName : ptag });
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
      mb.lang.forEach(el.attributes, function(attr) {
        if (attr.nodeValue && !ignoreAttrs.test(attr.nodeName)) {
          obj['@'+attr.nodeName] = attr.nodeValue;
        }
      })
      if (depth>1) {
        mb.lang.forEach(el.childNodes, function(cn) {
          var cobj = mb.dom.toObject(cn, depth-1)
          var nodeName = cn.nodeName.toLowerCase();
          var val = obj[nodeName];
          if (val) {
            obj[nodeName] = (jQuery.isArray(val) ? val : [ val ]).concat(cobj);
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
    var div = mb.dom.createElement();
    if (/^<t[dh].*<\/t[dh]>$/i.test(html)) {
      div.innerHTML = '<table><tbody><tr>'+html+'</tr></tbody></table>'; 
      return div.getElementsByTagName('tr')[0].firstChild;
    } 
	else if (/^<tr.*<\/tr>$/i.test(html)) {
      div.innerHTML = '<table><tbody>'+html+'</tbody></table>'; 
      return div.getElementsByTagName('tbody')[0].firstChild;
    } 
	else if (/^<tbody.*<\/tbody>$/i.test(html)) {
      div.innerHTML = '<table>'+html+'</table>'; 
      return div.getElementsByTagName('table')[0].firstChild;
    } 
	else if (/^<li.*<\/li>$/i.test(html)) {
      div.innerHTML = '<ul>'+html+'</ul>';
      return div.getElementsByTagName('ul')[0].firstChild;
    } 
	else if (/^<option.*<\/option>$/i.test(html)) {
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
    } 
	else if (mb.lang.isDOMNode(value)) {
      if (value.ownerDocument === el.ownerDocument) {
        if (value.parentNode) {
          value = value.cloneNode(true);
        }
        el.appendChild(value);
      } 
	  else {
        el.innerHTML = mb.dom.toHTML(value);
      }
    } 
	else if (value instanceof Renderer) {
      value.render(el);
    } 
	else if (mb.lang.isArrayLike(value)) {
      mb.lang.forEach(value, function(v) {
        mb.dom.writeValue(el, v);
      });
    } 
	else {
      el.appendChild(document.createTextNode(mb.lang.toString(value)));
    }
  }
};

mb.string = {
  escapeHTML : function(str) {
    return str ? 
           str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;') :
           ''; 
  }
};

mb.async = {
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
    callback = mb.async.responder(callback);
    var next = callback.onSuccess;
    var count = arr.length;
    var rarr = new Array(arr.length);
    if (count==0) callback.onSuccess(rarr);
    mb.lang.forEach(arr, function(a, i) {
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
    callback = mb.async.responder(callback);
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


mb.url = {
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
  getUrlParameters: function (url) {
    if(!url)
      url = window.location.href;
    var urlParam = url.split('?')[1];
    if(urlParam != null) {
      var paramsArray = urlParam.split('&');
      var params = {};
      for(var i=0; i<paramsArray.length; i++) {
        var param = paramsArray[i].split('=');
        if(param.length == 2)
          params[param[0]] = param[1];
      }
      return params;
    }
    return {};
  }
}


mb.debug = {
  log : (typeof console!='undefined' ?
         function(o) { mb.debug.on && console.log(mb.lang.toJSON(o)) } : 
         mb.lang.emptyFunc)
};


/**
 * Broadcaster
 */
var Broadcaster = mb.lang.defineClass({
  _className : 'Broadcaster',
    
  initialize : function() {
    this.events = {};
  }
  ,
  addListener : function(event, func, scope) {
    var listener = { scope : scope, func : func };
    if (this.events[event]) {
      this.events[event].push(listener);
    } 
	else {
      this.events[event] = [ listener ];
    }
  }
  ,
  removeListener : function(event, func) {
    if (this.events[event]) {
      this.events[event] = jQuery.grep(this.events[event], function(listener) {
        return listener.func != func;
      });
    }
  }
  ,
  fire : function(event) {
    var arg = Array.prototype.slice.call(arguments, 1);
    mb.lang.forEach(this.events[event] || [], function(listener) {
      listener.func.apply(listener.scope, arg);
    });
  }
}) 


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

mb.config = mb.lang.extend({
  EMPTY_URL : mb.baseURL+'/empty.html',
  SAVE_URL  : mb.baseURL+'/save.html',
  JSONP_PROXY_URL      : mb.baseURL+'/JSONPProxy',
  LIBRARY_SEARCH_URL   : mb.baseURL+'/Libraries',
  PROCESS_OPEN_URL     : mb.baseURL+'/OpenMashup',
  PROCESS_SAVE_URL     : mb.baseURL+'/SaveMashup',
  PROCESS_SAVE_LOC_ULR : mb.baseURL+'/SaveJson',
  PROCESS_PRIVATE_URL  : mb.baseURL+'/LoadMashups',
  PROCESS_REGISTRY_URL : mb.baseURL+'/ShowMashup',
  WADL_CRE_SERVICE_URL : mb.baseURL+'/ServiceCreator'
}, mb.config || {});



