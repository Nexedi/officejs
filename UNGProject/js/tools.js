/***
 * This file provides some useful element used in the whole web site
 */

/**
 * Class UngObject
 * provides useful general methods
 */
UngObject = function() {}
/* return true if this object implements the interface */
UngObject.prototype.Implements = function(myInterface)
{
    for(var property in myInterface)
    {
        if( typeof myInterface[property] != "string")
            continue;

        if(this[property]==undefined || typeof this[property] != myInterface[property] )
            return false;
    }
    return true;
};

/* Load a JSON data into an object */
UngObject.prototype.load = function(data) {
    for(var property in data) {
        this[property] = data[property];
    }
};

/* Load methods from a class to another class */
UngObject.prototype.inherits = function(superClass) {
    this.prototype.load(superClass.prototype);
}

/**
 * returns the current date
 */
currentTime = function() {return (new Date()).toUTCString();}



// save
saveXHR = function(address) {
    $.ajax({
               url: address,
               type: "PUT",
	       headers: {
		   Authorization: "Basic "+btoa("smik:asdf")},
               fields: {
		   withCredentials: "true"
	       },
               data: JSON.stringify(getCurrentDocument()),
               success: function(){alert("saved");},
               error: function(xhr) { alert("error while saving");}
	   });
};
// load
loadXHR = function(address) {
    $.ajax({
	url: address,
	type: "GET",
        dataType: "json",
	cache:false,
	headers: {
	    Authorization: "Basic "+btoa("smik:asdf")},
        fields: {
	   withCredentials: "true"
       },
	success: function(data){
	    var cDoc = getCurrentDocument();
	    cDoc.load(data);
	    cDoc.setAsCurrentDocument();
	}
    });
}

/*
 * wait an event before execute an action
 */
waitBeforeSucceed = function(required, func) {
    var nb = 2;//avoid to test too much times
    var execute = function() {
        try {
            if(!required.call()) {throw 0;}
            func.call();}
        catch(e) {if(nb<100) {setTimeout(execute,nb*100);}}
        nb*=nb;
    }
    execute();
}

/*
 * try a function until the execution meets with no error
 */
tryUntilSucceed = function(func) {
    var nb = 2;//avoid to test too much times
    var execute = function() {
        try {func.call();}
        catch(e) {if(nb<100) {setTimeout(execute,nb*400);} console.log(e);}
        nb*=nb;
    }
    execute();
}
