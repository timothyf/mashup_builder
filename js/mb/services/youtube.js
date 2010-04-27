/**
 * Services.Youtube Package
 */

(function() {

var youtube = new mb.UnitActionPackage('Services.Youtube', {
  label : 'Youtube',
  icon : 'http://www.youtube.com/favicon.ico'
});

youtube.register(new mb.UnitAction({
  type : 'Videos',
  label : 'Youtube Videos Search',
  description : 'Get video feeds from Youtube',
  inputs : [
    { name : 'vq',
      label : 'keyword',
      type : 'String' },
    { name : 'tags',
      label : 'tagged with',
      type : 'String[]' },
    { name : 'categories',
      label : 'categories',
      type : 'String[]' },
    { name : 'orderby',
      label : 'order by',
      type : 'String',
      options : ['updated', 'viewCount', 'rating', 'relevance' ] },
    { name : 'startindex',
      label : 'start index',
      type : 'Integer' },
    { name : 'maxresults',
      label : 'max results',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var vq = request.params['vq'];
    var tags = request.params['tags'];
    var categories = request.params['categories'];
    var vq = request.params['vq'];
    var orderby = request.params['orderby'];
    var startindex = request.params['startindex'];
    var maxresults = request.params['maxresults'];
    
    var url = 'http://gdata.youtube.com/feeds/videos';
    if (categories || tags) {
      url += '/-';
    }
    if (categories && categories.length>0) {
      url += '/'+encodeURIComponent(categories.join('|'));
    }
    if (tags && tags.length>0) {
      url += '/'+mb.lang.map(tags,function(t){return encodeURIComponent(t)}).join('/');
    }
    var params = [ '?alt=json-in-script' ];
    if (vq) params.push('vq='+encodeURIComponent(vq));
    if (orderby) params.push('orderby='+orderby);
    if (typeof startindex != 'undefined') params.push('start-index='+startindex);
    if (typeof maxresults != 'undefined') params.push('max-results='+maxresults);
    url += params.join('&');

    mb.ajax.jsonp.invoke(url, callback);
  }

}));

mb.packages.register(youtube, 'youtube.js');

})();
