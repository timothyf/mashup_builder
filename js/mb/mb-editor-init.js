(function (){

$(document).ready(function() {
	var app = new mb.editor.MashupBuilder();
    Ext.EventManager.addListener(window, 'beforeunload', app.checkDirty, app);
    Ext.EventManager.addListener(window, 'unload', app.checkDirty, app);
    mb.editor.app = app;
});


})()