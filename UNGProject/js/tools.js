/***
 * return true if this object implements the interface
 */
Object.prototype.Implements = function(myInterface)
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

/**
 * Load a JSON data into an object
 */
Object.prototype.load = function(data) {
    for(var property in data) {
        this[property] = data[property];
    }
};


/**
 * returns the current date
 */
currentTime = function() {return (new Date()).toUTCString();}