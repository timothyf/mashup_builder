(function (){

  Ext.onReady(function() {
    var app = new afrous.editor.EditorApp();
    Ext.EventManager.addListener(window, 'beforeunload', app.checkDirty, app);
    Ext.EventManager.addListener(window, 'unload', app.checkDirty, app);
    afrous.editor.app = app;
  });

})()