/**
 * Afrous embed
 */

var afrous;
if (!afrous) afrous = {};

(function() {

afrous.embed = {

  renderProcessOutput : function(processID) {
    var proc;
    var viewport, panel;

    viewport = new Ext.Viewport({
      layout : 'fit',
      items : panel = new Ext.Panel({
        title : 'loading...',
        html : '&nbsp;',
        autoScroll : true,
        bbar : ['->', {
          text : 'Show Bookmarklet Link',
          handler : showBookmarkletLink
        }]
      })
    });

    afrous.processes.loadProcessConfig(processID, loadProcess);

    function showBookmarkletLink() {
      var size = viewport.getSize();
      var scriptURL = afrous.packages.scriptBaseURL + '/afrous-runproc.js?id='+processID+'&w='+size.width+'&h='+size.height;
      var script = "javascript:(function(u){var s=document.createElement('script');s.type='text/javascript';s.src=u;document.body.appendChild(s)})('"+scriptURL+"')";
      Ext.Msg.show({
        title : 'Boolmarklet link', 
        msg : '<div>Add following link to your browser\'s bookmark.</div>'+
              '<a href="'+script+'">'+ (proc ? proc.definition.name : 'Run Process') + '</a>',
        minWidth : 200
      })
    }

    function loadProcess(config) {
      var requires = config.requires || {};
      var scripts = afrous.lang.values(requires);
      loadLibraries(scripts);
      var namespaces = afrous.lang.keys(requires);
      afrous.packages.waitLoadComplete(
        namespaces,
        function() {
          startProcess(config)
        },
        function() {
          Ext.Msg.alert('Error', 'Error occurred while loading external javascript.');
        }.createDelegate(this)
      );
    }
 
    function loadLibraries(scripts, callback) {
      var xscripts = afrous.lang.filter(scripts, function(script) {
        return script.indexOf(afrous.packages.scriptBaseURL) != 0;
      })
      if (xscripts.length>0) {
        Ext.Msg.minWidth = 400;
        afrous.lang.delay(Ext.Msg.confirm, 1).call(Ext.Msg, 
          'Script security warning',
          '<div>These libraries are not provided from trusted host/domain. <br/>' + 
          '<ul><li><em>' + afrous.lang.map(xscripts, function(s) {
             return afrous.string.escapeHTML(s);
           }).join('</em></li><li><em>') + '</em></li></ul>' +
          'Are you sure to open this libraries ?</div>',
          function (btn) {
            if (btn=='yes') {
              _loadLibraries();
            }
          }
        );
      } else {
        _loadLibraries();
      }

      function _loadLibraries() {
        afrous.lang.forEach(scripts, function(script) { 
          afrous.packages.loadScript(script); 
        });
        if (typeof callback=='function') callback();
      }
    }

    function startProcess(config) {
      panel.setTitle(config.name);
      var procdef = new afrous.ProcessDef(config);
      proc = new afrous.ProcessInstance(procdef);
      if (config.params && config.params.length>0) {
        renderParams(config.params);
      } else {
        proc.start(renderProcessResult, showError); 
      }
    }

    function renderProcessResult(result) {
      panel.body.update('');
      if (afrous.lang.isDOMNode(result)) {
        renderDOM(result);
      } else if (result instanceof afrous.Renderer) {
        applyRenderer(result);
      } else {
        renderTree(result)
      }
    }

    function renderDOM(el) {
      panel.body.dom.appendChild(el); 
    }

    function applyRenderer(renderer) {
      renderer.render(panel.body.dom);
    }

    function renderTree(value) {
      var tree = new Ext.tree.TreePanel({
        el : panel.body,
        loader : new MemoryObjectLoader(),
        autoScroll : true
      });
      var root = new Ext.tree.AsyncTreeNode({
        text : 'Output',
        draggable : false,
        path : '',
        value : value
      });
      tree.setRootNode(root);
      panel.add(tree);
      tree.render();
      root.expand();
    }

    function showError(error) {
      afrous.debug.log(error);
    }

  }

}


var MemoryObjectLoader = function() {
  MemoryObjectLoader.superclass.constructor.apply(this, arguments);
}

Ext.extend(MemoryObjectLoader, Ext.tree.TreeLoader, {

  load : function(node, callback){
    if (this.clearOnLoad) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
    if (node.attributes.children) { // preloaded json children
      var cs = node.attributes.children;
      for (var i=0, len=cs.length; i<len; i++){
        node.appendChild(this.createNode(cs[i]));
      }
      if (typeof callback == "function") {
        callback();
      }
    } else {
      this.requestData(node, callback);
    }
  }
  ,

  requestData : function(node, callback){

    if (this.fireEvent("beforeload", this, node, callback) !== false) {
      var value = node.attributes.value;
      if (afrous.lang.isArrayLike(value)) {
        afrous.lang.forEach(value, function(val, i) {
          var n = this.createNode({
            name : '['+i+']',
            path : node.attributes.path + '['+i+']',
            value : val
          });
          if (n) node.appendChild(n);
        }, this);
      } else if (afrous.lang.isObject(value)) {
        afrous.lang.forEach(afrous.lang.keys(value), function(key) {
          if (afrous.lang.isSerializable(value[key])) {
            var p = node.attributes.path + (/^\w[\w\d]*$/.test(key) ? '.'+key : '["'+key+'"]');
            var n = this.createNode({
              name : key,
              path : p,
              value : value[key]
            });
            if (n) node.appendChild(n);
          }
        }, this);
      }

      if (typeof callback == "function"){
        callback(this, node);
      }

      this.fireEvent("load", this, node, null);

    } else {
      if (typeof callback == "function"){
        callback();
      }
    }
  }
  ,

  createNode : function(attr){

    // apply baseAttrs, nice idea Corey!
    if (this.baseAttrs){
      Ext.applyIf(attr, this.baseAttrs);
    }
 
    var value = attr.value;

    if (afrous.lang.isDOMNode(value) || value instanceof afrous.Renderer) {
      attr.text = attr.name;
      attr.leaf = true;
    } else if (afrous.lang.isPrintable(value)) {
      var str = afrous.string.escapeHTML(value.toString());
      str = str.length>100 ? str.substring(0, 100) + '...' : str;
      attr.text = attr.name + ' : ' + str;
      attr.leaf = true;
    } else {
      attr.text = attr.name;
    }

    attr.uiProvider = ObjectTreeNodeUI;

    return (attr.leaf ?
            new Ext.tree.TreeNode(attr) :
            new Ext.tree.AsyncTreeNode(attr));
  }


});


/**
 * @class ObjectTreeNodeUI
 * @extends Ext.tree.TreeNodeUI
 */
var ObjectTreeNodeUI = function() {
  ObjectTreeNodeUI.superclass.constructor.apply(this, arguments);
}

Ext.extend(ObjectTreeNodeUI, Ext.tree.TreeNodeUI, {

  render : function() {
    ObjectTreeNodeUI.superclass.render.apply(this, arguments);

    var value = this.node.attributes.value;
    if (afrous.lang.isDOMNode(value)) {
      var el = afrous.dom.createElement({ className : 'af-rendered' });
      el.appendChild(value);
      this.textNode.appendChild(el);
    } else if (value instanceof afrous.Renderer) {
      var renderer = this.node.attributes.value;
      var el = afrous.dom.createElement({ className : 'af-rendered' });
      this.textNode.appendChild(el);
      renderer.render(el);
    }
  }

});


})();
