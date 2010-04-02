$(document).ready(function ()
{
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
  {
    Ext.MessageBox.alert('Browser not compatible',
      "You browser does not support all MyCocktail functionalities. <br><br>"+
      "Supported browsers: "+
      "<ul><li> - Mozilla Firefox</li>"+
      "<li> - Opera</li>"+
      "<li> - Chrome</li>"+
      "<li> - Safari</li></ul>"
    );
  }
});


