/**
 * Services.Buzzurl Package
 */

(function() {

var buzzurl = new afrous.UnitActionPackage('Services.Buzzurl', {
  label : 'Buzzurl (NOT IMPLEMENTED)',
  icon : 'http://buzzurl.jp/favicon.ico'
});

/*
buzzurl.register(new afrous.UnitAction({
  type : '',
  label : '',
  description : '',
  inputs : [
    { name : 'id',
      label : 'id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    callback.onSuccess();
  }
}));
*/

afrous.packages.register(buzzurl, 'buzzurl.js');

})();
