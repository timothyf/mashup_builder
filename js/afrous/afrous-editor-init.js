(function (){

$(document).ready(function() {
	var app = new afrous.editor.MashupBuilder();
    Ext.EventManager.addListener(window, 'beforeunload', app.checkDirty, app);
    Ext.EventManager.addListener(window, 'unload', app.checkDirty, app);
    afrous.editor.app = app;
});


})()