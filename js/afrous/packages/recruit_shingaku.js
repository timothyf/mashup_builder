/**
 * Services.Recruit.ShingakuNet Package
 */

(function() {

var shingaku = new afrous.UnitActionPackage('Services.Recruit.ShingakuNet', {
  label : 'Recruit Shingakunet (NOT IMPLEMENTED)',
  icon : 'http://shingakunet.com/favicon.ico'
});

/*
shingaku.register(new afrous.UnitAction({
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

afrous.packages.register(shingaku, 'recruit_shingaku.js');

})();
