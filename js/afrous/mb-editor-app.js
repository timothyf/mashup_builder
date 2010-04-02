/**
 * @class MashupBuilder
 * @extends Ext.util.Observable
 */
var MashupBuilder = function(config) {
  MashupBuilder.superclass.constructor.apply(this, arguments);
  this.initApp();
  this.setupLayout();
  this.startupProcess();
}

Ext.extend(MashupBuilder, Ext.util.Observable, {
  initApp : function() {
    this.appBaseURL = (function() {
      var scripts = window.document.getElementsByTagName('script');
      for (var i=0; i<scripts.length; i++) {
        var m = scripts[i].src.match(/(.*)\/extjs\/ext-all(-debug)?\.js$/);
        if (m) return m[1];
      }
    })();

    // fix blank image URL
    Ext.BLANK_IMAGE_URL = this.appBaseURL + '/extjs/resources/images/aero/s.gif';

    // initialize extjs quicktip function
    Ext.QuickTips.init();
  }
  ,
  setupLayout : function() {
    this.el = Ext.get('container');
    this.layout = new Ext.BorderLayout(document.body, {
      north: {
          split:false,
          initialSize: 5,
          titlebar: false
      },
      west: {
          alwaysShowTabs : false,
          split :true,
          initialSize : 220,
          minSize : 220,
          maxSize : 400,
          titlebar : true,
          autoScroll: false,
          collapsible: true
      },
      center: {
          titlebar : false
      },
      south: {
          split:false,
          initialSize: 22,
          titlebar: false,
          collapsible: false,
          animate: false
      }
    });
    this.layout.beginUpdate();
    this.headerPanel = new Ext.ContentPanel('af-header');
    this.libraryPanel = new LibraryPanel(
      this.el.createChild({ cls : 'af-library' }),
      { title : 'Library', editorApp : this }
    );
    var mainLayout = new Ext.BorderLayout(this.el.createChild(), {
      north : {
        initialSize : 28
      },
      center : {
        tabPosition : 'top',
        alwaysShowTabs : true,
        titilebar : false,
        autoScroll:false,
        closeOnTab: true
      }
    });
    var tbPanel = mainLayout.add('north', new Ext.ContentPanel(this.el.createChild()));
    this.appToolbar = new Ext.Toolbar(tbPanel.el.createChild());
    this.appToolbar.addButton({
      text : 'New',
      cls: 'x-btn-text-icon af-new-btn',
      handler : this.newProcess,
      scope : this
    });
    this.appToolbar.add('-');
    this.openMenu = new Ext.menu.Menu({
      items: [
        { text : 'Open from local',
          handler : this.openProcessFromLocal,
          scope : this }
      ]
    });
    this.appToolbar.add({
      text : 'Open',
      cls: 'x-btn-text-icon af-open-btn',
      menu : this.openMenu });
    this.appToolbar.add('-');

    this.saveMenu = new Ext.menu.Menu({
      items : [
        { text : 'Save to local',
          handler : this.saveProcessToLocal,
          scope : this }
      ]
    });
    this.appToolbar.add({
      text : 'Save',
      cls: 'x-btn-text-icon af-save-btn',
      menu : this.saveMenu
    });
    this.appToolbar.add('-');

    var publishMenu = new Ext.menu.Menu({
      items : [
        { text : 'Publish as JavaScript',
          cls : 'x-menu-item af-js-btn',
          handler : this.publishAsJavaScript,
          scope : this },
        { text : 'Publish as HTML',
          cls : 'x-menu-item af-html-btn',
          handler : this.publishAsHTML,
          scope : this }
      ]
    });

    var publishMenuGadget = new Ext.menu.Menu({
      items : [
        { text : 'Google gadget',
          cls : 'x-menu-item af-google-btn',
          handler : this.publishGoogleGadget,
          scope : this },
        { text : 'Netvibes gadget',
          cls : 'x-menu-item af-netvibes-btn',
          handler : this.publishNetvibesGadget,
          scope : this }
      ]
    });

    publishMenu.add({
      text : 'Publish Gadget',
      cls : 'x-menu-item af-gadget-btn',
      menu: publishMenuGadget
    })

    this.appToolbar.add({
      text : 'Publish',
      cls: 'x-btn-text-icon af-publish-btn',
      menu : publishMenu
    });
    
    this.appToolbar.add('-');
    
    this.appToolbar.add({
      text : 'Test',
      cls: 'x-btn-text-icon af-run-btn',
      handler : this.showTestDialog,
      scope : this
    });  
    this.mainPanel = new Ext.NestedLayoutPanel(mainLayout);
    this.layout.add('north', this.headerPanel);
    this.layout.add('west', this.libraryPanel);
    this.layout.add('center', this.mainPanel);	
    this.layout.on('layout', this.libraryPanel.onLayout, this.libraryPanel);
    this.layout.endUpdate();
  }
  ,
  startupProcess : function() {
    var key = this.getKeyFromURL();
    if (key) {
      this.loadProcessFromServer(key);
    } 
	else {
      this.newProcess();
    }
  }
  ,
  getKeyFromURL : function() {
    if (location.hash) {
      var m = location.hash.substring(1).match(/^[0-9]+/);
      return m && m[0];
    }
  }
  ,
  createNewProcPanel : function(title, parentProcessPanel) {
    var processPanel = new ProcessPanel(
      this.el.createChild({ cls : 'af-process' }), 
      { title : title,
        parentProc : parentProcessPanel && parentProcessPanel.process,
        closable : parentProcessPanel ? true : false,
        editorApp : this }
    );
    return processPanel;
  }
  ,
  activateProcPanel : function(processPanel) {
    if (this.layout.findPanel(processPanel.el.id)) {
      var tabs = this.layout.getRegion('center').getTabs();
      tabs.showTab(processPanel.el.id);
      tabs.activate(processPanel.el.id);
    } else {
      this.mainPanel.layout.add('center', processPanel);
    }
  }
  ,
  loadProcessConfig : function(processConfig) {
    var requires = processConfig.requires || {};
    var scripts = mbuilder.lang.values(requires);
    this.loadLibraries(scripts, function() {
      this.startLoading();
      var namespaces = mbuilder.lang.keys(requires);
      afrous.packages.waitLoadComplete(
        namespaces,
        function() {
          this.rootProcessPanel.loadConfig(processConfig)
          this.dirty = false;
          this.endLoading();
        }.createDelegate(this),
        function() {
          Ext.Msg.alert('Error', 'Error occurred while loading external javascript.');
          this.endLoading();
        }.createDelegate(this)
      );
      this.midOfLoading();
    }.createDelegate(this));
  }
  ,
  startLoading : function() {
    Ext.Msg.show({
      title : 'Please wait...',
      msg : 'Loading...',
      width : 240,
      progress : true,
      closable : false
    });
  }
  ,
  midOfLoading : function() {
    Ext.Msg.updateProgress(.5);
  }
  ,
  endLoading : function() {
    Ext.Msg.updateProgress(1.0);
    mbuilder.lang.delay(Ext.Msg.hide, 100).call(Ext.Msg);
  }
  ,
  loadWADL : function(wadlUrl, callback){
    this.loadLibraries([ mbuilder.config.WADL_CRE_SERVICE_URL+'?wadl='+wadlUrl ], callback);
  }
  ,
  loadLibrary : function(scriptUrl, callback) {
    this.loadLibraries([ scriptUrl ], callback);
  }
  ,
  loadLibraries : function(scripts, callback) {
    var xscripts = jQuery.grep(scripts, function(script) {
      return script.indexOf(afrous.packages.scriptBaseURL) != 0;
    })
    if (xscripts.length>0) {
      Ext.Msg.minWidth = 400;
      mbuilder.lang.delay(Ext.Msg.confirm, 1).call(Ext.Msg, 
        'Script security warning',
        '<div>These libraries are not provided from trusted host/domain. <br/>' + 
        '<ul><li><em>' + jQuery.map(xscripts, function(s) {
           return mbuilder.string.escapeHTML(s);
         }).join('</em></li><li><em>') + '</em></li></ul>' +
        'Are you sure to open this libraries ?</div>',
        function (btn) {
          if (btn=='yes') {
            _loadLibraries();
          }
        }
      );
    } else {
      _loadLibraries();
    }

    function _loadLibraries() {
      mbuilder.lang.forEach(scripts, function(script) { 
        afrous.packages.loadScript(script); 
      });
      if (typeof callback=='function') callback();
    }
  }
  ,
  newProcess : function() {
    this.mainPanel.layout.regions['center'].clearPanels();
    if (this.rootProcessPanel) {
      this.rootProcessPanel.destroy();
      this.rootProcessPanel = null;
    }
    this.rootProcessPanel = new ProcessPanel(
      this.el.createChild({ cls : 'af-process' }), { editorApp : this }
    );
    this.mainPanel.layout.add('center', this.rootProcessPanel);
    this.setProcessKeyID(null);
    this.rootProcessPanel.layout.layout();
    this.dirty = false;
  }
  ,
  setProcessKeyID : function(key) {
    this.processKeyID = key;
    key = key || '';

    // WorkAround in bookmarklet boot
    if (document.body.className.indexOf('af-bookmarklet-boot')>=0) return;

    // because writing location.hash causes non-stop browser loading in safari
    if (navigator.appVersion.indexOf('AppleWebKit') > 0) {
      var form = document.createElement('form');
      form.method = 'GET'
      form.action = '#'+key;
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } else {
      window.location.hash = '#'+key;
    }
  }
  ,
  loadProcessFromServer : function(key) {
    this.newProcess();
    this.setProcessKeyID(key);
    mbuilder.processes.loadProcessConfig(key, this.loadProcessConfig.createDelegate(this));
  }
  ,
  openProcessFromLocal : function() {
    Ext.MessageBox.prompt(
      'Open Process',
      'Please paste process config here.',
      this.handleProcessConfig,
      this,
      true
    );
  }
  ,
  handleProcessConfig : function(btn, txt) {
    if (btn=='ok') {
      var processConfig = mbuilder.lang.parseJSON(txt);
      this.newProcess();
      this.loadProcessConfig(processConfig);
      //this.mainPanel.layout.region.west.el.collapse();
    }
  }
  ,
  saveProcessToLocal : function() {
    var processConfig = this.rootProcessPanel.processDef.toConfig();
    Ext.MessageBox.show({
      title : 'Save Process',
      msg : 'Please copy the text below and save as a file',
      closable : true,
      value : mbuilder.lang.toJSON(processConfig),
      multiline : true
   });
  }
  ,
  /*
   * Builds the JavaScript necessary to run a widget.
   * Used by both the Publisher and the Test actions.
   */
  generateJavaScript: function(onload, widget) {
    var procConfig = this.rootProcessPanel.processDef.toConfig();
    var buf = [];
	buf.push('<link rel="stylesheet" href="' + afrous.packages.scriptBaseURL + '/renderers/style.css" type="text/css" />');
    buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-config.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-core.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-el.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-ajax.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-process.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-action.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-render.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/operators/array-operators.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/operators/basic-operators.js"></script>');
	buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/operators/string-operators.js"></script>');
	
    mbuilder.lang.forEach(mbuilder.lang.values(procConfig.requires), function(scriptURL) {
      if(scriptURL.endsWith("js/afrous/renderers/smile-widgets.js")){
	  	buf.push('<script src="http://api.simile-widgets.org/timeplot/1.1/timeplot-api.js" type="text/javascript"></script>');
      }
      buf.push('<script type="text/javascript" src="'+scriptURL+'"></script>');
    });
    delete procConfig.requires;

    buf.push('<script type="text/javascript">');
    if (onload) {
		buf.push('function f(){');
	}
    buf.push('  var procdef = new mbuilder.ProcessDef('+mbuilder.lang.toJSON(procConfig)+');');
    buf.push('  var proc = new mbuilder.ProcessInstance(procdef);');
    mbuilder.lang.forEach(procConfig.params, function(param, i) {
      if(widget)
        buf.push("  var paramValue"+i+" = widget.getValue('"+param.name+"');");
      else
        buf.push("  var paramValue"+i+" = mbuilder.url.getUrlParameters()['"+param.name+"'];");
      buf.push("  if(!paramValue"+i+")");
      buf.push("    paramValue"+i+" = '"+param['default']+"';");
      buf.push("  proc.setParam('"+param.name+"', paramValue"+i+");");
    })
    buf.push('');
    buf.push('  proc.start(function(result) {');
    buf.push('    result.render(document.getElementById("mydiv"));');
    buf.push('  })');
    if(onload)
      buf.push('}');
    buf.push('</script>');
    return buf.join('\n');
  }
  ,
  generateHTML: function() {
    var buf = [];
    buf.push('<html>');
    buf.push('<head>');
    buf.push('<title>Mashup Builder - HTML Example</title>');
    buf.push(this.generateJavaScript(true));
    buf.push('</head>');
    buf.push('<body onload="f()">');
    buf.push('<div id="mydiv"></div>');
    buf.push('</body>');
    buf.push('</html>');
    return buf.join('\n');
  }
  ,
  publishAsJavaScript : function() {
    if (!this.javaScriptPubDialog) {
      this.javaScriptPubDialog = new ScriptPublishDialog("Publish as JavaScript", 'You can copy the script below and paste it to any web pages you like. Also you can modify it as you want based on this template.');
    }
    this.javaScriptPubDialog.setScriptText(this.generateJavaScript());
    this.javaScriptPubDialog.show();
  }
  ,
  publishAsHTML : function() {
    if (!this.htmlPubDialog) {
      this.htmlPubDialog = new ScriptPublishDialog("Publish as HTML", 'You can copy the script below and paste it to any web pages you like. Also you can modify it as you want based on this template.');
    }
    this.htmlPubDialog.setScriptText(this.generateHTML());
    this.htmlPubDialog.show();
  }
  ,
  publishGoogleGadget : function() {
    if (!this.googleGadgetPubDialog) {
      this.googleGadgetPubDialog = new ScriptPublishDialog("Publish as Google Gadget", 'You can copy the script below and paste it in a XML file and you can use as a Google gadget');
    }
    var buf = [];
    buf.push('<?xml version="1.0" encoding="UTF-8" ?>');
    buf.push('<Module>');
    buf.push('<ModulePrefs title="" /> ');
    buf.push('  <Content type="html">');
    buf.push('    <![CDATA[');
    buf.push(this.generateJavaScript());
    buf.push('<div id="mydiv" />');
    buf.push('  ]]>');
    buf.push('</Content>');
    buf.push('</Module>');
    this.googleGadgetPubDialog.setScriptText(buf.join('\n'));
    this.googleGadgetPubDialog.show();
  }
  ,
  publishNetvibesGadget : function() {
    if (!this.netvibesGadgetPubDialog) {
      this.netvibesGadgetPubDialog = new ScriptPublishDialog("Publish as Netvibes Gadget", 'You can copy the script below and paste it in a XML file and you can use as a Netvibes gadget');
    }
    var procConfig = this.rootProcessPanel.processDef.toConfig();
    var buf = [];
    buf.push('<?xml version="1.0" encoding="utf-8"?>');
    buf.push('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"');
    buf.push('"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">');
    buf.push('<html xmlns="http://www.w3.org/1999/xhtml"');
    buf.push('xmlns:widget="http://www.netvibes.com/ns/"  >');
    buf.push('<head>');
    buf.push('<meta name="author" content="" />');
    buf.push('<meta name="description" content="'+procConfig.description+'" />');
    buf.push('<meta name="apiVersion" content="1.0" />');
    buf.push('<meta name="inline" content="true" />');
    buf.push('<meta name="debugMode" content="false" />');
    buf.push('<title>'+procConfig.name+'</title>');
    buf.push('<link rel="icon" type="image/png" href="http://www.netvibes.com/favicon.ico" />');
     buf.push('<link rel="stylesheet" type="text/css" href="http://www.netvibes.com/themes/uwa/style.css" />');
    buf.push('<script type="text/javascript" src="http://www.netvibes.com/js/UWA/load.js.php?env=Standalone"></script>');
    buf.push(this.generateJavaScript(false,true));
    if(procConfig.params.length > 0) {
      buf.push('<widget:preferences>');
      mbuilder.lang.forEach(procConfig.params, function(param, i) {
        buf.push('  <preference name="'+param.name+'" type="text" label="'+param.name+'" defaultValue="'+param['default']+'" />');
      });
      buf.push('</widget:preferences>');
    }
    buf.push('</head>');
    buf.push('<body>');
    buf.push('<div id="mydiv" />');
    buf.push('</body>');
    buf.push('</html>');
    this.netvibesGadgetPubDialog.setScriptText(buf.join('\n'));
    this.netvibesGadgetPubDialog.show();
  }
  ,
  showTestDialog : function() { 
    var procConfig = this.rootProcessPanel.processDef.toConfig();
    if(procConfig.output == null || procConfig.output == "") {
      Ext.Msg.alert('Warning','The test can not be executed because there is no render in the Ouput Zone');
      return;
    }
    var msgWindow = window.open(mbuilder.config.EMPTY_URL,"","width=600,height=450,scrollbars=yes,centerscreen=yes,menubar=no,location=no");
    var doc = msgWindow.document;
    doc.open("text/html", "replace");
    doc.write(this.generateHTML());
    doc.close();
  }
  ,
  handleChange : function() {
    this.dirty = true;
  }
  ,
  checkDirty : function(e) {
    if (this.dirty) {
      return e.browserEvent.returnValue = 'You have unsaved changes.';  
    }
  } 
});
