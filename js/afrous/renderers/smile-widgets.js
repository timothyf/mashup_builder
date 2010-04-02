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
  type : 'Timeplot',
  label : 'Timeplot',
  description : 'Linear graph',
  iconCls : 'timeline-render-uaction',
  inputs : [
    { name : 'records',
      label : 'input records',
      type : 'Object[]' },
    { name : 'labelField',
      label : 'Date field',
      type : 'String',
      options : [] },
    { name : 'valueField',
      label : 'value field',
      type : 'String',
      options : [] },
    { name : 'width',
      label : 'width',
      type : 'Integer' },
    { name : 'height',
      label : 'height',
      type : 'Integer' },
    { name : 'colorScheme',
      label : 'color scheme',
      type : 'String',
      options : [ 'blue', 'darkcyan', 'green', 'red', 'grey', 'black' ] }
  ],
  
  render: function(params, el){
    var records = params['records'];
    if (!records) return;
	var dateField = params['labelField'];
    var valueField = params['valueField'];
    var width = params['width'] || 500;
    var height = params['height'] || 200;
    var colorScheme = params['colorScheme'] || 'blue';
	
	var record_text = "";
	for (i=0; i<records.length; i++) {
		var tmp_str = records[i][dateField] + ',';
		tmp_str += records[i][valueField] + '\n';
		record_text = record_text + tmp_str;
	}	
	el.innerHTML = '<div id="my-timeplot" style="border: 1px solid rgb(170, 170, 170); width:'+width+'px; height:'+height+'px;"></div>';	
	var eventSource = new Timeplot.DefaultEventSource();
	var dataSource1 = new Timeplot.ColumnSource(eventSource,1);	
	var plotInfo = [
		Timeplot.createPlotInfo({
			id: "plot1",
			dataSource: dataSource1,
		    valueGeometry: new Timeplot.DefaultValueGeometry({
		    	gridColor: "#000000",
		        axisLabelsPlacement: "left",
		        min: 0,
		        max: 100
		    }),
      		timeGeometry: new Timeplot.DefaultTimeGeometry({
        		gridColor: "#000000",
        		axisLabelsPlacement: "top"
      		}),
			lineColor: colorScheme, //"#ff0000",
      		fillColor: colorScheme, //"#cc8080",
      		showValues: true
		})
	];	    
	timeplot = Timeplot.create(document.getElementById("my-timeplot"), plotInfo);
	eventSource.loadText(record_text, ",", document.location.href);
  }
}))
	
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
    mbuilder.lang.forEach(records, function(r, i) {
      var label = r[labelField] || i;
      var start = mbuilder.lang.cast('String', r[initialDate] || r);
      var end   = mbuilder.lang.cast('String', r[finalDate] || r);
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

