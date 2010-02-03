/**
 * Services.Hatena Package
 */

(function() {

var hatena = new afrous.UnitActionPackage('Services.Hatena', {
  label : '\u306F\u3066\u306A',
  icon : 'http://www.hatena.ne.jp/favicon.ico'
});

hatena.register(new afrous.UnitAction({
  type : 'Bookmark',
  label : '\u306F\u3066\u306A\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u60C5\u5831\u53D6\u5F97',
  description : '\u306F\u3066\u306A\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u306E\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u60C5\u5831\u3092\u53D6\u5F97\u3057\u307E\u3059',
  inputs : [
    { name : 'url',
      label : 'URL',
      type : 'String',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    var url = request.params['url'];
    var requrl = 'http://b.hatena.ne.jp/entry/json/?url='+encodeURIComponent(url);
    afrous.ajax.jsonp.invoke(requrl, callback);
  }
}));


hatena.register(new afrous.UnitAction({
  type : 'Favorites',
  label : '\u306F\u3066\u306A\u304A\u6C17\u306B\u5165\u308A\u30E6\u30FC\u30B6',
  description : '\u306F\u3066\u306A\u306E\u5404\u30B5\u30FC\u30D3\u30B9\u3067\u306E\u6D3B\u52D5\u304B\u3089\u76F8\u624B\u306B\u5BFE\u3057\u3066\u4F55\u3089\u304B\u306E\u884C\u52D5\u3092\u884C\u3063\u3066\u3044\u308B\u30E6\u30FC\u30B6\u30FC\u306E\u60C5\u5831\u3092\u53D6\u5F97\u3057\u307E\u3059',
  inputs : [
    { name : 'id',
      label : '\u306F\u3066\u306A id',
      type : 'String' },
    { name : 'target',
      label : '\u5BFE\u8C61',
      type : 'String',
      options : [ '\u30C0\u30A4\u30A2\u30EA\u30FC', '\u30A2\u30F3\u30C6\u30CA', 'RSS', '\u30B0\u30EB\u30FC\u30D7', '\u30B9\u30BF\u30FC' ] }
  ]
  ,
  execute : function(request, callback) {
    var id = request.params['id'];
    var target = request.params['target'];
    var server = 'www';
    if (target=='\u30C0\u30A4\u30A2\u30EA\u30FC') server = 'd';
    else if (target=='\u30A2\u30F3\u30C6\u30CA') server = 'a';
    else if (target=='RSS') server = 'r';
    else if (target=='\u30B0\u30EB\u30FC\u30D7') server = 'g';
    else if (target=='\u30B9\u30BF\u30FC') server = 's';

    var requrl = 'http://'+server+'.hatena.ne.jp/'+id+'/favorites.json';
    afrous.ajax.jsonp.invoke(requrl, callback);
  }
}));


hatena.register(new afrous.UnitAction({
  type : 'Star',
  label : '\u306F\u3066\u306A\u30B9\u30BF\u30FC\u30AB\u30A6\u30F3\u30C8',
  description : '\u6307\u5B9A\u3057\u305F\u30D6\u30ED\u30B0\u306E\u30A8\u30F3\u30C8\u30EA\u306B\u5168\u90E8\u3067\u3044\u304F\u3064\u306E\u2606\u304C\u3064\u3051\u3089\u308C\u3066\u3044\u308B\u306E\u304B\u3092\u53D6\u5F97\u3059\u308B',
  inputs : [
    { name : 'url',
      label : 'URL',
      type : 'String',
      size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    var url = request.params['url'];
    var requrl = 'http://s.hatena.ne.jp/blog.json/'+url;
    afrous.ajax.jsonp.invoke(requrl, callback);
  }
}));

afrous.packages.register(hatena, 'hatena.js');

})();
