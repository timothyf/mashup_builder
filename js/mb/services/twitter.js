/**
 * Services.Twitter Package
 */

(function() {

var twitter = new mb.UnitActionPackage('Services.Twitter', {
  label : 'Twitter',
  icon : 'http://twitter.com/favicon.ico'
});

twitter.register(new mb.UnitAction({
  type : 'PublicTimeline',
  label : 'Public Timeline',
  description : 'Returns the 20 most recent statuses from non-protected users who have set a custom user icon.',
  inputs : [
    { name : 'since_id',
      label : 'since id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://twitter.com/statuses/public_timeline.json?count=10';
    if (request.params['since_id']) url += '?since_id='+request.params['since_id'];
    mb.ajax.jsonp.invoke(url, callback, { globalCallback : true });
  }

}));


twitter.register(new mb.UnitAction({
  type : 'FriendsTimeline',
  label : 'Friends Timeline',
  description : "Returns the 20 most recent statuses posted in the last 24 hours from the authenticating user and that user's friends.", 
  inputs : [
    { name : 'id',
      label : 'twitter id',
      type : 'String' },
    { name : 'page',
      label : 'page num',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://twitter.com/statuses/friends_timeline';
    url += (request.params['id'] ? '/'+request.params['id'] : '') + '.json?count=20'; 
    if (request.params['page']) url += '&page='+request.params['page'];
    mb.ajax.jsonp.invoke(url, callback, { globalCallback : true });
  }

}));


twitter.register(new mb.UnitAction({
  type : 'UserProfile',
  label : 'User Profile',
  description : "Returns user's profile in twitter.",
  inputs : [
    { name : 'id',
      label : 'twitter id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://twitter.com/statuses/user_timeline';
    url += (request.params['id'] ? '/'+request.params['id'] : '') + '.json?';
    url += 'count=1';
    mb.ajax.jsonp.invoke(url, {
      onSuccess : function(res) { callback.onSuccess(res[0].user) },
      onFailure : function(err) { callback.onFailure(err) }
    }, { globalCallback : true });
  }

}));


twitter.register(new mb.UnitAction({
  type : 'UserTimeline',
  label : 'User Timeline',
  description : "Returns the 20 most recent statuses posted in the last 24 hours from the authenticating user.",
  inputs : [
    { name : 'id',
      label : 'twitter id',
      type : 'String' },
    { name : 'count',
      label : 'count',
      type : 'Integer' },
    { name : 'page',
      label : 'page num',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://twitter.com/statuses/user_timeline';
    url += (request.params['id'] ? '/'+request.params['id'] : '') + '.json?';
    url += 'count='+ (request.params['count'] || 20); 
    if (request.params['page']) url += '&page='+request.params['page'];
    mb.ajax.jsonp.invoke(url, callback, { globalCallback : true });
  }

}));


twitter.register(new mb.UnitAction({
  type : 'Friends',
  label : 'Friends',
  description : "Returns up to 100 of the authenticating user's friends who have most recently updated, each with current status inline.",
  inputs : [
    { name : 'id',
      label : 'twitter id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://twitter.com/statuses/friends';
    url += (request.params['id'] ? '/'+request.params['id'] : '') + '.json';
    mb.ajax.jsonp.invoke(url, callback, { globalCallback : true });
  }

}));


twitter.register(new mb.UnitAction({
  type : 'Followers',
  label : 'Followers',
  description : "Returns the authenticating user's followers, each with current status inline.",
  inputs : [],

  execute : function(request, callback) {
    var url = 'http://twitter.com/statuses/followers.json';
    mb.ajax.jsonp.invoke(url, callback, { globalCallback : true });
  }

}));


twitter.register(new mb.UnitAction({
  type : 'Favorites',
  label : 'Favorites',
  description : "Returns the 20 most recent favorite statuses for the authenticating user or user specified by the ID parameter in the requested format.",
  inputs : [
    { name : 'id',
      label : 'twitter id',
      type : 'String' },
    { name : 'page',
      label : 'page',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://twitter.com/favorites';
    url += (request.params['id'] ? '/'+request.params['id'] : '') + '.json';
    if (request.params['page']) url += '&page='+request.params['page'];
    mb.ajax.jsonp.invoke(url, callback, { globalCallback : true });
  }

}));





mb.packages.register(twitter, 'twitter.js');

})();
