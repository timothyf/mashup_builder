/**
 * Services.Amazon Package
 */

(function() {

var apikey = '091PBHNXX6J9PEG5WSG2';
var apiserver = 'webservices.amazon.com'; 
var lang = (navigator.language || navigator.userLanguage || '').substring(0, 2).toLowerCase();
switch (lang) {
  case 'ja' : apiserver = 'webservices.amazon.co.jp'; break;
  case 'en' : 
  default : apiserver = 'webservices.amazon.com'; break;
}
var stylesheet = 'http://sandbox.afrous.com/js/afrous/services/amazon_ecs4_itemsearch.xsl';


var amazon = new mb.UnitActionPackage('Services.Amazon', {
  label : 'Amazon',
  icon : 'http://www.amazon.com/favicon.ico'
});

amazon.register(new mb.UnitAction({
  type : 'ItemSearch',
  label : 'Amazon ECS Item Search',
  description : 'Searching items in Amazon.com using Amazon E-Commerse Service.',
  inputs : [
    { name : 'associateTag',
      label : 'associate tag',
      type : 'String' },
    { name : 'keywords',
      label : 'keywords',
      type : 'String' },
    { name : 'searchIndex',
      label : 'search index',
      type : 'String',
      options : ['Blended', 'Books', 'Music', 'MusicTracks', 'Classical', 'Video', 'DVD', 'VHS', 'VideoGames', 'Electronics', 'Kitchen', 'Toys', 'Software' ] },
    { name : 'sort',
      label : 'sort by',
      type : 'String',
      options : ['sales', 'title asc', 'title desc', 'date', 'price asc', 'price desc' ] },
    { name : 'page',
      label : 'page',
      type : 'Integer' }
  ]
  ,


  execute : function(request, callback) {
    var associateTag = request.params['associateTag'];
    var keywords = request.params['keywords'];
    var searchIndex = request.params['searchIndex'] || 'Blended';
    var sort = request.params['sort'];
    var page = request.params['page'];
   
    var url = 'http://'+apiserver+'/onca/xml?';

    var params = [
      'Service=AWSECommerceService',
      'AWSAccessKeyId='+apikey,
      'ResponseGroup=Large',
      'Operation=ItemSearch',
      'ContentType=text%2Fjavascript',
      'Version=2005-10-05',
      'SearchIndex='+searchIndex,
      'Style='+encodeURIComponent(stylesheet)
    ];
    if (associateTag) params.push('AssociateTag='+associateTag);
    if (keywords) params.push('Keywords='+encodeURIComponent(keywords));
    if (sort) {
      var sortby;
      switch (sort) {
        case 'sales' : sortby = 'salesrank'; break;
        case 'title asc' : sortby = 'titlerank'; break;
        case 'title desc' : sortby = '-titlerank'; break;
        case 'date' : 
          switch (searchIndex) {
            case 'Books' :
            case 'ForeignBooks' : 
              sortby = 'daterank'; break;
            case 'Classical' :
            case 'DVD' :
            case 'Music' :
            case 'VHS' :
            case 'Video' :
              sortby = 'orig-rel-date'; break;
            case 'Kitchen' :
            case 'Electronics' :
            case 'Software' :
            case 'Toys' :
            case 'VideoGames' :
              sortby = 'release-date'; break;
            default : 
              break;
          }
          break;
        case 'price desc' : 
          switch (searchIndex) {
            case 'Kitchen' :
            case 'Software' :
            case 'Toys' :
            case 'VideoGames' :
              sortby = 'price'; break;
            case 'Books' :
            case 'Classical' :
            case 'DVD' :
            case 'Electronics' : 
            case 'ForeignBooks' : 
            case 'Music' :
            case 'VHS' :
            case 'Video' :
              sortby = 'pricerank'; break;
            default :
              break;
          } 
          break;
        case 'price asc' : 
          switch (searchIndex) {
            case 'Kitchen' :
            case 'Software' :
            case 'Toys' :
            case 'VideoGames' :
              sortby = '-price'; break;
            case 'Classical' :
            case 'DVD' :
            case 'Electronics' : 
            case 'Music' :
            case 'VHS' :
            case 'Video' :
              sortby = '-pricerank'; break;
            case 'Books' :
            case 'ForeignBooks' : 
              sortby = 'inverse-pricerank'; break;
            default :
              break;
          } 
          break;
        default : break;
      }
      if (sortby) params.push('Sort='+sortby);
    }
    if (page) params.push('ItemPage='+page);

    url += params.join('&');

    mb.ajax.jsonp.invoke(url, callback);
  }

}));

mb.packages.register(amazon, 'amazon.js');

})();
