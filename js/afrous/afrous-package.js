/*
  Afrous JavaScript - Standard Packages
  (c) 2007 - 2008 Shinichi Tomita (stomita@mashmatrix.com)

  Afrous Standard Package is freely distributable under the terms of an MIT-style license.
  For details, see the Afrous web site: http://www.afrous.com/
 */ 

(function() {

/**
 * Basic Package
 */ 
var basic = new afrous.UnitActionPackage('Basic');

basic.register(new afrous.UnitAction({
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
    if (afrous.lang.isObject(obj)) {
      obj = afrous.lang.extend({}, obj); 
      var params = afrous.lang.extend({}, request.params);
      delete params['object'];
      afrous.lang.extend(obj, params)
    }
    callback.onSuccess(obj);
  }
}));

basic.register(new afrous.UnitAction({
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
    var keyvalues = afrous.lang.map(
      afrous.lang.keys(obj), 
      function(key){
        return { key : key, value : obj[key] };
      }
    );
    callback.onSuccess(keyvalues);
  }
}));

basic.register(new afrous.UnitAction({
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


basic.register(new afrous.UnitAction({
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

    callback.onSuccess(afrous.lang.cast(type, value));
  }
}));


afrous.packages.register(basic);


/**
 * Array Package
 */
var array = new afrous.UnitActionPackage('Array');


array.register(new afrous.UnitAction({
  type : 'Array',
  label : 'New Array',
  description : 'Create new array, extending from base array.',
  inputs : [
    { name : 'array',
      label : 'array',
      type : 'Object[]' }
  ],
  execute : function(request, callback) {
    var arr = request.params['array'];
    callback.onSuccess(arr);
  }
}));


array.register(new afrous.UnitAction({
  type : 'Iterate',
  label : 'Iterate',
  description : 'Iterating through given array, collecting each element\'s output and emitting new output array.',
  inputs : [
    { name : 'array',
      label : 'array to iterate',
      type : 'Object[]' }
  ],
  innerProcess : true,
  innerProcessParams : [
    { name : 'element',
      type : 'Object' },
    { name : 'index',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var action = request.action;
    var process = action.process;
    var arr = request.params['array'];
    if (action.definition.innerProcess && action.definition.innerProcess.output) {
      afrous.async.iterate(
        arr, 
        function(a, i, arr, cb) {
          var childProc = new afrous.ProcessInstance(action.definition.innerProcess, process);
          childProc.setParam('element', a);
          childProc.setParam('index', i);
          childProc.start(cb);
        }, 
        callback
      );
    } else {
      callback.onSuccess(arr);
    }
  }
  ,
  prepareInnerParams : function(request, callback) {
    var arr = request.params['array'];
    callback.onSuccess(arr && arr.length > 0 ? { element : arr[0], index : 0 } : {});
  }

}));


array.register(new afrous.UnitAction({
  type : 'Filter',
  label : 'Filter',
  description : 'Filtering array elements which meets given conditions',
  inputs : [
    { name : 'array',
      label : 'array to filter',
      type : 'Object[]' },
    { name : 'mode', 
      label : 'condition mode',
      type : 'String',
      options : [ 'AND', 'OR' ] }
  ]
  ,
  execute : function(request, callback) {
    var arr = request.params['array'] || [];
    var mode = request.params['mode'] || 'AND';
    
    var conditions = [];
    for (var i=0; i<10; i++) {
      var property = request.params['property'+i];
      var operand = request.params['operand'+i];
      var value = request.params['value'+i];
      if (typeof property != 'undefined' &&
          typeof operand != 'undefined' &&
          typeof value != 'undefined') {
        conditions.push({ property : property, operand : operand, value : value });
      }
    }

    var farr = afrous.lang.filter(arr, function(element) {
      var flag = true;
      for (var i=0; i<conditions.length; i++) {
        if (flag = checkCondition(element, conditions[i])) {
          if (mode=='OR') return true;
        } else {
          if (mode=='AND') return false;
        }
      }
      return flag;
    })
    
    callback.onSuccess(farr);

    function checkCondition(element, condition) {
      switch (condition.operand) {
        case '=' :
          return element[condition.property] == condition.value;
        case '>' : 
          return element[condition.property] > condition.value;
        case '>=' : 
          return element[condition.property] >= condition.value;
        case '<' : 
          return element[condition.property] < condition.value;
        case '<=' : 
          return element[condition.property] <= condition.value;
        case '!=' : 
          return element[condition.property] != condition.value;
        case 'includes' : 
          var pstr = afrous.lang.toString(element[condition.property]);
          return pstr.indexOf(condition.value)>=0;
        case 'not includes' : 
          var pstr = afrous.lang.toString(element[condition.property]);
          return pstr.indexOf(condition.value)<0;
        case 'matches' : 
          var pstr = afrous.lang.toString(element[condition.property]);
          var regexp = new RegExp(condition.value);
          return regexp.test(pstr);
        default :
          return true;
      }
    }

  }

}));


array.register(new afrous.UnitAction({
  type : 'Join',
  label : 'Join',
  description : 'Put all elements of the array into a string. Elements are separated by given delimitor.',
  inputs : [
    { name : 'array',
      label : 'array',
      type : 'String[]' },
    { name : 'delim',
      label : 'delimitor',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var arr = request.params['array'] || [];
    var delim = request.params['delim'] || ',';
    callback.onSuccess(arr.join(delim));
  }
}))



array.register(new afrous.UnitAction({
  type : 'Slice',
  label : 'Slice',
  description : 'Getting selected subset of the given array.',
  inputs : [
    { name : 'array',
      label : 'array to slice',
      type : 'Object[]' },
    { name : 'startIndex',
      label : 'start index',
      type : 'Integer' },
    { name : 'endIndex',
      label : 'end index',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var action = request.action;
    var process = action.process;
    var arr = request.params['array'];
    var args = [];
    var startIndex = request.params['startIndex'];
    args.push(typeof(startIndex)=='number' ? startIndex : 0);
    var endIndex = request.params['endIndex'];
    if (typeof(endIndex)=='number') args.push(endIndex);

    callback.onSuccess(Array.prototype.slice.apply(arr, args));
  }
}));


array.register(new afrous.UnitAction({
  type : 'Concat',
  label : 'Concat',
  description : 'Join more than two arrays int one.',
  inputs : [
    { name : 'array1',
      label : 'array #1',
      type : 'Object[]' },
    { name : 'array2',
      label : 'array #2',
      type : 'Object[]' },
    { name : 'array3',
      label : 'array #3',
      type : 'Object[]' },
    { name : 'array4',
      label : 'array #4',
      type : 'Object[]' },
    { name : 'array5',
      label : 'array #5',
      type : 'Object[]' }
  ]
  ,
  execute : function(request, callback) {
    var action = request.action;
    var process = action.process;
    var arr = [];
    for (var i=1; i<=5; i++) {
      Array.prototype.push.apply(arr, request.params['array'+i] || []);
    }
    callback.onSuccess(arr);
  }

}));


array.register(new afrous.UnitAction({
  type : 'Flatten',
  label : 'Flatten',
  description : 'Turns multidimensional arrays into linear ones.',
  inputs : [
    { name : 'array',
      label : 'array to flatten',
      type : 'Object[]' }
  ]
  ,
  execute : function(request, callback) {
    var arr = request.params['array'];
    var rarr = [];

    if (arr) {
      afrous.lang.forEach(arr, function(elem) {
        if (elem.constructor == Array) {
          afrous.lang.forEach(elem, function(a) { rarr.push(a) });
        } else {
          rarr.push(elem);
        }
      })
      callback.onSuccess(rarr);
    } else {
      callback.onSuccess(arr);
    }
  }
}));



array.register(new afrous.UnitAction({
  type : 'Pluck',
  label : 'Pluck',
  description : 'Retrieves the value to the specified property in each element of the given array and returns the results in a new array.',
  inputs : [
    { name : 'array',
      label : 'array to pluck',
      type : 'Object[]' },
    { name : 'property',
      label : 'property name to pluck',
      type : 'String',
      options : []
    }
  ]
  ,
  execute : function(request, callback) {
    var rarr = [];

    var property = request.params['property'];
    var rarr = afrous.lang.map(
      request.params['array'] || [],
      function(elem) {
        return property ? elem[property] : elem;
      }
    );
    callback.onSuccess(rarr);
  }
}));



array.register(new afrous.UnitAction({
  type : 'SortBy',
  label : 'Sort By',
  description : 'Returns an array with all the elements sorted according to the given property value.',
  inputs : [
    { name : 'array',
      label : 'array to sort',
      type : 'Object[]' },
    { name : 'property',
      label : 'property name to compare',
      type : 'String',
      options : [] },
    { name : 'direction',
      label : 'direction (ASC|DESC)',
      type : 'String',
      options : [ 'ASC', 'DESC' ]
    }
  ]
  ,
  execute : function(request, callback) {
    var rarr = [];

    var property = request.params['property'];
    var direction = request.params['direction'] || 'ASC';
    direction = direction.toUpperCase()=='ASC' ? 1 : -1;
    var rarr = (request.params['array'] || []).sort(function(elem1, elem2) {
      var val1 = property ? elem1[property] : elem1;
      var val2 = property ? elem2[property] : elem2;
      return (val1>val2 ? direction :
              val1<val2 ? -direction : 0);
    })
    callback.onSuccess(rarr);
  }
}));


array.register(new afrous.UnitAction({
  type : 'Unique',
  label : 'Unique',
  description : 'Pick unique elements from given array. All dup. elements are removed, only first one left.',
  inputs : [
    { name : 'array',
      label : 'array to pick unique',
      type : 'Object[]' },
    { name : 'property',
      label : 'property name to compare',
      type : 'String',
      options : [] }
  ]
  ,
  execute : function(request, callback) {
    var action = request.action;
    var process = action.process;
    var rarr = [];

    var property = request.params['property'];
    var tmp = {};
    var rarr = afrous.lang.filter(request.params['array'] || [], function(elem) {
      var val = property ? elem[property] : afrous.lang.toJSON(elem);
      if (tmp[val]) {
        return false;
      } else {
        tmp[val] = true;
        return true;
      }
    })
    callback.onSuccess(rarr);
  }
}));


array.register(new afrous.UnitAction({
  type : 'GroupBy',
  label : 'Group By',
  description : 'Divide array into sub array groups. Grouping is based on property value.',
  inputs : [
    { name : 'array',
      label : 'array to make group',
      type : 'Object[]' },
    { name : 'property',
      label : 'property name to group by',
      type : 'String',
      options : [] }
  ]
  ,
  execute : function(request, callback) {
    var arr = request.params['array'];
    var propName = request.params['property'];
    var hash = {};
    afrous.lang.forEach(arr, function(e) {
      var propValue = e[propName];
      if (hash[propValue]) hash[propValue].push(e);
      else hash[propValue] = [e];
    });
    var groups = afrous.lang.map(
      afrous.lang.keys(hash), 
      function(key){
        return { name : key, members : hash[key] };
      }
    );
    callback.onSuccess(groups);
  } 
}));


array.register(new afrous.UnitAction({
  type : 'Count',
  label : 'Count',
  description : 'Count the number of occurrences of each value in a metadata. Returns an array of pairs consisting of a metadata value and number of repetitions.',
  inputs : [
    { name : 'array',
      label : 'array to make count',
      type : 'Object[]' },
    { name : 'property',
      label : 'property name to count by',
      type : 'String',
      options : [] }
  ]
  ,
  execute : function(request, callback) {
    var arr = request.params['array'];
    var propName = request.params['property'];

	var namesArray = new Array();
	var i=0;
	
	var propertyName = 0;
	var propertyValue = 1;

	var hashObject = {};
    afrous.lang.forEach(arr, function(e) {
      var propValue = e[propName]; 

      if (propValue in hashObject) {
      	var value = hashObject[propValue];
      	value++;
      	hashObject[propValue] = value;
      } else {
      	hashObject[propValue] = 1;
      	namesArray[i]=propValue;
      	i++;
      }
    });
 
	var arrayFinal = new Array();
	for (var i=0,len=namesArray.length; i<len; i++) {
		var hashObjectAux = {};
		hashObjectAux['Valor'] = namesArray[i];
		hashObjectAux['Repeticiones'] = hashObject[namesArray[i]];
		arrayFinal[i] = hashObjectAux;
	}
	callback.onSuccess(arrayFinal);
  } 
}));


afrous.packages.register(array);


/**
 * String Package
 */

var string = new afrous.UnitActionPackage('String');

string.register(new afrous.UnitAction({
  type : 'Split',
  label : 'Split',
  description : 'Split given string into array.',
  inputs : [
    { name : 'string',
      label : 'String to split',
      type : 'String' },
    { name : 'delimitor',
      label : 'delimitor',
      type : 'String' }
  ],
  execute : function(request, callback) {
    var str = request.params['string'];
    var delim = new RegExp(request.params['delimitor'] || '\\s+');
    callback.onSuccess(str ? str.split(delim) : str);
  }
}));

string.register(new afrous.UnitAction({
  type : 'RegExpMatch',
  label : 'RegExp Match',
  description : 'Match entire string with given regular expression.',
  inputs : [
    { name : 'string',
      label : 'String to match',
      type : 'String' },
    { name : 'regexp',
      label : 'Regular Expression',
      type : 'String' }
  ],
  execute : function(request, callback) {
    var str = request.params['string'];
    var regexp = new RegExp(request.params['regexp'], 'g');
    var result = [];
    str.replace(regexp, function(){
      result.push(Array.prototype.slice.call(arguments, 0, -2));
    });
    callback.onSuccess(result);
  }
}));

string.register(new afrous.UnitAction({
  type : 'ParseDate',
  label : 'Parse Date',
  description : 'Parsing date from Unix epoch, or W3C-DTF formatted string.',
  inputs : [
    { name : 'string',
      label : 'Datetime expression',
      type : 'String' }
  ],
  execute : function(request, callback) {
    var str = request.params['string'] || '0';
    var d;
    if (/^[\d]+$/.test(str)) {
      d = new Date(parseInt(str));
    } else {
      d = new Date(str);
      if (isNaN(d.getTime())) {
        d = null;
        var m = str.match(/^([\d]{4})-([\d]{2})-([\d]{2})(T([\d]{2}):([\d]{2}):([\d]{2})(.([\d]{3}))?(Z|([\+\-])([\d]{2}):([\d]{2})))?$/);
        if (m) {
          d = new Date();
          d.setUTCFullYear(parseInt(m[1], 10));
          d.setUTCMonth(parseInt(m[2], 10) - 1);
          d.setUTCDate(parseInt(m[3], 10));
          if (!m[4]) {
            d.setUTCHours(0);
            d.setUTCMinutes(0);
            d.setUTCSeconds(0);
            d.setUTCMilliseconds(0);
          } else {
            d.setUTCHours(parseInt(m[5], 10));
            d.setUTCMinutes(parseInt(m[6], 10));
            d.setUTCSeconds(parseInt(m[7], 10));
            d.setUTCMilliseconds(parseInt(m[9] || '0', 10));
            if (m[10] && m[10]!='Z') {
              var offset = parseInt(m[12],10) * 60 + parseInt(m[13], 10);
              d.setTime((m[11]=='+' ? -1 : 1) * offset * 60 * 1000 +d.getTime());
            } 
          }
        }
      }
    }
    if (d) {
      callback.onSuccess({
        time : d.getTime(),
        year : d.getFullYear(),
        yearUTC : d.getUTCFullYear(),
        month : d.getMonth()+1,
        monthUTC : d.getUTCMonth()+1,
        date : d.getDate(),
        dateUTC : d.getUTCDate(),
        hours : d.getHours(),
        hoursUTC : d.getUTCHours(),
        minutes : d.getMinutes(),
        minutesUTC : d.getUTCMinutes(),
        seconds : d.getSeconds(),
        secondsUTC : d.getUTCSeconds(),
        milliseconds : d.getMilliseconds(),
        millisecondsUTC : d.getUTCMilliseconds(),
        timezoneOffset : d.getTimezoneOffset() 
      });
    } else {
      callback.onSuccess({});
    }
  }
}));

afrous.packages.register(string);


/* ---------------------------------------------------------------------- */


/**
 * Basic Rendering Package
 */
var basicRenderer = new afrous.UnitActionPackage('Renderer.Basic', {
  label : 'Basic Renderer'
});



basicRenderer.register(new afrous.RenderingUnitAction({
  type : 'Link',
  label : 'Anchor Link',
  description : 'Rendering anchor link',
  iconCls : 'anchor-render-uaction',
  inputs : [
    { name : 'href',
      label : 'link url',
      type : 'String' },
    { name : 'title',
      label : 'title',
      type : 'String' },
    { name : 'content',
      label : 'link content',
      type : 'Object' }
  ],

  render : function(params, el) {
    var href = params['href'] || '#';
    var title = params['title'] || href;
    var anchor = afrous.dom.createElement({ 
      tagName : 'a', 
      href : href,
      title : title
    });
    var content = params['content'] || title; 
    el.appendChild(anchor);
    afrous.dom.writeValue(anchor, content);
  }

}))


basicRenderer.register(new afrous.RenderingUnitAction({
  type : 'Image',
  label : 'Image Renderer',
  description : 'Rendering image with given URL',
  iconCls : 'image-render-uaction',
  inputs : [
    { name : 'srcUrl',
      label : 'image src url',
      type : 'String' },
    { name : 'alt',
      label : 'alternate text',
      type : 'String' }
  ],

  render : function(params, el) {
    var srcUrl = params['srcUrl'] || '';
    var img = afrous.dom.createElement({ 
      tagName : 'img', 
      src : srcUrl,
      alt : params['alt'] || srcUrl.replace(/.*\/([^\/]+)$/,'$1') 
    })
    el.appendChild(img);
  }

}));


basicRenderer.register(new afrous.UnitAction({
  type : 'HTMLTemplate',
  label : 'HTML Template Renderer',
  description : 'Generate HTML from template. Input properties can be refered and embedded by following notation<br/>#{<i>propname</i>}',
  iconCls : 'html-render-uaction',
  inputs : [
    { name : 'template',
      label : 'template',
      type : 'String',
      formElement : "TEXT_AREA" }
  ],
  allowDynamicInput : true,

  execute : function(request, callback) {
    var templateStr = request.params['template'];
    params = afrous.lang.extend({}, request.params);
    delete params.template;
    var html = templateStr.replace(/#{([^}]+)}/g, function($1,$2) {
      var val;
      try { 
        with(params) eval('val = '+$2+';');
      } catch (e) {}
      if (typeof val != 'undefined') {
        if (afrous.lang.isDOMNode(val)) {
          return afrous.dom.toHTML(val);
        } else {
          var div = afrous.dom.createElement();
          afrous.dom.writeValue(div, val);
          return div.innerHTML;
        }
      } else {
        return '';
      }
    });
    callback.onSuccess(afrous.dom.parseHTML(html));
  }

}));


basicRenderer.register(new afrous.RenderingUnitAction({
  type : 'List',
  label : 'List Renderer',
  description : 'Rendering array data in bullet list format',
  iconCls : 'list-render-uaction',
  inputs : [
    { name : 'array',
      label : 'array to render',
      type : 'Object[]' }
  ],

  render : function(params, el) {
    var _this = this;
    var ul = afrous.dom.createElement({ tagName : 'ul' }) 
    var arr = params['array'];
    
    el.appendChild(ul);
    afrous.lang.forEach(arr, function(val) {
      var li = afrous.dom.createElement({ tagName : 'li' });
      ul.appendChild(li);
      afrous.dom.writeValue(li, val);
    });
  } 

}));


basicRenderer.register(new afrous.RenderingUnitAction({
  type : 'Table',
  label : 'Table Renderer',
  description : 'Rendering array data in table format',
  iconCls : 'table-render-uaction',
  inputs : [
    { name : 'array',
      label : 'array to render',
      type : 'Object[]' }
  ],

  render : function(params, el) {
    var table = afrous.dom.createElement({ tagName : 'table' }) 
    var thead = afrous.dom.createElement({ tagName : 'thead' }); 
    var tbody = afrous.dom.createElement({ tagName : 'tbody' }); 
    
    var arr = params['array'];

    var fields = {};
    afrous.lang.forEach(arr, function(record) {
      afrous.lang.forEach(afrous.lang.keys(record), function(field) {
        fields[field] = true; 
      });
    });
    fields = afrous.lang.keys(fields);

    afrous.lang.forEach(fields, function(field) {
      var th = afrous.dom.createElement({ tagName : 'th' });
      th.appendChild(document.createTextNode(field));
      thead.appendChild(th);
    });

    var _this = this;
    afrous.lang.forEach(arr, function(record) {
      var tr = afrous.dom.createElement({ tagName : 'tr' });
      afrous.lang.forEach(fields, function(field) {
        var val = record[field];
        var td = afrous.dom.createElement({ tagName : 'td' });
        afrous.dom.writeValue(td, val);
        tr.appendChild(td);
      })
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    el.appendChild(table);
  } 

}));


basicRenderer.register(new afrous.RenderingUnitAction({
  type : 'Tile',
  label : 'Tile Renderer',
  description : 'Rendering array data in tile',
  iconCls : 'tile-render-uaction',
  inputs : [
    { name : 'array',
      label : 'array to render',
      type : 'Object[]' },
    { name : 'column',
      label : '# of column',
      type : 'Integer' }
  ],

  render : function(params, el) {
    var table = afrous.dom.createElement({ tagName : 'table', className : 'af-tile' }) 
    var tbody = afrous.dom.createElement({ tagName : 'tbody' }); 
    
    var arr = params['array'];
    var column = params['column'] || 4;

    var tr;
    for (var i=0; i<arr.length; i++) {
      if (i%column==0) {
        tr = afrous.dom.createElement({ tagName : 'tr', className : 'af-tile-row' });
      }
      var td = afrous.dom.createElement(
        { tagName : 'td', className : 'af-tile-cell af-col'+(i%column) });
      afrous.dom.writeValue(td, arr[i]);
      tr.appendChild(td);
      if (i%column==column-1 || i==arr.length-1) {
        tbody.appendChild(tr);
      }
    }

    table.appendChild(tbody);

    el.appendChild(table);
  } 

}));


afrous.packages.register(basicRenderer);


})();

