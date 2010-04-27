/**
 * Widgets
 *
 */

(function() {

var widgets = new mb.UnitActionPackage('Renderer.Widgets', {
  label : 'Widgets'
});

mb.packages.loadScript(mb.baseURL + '/js/swfobject.js');


widgets.register(new mb.RenderingUnitAction({

  type : 'TagCloudWidget',
  label : 'Tag Cloud Widget',
  description : 'Display tags in a sphere',
  iconCls : 'tag-cloud-render-uaction',
  inputs : [
    { name : 'records',
      label : 'Input Records',
      type : 'Object[]' },
    { name : 'tagURLField',
      label : 'Tag URL Field',
      type : 'String',
      options : [] },
    { name : 'tagNameField',
      label : 'Tag Name Field',
      type : 'String',
      options : [] },
    { name : 'tagSizeField',
      label : 'Tag Size Field',
      type : 'Integer',
      options : [] },
    { name : 'baseURL',
      label : 'Base URL',
      type : 'String' },
    { name : 'width',
      label : 'Width',
      type : 'Integer' },
    { name : 'height',
      label : 'Height',
      type : 'Integer' },
    { name : 'color',
      label : 'Background Color',
      type : 'String' },
    { name : 'textColor',
      label : 'Text Color',
      type : 'String' },
    { name : 'backgroundTrans',
      label : 'Background Transparency',
      type : 'String',
      formElement : "CHECK_BOX" }
  ],

  render : function(params, el) {
    var backgroundColor = params['color'] || '#FFFFFF';
    var width   = params['width']   || 300;
    var height  = params['height']  || 300;
    var baseURL = params['baseURL'] || '';
    var textColor = params['textColor'] || '0000ff';
    /*if(baseURL != '' && baseURL[baseURL.length-1] != '/')
      baseURL += '/';*/

    var backgroundTrans = false;
    backgroundTrans = params['backgroundTrans'] || false;
    if(backgroundTrans == 'true')
      backgroundTrans = true;

    var records      = params['records'];
    var tagURLField  = params['tagURLField']  || '';
    var tagNameField = params['tagNameField'] || '';
    var tagSizeField = params['tagSizeField'] || '';

    if(!records)
      return;
    var elemNum = records.length;

    var tag = "<tags>";
    mb.lang.forEach(records, function(r, i) {
      var tagURL  = baseURL+mb.lang.cast('String', r[tagURLField]  || r);
      var tagName = mb.lang.cast('String', r[tagNameField] || r);
      var tagSize = r[tagSizeField] || (8+elemNum--);
      tag += "<a href='"+tagURL+"' style='"+tagSize+"'>"+tagName+"</a>";
    });
    tag += "</tags>";

    var flashvar = {
        distr    : true,
        mode     : "tags",
        tcolor   : "0x"+textColor,
        hicolor  : "0x000000",
        tagcloud : tag 
    }

    var parameters = {
        movie   : mb.baseURL+'/swf/tagcloud.swf',
        bgcolor : backgroundColor
    }

    if (backgroundTrans)
        parameters.wmode = "transparent";

    var div = mb.dom.createElement({tagName: 'div', id : generateId()});
    el.appendChild(div);
    swfobject.embedSWF(mb.baseURL+'/swf/tagcloud.swf',
                       div.id,
                       width, height, "9.0.0",
                       mb.baseURL+'/swf/tagcloud.swf', flashvar, parameters, {});
  }

}))

widgets.register(new mb.RenderingUnitAction({

  type : 'NetvibesWidget',
  label : 'Netvibes Widget',
  description : 'Include a Netvibes widget',
  iconCls : 'netvibes-widget-render-uaction',
  inputs : [
    { name : 'widgetURL',
      label : 'Widget URL',
      type : 'String' }
  ],

  render : function(params, el) {
    var widgetURL = params['widgetURL'];
    var id = Math.floor(10000 * Math.random());

    mb.packages.loadScript("http://www.netvibes.com/js/UWA/Utils/IFrameMessaging.js");

    var msdHandlerName = "msgHandler" + id;
    var manageWidgetScript =
        "var " + msdHandlerName + " = function(message) {\
            var id = message.id;\
            switch (message.action) {\
            case 'resizeHeight':\
                var frame = document.getElementById('frame_'+ id);\
                if (frame) {\
                    frame.setAttribute('height', message.value);\
                }\
                break;\
            default:\
                break;\
            }\
        };\
        UWA.MessageHandler = new UWA.iFrameMessaging;\
        UWA.MessageHandler.init({\
            'eventHandler': " + msdHandlerName + ",\
            'trustedOrigin' : 'nvmodules.netvibes.com'\
        });";

    var manageWidgetScriptNode = mb.dom.createElement({tagName: 'script', type : "text/javascript"});
    manageWidgetScriptNode.appendChild(document.createTextNode(manageWidgetScript));
    el.appendChild(manageWidgetScriptNode);

    var ifproxyURL = encodeURI(mb.baseURL + '/js/mb/renderers/widgets/netvibes/proxy.html');
    var iFrameURL = "http://nvmodules.netvibes.com/widget/frame/" +
		"?uwaUrl=" + encodeURI(widgetURL) +
		"&id=" + encodeURI(id) +
		"&ifproxyUrl=" + ifproxyURL;

	var widgetIFrameNode = mb.dom.createElement({tagName : 'iframe', id : 'frame_' + id, frameborder : '0', scrolling : 'no', src: iFrameURL, width : '100%'});

	el.appendChild(widgetIFrameNode);
  }

}))

widgets.register(new mb.RenderingUnitAction({

  type : 'GoogleGadget',
  label : 'Google Gadget',
  description : 'Include a Google gadget',
  inputs : [
    { name : 'gadgetURL',
      label : 'Gadget URL',
      type : 'String' }
  ],

  render : function(params, el) {
    var gadgetURL = params['gadgetURL'];
    var gadgetAsJSURL = "http://gmodules.com/ig/ifr?url=" + encodeURI(gadgetURL) + "&synd=open&w=auto&title=&border=none&output=js";
  	var loadGadgetScriptNode = mb.dom.createElement({tagName: 'script', type : "text/javascript", src : gadgetAsJSURL});
   	el.appendChild(loadGadgetScriptNode);
//     var widgetIFrameNode = mb.dom.createElement({tagName : 'iframe', frameborder : '0', src: gadgetAsJSURL});
	el.appendChild(widgetIFrameNode); 
  }
}))

function generateId() {
  return 'flashDiv'+getRandomInt(0,5000)+'a'
                   +getRandomInt(0,5000)+'b'
                   +getRandomInt(0,5000)+'c'
                   +getRandomInt(0,5000);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// if in mb editor
if (mb.editor) {
  mb.packages.loadScript(mb.packages.scriptBaseURL + '/renderers/plotr-mb-widget.js');
}

mb.packages.register(widgets, 'widgets.js');

})()

