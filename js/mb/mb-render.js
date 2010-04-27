
var RenderingUnitAction = mb.lang.defineClass({

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


var Renderer = mb.lang.defineClass({

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

mb.RenderingUnitAction = RenderingUnitAction;
mb.Renderer = Renderer;