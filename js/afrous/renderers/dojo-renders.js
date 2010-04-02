
/**
 * Dojo Rendering Package
 * The renderes in this package use Dojo UI elements to create fancier UI elements for data.
 */

(function() {
	
var dojoRenderer = new afrous.UnitActionPackage('Renderer.Dojo', {
  label : 'Dojo Renderers'
});

dojoRenderer.register(new afrous.RenderingUnitAction({
  type : 'Link',
  label : 'Anchor Link',
  description : 'Rendering anchor link',
  iconCls : 'anchor-render-uaction',
  inputs : [
    { name : 'href',
      label : 'link url',
      type : 'String' },
    { name : 'title',
      label : 'title',
      type : 'String' },
    { name : 'content',
      label : 'link content',
      type : 'Object' }
  ],

  render : function(params, el) {
    var href = params['href'] || '#';
    var title = params['title'] || href;
    var anchor = mbuilder.dom.createElement({ 
      tagName : 'a', 
      href : href,
      title : title
    });
    var content = params['content'] || title; 
    el.appendChild(anchor);
    mbuilder.dom.writeValue(anchor, content);
  }
}))

afrous.packages.register(dojoRenderer, 'dojo-renders.js');

})()