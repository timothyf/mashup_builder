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
    mb.lang.forEach(paramCfgs, function(conf) {
      var val = conf['default'] && mb.lang.cast(conf.type, conf['default']);
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
      var val = conf['default'] && mb.lang.cast(type, conf['default']);
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
    var node = mb.lang.find(
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
