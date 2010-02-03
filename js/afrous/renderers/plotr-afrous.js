/**
 * Plotr Renderer Package
 */

(function() {

var plotr = new afrous.UnitActionPackage('Renderer.Plotr', {
  label : 'Plotr Renderer'
});
 
plotr.register(new afrous.RenderingUnitAction({

  type : 'Pie',
  label : 'Pie Chart',
  description : 'Create Pie Chart from given records.',
  iconCls : 'chart-pie-uaction',
  inputs : [
    { name : 'records',
      label : 'input records',
      type : 'Object[]' },
    { name : 'labelField',
      label : 'label Field',
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

  render : function(params, el) {

    var records = params['records'];
    if (!records) return;
    var labelField = params['labelField'];
    var valueField = params['valueField'];
    var width = params['width'] || 500;
    var height = params['height'] || 200;
    var colorScheme = params['colorScheme'] || 'blue';

    var id = new Date().getTime();
    var iframe = afrous.dom.createElement({
      tagName : 'iframe',
      width : width,
      height : height,
      frameBorder : 0,
      allowTransparency : true,
      scrolling : 'no'
    });
    el.appendChild(iframe);
    if (iframe.contentWindow) {
      var doc = iframe.contentWindow.document;
      doc.open();
      renderPieChart(doc, records, width, height, labelField, valueField, colorScheme); 
      doc.close(); 
    }
  }

}))

function renderPieChart(doc, records, width, height, labelField, valueField, colorScheme) {

  var dataset = {};
  var xticks = [];
  afrous.lang.forEach(records, function(r, i) {
    var label = r[labelField] || i;
    if(afrous.lang.isObject(label))
    {
      if(label.myCocktailName)
        label = label.myCocktailName;
      else if(label.name)
        label = label.name;
      else if(label.title)
        label = label.title;
    }
    var seq = afrous.lang.map(
      afrous.lang.cast('float[]', r[valueField] || r),
      function(v, i) { return [i, v] } 
    );
    dataset[label] = seq;
    xticks.push({ v:i, label:label});
  })

  // Define options.
  var options = {
    colorScheme : colorScheme,
    axis : { labelColor : "#000000", x : { ticks : xticks } }, 
    background : { hide : true }
  };

  doc.write([
'<html>',
'<head>',
'<script type="text/javascript" ',
'        src="'+afrous.packages.scriptBaseURL+'/renderers/plotr/lib/prototype/prototype.js">',
'</script>',
'<script type="text/javascript" ',
'        src="'+afrous.packages.scriptBaseURL+'/renderers/plotr/lib/excanvas/excanvas.js">',
'</script>',
'<script type="text/javascript" ',
'        src="'+afrous.packages.scriptBaseURL+'/renderers/plotr/plotr_uncompressed.js">',
'</script>',
'<script type="text/javascript">',
'function render(dataset, options) {',
'  var pie = new Plotr.PieChart("pie", options);',
'  pie.addDataset(dataset);',
'  pie.render();',
'}',
'window.onload = function(){',
'  render('+afrous.lang.toJSON(dataset)+','+afrous.lang.toJSON(options)+');',
'}',
'</script>',
'</head>',
'<body style="margin:0px;padding:0px;background-color:transparent;">',
'<div><canvas id="pie" width="'+width+'" height="'+height+'" /></div>',
'</body>',
'</html>'
].join('\n'));

}


plotr.register(new afrous.RenderingUnitAction({

  type : 'Bar',
  label : 'Bar Chart',
  description : 'Create Bar chart from given record list.',
  iconCls : 'chart-bar-uaction',
  inputs : [
    { name : 'records',
      label : 'input records',
      type : 'Object[]' },
    { name : 'labelField',
      label : 'label field',
      type : 'String',
      options : [] },
    { name : 'valueField1',
      label : 'value field #1',
      type : 'String',
      options : [] },
    { name : 'valueField2',
      label : 'value field #2',
      type : 'String',
      options : [] },
    { name : 'valueField3',
      label : 'value field #3',
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

  render : function(params, el) {

    var records = params['records'];
    if (!records) return;
    var labelField = params['labelField'];
    var valueFields = [];
    for (var i=1; i<=3; i++) {
      if (params['valueField'+i]) valueFields.push(params['valueField'+i]);
      else break;
    }
    var width = params['width'] || 500;
    var height = params['height'] || 200;
    var colorScheme = params['colorScheme'] || 'blue';

    var id = new Date().getTime();
    var iframe = afrous.dom.createElement({
      tagName : 'iframe',
      width : width,
      height : height,
      frameBorder : 0,
      allowTransparency : true,
      scrolling : 'no'
    });
    el.appendChild(iframe);
    if (iframe.contentWindow) {
      var doc = iframe.contentWindow.document;
      doc.open();
      renderBarChart(doc, records, width, height, labelField, valueFields, colorScheme); 
      doc.close(); 
    }
  }

}))

function renderBarChart(doc, records, width, height, labelField, valueFields, colorScheme) {

  var x = {};
  x.ticks = afrous.lang.map(records, function(record, i) {
    var label = record[labelField]
    if(afrous.lang.isObject(label))
    {
      if(label.myCocktailName)
        label = label.myCocktailName;
      else if(label.name)
        label = label.name;
      else if(label.title)
        label = label.title;
    }
    return { v:i, label:label };
  });

  var dataset = {};
  afrous.lang.forEach(valueFields, function(valueField) {
    dataset[valueField] = afrous.lang.map(records, function(record, i) {
      return [ i, afrous.lang.cast('float', record[valueField]) ]; 
    });
  });

  // Define options.
  var options = {
    padding : { top : 10, right : 0, bottom : 30, left : 50 },
    colorScheme : colorScheme,
    axis : { labelColor : "#000000", x : x }, 
    background : { hide : true }
  };

  doc.write([
'<html>',
'<head>',
'<script type="text/javascript" ',
'        src="'+afrous.packages.scriptBaseURL+'/renderers/plotr/lib/prototype/prototype.js">',
'</script>',
'<script type="text/javascript" ',
'        src="'+afrous.packages.scriptBaseURL+'/renderers/plotr/lib/excanvas/excanvas.js">',
'</script>',
'<script type="text/javascript" ',
'        src="'+afrous.packages.scriptBaseURL+'/renderers/plotr/plotr_uncompressed.js">',
'</script>',
'<script type="text/javascript">',
'function render(dataset, options) {',
'  var bar = new Plotr.BarChart("bar", options);',
'  bar.addDataset(dataset);',
'  bar.render();',
'}',
'window.onload = function(){',
'  render('+afrous.lang.toJSON(dataset)+','+afrous.lang.toJSON(options)+');',
'}',
'</script>',
'</head>',
'<body style="margin:0px;padding:0px;background-color:transparent;">',
'<div><canvas id="bar" width="'+width+'" height="'+height+'" /></div>',
'</body>',
'</html>'
].join('\n'));

}


afrous.packages.register(plotr, 'plotr-afrous.js');


// if in afrous editor
if (afrous.editor) {
  afrous.packages.loadScript(afrous.packages.scriptBaseURL + '/renderers/plotr-afrous-widget.js');
}


})()

