/**
 * Services.ECMSystems Package
 */

(function() {

var apikey = 'ABQIAAAAYtWO2s_klJQZgGk9oArIARQ7o5oUyz7U1LxSb0z2whgXE1vvYhQMcWx6a-9Gbw4nuhOiSMAhoKtHtg';
var apikeyGoogle = 'ABQIAAAAQLVYVvhTjXRPtKDa9AsPlhQs1SMlRZa-qyzdhC9kofgBeB67sRRcX48ZCyilXhFK6qqej_uY3YV6AA';
var apiserver = 'localhost:8080';
var lang = (navigator.language || navigator.userLanguage || '').substring(0, 2).toLowerCase();
switch (lang) {
  case 'ja' : apiserver = 'localhost:8080'; break;
  case 'en' : 
  default : apiserver = 'localhost:8080'; break;
}

var ecmsystems = new afrous.UnitActionPackage('Services.ECMSystems', {
  label : 'ECM Systems',
  icon : ''
});

// ECM Contents
ecmsystems.register(new afrous.UnitAction({
  type : 'searchecm',
  label : 'ECM Contents',
  description : 'Content Search.',
  inputs : [
    /*{ name : 'username',
      label : 'Username',
      type : 'String',
      size : 'large' },
    { name : 'password',
      label : 'Password',
      type : 'String',
      size : 'large' },*/
    { name : 'content',
      label : 'Query',
      type : 'String',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    //var username = request.params['username'];
    //var password = request.params['password'];
    var username = 'admin';
    var password = 'admin';
    var content = request.params['content'];

	var url = 'http://'+ apiserver +'/MyCocktail/Search?q='+ content +'&user='+ username +'&pwd='+ password;
    
    afrous.ajax.jsonp.invoke(url, {
      onSuccess : function(ret) {
        if (ret[2]=='200') {
          callback.onSuccess(ret[1]);
        } else { 
	  	  callback.onSuccess({ error : ret[2], message : ret[3] });
        } 
      },
      onFailure : callback.onFailure
    });
  }
}));


// ECM Repositories list
ecmsystems.register(new afrous.UnitAction({
  type : 'repolist',
  label : 'ECM Repositories',
  description : 'See the list of available repositories.',
  inputs : [
    /*{ name : 'repoFile',
      label : 'Config File',
      type : 'String',
      size : 'large' }*/
  ]
  ,
  execute : function(request, callback) {
	var url = 'http://'+ apiserver +'/MyCocktail/GetRepoList';
    
    afrous.ajax.jsonp.invoke(url, {
      onSuccess : function(ret) {
        if (ret[2]=='200') {
          callback.onSuccess(ret[1]);
        } else { 
	  	  callback.onSuccess({ error : ret[2], message : ret[3] });
        } 
      },
      onFailure : callback.onFailure
    });
    
  }
}));


// Add new ECM Repository
ecmsystems.register(new afrous.UnitAction({
  type : 'addecm',
  label : 'Add new ECM Repository',
  description : 'Add new ECM repository to the list of available repositories.',
  inputs : [
    { name : 'repoInfo',
      label : 'Repository',
      type : 'String',
      size : 'large' },
    { name : 'user',
      label : 'Username',
      type : 'String',
      size : 'large' },
    { name : 'pwd',
      label : 'Password',
      type : 'String',
      size : 'large' },
  ]
  ,
  execute : function(request, callback) {
	var repoInfo = request.params['repoInfo'];
	var user = request.params['user'];
	var pwd = request.params['pwd'];
	
    var url = 'http://'+ apiserver +'/MyCocktail/AddNewRepo?user='+ user +'&pwd='+ pwd +'&repoInfo='+ repoInfo;    
    
    afrous.ajax.jsonp.invoke(url, {
      onSuccess : function(ret) {
        if (ret[2]=='200') {
          callback.onSuccess(ret[1]);
        } else { 
	  	  callback.onSuccess({ error : ret[2], message : ret[3] });
        } 
      },
      onFailure : callback.onFailure
    });
    
  }
}));


afrous.packages.register(ecmsystems, 'ecm_systems.js');

})();
