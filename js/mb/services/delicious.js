/**
 * Services.delicious Package
 */

(function() {

var delicious = new mb.UnitActionPackage('Services.Delicious', {
  label : 'del.icio.us',
  icon : 'http://del.icio.us/favicon.ico'
});

delicious.register(new mb.UnitAction({
  type : 'Posts',
  label : 'Del.icio.us Posts',
  description : 'Returns del.icio.us recent bookmark list of the user.',
  inputs : [
    { name : 'username',
      label : 'del.icio.us id',
      type : 'String' },
    { name : 'tags',
      label : 'tagged with',
      type : 'String[]' },
    { name : 'count',
      label : 'count',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    if (request.params['username']) {
      var url = 'http://del.icio.us/feeds/json/'+request.params['username'];
      if (request.params['tags']) {
        url += '/'+encodeURIComponent(request.params['tags'].join(' '));
      }
      if (request.params['count']) url += '?count='+request.params['count'];
      mb.ajax.jsonp.invoke(url, callback);
    } else {
      callback.onFailure();
    }
  }

}));

delicious.register(new mb.UnitAction({
  type : 'Tags',
  label : 'Del.icio.us Tags',
  description : 'Returns del.icio.us tags of the user.',
  inputs : [
    { name : 'username',
      label : 'del.icio.us id',
      type : 'String' },
    { name : 'atleast',
      label : '"at least" threshold',
      type : 'Integer' },
    { name : 'sort',
      label : 'sort by',
      type : 'String',
      options : ['alpha', 'count' ] 
    },
    { name : 'count',
      label : 'count',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    if (request.params['username']) {
      var url = 'http://del.icio.us/feeds/json/tags/'+request.params['username']+'?';
      if (request.params['atleast']) url += 'atleast='+request.params['atleast']+'&';
      if (request.params['sort']) url += 'sort='+request.params['sort']+'&';
      if (request.params['count']) url += 'count='+request.params['count']+'&';
      mb.ajax.jsonp.invoke(url, callback);
    } else {
      callback.onFailure();
    }
  }
}));

delicious.register(new mb.UnitAction({
  type : 'URL',
  label : 'Del.icio.us URL',
  description : 'Returns posts information of given URL.',
  inputs : [
    { name : 'urls',
      label : 'URL list',
      type : 'String[]',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    if (request.params['urls']) {
      var url = 'http://badges.del.icio.us/feeds/json/url/data?';
      mb.lang.forEach(request.params['urls'], function(u) {
        url += 'url='+encodeURIComponent(u)+'&';
      });
      mb.ajax.jsonp.invoke(url, callback);
    } else {
      callback.onFailure();
    }
  }
}));


delicious.register(new mb.UnitAction({
  type : 'Network',
  label : 'Del.icio.us Network',
  description : 'Returns del.icio.us network user id list.',
  inputs : [
    { name : 'username',
      label : 'del.icio.us id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    if (request.params['username']) {
      var url = 'http://del.icio.us/feeds/json/network/'+request.params['username'];
      mb.ajax.jsonp.invoke(url, callback);
    } else {
      callback.onFailure();
    }
  }

}));


delicious.register(new mb.UnitAction({
  type : 'Fans',
  label : 'Del.icio.us Fans',
  description : 'Returns del.icio.us fans user id list.',
  inputs : [
    { name : 'username',
      label : 'del.icio.us id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    if (request.params['username']) {
      var url = 'http://del.icio.us/feeds/json/fans/'+request.params['username'];
      mb.ajax.jsonp.invoke(url, callback);
    } else {
      callback.onFailure();
    }
  }

}));

mb.packages.register(delicious, 'delicious.js');

})();
