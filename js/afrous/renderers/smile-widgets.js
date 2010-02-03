/**
 * Timeline render
 *  
 * David del Pozo González
 * Informática Gesfor
 */

(function() {

var smileWidgets = new afrous.UnitActionPackage('Renderer.SmileWidgets', {
  label : 'Smile Widgets'
});

smileWidgets.register(new afrous.RenderingUnitAction({

  type : 'Timeline',
  label : 'Timeline',
  description : 'Timeline',
  iconCls : 'timeline-render-uaction',
  inputs : [
    { name : 'records',
      label : 'Input Records',
      type : 'Object[]' },
    { name : 'labelField',
      label : 'Label Field',
      type : 'String',
      options : [] },
    { name : 'initialDateField',
      label : 'Initial Date Field',
      type : 'String',
      options : [] },
    { name : 'finalDateField',
      label : 'Final Date Field',
      type : 'String',
      options : [] },
    { name : 'width',
      label : 'Width',
      type : 'Integer' },
    { name : 'height',
      label : 'Height',
      type : 'Integer' }
  ],

  render : function(params, el) {

    var records = params['records'];
    if (!records) 
      return;
    var labelField  = params['labelField'];
    var initialDate = params['initialDateField'];
    var finalDate   = params['finalDateField'];
    var width       = params['width'] || 500;
    var height      = params['height'] || 250;

    var events = [];
    afrous.lang.forEach(records, function(r, i) {
      var label = r[labelField] || i;
      var start = afrous.lang.cast('String', r[initialDate] || r);
      var end   = afrous.lang.cast('String', r[finalDate] || r);
      events.push({start:start, end:end, durationEvent:true, title: label})
    });

    var json={
      'dateTimeFormat': 'iso8601',
      'events': events
    }

    el.innerHTML = '<div id="my-timeline" style="border: 1px solid rgb(170, 170, 170); width:'+width+'px; height:'+height+'px;"></div>';

    var eventSource = new Timeline.DefaultEventSource();
    var bandInfos = [
      Timeline.createBandInfo({
         eventSource:    eventSource,
         date:           new Date(),
         width:          "70%",
         intervalUnit:   Timeline.DateTime.MONTH,
         intervalPixels: 100
      }),
      Timeline.createBandInfo({
         eventSource:    eventSource,
         date:           new Date(),
         width:          "30%",
         intervalUnit:   Timeline.DateTime.YEAR,
         intervalPixels: 200
      })
    ];
    bandInfos[1].syncWith = 0;
    bandInfos[1].highlight = true;

    Timeline.create(document.getElementById('my-timeline'), bandInfos);
    eventSource.loadJSON(json, document.location.href);
  }

}))

// if in afrous editor
if (afrous.editor) {
  afrous.packages.loadScript(afrous.packages.scriptBaseURL + '/renderers/plotr-afrous-widget.js');
}

afrous.packages.register(smileWidgets, 'smile-widgets.js');

})()

