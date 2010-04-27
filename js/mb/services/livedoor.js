/**
 * Services.Livedoor Package
 */

(function() {

var livedoor = new mb.UnitActionPackage('Services.Livedoor', {
  label : 'livedoor',
  icon : 'http://www.livedoor.com/favicon.ico'
});


livedoor.register(new mb.UnitAction({
  type : 'Clips',
  label : 'livedoor \u30AF\u30EA\u30C3\u30D7',
  description : '\u6307\u5B9A\u3057\u305F\u30E6\u30FC\u30B6\u30FC\u306E\u6700\u8FD1\u306E\u30AF\u30EA\u30C3\u30D7\u30C7\u30FC\u30BF\u3092\u53D6\u5F97\u3057\u307E\u3059',
  inputs : [
    { name : 'livedoor_id',
      label : 'livedoor ID',
      type : 'String' },
    { name : 'limit',
      label : '\u30AF\u30EA\u30C3\u30D7\u30C7\u30FC\u30BF\u6570',
      type : 'Integer' },
    { name : 'offset',
      label : '\u30AA\u30D5\u30BB\u30C3\u30C8\u5024',
      type : 'Iteger' }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://api.clip.livedoor.com/json/clips?';
    var id = request.params['livedoor_id'];
    var limit = request.params['limit'];
    var offset = request.params['offset'];
    if (!id) {
      callback.onFailure(); return;
    }
    url += 'livedoor_id='+id;
    if (limit) url += '&limit='+limit; 
    if (offset) url += '&offset='+offset; 
    
    mb.ajax.jsonp.invoke(url, callback);
  }
}));


livedoor.register(new mb.UnitAction({
  type : 'ReaderCount',
  label : 'livedoor Reader Count API',
  description : '\u006C\u0069\u0076\u0065\u0064\u006F\u006F\u0072\u0020\u0052\u0065\u0061\u0064\u0065\u0072\u3067\u7279\u5B9A\u306E\u30D5\u30A3\u30FC\u30C9\u3092\u8CFC\u8AAD\u3057\u3066\u3044\u308B\u30E6\u30FC\u30B6\u30FC\u306E\u6570\u3092\u8FD4\u3059\u0041\u0050\u0049\u3067\u3059',
  inputs : [
    { name : 'feedlink',
      label : 'feed URL',
      type : 'String',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    var feedlink = request.params['feedlink'];
    if (!feedlink) {
      callback.onFailure();
      return;
    }
    var requrl = 'http://rpc.reader.livedoor.com/count';
    requrl += '?feedlink='+encodeURIComponent(feedlink);
    mb.ajax.jsonp.invoke(requrl, callback);
  }
}));



livedoor.register(new mb.UnitAction({
  type : 'FeedDiscover',
  label : 'livedoor Reader Feed Discover API',
  description : '\u006C\u0069\u0076\u0065\u0064\u006F\u006F\u0072\u0020\u0052\u0065\u0061\u0064\u0065\u0072\u306E\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u304B\u3089\u30D5\u30A3\u30FC\u30C9\u3092\u914D\u4FE1\u3057\u3066\u3044\u308B\u30B5\u30A4\u30C8\u3092\u898B\u3064\u3051\u51FA\u3059\u0041\u0050\u0049\u3067\u3059',
  inputs : [
    { name : 'url',
      label : 'URL',
      type : 'String',
      size : 'large' },
    { name : 'links',
      label : 'Links',
      type : 'String[]',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    var requrl = 'http://rpc.reader.livedoor.com/feed/discover?format=json';

    var url = request.params['url'];
    var links = request.params['links'];
    if (url) requrl += '&url='+encodeURIComponent(url);
    if (links && links.length>0) requrl += '&links='+encodeURIComponent(links.join('\n'));
    
    mb.ajax.jsonp.invoke(requrl, callback);
  }
}));


mb.packages.register(livedoor, 'livedoor.js');

})();
