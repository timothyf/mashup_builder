/*  
  Afrous JavaScript - Editor
  (c) 2007 Shinichi Tomita
*/

var afrous;
if (!afrous) afrous = {};

(function() {

afrous.editor = {}

afrous.editor.formElement = {}
afrous.editor.formElement.TEXT_AREA = "TEXT_AREA";
afrous.editor.formElement.CHECK_BOX = "CHECK_BOX";

/**
 * @class EditorApp
 * @extends Ext.util.Observable
 */
var EditorApp = function(config) {
  EditorApp.superclass.constructor.apply(this, arguments);

  this.initApp();
  this.setupLayout();

  this.startupProcess();
}

Ext.extend(EditorApp, Ext.util.Observable, {

  initApp : function() {
    this.appBaseURL = (function() {
      var scripts = window.document.getElementsByTagName('script');
      for (var i=0; i<scripts.length; i++) {
        var m = scripts[i].src.match(/(.*)\/extjs\/ext-all(-debug)?\.js$/);
        if (m) return m[1];
      }
    })();

    // create About button
    new Ext.Button(Ext.get('af-menubar').createChild(), { 
      text : 'About',
      handler : this.showAboutDialog,
      scope : this
    });

    // create Login/Logout URL
//    new Ext.Button(Ext.get('af-menubar').createChild(), { 
//      text : 'Login/Logout',
//      handler : this.showLoginDialog,
//      scope : this
//    });

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
          initialSize: 81,
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
    this.appToolbar.addButton({
      text : 'Discard',
      cls: 'x-btn-text-icon af-discard-btn',
      disabled : true
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
    } else {
      this.newProcess();
    }
  }
  ,

  getKeyFromURL : function() {
    if (location.hash) {
//      var m = location.hash.substring(1).match(/^[a-zA-Z0-9]{32}/);
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

    var scripts = afrous.lang.values(requires);
    this.loadLibraries(scripts, function() {
      this.startLoading();
      var namespaces = afrous.lang.keys(requires);
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
    afrous.lang.delay(Ext.Msg.hide, 100).call(Ext.Msg);
  }
  ,

  loadWADL : function(wadlUrl, callback){
    this.loadLibraries([ afrous.config.WADL_CRE_SERVICE_URL+'?wadl='+wadlUrl ], callback);
  }
  ,

  loadLibrary : function(scriptUrl, callback) {
    this.loadLibraries([ scriptUrl ], callback);
  }
  ,

  loadLibraries : function(scripts, callback) {
    var xscripts = afrous.lang.filter(scripts, function(script) {
      return script.indexOf(afrous.packages.scriptBaseURL) != 0;
    })
    if (xscripts.length>0) {
      Ext.Msg.minWidth = 400;
      afrous.lang.delay(Ext.Msg.confirm, 1).call(Ext.Msg, 
        'Script security warning',
        '<div>These libraries are not provided from trusted host/domain. <br/>' + 
        '<ul><li><em>' + afrous.lang.map(xscripts, function(s) {
           return afrous.string.escapeHTML(s);
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
      afrous.lang.forEach(scripts, function(script) { 
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
    afrous.processes.loadProcessConfig(key, this.loadProcessConfig.createDelegate(this));
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
      var processConfig = afrous.lang.parseJSON(txt);
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
      value : afrous.lang.toJSON(processConfig),
      multiline : true
   });
  }
  ,

  generateJavaScript: function(onload, widget) {
    var procConfig = this.rootProcessPanel.processDef.toConfig();

    var buf = [];
    buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-config.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-core.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.packages.scriptBaseURL+'/afrous-package.js"></script>');
    afrous.lang.forEach(afrous.lang.values(procConfig.requires), function(scriptURL) {
      if(scriptURL.endsWith("js/afrous/renderers/smile-widgets.js"))
      {
        buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/smile-widgets/timeline/timeline_js/timeline-config.js"></script>');
        buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/smile-widgets/timeline/timeline_js/timeline-api.js"></script>');
      }
      buf.push('<script type="text/javascript" src="'+scriptURL+'"></script>');
    });
    delete procConfig.requires;

    buf.push('<script type="text/javascript">');
    if(onload)
      buf.push('function f(){');
    buf.push('  var procdef = new afrous.ProcessDef('+afrous.lang.toJSON(procConfig)+');');
    buf.push('  var proc = new afrous.ProcessInstance(procdef);');
    afrous.lang.forEach(procConfig.params, function(param, i) {
      if(widget)
        buf.push("  var paramValue"+i+" = widget.getValue('"+param.name+"');");
      else
        buf.push("  var paramValue"+i+" = afrous.url.getUrlParameters()['"+param.name+"'];");
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
    buf.push('<title>Romulus Mashup Builder - HTML Example</title>');
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
  },
  
  publishAsHTML : function() {
    if (!this.htmlPubDialog) {
      this.htmlPubDialog = new ScriptPublishDialog("Publish as HTML", 'You can copy the script below and paste it to any web pages you like. Also you can modify it as you want based on this template.');
    }
    
    this.htmlPubDialog.setScriptText(this.generateHTML());
    this.htmlPubDialog.show();
  },

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
    if(procConfig.params.length > 0)
    {
      buf.push('<widget:preferences>');
      afrous.lang.forEach(procConfig.params, function(param, i) {
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
    if(procConfig.output == null || procConfig.output == "")
    {
      Ext.Msg.alert('Warning','The test can not be executed because there is no render in the Ouput Zone');
      return;
    }
    
    var msgWindow = window.open(afrous.config.EMPTY_URL,"","width=600,height=450,scrollbars=yes,centerscreen=yes,menubar=no,location=no");
    var doc = msgWindow.document;
    
    doc.open("text/html", "replace");
    doc.write(this.generateHTML());
    doc.close();
  }
  ,

//  showLoginDialog : function() {
//    if (!this.loginDialog) {
//      this.loginDialog = new LoginDialog();
//    }
//    this.loginDialog.show();
//  }
//  ,

  showAboutDialog : function() {
    if (!this.aboutDialog) {
      this.aboutDialog = new AboutDialog();
    }
    this.aboutDialog.show();
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


/**
 * @class AbstractCallbackDialog
 * @extends Ext.BasicDialog
 */

var AbstractCallbackDialog = function(config) {
  var el = Ext.get(document.body).createChild({ cls : 'af-dlg' });
  AbstractCallbackDialog.superclass.constructor.call(this, el, config);
}

Ext.extend(AbstractCallbackDialog, Ext.BasicDialog, {
  setCallback : function(callback, scope) {
    this.callback = callback;
    this.scope = scope;
  } 
});

/**
 * @class PublicLibraryDialog
 * @extends AbstractCallbackDialog
 */
var PublicLibraryDialog = function() {

  PublicLibraryDialog.superclass.constructor.call(this, { 
    title : 'Search And Open Public Library',
    modal : true,
    width : 600,
    height : 460,
    resizable : false,
    shadow : true
  });
  this.addKeyListener(27, this.hide, this);
  this.openBtn = this.addButton('Open', this.handleOpen, this);
  this.closeBtn = this.addButton('Close', this.hide, this);

  this.setup();

}

Ext.extend(PublicLibraryDialog, AbstractCallbackDialog, {

  setup : function() {

    this.formEl = this.body.createChild({ cls : 'af-dlg-form' });

    this.form = new Ext.form.Form({
      labelWidth : 80
    });
    var textField = new Ext.form.TextField({
      fieldLabel : 'Keyword',
      width : 250
    });
    var langSelect = new SelectBox({
      fieldLabel : 'Language',
      name : 'language',
      options : ['(all)','English','Japanese'],
      width : 150
    });
    var categorySelect = new SelectBox({
      fieldLabel : 'Category',
      name : 'category',
      options : ['Service','Renderer'],
      width : 150
    });

    this.form.container({}, textField);
    this.form.column({ width : 250 }, langSelect);
    this.form.column({ width : 250 }, categorySelect);
    this.form.addButton('Search', function(event) {
      this.searchPublicLibraries(
        textField.getValue(), langSelect.getValue(), categorySelect.getValue());
    }, this);
    this.form.render(this.formEl);

    this.ds = new Ext.data.Store({
      proxy: new Ext.data.ScriptTagProxy({
         url: afrous.config.LIBRARY_SEARCH_URL
      }),

      reader: new Ext.data.JsonReader({
         root: 'libraries',
         /*totalProperty: 'totalCount',*/
         id: 'id',
         fields : [ 'name', 'description', 'author', 'scriptUrl', 'iconUrl', 'language', 'category' ]
      }),

      remoteSort: false
    });

    var cm = new Ext.grid.ColumnModel([
      {
        header: "",
        dataIndex: 'iconUrl',
        width : 30,
        renderer : function(value, p, record){
          return String.format('<img width="16" height="16" src="{0}">', value);
        }
      },
      {
        header: "Name",
        dataIndex: 'name',
        width : 150,
        css: 'white-space:normal;'
      },
      {
         header: "Description",
         dataIndex: 'description',
         width : 270
      },
      {
         header: "Author",
         dataIndex: 'author',
         renderer : function(value, p, record) {
           return String.format('<b>{0}</b>({1})', value.nickname || '', value.openID);
         },
         width : 100
      }
    ]);

    this.gridEl = this.body.createChild({ cls : 'af-dlg-grid' });
    // create the editor grid
    this.grid = new Ext.grid.Grid(this.gridEl, {
      ds: this.ds,
      cm: cm,
      selModel: new Ext.grid.RowSelectionModel({singleSelect:true}),
      enableColLock : false,
      loadMask : true
    });

    // render it
    this.grid.render();

    var gridFoot = this.grid.getView().getFooterPanel(true);

    // add a paging toolbar to the grid's footer
    this.paging = new Ext.PagingToolbar(gridFoot, this.ds, {
      pageSize: 10,
      displayInfo: true,
      displayMsg: 'Displaying packages {0} - {1} of {2}',
      emptyMsg: "No packages to display"
    });

    this.grid.on('cellclick', this.handleGridUpdate, this);
    this.ds.on('load', this.handleGridUpdate, this);

  }
  ,

  show : function() {
    this.form.reset();
    this.ds.removeAll();
    this.paging.updateInfo();
    PublicLibraryDialog.superclass.show.call(this);
  }
  ,

  handleGridUpdate : function() {
    if (this.grid.getSelections().length>0) {
      this.openBtn.enable();
    } else {
      this.openBtn.disable();
    }
  }
  ,

  searchPublicLibraries : function(keyword, language, category) {
    this.openBtn.disable();
    var params = { start : 0, limit : 10 }
    if (keyword) params.keyword = keyword;
    if (language && language!='(all)') params.language = language;
    if (category && category!='(all)') params.category = category;
    this.ds.load({ params : params });
  }
  ,

  handleOpen : function() {
    var selections = this.grid.getSelections();
    if (selections.length==1) {
      var scriptUrl = selections[0].data.scriptUrl;
      this.callback.call(this.scope, scriptUrl);
      this.hide();
    }
  }

});





/**
 * @class PrivateLibraryDialog
 * @extends AbstractCallbackDialog
 */
var PrivateLibraryDialog = function() {

  PrivateLibraryDialog.superclass.constructor.call(this, { 
    title : 'Input Private Library Script Location',
    modal : true,
    width : 530,
    height : 120,
    resizable : false,
    shadow : true
  });


  this.addKeyListener(27, this.hide, this);
  this.openBtn = this.addButton('Open', this.handleOpen, this);
  this.closeBtn = this.addButton('Close', this.hide, this);

  this.setup();
}

Ext.extend(PrivateLibraryDialog, AbstractCallbackDialog, {

  setup : function() {

    this.formEl = this.body.createChild({ cls : 'af-dlg-form' });

    this.form = new Ext.form.Form({ labelWidth : 150 });
    this.scriptUrlField = new Ext.form.TextField({
      fieldLabel : 'Library JavaScript URL',
      /*regex : /^https?:\/\/[\w-.]+\/\S*$/,
      regexText : 'Please input valid URL',*/
      width : 330
    });
    this.form.add(this.scriptUrlField);
    this.form.render(this.formEl);
    this.scriptUrlField.on('change', this.handleUpdate, this);
  }
  ,

  show : function() {
    this.scriptUrlField.setValue('');
    PrivateLibraryDialog.superclass.show.call(this);
  }
  ,

  handleUpdate : function() {
    if (this.scriptUrlField.getValue() && this.scriptUrlField.validate()) {
      this.openBtn.enable();
    } else {
      this.openBtn.disable();
    }
  }
  ,

  handleOpen : function() {
    var scriptUrl = this.scriptUrlField.getValue();
    this.callback.call(this.scope, scriptUrl);
    this.hide();
  }

});

/**
 * @class WADLLoaderDialog
 * @extends AbstractCallbackDialog
 */
var WADLLoaderDialog = function() {

  WADLLoaderDialog.superclass.constructor.call(this, {
    title : 'Import a Service from WADL',
    modal : true,
    width : 530,
    height : 120,
    resizable : false,
    shadow : true
  });


  this.addKeyListener(27, this.hide, this);
  this.openBtn = this.addButton('Open', this.handleOpen, this);
  this.closeBtn = this.addButton('Close', this.hide, this);

  this.setup();
}

Ext.extend(WADLLoaderDialog, AbstractCallbackDialog, {

  setup : function() {

    this.formEl = this.body.createChild({ cls : 'af-dlg-form' });

    this.form = new Ext.form.Form({ labelWidth : 150 });
    this.scriptUrlField = new Ext.form.TextField({
      fieldLabel : 'WADL URL',
      /*regex : /^https?:\/\/[\w-.]+\/\S*$/,
      regexText : 'Please input valid URL',*/
      width : 330
    });
    this.form.add(this.scriptUrlField);
    this.form.render(this.formEl);
    this.scriptUrlField.on('change', this.handleUpdate, this);
  }
  ,

  show : function() {
    this.scriptUrlField.setValue('');
    WADLLoaderDialog.superclass.show.call(this);
  }
  ,

  handleUpdate : function() {
    if (this.scriptUrlField.getValue() && this.scriptUrlField.validate()) {
      this.openBtn.enable();
    } else {
      this.openBtn.disable();
    }
  }
  ,

  handleOpen : function() {
    var scriptUrl = this.scriptUrlField.getValue();
    this.callback.call(this.scope, scriptUrl);
    this.hide();
  }

});

/**
 * @class ParamInputDialog
 * @extends AbstractCallbackDialog
 */
var ParamInputDialog = function(config) {

  ParamInputDialog.superclass.constructor.call(this, { 
    title : 'Input Parameter Definition',
    modal : true,
    width : 360,
    height : 200,
    shadow : true,
    proxyDrag : true,
    resizable :false 
  });

  this.formEl = this.body.createChild({ cls : 'af-dlg-form' });
  this.form = new Ext.form.Form({ labelWidth : 100 });
  this.form.add(
    new Ext.form.TextField({
      fieldLabel : 'Parameter Name',
      name : 'name',
      width : 200 
    }),
    new SelectBox({
      fieldLabel : 'Data Type',
      name : 'type',
      options : ['string','integer','float','boolean','object'], 
      width : 200 
    }),
    new Ext.form.Checkbox({
      fieldLabel : 'Is Array?',
      name : 'isArray'
    }),
    new Ext.form.TextField({
      fieldLabel : 'Default Value',
      name : 'default',
      width : 200 
    })
  );

  this.form.render(this.formEl);

  this.addKeyListener(27, this.hide, this);
  this.addButton('Save', this.handleSave, this);
  this.addButton('Close', this.hide, this);

}

Ext.extend(ParamInputDialog, AbstractCallbackDialog, {

  show : function() {
    this.form.reset();
    ParamInputDialog.superclass.show.call(this);
  }
  ,

  handleSave : function() {
    this.callback.call(this.scope, this.form.getValues());
  }

});


/**
 * @class LoginDialog
 * @extends AbstractCallbackDialog
 */
//var LoginDialog = function() {
//
//  LoginDialog.superclass.constructor.call(this, { 
//    title : 'Login Information',
//    modal : true,
//    width : 530,
//    height : 480,
//    resizable : false,
//    shadow : true
//  });
//
//  this.addKeyListener(27, this.hide, this);
//
//  this.setup();
//}
//
//Ext.extend(LoginDialog, AbstractCallbackDialog, {
//
//  setup : function() {
//    this.iframeEl = this.body.createChild({
//      tag : 'iframe', 
//      src : 'about:blank', 
//      frameborder : '0',
//      name : 'loginDialog',
//      width : '100%',
//      height : '100%'
//    });
//  }
//  ,
//
//  show : function() {
//    this.iframeEl.dom.src = afrous.config.LOGIN_URL;
//    LoginDialog.superclass.show.call(this);
//  }
//
//});


/**
 * @class AboutDialog
 * @extends AbstractCallbackDialog
 */
var AboutDialog = function() {

  AboutDialog.superclass.constructor.call(this, { 
    title : 'About',
    modal : true,
    width : 530,
    height : 443,
    resizable : false,
    shadow : true
  });

  this.addKeyListener(27, this.hide, this);

  this.setup();
}

Ext.extend(AboutDialog, AbstractCallbackDialog, {

  setup : function() {
    this.iframeEl = this.body.createChild({
      tag : 'iframe', 
      src : 'about:blank', 
      frameborder : '0',
      name : 'aboutDialog',
      width : '100%',
      height : '100%'
    });
  }
  ,

  show : function() {
    this.iframeEl.dom.src = afrous.config.ABOUT_URL;
    AboutDialog.superclass.show.call(this);
  }

});


/**
 * @class ScriptPublishDialog
 * @extends AbstractCallbackDialog
 */
var ScriptPublishDialog = function(title, label) {

  ScriptPublishDialog.superclass.constructor.call(this, { 
    title : title || '',
    modal : true,
    width : 530,
    height : 400,
    resizable : false,
    shadow : true
  });

  this.addKeyListener(27, this.hide, this);

  this.setup(label);
}

Ext.extend(ScriptPublishDialog, AbstractCallbackDialog, {

  setup : function(label) {

    this.descriptionEl = this.body.createChild({ cls : 'af-dlg-desc'  });
    this.descriptionEl.update(label);
    this.formEl = this.body.createChild({ cls : 'af-dlg-form' });

    this.scriptArea = new Ext.form.TextArea({
      width : 500,
      height : 300,
      grow : false,
      selectOnFocus : true
    });
    this.scriptArea.render(this.formEl);

  }
  ,

  setScriptText : function(text) {
    this.scriptArea.setValue(text)
  }

});





/**
 * @class ObjectTreePanel
 * @extends Ext.tree.TreePanel
 */
var ObjectTreePanel = function(el, config) {
  config.draggable = typeof (config.draggable) == 'undefined' ? true : config.draggable;

  ObjectTreePanel.superclass.constructor.call(this, el, {
    ddGroup : 'BindingObjectDD',
    animate : true,
    enableDrag : config.draggable,
    containerScroll : true
  }); 

  this.name = config.name;
  this.setObject(config.obj || {});
  
}

Ext.extend(ObjectTreePanel, Ext.tree.TreePanel, {

  beforeLoad : function() {
    this.getRootNode().getUI().beforeLoad();
  }
  ,

  setObject : function(obj) {
    this.el.update('');
    this.targetObj = obj;
    var root = new ObjectTreeNode(this.name, this.name, this.targetObj);
    this.setRootNode(root);
    this.render();
    root.expand();
  }

});


/**
 * @class ObjectTreeNode
 * @extends Ext.tree.TreeNode
 */
var ObjectTreeNode = function(path, name, obj, cfg) {
  cfg = afrous.lang.extend({text : name,
                            uiProvider : ObjectTreeNodeUI}, cfg || {})

  ObjectTreeNode.superclass.constructor.call(this,cfg);

  this.name = name;
  this.path = path;

  this.setValue(obj);
}

Ext.extend(ObjectTreeNode, Ext.tree.TreeNode, {

  setValue : function(value) {

    afrous.lang.forEach(this.childNodes.slice(), function(c) { this.removeChild(c) }, this);

    this.value = value;

    if (afrous.lang.isDOMNode(value)) {
      var div = afrous.dom.createElement({ className : 'af-render-root' });
      div.appendChild(value);
      this.setText(this.name + afrous.dom.toHTML(div));
    } else if (value instanceof afrous.Renderer) {
      this.setText(this.name);
    } else if (afrous.lang.isArray(value)) {
      afrous.lang.forEach(value, function(val, i) {
        var n = null;
        if(val.myCocktailName)
          n = val.myCocktailName;
        else if(val.name)
          n = val.name;
        else if(val.title)
          n = val.title;
        else
          n = '['+i+']';
        var p = this.path + '['+i+']';
        var cfg = {}
        if(val.myCocktailIcon)
          cfg.icon = val.myCocktailIcon;
        this.appendChild(new ObjectTreeNode(p, n, val, cfg));
      }, this);

    } else if (afrous.lang.isObject(value)) {
      afrous.lang.forEach(afrous.lang.keys(value), function(key) {
        if (key != 'myCocktailIcon' && key != 'myCocktailName'){
          if (afrous.lang.isSerializable(value[key])) {
            var p = this.path + (/^\w[\w\d]*$/.test(key) ? '.'+key : '["'+key+'"]');
            this.appendChild(new ObjectTreeNode(p, key, value[key]));
          }
        }
      }, this);
    } else if (value !== null && typeof value != 'undefined') {
      var str = afrous.string.escapeHTML(value.toString());
      str = str.length>100 ? str.substring(0, 100) + '...' : str;
      this.setText(this.name + ' : ' + str);
    } else {
      this.setText(this.name);
    }
  }

});

/**
 * @class ObjectTreeNodeUI
 * @extends Ext.tree.TreeNodeUI
 */

var ObjectTreeNodeUI = function() {
  ObjectTreeNodeUI.superclass.constructor.apply(this, arguments);
}

Ext.extend(ObjectTreeNodeUI, Ext.tree.TreeNodeUI, {

  render : function() {
    ObjectTreeNodeUI.superclass.render.apply(this, arguments);

    if (this.node.value instanceof afrous.Renderer) {
      var renderer = this.node.value;
      var el = afrous.dom.createElement({ className : 'af-rendered' });
      this.textNode.appendChild(el);
      renderer.render(el);
    }
  }

});

/**
 * @class LibraryPanel
 * @extends Ext.NestedLayoutPanel
 */
var LibraryPanel = function(el, config) {

  this.el = el;
  this.editorApp = config.editorApp;

  var layout = new Ext.BorderLayout(el, {
    north : {
      initialSize : 28
    },
    center: {
      titlebar: false,
      autoScroll : true
    }
  });

  this.toolbarPanel = new Ext.ContentPanel(el.createChild());
  this.toolbar = new Ext.Toolbar(this.toolbarPanel.el);
  var loadMenu = new Ext.menu.Menu({
    items: [
      /*{ text : 'Open Public',
        handler : this.openPublicLibraryDialog,
        scope : this },*/
      { text : 'Import Service from WADL',
        handler : this.openWADLLoaderDialog,
        scope : this },
      { text : 'Open Private',
        handler : this.openPrivateLibraryDialog,
        scope : this }
    ]
  });
  this.toolbar.addButton({
    text : 'Load Library',
    cls: 'x-btn-text-icon af-load-btn',
    menu : loadMenu
  }); 

  this.oprPackagePanel = new Ext.ContentPanel(el.createChild(), { title : 'Operation' });
  this.oprPackageTree = new Ext.tree.TreePanel(this.oprPackagePanel.el.createChild(), {
    ddGroup : 'UnitActionDD',
    animate : true,
    enableDrag : true,
    containerScroll : true
  });
  this.svcPackagePanel = new Ext.ContentPanel(el.createChild(), { title : 'Service' });
  this.svcPackageTree = new Ext.tree.TreePanel(this.svcPackagePanel.el.createChild(), {
    ddGroup : 'UnitActionDD',
    animate : true,
    enableDrag : true,
    containerScroll : true
  });
  this.rdrPackagePanel = new Ext.ContentPanel(el.createChild(), { title : 'Renderer' });
  this.rdrPackageTree = new Ext.tree.TreePanel(this.rdrPackagePanel.el.createChild(), {
    ddGroup : 'UnitActionDD',
    animate : true,
    enableDrag : true,
    containerScroll : true
  });

  layout.add('north', this.toolbarPanel);
  layout.add('center', this.oprPackagePanel);
  layout.add('center', this.svcPackagePanel);
  layout.add('center', this.rdrPackagePanel);
  
  LibraryPanel.superclass.constructor.call(this, layout, { title : config.title });

  this.layout.getRegion('center').tabs.activate(this.oprPackagePanel.el.dom.id);

  var stdRoot = new Ext.tree.TreeNode({
    text : 'Standard Packages',
    draggable : false
  });
  this.oprPackageTree.setRootNode(stdRoot);
  this.oprPackageTree.render();
  stdRoot.expand();
  
  var svcRoot = new Ext.tree.TreeNode({
    text : 'Service Packages',
    draggable : false
  });
  this.svcPackageTree.setRootNode(svcRoot);
  this.svcPackageTree.render();
  svcRoot.expand();
  
  var rdrRoot = new Ext.tree.TreeNode({
    text : 'Renderer Packages',
    draggable : false
  });
  this.rdrPackageTree.setRootNode(rdrRoot);
  this.rdrPackageTree.render();
  rdrRoot.expand();
  
  var packages = afrous.packages.listPackages();
  afrous.lang.forEach(packages, this.appendPackage, this);

  this.loadExtraPackages();

  this.layout.getRegion('center').tabs.getTab(this.svcPackagePanel.el.id).activate();

  /*this.publicLibDialog = new PublicLibraryDialog();
  this.publicLibDialog.setCallback(this.editorApp.loadLibrary, this.editorApp);*/

  this.wadlLoaderDialog = new WADLLoaderDialog();
  this.wadlLoaderDialog.setCallback(this.editorApp.loadWADL, this.editorApp);

  this.privateLibDialog = new PrivateLibraryDialog();
  this.privateLibDialog.setCallback(this.editorApp.loadLibrary, this.editorApp);

};

Ext.extend(LibraryPanel, Ext.NestedLayoutPanel, {

  loadExtraPackages : function() {
    afrous.packages.addListener('register', this.appendPackage, this);
    afrous.lang.loadScript(afrous.packages.scriptBaseURL+'/afrous-stdlib-index.js');
  }
  , 

  createPackageNode : function(pack) {
    var config = {
      text : pack.label || pack.namespace,
      draggable : false
    };
    if (pack.icon) config.icon = pack.icon;
    else config.iconCls = 'af-library-pack';

    var packageNode = new Ext.tree.TreeNode(config);

    afrous.lang.forEach(pack.listUnitActions(), function(uaction) {
      var uanode = new Ext.tree.TreeNode({
        text : uaction.label,
        iconCls : uaction.iconCls ? uaction.iconCls : 'af-library-uaction',
        qtip : uaction.description
      });
      uanode.uaction = uaction;
      packageNode.appendChild(uanode);
    }, this);
   
    return packageNode;
  }
  ,

  appendPackage : function(pack) {
    if (pack.namespace.indexOf('Services.')==0) {
      if (/^Services\.[a-zA-Z0-9\-\_]+\./.test(pack.namespace)) {
        this.appendExtraServicePackage(pack);
      } else {
        this.appendServicePackage(pack);
      }
    } else if (pack.namespace.indexOf('Renderer.')==0) {
      this.appendRendererPackage(pack);
    } else {
      this.appendOperationPackage(pack);
    }
  }
  ,

  appendOperationPackage : function(pack) {
    this.appendPackageToTree(this.oprPackageTree,pack);
  }
  ,

  appendServicePackage : function(pack) {
    this.appendPackageToTree(this.svcPackageTree,pack);
  }
  ,

  appendExtraServicePackage : function(pack) {
    var spl  = pack.namespace.split(".");
    var name = spl[1];
    var tree = this.createTree(name);
    this.appendPackageToTree(tree,pack);
  }
  ,

  appendRendererPackage : function(pack) {
    this.appendPackageToTree(this.rdrPackageTree,pack);
  }
  ,

  appendPackageToTree : function(tree,pack){
    var packageNode = this.createPackageNode(pack);
    tree.getRootNode().appendChild(packageNode);
    //packageNode.expand();
  }
  ,

  createTree : function (name) {
    if(this.serviceTrees==null)
      this.serviceTrees = [];

    if(!this.serviceTrees[name])
    {
      var servicesPackageTree = new Ext.tree.TreePanel(this.svcPackagePanel.el.createChild(), {
        ddGroup : 'UnitActionDD',
        animate : true,
        enableDrag : true,
        containerScroll : true
      });
      var servicesRoot = new Ext.tree.TreeNode({
        text : name,
        draggable : false
      });
      servicesPackageTree.setRootNode(servicesRoot);
      servicesPackageTree.render();
      servicesRoot.expand();
      this.serviceTrees[name] = servicesPackageTree;
    }
    return this.serviceTrees[name];
  }
  ,

  openPublicLibraryDialog : function() {
    this.publicLibDialog.show();
  }
  ,

  openWADLLoaderDialog : function() {
    this.wadlLoaderDialog.show();
  }
  ,

  openPrivateLibraryDialog : function() {
    this.privateLibDialog.show();
  }
  ,

  onLayout : function(event) {
    this.el.setSize(event.regions.west.bodyEl.getSize()); 
    this.layout.layout();
  }

});



/**
 * @class ProcessPanel
 * @extends Ext.NestedLayoutPanel
 */
var ProcessPanel = function(el, config) {

  this.processDef = new afrous.ProcessDef();
  this.process = new afrous.ProcessInstance(this.processDef, config.parentProc);

  this.processDef.addListener('change', config.editorApp.handleChange, config.editorApp);

  el = Ext.get(el);

  var layout = new Ext.BorderLayout(el, {
    west: {
        hideTabs : true,
        split:true,
        initialSize: 200,
        titlebar: true,
        autoScroll:false,
        collapsible: true
    },
    east: {
        hideTabs : true,
        split:true,
        initialSize: 200,
        titlebar: true,
        autoScroll:false,
        collapsible: true
    },
    center: {
        hideTabs : true,
        titlebar: true,
        minSize : 400,
        autoScroll:false,
        closeOnTab: true
    }

  });

  this.paramsPanel = new ParamsPanel(
    el.createChild({ cls : 'af-params' }),
    { title : 'Parameters', processPanel : this }
  );
  this.actionsPanel = new ActionsPanel(
    el.createChild({ cls : 'af-actions' }),
    { title : 'Actions', processPanel : this }
  );
  this.outputPanel = new OutputPanel(
    el.createChild({ cls : 'af-output' }), 
    { title : 'Output', processPanel : this }
  );

  layout.add('west', this.paramsPanel);
  layout.add('center', this.actionsPanel);
  layout.add('east', this.outputPanel);

  layout.on('layout', this.paramsPanel.onLayout, this.paramsPanel);
  layout.on('layout', this.actionsPanel.onLayout, this.actionsPanel);
  layout.on('layout', this.outputPanel.onLayout, this.outputPanel);

  ProcessPanel.superclass.constructor.call(this, layout, {
    title : config.title || '(new process)',
    closable : config.closable ? true : false,
    preserve : true
  });

  this.editorApp = config.editorApp;
}

Ext.extend(ProcessPanel, Ext.NestedLayoutPanel, {

  loadConfig : function(processConfig) {
    this.process.destroy();
    this.processDef.destroy();

    this.setProcessName(processConfig.name);
    this.processDef.setDescription(processConfig.description);

    this.process = new afrous.ProcessInstance(this.processDef);

    if (processConfig.params) this.paramsPanel.loadConfig(processConfig.params);
    if (processConfig.output) this.outputPanel.loadConfig(processConfig.output);
    if (processConfig.actions) this.actionsPanel.loadConfig(processConfig.actions);
  }
  ,

  setProcessName : function(name) {
    window.document.title = window.document.title.replace(/ :.*$/, '') + ' : '+name;
    this.processDef.setName(name);
    if (name && name.length > 0) this.setTitle(afrous.string.escapeHTML(name));
  }
  ,

  destroy : function() {
    this.process.destroy();
    this.processDef.destroy();

    this.paramsPanel.destroy();
    this.outputPanel.destroy();
    this.actionsPanel.destroy();
    ProcessPanel.superclass.destroy.apply(this, arguments);
  }

});



/**
 * @class ParamsPanel
 * @extends Ext.NestedLayoutPanel
 */
var ParamsPanel = function(el, config) {

  var layout = new Ext.BorderLayout(el, {
    north : {
      initialSize : 28
    },
    center: {
      titlebar: false,
      autoScroll : true
    }
  });

  this.toolbarPanel = new Ext.ContentPanel(el.createChild());
  this.toolbar = new Ext.Toolbar(this.toolbarPanel.el.createChild());
  this.toolbar.addButton({
    text: 'Add New Param',
    cls: 'x-btn-text-icon af-add-btn',
    handler: this.handleNewParam,
    scope : this
  });

  this.contentPanel = new Ext.ContentPanel(el.createChild());

  layout.add('north', this.toolbarPanel);
  layout.add('center', this.contentPanel);

  ParamsPanel.superclass.constructor.call(this, layout, config);

  this.paramsTree = new Ext.tree.TreePanel(this.contentPanel.el.createChild(), {
    ddGroup : 'BindingObjectDD',
    animate : true,
    enableDrag : true,
    containerScroll : true
  });

  var root = new Ext.tree.TreeNode({
    text : 'Params',
    draggable : false,
    leaf : false
  });
  this.paramsTree.setRootNode(root);
  this.paramsTree.render();
  root.expand();

  this.rootCtxMenu = new Ext.menu.Menu({
    items : [{
      handler : this.handleNewParam.createDelegate(this),
      text : 'Add New Param'
    }]
  });
  this.paramCtxMenu = new Ext.menu.Menu({
    items : [
      {
        handler : this.handleSetParam.createDelegate(this),
        text : 'Set Param Value'
      },
      {
        handler : this.handleDestroyParam.createDelegate(this),
        text : 'Delete Param'
      }
    ]
  });
  this.paramsTree.on('contextmenu', this.prepareMenu, this);

  this.dialog = new ParamInputDialog(this);
  this.dialog.setCallback(this.handleParamDef, this);

}

Ext.extend(ParamsPanel, Ext.NestedLayoutPanel, {

  loadConfig : function(paramCfgs) {
    afrous.lang.forEach(paramCfgs, function(conf) {
      var val = conf['default'] && afrous.lang.cast(conf.type, conf['default']);
      this.createNewParam(conf.name, conf.type, val)
    }, this);
  }
  ,

  prepareMenu : function(node, event) {
    node.select();
    if (node==this.paramsTree.getRootNode()) {
      this.rootCtxMenu.showAt(event.getXY());
    } else if (node instanceof ParamsTreeNode && !node.immutable) {
      this.paramCtxMenu.showAt(event.getXY());
    }
  }
  ,

  handleNewParam : function() {
    this.dialog.show();
  }
  ,

  handleParamDef: function(conf) {
    if (conf.name && conf.type) {
      var type = conf.type;
      if (conf.isArray=='on') type += '[]'; 
      var val = conf['default'] && afrous.lang.cast(type, conf['default']);
      this.createNewParam(conf.name, type, val); 
      this.dialog.hide();
    }
  }
  ,

  createNewParam : function(name, type, val, immutable) { 
    var node = new ParamsTreeNode(name, type, val, immutable);
    this.paramsTree.getRootNode().appendChild(node);
    var paramDef = { name : name, type : type };
    if (typeof val != 'undefined') paramDef['default'] = val;

    this.processPanel.processDef.addParamDef(paramDef);
  }
  ,

  handleDestroyParam : function() {
    var node = this.paramsTree.getSelectionModel().getSelectedNode();
    node.parentNode.removeChild(node);

    this.processPanel.processDef.removeParamDef(node.name);
  }
  ,

  handleSetParam : function() {
    var node = this.paramsTree.getSelectionModel().getSelectedNode();
    Ext.Msg.prompt(
      'Parameter Value',
      'Input parameter value',
      function(btn, text) {
        if (btn=='ok') {
          this.setParamValue(node.name, text); 
        }
      },
      this
    )
  }
  ,

  setParamValue : function(name, value) {
    var node = afrous.lang.find(
      this.paramsTree.getRootNode().childNodes, 
      function(node) { return node.name == name; }
    );
    node.setValue(value);

    this.processPanel.process.setParam(name, value);
  }
  ,

  onLayout : function(event) {
    this.el.setSize(event.regions.west.bodyEl.getSize()); 
    this.layout.layout();
  }
  ,

  destory : function() {
    ParamsPanel.superclass.destroy.apply(this, arguments);
    this.paramsTree.destroy();
    this.dialog.destroy();
  }

});

/**
 * @class ParamsTreeNode
 * @extends ObjectTreeNode
 */
var ParamsTreeNode = function(name, type, val, immutable) {
  ParamsTreeNode.superclass.constructor.call(this, name, name, val);
  this.type = type; 
  this.immutable = immutable;
}

Ext.extend(ParamsTreeNode, ObjectTreeNode, {

  setValue : function(value) {
    if (this.type) {
      value = afrous.lang.cast(this.type, value);
    }
    ParamsTreeNode.superclass.setValue.call(this, value);
  }

});



/**
 * @class OutputPanel
 * @extends Ext.NestedLayoutPanel
 */
var OutputPanel = function(el, config) {

  this.layout = new Ext.BorderLayout(el, {
    north : {
      initialSize : 28
    },
    center: {
      titlebar: false,
      autoScroll : true
    }
  });

  this.toolbarPanel = new Ext.ContentPanel(el.createChild());
  this.toolbar = new Ext.Toolbar(this.toolbarPanel.el.createChild());
  this.textField = new Ext.form.TextField({
    selectOnFocus : true, 
    width : 100
  });
  this.toolbar.add(this.textField);
  this.toolbar.addButton({
    text: 'Refresh',
    cls: 'x-btn-text-icon af-refresh-btn',
    handler: this.refresh,
    scope : this
  });
  this.textField.on('change', function() {
    this.setExpr(this.textField.getValue());
  }, this);

  this.contentPanel = new Ext.ContentPanel(el.createChild());
  this.outputView = new OutputTreeView(this.contentPanel.el.createChild(), 'Output', false); 

  this.layout.add('north', this.toolbarPanel);
  this.layout.add('center', this.contentPanel);

  OutputPanel.superclass.constructor.call(this, this.layout, config);

  this.dropTarget = new Ext.dd.DropTarget(this.el, {
    ddGroup : 'BindingObjectDD',
    overClass : 'af-panel-dragover'
  }); 

  this.dropTarget.notifyOver = this.handleOver.createDelegate(this);
  this.dropTarget.notifyDrop = this.handleDrop.createDelegate(this);

}

Ext.extend(OutputPanel, Ext.NestedLayoutPanel, {

  loadConfig : function(outputExpr) {
    this.setExpr(outputExpr);
  }
  ,

  setExpr : function(expr) {
    this.textField.setValue(expr);
    this.processPanel.processDef.setOutput(expr);
  }
  ,

  refresh : function() {
    this.outputView.prepare();
    this.processPanel.process.start(
      this.outputView.render.createDelegate(this.outputView)
    );
  }
  ,

  handleOver : function(source, event, data) {
    return "x-dd-drop-ok";
  }
  ,

  handleDrop : function(source, event, data) {
    this.setExpr('${'+data.node.path+'}');
    this.refresh();
    this.dropTarget.notifyOut(source, event, data);
    return true;
  }
  ,

  onLayout : function(event) {
    this.el.setSize(event.regions.east.bodyEl.getSize()); 
    this.layout.layout();
  }
  ,

  destroy : function() {
    OutputPanel.superclass.destroy.apply(this, arguments);
  }

});
 



/**
 * @class ActionsPanel
 * @extends Ext.NestedLayoutPanel
 */
var ActionsPanel = function(el, config) {

  var layout = new Ext.BorderLayout(el, {
    center: {
      titlebar: false,
      autoScroll : true
    }
  });

  this.contentPanel = new Ext.ContentPanel(el.createChild());
  layout.add('center', this.contentPanel);

  ActionsPanel.superclass.constructor.call(this, layout, config);

  this.dropTarget = new Ext.dd.DropTarget(this.el, {
    ddGroup : 'UnitActionDD'
  }); 
  this.dropTarget.notifyOver = this.handleOver.createDelegate(this);
  this.dropTarget.notifyDrop = this.handleDrop.createDelegate(this);

  this.layout.regions.center.bodyEl.on('scroll', this.repaintWidgets, this);

  this.widgets = [];

  this.margin = new WidgetMargin(this.contentPanel.el.createChild({ cls : 'af-wgt-margin' }), null, this);

  this.addEvents({
    'focus' : true
  });
}

Ext.extend(ActionsPanel, Ext.NestedLayoutPanel, {

  loadConfig : function(actionCfgs) {
    afrous.lang.forEach(actionCfgs, this.createActionWidget.createDelegate(this));
  }
  ,

  repaintWidgets : function() {
    afrous.lang.forEach(this.widgets, function(w) { w.repaint() });
  }
  ,

  handleOver : function(source, event, data) {
    return "x-dd-drop-ok";
  }
  ,

  handleDrop : function(source, event, data) {
    var config = this.getDefaultActionConfig(data.node.uaction);
    if (event.altKey) {
      this.promptActionName(config);
    } else {
      this.createActionWidget(config);
    }
    this.dropTarget.notifyOut(source, event, data);
    return true;
  }
  ,

  promptActionName : function(config) { 
    var _orig = arguments.callee;
    var _arg = arguments;

    Ext.Msg.prompt(
      'Action Name',
      'Please input unique action name',
      function(btn, text) {
        if (btn=="ok") {
          if (/^[a-zA-Z_][0-9a-zA-Z_]*$/.test(text)) {
            this.createActionWidget({ name : text, type : config.type });
          } else {
            _orig.apply(this, _arg);
          } 
        }
      },
      this
    );
    
    // text input focus
    var input = Ext.Msg.getDialog().body.select('input');
    input.focus.createDelegate(input).defer(100);
    input.value = config.name;
  }
  ,

  getDefaultActionConfig : function(uaction) {
    var config = {};
    config.type = uaction.getQualifiedType();
    var namebase = uaction.type.toLowerCase().replace(/[^a-z0-9]/g, '');
    config.name = namebase;
    for (var i=1; this.processPanel.processDef.findActionDef(config.name); i++) {
      config.name = namebase + i;
    } 
    return config;
  }
  ,

  createActionWidget : function(config) {
    var actionDef = new afrous.ActionDef(config);
    try {
      this.processPanel.processDef.addActionDef(actionDef);
    } catch (e) {
      return null;
    }

    var uaction = afrous.packages.findUnitAction(config.type);
    var widget;
    if (uaction.innerProcess) {
      widget = new ProcessActionWidget(this.contentPanel.el.createChild(), {
        actionDef : actionDef,
        processPanel : this.processPanel,
        innerProcessConfig : config.innerProcess
      });
    } else {
      var Widget = 
        afrous.editor.widgets.findWidget(uaction.getQualifiedType()) || ActionWidget;
      widget = new Widget(this.contentPanel.el.createChild(), {
        actionDef : actionDef,
        processPanel : this.processPanel
      });
    }
    widget.on('focus', this.handleFocusWidget, this);
    widget.on('destroy', this.handleDestroyWidget, this);
    this.widgets.push(widget);
    widget.focus();

    return widget;
  }
  ,

  insertWidgetAfter : function(pivot, widget) {
    if (pivot == widget) return;
    widget.el.insertAfter((pivot || this.margin).el.dom);

    var tmpwidgets = [];
    if (!pivot) tmpwidgets.push(widget);
    afrous.lang.forEach(this.widgets, function(w) {
      if (w==widget) {
        return;
      }
      tmpwidgets.push(w);
      if (w==pivot) {
        tmpwidgets.push(widget);  
      }
    });
    this.widgets = tmpwidgets;

    this.recalcActionDefOrder();
  }
  ,


  handleFocusWidget : function(widget) {
    afrous.lang.forEach(this.widgets, function(wgt) {
      if (wgt!=widget) wgt.blur();
    });
    this.fireEvent('focus', widget);
    this.repaintWidgets();
  }
  ,

  handleDestroyWidget : function(widget) {
    var i = afrous.lang.indexOf(this.widgets, widget);
    this.widgets = afrous.lang.filter(this.widgets, function(w) {
      return w != widget 
    });
    widget.un('focus', this.handleFocusWidget);
    widget.un('destroy', this.handleDestroyWidget);
    if (i>=this.widgets.length) i = this.widgets.length-1;
    if (i>=0) this.widgets[i].focus();
    this.repaintWidgets();
  } 
  ,

  recalcActionDefOrder : function() {
    afrous.lang.forEach(this.widgets, function(widget, i) {
      widget.actionDef.order = i;
    });
  }
  ,

  onLayout : function(event) {
    this.el.setSize(event.regions.center.bodyEl.getSize());
    this.layout.layout();
    //afrous.lang.forEach(this.widgets, function(w) { w.adjustSize(); });
  }
  ,

  checkScroll : function(event) {
    if (event.xy[1] - this.contentPanel.el.getTop() < 20) {
      this.contentPanel.el.scroll('up', 10);  
    } else if (this.contentPanel.el.getBottom() - event.xy[1] < 20) {
      this.contentPanel.el.scroll('down', 10);
    } 
  }
  ,

  destroy : function() {
    ActionsPanel.superclass.destroy.apply(this, arguments);
    afrous.lang.forEach(this.widgets, function(w) { w.destroy() });
  }

});


/**
 * @class WidgetMargin
 */
var WidgetMargin = function(el, widget, actionsPanel) {
  this.el = el;
  this.widget = widget;
  this.actionsPanel = actionsPanel || widget.actionsPanel;
  this.el.createChild({ cls : 'af-wgt-margin-line' });
  this.dropTarget = new Ext.dd.DropTarget(this.el, {
    overClass : 'af-wgt-margin-dragover'
  });
  this.dropTarget.addToGroup('BindingObjectDD');
  this.dropTarget.addToGroup('WidgetDD');
  this.dropTarget.addToGroup('UnitActionDD');

  this.dropTarget.notifyEnter = this.handleEnter.createDelegate(this);
  this.dropTarget.notifyOut = this.handleOut.createDelegate(this);
  this.dropTarget.notifyOver = this.handleOver.createDelegate(this);
  this.dropTarget.notifyDrop = this.handleDrop.createDelegate(this);
} 

WidgetMargin.prototype = {

  handleEnter : function(source, event, data) {
    this.mouseInside = true;
    return Ext.dd.DropTarget.prototype.notifyEnter.call(this.dropTarget, source, event, data);
  }
  ,

  handleOut : function(source, event, data) {
    this.mouseInside = false;
    Ext.dd.DropTarget.prototype.notifyOut.call(this.dropTarget, source, event, data);
  }
  ,

  handleOver : function(source, event, data) {
    return "x-dd-drop-ok";
  }
  ,

  handleDrop : function(source, event, data) {
    if (this.mouseInside) {
      window.setTimeout(function() {
        if (source.ddGroup=='BindingObjectDD') {
        } else if (source.ddGroup=='WidgetDD') { 
          this.actionsPanel.insertWidgetAfter(this.widget, data);
        } else if (source.ddGroup=='UnitActionDD') {
          var config = this.actionsPanel.getDefaultActionConfig(data.node.uaction);
          var widget = this.actionsPanel.createActionWidget(config);
          this.actionsPanel.insertWidgetAfter(this.widget, widget);
        } 
      }.createDelegate(this), 100);
    }
    this.dropTarget.notifyOut(source, event, data);
    return true;
  }

}


/**
 * @class StackWidget
 * @extends Ext.util.Observable
 */
var StackWidget = function(el, config) {

  this.el = Ext.get(el);
  this.el.addClass('af-wgt');

  Ext.apply(this, config);

  this.header = el.createChild({ cls : 'af-wgt-hd', html : '&#160;' });
  this.body = el.createChild({ cls : 'af-wgt-bd' });
  
  this.header.unselectable();

  if (this.title) {
    this.header.update(this.title);
  }

  this.hwrap = this.header.wrap({ cls : 'af-wgt-wgt-head' });
  this.hwrap.wrap({ cls : 'af-wgt-hd-right' }).wrap({ cls : 'af-wgt-hd-left' }, true);

  this.toolbox = this.hwrap.createChild({ cls : 'af-wgt-toolbox' });
  this.hwrap.createChild({ cls : 'af-wgt-clear', style : 'clear:both' });

  this.el.addClass('af-wgt-closable');
  this.el.on('click', this.focus, this);

  this.closeBtn = this.toolbox.createChild({ cls : 'af-wgt-close' });
  this.closeBtn.on('click', this.closeClick, this);
  this.closeBtn.addClassOnOver('af-wgt-close-over');

  this.collapseBtn = this.toolbox.createChild({ cls : 'af-wgt-collapse' });
  this.collapseBtn.on('click', this.collapseClick, this);
  this.collapseBtn.addClassOnOver('af-wgt-collapse-over');

  this.hwrap.on('dblclick', this.headerDblClick, this);

  this.bwrap = this.body.wrap({ cls : 'af-wgt-wgt-body' });
 
  this.proxy = this.el.createProxy({ cls : 'af-wgt-proxy' });
  this.proxy.setOpacity(.5);
  this.proxy.hide();

  this.dd = new Ext.dd.DDProxy(this.el, 'WidgetDD', { dragElId : this.proxy.id });
  this.dd.ddGroup = 'WidgetDD';
  this.dd.setHandleElId(this.hwrap.id);

  this.dd.endDrag = this.endMove.createDelegate(this);
  this.dd.startDrag = this.startMove.createDelegate(this);
  this.dd.onDragEnter = this.onDragEnter.createDelegate(this);
  this.dd.onDragOver = this.onDragOver.createDelegate(this);
  this.dd.onDragOut = this.onDragOut.createDelegate(this);
  this.dd.onDragDrop = this.onDragDrop.createDelegate(this);

  this.bmargin = new WidgetMargin(this.el.createChild({ cls : 'af-wgt-margin' }), this);

  //this.adjustSize();

  this.addEvents({
    'focus' : true,
    'hide' : true,
    'show' : true,
    'destroy' : true
  });

}

Ext.extend(StackWidget, Ext.util.Observable, {

  startMove : function() {
    this.proxy.show();
  }
  ,

  endMove : function() {
    this.proxy.hide();
  }
  ,

  onDragEnter : function(e, id) {
    var target = Ext.dd.DragDropMgr.getDDById(id);
    if (target.isNotifyTarget) target.notifyEnter(this.dd, e, this);
  }
  ,

  onDragOver : function(e, id) {
    var target = Ext.dd.DragDropMgr.getDDById(id);
    if (target.isNotifyTarget) target.notifyOver(this.dd, e, this);
  }
  ,

  onDragOut : function(e, id) {
    var target = Ext.dd.DragDropMgr.getDDById(id);
    if (target.isNotifyTarget) target.notifyOut(this.dd, e, this);
  }
  ,

  onDragDrop : function(e, id) {
    var target = Ext.dd.DragDropMgr.getDDById(id);
    if (target.isNotifyTarget) target.notifyDrop(this.dd, e, this);
  }
  ,
  
  setTitle : function(text) {
    this.header.update(text);
    return this;
  }
  ,

  setContent : function(text) {
    this.body.update(text);
    return this;
  }
  ,

  closeClick : function(e) {
    e.stopPropagation();
    this.destroy();
  }
  ,

  collapseClick : function(e) {
    e.stopPropagation();
    this.toggle();
  }
  ,

  adjustSize : function() {
    this.el.setWidth(550);
  }
  ,

  toggle : function() {
    this[this.collapsed ? 'expand' : 'collapse']();
  }
  ,

  headerDblClick : function() {
    this.toggle();
  }
  ,

  collapse : function() {
    if (!this.collapsed) {
      this.collapsed = true;
      this.el.addClass('af-wgt-collapsed');
    }
  }
  ,

  expand : function() {
    if (this.collapsed) {
      this.collapsed = false;
      this.el.removeClass('af-wgt-collapsed');
    }
  }
  ,

  repaint : function() {
    this.el.repaint();
  }
  ,

  show : function() {
    if (!this.el.isVisible()) {
      this.el.show();
      this.focus();
   
      if (Ext.isIE) {
        this.el.repaint();
      }
      this.fireEvent('show', this);
    }
  }
  ,

  hide : function(callback) {
    if (typeof callback == 'function') {
      opt = { callback : callback, scope : this };
    } else {
      opt = false;
    }
    this.el.hide(opt);
    this.fireEvent('hide', this);
    return this;
  }
  ,

  focus : function() {
    this.fireEvent('focus', this);
    //this.body.focus();
    this.el.setOpacity(.9999);
  }
  ,

  blur : function() {
    this.el.setOpacity(.5);
  }
  ,

  destroy : function() {
    this.hide(function() {
      Ext.destroy(this.closeBtn, this.collapseBtn);
      this.el.removeAllListeners();
      this.el.update('');
      this.el.remove();
      this.fireEvent('destroy', this);
    });
  }
  ,

  isVisible : function() {
    return this.el.isVisible();
  }
  ,

  getEl : function() {
    return this.el;
  }

});


/**
 * @class ActionWidget
 * @extends StackWidget
 */
var ActionWidget = function(el, config) {
  
  this._classType = "ActionWidget";
  
  this.processPanel = config.processPanel;
  this.actionsPanel = this.processPanel.actionsPanel;
  this.actionDef = config.actionDef;
  this.uaction = afrous.packages.findUnitAction(this.actionDef.type);
  
  ActionWidget.superclass.constructor.call(this, el, { 
    title : this.actionDef.name + ' (' + this.uaction.label + ')'
  });

  this.addEvents({
    'change' : true,
    'update' : true
  });

  this.render();

  // re-adjust rendered object size
  this.adjustSize();
}


Ext.extend(ActionWidget, StackWidget, {

  render : function() {
    this.renderInputArea();
    this.renderOutputArea();
  }
  ,

  renderInputArea : function() {
    this.inputAreaWrap = this.body.createChild({ cls : 'af-action-input-wrap' });
    this.inputToolbar = new Ext.Toolbar(this.inputAreaWrap.createChild());
    this.inputToolbar.el.enableDisplayMode();
    this.inputToolbar.el.hide();
    this.inputArea = this.inputAreaWrap.createChild({ cls : 'af-action-input' });

    this.inputFields = [];
    
    this.renderInputFields();
  }
  ,

  renderInputFields : function() {
    if (this.uaction.allowDynamicInput) {
      this.inputToolbar.el.show();
      this.inputToolbar.addButton({
        text: 'Add New Input',
        cls: 'x-btn-text-icon af-add-btn',
        handler : this.createDynamicBindField,
        scope : this
      });
    }

    if (this.uaction.inputs) {
      afrous.lang.forEach(
        afrous.lang.values(this.uaction.inputs), 
        function(inputDef) { this.createBindField(inputDef) },
        this
      ); 
    }

    afrous.lang.forEach(
      afrous.lang.keys(this.actionDef.inputs || {}),
      function(key) {
        var field = afrous.lang.find(this.inputFields, function(f){ 
          return f.getName() == key 
        });
        if (!field) {
          field = this.createDynamicBindField();
          field.setName(key);
        }
        field.setValue(this.actionDef.inputs[key]);
      },
      this
    );

  }
  ,

  createBindField : function(config) {
    var field = new ActionInputField(this.inputArea.createChild(), config);
    field.on('change', this.handleChangeBinding, this);
    field.on('destroy', this.destroyBindField, this);
    this.inputFields.push(field);
    return field;
  }
  ,

  createDynamicBindField : function() {
    var field = new DynamicActionInputField(this.inputArea.createChild());
    field.on('change', this.handleChangeBinding, this);
    field.on('destroy', this.destroyBindField, this);
    this.inputFields.push(field);
    return field;
  }
  ,

  destroyBindField : function(field) {
    field.un('change', this.handleChangeBinding);
    field.un('destroy', this.destroyBindField);
    this.inputFields = afrous.lang.filter(this.inputFields, function(f) {
      return f != field;
    });
    this.handleChangeBinding();
  }
  ,

  handleChangeBinding : function() {
    this.actionDef.setInputs(this.getInputValues());
  }
  ,

  getInputValues : function() {
    var inputs = {};
    afrous.lang.forEach(this.inputFields, function(field) {
      var value = field.getValue();
      if (value) inputs[field.getName()] = value;
    });
    return inputs;
  }
  ,

  renderOutputArea : function() {

    this.outputAreaWrap = this.body.createChild({ cls : 'af-action-output-wrap' });
    this.outputAreaWrap.enableDisplayMode();
    
    this.outputToolbar = new Ext.Toolbar(this.outputAreaWrap.createChild());
    this.viewSelect = new SelectBox({
      fieldName : 'view mode',
      name : 'viewSelect',
      width : 80,
      options : [ 'Tree', 'Grid' ]
    });
    this.viewSelect.setValue('Tree');
    this.viewSelect.on('select', function() {
      this.changeOutputView(this.viewSelect.getValue());
    }, this);
    
    this.outputToolbar.add(this.viewSelect);
    this.outputToolbar.addButton({
      text: 'Refresh',
      cls: 'x-btn-text-icon af-refresh-btn',
      handler: this.refresh,
      scope : this
    });

    this.outputArea = this.outputAreaWrap.createChild({ cls : 'af-action-output' });

    this.outputTreeViewEl = this.outputArea.createChild({ cls : 'af-action-output-tree' });
    this.outputTreeViewEl.enableDisplayMode();
    this.outputTreeView = new OutputTreeView(this.outputTreeViewEl, this.actionDef.name, true),
    this.outputGridViewEl = this.outputArea.createChild({ cls : 'af-action-output-grid' });
    this.outputGridViewEl.enableDisplayMode();
    this.outputGridView = new OutputGridView(this.outputGridViewEl, this.actionDef.name, true)

    this.changeOutputView(this.viewSelect.getValue());

  }
  ,

  changeOutputView : function(viewMode) {
    if (viewMode=='Grid') {
      this.outputTreeViewEl.hide();
      this.outputGridViewEl.show();
      this.outputGridView.grid.render();
    } else {
      this.outputGridViewEl.hide();
      this.outputTreeViewEl.show();
    }
  }
  ,

  adjustSize : function() {
    ActionWidget.superclass.adjustSize.apply(this);
    this.outputArea.setWidth(525);
  }
  ,

  refresh : function() {
    this.outputAreaWrap.show();
    this.outputTreeView.prepare(); 
    this.outputGridView.prepare(); 
    this.evaluate(function(value) {
      this.outputTreeView.render(value);
      this.outputGridView.render(value);
    }.createDelegate(this));
  }
  ,

  focus : function() {
    ActionWidget.superclass.focus.call(this);
    if (!this.outputAreaWrap.isVisible()) this.outputAreaWrap.show();
  }
  ,

  blur : function() {
    ActionWidget.superclass.blur.call(this);
    this.outputAreaWrap.hide();
  }
  ,

  evaluate : function(callback) {
    this.processPanel.process.evaluate('${'+this.actionDef.name+'}', function(response) {
      callback(response.value);
    });
  }
  ,

  clearOutput : function() {
    this.getOutputView().reset();
  }
  ,

  destroy : function() {
    ActionWidget.superclass.destroy.apply(this, arguments);
    this.processPanel.processDef.removeActionDef(this.actionDef.name);
  }

});


/**
 * @class ActionInputField
 * @extends Ext.util.Observable
 */
var ActionInputField = function(el, config) {

  this.el = Ext.get(el);
  this.el.addClass('af-actionfield');

  var label = config.label || config.name;

  var form = new Ext.form.Form({ labelWidth : 100 });

  if (config.options) {
    this.control = new SelectBox({
      name : config.name,
      fieldLabel : label,
      editable : true,
      options : config.options,
      width : config.size && config.size == 'large' ? 300 : 150
    });
    if(config.selected)
      this.control.setValue(config.selected, false);
    this.store = this.control.store;
    this.control.on('select', this.handleChange, this);
  } else if (config.formElement == afrous.editor.formElement.TEXT_AREA) {
    this.control = new Ext.form.TextArea({
      name : config.name,
      fieldLabel : label,
      selectOnFocus : true,
      grow : !Ext.isSafari // avoiding safari crash
    });
  } else if (config.formElement == afrous.editor.formElement.CHECK_BOX) {
    this.control = new Ext.form.Checkbox({
      name : config.name,
      fieldLabel : label
    });
  } else {
    this.control = new Ext.form.TextField({
      name : config.name,
      fieldLabel : label,
      selectOnFocus : true,
      width : config.size && config.size == 'large' ? 300 : 150
    });  
    if(config.invisible)
      this.control.setVisible(false);  
  }

  form.add(this.control);
  form.render(el);

  this.control.on('change', this.handleChange, this);
  //this.control.getEl().on('click', this.handleClick, this);

  this.dropTarget = new Ext.dd.DropTarget(this.control.el, {
    ddGroup : 'BindingObjectDD',
    overClass : 'af-actionfield-bind-dragover'
  }); 

  this.dropTarget.notifyOver = this.handleOver.createDelegate(this);
  this.dropTarget.notifyDrop = this.handleDrop.createDelegate(this);

  this.addEvents({
    'change' : true,
    'destroy' : true
  });
}

Ext.extend(ActionInputField, Ext.util.Observable, {

  handleOver : function(source, event, data) {
    return "x-dd-drop-ok";
  }
  ,

  handleDrop : function(source, event, data) {
    this.setValue('${'+data.node.path+'}');
    this.fireEvent('change');
    this.dropTarget.notifyOut(source, event, data);
    return true;
  }
  ,
 
  handleClick : function(event) {
    event.stopEvent();
  }
  ,

  handleChange : function() {
    this.fireEvent('change', this);
  }
  ,

  setName : function(name) {
    this.control.name = name;
  }
  ,

  getName : function() {
    return this.control.name;
  }
  ,

  setValue : function(value) {
    this.control.setValue(value);
  }
  ,

  getValue : function() {
    return this.control.getValue();
  }
  ,

  destroy : function() {
    this.control.un('change', this.handleChange);

    this.el.remove();

    this.fireEvent('destroy', this);
  }

});


/**
 * @class DynamicActionInputField
 * @extends ActionInputField
 */
var DynamicActionInputField = function(el) {
  this.el = Ext.get(el);
  this.el.addClass('af-actionfield');
 
  var form = new Ext.form.Form({ labelWidth : 40 });

  this.deleteBtn = new Ext.form.TriggerField({
    width : 10,
    cls : 'af-actionfield-delete',
    triggerClass : 'af-actionfield-delete-btn'
  });
  this.deleteBtn.onTriggerClick = this.destroy.createDelegate(this);

  this.label = new Ext.form.TextField({
    fieldLabel : 'Name',
    selectOnFocus : true,
    width : 140
  });

  this.control = new Ext.form.TextField({
    fieldLabel : 'Value',
    selectOnFocus : true,
    width : 140
  });

  form.column({ hideLabels : true, width : 20 }, this.deleteBtn);
  form.column({ width : 200, style : 'margin-left:10px' }, this.label);
  form.column({ width : 200, style : 'margin-left:10px', clear : true }, this.control);
  form.render(this.el);

  this.label.on('change', this.handleChange, this);
  //this.label.getEl().on('click', this.handleClick, this);

  this.control.on('change', this.handleChange, this);
  //this.control.getEl().on('click', this.handleClick, this);

  this.dropTarget = new Ext.dd.DropTarget(this.control.el, {
    ddGroup : 'BindingObjectDD',
    overClass : 'af-actionfield-bind-dragover'
  }); 

  this.dropTarget.notifyOver = this.handleOver.createDelegate(this);
  this.dropTarget.notifyDrop = this.handleDrop.createDelegate(this);

  this.addEvents({
    'change' : true,
    'destroy' : true
  });

}

Ext.extend(DynamicActionInputField, ActionInputField, {

  setName : function(value) {
    this.label.setValue(value);
  }
  ,

  getName : function() {
    return this.label.getValue();
  }  
  ,

  destroy : function() {
    this.label.el.un('change', this.handleChange);

    DynamicActionInputField.superclass.destroy.apply(this, arguments);
  }

});


/**
 * @class OutputTreeView
 */
var OutputTreeView = afrous.lang.defineClass({

  initialize : function(el, name, draggable) {
    this.el = el;
    this.outputTree = new ObjectTreePanel(this.el.createChild(), {
      name : name,
      draggable : draggable
    });
  }
  ,
  
  prepare : function() {
    this.outputTree.beforeLoad();
  }
  ,

  render : function(value) {
    this.outputTree.setObject(value);
  }
  ,

  reset : function() {
    this.outputTree.setObject(null);
  }

});


/**
 * @class OutputGridView
 */
var OutputGridView = afrous.lang.defineClass({

  initialize : function(el, name, draggable) {
    this.el = el;
    this.ds = new Ext.data.Store({
      proxy : new Ext.data.MemoryProxy({ records : [] }),
      reader : new Ext.data.JsonReader({ root : 'records' }, [ 'header' ])
    });
    this.cm = new Ext.grid.ColumnModel([
      { header : 'header', dataIndex : 'header', width : this.el.up('div').getWidth()-18 }
    ]);

    this.grid = new Ext.grid.Grid(this.el, {
      ds : this.ds, 
      cm : this.cm,
      autoHeight : true,
      maxHeight : 250
    });
    this.ds.load();
    this.grid.render();
  }
  ,
  
  prepare : function() {
    if (this.ds) this.ds.removeAll();
  }
  ,

  render : function(value) {
    if (typeof value == 'undefined' || value===null) return;

    var records = afrous.lang.isArray(value) ? value : [ value ];

    var fields = {};
    records = afrous.lang.map(records, function(record) {
      if (afrous.lang.isObject(record) && 
          !(record instanceof afrous.Renderer) &&
          !afrous.lang.isDOMNode(record)) {
        afrous.lang.forEach(afrous.lang.keys(record), function(field) {
          fields[field] = true; 
        });
        return record;
      } else {
        fields['element'] = true;
        return { element : record }
      }
    });
    fields = afrous.lang.keys(fields);

    this.ds = new Ext.data.Store({
      proxy : new Ext.data.MemoryProxy({ records : records }),
      reader : new Ext.data.JsonReader({ root : 'records' }, fields)
    });

    var colwidth = Math.floor((this.el.up('div').getWidth()-18) / fields.length);
    this.cm = new Ext.grid.ColumnModel(
      afrous.lang.map(fields, function(f) {
        return {
          header : f,
          dataIndex : f, 
          renderer : renderCell,
          width : colwidth 
        }
      })
    );

    this.grid.reconfigure(this.ds, this.cm);
    this.ds.load();

    this.grid.render();

    function renderCell(value, p, record) {
      if (afrous.lang.isArray(value)) {
        return '[array]';
      }
      if (afrous.lang.isDOMNode(value)) {
        return afrous.dom.toHTML(value);
      } 
      if (value instanceof afrous.Renderer) {
        var el = afrous.dom.createElement(); 
        value.render(el);
        return el.innerHTML;
      }
      if (afrous.lang.isObject(value)) {
        return '[object]';
      }
      return afrous.lang.toString(value);
    }

  }
  ,

  reset : function() {
    this.el.update('');
  }

});


/**
 * @class ProcessActionWidget
 * @extends ActionWidget
 */
var ProcessActionWidget = function(el, config) {
  ProcessActionWidget.superclass.constructor.apply(this, arguments);

  this.outputToolbar.addButton({
    text: 'Open Inner Process',
    cls: 'x-btn-text-icon af-open-inner-proc-btn',
    handler: this.openInnerProcessEditor,
    scope : this
  });

  this.innerProcessPanel = 
    this.processPanel.editorApp.createNewProcPanel(this.actionDef.name, this.processPanel);

  if (config.innerProcessConfig) {
    this.innerProcessPanel.loadConfig(config.innerProcessConfig);
  }
  this.actionDef.setInnerProcess(this.innerProcessPanel.processDef);

  if (this.uaction.innerProcessParams) {
    afrous.lang.forEach(
      this.uaction.innerProcessParams, 
      function(innerParam) {
        this.innerProcessPanel.paramsPanel.createNewParam(
          innerParam.name, innerParam.type, null, true);
      },
      this
    );
  }
  
} 

Ext.extend(ProcessActionWidget, ActionWidget, {

  openInnerProcessEditor : function() {
    var zoom = Ext.get(document.body).createChild({ style : 'border:1px solid #6593CF;background: #c3daf9' });
    zoom.setXY(this.el.getXY());
    zoom.setWidth(this.el.getWidth());
    zoom.setHeight(this.el.getHeight());
    zoom.setOpacity(.5);
    zoom.shift({
      xy : this.processPanel.el.getXY(),
      width : this.processPanel.el.getWidth(),
      height : this.processPanel.el.getHeight(),
      duration : .5,
      opacity : .3,
      remove : true,
      callback : this._openInnerProcessEditor.createDelegate(this)
    });
  },

  _openInnerProcessEditor : function() { 
    this.processPanel.editorApp.activateProcPanel(this.innerProcessPanel);
    var action = this.processPanel.process.resolveRef(this.actionDef.name);
    action.prepareInnerParams(function(params) {
      afrous.lang.forEach(afrous.lang.keys(params||{}), function(pname) {
        this.innerProcessPanel.paramsPanel.setParamValue(pname, params[pname]);
      }, this);
    }.createDelegate(this))
  }

});


/**
 * @class SelectBox
 * @extends Ext.form.ComboBox
 */
var SelectBox = function(config) {

  SelectBox.superclass.constructor.call(this, {
    fieldLabel : config.fieldLabel,
    name : config.name,
    displayField : 'label',
    editable : config.editable,
    typeAhead: true,
    triggerAction: 'all',
    selectOnFocus : true,
    forceSelection : true,
    store: new Ext.data.SimpleStore({
      fields : [ 'value', 'label' ],
      data : afrous.lang.map(config.options, function(o) { return [ o, o ] })
    }),
    width : config.width
  });

}

Ext.extend(SelectBox, Ext.form.ComboBox, {});



/**
 * @class WidgetManager
 */
var WidgetManager = afrous.lang.defineClass({
  initialize : function() {
    this.widgets = {};
  }
  ,

  register : function(nstype, widgetCls) {
    this.widgets[nstype] = widgetCls;
  }
  ,

  findWidget : function(nstype) {
    return this.widgets[nstype];
  }

});

afrous.editor.widgets = new WidgetManager();


/* -------------------------------------------------------------------------- */ 

afrous.editor.EditorApp = EditorApp;
afrous.editor.LibraryPanel = LibraryPanel;
afrous.editor.ProcessPanel = ProcessPanel;
afrous.editor.ParamsPanel = ParamsPanel;
afrous.editor.ActionsPanel = ActionsPanel;
afrous.editor.OutputPanel = OutputPanel;
afrous.editor.ObjectTreePanel = ObjectTreePanel;
afrous.editor.OutputTreeView  = OutputTreeView;
afrous.editor.StackWidget = StackWidget;
afrous.editor.ActionWidget = ActionWidget;
afrous.editor.ProcessActionWidget = ProcessActionWidget;

afrous.editor.SelectBox = SelectBox;
afrous.editor.ActionInputField = ActionInputField;
afrous.editor.DynamicActionInputField = DynamicActionInputField;

afrous.editor.AbstractCallbackDialog = AbstractCallbackDialog;

})();


