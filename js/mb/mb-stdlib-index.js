(function() {

var p = mb.packages;
var u = p.scriptBaseURL;

// Load Service Adaptors
p.loadScript(u+'/services/politics.js');
p.loadScript(u+'/services/delicious.js');
p.loadScript(u+'/services/yahoo.js');
p.loadScript(u+'/services/google.js');
p.loadScript(u+'/services/flickr.js');
p.loadScript(u+'/services/twitter.js');
p.loadScript(u+'/services/rubymi.js');
p.loadScript(u+'/services/amazon.js');
p.loadScript(u+'/services/youtube.js');

// Load Render Adaptors
p.loadScript(u+'/renderers/basic-renders.js');
p.loadScript(u+'/renderers/advanced-renders.js');
p.loadScript(u+'/renderers/plotr-mb.js');
p.loadScript(u+'/renderers/schart.js');
p.loadScript(u+'/renderers/google-maps.js');
p.loadScript(u+'/renderers/smile-widgets.js');
p.loadScript(u+'/renderers/widgets.js');
p.loadScript(u+'/renderers/dojo-renders.js');

// Load Operator Adaptors
p.loadScript(u+'/operators/basic-operators.js');
p.loadScript(u+'/operators/array-operators.js');
p.loadScript(u+'/operators/string-operators.js');
p.loadScript(u+'/operators/ajax-operators.js');
p.loadScript(u+'/operators/mb-scrape.js');
p.loadScript(u+'/operators/date-operators.js'); 
p.loadScript(u+'/operators/atompub-operators.js');

})();
