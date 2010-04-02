/**
 * Services.Romulus Package
 * 
 * David del Pozo González
 * Informática Gesfor
 * 
 * This service is a test REST service developed for a demostration.
 * var "url" must be setup to invoke the correct URL.
 */

(function() {

var romulus = new afrous.UnitActionPackage('Services.Romulus', {
  label : 'Romulus',  
  icon : 'http://www.ict-romulus.eu/romulus-theme/images/liferay.ico'
});

var FUNDS         = 'Funds';
var INVOLVEMENTS  = 'Involvements';
var MEETINGS      = 'Meetings';
var PROJECTS      = 'Projects';
var PARTICIPANTS  = 'Participants';
var WORK_PACKAGES = 'Work Packages';

romulus.register(new afrous.UnitAction({
  type : 'EUApp',
  label : 'EUApp',
  description : 'EUApp',
  allowDynamicInput : true,
  inputs : [
    { name : 'entity',
      label : 'entity',
      type : 'String',
      options : [FUNDS,INVOLVEMENTS,MEETINGS,
                 PROJECTS,PARTICIPANTS,WORK_PACKAGES] }
  ]
  ,
  execute : function(request, callback) {
    var url = null;
    var baseUrl = 'http://www.ict-romulus.eu/EUProjectManager';
    var entity = request.params['entity'];
    if(entity == FUNDS)
      url = baseUrl+'/services/funds/JSONFundsList';
    else if(entity == INVOLVEMENTS)
      url = baseUrl+'/services/involvments/JSONInvolvmentsList';
    else if(entity == MEETINGS)
      url = baseUrl+'/services/meetings/JSONMeetingsList';
    else if(entity == PROJECTS)
      url = baseUrl+'/services/projects/JSONProjectsList';
    else if(entity == PARTICIPANTS)
      url = baseUrl+'/services/participants/JSONParticipantsList';
    else if(entity == WORK_PACKAGES)
      url = baseUrl+'/services/workpackages/JSONWorkPackagesList';

    var proxy      = mbuilder.config.JSONP_PROXY_URL+"?responseFormat=json&url=";
    var urlEncoded = mbuilder.url.urlEncode(url);
    url = proxy + urlEncoded;

    afrous.ajax.jsonp.invoke(url, callback);
  }


}));
/*
romulus.register(new afrous.UnitAction({
  type : 'RomulusBlog',
  label : 'Romulus Blog',
  description : 'Romulus Blog Service',
  allowDynamicInput : true,
  inputs : [
    { name : 'option',
      label : 'option mode',
      type : 'String',
      options : ['Lastest','Lastests','Statistics','Users Addresses'] },
    { name : 'statistic',
      label : 'statistic',
      type : 'String',
      options : ['User','Issue'] }
  ]
  ,
  execute : function(request, callback) {
    var url = 'http://www.ict-romulus.eu/ClientWS/RequestWSServlet?';
    if (request.params['option'])
    {
      var opt = request.params['option'];
      if(opt == 'Users Addresses')
        opt = 'Addresses';
      url += 'option='+encodeURIComponent(opt); 
    }
    if (request.params['statistic'])
    {
      if (request.params['option'])
        url += '&';
      url += 'statistic='+encodeURIComponent(request.params['statistic']); 
    }
    afrous.ajax.jsonp.invoke(url, callback); 
  }
  

}));*/

afrous.packages.register(romulus, 'romulus.js');

})();