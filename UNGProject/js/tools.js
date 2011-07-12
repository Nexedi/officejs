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
 * Class List
 * this class provides usual API to manipulate list structure
 */
var List = function(arg) {
    this.content = new Array();
    if(arg) {this.content = arg;}
    this.length = this.content.length;
}
List.prototype = new UngObject();
List.prototype.load ({
    size: function() {return this.length;},
    put: function(key,value) {
        if(!this.content[key]) {this.length=this.length+1;}
        alert(""+this.length+this.content[key]);
        this.content[key]=value;
    },
    add: function(element) {this.put(this.size(),element);},
    get: function(i) {return this.content[i];},
    concat: function(list) {while(!list.isEmpty()) {this.add(list.pop())}},
    remove: function(i) {delete this.content[i];this.length--;},
    isEmpty: function() {return this.size()==0;},
    head: function() {return this.isEmpty() ? null : this.get(this.size()-1);},
    pop: function() {
        if(this.isEmpty()) {return null;}
        var element = this.get(this.size()-1);
        this.remove(this.size()-1);
        return element;
    },
    recursiveCall: function(instruction) {
        var list = new List();
        list.load(this);
        if(list.isEmpty()) {return false;}
        var result = instruction(list.pop());
        return result ? result : list.recursiveCall(instruction);
    },
    find: function(object) {
        for(var i = 0; i<this.length; i++) {if(this.get(i)===object) {return i;}}
        return -1;
    },
    contains: function(object) { return (find(object)!=-1); }
});


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

/**
 * load a public file with a basic ajax request
 * @param address : the address of the document
 * @param type : the type of the document content
 * @param instruction : a function to execute when getting the document
 */
loadFile = function(address, type, instruction) {
    $.ajax({
	url: address,
	type: "GET",
        dataType: type,
	headers: { Authorization: "Basic "+btoa("smik:asdf")},
        fields: { withCredentials: "true" },
	success: instruction,
        error: function(type) {t=type;alert("er");}
    });
}

// save
saveFile = function(address, content, instruction) {
    $.ajax({
        url: address,
        type: "PUT",
        dataType: "json",
        data: JSON.stringify(content),
        headers: { Authorization: "Basic "+btoa("smik:asdf")},
        fields: { withCredentials: "true" },
        success: instruction,
        error: function(type) {
            if(type.status==201) {instruction();}//ajax thinks that 201 is an error...
        }
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
 * @param required : function we are waiting for a result
 * @param func : function we will try to execute in a loop
 */
waitBeforeSucceed = function(required, func) {
    var nb = 2;//avoid to test too much times
    var execute = function() {
        try {
            if(!required.call()) {throw 0;}
            func.call();}
        catch(e) {console.log(e);if(nb<100) {setTimeout(execute,nb*100);}}
        nb*=nb;
    }
    execute();
}

/*
 * try a function until the execution meets with no error
 * @param func : function to execute in a loop until it encounters no exception
 */
tryUntilSucceed = function(func) {
    var nb = 2;//avoid to test too much times
    var execute = function() {
        try {func.call();}
        catch(e) {if(nb<100) {setTimeout(execute,nb*200);} console.log(e);}
        nb*=nb;
    }
    execute();
}

/**
 * Resize the right part of ung main page
 * could be developed to implement more beautiful resizments
 */
var resize = function() {
    $("div.main-right").width($(window).width()-$("div.main-left").width());
}


