/**
 * Services.Pathtraq Package
 */

(function() {

var pathtraq = new afrous.UnitActionPackage('Services.Pathtraq', {
  label : 'Pathtraq'
});

pathtraq.register(new afrous.UnitAction({
  type : 'Pages',
  label : '\u30AD\u30FC\u30EF\u30FC\u30C9\u30FB\u0055\u0052\u004C\u691C\u7D22\u0041\u0050\u0049',
  description : '\u30D1\u30B9\u30C8\u30E9\u30C3\u30AF\u306E\u691C\u7D22\u6A5F\u80FD\u3092\u53D6\u5F97\u3059\u308B\u0020\u0041\u0050\u0049\u0020\u3067\u3059\u3002\u0020\u30AD\u30FC\u30EF\u30FC\u30C9\u3084\u0055\u0052\u004C\u30D1\u30BF\u30FC\u30F3\u3001\u30AB\u30C6\u30B4\u30EA\u3092\u6307\u5B9A\u3057\u3066\u691C\u7D22\u3092\u884C\u3046\u4E8B\u304C\u51FA\u6765\u307E\u3059\u3002',
  inputs : [
    { name : 'url',
      label : 'URL pattern',
      type : 'String',
      size : 'large' },
    { name : 'mode',
      label : 'mode',
      type : 'String',
      options : ['upcoming', 'hot', 'popular', 'site'] }
  ]
  ,
  execute : function(request, callback) {
    var url = request.params['url'];
    var mode = request.params['mode'] || 'upcoming';
    var requrl = 'http://api.pathtraq.com/pages?api=json&__lang=ja&m='+mode+'&url='+encodeURIComponent(url);
    afrous.ajax.jsonp.invoke(requrl, callback);
  }
}));


pathtraq.register(new afrous.UnitAction({
  type : 'News',
  label : '\u30CB\u30E5\u30FC\u30B9\u30E9\u30F3\u30AD\u30F3\u30B0\u53D6\u5F97\u0041\u0050\u0049',
  description : '\u30D1\u30B9\u30C8\u30E9\u30C3\u30AF\u306E\u4EBA\u6C17\u306E\u30CB\u30E5\u30FC\u30B9\u30E9\u30F3\u30AD\u30F3\u30B0\u3092\u53D6\u5F97\u3059\u308B\u0041\u0050\u0049\u3067\u3059\u3002\u30CB\u30E5\u30FC\u30B9\u30B8\u30E3\u30F3\u30EB\u306E\u6307\u5B9A\u3068\u30B9\u30B3\u30FC\u30D7\u306E\u6307\u5B9A\u304C\u51FA\u6765\u307E\u3059\u3002',
  inputs : [
    { name : 'genre',
      label : 'genre',
      type : 'String',
      options : ['national', 'sports', 'business', 'politics', 'international', 'academic', 'culture'] },
    { name : 'mode',
      label : 'mode',
      type : 'String',
      options : ['upcoming', 'hot', 'popular'] }
  ]
  ,
  execute : function(request, callback) {
    var genre = request.params['genre'];
    var mode = request.params['mode'] || 'hot';
    var requrl = 'http://api.pathtraq.com/news_ja?api=json&m='+mode+'&genre='+genre;
    afrous.ajax.jsonp.invoke(requrl, callback);
  }

}));


pathtraq.register(new afrous.UnitAction({
  type : 'Category',
  label : '\u30AB\u30C6\u30B4\u30EA\u30E9\u30F3\u30AD\u30F3\u30B0\u53D6\u5F97\u0041\u0050\u0049',
  description : '\u30D1\u30B9\u30C8\u30E9\u30C3\u30AF\u306E\u5168\u4F53\u30E9\u30F3\u30AD\u30F3\u30B0\u3084\u30AB\u30C6\u30B4\u30EA\u5225\u306E\u30E9\u30F3\u30AD\u30F3\u30B0\u3092\u53D6\u5F97\u3059\u308B\u0020\u0041\u0050\u0049\u0020\u3067\u3059\u3002',
  inputs : [
    { name : 'category',
      label : 'category',
      type : 'String',
      options : ["politics", "business", "society", "showbiz", "music", "movie", "anime", "game", "sports", "motor", "education", "reading", "science", "art", "foods", "travel", "mobile", "computer", "web"] },
    { name : 'mode',
      label : 'mode',
      type : 'String',
      options : ['upcoming', 'hot', 'popular'] }
  ]
  ,
  execute : function(request, callback) {
    var category = request.params['category'];
    var mode = request.params['mode'] || 'hot';
    var requrl = 'http://api.pathtraq.com/popular?api=json&m='+mode+'&category='+category;
    afrous.ajax.jsonp.invoke(requrl, callback);
  }

}));


pathtraq.register(new afrous.UnitAction({
  type : 'URLNormalize',
  label : '\u0055\u0052\u004C\u6B63\u898F\u5316\u0041\u0050\u0049',
  description : '\u30D1\u30B9\u30C8\u30E9\u30C3\u30AF\u5185\u3067\u0055\u0052\u004C\u306E\u6B63\u898F\u5316\u3092\u884C\u3046\u6A5F\u80FD\u3092\u0041\u0050\u0049\u5316\u3057\u305F\u7269\u3067\u3059\u3002\u540C\u4E00\u30EA\u30BD\u30FC\u30B9\u3092\u6307\u3059\u0055\u0052\u004C\u3092\u30B7\u30F3\u30D7\u30EB\u306A\u5F62\u306B\u5909\u63DB\u3059\u308B\u969B\u306B\u5229\u7528\u51FA\u6765\u307E\u3059\u3002\u0028\u0041\u006D\u0061\u007A\u006F\u006E\u306E\u5546\u54C1\u30EA\u30F3\u30AF\u306A\u3069\u0029\u0020',
  inputs : [
    { name : 'url',
      label : 'URL pattern',
      type : 'String',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    var url = request.params['url'];
    var requrl = 'http://api.pathtraq.com/normalize_url2?api=json&url='+encodeURIComponent(url);
    afrous.ajax.jsonp.invoke(requrl, callback);
  }

}));


pathtraq.register(new afrous.UnitAction({
  type : 'PageCounter',
  label : '\u30DA\u30FC\u30B8\u30AB\u30A6\u30F3\u30BF\u0041\u0050\u0049',
  description : '\u6CE8\u76EE\u30FB\u4EBA\u6C17\u30FB\u5B9A\u756A\u3068\u8A00\u3046\u6642\u9593\u5E2F\u3067\u533A\u5207\u3063\u305F\u7279\u5B9A\u306E\u0020\u0055\u0052\u004C\u0020\u5358\u4F4D\u306E\u30A2\u30AF\u30BB\u30B9\u6570\u3092\u8FD4\u3057\u307E\u3059\u3002',
  inputs : [
    { name : 'url',
      label : 'URL pattern',
      type : 'String',
      size : 'large' },
    { name : 'mode',
      label : 'mode',
      type : 'String',
      options : ['upcoming', 'hot', 'popular'] }
  ]
  ,
  execute : function(request, callback) {
    var url = request.params['url'];
    var mode = request.params['mode'] || 'hot';
    var requrl = 'http://api.pathtraq.com/page_counter?api=json&m='+mode+'&url='+encodeURIComponent(url);
    afrous.ajax.jsonp.invoke(requrl, callback);
  }

}));


pathtraq.register(new afrous.UnitAction({
  type : 'PageChart',
  label : '\u30DA\u30FC\u30B8\u30C1\u30E3\u30FC\u30C8\u0041\u0050\u0049',
  description : '\u7279\u5B9A\u306E\u671F\u9593\u5185\u3067\u306E\u6642\u7CFB\u5217\u306E\u30A2\u30AF\u30BB\u30B9\u6570\u306E\u4E00\u89A7\u3092\u8FD4\u3059\u0020\u0041\u0050\u0049\u0020\u3067\u3059\u3002',
  inputs : [
    { name : 'url',
      label : 'URL pattern',
      type : 'String',
      size : 'large' },
    { name : 'scale',
      label : 'scale',
      type : 'String',
      options : ['24h','1w','1m','3m'] },
  ]
  ,
  execute : function(request, callback) {
    var url = request.params['url'];
    var scale = request.params['scale'] || '24h';
    var requrl = 'http://api.pathtraq.com/page_chart?api=json&scale='+scale+'&url='+encodeURIComponent(url);
    afrous.ajax.jsonp.invoke(requrl, callback);
  }

}));


afrous.packages.register(pathtraq, 'pathtraq.js');

})();
