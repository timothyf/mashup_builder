/**
 * Services.Rubymi Package
 */
(function() {

var rubymi = new afrous.UnitActionPackage('Services.Rubymi', {
  label : 'RubyMI',
  icon : 'http://rubymi.org/favicon.ico'
});

rubymi.register(new afrous.UnitAction({
  type : 'Users',
  label : 'Users',
  description : 'Returns the the users of RubyMI.org.',
  inputs : [],
  execute : function(request, callback) {
    var url = 'http://localhost:3000/users/grid_data';
    afrous.ajax.jsonp.invoke(url, callback);
  }

}));

afrous.packages.register(rubymi, 'rubymi.js');

})();
