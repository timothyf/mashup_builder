
/**
 * Basic Rendering Package
 */

(function() {
	
var basicRenderer = new mb.UnitActionPackage('Renderer.Basic', {
  label : 'Basic Renderers'
});


// ANCHOR LINK Renderer
basicRenderer.register(new mb.RenderingUnitAction({
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


// IMAGE Renderer
basicRenderer.register(new mb.RenderingUnitAction({
  type : 'Image',
  label : 'Image Renderer',
  description : 'Rendering image with given URL',
  iconCls : 'image-render-uaction',
  inputs : [
    { name : 'srcUrl',
      label : 'image src url',
      type : 'String' },
    { name : 'alt',
      label : 'alternate text',
      type : 'String' }
  ],

  render : function(params, el) {
    var srcUrl = params['srcUrl'] || '';
    var img = mb.dom.createElement({ 
      tagName : 'img', 
      src : srcUrl,
      alt : params['alt'] || srcUrl.replace(/.*\/([^\/]+)$/,'$1') 
    })
    el.appendChild(img);
  }

}));

// HTML Template Renderer
basicRenderer.register(new mb.UnitAction({
  type : 'HTMLTemplate',
  label : 'HTML Template Renderer',
  description : 'Generate HTML from template. Input properties can be refered and embedded by following notation<br/>#{<i>propname</i>}',
  iconCls : 'html-render-uaction',
  inputs : [
    { name : 'template',
      label : 'template',
      type : 'String',
      formElement : "TEXT_AREA" }
  ],
  allowDynamicInput : true,

  execute : function(request, callback) {
    var templateStr = request.params['template'];
    params = mb.lang.extend({}, request.params);
    delete params.template;
    var html = templateStr.replace(/#{([^}]+)}/g, function($1,$2) {
      var val;
      try { 
        with(params) eval('val = '+$2+';');
      } catch (e) {}
      if (typeof val != 'undefined') {
        if (mb.lang.isDOMNode(val)) {
          return mb.dom.toHTML(val);
        } else {
          var div = mb.dom.createElement();
          mb.dom.writeValue(div, val);
          return div.innerHTML;
        }
      } else {
        return '';
      }
    });
    callback.onSuccess(mb.dom.parseHTML(html));
  }
}));

// LIST Renderer
basicRenderer.register(new mb.RenderingUnitAction({
  type : 'List',
  label : 'List Renderer',
  description : 'Rendering array data in bullet list format',
  iconCls : 'list-render-uaction',
  inputs : [
    { name : 'array',
      label : 'array to render',
      type : 'Object[]' }
  ],

  render : function(params, el) {
    var _this = this;
    var ul = mb.dom.createElement({ tagName : 'ul' }) 
    var arr = params['array'];
    
    el.appendChild(ul);
    mb.lang.forEach(arr, function(val) {
      var li = mb.dom.createElement({ tagName : 'li' });
      ul.appendChild(li);
      mb.dom.writeValue(li, val);
    });
  } 

}));

// TABLE Renderer
basicRenderer.register(new mb.RenderingUnitAction({
  type : 'Table',
  label : 'Table Renderer',
  description : 'Rendering array data in table format',
  iconCls : 'table-render-uaction',
  inputs : [
    { name : 'array',
      label : 'array to render',
      type : 'Object[]' },
    { name : 'firstRowHeaders',
      label : 'Does the first row contain row headers?',
      type : 'String',
      formElement : "CHECK_BOX" }
  ],

  render : function(params, el) {
    var table = mb.dom.createElement({ tagName : 'table' }) 
	table.setAttribute('class', 'widget_table');
    var thead = mb.dom.createElement({ tagName : 'thead' }); 
    var tbody = mb.dom.createElement({ tagName : 'tbody' });  
    var dataRows = params['array'];
	
    var firstRowHeaders = false;
    firstRowHeaders = params['firstRowHeaders'] || false;
    if(firstRowHeaders == 'true')
      firstRowHeaders = true;
	
    var fields = {};
    mb.lang.forEach(dataRows, function(record) {
      mb.lang.forEach(mb.lang.keys(record), function(field) {
        fields[field] = true; 
      });
    });
    fields = mb.lang.keys(fields);

	if (!firstRowHeaders) {
	    mb.lang.forEach(fields, function(field) {
	      var th = mb.dom.createElement({ tagName : 'th' });
	      th.appendChild(document.createTextNode(field));
	      thead.appendChild(th);
	    });
	}
	else {
	    mb.lang.forEach(fields, function(field) {
	      var th = mb.dom.createElement({ tagName : 'th' });
	      th.appendChild(document.createTextNode(dataRows[0][field]));
	      thead.appendChild(th);
	    });
		dataRows = dataRows.slice(1);
	}

    var _this = this;
    mb.lang.forEach(dataRows, function(record) {
      var tr = mb.dom.createElement({ tagName : 'tr' });
      mb.lang.forEach(fields, function(field) {
        var val = record[field];
        var td = mb.dom.createElement({ tagName : 'td' });
        mb.dom.writeValue(td, val);
        tr.appendChild(td);
      })
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    el.appendChild(table);
  } 
}));

// TILE Renderer
basicRenderer.register(new mb.RenderingUnitAction({
  type : 'Tile',
  label : 'Tile Renderer',
  description : 'Rendering array data in tile',
  iconCls : 'tile-render-uaction',
  inputs : [
    { name : 'array',
      label : 'array to render',
      type : 'Object[]' },
    { name : 'column',
      label : '# of column',
      type : 'Integer' }
  ],

  render : function(params, el) {
    var table = mb.dom.createElement({ tagName : 'table', className : 'af-tile' }) 
    var tbody = mb.dom.createElement({ tagName : 'tbody' });   
    var arr = params['array'];
    var column = params['column'] || 4;
    var tr;
    for (var i=0; i<arr.length; i++) {
      if (i%column==0) {
        tr = mb.dom.createElement({ tagName : 'tr', className : 'af-tile-row' });
      }
      var td = mb.dom.createElement(
        { tagName : 'td', className : 'af-tile-cell af-col'+(i%column) });
      mb.dom.writeValue(td, arr[i]);
      tr.appendChild(td);
      if (i%column==column-1 || i==arr.length-1) {
        tbody.appendChild(tr);
      }
    }
    table.appendChild(tbody);
    el.appendChild(table);
  } 

}));

mb.packages.register(basicRenderer, 'basic-renders.js');

})();

