/**
 * Services.Mixi Package
 */

(function() {

var mixi = new afrous.UnitActionPackage('Services.Mixi', {
  label : 'mixi',
  icon : 'http://mixi.jp/favicon.ico'
});

mixi.register(new afrous.UnitAction({
  type : 'Friends',
  label : 'My Mixi Friends',
  description : 'Fetching My Mixi friends list for given user id.',
  waittime : 1000,
  inputs : [
    { name : 'id',
      label : 'mixi id',
      type : 'String' }
  ]
  ,
  execute : function(request, callback) {
    var id = request.params['id'];
    var friends = []
    fetchMyMixiFriends(id);

    function fetchMyMixiFriends(id, page) {
      var params = [];
      if (id) params.push('id='+id);
      if (page) params.push('page='+page);
      afrous.ajax.request({
          path : '/list_friend.pl' + (params.length>0 ? '?'+params.join('&') : ''),
          mimeType : 'text/html'
        }, 
        function(doc) {
          var divs = afrous.lang.filter(
            doc.getElementsByTagName('div'),
            function(div) { return div.id && div.className.indexOf('iconState')==0 }
          );
          Array.prototype.push.apply(friends, 
            afrous.lang.map(divs, function(el) {
              var id = parseInt(el.id.substring(2));
              var a = afrous.lang.find(
                afrous.lang.find(
                  el.getElementsByTagName('div'),
                  function(div) { return div.className == 'iconListImage' }
                ).getElementsByTagName('a'),
                function(a) { return a.className=='iconTitle' }
              );
              var imgUrl = a.style.backgroundImage.match(/url\((.*?)\)/)[1];
              var state = parseInt(el.className.replace('iconState',''), 10);
              var nickname = a.title;
              return { 
                id : id, 
                imgUrl : imgUrl, 
                state : state,
                nickname : nickname.replace(/..\(\d+\)$/,'')
              }
            })
          );
          
          var a = afrous.lang.find(
            doc.getElementsByTagName('a'), 
            function(a) { return a.innerHTML.indexOf("\u6B21\u3092\u8868\u793A")==0 }
          );
          if (a) {
            var page = a.href.match(/page=(\d+)/)[1];
            fetchMyMixiFriends(id, page)
          } else {
            callback.onSuccess(friends);
          }
        }
      );
    }
  }
}));



mixi.register(new afrous.UnitAction({
  type : 'Logs',
  label : 'My Asiato',
  description : 'Fetching Asiato Log.',
  waittime : 1000,
  inputs : [],

  execute : function(request, callback) {
    var members = []
    fetchLogs();

    function fetchLogs(page) {
      afrous.ajax.request({
          path : '/show_log.pl' + (page ? '?page='+page : ''),
          mimeType : 'text/html'
        }, 
        function(doc) {
          var ul = afrous.lang.find(
            doc.getElementsByTagName('ul'),
            function(div) { return div.className && div.className.match(/(^|\s)log(\s|$)/) }
          );
          var lis = ul ? ul.getElementsByTagName('li') : [];
          Array.prototype.push.apply(members, 
            afrous.lang.map(lis, function(li) {
              var a = li.getElementsByTagName('a')[0];
              var time = li.firstChild.nodeValue;
              time = time.replace('\u5E74','-').replace('\u6708', '-').replace('\u65E5 ', 'T').replace(/\s+$/, '')+':00+09:00';
              return { 
                id : a.href.match(/id=(\d+)$/)[1], 
                access_time : time,
                nickname : a.firstChild.nodeValue
              }
            })
          );
          
          var a = afrous.lang.find(
            doc.getElementsByTagName('a'), 
            function(a) { return a.innerHTML.indexOf("\u6B21\u3092\u8868\u793A")==0 }
          );
          if (a) {
            var page = a.href.match(/page=(\d+)/)[1];
            fetchLogs(page)
          } else {
            callback.onSuccess(members);
          }
        }
      );
    }
  }
}));


mixi.register(new afrous.UnitAction({
  type : 'Diaries',
  label : 'Mixi Diaries',
  description : 'Fetching Mixi Diaries.',
  waittime : 1000,
  inputs : [
    { name : 'id',
      label : 'mixi id',
      type : 'String' }
  ]
  ,
 
  execute : function(request, callback) {
    var id = request.params['id'];
    var params = [];

    afrous.ajax.request({
        path : '/list_diary.pl' + (id ? '?id='+id : ''),
        mimeType : 'text/html'
      }, 
      function(doc) {
        var alertArea = afrous.lang.find(
          doc.getElementsByTagName('div'),
          function(div) { return div.className=='alertArea' }
        );
        if (alertArea) {
          var a = alertArea.getElementsByTagName('a');
          callback.onSuccess({ 
            external : a.length>0,
            blogUrl : a.length>0 && a[0].href
          });
          return;
        }
        var divs = afrous.lang.filter(
          doc.getElementsByTagName('div'),
          function(div) { return div.className=='listDiaryTitle' }
        );
        var diaries = afrous.lang.map(divs, function(div) {
          var a = div.getElementsByTagName('a')[0];
          var time = div.getElementsByTagName('dd')[0].firstChild.nodeValue;
          time = time.replace('\u5E74','-').replace('\u6708', '-').replace('\u65E5\n', 'T').replace(/\s+$/, '')+':00+09:00';
          return { 
            link : a.href,
            time : time,
            title : a.firstChild.nodeValue
          }
        })

        callback.onSuccess({
          external : false,
          diaries : diaries
        });
      }
    );

  }
}));

afrous.packages.register(mixi, 'mixi.js');


})();
