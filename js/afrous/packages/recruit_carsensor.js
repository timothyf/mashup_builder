/**
 * Services.Recruit.CarSensor Package
 */

(function() {

var carsensor = new afrous.UnitActionPackage('Services.Recruit.CarSensor', {
  label : 'CarSensor (NOT IMPLEMENTED)',
  icon : 'http://www.carsensorlab.net/favicon.ico'
});

/*
carsensor.register(new afrous.UnitAction({
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

afrous.packages.register(carsensor, 'recruit_carsensor.js');

})();
