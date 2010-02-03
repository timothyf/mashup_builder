/**
 * HTML content scraping package
 */ 

(function() {

var jsxpathUrl = afrous.packages.scriptBaseURL + '/../jsxpath/javascript-xpath.js';

var scrape = new afrous.UnitActionPackage('Scrape');

scrape.register(new afrous.UnitAction({
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
    afrous.ajax.iframeRequest(path, function(res) {
      var doc = res.document;
      appendXPathLib(doc, function() {
        var elements = getElementsByXPath(doc, doc, xpath);
        elements = afrous.lang.map(elements, function(element) {
          return afrous.dom.toObject(element, 10);
        });
        callback.onSuccess(elements);
        res.cleanup();
      });
    })
  }

}));

afrous.packages.register(scrape, 'afrous-scrape.js');

// if in afrous editor
if (afrous.editor) {
  afrous.packages.loadScript(afrous.packages.scriptBaseURL + '/afrous-scrape-widget.js');
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

  afrous.lang.poll({
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
