// MyCoctail Custom Operators

(function() {

//DERI Pipes operator- a template to invoke pipes
var dpipesOperator = new mb.UnitAction({
  type : 'dpipes',
  label : 'DERI Pipes',
  description : 'A template for invoking a DERI Pipe',
  inputs : [
    { name : 'dpipes_instance',
      label : 'Pipe server address (optional)',
      type : 'String' },
    { name : 'dpipes_name',
      label : 'Pipe name',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var dpipes_instance = request.params['dpipes_instance'] || '';
    var dpipes_pname = request.params['dpipes_name'] || '';
	
	if (dpipes_instance == '') dpipes_instance = 'http://pipes.deri.org:8080/pipes/pipes/';
//	if (dpipes_instance == '') dpipes_instance = 'http://minsky.gsi.dit.upm.es/pipes/pipes/';
	
	if (dpipes_pname!= '') 
	{
		var dpipes_string = dpipes_instance+'?id='+dpipes_pname+'&format=jsonp'; //'icalsync2'
		
		//callback.onSuccess(dpipes_string);
//		mb.ajax.jsonp.invoke(dpipes_string, callback); 
		mb.ajax.jsonp.invoke(
			dpipes_string,
			callback, 
			{ jsonpParam : 'cb' });
	}
	else 
	callback.onSuccess('Wrong pipe name!');
  }
});

var dpipesPackage = new mb.UnitActionPackage('Services.Dpipes', {
  label : 'DERI Pipes',  
  icon : 'http://pipes.deri.org/templates/rhuk_milkyway/favicon.ico'
});

dpipesPackage.register(dpipesOperator);
mb.packages.register(dpipesPackage,'dpipes-operators.js');

})();


