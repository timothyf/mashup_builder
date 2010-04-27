
/**
 * Dojo Rendering Package
 * The renderes in this package use Dojo UI elements to create fancier UI elements for data.
 */

(function() {
	
var dojoRenderer = new mb.UnitActionPackage('Renderer.Dojo', {
  label : 'Dojo Renderers'
});

dojoRenderer.register(new mb.RenderingUnitAction({
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
    var anchor = mb.dom.createElement({ 
      tagName : 'a', 
      href : href,
      title : title
    });
    var content = params['content'] || title; 
    el.appendChild(anchor);
    mb.dom.writeValue(anchor, content);
  }
}))

mb.packages.register(dojoRenderer, 'dojo-renders.js');

})()