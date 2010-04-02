
/**
 * EL
 */
var EL = new function() {
  // recursively scans object's properties
  function scanObject(obj, matchFn, applyFn) {
    if (matchFn(obj)) return applyFn(obj);

    if (mbuilder.lang.isPrintable(obj)) { // leaf property, pseudo primitive.
      return obj;
    } 
	else if (jQuery.isArray(obj)) { // array
      return jQuery.map(obj, function(o) { return scanObject(o, matchFn, applyFn) });
    } 
	else { // normal object
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
      scanObject(obj, mbuilder.lang.isString, _extractVars);
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
    },
    evaluate: function(context, obj) {
      return scanObject(obj, mbuilder.lang.isString, _evalReference);

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
