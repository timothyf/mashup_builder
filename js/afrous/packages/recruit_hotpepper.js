/**
 * Services.Recruit.Hotpepper Package
 */

(function() {

var developerId = '8eb6579f3b687fed';

var abroad = new afrous.UnitActionPackage('Services.Recruit.Hotpepper', {
  label : '\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u002E\u006A\u0070',
  icon : 'http://www.hotpepper.jp/favicon.ico'
});

abroad.register(new afrous.UnitAction({
  type : 'GourmetSearch',
  label : '\u30B0\u30EB\u30E1\u30B5\u30FC\u30C1\u0041\u0050\u0049',
  description : '',
  inputs : [
    { name : 'keyword',
      label : '\u691C\u7D22\u30AD\u30FC\u30EF\u30FC\u30C9',
      type : 'String' },
    { name : 'start',
      label : 'Start index',
      type : 'Integer' },
    { name : 'count',
      label : 'Record count',
      type : 'Integer' }
  ]
  ,
  execute : function(request, callback) {
    var keyword = request.params['keyword'] || '';
    var start = request.params['start'] || 0;
    var count = request.params['count'] || 10;
    var url = 'http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key='+developerId+'&keyword='+encodeURIComponent(keyword)+'&start='+start+'&count='+count+'&format=jsonp';
    afrous.ajax.jsonp.invoke(url, callback);
  }

}));

afrous.packages.register(abroad, 'recruit_hotpepper.js');

})();
