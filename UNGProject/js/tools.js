/***
 * Class UngObject
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

/*
 * wait an event before execute an action
 */
waitBeforeExecution = function(event, func) {
    var waitBefore = function() {
        if(event) {func.call();} else {setTimeout(waitBefore,1000)}
    }
    setTimeout(waitBefore,1000);
}
