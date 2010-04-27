/**
 * HTML content scraping package
 */ 

(function() {

var jsxpathUrl = mb.packages.scriptBaseURL + '/../jsxpath/javascript-xpath.js';
var scrape = new mb.UnitActionPackage('Scrape');

scrape.register(new mb.UnitAction({
  type : 'XPath',
  label : 'XPath Scrape',
  description : 'Scrape HTML content using xpath expression',
  inputs : [
    { name : 'path',
      label : 'document path',
      type : 'String',
      size : 'large' },
    { name : 'xpath',
      label : 'xpath to scrape',
      type : 'String',
      size : 'large' }
  ],
  execute : function(request, callback) {
    var path = request.params['path'];
    var xpath = request.params['xpath'];
    mb.ajax.iframeRequest(path, function(res) {
      var doc = res.document;
      appendXPathLib(doc, function() {
        var elements = getElementsByXPath(doc, doc, xpath);
        elements = jQuery.map(elements, function(element) {
          return mb.dom.toObject(element, 10);
        });
        callback.onSuccess(elements);
        res.cleanup();
      });
    })
  }
}));

mb.packages.register(scrape, 'mb-scrape.js');

// if in mb editor
if (mb.editor) {
  mb.packages.loadScript(mb.packages.scriptBaseURL + '/mb-scrape-widget.js');
}


function appendXPathLib(doc, callback) {
  if (doc.evaluate) {
    callback();
    return;
  }

  var scriptContainerElem =
    (doc.getElementsByTagName('head')[0] || doc.getElementsByTagName('body')[0]);
  var script = doc.createElement('script');
  script.type = 'text/javascript';
  script.src = jsxpathUrl;
  scriptContainerElem.appendChild(script);

  mb.lang.poll({
    work : function() { return doc.evaluate },
    interval : 200,
    callback : callback
  });
}

function getElementsByXPath(doc, element, xpath) {
  var elements = [];
  try {
    var result = doc.evaluate(xpath, element, null, 7, null);
    for (var i=0, len=result.snapshotLength; i<len; i++) {
      var n = result.snapshotItem(i);
      elements.push(n);
    } 
  } catch (e) { }
  return elements;
}

})();
