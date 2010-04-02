/**
 * @class ProcessPanel
 * @extends Ext.NestedLayoutPanel
 */
var ProcessPanel = function(el, config) {
  this.processDef = new mbuilder.ProcessDef();
  this.process = new mbuilder.ProcessInstance(this.processDef, config.parentProc);

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
    this.process = new mbuilder.ProcessInstance(this.processDef);
    if (processConfig.params) this.paramsPanel.loadConfig(processConfig.params);
    if (processConfig.output) this.outputPanel.loadConfig(processConfig.output);
    if (processConfig.actions) this.actionsPanel.loadConfig(processConfig.actions);
  }
  ,
  setProcessName : function(name) {
    window.document.title = window.document.title.replace(/ :.*$/, '') + ' : '+name;
    this.processDef.setName(name);
    if (name && name.length > 0) this.setTitle(mbuilder.string.escapeHTML(name));
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