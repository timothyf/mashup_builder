/**
 * Afrous Run Process Script
 */

(function() {

var baseURL;
var qstr;
var processID;
var width, height; 

var scripts = document.getElementsByTagName('script');
for (var i=0; i<scripts.length; i++) {
  var s = scripts[i];
  var m = s.src.match(/(.*)\/js\/afrous\/afrous-runproc\.js\?(.*)$/);
  if (m) {
    baseURL = m[1];
    qstr = m[2]; 
    processID = (function() {
      var m = qstr.match(/(^|&)id=([a-zA-Z0-9]{32})(&|$)/);
      if (m) return m[2];
    })();
    width = (function() {
      var m = qstr.match(/(^|&)w=(\d+)(&|$)/);
      if (m) return m[2];
    })();
    height = (function() {
      var m = qstr.match(/(^|&)h=(\d+)(&|$)/);
      if (m) return m[2];
    })();
    s.parentNode.removeChild(s);
    break;
  }
}

if (!baseURL || !processID) return;

width = width || 600;
height = height || 400;

var w = window.open('','_blank','width='+width+',height='+height+',left=20,resizable,scrollbars=yes');
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
'    <title></title>',
'    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />',
'    <link type="text/css" rel="stylesheet" href="'+baseURL+'/extjs2/resources/css/ext-all.css"></link>',
'    <script type="text/javascript" src="'+baseURL+'/js/jquery/jquery.js"></script>',
'    <script type="text/javascript" src="'+baseURL+'/extjs2/adapter/jquery/jquery-plugins.js"></script>',
'    <script type="text/javascript" src="'+baseURL+'/extjs2/adapter/jquery/ext-jquery-adapter.js"></script>',
'    <script type="text/javascript" src="'+baseURL+'/extjs2/ext-all.js"></script>',
'    <script type="text/javascript" src="'+baseURL+'/js/afrous/afrous-core.js"></script>',
'    <script type="text/javascript" src="'+baseURL+'/js/afrous/afrous-package.js"></script>',
'    <script type="text/javascript" src="'+baseURL+'/js/afrous/afrous-embed.js"></script>',
'    <script type="text/javascript">',
'(function() { ',
' if (typeof Ext != "undefined") {',
'   Ext.onReady(function() {',
'     afrous.embed.renderProcessOutput("'+processID+'");',
'   });',
' } else {',
'   setTimeout(arguments.callee, 1000);',
' }',
'})()',
'    </script>',
'  </head>',
'  <body>',
'  </body>',
'</html>'
].join('\n'));

// doc.close()
// Ext directly writes via document.write()
setTimeout(function() {
  if (typeof w.Ext != 'undefined') doc.close();
  else setTimeout(arguments.callee, 1000);
},1000);


})();
