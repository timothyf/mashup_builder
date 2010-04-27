/**
 * Services.Rubymi Package
 */
(function() {

var rubymi = new mb.UnitActionPackage('Services.Rubymi', {
  label : 'RubyMI',
  icon : 'http://rubymi.org/favicon.ico'
});

rubymi.register(new mb.UnitAction({
  type : 'Users',
  label : 'Users',
  description : 'Returns the the users of RubyMI.org.',
  inputs : [],
  execute : function(request, callback) {
    var url = 'http://localhost:3000/users/grid_data';
    mb.ajax.jsonp.invoke(url, callback);
  }

}));

mb.packages.register(rubymi, 'rubymi.js');

})();
