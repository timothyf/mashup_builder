/*
 * MyCocktail Page Editor
 *
 * David del Pozo González
 * Informática Gesfor
 *
 */

var counter     = 0;
var initialized = false;
function FCKeditor_OnComplete( editorInstance )
{
  le.registerEditor(editorInstance);
  counter++;
  if(counter == 14 && !initialized)
  {
    initialized = true;
    le.initializeWhenEditorsAreLoaded();

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
  }

  editorInstance.Events.AttachEvent( 'OnAfterSetHTML', function(){
    le.setCSSClass(le.cssClass);
  }) ;
}

