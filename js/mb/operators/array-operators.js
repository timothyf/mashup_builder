/**
 * Array Package
 */
var array = new mb.UnitActionPackage('Array');


array.register(new mb.UnitAction({
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


array.register(new mb.UnitAction({
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
      mb.async.iterate(
        arr, 
        function(a, i, arr, cb) {
          var childProc = new mb.ProcessInstance(action.definition.innerProcess, process);
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


array.register(new mb.UnitAction({
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

    var farr = jQuery.grep(arr, function(element) {
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
          var pstr = mb.lang.toString(element[condition.property]);
          return pstr.indexOf(condition.value)>=0;
        case 'not includes' : 
          var pstr = mb.lang.toString(element[condition.property]);
          return pstr.indexOf(condition.value)<0;
        case 'matches' : 
          var pstr = mb.lang.toString(element[condition.property]);
          var regexp = new RegExp(condition.value);
          return regexp.test(pstr);
        default :
          return true;
      }
    }
  }
}));


array.register(new mb.UnitAction({
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
  ],
  execute : function(request, callback) {
    var arr = request.params['array'] || [];
    var delim = request.params['delim'] || ',';
    callback.onSuccess(arr.join(delim));
  }
}))


array.register(new mb.UnitAction({
  type : 'Reverse',
  label : 'Reverse',
  description : 'Reverse the order of the array elements.',
  inputs : [
    { name : 'array',
      label : 'array to reverse',
      type : 'Object[]' }
  ],
  execute : function(request, callback) {
    var action = request.action;
    var process = action.process;
    var arr = request.params['array'];
    callback.onSuccess(arr.reverse());
  }
}));


array.register(new mb.UnitAction({
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
  ],
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


array.register(new mb.UnitAction({
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
  ],
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


array.register(new mb.UnitAction({
  type : 'Flatten',
  label : 'Flatten',
  description : 'Turns multidimensional arrays into linear ones.',
  inputs : [
    { name : 'array',
      label : 'array to flatten',
      type : 'Object[]' }
  ],
  execute : function(request, callback) {
    var arr = request.params['array'];
    var rarr = [];

    if (arr) {
      mb.lang.forEach(arr, function(elem) {
        if (elem.constructor == Array) {
          mb.lang.forEach(elem, function(a) { rarr.push(a) });
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


array.register(new mb.UnitAction({
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


array.register(new mb.UnitAction({
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
  ],
  execute : function(request, callback) {
    var action = request.action;
    var process = action.process;
    var rarr = [];

    var property = request.params['property'];
    var tmp = {};
    var rarr = jQuery.grep(request.params['array'] || [], function(elem) {
      var val = property ? elem[property] : mb.lang.toJSON(elem);
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


array.register(new mb.UnitAction({
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
  ],
  execute : function(request, callback) {
    var arr = request.params['array'];
    var propName = request.params['property'];
    var hash = {};
    mb.lang.forEach(arr, function(e) {
      var propValue = e[propName];
      if (hash[propValue]) hash[propValue].push(e);
      else hash[propValue] = [e];
    });
    var groups = jQuery.map(
      mb.lang.keys(hash), 
      function(key){
        return { name : key, members : hash[key] };
      }
    );
    callback.onSuccess(groups);
  } 
}));


array.register(new mb.UnitAction({
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
  ],
  execute : function(request, callback) {
    var arr = request.params['array'];
    var propName = request.params['property'];

	var namesArray = new Array();
	var i=0;
	
	var propertyName = 0;
	var propertyValue = 1;

	var hashObject = {};
    mb.lang.forEach(arr, function(e) {
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


array.register(new mb.UnitAction({
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
  ],
  execute : function(request, callback) {
    var rarr = [];

    var property = request.params['property'];
    var rarr = jQuery.map(
      request.params['array'] || [],
      function(elem) {
        return property ? elem[property] : elem;
      }
    );
    callback.onSuccess(rarr);
  }
}));

mb.packages.register(array);
