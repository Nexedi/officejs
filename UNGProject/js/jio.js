/*
JIO: Javascript I/O. A library to load, edit, save documents to 
multiple storage backends using a common interface
*/
/*
JIO Namespace. Everything related to JIO happens over here
*/
var JIO = (function () {
    /* Function returns us a JIOStorage, a basic stensil for other kind of storage*/
    var JIOStorage = function (store_info){
	var J = {}; // dummy object. We will augment it and return it
	J = {
	    "initialize": function(server,path,username,password){
		/*
		  Basic initilization or pre-rituals
		*/
	    },
	    "loadDocument": function (doc_id, handler ) {
		/*
		  Calls handler with an object associated with requested document of the `doc_id` 
		  .hash of the object is the MD5 hash of the data
		  .data of the object is the data itself
		  
		*/
	    },

	    "saveDocument": function (doc_id, data, hash, overwrite, async) {
		/*
		  Saves the document with a particular `docid`
		  If `docid` is `0` then the function assigns a docid automatically
		  `hash` is used to check if the document was last changed by someone else,
		  If it was, it will raise a JIOContentChanged exception
		  If `hash` is not supplied, the document will be overwritten.
		  If `overwrite` is true the content will be overwritten without any exception
		*/
	    },

	    "getDocumentList": function (storage_id, query, order_by, metadata) {
		/*
		  Storage implementation should provide this function which will
		  return the list of documents which are stored on the storage
		  beased on `query`.
		  TODO Define how `query` is specified
		  `ordered_by` how the results should be sorted
		*/
	    }
	};
	return J;
    }; //JIOStorage
    
    /* DAVStorage : Does JIO on a WebDAV server*/
    var DAVStorage = function (store_info){
	if(!store_info.serverSore)
	    throw Error("No server specified for DAVStorage");
	store_info.path = store_info.path || '';
	var auth=false;
	if(store_info.user){
	    if(!store_info.pass)
		throw Error("No password specified of user for DAVStorage");
	    auth=true;
	}
	
	var J = JIOStorage(store_info); // we will return this object at the end
	
	J.loadDocument = function (doc_id,handler) {
	    ajaxsetting={
		/* server,path should all be in correct format http://foo.com/ some/dir/*/
		url:store_info.server + store_info.path + doc_id; 
	    };
	};
	
	
    };
})();


JIOStorage = 
}

var JIODAVStorage=Object.create(JIOStorage);
JIODAVStorage.initialize = function (server,path,user,pass){
    this.server=server;
    this.path=path || '/';
    if(user) 
    {
	this.user=user;
	this.pass=pass;
    }
    
JIODAVStorage.loadDocument = function(doc_name){
    