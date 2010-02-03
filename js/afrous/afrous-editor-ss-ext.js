/*
 * Romulus Mashup Builder - Server side extension.
 * Plug-in to open and to save mashups from server and from disk.
 *
 * David del Pozo González
 * (c) 2008 Informática Gesfor
 */

(function() {

var EditorAppExt = function(config){
  EditorAppExt.superclass.constructor.call(this,config);
};

Ext.extend(EditorAppExt, afrous.editor.EditorApp, {

  setupLayout: function(){
    EditorAppExt.superclass.setupLayout.call(this);
    this.openMenu.insert(0,new Ext.menu.Item({ text : 'Open',
                                               handler : this.openProcessFromServer,
                                               scope : this }));
    this.saveMenu.insert(0,new Ext.menu.Item({ text : 'Save as',
                                                handler : function(){ this.saveProcessToServer(true) },
                                                scope : this }));
    this.saveMenu.insert(0,new Ext.menu.Item({ text : 'Save',
                                                handler : function(){ this.saveProcessToServer() },
                                                scope : this }));
  }
  ,

  openProcessFromLocal : function() {
    if (!this.openLocalDialog) {
      this.openLocalDialog = new OpenProcessLocalDialog(this);
    }
    this.openLocalDialog.show();
  }
  ,

  openProcessFromServer : function() {
    if (!this.openDialog) {
      this.openDialog = new OpenProcessDialog();
      this.openDialog.setCallback(function(key) {
        if (key) this.loadProcessFromServer(key);
      }, this);
    }
    this.openDialog.show();
  }
  ,

  saveProcessToLocal : function() {
    var processConfig = this.rootProcessPanel.processDef.toConfig();
    if(!this.iframeSaveFile)
    {
      this.iframeSaveFile = document.createElement('iframe');
      document.body.appendChild(this.iframeSaveFile);
    }
    this.iframeSaveFile.src = afrous.config.PROCESS_SAVE_LOC_ULR+'?json='+afrous.url.urlEncode(afrous.lang.toJSON(processConfig));
  }
  ,

  saveProcessToServer : function(copying) {
    if (!this.saveDialog) {
      this.saveDialog = new SaveProcessDialog(this);
    }
    if(!copying && this.processKeyID)
    {
      var processConfig = this.rootProcessPanel.processDef.toConfig();
      var json = afrous.lang.toJSON(processConfig);

      var conn = new Ext.data.Connection();
      conn.request({
        url: afrous.config.PROCESS_SAVE_URL,
        method: 'POST',
        params: {id: this.processKeyID, json: json},
        success: function(responseObject) {
          var data  = responseObject.responseXML;
          var error = data.getElementsByTagName("error");
          if(error.length == 0)
          {
            Ext.Msg.alert('Saved', 'Mashup updated correctly');
          }
          else
          {
            Ext.Msg.alert('Error', error[0].textContent);
          }
        },
        failure: function() {
          Ext.Msg.alert('Status', 'Unable to save mashup at this time. Please try again later.');
        }
      });
    }
    else
    {
      this.saveDialog.show();
    }
  }

});


/**
 * @class OpenProcessDialog
 * @extends AbstractCallbackDialog
 */
var OpenProcessDialog = function() {

  OpenProcessDialog.superclass.constructor.call(this, {
    title : 'Open Process',
    modal : true,
    width : 600,
    height : 380,
    resizable : false,
    shadow : true
  });

  this.addKeyListener(27, this.hide, this);
  this.openBtn = this.addButton('Open', this.handleOpen, this);
  this.closeBtn = this.addButton('Close', this.hide, this);

  this.setup();
}

Ext.extend(OpenProcessDialog, afrous.editor.AbstractCallbackDialog, {

  setup : function() {

    this.ds = new Ext.data.Store({
      proxy: new Ext.data.ScriptTagProxy({
        url: afrous.config.PROCESS_PRIVATE_URL
      }),

      reader: new Ext.data.JsonReader({
         root: 'mashup',
         id: 'id',
         fields : [ 'id', 'name', 'description', 'json']
      }),

      remoteSort: true
    });

    var cm = new Ext.grid.ColumnModel([
      { header: "Name",
        dataIndex: 'name',
        width : 150,
        css: 'white-space:normal;' },
      { header: "Description",
        dataIndex: 'description',
        width : 350 }
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
      displayMsg: 'Displaying processes {0} - {1} of {2}',
      emptyMsg: "No processes to display"
    });

    this.grid.on('cellclick', this.handleGridUpdate, this);
    this.ds.on('load', this.handleGridUpdate, this);

    function renderDate(value) {
      var d = new Date(value);
      var yy = d.getFullYear();
      var mm = d.getMonth()+1;
      if (mm<10) mm = '0'+mm;
      var dd = d.getDate();
      if (dd<10) dd = '0'+dd;
      var hh = d.getHours();
      if (hh<10) hh = '0'+hh;
      var mi = d.getMinutes();
      if (mi<10) mi = '0'+mi;
      return [yy,'-',mm,'-',dd,' ',hh,':',mi].join('');
    }
  }
  ,

  show : function() {
    this.ds.load();
    this.paging.updateInfo();
    OpenProcessDialog.superclass.show.call(this);
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

  handleOpen : function() {
    var selections = this.grid.getSelections();
    if (selections.length==1) {
      var key = selections[0].data.id;
      this.callback.call(this.scope, key);
      this.hide();
    }
  }

});


var OpenProcessLocalDialog = function(editor) {

  OpenProcessLocalDialog.superclass.constructor.call(this, {
    title : 'Open Process',
    modal : true,
    width : 600,
    height : 380,
    resizable : false,
    shadow : true
  });

  this.editor = editor;

  var html =[
  '<div style="padding: 10px;"><p>Please select a file with a process stored or paste process config here in the text area.</p>',
  '<form id="fileForm" method="POST" enctype="multipart/form-data" action="'+afrous.config.PROCESS_OPEN_URL+'" target="contentFileIframe">',
  '  <input type="file" name="fileInput" id="fileInput" value="" size="38" onchange="afrous.editor.FileChooserEvent.onChangeFileChooser();" />',
  '</form>',
  '<textarea class="ext-mb-textarea" id="textareaFileContent" rows="14" cols="70"> </textarea>',
  '<iframe id="contentFileIframe" name="contentFileIframe" style="display: none;"/>',
  '</div>'].join("\n");

  this.body.dom.innerHTML = html;

  this.addKeyListener(27, this.hide, this);
  this.openBtn = this.addButton('Open', this.submit, this);
  this.closeBtn = this.addButton('Close', this.hide, this);
}

Ext.extend(OpenProcessLocalDialog, afrous.editor.AbstractCallbackDialog, {

  submit : function() {
    var processConfig = afrous.lang.parseJSON(document.getElementById("textareaFileContent").value);
    this.editor.newProcess();
    this.editor.loadProcessConfig(processConfig);
    this.hide();
  }
  ,

  hide: function() {
    if (this.PID) window.clearInterval(this.PID);
    OpenProcessLocalDialog.superclass.hide.call(this);
  }
  ,

  show: function() {
    this.PID = window.setInterval(function(){
      if(afrous.editor.OpenProcessLocalDialog.submit > 0)
      {
        var iframeDoc = document.getElementById("contentFileIframe").contentDocument;
        var bodys = iframeDoc.getElementsByTagName("body");
        var text = bodys[0].innerHTML;
        if(document.getElementById("textareaFileContent").value != text)
        {
          document.getElementById("textareaFileContent").value = text;
          afrous.editor.OpenProcessLocalDialog.submit--;
        }
      }
    }, 100);
    document.getElementById("textareaFileContent").value = "";
    document.getElementById("fileInput").value = "";
    OpenProcessLocalDialog.superclass.show.call(this);
  }
});


/**
 * @class SaveProcessDialog
 * @extends AbstractCallbackDialog
 */
var SaveProcessDialog = function(editor) {

  SaveProcessDialog.superclass.constructor.call(this, {
    title : 'Save Process',
    modal : true,
    width : 310,
    height : 144,
    resizable : false,
    shadow : true
  });

  this.formEl = this.body.createChild({ cls : 'af-dlg-form' });
  this.form = new Ext.form.Form({ labelWidth : 70 });
  this.nameField = new Ext.form.TextField({
    fieldLabel : 'Name',
    name : 'name',
    width : 200
  });
  this.descriptionField = new Ext.form.TextField({
    fieldLabel : 'Description',
    name : 'description',
    width : 200
  });
  this.form.add(this.nameField, this.descriptionField);
  this.form.render(this.formEl);

  this.editor = editor;
  this.addKeyListener(27, this.hide, this);

  this.openBtn = this.addButton('Save', this.submit, this);
  this.closeBtn = this.addButton('Close', this.hide, this);
}

Ext.extend(SaveProcessDialog, afrous.editor.AbstractCallbackDialog, {

  submit : function(){
    var name        = this.nameField.getValue();
    var description = this.descriptionField.getValue();

    if(name == "")
    {
      Ext.Msg.alert('Warning', 'Complete the "name" field');
      return;
    }

    var processConfig = this.editor.rootProcessPanel.processDef.toConfig();
    processConfig.name = name;
    var json = afrous.lang.toJSON(processConfig);

    var _this = this;
    var conn = new Ext.data.Connection();
    conn.request({
        url: afrous.config.PROCESS_SAVE_URL,
        method: 'POST',
        params: {name: name, description: description, json: json},
        success: function(responseObject) {
          var data  = responseObject.responseXML;
          var error = data.getElementsByTagName("error");
          if(error.length == 0)
          {
            var ids = data.getElementsByTagName("id");
            if(ids.length > 0)
            {
              var id = ids[0].textContent;
              _this.editor.rootProcessPanel.setProcessName(name);
              _this.editor.setProcessKeyID(id);
              Ext.Msg.alert('Saved', 'Mashup saved correctly');
            }
          }
          else
          {
            Ext.Msg.alert('Error', error[0].textContent);
          }
        },
        failure: function() {
          Ext.Msg.alert('Status', 'Unable to save mashup at this time. Please try again later.');
        }
    });

    this.hide();
  }
  ,

  show : function() {
    this.nameField.reset();
    this.descriptionField.reset();
    SaveProcessDialog.superclass.show.call(this);
  }

});


var FileChooserEvent = afrous.lang.defineClass({

  initialize : function() {
  }
  ,

  onChangeFileChooser : function() {
    document.getElementById("fileForm").submit();
    afrous.editor.OpenProcessLocalDialog.submit++;
  }
});


afrous.editor.EditorApp = EditorAppExt;

afrous.editor.FileChooserEvent = new FileChooserEvent();
afrous.editor.OpenProcessLocalDialog = {};
afrous.editor.OpenProcessLocalDialog.submit = 0;

})();


