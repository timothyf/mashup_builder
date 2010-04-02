/**
 * SChart (simple chart) Renderer Package
 */

(function() {

var schart = new afrous.UnitActionPackage('Renderer.Schart', {
  label : 'SChart Graph Renderer',
  setup : function(callback) {
    afrous.packages.loadScript(afrous.packages.scriptBaseURL + '/../swfobject.js');
    mbuilder.lang.poll({
      work : function() { return window.SWFObject },
      interval : 1000,
      callback : callback
    });
  }
});


schart.register(new afrous.RenderingUnitAction({

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
    var div = mbuilder.dom.createElement({
      id : '_swfwrapper_'+id,
      style : 'margin:0px;padding:0px;'
    });
    el.appendChild(div);
    var pieSwf = afrous.packages.scriptBaseURL + '/renderers/schart/PieChartController.swf';
    var so = new SWFObject(pieSwf, '_swf_'+id, '100%', height, '9', '#FFFFFF');
    so.addParam("allowScriptAccess", "always");
    //so.addParam("wmode", "transparent");
    div.innerHTML = so.getSWFHTML();
    var pie = document.getElementById('_swf_'+id);
    (function() {
      if (!pie.draw) { setTimeout(arguments.callee, 500); return }
      pie.draw(mbuilder.lang.map(records, function(record) {
        var val = mbuilder.lang.isObject(record) ? record[valueField] : record;
        return { 
          label : record[labelField] || '', 
          value : mbuilder.lang.cast('float', val) || 0 
        };
      }));
    })();
    
  }

}))


afrous.packages.register(schart, 'schart.js');


})()

