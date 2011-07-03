/*
 JIO: Javascript I/O. A library to load, edit, save documents to 
 multiple storage backends using a common interface
 */
/*
 JIO Namespace. Everything related to JIO happens over here
 */
var JIO = (function () {
	       
	       /* Function returns us a JIOStorage, a basic stensil for other kind of storage*/
	       var JIOStorage = function (store_info) {
		   var J = {}; // dummy object. We will augment it and return it
		   J = {
		       "initialize": function(server,path,username,password) {
			   /*
			    Basic initilization or pre-rituals
			    */
		       },
		       "loadDocument": function (doc_id, handler ) {
			   /*
			    Calls handler with an object associated with requested document of the `doc_id` 
			    The first argument of handler is error object or null depending on if error occured or not.(Like NodeJS)
			    Second argmuent is the object literal containing 
			    .hash of the object is the MD5 hash of the data
			    .data of the object is the data itself
			    Signature of Handler:
			    handler = function (err, dataobject) {
			      if(err===null) {
			        console.log(dataobject.hash);
			        console.log(dataobject.data);
			      }
			      else{
			       console.log(err.status);
			      }
			    };
			    
			    */
		       },

		       "saveDocument": function (doc_id, data, handler, hash, conflict_func, overwrite) {
			   /*
			    Saves the document with a particular `doc_id`
			    `hash` is used to check if the document was last changed by someone else,
			    If it was, it will call the conflict_func with all other parameters passed.
			    If `hash` is not supplied, no validation would be performed and conflit_func won't be called and document would be saved directly.
			    Setting `overwrite` to false, will prevent overwriting the document in anycase if a document with doc_id already exists
			    `handler` workes sames way as in loadDocument
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
		       },
		       "hashdata": function(data) {
			   if(typeof hex_sha1 !== 'function') {
			       //this means that the hashing library is not load it. Load it now
			       $.ajax({
					  async:false,
					  type: "GET",
					  url: "js/sha1-min.js",
					  dataType: "script"
				      });                                                                
			       
			   }
			   //now  we can use hex_sha1(hopefully)
			   return hex_sha1(data);
		       }
		   };
		   return J;
	       }; //JIOStorage

	       /* DAVStorage : Does JIO on a WebDAV server*/
	       var DAVStorage = function (store_info) {
		   if(!store_info.server)
		       throw Error("No server specified for DAVStorage");
		   store_info.path = store_info.path || '';
		   var auth=false;
		   if(store_info.user) {
		       if(store_info.pass===undefined)
			   throw Error("No password specified of user for DAVStorage");
		       auth=true;
		   }
		   
		   //server,path should all be in correct format http://foo.com/ some/dir/
		   var complete_path = store_info.server + store_info.path;
		   var add_auth_headers = function (ajaxsetting) {
		       ajaxsetting.headers={'Authorization':"Basic "+btoa(store_info.user+":"+store_info.pass)};
		       ajaxsetting.fields={'withCredentials': "true"};
		       return ajaxsetting;
		   };
	       
		   var J = JIOStorage(store_info); // we will return this object at the end
		   
		   J.loadDocument = function (doc_id,handler) {
		       var ajaxsetting={
			   'url': complete_path+doc_id,
			   'type':'GET',
			   'cache':false,
			   'success': function (fetched_data, textStatus, jqXHR) {
			       var hashed_data=J.hashdata(fetched_data);
			       handler(null,{'hash':hashed_data,'data':fetched_data});
			   },
			   'error': function(jqXHR, textStatus, errorThrown) {
			       console.log("Error while doing ajax request for loadDocument. Return code:"+jqXHR.status+"["+errorThrown+"]");
			       handler(jqXHR);
			   }
		       };
		       if (auth) {
			   ajaxsetting = add_auth_headers(ajaxsetting);
		       }
		
		       $.ajax(ajaxsetting);
		   };
		   
		   J.saveDocument = function(doc_id, data, handler, hash, conflict_func, overwrite){
		       var document_url=complete_path+doc_id;
		       var ajaxsetting={
			   'url':document_url,
			   'cache':false,
			   'type':'PUT',
			   'data':data,
			   'success' : function (fetched_data, textStatus, jqXHR) {
			       var hashed_data= J.hashdata(data);
			       handler(null,{'hash':hashed_data,'data':data});
			   },
			   'error' : function(jqXHR, textStatus, errorThrown) {
			       console.log("Error while doing ajax request for loadDocument. Return code:"+jqXHR.status+"["+errorThrown+"]");
			       handler(jqXHR);
			   }
		       };
		       if (auth) {
			   ajaxsetting = add_auth_headers(ajaxsetting);
		       }

		       //The logic:
		       if(hash){
			   //hash is provided, we will now have to get the document first.
			   J.loadDocument(doc_id, function(err, dataobject){
					  if(err!==null){
					      //error occured, check if it is 404
					      if(err.status===404){
						  //the document doesn't exist, just do the save
						  $.ajax(ajaxsetting);
					      }
					      else{
						  //some other strange error,just call the user's error handler
						  handler(err);
					      }
					  }   
					      else{
						  //we got back a document, check for hash
						  if(dataobject.hash===hash){
						      //hash matched, now check for overwrite value
						      if(overwrite!==false){
							  $.ajax(ajaxsetting);
						      }

						  }
						  else{
						      //hash didn't match, raise conflict_func
						      conflict_func(doc_id,data,handler,hash,overwrite);
						  }
					      }
					  });
		       }
		       else{
			   //user didn't provide hash.
			   if(overwrite!==false){
			       //user doesn't care if document get's overwriten,
			       //save the document
			       $.ajax(ajaxsetting);
			   }
			   else{
			       //user doesn't wants to overwrite the document, now check if the document exists
			       J.loadDocument(doc_id,function(err,dataobject){
					      if(err!==null) {
						  //error occured while trying to fetch the doc, check if error was 404
						  if(err.status===404) {
						      //document doesn't exist, just do the save
						      $.ajax(ajaxsetting);
						  }
						  //now if any other error occurs, we don't care. (this is bad habbit)
					      }
					      });
			   }
		       }
		       
		   };       
			       
		
		   J.getDocumentList = function(){};
		   
		   //All methods are defined, now return J as the newly cooked object
		   return J;
	       };//DAVStorage
	       
	       /*ObjStorage: JIO on javscript objects*/
	       var ObjStorage = function (store_info){
		   /*
		    * store_info.memobject must be either an empty object or must be a
		    * collection object indicated by it's .content to be an array.
		    */
		   var memobject=store_info.memobject || {};
		   if(memobject.data===undefined){
		       // The object doesn't have a .data, we have to create a blank one
		       // Most probably the object was blank or wasn't passed
		       memobject.data=[];//blank array to hold all the object
		   }
		   if(memobject.doc_id===undefined){
		       /*
			* We can have doc_id of the parent node as an empty string
			* But remember if we are binding this object to a children of another
			* We will have to ask user about the name as which has to be mounted
			*/
		       memobject.doc_id="";
		   }
		  /*
		   * after this line, the memobeject will have
		   * .data as either an empty array [] or the original data as string
		   * .doc_id as either the original doc_id or blank string
		   */
		   var J = JIOStorage(store_info);	   
		   J.hashObject = function(object,hashfunction){
		       if(hashfunction)
			   {
			       return hashfunction(JSON.stringify(object));
			   }
		       else{
			   return J.hashdata(JSON.stringify(object));
			   }
		       };
		   J.loadDocument = function (doc_id, handler) {
		     /*
		      * Handler is optional.
		      * Returns dataobject = {hash,data}
		      * If the requested doc_id is a collection,
		      * return the hash is the sum of all the content inside that 
		      * collection and let the data be an array with the docid of 
		      * all the child documents. 
		      * 
		      * Since all operation are done on Memory, asyncronous request doesn't
		      * have a meaning, handler is provided just to give a uniform interface.
		      * Users are advised to call loadDocument without a handler
		      * TODO: write how to handle error in case not
		      * using handlers
		      * TODO: Make it compatible with handler
		      * 
		      * Internal representation: Each object is
		      * {doc_id,meta_data,content}. content can be
		      * array which represents the collection or
		      * simple data representing document.
		      */ 
		       var dataobject = {}; //to be returned
		       if(memobject.data instanceof Array){
			   /*
			    * Check for any of the children have given doc_id
			    */
			   
			   for (var i=0; i < memobject.data.length;i++){
			       var ith_child=memobject.data[i];
			       if(ith_child.doc_id===doc_id){
				   if(ith_child instanceof Array){
				       //found match is a collection
				       dataobject.data=[];
				       for(var j=0; j < ith_child.data.length; j++){
					   dataobject.data.push(ith_child.data[j]);
				       }
				   }
				   else{
				       //it was a document
				       dataobject.data=ith_child.data;
				       }
				   dataobject.hash=J.hashObject(ith_child);
			       break;
			       }
			       
			   }
			   if(dataobject.data===undefined){
			       // there are is no child of doc_id in current collection
			       return null; //not found
			   }

		       }
		       else{
			   // the memobject is a datablob, check if doc_id matches and return
			   if(memobject.doc_id===doc_id){
			       dataobject.data=memobject.data;
			       dataobject.hash=J.hashObject(memobject);
			   }
			   else{
			       // the doc_id neither matched with any child or the object itself
			       // return null
			       return null;//return null
			   }
		       }
		       return dataobject;
		   };
		   J.saveDocument = function (doc_id, data, handler, hash, conflict_func,overwrite){
		       
		       /*
			* if data is null (not undefined but null) the save function will make a collection (directory) instead.
			*/
   
			  
		   };
		   return J;
		   
		
	       };
	       
	       

	       //defined all classes, now return the interface of JIO which has all these classes
	       return {
		   'JIOStorage':JIOStorage,
		   'DAVStorage':DAVStorage,
		   'ObjStorage':ObjStorage
	       };
	   })();

