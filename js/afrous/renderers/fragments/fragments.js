/**
 * Fragments Renderer Package
 *
 * Alberto Montero
 * Liferay
 */



(function() {

var fragmentsrenders = new afrous.UnitActionPackage('Renderer.FragmentRenders', {
  label : 'Fragment Renderers'
});

afrous.packages.loadScript(afrous.baseURL + '/js/jquery/jquery.js');
afrous.packages.loadScript(afrous.baseURL + '/js/afrous/renderers/fragments/portal-mashups.js');
afrous.packages.loadScript(afrous.baseURL + '/js/jquery/form.js');

fragmentsrenders.register(new afrous.RenderingUnitAction({
  type : 'Fragments',
  label : 'Fragments Renderer',
  description : 'Get the selected fragment and show it',
  inputs : [
    { name : 'source_url',
      label : 'Source URL',
      type : 'String',
      size : 'large'},
    { name : 'selector',
      label : 'Selector',
      type : 'String' },
    { name : 'rewrite_urls',
      label : 'Rewrite URLs',
      type : 'String',
      formElement : "CHECK_BOX" },
    { name : 'internal_url_filter',
      label : 'Internal URL filter',
      type : 'String'}
  ],

  render : function(params, el) {
    var source_url  = params['source_url'];
    var selector   = params['selector'];
    var rewrite_urls = params['rewrite_urls'];
    var internal_url_filter = params['internal_url_filter'];

	var destination_div_attr = {
	  tagName : 'div',
	  id : "fragment_render_" + Math.floor(10000 * Math.random())
    };
    var destination_div = mbuilder.dom.createElement(destination_div_attr);
    
	var options = {
	  rewriteURLs : rewrite_urls,
	  internalURLFilter : internal_url_filter
	};

    el.appendChild(destination_div);

	Romulus.PortalMashups.insert(source_url, selector, destination_div, options);
  }
}))

afrous.packages.register(fragmentsrenders, 'fragments.js');

})();
