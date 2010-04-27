/**
 * Services.Salesforce Package
 */

(function() {

var salesforce = new mb.UnitActionPackage('Services.Salesforce', {
  label : 'Salesforce',
  icon : 'http://na1.salesforce.com/favicon.ico',
  setup : function(callback) {
    if (typeof sforce=='undefined') mb.lang.loadScript('/soap/ajax/11.0/connection.js');
    mb.lang.poll({
      work : function(){ return sforce },
      callback : callback
    })
  }
});

salesforce.register(new mb.UnitAction({
  type : 'GetUserInfo',
  label : 'Get UserInfo',
  description : 'Get login user\'s information.',
  inputs : [],
  execute : function(request, callback) {
    sforce.connection.getUserInfo(callback);
  }
}));

salesforce.register(new mb.UnitAction({
  type : 'DescribeGlobal',
  label : 'Describe Global',
  description : 'Describe globally available objects in Salesforce.',
  inputs : [],
  execute : function(request, callback) {
    sforce.connection.describeGlobal(callback);
  }
}));

salesforce.register(new mb.UnitAction({
  type : 'DescribeTabs',
  label : 'Describe Tabs',
  description : 'Describe application\'s tab list information in Salesforce.',
  inputs : [],
  execute : function(request, callback) {
    sforce.connection.describeTabs(callback);
  }
}));

salesforce.register(new mb.UnitAction({
  type : 'DescribeSObject',
  label : 'Describe SObject',
  description : 'Describe given SObject information in Salesforce.',
  inputs : [
    { name : 'sobject',
      label : 'SObject Name',
      type : 'String' }
  ],
  execute : function(request, callback) {
    var sobject = request.params['sobject'];
    sforce.connection.describeSObject(sobject, callback);
  }
}));

salesforce.register(new mb.UnitAction({
  type : 'DescribeLayout',
  label : 'Describe Layout',
  description : 'Describe given SObject\'s layout information in Salesforce.',
  inputs : [
    { name : 'sobject',
      label : 'SObject Name',
      type : 'String' },
    { name : 'recordTypes',
      label : 'record type IDs',
      type : 'String[]' }
  ],
  execute : function(request, callback) {
    var sobject = request.params['sobject'];
    var recordTypes = request.params['recordTypes'];
    sforce.connection.describeLayout(sobject, recordTypes, callback);
  }
}));

salesforce.register(new mb.UnitAction({
  type : 'Query',
  label : 'SOQL Query',
  description : 'Query records using SOQL.',
  inputs : [
    { name : 'soql',
      label : 'SOQL',
      type : 'String',
      multiline : true }
  ],
  execute : function(request, callback) {
    var soql = request.params['soql'];
    sforce.connection.query(soql, callback);
  }
}));



mb.packages.register(salesforce, 'salesforce.js');

})()

