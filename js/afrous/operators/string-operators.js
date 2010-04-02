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
