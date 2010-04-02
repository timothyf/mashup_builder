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

  mbuilder.lang.forEach(packages, this.appendPackage, this);
  this.loadExtraPackages();

  this.layout.getRegion('center').tabs.getTab(this.svcPackagePanel.el.id).activate();

  this.wadlLoaderDialog = new WADLLoaderDialog();
  this.wadlLoaderDialog.setCallback(this.editorApp.loadWADL, this.editorApp);
  this.privateLibDialog = new PrivateLibraryDialog();
  this.privateLibDialog.setCallback(this.editorApp.loadLibrary, this.editorApp);
};


Ext.extend(LibraryPanel, Ext.NestedLayoutPanel, {
  loadExtraPackages : function() {
    afrous.packages.addListener('register', this.appendPackage, this);
    mbuilder.lang.loadScript(afrous.packages.scriptBaseURL+'/afrous-stdlib-index.js');
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

    mbuilder.lang.forEach(pack.listUnitActions(), function(uaction) {
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
      } 
	  else {
        this.appendServicePackage(pack);
      }
    } 
	else if (pack.namespace.indexOf('Renderer.')==0) {
      this.appendRendererPackage(pack);
    } 
	else {
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
