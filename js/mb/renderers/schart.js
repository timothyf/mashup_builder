/**
 * SChart (simple chart) Renderer Package
 */

(function() {

var schart = new mb.UnitActionPackage('Renderer.Schart', {
  label : 'SChart Graph Renderer',
  setup : function(callback) {
    mb.packages.loadScript(mb.packages.scriptBaseURL + '/../swfobject.js');
    mb.lang.poll({
      work : function() { return window.SWFObject },
      interval : 1000,
      callback : callback
    });
  }
});


schart.register(new mb.RenderingUnitAction({
  type : 'Pie',
  label : 'Pie Chart',
  description : '',
  iconCls : 'chart-pie-uaction',
  inputs : [
    { name : 'records',
      label : 'input records',
      type : 'Object[]' },
    { name : 'labelField',
      label : 'label Field',
      type : 'String' },
    { name : 'valueField',
      label : 'value field',
      type : 'String' },
    { name : 'height',
      label : 'height',
      type : 'Integer' }
  ],


  render : function(params, el) {
    var records = params['records'];
    if (!records) return;
    var labelField = params['labelField'];
    alert(params['labelField']);
    var valueField = params['valueField'];
    alert(params['valueField']);
    var height = params['height'] || 200;

    var id = new Date().getTime();
    var div = mb.dom.createElement({
      id : '_swfwrapper_'+id,
      style : 'margin:0px;padding:0px;'
    });
    el.appendChild(div);
    var pieSwf = mb.packages.scriptBaseURL + '/renderers/schart/PieChartController.swf';
    var so = new SWFObject(pieSwf, '_swf_'+id, '100%', height, '9', '#FFFFFF');
    so.addParam("allowScriptAccess", "always");
    //so.addParam("wmode", "transparent");
    div.innerHTML = so.getSWFHTML();
    var pie = document.getElementById('_swf_'+id);
    (function() {
      if (!pie.draw) { setTimeout(arguments.callee, 500); return }
      pie.draw(mb.lang.map(records, function(record) {
        var val = mb.lang.isObject(record) ? record[valueField] : record;
        return { 
          label : record[labelField] || '', 
          value : mb.lang.cast('float', val) || 0 
        };
      }));
    })();
  }
}))


mb.packages.register(schart, 'schart.js');

})()

