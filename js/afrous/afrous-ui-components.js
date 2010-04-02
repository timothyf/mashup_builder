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
         url: mbuilder.config.LIBRARY_SEARCH_URL
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
    } 
	else {
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
  cfg = mbuilder.lang.extend({text : name,
                            uiProvider : ObjectTreeNodeUI}, cfg || {})

  ObjectTreeNode.superclass.constructor.call(this,cfg);
  this.name = name;
  this.path = path;
  this.setValue(obj);
}

Ext.extend(ObjectTreeNode, Ext.tree.TreeNode, {

  setValue : function(value) {

    mbuilder.lang.forEach(this.childNodes.slice(), function(c) { this.removeChild(c) }, this);
    this.value = value;
    if (mbuilder.lang.isDOMNode(value)) {
      var div = mbuilder.dom.createElement({ className : 'af-render-root' });
      div.appendChild(value);
      this.setText(this.name + mbuilder.dom.toHTML(div));
    } 
	else if (value instanceof mbuilder.Renderer) {
      this.setText(this.name);
    } 
	else if (jQuery.isArray(value)) {
      mbuilder.lang.forEach(value, function(val, i) {
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

    } else if (mbuilder.lang.isObject(value)) {
      mbuilder.lang.forEach(mbuilder.lang.keys(value), function(key) {
        if (key != 'myCocktailIcon' && key != 'myCocktailName'){
          if (mbuilder.lang.isSerializable(value[key])) {
            var p = this.path + (/^\w[\w\d]*$/.test(key) ? '.'+key : '["'+key+'"]');
            this.appendChild(new ObjectTreeNode(p, key, value[key]));
          }
        }
      }, this);
    } else if (value !== null && typeof value != 'undefined') {
      var str = mbuilder.string.escapeHTML(value.toString());
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
    if (this.node.value instanceof mbuilder.Renderer) {
      var renderer = this.node.value;
      var el = mbuilder.dom.createElement({ className : 'af-rendered' });
      this.textNode.appendChild(el);
      renderer.render(el);
    }
  }

});


/**
 * @class OutputTreeView
 */
var OutputTreeView = mbuilder.lang.defineClass({

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
var OutputGridView = mbuilder.lang.defineClass({

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

    var records = jQuery.isArray(value) ? value : [ value ];

    var fields = {};
    records = jQuery.map(records, function(record) {
      if (mbuilder.lang.isObject(record) && 
          !(record instanceof mbuilder.Renderer) &&
          !mbuilder.lang.isDOMNode(record)) {
        mbuilder.lang.forEach(mbuilder.lang.keys(record), function(field) {
          fields[field] = true; 
        });
        return record;
      } else {
        fields['element'] = true;
        return { element : record }
      }
    });
    fields = mbuilder.lang.keys(fields);

    this.ds = new Ext.data.Store({
      proxy : new Ext.data.MemoryProxy({ records : records }),
      reader : new Ext.data.JsonReader({ root : 'records' }, fields)
    });
    var colwidth = Math.floor((this.el.up('div').getWidth()-18) / fields.length);
    this.cm = new Ext.grid.ColumnModel(
      jQuery.map(fields, function(f) {
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
      if (jQuery.isArray(value)) {
        return '[array]';
      }
      if (mbuilder.lang.isDOMNode(value)) {
        return mbuilder.dom.toHTML(value);
      } 
      if (value instanceof mbuilder.Renderer) {
        var el = mbuilder.dom.createElement(); 
        value.render(el);
        return el.innerHTML;
      }
      if (mbuilder.lang.isObject(value)) {
        return '[object]';
      }
      return mbuilder.lang.toString(value);
    }
  }
  ,
  reset : function() {
    this.el.update('');
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
      data : mbuilder.lang.map(config.options, function(o) { return [ o, o ] })
    }),
    width : config.width
  });
}

Ext.extend(SelectBox, Ext.form.ComboBox, {});