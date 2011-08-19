/***
 * This file provides some useful element used in the whole web site
 */

/**
 * Class UngObject
 * provides useful general methods
 */
UngObject = function() {}
/* return true if this object implements the interface */
UngObject.prototype.implement = function(myInterface)
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

/* return true only if two objects are equals */
UngObject.prototype.equals = function(object) {
    for (var property in object) {
        if (this.hasOwnProperty(property)) {
            var isEquals = this[property]&&typeof(this[property])=="object" ? UngObject.prototype.equals.call(this[property],object[property]) : this[property]===object[property];
            if (!isEquals) {return false}
        }
    }
    return true;
}

/* return a copy of the current object */
UngObject.prototype.copy = function() {
    var copied = new Object();
    for (var property in this) {
        copied[property] = this[property]!==null&&typeof(this[property])=="object" ? UngObject.prototype.copy.call(this[property]) : this[property];
    }
    return copied;
}


/**
 * Class List
 * this class provides usual API to manipulate list structure
 * @param arg : a json list object
 * @param contentType : the type of the elements of the list
 */
var List = function(arg, contentType) {
    if(arg && arg.headElement) {
        if(contentType) {
            this.headElement=new contentType(arg.headElement);
        } else {
            this.headElement = arg.headElement;
        }
        this.length = arg.length;
        this.previous = new List(arg.previous, contentType);
    }
    else {
        this.nullElement();
    }
}
List.prototype = new UngObject();
List.prototype.load({
    nullElement: function() {
        this.headElement = null;
        this.previous = undefined;
        this.length = 0;
    },
    size: function() {return this.length;},
    head: function() {return this.headElement;},
    tail: function() {return this.previous;},
    isEmpty: function() {return this.head()===null;},
    equals: function(list) {
        return this.head().equals(list.head()) && this.tail().equals(list.tail());
    },
    add: function(value) {
        var t = new List();
        t.load(this);
        this.headElement = value;
        this.previous = t;
        this.length = t.size()+1;
    },
    get: function(i) {
        if(i>=this.size()) {return null;}
        if(i==0) {return this.head();}
        return this.tail().get(i-1);
    },
    set: function(i,element) {
        if(i>=this.size()) {errorMessage("set out of bounds, "+i+" : "+this.size(),this);return}
        if(i==0) {
            this.headElement=element;
        } else {
            this.tail().set(i-1,element);
        }
    },
    remove: function(i) {
        if(i>=this.size()) {errorMessage("remove out of bounds, "+i+" : "+this.size(),this);return}//particular case
        if(i==0) {this.pop();return}//particular case
        if(i==1) {//init
            this.previous = this.tail().tail();
        } else {//recursion
            this.tail().remove(i-1);
        }
        this.length--;
    },
    pop: function() {
        if(this.isEmpty()) {errorMessage("pop on empty list",this);return null;}
        var h = this.head();
        this.load(this.tail())
        return h;
    },
    find: function(object) {
        if(this.isEmpty()) {return -1}//init-false
        var elt = this.head();
        if(object.equals) {//init-true
            if(object.equals(this.head())) {return 0;}//with an adapted comparator
        } else {
            if(object===this.head()) {return 0;}//with usual comparator
        }
        var recursiveResult = this.tail().find(object);//recursion
        return recursiveResult>=0 ? this.tail().find(object)+1 : recursiveResult;
    },
    contains: function(object) {if(this.isEmpty()) {return false} else {return object===this.head() ? true : this.tail().contains(object)}},
    insert: function(element,i) {
        if(i>this.size()) {errorMessage("insert out of bounds, "+i+" : "+this.size(),this);return}//particular case
        if(i==0) {//init
            this.add(element);
        } else {//recursion
            this.tail().insert(element,i-1);
            this.length++;
        }
    },
    replace: function(oldElement,newElement) {
        if(this.isEmpty()) {errorMessage("<<element not found>> when trying to replace",this);return}//init-false
        if(oldElement===this.head()) {
            this.set(0,newElement);//init-true
        } else {
            this.tail().replace(oldElement,newElement);//recursion
        }
    },
    removeElement: function(element) {//remove each occurence of the element in this list
        if(this.isEmpty()) {return}
        this.tail().removeElement(element);
        if(element.equals) {//init-true
            if(element.equals(this.head())) {this.pop();}//with an adapted comparator
        } else {
            if(element===this.head()) {this.pop();}//with usual comparator
        }
    },
    concat: function(list) {
        if(list.size()==0) {return this}
        var l1 = this.copy();
        var l2 = list.copy();
        l1.add(l2.get(l2.size()-1));
        return l2;
    }
});

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
	success: instruction,
        error: function(type) {alert("Error "+type.status+" : fail while trying to load "+address);}

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
        catch(e) {if(nb<100) {setTimeout(execute,nb*200);}console.log(e);}
        nb*=nb;
    }
    execute();
}

/**
 * Resize the right part of ung main page
 * could be developed to implement more beautiful resizments
 */
var resize = function() {
    return $("div.main-right").width($(window).width()-$("div.main-left").width());
}

/**
 * Used to debug
 */
errorMessage = function(message,object) {
    errorObject = object;
    console.log(message);
}

/**
 * returns the current date (number of ms since 1/1/1970 at 12:00 AM)
 */
function getCurrentTime() {return Date.now();}

/**
 * Paste a toolkit at the mouse position
 */
Tooltip = function() {
    this.visible=false;
}
Tooltip.prototype = {
    isVisible: function() {return this.visible;},
    move: function(e) {$("div.toolLocation").css("left",e.pageX+5+"px").css("top",e.pageY + 10+"px");},
    show: function(text) {
        if(!this.isVisible()) {
            $("div.toolLocation")
                .css("display","inline")
                .css("visibility","visible")
                .html(text);
            this.visible = true;
        }
    },
    hide: function() {
        if(this.isVisible()) {
            $("div.toolLocation")
                .css("display","none")
                .css("visibility","hidden");
            this.visible = false;
        }
    }
}
