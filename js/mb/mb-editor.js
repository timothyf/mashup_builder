/*  
 * This file provides the functionality that makes up the UI of the Mashup Editor application.
 * 
 */
var mb;
if (!mb) mb = {};

mb.editor = {}
mb.editor.formElement = {}
mb.editor.formElement.TEXT_AREA = "TEXT_AREA";
mb.editor.formElement.CHECK_BOX = "CHECK_BOX";


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
      value = mb.lang.cast(this.type, value);
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
    mb.lang.forEach(actionCfgs, this.createActionWidget.createDelegate(this));
  }
  ,
  repaintWidgets : function() {
    mb.lang.forEach(this.widgets, function(w) { w.repaint() });
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
    var actionDef = new mb.ActionDef(config);
    try {
      this.processPanel.processDef.addActionDef(actionDef);
    } catch (e) {
      return null;
    }

    var uaction = mb.packages.findUnitAction(config.type);
    var widget;
    if (uaction.innerProcess) {
      widget = new ProcessActionWidget(this.contentPanel.el.createChild(), {
        actionDef : actionDef,
        processPanel : this.processPanel,
        innerProcessConfig : config.innerProcess
      });
    } else {
      var Widget = 
        mb.editor.widgets.findWidget(uaction.getQualifiedType()) || ActionWidget;
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
    mb.lang.forEach(this.widgets, function(w) {
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
    mb.lang.forEach(this.widgets, function(wgt) {
      if (wgt!=widget) wgt.blur();
    });
    this.fireEvent('focus', widget);
    this.repaintWidgets();
  }
  ,
  handleDestroyWidget : function(widget) {
    var i = jQuery.inArray(widget, this.widgets);
    this.widgets = jQuery.grep(this.widgets, function(w) {
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
    mb.lang.forEach(this.widgets, function(widget, i) {
      widget.actionDef.order = i;
    });
  }
  ,
  onLayout : function(event) {
    this.el.setSize(event.regions.center.bodyEl.getSize());
    this.layout.layout();
    //mb.lang.forEach(this.widgets, function(w) { w.adjustSize(); });
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
    mb.lang.forEach(this.widgets, function(w) { w.destroy() });
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
    } 
	else {
      opt = false;
    }
    this.el.hide(opt);
    this.fireEvent('hide', this);
    return this;
  }
  ,
  focus : function() {
    this.fireEvent('focus', this);
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
  this.uaction = mb.packages.findUnitAction(this.actionDef.type);
  
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
      mb.lang.forEach(
        mb.lang.values(this.uaction.inputs), 
        function(inputDef) { this.createBindField(inputDef) },
        this
      ); 
    }
    mb.lang.forEach(
      mb.lang.keys(this.actionDef.inputs || {}),
      function(key) {
        var field = mb.lang.find(this.inputFields, function(f){ 
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
    this.inputFields = jQuery.grep(this.inputFields, function(f) {
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
    mb.lang.forEach(this.inputFields, function(field) {
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
  // Called to process the Refresh button which evaluates the web service call
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
  } 
  else if (config.formElement == mb.editor.formElement.TEXT_AREA) {
    this.control = new Ext.form.TextArea({
      name : config.name,
      fieldLabel : label,
      selectOnFocus : true,
      grow : !Ext.isSafari // avoiding safari crash
    });
  } 
  else if (config.formElement == mb.editor.formElement.CHECK_BOX) {
    this.control = new Ext.form.Checkbox({
      name : config.name,
      fieldLabel : label
    });
  } 
  else {
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
    mb.lang.forEach(
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
      mb.lang.forEach(mb.lang.keys(params||{}), function(pname) {
        this.innerProcessPanel.paramsPanel.setParamValue(pname, params[pname]);
      }, this);
    }.createDelegate(this))
  }
});


/**
 * @class WidgetManager
 */
var WidgetManager = mb.lang.defineClass({
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

mb.editor.widgets = new WidgetManager();

mb.editor.MashupBuilder = MashupBuilder;
mb.editor.LibraryPanel = LibraryPanel;
mb.editor.ProcessPanel = ProcessPanel;
mb.editor.ParamsPanel = ParamsPanel;
mb.editor.ActionsPanel = ActionsPanel;
mb.editor.OutputPanel = OutputPanel;
mb.editor.ObjectTreePanel = ObjectTreePanel;
mb.editor.OutputTreeView  = OutputTreeView;
mb.editor.StackWidget = StackWidget;
mb.editor.ActionWidget = ActionWidget;
mb.editor.ProcessActionWidget = ProcessActionWidget;

mb.editor.SelectBox = SelectBox;
mb.editor.ActionInputField = ActionInputField;
mb.editor.DynamicActionInputField = DynamicActionInputField;

mb.editor.AbstractCallbackDialog = AbstractCallbackDialog;
