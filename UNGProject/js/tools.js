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



// save
saveXHR = function(address) {
    //create request
    var xhr=null;
    try
    {
        xhr = new XMLHttpRequest();
    } catch(e)
    {
        try {xhr = new ActiveXObject("Msxml2.XMLHTTP");}
        catch (e2)
        {
            try {xhr = new ActiveXObject("Microsoft.XMLHTTP");}
            catch (e) {alert("Please install a more recent browser")}
        }
    }

    //xhr.open("PUT", keyToUrl(key, wallet), true, wallet.userAddress, wallet.davToken);
    //HACK:
    xhr.open("PUT", address, true);
    xhr.setRequestHeader("Authorization", "Basic "+"nom:test");
    //END HACK.

    xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                    if(xhr.status != 200 && xhr.status != 201 && xhr.status != 204) {
                            alert("error: got status "+xhr.status+" when doing basic auth PUT on url "+Base64.encode("nom:test")+"    " + xhr.statusText);
                    }
            }
    }
    xhr.withCredentials = "true";
    xhr.send(JSON.stringify(getCurrentDocument()));
}

// load
loadXHR = function(address) {

    //create request
    var xhr=null;
    try
    {
        xhr = new XMLHttpRequest();
    } catch(e)
    {
        try {xhr = new ActiveXObject("Msxml2.XMLHTTP");}
        catch (e2)
        {
            try {xhr = new ActiveXObject("Microsoft.XMLHTTP");}
            catch (e) {}
        }
    }

    xhr.open("GET", address, true);
    xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {

                    var cDoc = getCurrentDocument();
                    if(xhr.status == 200) {
                           cDoc.load(JSON.parse(xhr.responseText));
                    } else {
                           alert("error: got status "+xhr.status+" when doing basic auth GET on url "+"nom:test"+"    " + xhr.statusText);
                    }
                   cDoc.setAsCurrentDocument();
            }
    }
    xhr.send();
}

/*
 * wait an event before execute an action
 */
tryUntilSucceed = function(func) {
    var nb = 2;//avoid to test too much times
    var retry = function() {
        try {return func.call();}
        catch(e) {if(nb<100) {setTimeout(retry,nb*100); alert(e);}}
        nb*=nb;
    }
    retry();
}

requireBeforeSucceed = function(required, func) {
    var test = function() {
        try {return required.call();}
        catch(e) {return null;}
    }
    if(test()) {tryUntilSucceed(func);} else {setTimeout(test,100);};
}

