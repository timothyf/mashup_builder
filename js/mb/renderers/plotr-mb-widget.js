(function() {

var PlotrWidget = function() {
  PlotrWidget.superclass.constructor.apply(this, arguments);
}

Ext.extend(PlotrWidget, mb.editor.ActionWidget, {

  renderInputFields : function() {
    PlotrWidget.superclass.renderInputFields.apply(this, arguments);

    mb.lang.forEach(
      this.getPropertyFields(),
      function (field) {
        field.store.removeAll();
        field.control.on('beforequery', this.suggestProperties, this);
        /*field.control.on('select',      this.generateInputs,    this);*/
      },
      this
    );
  },

  getPropertyFields : function() {
    return jQuery.grep(this.inputFields, function(f) {
      return /^(label|value|initialDate|finalDate|tagURL|tagName|tagSize|photoURL|photoLink)Field/.test(f.getName());
    });
  },

  suggestProperties : function() {
    var recordsField = mb.lang.find(this.inputFields, function(f) {
      return f.getName()=='records';
    });
    this.processPanel.process.evaluate(
      recordsField.getValue(),
      this.handleArrayResult.createDelegate(this)
    );
  },

  handleArrayResult : function(result) {
    var elem = mb.lang.cast('object[]', result.value)[0]
    if (mb.lang.isObject(elem)) {
      var keys = mb.lang.keys(elem);
      keys = jQuery.grep(keys, function(x) {
        return !/^(myCocktailName|myCocktailIcon)$/.test(x);
      });
      mb.lang.forEach(
        this.getPropertyFields(),
        function (field) {
          field.store.loadData(
            mb.lang.map(keys, function(k){ return [k, k] })
          ); 
        },
        this
      );
    }
  }
});

mb.editor.widgets.register('Renderer.Plotr.Pie', PlotrWidget);
mb.editor.widgets.register('Renderer.Plotr.Bar', PlotrWidget);
mb.editor.widgets.register('Renderer.GoogleMaps.GoogleMapsMarker', PlotrWidget);
mb.editor.widgets.register('Renderer.SmileWidgets.Timeline', PlotrWidget);
mb.editor.widgets.register('Renderer.SmileWidgets.Timeplot', PlotrWidget);
mb.editor.widgets.register('Renderer.Widgets.ImagesWidget', PlotrWidget);
mb.editor.widgets.register('Renderer.Widgets.TagCloudWidget', PlotrWidget);

})();

