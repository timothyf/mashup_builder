/*  
  xpath scrape widget
 */

(function() {

var XPathScrapeWidget = function() {
  XPathScrapeWidget.superclass.constructor.apply(this, arguments);
}

Ext.extend(XPathScrapeWidget, mb.editor.ActionWidget, {
  renderInputFields : function() {
    this.inputToolbar.el.show();
    this.inputToolbar.addButton({
      text: 'Open XPath Selector',
      cls: 'x-btn-text-icon af-open-btn',
      handler: this.openXPathSelector.createDelegate(this)
    });
    XPathScrapeWidget.superclass.renderInputFields.apply(this, arguments);
  }
  ,
  openXPathSelector : function() {
    if (!this.xpathSelectorDialog) this.xpathSelectorDialog = new XPathSelectorDialog();
    var path = this.getInputValues()['path'];
    this.xpathSelectorDialog.path = path && path.length>0 ? path : null;
    this.xpathSelectorDialog.setCallback(this.handleXPathSelection, this);
    this.xpathSelectorDialog.show();
  }
  ,
  handleXPathSelection : function(params) {
    mb.lang.forEach(this.inputFields, function(field) {
      var name = field.getName()
      if (params[name]) field.setValue(params[name]);
    });
    this.handleChangeBinding();
  }
});

mb.editor.widgets.register('Scrape.XPath', XPathScrapeWidget);


/**
 * @class XPathSelectorDialog
 * @extends AbstractCallbackDialog
 */
var XPathSelectorDialog = function() {
  XPathSelectorDialog.superclass.constructor.call(this, { 
    title : 'XPath Selector',
    modal : true,
    width : (window.innerWidth || document.body.offsetWidth) - 100,
    height : (window.innerHeight || document.body.offsetHeight) - 100,
    shadow : true
  });
  this.addKeyListener(27, this.hide, this);
  this.selectBtn = this.addButton('Select', this.selectXPath, this);
  this.selectBtn.disable();
  this.setup();
}

Ext.extend(XPathSelectorDialog, mb.editor.AbstractCallbackDialog, {
  setup : function() {
    var size = this.body.getSize();
    this.iframeEl = this.body.createChild({ tag : 'iframe', style : 'width:'+(size.width-20)+'px;height:'+(size.height-110)+'px;'});
    this.iframeWrap = this.iframeEl.wrap({ style : 'text-align:center;margin:5px auto' });

    this.formEl = this.body.createChild({ style : 'margin:10px' });

    this.form = new Ext.form.Form({ labelWidth: 150 });
    this.form.add(
      this.cxpathInput = new Ext.form.TextField({
        fieldLabel : '(paragraph container)',
        width : size.width - 200
      }),
      this.xpathInput = new Ext.form.TextField({
        fieldLabel : 'paragraph',
        width : size.width - 200
      })
    );
    this.startBtn = this.form.addButton('Start Scrape', this.startScraping, this);
    this.clearBtn = this.form.addButton('Clear', this.clear, this);
    this.startBtn.disable();
    this.clearBtn.disable();
    this.form.render(this.formEl);
    this.cxpathInput.on('change', this.evalContainerPath, this);
    this.xpathInput.on('change', this.evalXPath, this);
  }
  ,
  show : function() {
    this.loadContent();
    return XPathSelectorDialog.superclass.show.apply(this);
  }
  ,
  loadContent : function() {
    this.iframeEl.dom.contentWindow.location.href = this.path || location.href;

    var _this = this;
    if ($.browser.msie) { // if IE
      this.iframeEl.on('readystatechange', function () {
        if (_this.iframeEl.dom.readyState == "complete") {
          _this.iframeEl.un('readystatechange', arguments.callee);
          _this.onContentReady();
        }
      });
    } else {
      this.iframeEl.on('load', function() {
        _this.iframeEl.un('load', arguments.callee);
        _this.onContentReady();
      })
    }
  }
  ,
  hide : function() {
    this.clearForm();
    return XPathSelectorDialog.superclass.hide.apply(this);
  }
  ,
  clear : function() {
    this.path = this.iframeEl.dom.contentWindow.location.href;
    this.clearForm();
    this.loadContent();
  }
  ,
  clearForm : function() {
    this.mode = 'init';
    this.cxpathInput.setValue('');
    this.xpathInput.setValue('');
    this.startBtn.disable();
    this.clearBtn.disable();
  }
  ,
  onContentReady : function() {
    this.startBtn.enable(); 
  }
  ,
  startScraping : function() {
    this.doc = this.iframeEl.dom.contentWindow.document;
    var scriptContainerElem = $(this.doc.documentElement).find('head,body').get(0);
    var script = this.doc.createElement('script');
    script.type = 'text/javascript';
    script.src = mb.packages.scriptBaseURL + '/../jsxpath/javascript-xpath.js';
    scriptContainerElem.appendChild(script);

    var _this = this;
    $(this.doc.body)
      .mouseover(function(e) { _this.handleMouseOver(e) })
      .mouseout(function(e) { _this.handleMouseOut(e) })
      .click(function(e) { _this.handleClick(e) });

    this.mode = 'select-container';
    this.startBtn.disable();
    this.clearBtn.enable();
    this.containerElem = null;
  }
  ,
  selectXPath : function() {
    this.callback.call(this.scope, {
      path : this.iframeEl.dom.contentWindow.location.href.replace(/^https?:\/\/[^\/]*/,''),
      xpath : this.xpathInput.getValue()
    }); 
    this.hide();
  }
  ,
  handleMouseOver : function(event) {
    switch (this.mode) {
      case 'select-container' :
        this.overrideStyle(event.target, { 
          borderColor : '#f00', 
          borderWidth : '1px', 
          borderStyle : 'solid' 
        });
      case 'select-paragraph' :
        if (this.isInContainer(event.target)) {
          this.overrideStyle(event.target, { 
            borderColor : '#f00', 
            borderWidth : '1px', 
            borderStyle : 'solid' 
          });
        }
        break;
      default :
        break;
    }
    event.preventDefault();
    event.stopPropagation();
  }
  ,
  handleMouseOut : function(event) {
    switch (this.mode) {
      case 'select-container' :
      case 'select-paragraph' :
        if (!$(event.target).hasClass(['ldrize-ide-container', 'ldrize-ide-paragraph'])) {
          this.restoreStyle(event.target);
        }
        break;
      default :
        break;
    }
    event.preventDefault();
    event.stopPropagation();
  } 
  ,
  handleClick : function(event) {
    switch (this.mode) {
      case 'select-container' :
        this.cxpathInput.setValue(this.calcXPath(event.target, null, true));
        this.evalContainerPath();
        break;
      case 'select-paragraph' :
        if (this.isInContainer(event.target)) {
          this.xpathInput.setValue(this.calcXPath(event.target));
          this.evalXPath();
        }
        break;
      default : 
        break;
    }
    event.preventDefault();
    event.stopPropagation();
  }
  ,
  overrideStyle : function(el, style) {
    if (!el) return;
    if (!el._styleCache) {
      el._styleCache = {
        backgroundColor : $(el).css('backgroundColor') || '',
        borderColor : $(el).css('borderColor') || '',
        borderStyle : $(el).css('borderStyle') || 'none',
        borderWidth : $(el).css('borderWidth') || 0
      };
    }
    $(el).css(style);
  }
  ,
  restoreStyle : function(el) {
    if (!el) return;
    if (el._styleCache) {
      var style = el._styleCache;
      if (style.backgroundColor=='transparent') style.backgroundColor = '';
      $(el).css(style);
      el._styleCache = undefined;
    }
  }
  ,
  isInContainer : function(el) {
    return $(el).parents().index(this.containerElem)>=0;
  }
  ,
  countMatchedNodes : function(xpath) {
    try {
      return this.doc.evaluate(xpath, this.doc, null, 7, null).snapshotLength;
    } catch (e) {
      return 0;
    }
  }
  ,
  getElementsByXPath : function(xpath) {
    var elements = [];
    try {
      var result = this.doc.evaluate(xpath, this.doc, null, 7, null);
      for (var i=0, len=result.snapshotLength; i<len; i++) {
        var n = result.snapshotItem(i);
        if (n.nodeType==1) elements.push(n);
      } 
    } catch (e) {}
    return elements;
  }
  ,
  calcXPath : function(el, childPath, single) {
    if (el==this.containerElem || el.nodeType==9) {
      return this.cxpathInput.getValue() + '/' + childPath;
    }
    var xpath = this.calcCompactXPath(el, single);
    if (childPath) xpath += '/'+childPath;
    xpath = xpath.replace(/\/\/+/g, '//');
    if (!single || this.countMatchedNodes(xpath)==1) {
      return xpath;
    } else {
      xpath = this.calcStrictXPath(el, single);
      if (childPath) xpath += '/'+childPath;
      return xpath.replace(/\/\/+/g, '//');
    }
  }
  ,
  calcCompactXPath : function(el, single) {
    var path;
    if (single && el.id) {
      return '//'+el.tagName.toLowerCase() + "[@id='" + el.id + "']";
    } else if (el.className) {
      var classes = 
        el.className.replace(/(^|\s*)af-xpath-(over|selected|container)(\s*|$)/g, ' ')
                    .replace(/^\s+|\s+$/g)
                    .split(/\s+/);
      var pred = $.map(classes, function(cls) {
        return "contains(concat(' ',@class,' '),' " + cls + " ')";
      }).join(' and ');
      path = el.tagName.toLowerCase() + "[" + pred + "]";
      if (!single || this.countMatchedNodes(this.cxpathInput.getValue()+'//'+path)==1) {
        return this.cxpathInput.getValue()+'//'+path;
      }
    } else {
      path = el.tagName.toLowerCase();
    }
    return this.calcXPath(el.parentNode, path, single);
  }
  ,
  calcStrictXPath : function(el, single) {
    var index = this.calcElementIndex(el);
    var path = el.tagName.toLowerCase() + (index ? '['+index+']' : '');
    return this.calcXPath(el.parentNode, path, single);
  }
  ,
  calcElementIndex : function(el) {
    if (!el.parentNode) return 0;
    var elements = $(el).parent().find('> '+el.tagName.toLowerCase());
    return elements.length>0 ? elements.index(el)+1 : 0;
  }
  ,
  clearSelection : function() {
    var dialog = this;
    $(this.doc.documentElement)
      .find('.ldrize-ide-mouseover')
        .removeClass('ldrize-ide-mouseover')
        .each(function(){ dialog.restoreStyle(this) })
      .end()
      .find('.ldrize-ide-container')
        .removeClass('ldrize-ide-container')
        .each(function(){ dialog.restoreStyle(this) })
      .end()
      .find('.ldrize-ide-paragraph')
        .removeClass('ldrize-ide-paragraph')
        .each(function(){ dialog.restoreStyle(this) })
      .end();
    this.containerElem = null;
    this.cxpathInput.setValue('');
    this.xpathInput.setValue('');
    this.mode = 'select-container';
  }
  ,
  evalContainerPath : function() {
    if (this.mode=='init') return;
    var dialog = this;
    $(this.doc.documentElement)
      .find('.ldrize-ide-container')
        .removeClass('ldrize-ide-container')
        .each(function(){ dialog.restoreStyle(this) })
      .end()
      .find('.ldrize-ide-paragraph')
        .removeClass('ldrize-ide-paragraph')
        .each(function(){ dialog.restoreStyle(this) })
      .end();
    var cxpath = this.cxpathInput.getValue();
    $(this.containerElem = this.getElementsByXPath(cxpath)[0])
      .addClass('ldrize-ide-container')
      .each(function(){ 
        dialog.overrideStyle(this, { 
          backgroundColor : '#ccccff', 
          borderWidth : '1px', 
          borderStyle : 'dotted', 
          borderColor : '#0000ff' 
        });
      });
    this.xpathInput.setValue('');
    this.mode = 'select-paragraph';
  }
  ,
  evalXPath : function() {
    if (this.mode=='init') return;
    var dialog = this;
    $(this.doc.documentElement)
      .find('.ldrize-ide-paragraph')
      .removeClass('ldrize-ide-paragraph')
      .each(function(){ dialog.restoreStyle(this) });
    var xpath = this.xpathInput.getValue();
    $(this.getElementsByXPath(xpath))
      .addClass('ldrize-ide-paragraph')
      .each(function(){ 
        dialog.overrideStyle(this, { 
          backgroundColor : '#ffcccc', 
          borderWidth : '1px', 
          borderStyle : 'dotted', 
          borderColor : '#ffaaaa' 
        });
      });
    this.mode = 'done';
    this.selectBtn.enable();
  }
});

})();
