/**
 * Services.Flickr Package
 */

(function() {

var apikey = '8ae557e7748e49ff844a6c374db54651';

var flickr = new mb.UnitActionPackage('Services.Flickr', {
  label : 'Flickr',  
  icon : 'http://www.flickr.com/favicon.ico'
});

flickr.register(new mb.UnitAction({
  type : 'PhotoFeed',
  label : 'Flickr Public Photo Feed',
  description : 'Public photos feed in Flickr',
  allowDynamicInput : true,
  inputs : [
    { name : 'ids',
      label : 'flickr user id(s)',
      type : 'String[]' },
    { name : 'tags',
      label : 'tagged with',
      type : 'String[]' },
    { name : 'tagmode',
      label : 'tag mode',
      type : 'String',
      options : ['any','all'] }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://api.flickr.com/services/feeds/photos_public.gne?format=json&';
    if (request.params['ids'])
      url += 'ids='+encodeURIComponent(request.params['ids'].join(','))+'&'; 
    if (request.params['tags']) 
      url += 'tags='+encodeURIComponent(request.params['tags'].join(','))+'&'; 
    if (request.params['tagmode']) 
      url += 'tagmode='+encodeURIComponent(request.params['tagmode'])+'&'; 
    mb.ajax.jsonp.invoke(url, callback, { jsonpParam : 'jsoncallback' }); 
  }
  

}));

mb.packages.register(flickr, 'flickr.js');


})();


