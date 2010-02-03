// MyCoctail Custom Operators

(function() {

//AtomPub POST Operator - Posts content in a Liferay Portal using AtomPub
var atomPubPostOperator = new afrous.UnitAction({
  type : 'atompubpost',
  label : 'AtomPub POST',
  description : 'Posts content in a Liferay Portal using AtomPub',
  inputs : [
 	{ name : 'server_url',
      label : 'URL of your Liferay Portal (without http://)',
      type : 'String',
	  size : 'large' },
    { name : 'company_id',
      label : 'Company ID',
      type : 'Long' },
    { name : 'group_id',
      label : 'Group ID',
      type : 'Long' },
    { name : 'user_name',
      label : 'User ID (screenName, ID or email Address)',
      type : 'String' },
    { name : 'password',
      label : 'Password',
      type : 'String' },
    { name : 'type_of_content',
      label : 'Type of Content',
      type : 'String',
	  options : ['blogs', 'webcontent' ] },
    { name : 'title',
      label : 'Ttile',
      type : 'String' },
	{ name : 'content',
      label : 'Content',
      type : 'String',
	  size : 'large' }
  ]
  ,
  execute : function(request, callback) {
    
	//Get the current Date in the Atom Format
		var now = new Date ();
		var year = now.getFullYear();
		var month = ((now.getMonth() < 10) ? "0" : "") + now.getMonth();
		var day = ((now.getDay() < 10) ? "0" : "") + now.getDay();
		var hours=((now.getHours() < 10) ? "0" : "") + now.getHours();
		var minutes=((now.getMinutes() < 10) ? "0" : "") + now.getMinutes();
		var seconds=((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();

		var date = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;

	//Get the parameters
		var server_url = request.params['server_url'];
		var user_name = request.params['user_name'];
		var password = request.params['password'];
		var company_id = request.params['company_id'];
		var group_id = request.params['group_id'];
		var type_of_content = request.params['type_of_content'];
		var title = request.params['title'];
		var content = request.params['content'];

		content = content.replace(/&/g, '&amp;');
		content = content.replace(/</g, '&lt;');
		content = content.replace(/>/g, '&gt;');
		content = content.replace(/\"/g, '&#34;');
		content = content.replace(/\'/g, '&#39;');

 	  //Build the Body of the request
		var body = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom"><id>uuid:</id><title type="text">' 
				+ title + '</title><updated>' + date + '</updated><author><name>' + user_name + '</name></author><content type="html">';

		if (type_of_content == 'webcontent') {
			body += '&lt;?xml version="1.0" encoding="UTF-8"?>&lt;root available-locales="en_US" '+
				'default-locale="en_US">&lt;static-content language-id="en_US">&lt;![CDATA[' + content + ']]&gt;&lt;/static-content>&lt;/root>';
		}
		else {
			body += content;
		}

		body += '</content></entry>';
		
	//Make the POST request
		
	var	mycallback = {
        onSuccess: function(data){
	        callback.onSuccess(afrous.lang.xmlToJson(data));
        },
        onFailure: callback.onFailure
    };

	afrous.ajax.request({
     	path : 'http://' + user_name + ':' + password + '@' + server_url + '/atompub-web/atom/'+ type_of_content+ '?companyId=' + company_id + '&groupId=' + group_id,
		method : 'POST',
    	mimeType : 'application/atom',
		contentType: 'application/atom+xml',
		data: body
    }, mycallback);


	  }
	});

var atomPubOperatorsPackage = new afrous.UnitActionPackage('AtomPub Operators');
atomPubOperatorsPackage.register(atomPubPostOperator);
afrous.packages.register(atomPubOperatorsPackage, 'atompub-operators.js');

})();


