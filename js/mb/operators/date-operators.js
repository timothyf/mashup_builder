// MyCoctail Custom Operators

(function() {

//Current Date Operator - return current date on the client machine
var curDateOperator = new mb.UnitAction({
  type : 'Curdate',
  label : 'Current date',
  description : 'Returns the current date in YYYY-MM-DD format',
  inputs : [
  ]
  ,
  execute : function(request, callback) {
    var currentTime = new Date();
    var test = request.params['test'] || '';
    var day = currentTime.getDate();
    var month = currentTime.getMonth()+1;
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    callback.onSuccess(currentTime.getFullYear()+'-'+month+'-'+day);
  }
})

var dateOperatorsPackage = new mb.UnitActionPackage('Custom Operators');
dateOperatorsPackage.register(curDateOperator);
mb.packages.register(dateOperatorsPackage, 'date-operators.js');

})();
