/**
 * Services.Rakuten Package
 */

(function() {

var rakuten = new afrous.UnitActionPackage('Services.Rakuten', {
  label : '\u697D\u5929',
  icon : 'http://www.rakuten.co.jp/favicon.ico'
});

var developerId = 'f3bf75c00c0bf20b3332a5bb144b56f4';
var version = '2007-10-25';

rakuten.register(new afrous.UnitAction({
  type : 'RItemSearch',
  label : '\u697D\u5929\u5546\u54C1\u691C\u7D22',
  description : '\u697D\u5929\u5E02\u5834\u306E\u5546\u54C1\uFF08\u5171\u540C\u8CFC\u5165\u5546\u54C1\u30FB\u30AA\u30FC\u30AF\u30B7\u30E7\u30F3\u5546\u54C1\u30FB\u30D5\u30EA\u30DE\u5546\u54C1\u30FB\u697D\u5929\u30AA\u30FC\u30AF\u30B7\u30E7\u30F3\u306E\u500B\u4EBA\u9593\u30AA\u30FC\u30AF\u30B7\u30E7\u30F3\u5546\u54C1\u306F\u9664\u304F\u3002\uFF09\u306E\u60C5\u5831\u3092\u53D6\u5F97\u3059\u308B\u3053\u3068\u304C\u53EF\u80FD\u306A\u0041\u0050\u0049\u3067\u3059\u3002',
  inputs : [
    { name : 'keyword',
      label : '\u691C\u7D22\u30AD\u30FC\u30EF\u30FC\u30C9',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var keyword = request.params['keyword'] || '';
    var url = 'http://api.rakuten.co.jp/rws/1.11/json?developerId='+developerId+'&operation=ItemSearch&version='+version+'&keyword='+encodeURIComponent(keyword);
    afrous.ajax.jsonp.invoke(url, callback, { jsonpParam : 'callBack' });
  }

}));

afrous.packages.register(rakuten, 'rakuten.js');

})();
