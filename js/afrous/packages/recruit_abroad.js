/**
 * Services.Recruit.ABRoad Package
 */

(function() {

var developerId = '8eb6579f3b687fed';

var abroad = new afrous.UnitActionPackage('Services.Recruit.ABRoad', {
  label : 'AB-Road',
  icon : 'http://www.ab-road.net/favicon.ico'
});

abroad.register(new afrous.UnitAction({
  type : 'ABRoad',
  label : '\u6D77\u5916\u65C5\u884C\u691C\u7D22\u0041\u0050\u0049',
  description : '\u30A8\u30A4\u30D3\u30FC\u30ED\u30FC\u30C9\u0028\u0041\u0042\u002D\u0052\u004F\u0041\u0044\u0029',
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
    var url = 'http://webservice.recruit.co.jp/ab-road/tour/v1/?key='+developerId+'&keyword='+encodeURIComponent(keyword)+'&start='+start+'&count='+count+'&format=jsonp';
    afrous.ajax.jsonp.invoke(url, callback);
  }
}));

afrous.packages.register(abroad, 'recruit_abroad.js');

})();
