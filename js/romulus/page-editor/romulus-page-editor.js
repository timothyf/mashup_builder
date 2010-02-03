/*
 * MyCocktail Page Editor
 *
 * David del Pozo González
 * Informática Gesfor
 *
 */

var romulus;
if (!romulus)
  romulus = {};

var le;

(function() {

var HtmlElementCSS = defineClass({
  width : null,
  height : null,
  floatt : null,
  backgroundColor : null,
  textAlign: null,

  getCSS: function(htmlElement)
  {
    var el = htmlElement;
    if(!(el instanceof jQuery))
    {
      el = $("#"+htmlElement);
      if (el == null)
      {
        el = $("."+htmlElement);
        if (el == null)
        {
          el = $(htmlElement);
          if(el == null)
            return;
        }
      }
    }

    this.width     = el.css("width");
    this.height    = el.css("height");
    this.floatt    = el.css("float");
    this.margin    = el.css("margin");
    this.textAlign = el.css("text-align");
    this.backgroundColor = el.css("background-color");
  }
  ,

  toStyleFormat: function()
  {
    var style = "";
    if(this.width)
      style += 'width:'+this.width+';';
    if(this.height)
      style += 'height:'+this.height+';';
    if(this.floatt)
      style += 'float:'+this.floatt+';';
    if(this.backgroundColor)
      style += 'background-color:'+this.backgroundColor+';';
    if(this.margin)
      style += 'margin:'+this.margin+';';
    if(this.textAlign)
      style += 'text-align:'+this.textAlign+';';
    return style;
  }
  ,

  toJSON: function()
  {
    return {'width' : this.width,
            'height' : this.height,
            'float' : this.floatt,
            'margin' : this.margin,
            'background-color' : this.backgroundColor,
            'text-align' : this.textAlign};
  }
});


var RomulusPageEditor = defineClass({

  initialize : function() {

    this.createToolBar(Ext.get('editorToolBar'));

    this.editorsPanel = new EditorsPanel({
      id: 'editorsPanelView',
      region: 'center',
      titlebar: false,
      autoScroll: true,
      contentEl: 'divContainer'
    });

    var toolBarsLayout = [
      {
        region: 'north',
        height: 74,
        titlebar: false,
        contentEl: 'fckEditorToolbar'
      },
      {
        region: 'center',
        titlebar : false,
        contentEl: 'editorToolBar'
      }
    ];

    var editorLayout = [
      {
        id: 'toolBarsPanel',
        region: 'north',
        height: 100,
        titlebar: false,
        layout : 'border',
        items : toolBarsLayout
      },
      this.editorsPanel
    ];

    var viewport = new Ext.Viewport({
      layout:'border',
      items:[
        new Ext.Panel({
          region: 'north',
          split:false,
          titlebar: false,
          contentEl:'af-header'
        })
        ,
        {
          id: 'centerPanel',
          region: 'center',
          layout : 'border',
          items: editorLayout,
          titlebar : false
        }
        ,
        new Ext.Panel({
          region: 'south',
          baseCls: 'footer-panel',
          split:false,
          title: '&copy; 2008 - 2009 Inform&aacute;tica Gesfor',
          collapsible: false,
          animate: false
        })
      ]
    });

    new Ext.Button({
      text : 'About',
      handler : this.showAboutDialog,
      scope : this
    }).render('af-menubar');

    //for loading FCKEditor in Opera browser
    this.showEditor(this.editorsPanel.HEADER);
    this.hideEditor(this.editorsPanel.HEADER);
    for(var i=1; i<= this.editorsPanel.NUMBER_OF_EDITORS; i++)
    {
      this.showEditor(i);
      this.hideEditor(i);
    }
    this.showEditor(this.editorsPanel.FOOT);
    this.hideEditor(this.editorsPanel.FOOT);
    //for loading FCKEditor in Opera browser
  }
  ,

  createToolBar: function(el)
  {
    var _this = this;
    this.appToolbar = new Ext.Toolbar(el.createChild());
    this.appToolbar.add({
      text : 'Load',
      cls: 'x-btn-text-icon af-open-btn',
      handler : this.openPageFromLocal,
      scope : this
    });
    this.appToolbar.add({
      text : 'Save',
      cls: 'x-btn-text-icon af-save-btn',
      handler : this.save,
      scope : this
    });
    this.appToolbar.add({
      text : 'Preview',
      cls: 'x-btn-text-icon af-run-btn',
      handler : function(){_this.preview('text/html');},
      scope : this
    });
    this.appToolbar.add({
      text : 'Export HTML',
      cls: 'x-btn-text-icon af-html-btn',
      handler : this.exportAsHTML,
      scope : this
    });
    this.appToolbar.add('-');
    this.appToolbar.add({
      text : 'Layout',
      cls: 'x-btn-text-icon af-layout-btn',
      handler: this.showLayoutSelector,
      scope: this
    });
    var widthMenu = new Ext.menu.Menu({
      items : [
        { text : '100%',
          cls : 'x-menu-item af-js-btn',
          handler : function(){_this.setWidth('100%');},
          scope : this },
        { text : '1024px',
          cls : 'x-menu-item af-html-btn',
          handler : function(){_this.setWidth('1024px');},
          scope : this },
        { text : '800px',
          cls : 'x-menu-item af-html-btn',
          handler : function(){_this.setWidth('800px');},
          scope : this }
      ]
    });
    this.appToolbar.add({
      text : 'Width',
      cls: 'x-btn-text-icon af-width-btn',
      menu : widthMenu
    });
    var alignMenu = new Ext.menu.Menu({
      items : [
        { text : 'left',
          cls : 'x-menu-item af-align-left-btn',
          handler : function(){_this.alignPage('left');},
          scope : this },
        { text : 'center',
          cls : 'x-menu-item af-align-center-btn',
          handler : function(){_this.alignPage('center');},
          scope : this },
        { text : 'right',
          cls : 'x-menu-item af-align-right-btn',
          handler :function(){_this.alignPage('right');},
          scope : this }
      ]
    });
    this.appToolbar.add({
      text : 'Align',
      cls: 'x-btn-text-icon af-align-btn',
      menu : alignMenu
    });
    this.headerButton = this.appToolbar.addButton({
      text : 'Add header',
      cls: 'x-btn-text-icon af-layout-add-btn',
      handler : function(item){
        _this.showHeader(!_this.header);
      },
      scope : this
    });
    this.footButton = this.appToolbar.addButton({
      text : 'Add footer',
      cls: 'x-btn-text-icon af-layout-add-btn',
      handler : function(item){
        _this.showFoot(!_this.foot);
      },
      scope : this
    });
    var themeMenu = new Ext.menu.Menu({
      items : [
        { text : 'grey',
          cls : 'x-menu-item af-theme-grey-btn',
          handler : function(){_this.setCSSClass('grey');},
          scope : this },
        { text : 'blue grey',
          cls : 'x-menu-item af-theme-blue_grey-btn',
          handler : function(){_this.setCSSClass('blue_grey');},
          scope : this },
        { text : 'light turquoise blue',
          cls : 'x-menu-item af-theme-blue2-btn',
          handler : function(){_this.setCSSClass('blue2');},
          scope : this },
        { text : 'dark turquoise blue',
          cls : 'x-menu-item af-theme-blue1-btn',
          handler : function(){_this.setCSSClass('blue1');},
          scope : this },
        { text : 'blue',
          cls : 'x-menu-item af-theme-blue4-btn',
          handler : function(){_this.setCSSClass('blue4');},
          scope : this },
        { text : 'light blue',
          cls : 'x-menu-item af-theme-blue3-btn',
          handler : function(){_this.setCSSClass('blue3');},
          scope : this },
        { text : 'dark blue',
          cls : 'x-menu-item af-theme-blue5-btn',
          handler : function(){_this.setCSSClass('blue5');},
          scope : this },
        { text : 'eu blue',
          cls : 'x-menu-item af-theme-eu-btn',
          handler : function(){_this.setCSSClass('eu');},
          scope : this },
        { text : 'dark green',
          cls : 'x-menu-item af-theme-green5-btn',
          handler : function(){_this.setCSSClass('green5');},
          scope : this },
        { text : 'light green',
          cls : 'x-menu-item af-theme-green3-btn',
          handler : function(){_this.setCSSClass('green3');},
          scope : this },
        { text : 'olive green',
          cls : 'x-menu-item af-theme-green4-btn',
          handler : function(){_this.setCSSClass('green4');},
          scope : this },
        { text : 'dark green yellow',
          cls : 'x-menu-item af-theme-green2-btn',
          handler : function(){_this.setCSSClass('green2');},
          scope : this },
        { text : 'light green yellow',
          cls : 'x-menu-item af-theme-green1-btn',
          handler : function(){_this.setCSSClass('green1');},
          scope : this },
        { text : 'light orange',
          cls : 'x-menu-item af-theme-orange1-btn',
          handler : function(){_this.setCSSClass('orange1');},
          scope : this },
        { text : 'dark orange',
          cls : 'x-menu-item af-theme-orange2-btn',
          handler : function(){_this.setCSSClass('orange2');},
          scope : this },
        { text : 'dark red',
          cls : 'x-menu-item af-theme-red2-btn',
          handler : function(){_this.setCSSClass('red2');},
          scope : this },
        { text : 'light red',
          cls : 'x-menu-item af-theme-red1-btn',
          handler : function(){_this.setCSSClass('red1');},
          scope : this },
        { text : 'pink',
          cls : 'x-menu-item af-theme-pink-btn',
          handler : function(){_this.setCSSClass('pink');},
          scope : this }
      ]
    });
    this.appToolbar.add({
      text : 'Theme',
      cls: 'x-btn-text-icon af-theme-btn',
      menu : themeMenu
    });
    this.appToolbar.add('-');
    this.appToolbar.add({
      text : 'Add Mashup',
      cls: 'x-btn-text-icon af-mashup-btn',
      handler : this.openProcessFromServer,
      scope : this
    });
    this.appToolbar.add({
      text : 'New Mashup',
      cls: 'x-btn-text-icon af-new-mashup-btn',
      handler : this.createNewProcess,
      scope : this
    });
  }
  ,

  initializeWhenEditorsAreLoaded : function(el) {
      var initialCfg = {"divs":[
                                  {"name":"Header",
                                   "typeOfContent":"text",
                                   "content":"<h1 style=\"text-align: center;\">TITLE</h1>",
                                   "css":{"width":"1024px","height":"100px","float":"left","margin":""}},
                                  {"name":1,
                                    "typeOfContent":"text",
                                    "content":"<h2>Text 1</h2>","css":{}},
                                  {"name":2,"typeOfContent":"text",
                                    "content":"<h2>Text 2</h2>",
                                    "css":{}},
                                  {"name":"Foot","typeOfContent":"text",
                                    "content":"<h3>&copy;&nbsp;2009</h3>",
                                    "css":{"width":"1024px","height":"100px","float":"left","margin":""}}],
                        "container":{"layout":"2","width":"1024px","align":"center","class":"blue1"}};
      this.loadJson(initialCfg);

//    this.editorsPanel.change('2', []);
  }
  ,

  registerEditor : function(editorInstance){
    this.editorsPanel.registerEditor(editorInstance);
  }
  ,

  setWidth: function(value){
    this.editorsPanel.setWidth(value);
  }
  ,

  alignPage: function(value){
    this.editorsPanel.alignPage(value);
  }
  ,

  change: function(value){
    this.editorsPanel.change(value);
  }
  ,

  composePage: function()
  {
    var script = [];
    var divs   = [];
    var text = null;
    var css  = null;
    var mashupTitle = null;
    var mashupId = null;
    var _this = this;
    //Head
    var edtContainer = this.editorsPanel.divs[this.editorsPanel.HEADER];
    if(edtContainer.isVisible())
    {
      text = "";
      mashupTitle = "";
      if(edtContainer.containsMashup())
      {
        mashupId    = edtContainer.getMashupId();
        if(edtContainer.getMashupTitle() && edtContainer.getMashupTitle() != '')
          mashupTitle = '<h2>'+edtContainer.getMashupTitle()+'</h2>';
        script.push('  '+_this.getMashupBuilderJS(mashupId, edtContainer.getName()));
      }
      else
      {
        text = edtContainer.getTextFromEditor();
      }
      css  = edtContainer.getCSS();
      divs.push('    <div id="'+edtContainer.getName()+'" style="'+css.toStyleFormat()+'"><div class="internal">'+mashupTitle+'<div id="'+edtContainer.getName()+'Mashup">'+text+'</div></div></div>');
    }
    //Layout
    for(var i=1; i<= this.editorsPanel.NUMBER_OF_EDITORS; i++)
    {
      edtContainer = this.editorsPanel.divs[i];
      if(edtContainer.isVisible())
      {
        text = "";
        mashupTitle = "";
        if(edtContainer.containsMashup())
        {
          mashupId    = edtContainer.getMashupId();
          if(edtContainer.getMashupTitle() && edtContainer.getMashupTitle() != '')
            mashupTitle = '<h2>'+edtContainer.getMashupTitle()+'</h2>';
          script.push('  '+_this.getMashupBuilderJS(mashupId, edtContainer.getName()));
        }
        else
        {
          text = edtContainer.getTextFromEditor();
        }
        css  = edtContainer.getCSS();
        divs.push('    <div id="'+edtContainer.getName()+'" style="'+css.toStyleFormat()+'"><div class="internal">'+mashupTitle+'<div id="'+edtContainer.getName()+'Mashup">'+text+'</div></div></div>');
      }
    }
    //Foot
    edtContainer = this.editorsPanel.divs[this.editorsPanel.FOOT];
    if(edtContainer.isVisible())
    {
      text = "";
      mashupTitle = "";
      if(edtContainer.containsMashup())
      {
        mashupId    = edtContainer.getMashupId();
        if(edtContainer.getMashupTitle() && edtContainer.getMashupTitle() != '')
          mashupTitle = '<h2>'+edtContainer.getMashupTitle()+'</h2>';
        script.push('  '+_this.getMashupBuilderJS(mashupId, edtContainer.getName()));
      }
      else
      {
        text = edtContainer.getTextFromEditor();
      }
      css  = edtContainer.getCSS();
      divs.push('    <div id="'+edtContainer.getName()+'" style="'+css.toStyleFormat()+'"><div class="internal">'+mashupTitle+'<div id="'+edtContainer.getName()+'Mashup">'+text+'</div></div></div>');
    }

    var buf = [];
    buf.push('<html>');
    buf.push('<head>');
    buf.push('<title>MyCocktail Page Editor - HTML Example</title>');
    buf.push('<link type="text/css" rel="stylesheet" href="'+afrous.baseURL+'/css/themes.css"></link>');
    buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/js/afrous/afrous-config.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/js/afrous/afrous-core.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/js/afrous/afrous-package.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/js/romulus/page-editor/mashup-displayer.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/smile-widgets/timeline/timeline_js/timeline-config.js"></script>');
    buf.push('<script type="text/javascript" src="'+afrous.baseURL+'/smile-widgets/timeline/timeline_js/timeline-api.js"></script>');
    buf.push('<script type="text/javascript">');
    buf.push('function launchMashups(){');
    buf.push(script.join("\n"));
    buf.push('}');
    buf.push('</script>');
    buf.push('</head>');
    buf.push('<body onload="launchMashups();" style="text-align:'+$('#centerPanel').css('text-align')+';">');
    buf.push('  <div id="divContainer" class="'+this.editorsPanel.getCSSClass()+' innerDiv" style="'+this.editorsPanel.getCSS().toStyleFormat()+'">');
    buf.push(divs.join("\n"));
    buf.push('  </div>');
    buf.push('</body>');
    buf.push('</html>');
    return buf.join("\n");
  }
  ,

  preview : function(content)
  {
    var msgWindow = window.open("","","width=1050,height=600,scrollbars=yes,centerscreen=yes,menubar=no,location=no");
    var doc = msgWindow.document;

    var html = this.composePage();

    doc.open(content, "replace");
    doc.write(html);
    doc.close();
  }
  ,

  exportAsHTML: function()
  {
    var win = new WindowPE('Page exported as HTML','Please copy the text below and save as a HTML file', this.composePage());
    win.show();
  }
  ,

  openPageFromLocal : function() {
    Ext.MessageBox.prompt(
      'Load Page',
      'Please paste page config here.',
      this.load,
      this,
      true
    );
  }
  ,

  load: function(btn, jsonTxt)
  {
    if (btn!='ok')
      return;

    var json = afrous.lang.parseJSON(jsonTxt);
    this.loadJson(json);
  }
  ,

  loadJson: function(json)
  {
    this.editorsPanel.divs[this.editorsPanel.HEADER].hideEditor();
    for(var i=1; i<=this.editorsPanel.NUMBER_OF_EDITORS; i++)
      this.editorsPanel.divs[i].hideEditor();
    this.editorsPanel.divs[this.editorsPanel.FOOT].hideEditor();

    var container = json['container'];
    if(container)
    {
      var align  = container['align'];
      var layout = container['layout'];
      var width  = container['width'];

      this.editorsPanel.change(layout);
      this.editorsPanel.setWidth(width);
      this.editorsPanel.alignPage(align);
    }

    var _this = this;
    for(var i=0; i<json['divs'].length; i++)
    {
      var divJson = json['divs'][i];
      var edtContainer = _this.editorsPanel.divs[divJson['name']];
      if(edtContainer != null)
      {
        if(divJson['typeOfContent'] == 'mashup')
        {
          edtContainer.addMashup(divJson['content']);
        }
        else
        {
          edtContainer.setTextInEditor(divJson['content']);
        }

        if(divJson['name'] == 'Header')
          this.showHeader(true);
        else if(divJson['name'] == 'Foot')
          this.showFoot(true);
        else
          edtContainer.showEditor();
      }
    }

    for(var i=0; i<json['divs'].length; i++)
    {
      var divJson = json['divs'][i];
      var edtContainer = _this.editorsPanel.divs[divJson['name']];
      if(edtContainer != null)
        edtContainer.css(divJson['css']);
    }

    if(container)
    {
      var clazz = container['class'];
      if(clazz)
        this.setCSSClass(clazz);
    }
  }
  ,

  save: function()
  {
    var divs = [];

    var edtContainer = this.editorsPanel.divs[this.editorsPanel.HEADER];
    if(edtContainer.isVisible())
    {
      divs.push({name: edtContainer.getDivName(), typeOfContent: 'text', content: edtContainer.getTextFromEditor(), css: edtContainer.getCSS().toJSON()});
    }
    //Layout
    for(var i=1; i<= this.editorsPanel.NUMBER_OF_EDITORS; i++)
    {
      var edtContainer = this.editorsPanel.divs[i];
      if(edtContainer.isVisible())
      {
        if(edtContainer.containsMashup())
        {
          divs.push({name: edtContainer.getDivName(), typeOfContent: 'mashup', content: edtContainer.getMashupId(), css: {}});
        }
        else
        {
          divs.push({name: edtContainer.getDivName(), typeOfContent: 'text', content: edtContainer.getTextFromEditor(), css: {}});
        }
      }
    }
    //Foot
    edtContainer = this.editorsPanel.divs[this.editorsPanel.FOOT];
    if(edtContainer.isVisible())
    {
      divs.push({name: edtContainer.getDivName(), typeOfContent: 'text', content: edtContainer.getTextFromEditor(), css: edtContainer.getCSS().toJSON()});
    }

    var json = {'divs' : divs, 'container' : this.editorsPanel.getConfig() };

    var win = new WindowPE('Save Page','Please copy the text below and save as a file', afrous.lang.toJSON(json));
    win.show();
  }
  ,

  getMashupBuilderJS: function(json,divName){
    return 'romulus.mashupsDisplayer.loadMashup("'+json+'","'+divName+'Mashup");';
  }
  ,

  showEditor: function(value)
  {
      this.editorsPanel.showEditor(value);
  }
  ,

  hideEditor: function(value)
  {
      this.editorsPanel.hideEditor(value);
  }
  ,

  showHeader: function(value)
  {
    this.header = value;
    if(value)
      this.showEditor(this.editorsPanel.HEADER);
    else
      this.hideEditor(this.editorsPanel.HEADER);
    if(!value)
    {
      this.headerButton.setText("Add header");
      this.headerButton.setIconClass('x-btn-text-icon af-layout-add-btn');
    }
    else
    {
      this.headerButton.setText("Remove header");
      this.headerButton.setIconClass('x-btn-text-icon af-layout-remove-btn');
    }
  }
  ,

  showFoot: function(value)
  {
    this.foot = value;
    if(value)
      this.showEditor(this.editorsPanel.FOOT);
    else
      this.hideEditor(this.editorsPanel.FOOT);
    if(!value)
    {
      this.footButton.setText("Add footer");
      this.footButton.setIconClass('x-btn-text-icon af-layout-add-btn');
    }
    else
    {
      this.footButton.setText("Remove footer");
      this.footButton.setIconClass('x-btn-text-icon af-layout-remove-btn');
    }
  }
  ,

  setCSSClass: function(value)
  {
    this.cssClass = value;
    this.editorsPanel.setCSSClass(value);
  }
  ,

  addMashup: function(mashupId)
  {
    this.editorsPanel.addMashup(mashupId);
  }
  ,

  openProcessFromServer : function() {
    if (!this.openDialog) {
      this.openDialog = new OpenProcessDialog();
      this.openDialog.setCallback(function(mashupId) {
        if (mashupId) this.editorsPanel.addMashup(mashupId);
      }, this);
    }
    this.openDialog.show();
  }
  ,

  createNewProcess : function(){
    window.open(afrous.baseURL);
  }
  ,

  showLayoutSelector: function(){
    this.layoutSelectorWindow = new LayoutSelectorWindow();
    this.layoutSelectorWindow.show();
  }
  ,

  showAboutDialog : function() {
    var aboutDialog = new Ext.Window({
      title : 'About',
      modal : true,
      width : 550,
      height : 435,
      resizable : false,
      html : '<iframe src="./about.html" frameborder="0" name="aboutDialog" width="100%" height="100%" />'
    });
    aboutDialog.show();
  }
});


var LayoutSelectorWindow = function() {

  var catalog = [{
    title: 'Layouts',
    samples: [{
        text: '1x2',
        option: '1',
        iconCls: 'layout-1x2',
        desc: 'One row with two columns'
    },{
        text: '2x1',
        option: '2',
        iconCls: 'layout-2x1',
        desc: 'Two rows and one column'
    },{
        text: '1x2 + 1x1',
        option: '3',
        iconCls: 'layout-1x2-1x1',
        desc: 'One row with two columns and another one with only one cell'
    },{
        text: '1x1',
        option: '4',
        iconCls: 'layout-1x1',
        desc: 'Only one cell'
    },{
        text: '1x3',
        option: '5',
        iconCls: 'layout-1x3',
        desc: 'One row with three columns'
    },{
        text: '2x2',
        option: '6',
        iconCls: 'layout-2x2',
        desc: 'Two rows with two columns'
    },{
        text: '1x3 + 1x1',
        option: '7',
        iconCls: 'layout-1x3-1x1',
        desc: 'One row with three columns and another one with only one cell'
    },{
        text: '1x3 + 1x2',
        option: '8',
        iconCls: 'layout-1x3-1x2',
        desc: 'One row with three columns and another one with two columns'
    },{
        text: '2x3',
        option: '9',
        iconCls: 'layout-2x3',
        desc: 'Two rows with 3 columns each one'
    }]
  }];

  for(var i = 0, c; c = catalog[i]; i++){
      c.id = 'sample-' + i;
  }

  var store = new Ext.data.JsonStore({
      idProperty: 'id',
      fields: ['id', 'title', 'samples'],
      data: catalog
  });

  var _this = this;
  var LayoutsPanel = Ext.extend(Ext.DataView, {
    autoHeight: true,
    frame:true,
    cls:'demos',
    itemSelector: 'dd',
    overClass: 'over',

    tpl : new Ext.XTemplate(
      '<div id="sample-ct">',
          '<tpl for=".">',
          '<div><a name="{id}"></a><h2><div>{title}</div></h2>',
          '<dl>',
              '<tpl for="samples">',
                  '<dd ext:option="{option}"><img class="{iconCls}" src="./extjs/resources/images/aero/s.gif"/>',
                      '<div><h4>{text}</h4><p>{desc}</p></div>',
                  '</dd>',
              '</tpl>',
          '<div style="clear:left"></div></dl></div>',
          '</tpl>',
      '</div>'
    ),

    onClick : function(e){
      var group = e.getTarget('h2', 3, true);
      if(group){
        group.up('div').toggleClass('collapsed');
      }else {
          var t = e.getTarget('dd', 5, true);
          if(t && !e.getTarget('a', 2)){
              var option = t.getAttributeNS('ext', 'option');
              le.change(option);
              LayoutSelectorWindow.superclass.hide.apply(_this);
          }
      }
      return LayoutsPanel.superclass.onClick.apply(this, arguments);
    }
  });

  Ext.get('layouts').dom.innerHTML = '<div id="all-demos"></div>';
  new LayoutsPanel({
    store: store
  }).render('all-demos');

  LayoutSelectorWindow.superclass.constructor.call(this,{
    title : 'Select a layout',
    modal : true,
    width : 700,
    height : 420,
    resizable : false,
    shadow : true,
    layout: 'border',
    keys: [{
      key: 27,
      fn: this.hide,
      scope: this
    }],
    items: [{
      autoScroll : true,
      region: 'center',
      contentEl: 'all-demos'
    }]
  });
}


Ext.extend(LayoutSelectorWindow,Ext.Window);


var WindowPE = function(title, textLabel, textAreaValue, okHandler) {
  var _this = this;

  WindowPE.superclass.constructor.call(this, {
    minimizable: false,
    title: title,
    layout : 'fit',
    width: 600,
     height: 300,
    items : new Ext.Panel({
      width: 600,
      height: 300,
      layout : 'border',
      items: [{
        baseCls : '',
        margins  : '5 3 3 3',
        cmargins : '5 3 3 3',
        region: 'north',
        html: textLabel
      }
      ,
      {
        margins  : '3 3 3 3',
        cmargins : '3 3 3 3',
        region: 'center',
        xtype:'textarea',
        anchor:'95%',
        value: textAreaValue
      }],
      keys: [{
        key: 27,  // hide on Esc
        fn: this.destroy
      }]
    })
  });

  this.closeBtn = this.addButton('Close', this.hide, this);
}

Ext.extend(WindowPE, Ext.Window, {

  hide: function()
  {
    WindowPE.superclass.hide.apply(this);
  }
  ,
  show: function()
  {
    WindowPE.superclass.show.apply(this);
  }
});


/**
 * @class OpenProcessDialog
 * @extends AbstractCallbackDialog
 */
var OpenProcessDialog = function() {

  this.setup();

  OpenProcessDialog.superclass.constructor.call(this, {
    title : 'Add Mashup',
    modal : true,
    width : 600,
    height : 380,
    resizable : false,
    shadow : true,
    closeAction : 'hide',
    keys: [{
      key: 27,
      fn: this.hide,
      scope: this
    }],
    items: [
      this.grid
    ]
  });

  this.openBtn = this.addButton('Open', this.handleOpen, this);
  this.closeBtn = this.addButton('Close', this.hide, this);
}

Ext.extend(OpenProcessDialog, Ext.Window, {

  setCallback : function(callback, scope) {
    this.callback = callback;
    this.scope = scope;
  }
  ,

  setup : function() {

    this.ds = new Ext.data.Store({
      proxy: new Ext.data.ScriptTagProxy({
        url: afrous.baseURL+'/LoadMashups'
      }),

      reader: new Ext.data.JsonReader({
         root: 'mashup',
         id: 'id',
         fields : [ 'id', 'name', 'description', 'json']
      }),

      remoteSort: true
    });

    var cm = new Ext.grid.ColumnModel([
      { header: "Name",
        dataIndex: 'name',
        width : 150,
        css: 'white-space:normal;' },
      { header: "Description",
        dataIndex: 'description',
        width : 350 }
    ]);

    this.paging = new Ext.PagingToolbar({
      store: this.ds,
      pageSize: 10,
      displayInfo: true,
      displayMsg: 'Displaying processes {0} - {1} of {2}',
      emptyMsg: "No processes to display"
    });

    // create the editor grid
    this.grid = new Ext.grid.GridPanel({
      store: this.ds,
      cm: cm,
      bbar: this.paging,
      footer: true,
      selModel: new Ext.grid.RowSelectionModel({singleSelect:true}),
      enableColLock : false,
      width:600,
      height:314,
      loadMask : true
    });

    // render it
//    this.grid.render();

//    var gridFoot = this.grid.getView().getFooterPanel(true);

    // add a paging toolbar to the grid's footer

    this.grid.on('cellclick', this.handleGridUpdate, this);
    this.ds.on('load', this.handleGridUpdate, this);

    function renderDate(value) {
      var d = new Date(value);
      var yy = d.getFullYear();
      var mm = d.getMonth()+1;
      if (mm<10) mm = '0'+mm;
      var dd = d.getDate();
      if (dd<10) dd = '0'+dd;
      var hh = d.getHours();
      if (hh<10) hh = '0'+hh;
      var mi = d.getMinutes();
      if (mi<10) mi = '0'+mi;
      return [yy,'-',mm,'-',dd,' ',hh,':',mi].join('');
    }
  }
  ,

  show : function() {
    this.ds.load();
//    this.paging.updateInfo();
    OpenProcessDialog.superclass.show.call(this);
  }
  ,

  handleGridUpdate : function() {
    if (this.grid.getSelections().length>0) {
      this.openBtn.enable();
    } else {
      this.openBtn.disable();
    }
  }
  ,

  handleOpen : function() {
    var selections = this.grid.getSelections();
    if (selections.length==1) {
      var key = selections[0].data.id;
      this.callback.call(this.scope, key);
      this.hide();
    }
  }

});


var EditorsPanel = function(config) {

  this.NUMBER_OF_EDITORS = 12;
  this.HEADER = 'Header';
  this.FOOT   = 'Foot';

  this.editors = [];
  this.divs = [];
  this.editorWidthValue = "100";
  this.editorWidthType = "%";
  this.pageAlignment = "left";

  this.divsGroups = [];
  this.activeDiv = null;

  var _this = this;
  this.divs[this.HEADER] = new FCKEditorContainer('divContainer', this.HEADER);
  this.divs[this.HEADER].setHeight("100px");
  this.divs[this.HEADER].on('click', function(el){
    _this.activeDiv = el;
  });
  for(var i=1; i<=this.NUMBER_OF_EDITORS; i++)
  {
    this.divs[i] = new FCKEditorContainer('divContainer', i);
    this.divs[i].on('click', function(el){
        _this.activeDiv = el;
    });
    this.divs[i].on("resize",function(){
      _this.resizeDivs(this);
    });
  }
  this.divs[this.FOOT] = new FCKEditorContainer('divContainer', this.FOOT);
  this.divs[this.FOOT].setHeight("100px");
  this.divs[this.FOOT].on('click', function(el){
    _this.activeDiv = el;
  });

  EditorsPanel.superclass.constructor.call(this, config);
}

Ext.extend(EditorsPanel, Ext.Panel, {

  registerEditor : function(editorInstance){
    if(this.divs[this.HEADER].getFCKEditorName() == editorInstance.Name)
      this.divs[this.HEADER].registerEditor(editorInstance);
    for(var i=1; i<this.divs.length; i++)
    {
      if(this.divs[i].getFCKEditorName() == editorInstance.Name)
      {
        this.divs[i].registerEditor(editorInstance);
      }
    }
    if(this.divs[this.FOOT].getFCKEditorName() == editorInstance.Name)
      this.divs[this.FOOT].registerEditor(editorInstance);
  }
  ,

  setActiveDiv: function(div)
  {
      this.activeDiv = div;
  }
  ,

  change: function(value)
  {
    var innerDivsContents = this.getDivsContent();

    var confMatrix = null;
    switch (value)
    {
      case '1': //1x2
        confMatrix = [[1,2]];
        break;
      case '2': //2x1
        confMatrix = [[1],[2]];
        break;
      case '3': //1x2 + 1x1
        confMatrix = [[1,2],[3]];
        break;
      case '4': //1x1
        confMatrix = [[1]];
        break;
      case '5': //1x1
        confMatrix = [[1,2,3]];
        break;
      case '6': //1x1
        confMatrix = [[1,2],[3,4]];
        break;
      case '7': //1x1
        confMatrix = [[1,2,3],[4]];
        break;
      case '8': //1x1
        confMatrix = [[1,2,3],[4,5]];
        break;
      case '9': //1x1
        confMatrix = [[1,2,3],[4,5,6]];
        break;
    }

    if(confMatrix)
    {
      this.layoutNumber = value;
      this.divsGroups = [];
      for(var i=0, n=1; i<confMatrix.length; i++)
      {
        this.divsGroups[i] = [];

        //First
        if(confMatrix[i].length == 1)
        {
          this.divsGroups[i].push(n);
          this.divs[n].setResizeConfig({handles: 's'});
          n++;
        }
        else
        {
          this.divsGroups[i].push(n);
          this.divs[n].setResizeConfig({handles: 'se'});
          n++;

          for(var j=1; j<confMatrix[i].length-1; j++, n++)
          {
            this.divsGroups[i].push(n);
            this.divs[n].setResizeConfig({handles: 'se'});
          }

          //Last
          this.divsGroups[i].push(n);
          this.divs[n].setResizeConfig({handles: 'sw'});
          n++;
        }
      }
      n--;
      var text = "";
      for(var m=n-1; m<innerDivsContents.length; m++)
      {
        text += innerDivsContents[m];
      }
      for(var k=1; k<=n-1; k++)
      {
        this.divs[k].showEditor("300px", innerDivsContents[k-1]);
      }
      this.divs[k].showEditor("300px", text);
      this.layoutSelected = value;
    }

    //Hide the rest of editors
    for(var p=n+1; p<=this.NUMBER_OF_EDITORS; p++)
    {
      this.divs[p].hideEditor();
      this.divs[p].setTextInEditor("");
    }

    this.setWidth(this.editorWidthValue+this.editorWidthType);
  }
  ,

  getConfig: function()
  {
    var cfg = {'layout': this.layoutNumber, 'width': this.editorWidthValue+this.editorWidthType, 'align' : this.pageAlignment, 'class' : this.clazz};
    return cfg;
  }
  ,

  setWidth: function(value)
  {
    var valueType = null;
    if(value.indexOf("px") == value.length-2)
    {
      valueType = "px";
      value = value.substring(0,value.length-2)
    }
    else if(value.indexOf("%") == value.length-1)
    {
      valueType = "%"
      value = value.substring(0,value.length-1);
    }

    var max = value;
    if(valueType == "%")
      max = max*window.innerWidth/100;

    if(valueType)
    {
      this.divs[this.HEADER].setWidth(value+valueType);
      this.divs[this.FOOT]  .setWidth(value+valueType);

      var div = null;
      for(var i=0; i<this.divsGroups.length; i++)
      {
        var groupElems = this.divsGroups[i].length;
        if(groupElems == 1)
        {
          div = this.divs[this.divsGroups[i][0]];
          div.setWidth(value+valueType);
          div.setResizeConfig({"maxWidth": max, "minWidth": max});
        }
        else
        {
          var totalWidth = 0;
          var width = Math.floor((value/groupElems));
          for(var j=0; j<groupElems-1; j++)
          {
            div = this.divs[this.divsGroups[i][j]];
            div.setWidth(width+valueType);
            totalWidth += width;
            div.setResizeConfig({"maxWidth": Math.floor(max-max/10), "minWidth": Math.floor(max/10)});
          }
          div = this.divs[this.divsGroups[i][j]];
          div.setWidth((value-totalWidth)+valueType);
          div.setResizeConfig({"maxWidth": Math.floor(max-max/10), "minWidth": Math.floor(max/10)});
        }
      }

      this.editorWidthValue = value;
      this.editorWidthType  = valueType;
      this.alignPage(this.pageAlignment)
    }
  }
  ,

  resizeDivs: function(evt)
  {
    var id = evt.el.id.substring(8);
    var group = this.getGroup(id);

    this.resizeWidthDiv (evt.el, group);
    this.resizeHeightDiv(evt.el, group);

    this.repaint();
  }
  ,

  repaint: function()
  {
    this.divs[this.HEADER].repaint();
    for(var i=1; i<=this.NUMBER_OF_EDITORS; i++)
      this.divs[i].repaint();
    this.divs[this.FOOT].repaint();
  }
  ,

  getGroup: function(div)
  {
    var group = []
    for(var i=0; i<this.divsGroups.length; i++)
    {
      for(var j=0; j<this.divsGroups[i].length; j++)
      {
        if(this.divsGroups[i][j] == div)
        {
          var m = 0;
          for(var k=0; k<this.divsGroups[i].length; k++)
          {
            if(k != j)
            {
              group[m] = this.divs[this.divsGroups[i][k]].el;
              m++;
            }
          }
        }
      }
    }

    return group;
  }
  ,

  resizeWidthDiv: function(thisDiv, group){
    //Width
    if(group.length == 0)
      return;

    var totalWidth = null;
    if(this.editorWidthType == "px")
      totalWidth = this.editorWidthValue;
    else
      totalWidth = window.innerWidth;

    var myValue = thisDiv.getWidth() / totalWidth * 100;
    var groupValue = 100-myValue;

    var previousWidths = []
    var previousGroupWidth = 0;
    for(var i=0; i<group.length; i++)
    {
      previousWidths[i] = group[i].getWidth() / totalWidth * 100;
      previousGroupWidth += previousWidths[i];
    }
    var percents = [];
    var totalGroup = 0;
    for(i=0; i<previousWidths.length-1; i++)
    {
      percents[i] = Math.floor((groupValue/previousGroupWidth)*previousWidths[i]);
      if(this.editorWidthType == "px")
        percents[i] = Math.floor(totalWidth*percents[i]/100);
      totalGroup += percents[i];
      group[i].setWidth(percents[i]+this.editorWidthType);
    }
    if(this.editorWidthType == "px")
      myValue = Math.floor(totalWidth*myValue/100);
    else
      myValue = Math.floor(myValue);
    thisDiv.setWidth(myValue+this.editorWidthType);

    var totalAll = 100;
    if(this.editorWidthType == "px")
      totalAll = totalWidth;
    var adjust = totalAll-totalGroup-myValue;
    group[i].setWidth(adjust+this.editorWidthType);
  }
  ,

  resizeHeightDiv: function(thisDiv, group)
  {
    //Quitar a mi mismo
    for(var i=0; i<group.length; i++)
    {
      group[i].setHeight(thisDiv.getHeight());
    }
  }
  ,

  alignPage: function(align)
  {
    if(align == 'center')
    {
      $("#centerPanel") .attr('style','text-align:center; top: 91px;');
      $("#divContainer").attr('style','float:none; margin: 0 auto 0 auto; text-align:left;');
    }
    else
    {
      $("#centerPanel") .attr('style','top: 91px;');
      $("#divContainer").attr('style','float:'+align+'; margin: none; text-align:left;');
    }
    $("#divContainer").css("width",this.editorWidthValue+this.editorWidthType);
    this.pageAlignment = align;
  }
  ,

  getCSS: function()
  {
    var css = new HtmlElementCSS();
    css.getCSS("divContainer");
    return css;
  }
  ,

  setCSSClass: function(clazz)
  {
    this.divs[this.HEADER].setCSSClass(clazz+'-header');
    this.divs[this.FOOT]  .setCSSClass(clazz+'-footer');
    for(var i=1; i<=this.NUMBER_OF_EDITORS; i++)
    {
      this.divs[i].setCSSClass(clazz);
    }
    $("#divContainer").attr('class',clazz);
    this.clazz = clazz;
  }
  ,

  getCSSClass: function()
  {
    return this.clazz;
  }
  ,

  showEditor: function(editor)
  {
    this.divs[editor].showEditor();
  }
  ,

  hideEditor: function(editor)
  {
    this.divs[editor].hideEditor();
  }
  ,

  getDivsContent: function()
  {
    var innerDivsContents = [];
    for(var i=1; i<=this.NUMBER_OF_EDITORS; i++)
    {
      var text = this.divs[i].getTextFromEditor();
      innerDivsContents.push(text);
    }
    return innerDivsContents;
  }
  ,

  getDiv: function(div)
  {
    return this.divs[div];
  }
  ,

  addMashup: function(mashupId)
  {
    if(this.activeDiv == null)
    {
      Ext.MessageBox.alert('Notice','Please select the area where you want to insert the mashup');
      return;
    }

    this.activeDiv.addMashup(mashupId);
  }
});

/**
 * Container that contains a FCKEditor.
 */
var FCKEditorContainer = function(container, divNumber, cls)
{
  if(!cls)
    cls = "innerDiv";

  this.mashupTitle = '';
  this.divNumber = divNumber;
  this.name = 'innerDiv'+divNumber;
  this.owner = Ext.get(container);
  this.owner.createChild('<div id="'+this.name+'" class="'+cls+' innerDiv" style="float:left; display:none;"></div>');
  this.container = Ext.get(this.name);
  this.container.createChild('<div id="'+this.name+'fck" style="float:left; width:100%; height:100%;"></div>');
  this.container.createChild('<div id="'+this.name+'mshpContainer" style="float:left; width:100%; height:100%; display:none;" class="border">'+
                             '  <div class="internal">'+
                             '    <img class="delete-mashup" src="./icons/mashupbuilder/cross.png" id="'+this.name+'DeleteMashup" alt="Delete Mashup" />'+
                             '    <img class="refresh-mashup" src="./icons/mashupbuilder/arrow_refresh.png" id="'+this.name+'RefreshMashup" alt="Refresh Mashup" />'+
                             '    <img class="refresh-mashup" src="./icons/mashupbuilder/map_edit.png" id="'+this.name+'EditMashup" alt="Editar Mashup" />'+
                             '    <div id="'+this.name+'EditTitleMashup"><h2 id="'+this.name+'TitleMashup" class="title-mashup">Mashup Title</h2></div>'+
                             '    <input class="input-mashup-title" id="'+this.name+'MashupTitleInput" type="text" value="" style="display:none;"/>'+
                             '    <img class="edit-mashup-title" src="./icons/accept.png" alt="Accept" id="'+this.name+'SetEditTitleMashup" style="display:none;"/>'+
                             '    <div id="'+this.name+'mshp" style="float:left; width:100%; height:100%;"> </div>'+
                             '  </div>'+
                             '</div>');

  var _this = this;
  $("#"+this.name+'DeleteMashup').click(function(){
    Ext.Msg.show({
      title:'Delete Confirmation',
      msg: 'Do you really want to remove the mashup?',
      buttons: Ext.Msg.YESNO,
      fn: function(btn, text){
        if (btn == 'yes'){
          _this.removeMashup();
        }
      },
      animEl: 'elId',
      icon: Ext.MessageBox.QUESTION
    });
  });
  $("#"+this.name+'EditMashup').click(function(){
    _this.editMashup();
  });
  $("#"+this.name+'RefreshMashup').click(function(){
    _this.refreshMashup();
  });
  $("#"+this.name+'TitleMashup').click(function(){
    var value = $("#"+_this.name+'TitleMashup').html();
    $("#"+_this.name+'MashupTitleInput')[0].value = value;
    $("#"+_this.name+'TitleMashup').hide();
    $("#"+_this.name+'MashupTitleInput').show();
    $("#"+_this.name+'SetEditTitleMashup').show();
  });
  $("#"+this.name+'SetEditTitleMashup').click(function(){
    var value = $("#"+_this.name+'MashupTitleInput')[0].value;
    _this.mashupTitle = value;
    $("#"+_this.name+'TitleMashup').html(value);
    $("#"+_this.name+'MashupTitleInput').hide();
    $("#"+_this.name+'SetEditTitleMashup').hide();
    $("#"+_this.name+'TitleMashup').show();
  });

  this.fckeditorEl = Ext.get(this.name+'fck');
  this.mashupDiv   = Ext.get(this.name+'mshpContainer');
  this.mashup      = Ext.get(this.name+'mshp');

  this.oFCKeditor = new FCKeditor("TextArea"+divNumber) ;
  this.oFCKeditor.BasePath = "./fckeditor/" ;
  this.oFCKeditor.Height = "100%" ;
  this.oFCKeditor.Config[ 'ToolbarLocation' ] = 'Out:xToolbar' ;
  this.fckeditorEl.createChild(this.oFCKeditor.CreateHtml());

  this.cntns = false;

  this.jquery = $("#"+this.name);

  FCKEditorContainer.superclass.constructor.call(this, this.name, {
    handles: 'all',
    minWidth:100,
    minHeight:100
  });
}

Ext.extend(FCKEditorContainer, Ext.Resizable, {

  _class: 'FCKEditorContainer',

  registerEditor: function(editor)
  {
    this.editor = editor;

    var el = this;
    this.editor.Events.AttachEvent('OnFocus', function(){
        el.fireEvent("click", el);
    });
  }
  ,

  getFCKEditorName: function()
  {
    return "TextArea"+this.divNumber;
  }
  ,

  getDivName: function()
  {
    return this.divNumber;
  }
  ,

  getName: function()
  {
    return this.name;
  }
  ,

  setResizeConfig: function(config)
  {
    if(config.handles)
    {
      this.handles = config.handles;
      var bordersToShow = [];
      var bordersToHide = [];
      if(config.handles == 'n')
      {
        bordersToShow = [this.north];
        bordersToHide = [this.east, this.south, this.west];
      }
      else if(config.handles == 's')
      {
        bordersToShow = [this.south];
        bordersToHide = [this.east, this.north, this.west];
      }
      else if(config.handles == 'e')
      {
        bordersToShow = [this.east];
        bordersToHide = [this.north, this.south, this.west];
      }
      else if(config.handles == 'w')
      {
        bordersToShow = [this.west];
        bordersToHide = [this.east, this.south, this.north];
      }
      else if(config.handles == 'nw')
      {
        bordersToShow = [this.south, this.west];
        bordersToHide = [this.east, this.north];
      }
      else if(config.handles == 'sw')
      {
        bordersToShow = [this.west, this.south];
        bordersToHide = [this.east, this.north];
      }
      else if(config.handles == 'se')
      {
        bordersToShow = [this.south, this.east];
        bordersToHide = [this.west, this.north];
      }
      else if(config.handles == 'ne')
      {
        bordersToShow = [this.north, this.east];
        bordersToHide = [this.west, this.south];
      }

      for(var i=0; i<bordersToShow.length; i++)
        bordersToShow[i].el.setDisplayed(true);

      for(var i=0; i<bordersToHide.length; i++)
        bordersToHide[i].el.setDisplayed(true);
    }
    if(config.minWidth)
      this.minWidth = config.minWidth;
    if(config.minHeight)
      this.minHeight = config.minHeight;
    if(config.maxWidth)
      this.maxWidth = config.maxWidth;
    if(config.maxHeight)
      this.maxHeight = config.maxHeight;
  }
  ,

  showEditor: function(height, text)
  {
    if(height)
      this.jquery.css('height', height);
    if(text)
      this.setTextInEditor(text);
    this.jquery.show();
  }
  ,

  hideEditor: function ()
  {
    this.jquery.hide();
  }
  ,

  isVisible: function()
  {
    return this.container.isVisible();
  }
  ,

  setTextInEditor: function(text)
  {
    this.editor.SetHTML(text);
  }
  ,

  getTextFromEditor: function()
  {
    return this.editor.GetHTML();
  }
  ,

  getMashupId: function()
  {
    return this.mashupId;
  }
  ,

  getMashupTitle: function()
  {
    return this.mashupTitle;
  }
  ,

  containsMashup: function()
  {
    return this.cntnsMashup;
  }
  ,

  addMashup: function(mashupId)
  {
    romulus.mashupsDisplayer.loadMashup(mashupId, this.name+'mshp');
    this.fckeditorEl.setVisibilityMode(Ext.Element.DISPLAY);
    this.fckeditorEl.hide();
    this.mashupDiv.setVisibilityMode(Ext.Element.DISPLAY);
    this.mashupDiv.show();

    this.mashupId = mashupId;
    this.cntnsMashup = true;
  }
  ,

  removeMashup: function(){
    this.mashup.dom.innerHTML = "";
    this.fckeditorEl.setVisibilityMode(Ext.Element.DISPLAY);
    this.fckeditorEl.show();
    this.mashupDiv.setVisibilityMode(Ext.Element.DISPLAY);
    this.mashupDiv.hide();

    this.mashupId = 0;
    this.cntnsMashup = true;
  }
  ,

  refreshMashup: function()
  {
    var mashupId    = this.mashupId;
    var mashupTitle = this.mashupTitle;
    this.removeMashup();
    this.addMashup(mashupId);
    $("#"+this.name+'TitleMashup').html(mashupTitle);
  }
  ,

  editMashup: function()
  {
    window.open(afrous.baseURL+"#"+this.mashupId);
  }
  ,

  setWidth: function(value)
  {
    this.jquery.css('width', value);
  }
  ,

  setHeight: function(value)
  {
    this.jquery.css('height', value);
  }
  ,

  repaint: function()
  {
    this.jquery.css('left',   '0px');
    this.jquery.css('rignt',  '0px');
    this.jquery.css('top',    '0px');
    this.jquery.css('bottom', '0px');
  }
  ,

  getCSS: function()
  {
    var css = new HtmlElementCSS();
    css.getCSS(this.jquery);
    var edArea = this.editor.EditingArea;
    var el = $(edArea.Document.body);
    css.backgroundColor = el.css('background-color');
    return css;
  }
  ,

  css: function(config)
  {
    var edArea = this.editor.EditingArea;
    var el = $(edArea.IFrame.contentWindow.document.body);

    for (var key in config)
    {
      if(key == 'background-color')
        el.attr('style',key+':'+config[key]+';');
      else
        this.jquery.css(key, config[key]);
    }
  }
  ,

  setCSSClass: function(clazz)
  {
    this.clazz = clazz;
    var edArea = this.editor.EditingArea;
    var el = $(edArea.IFrame.contentWindow.document.body);
    el.attr('class',clazz)
  }
  ,

  getCSSClass: function()
  {
    return this.clazz;
  }
});

function defineClass(props)
{
  var f = function() { };
  f.prototype = props;
  return f;
}

romulus.pageEditor = {};
romulus.pageEditor.HtmlElementCSS = HtmlElementCSS;
romulus.pageEditor.RomulusPageEditor = RomulusPageEditor;

$(document).ready(function ()
{
  le = new romulus.pageEditor.RomulusPageEditor($("#divContainer"));
  le.initialize();
});

})();