/*  
 * Romulus Mashup Builder
 * 
 * David del Pozo González
 * Informática Gesfor
 */

(function() {

var DivWidget = function() {
  DivWidget.superclass.constructor.apply(this, arguments);
}

Ext.extend(DivWidget, afrous.editor.ActionWidget, {

  renderInputFields : function() {
    DivWidget.superclass.renderInputFields.apply(this, arguments);

    mbuilder.lang.forEach(
      this.getPropertyFields(),
      function (field) {
        field.store.removeAll();
        field.control.on('select', this.generateInputs, this);
      },
      this
    );
  }
  ,

  getPropertyFields : function() {
    return jQuery.grep(this.inputFields, function(f) {
      return /^(row|column)Field/.test(f.getName());
    });
  }
  ,

  getDivFields : function() {
    return jQuery.grep(this.inputFields, function(f) {
      return /^div[0-9]+/.test(f.getName());
    });
  }
  ,

  generateInputs : function() {
    var rowsField = mbuilder.lang.find(this.inputFields, function(f) {
      return f.getName()=='rowField';
    });
    var colsField = mbuilder.lang.find(this.inputFields, function(f) {
      return f.getName()=='columnField';
    });
    var cols  = colsField.getValue();
    var rows  = rowsField.getValue();
    var cells = cols * rows;
    
    mbuilder.lang.forEach(
      this.getDivFields(),
      function (field) {
        field.destroy();
      },
      this
    );  
    for(var i=1; i<=cells; i++)
    {
      this.createBindField({ name : 'div'+i,
                             label : 'div'+i,
                             type : 'Object' });   
    }
  }

});

afrous.editor.widgets.register('Renderer.AdvancedRenders.Div', DivWidget);

})();

