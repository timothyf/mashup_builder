(function() {

var PlotrWidget = function() {
  PlotrWidget.superclass.constructor.apply(this, arguments);
}

Ext.extend(PlotrWidget, afrous.editor.ActionWidget, {

  renderInputFields : function() {
    PlotrWidget.superclass.renderInputFields.apply(this, arguments);

    mbuilder.lang.forEach(
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
    var recordsField = mbuilder.lang.find(this.inputFields, function(f) {
      return f.getName()=='records';
    });
    this.processPanel.process.evaluate(
      recordsField.getValue(),
      this.handleArrayResult.createDelegate(this)
    );
  },

  handleArrayResult : function(result) {
    var elem = mbuilder.lang.cast('object[]', result.value)[0]
    if (mbuilder.lang.isObject(elem)) {
      var keys = mbuilder.lang.keys(elem);
      keys = jQuery.grep(keys, function(x) {
        return !/^(myCocktailName|myCocktailIcon)$/.test(x);
      });
      mbuilder.lang.forEach(
        this.getPropertyFields(),
        function (field) {
          field.store.loadData(
            mbuilder.lang.map(keys, function(k){ return [k, k] })
          ); 
        },
        this
      );
    }
  }
});

afrous.editor.widgets.register('Renderer.Plotr.Pie', PlotrWidget);
afrous.editor.widgets.register('Renderer.Plotr.Bar', PlotrWidget);
afrous.editor.widgets.register('Renderer.GoogleMaps.GoogleMapsMarker', PlotrWidget);
afrous.editor.widgets.register('Renderer.SmileWidgets.Timeline', PlotrWidget);
afrous.editor.widgets.register('Renderer.SmileWidgets.Timeplot', PlotrWidget);
afrous.editor.widgets.register('Renderer.Widgets.ImagesWidget', PlotrWidget);
afrous.editor.widgets.register('Renderer.Widgets.TagCloudWidget', PlotrWidget);

})();

