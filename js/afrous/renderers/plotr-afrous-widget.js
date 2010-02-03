/*  
  Afrous JavaScript - Standard Widgets
  (c) 2007 Shinichi Tomita
*/

(function() {

/*var ObjectInspectorDialog = function() {

  ObjectInspectorDialog.superclass.constructor.call(this, {
    title : 'Choose an attribute',
    modal : true,
    width : 600,
    height : 460,
    resizable : false,
    shadow : true
  });
  this.addKeyListener(27, this.hide, this);
  this.openBtn = this.addButton('Select', this.handleOpen, this);
  this.closeBtn = this.addButton('Close', this.hide, this);

  this.setup();

}

Ext.extend(ObjectInspectorDialog, afrous.editor.AbstractCallbackDialog, {

  setup : function() {
    this.formEl = this.body.createChild({ cls : 'af-dlg-form' });
    this.outputView = new afrous.editor.OutputTreeView(this.formEl.createChild(), 'Output', false);
  }
  ,

  show : function(value) {
    this.outputView.render(value);
    ObjectInspectorDialog.superclass.show.call(this);
  }
  ,

  handleOpen : function() {
    var selNode = this.outputView.outputTree.getSelectionModel().selNode;
    if(selNode != null)
    {
      var path = selNode.path;
      this.callback.call(this.scope, path);
      this.hide();
    }
  }

});
*/
var PlotrWidget = function() {
  PlotrWidget.superclass.constructor.apply(this, arguments);
}

Ext.extend(PlotrWidget, afrous.editor.ActionWidget, {

  renderInputFields : function() {
    PlotrWidget.superclass.renderInputFields.apply(this, arguments);

    afrous.lang.forEach(
      this.getPropertyFields(),
      function (field) {
        field.store.removeAll();
        field.control.on('beforequery', this.suggestProperties, this);
        /*field.control.on('select',      this.generateInputs,    this);*/
      },
      this
    );
  }
  ,

  getPropertyFields : function() {
    return afrous.lang.filter(this.inputFields, function(f) {
      return /^(label|value|initialDate|finalDate|tagURL|tagName|tagSize|photoURL|photoLink)Field/.test(f.getName());
    });
  }
  ,

  suggestProperties : function() {
    var recordsField = afrous.lang.find(this.inputFields, function(f) {
      return f.getName()=='records';
    });
    this.processPanel.process.evaluate(
      recordsField.getValue(),
      this.handleArrayResult.createDelegate(this)
    );
  }
  ,

  handleArrayResult : function(result) {
    var elem = afrous.lang.cast('object[]', result.value)[0]
    if (afrous.lang.isObject(elem)) {
      var keys = afrous.lang.keys(elem);
      keys = afrous.lang.filter(keys, function(x) {
        return !/^(myCocktailName|myCocktailIcon)$/.test(x);
      });
      afrous.lang.forEach(
        this.getPropertyFields(),
        function (field) {
          field.store.loadData(
            afrous.lang.map(keys, function(k){ return [k, k] })
          ); 
        },
        this
      );
    }
  }
/*  ,

  generateInputs : function(field) {
    this.seletedField = field;
    var recordsField = afrous.lang.find(this.inputFields, function(f) {
      return f.getName()=='records';
    });
    this.processPanel.process.evaluate(
      recordsField.getValue(),
      this.generateSubObjects.createDelegate(this)
    );
  }
  ,

  generateSubObjects : function(result){
    var elem = null;
    if(afrous.lang.isArray(result.value))
      elem = result.value[0];
    else
      elem = result.value;
    elem = afrous.lang.cast('object', elem[this.seletedField.getValue()]);
    if (afrous.lang.isObject(elem)) {
      //var keys = afrous.lang.keys(elem);
      //var field = this.createBindField({ name : this.seletedField.getName()+"2",
      //                                            label : this.seletedField.getName()+"2",
      //                                            type : 'Object[]',
      //                                            options: keys});
      this.objectDialog = new ObjectInspectorDialog();
      this.objectDialog.setCallback(this.setFieldWithSubObject,this.seletedField);
      this.objectDialog.show(elem);
    }
  }
  ,

  setFieldWithSubObject: function(path){
    this.setValue(path);
  }*/

});

afrous.editor.widgets.register('Renderer.Plotr.Pie', PlotrWidget);
afrous.editor.widgets.register('Renderer.Plotr.Bar', PlotrWidget);
afrous.editor.widgets.register('Renderer.GoogleMaps.GoogleMapsMarker', PlotrWidget);
afrous.editor.widgets.register('Renderer.SmileWidgets.Timeline', PlotrWidget);
afrous.editor.widgets.register('Renderer.Widgets.ImagesWidget', PlotrWidget);
afrous.editor.widgets.register('Renderer.Widgets.TagCloudWidget', PlotrWidget);

})();

