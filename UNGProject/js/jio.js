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

    xhr.open("GET", address, false);
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