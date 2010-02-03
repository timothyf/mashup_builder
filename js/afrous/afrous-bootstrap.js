(function() {

var baseURL = (function() {
  var scripts = document.getElementsByTagName('script');
  for (var i=0; i<scripts.length; i++) {
    var m = scripts[i].src.match(/(.*)\/js\/afrous\/afrous-bootstrap\.js$/);
    if (m) return m[1];
  }
})();

var imgURL = (function() {
  var root = location.href.match(/^https?:\/\/[^\/]+\//)[0];
  var imgs = document.getElementsByTagName('img');
  for (var i=0; i<imgs.length; i++) {
    if (imgs[i].src.indexOf(root)==0) {
      return imgs[i].src;
    }
  }
})();

if (!imgURL) imgURL = location.href.match(/^https?:\/\/.*?\//)[0]+'dummy.gif';


var w = window.open('','_blank','width=1200,left=20,height=800,resizable,scrollbars=yes');
if (!w) {
  alert('please turn off popup blocker');
  return;
}

var doc = w.document;
doc.open();
doc.write([
'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"',
'"http://www.w3.org/TR/html4/loose.dtd">',
'<html>',
'  <head>',
'    <title>Afrous</title>',
'    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />',
'    <link type="text/css" rel="stylesheet" href="',baseURL,'/extjs/resources/css/ext-all.css"></link>',
'    <link type="text/css" rel="stylesheet" href="',baseURL,'/css/afrous-editor.css"></link>',
'    <link type="text/css" rel="stylesheet" href="',baseURL,'/extjs/resources/css/xtheme-aero.css"></link>',
'    <script type="text/javascript" src="',baseURL,'/js/jquery/jquery.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/extjs/adapter/jquery/jquery-plugins.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/extjs/adapter/jquery/ext-jquery-adapter.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/extjs/ext-all.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/js/afrous/afrous-config.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/js/afrous/afrous-core.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/js/afrous/afrous-package.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/js/afrous/afrous-editor.js"></script>',
'    <script type="text/javascript" src="',baseURL,'/js/afrous/afrous-widget.js"></script>',
'  </head>',
'  <body class="af-bookmarklet-boot">',
'    <img id="af-xd-dummy" src="',imgURL,'" style="display:none" />',
'    <div id ="container">',
'      <div id="af-header" class="x-layout-inactive-content">',
'        <div id="af-header-icon"></div>',
'        <div id="af-title"></div>',
'        <div id="af-menubar"></div>',
'      </div>',
'    </div>',
'  </body>',
'</html>'
].join(''));

// doc.close()
// Ext directly writes via document.write()
setTimeout(function() {
  if (typeof w.Ext != 'undefined') doc.close();
  else setTimeout(arguments.callee, 1000);
},1000);

})()
