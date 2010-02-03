/**
 * Services.Recruit.Jalan Package
 */

(function() {

var jalan = new afrous.UnitActionPackage('Services.Recruit.Jalan', {
  label : 'Jalan (NOT IMPLEMENTED)',
  icon : 'http://www.jalan.net/favicon.ico'
});

/*
jalan.register(new afrous.UnitAction({
  type : '',
  label : '',
  description : '',
  inputs : [
  ]
  ,
  execute : function(request, callback) {
    callback.onSuccess();
  }
}));
*/

afrous.packages.register(jalan, 'recruit_jalan.js');

})();
