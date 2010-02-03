/*
 * MyCocktail Page Editor
 *
 * David del Pozo González
 * Informática Gesfor
 *
 */

var romulus;
if(!romulus)
  romulus = {};

(function(){
  
  var urlShow = afrous.baseURL+"/ShowMashup";

  romulus.mashupsDisplayer = {
    loadMashup:function (mshpId,htmlElement)
    {
      if(!mshpId || !htmlElement)
        return;

      afrous.ajax.jsonp.invoke(urlShow+'?id='+mshpId+'&json=1', function(json) {
        afrous.lang.forEach(afrous.lang.values(json.requires), function(url){
          afrous.lang.loadScript(url);
        });

        afrous.packages.waitLoadComplete(
          afrous.lang.keys(json.requires),
          function()
          {
            var procdef = new afrous.ProcessDef(json);
            var proc = new afrous.ProcessInstance(procdef);
            afrous.lang.forEach(json.params, function(param, i) {
                var paramValue = afrous.url.getUrlParameters()[param.name];
              if(!paramValue)
                paramValue = param['default'];
              proc.setParam(param.name, paramValue);
            });
            proc.start(function(result){
              var el = null;
              if(afrous.lang.isDOMNode(htmlElement))
                el = htmlElement;
              else if(afrous.lang.isString(htmlElement))
              {
                el = document.getElementById(htmlElement);
                if(!el)
                  el = document.getElementsByName(htmlElement);
              }
              if(el!=null)
                result.render(el);
            });
          }
        );
      });
    }
  }
})();
