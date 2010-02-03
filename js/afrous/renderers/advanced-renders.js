/**
 * Advanced Renderer Package
 * 
 * David del Pozo González
 * Informática Gesfor
 */

(function() {

var advancedrenders = new afrous.UnitActionPackage('Renderer.AdvancedRenders', {
  label : 'Advanced Renderers'
});

advancedrenders.register(new afrous.RenderingUnitAction({
  type : 'Text',
  label : 'Text Renderer',
  iconCls : 'text-render-uaction',
  description : 'Creates a text with the font selected',
  inputs : [
    { name : 'color',
      label : 'Color',
      type : 'String' },
    { name : 'size',
      label : 'Size',
      type : 'Integer' ,
      options : [1, 2, 3, 4, 5, 6, 7] },
    { name : 'bold',
      label : 'Bold',
      type : 'String',
      formElement : "CHECK_BOX" },
    { name : 'italic',
      label : 'Italic',
      type : 'String',
      formElement : "CHECK_BOX" },
    { name : 'text',
      label : 'Text',
      type : 'String' }
  ],

  render : function(params, el) {
    var color  = params['color'] || '#000000';
    var size   = params['size'] || 3;
    var italic = params['italic'];
    var bold   = params['bold'];
    var text   = params['text'] || '';
     
    var font = afrous.dom.createElement({tagName : 'font', color : color, size : size});
    el.appendChild(font);
    if(bold == 'true')
    {
      var strong = afrous.dom.createElement({tagName : 'strong'});
      font.appendChild(strong);
      font = strong;
    }
    if(italic == 'true')
    {
      var emphasis = afrous.dom.createElement({tagName : 'em'});
      font.appendChild(emphasis);
      font = emphasis;
    }
    afrous.dom.writeValue(font,  text);
  }
}));

var H1 = "h1";
var H2 = "h2";
var H3 = "h3";
var H4 = "h4";
var H5 = "h5";
var H6 = "h6";
var H7 = "h7";

advancedrenders.register(new afrous.RenderingUnitAction({
  type : 'Title',
  label : 'Title Renderer',
  iconCls : 'title-render-uaction',
  description : 'Creates a title',
  inputs : [
    { name : 'title',
      label : 'Title',
      type : 'String', 
      options : [H1, H2, H3, H4, H5, H6, H7] },
    { name : 'text',
      label : 'Text',
      type : 'String' }
  ],

  render : function(params, el) {
    var title = params['title'];
    var text  = params['text']
    
    var htitle = afrous.dom.createElement({tagName : title});
    el.appendChild(htitle);
    afrous.dom.writeValue(htitle,  text);
  }
}));

advancedrenders.register(new afrous.RenderingUnitAction({
  type : 'Div',
  label : 'Div Renderer',
  description : 'Creates a divs that contains another divs',
  iconCls : 'div-render-uaction',
  inputs : [
    { name : 'rowField',
      label : 'Rows',
      type : 'Integer',
      options : [1, 2, 3, 4],
      selected : 1 },
    { name : 'columnField',
      label : 'Columns',
      type : 'Integer' ,
      options : [1, 2, 3, 4],
      selected : 1 },
    { name : 'width',
      label : 'Width',
      type : 'Integer' },
    { name : 'height',
      label : 'Height',
      type : 'Integer' },
    { name : 'div1',
      label : 'div1',
      type : 'Object' }
  ],

  render : function(params, el) {
    var divsContent = [];
    
    var rows = params['rowField'];
    var cols = params['columnField'];
    
    var d = 1;
    while(params['div'+d])
    {
      divsContent.push(params['div'+d]);
      d++;
    }
    
    var width  = params['width']  || 500;
    var height = params['height'] || 500;
    
    var containerDiv = createDiv(width+'px',height+'px');
    el.appendChild(containerDiv);
    
    for(var r=0; r<rows; r++)
    {
      for(var c=0; c<cols; c++)
      {
        appendDiv(containerDiv, divsContent[r*cols+c], 100/cols+'%', 100/rows+'%', 'left');
      }
    }
  } 

}));

advancedrenders.register(new afrous.RenderingUnitAction({
  type : 'Div2x1',
  label : 'Div Renderer 2 x 1',
  description : 'Creates a divs that contains another divs',
  iconCls : 'div-render-uaction',
  inputs : [
    { name : 'width',
      label : 'Width',
      type : 'Integer' },
    { name : 'height',
      label : 'Height',
      type : 'Integer' },
    { name : 'div1',
      label : 'div1',
      type : 'Object' },
    { name : 'div2',
      label : 'div2',
      type : 'Object' }
  ],

  render : function(params, el) {
    var divContent1 = params['div1'];
    var divContent2 = params['div2'];
    
    var width  = params['width']  || 500;
    var height = params['height'] || 500;
    
    var containerDiv = createDiv(width+'px',height+'px');
    el.appendChild(containerDiv);
    
    appendDiv(containerDiv, divContent1, '100%', '50%', 'left');
    appendDiv(containerDiv, divContent2, '100%', '50%', 'left');
  } 

}));

advancedrenders.register(new afrous.RenderingUnitAction({
  type : 'Div1x2',
  label : 'Div Renderer 1 x 2',
  description : 'Creates a divs that contains another divs',
  iconCls : 'div-render-uaction',
  inputs : [
    { name : 'width',
      label : 'Width',
      type : 'Integer' },
    { name : 'height',
      label : 'Height',
      type : 'Integer' },
    { name : 'div1',
      label : 'div1',
      type : 'Object' },
    { name : 'div2',
      label : 'div2',
      type : 'Object' }
  ],

  render : function(params, el) {
    var divContent1 = params['div1'];
    var divContent2 = params['div2'];
    
    var width  = params['width']  || 500;
    var height = params['height'] || 500;
    
    var containerDiv = createDiv(width+'px',height+'px');
    el.appendChild(containerDiv);
    
    appendDiv(containerDiv, divContent1, '50%', '100%', 'left');
    appendDiv(containerDiv, divContent2, '50%', '100%', 'right');
  } 

}));

function appendDiv(containerDiv, content, width, height, floatt)
{
  var innerDiv = createDiv(width,height,floatt);
  containerDiv.appendChild(innerDiv);
  afrous.dom.writeValue(innerDiv,  content);
}
  
function createDiv(width, height, floatt)
{
  var _floatt = floatt || 'left';
  return afrous.dom.createElement({tagName : 'div', style : 'float: '+_floatt+';  height: '+height+';  width: '+width+';'});
}

// if in afrous editor
if (afrous.editor) {
  afrous.packages.loadScript(afrous.packages.scriptBaseURL + '/renderers/advanced-renders-widget.js');
}

afrous.packages.register(advancedrenders, 'advanced-renders.js');

})()

