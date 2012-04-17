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
UngObject.prototype.inherits = function(superClass,arg) {
    superClass.call(this,arg);//or this.load(new superClass(arg));
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

/* return a deep copy of the current object */
UngObject.prototype.copy = function() {
    var copied = new Object();
    for (var property in this) {
        copied[property] = this[property]!==null&&typeof(this[property])=="object" ? UngObject.prototype.copy.call(this[property]) : this[property];
    }
    return copied;
}

/*
 * add an event handler executed when the fireEvent function is called
 * @param handler : function to execute when the event occures
 * @param event : the event to consider
 * @param once : if set to true, the handler is executed only once
 */
UngObject.prototype.addEventHandler = function (handler, event, once) {
    this.getListenerList().push({handler:handler,event:event,once:once});
}

/* fire an event through all the listeners of the object */
UngObject.prototype.fireEvent = function (event) {console.log(event);
    var list = this.getListenerList();
    for (var i=0; i<list.length; i++) {
        var listener = list[i];
        if(listener.event == event) {
            listener.handler(event);
            if(listener.once) { // remove the listener if supposed to been executed only once
                list.splice(i,1);
                i--;
            }
        }
    }
}

/* getter for the listenerList */
UngObject.prototype.getListenerList = function() {
    if (!this.listenerList) {this.listenerList = []}
    return this.listenerList;
}

/**
 * convert an object into an array easier to manipulate
 * @param object : the object to convert
 */
toArray = function(object) {
    var array = [];
    for(var element in object) {
        if(typeof element != "function") array.push(object[element]);
    }
    return array
}

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
    (function execute() {
        try {
            if(!required.call()) {throw 0;}
            func.call();}
        catch(e) {
            if(console) {console.log(e)}
            if(nb<100) {setTimeout(execute,nb*100);}
        }
        nb*=nb;
    })()
}

/*
 * try a function until the execution meets with no error
 * @param func : function to execute in a loop until it encounters no exception
 */
tryUntilSucceed = function(func) {
    var nb = 2;//avoid to test too much times
    (function execute() {
        try {func.call();}
        catch(e) {
            if(console) {console.log(e)}
            if(nb<100) {setTimeout(execute,nb*200);}
        }
        nb*=nb;
    })()
}

/**
 * call a function periodically. Usefull for checking some stuff regularly
 * @param task : function to execute each period
 * @param period : time to wait before next execution
 * @param firstExecution : (optional) if set to false, the task will not be executed at first call
 */
recursiveTask = function(task,period,firstExecution) {
    if(firstExecution!==false) {task.call()}
    (function recursion() {
        setTimeout(function() {task.call();recursion()},period);
    })();
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
    if(console) {console.log(message)}
}

/**
 * returns the current date (number of ms since 1/1/1970 at 12:00 AM)
 */
function getCurrentTime() {return Date.now();}

/**
 * Paste a toolkit at the mouse position.
 * Just add a common css class to your element needing a tooltip, and initialize with :

        tooltip = new Tooltip();
        $(".myTooltipClass")
            .mouseover(function() {tooltip.show("my tooltip text")})
            .mouseout(function() {tooltip.hide();})
            .mousemove(function(event) {tooltip.move(event);});

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
