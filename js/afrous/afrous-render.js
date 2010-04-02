
var RenderingUnitAction = mbuilder.lang.defineClass({

  _className : 'RenderingUnitAction',
  execute : function(/*ActionRequest*/request, /*Responder*/callback) {
    callback.onSuccess(new Renderer(this, request.params));
  }
  ,
  render : function(/*Hash object*/params, /*HTMLDomElement*/el) {
    // override me !
    el.innerHTML = '<h1>hello</h1>';
  }
}, UnitAction /* super class */);


var Renderer = mbuilder.lang.defineClass({

  _className : 'Renderer',
  initialize : function(/*RenderingUnitAction*/raction, /*Hash object*/params) {
    this.raction = raction;
    this.params = params;
  }
  ,
  render : function(/*HTMLDomElement*/el) {
    this.raction.render(this.params, el);
  }
});

afrous.RenderingUnitAction = RenderingUnitAction;
mbuilder.Renderer = Renderer;