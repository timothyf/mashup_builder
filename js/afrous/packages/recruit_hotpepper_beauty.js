/**
 * Services.Recruit.HotPepperBeauty Package
 */

(function() {

var hpBeauty = new afrous.UnitActionPackage('Services.Recruit.HotPepprBeauty', {
  label : 'HotPeppr Beauty (NOT IMPLEMENTED)',
  icon : 'http://beauty.hotpepper.jp/favicon.ico'
});

/*
hpBeauty.register(new afrous.UnitAction({
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

afrous.packages.register(hpBeauty, 'recruit_hotpepper_beauty.js');

})();
