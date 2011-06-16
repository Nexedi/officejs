

/**
 * Text documents
 */

var JSONTextDocument = function() {
    JSONDocument.call(this);//inherits from JSONDocument
    this.type = "text";
}

JSONTextDocument.prototype = new JSONDocument();

JSONTextDocument.prototype.saveEdition = function(content) {
    this.setContent(content);
    this.setLastModification(currentTime());
    setCurrentDocument(this);
}

JSONTextDocument.prototype.setAsCurrentDocument = function() {
    getCurrentPage().displayDocumentTitle(this);
    getCurrentPage().displayDocumentState(this);
    getCurrentPage().displayAuthorName(this);
    getCurrentPage().displayLastModification(this);
    setCurrentDocument(this);
}

getCurrentDocument = function() {
    var doc = JSON.parse(localStorage.getItem("currentDocument"));
    doc.__proto__ = JSONTextDocument.prototype;
    return doc;
}



/**
 * Editors
 */
var Xinha = function() {
    this.name = "Xinha";
    this.load = function() {
        _editor_url  = "http://www.ungproject.com/xinha/";
        getCurrentPage().include("xinha/XinhaCore.js","script");
        getCurrentPage().include("xinha/config.js","script");
        xinha_init();
    }
    this.saveEdition = function() {
        var textArea = getCurrentPage().getHTML().getElementById("input_area");
        getCurrentDocument().setContent(textArea.content);
        //saveCurrentDocument(); : JIO function
    }
    this.loadContent = function() {
        var textArea = getCurrentPage().getHTML().getElementById("input_area");
        textArea.content = getCurrentDocument().getContent();
    }
    this.load();
}


/*
// save
saveCurrentDocument = function() {
    //gestion fichier
    var currentDocument = getLocalDocument();
    currentDocument.updateDocument();

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
    xhr.open("PUT", currentUser.storage+"/dav/temp.json", true);
    xhr.setRequestHeader("Authorization", "Basic "+"nom:test");
    //END HACK.

    xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                    if(xhr.status != 200 && xhr.status != 201 && xhr.status != 204) {
                            alert("error: got status "+xhr.status+" when doing basic auth PUT on url "+Base64.encode("nom:test")+"    " + xhr.statusText);
                    } else {
                            lastModificationArea.innerHTML = currentDocument.getLastModification();
                    }
            }
    }
    xhr.withCredentials = "true";
    xhr.send(JSON.stringify(currentDocument.getDocument()));
}

// load
loadDocument = function() {

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

    xhr.open("GET", currentUser.storage+"/dav/temp.json", false);
    xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {

                    var cDoc = null;
                    if(xhr.status == 200) {
                           cDoc = new Document(JSON.parse(xhr.responseText));
                    } else {
                           alert("error: got status "+xhr.status+" when doing basic auth GET on url "+"nom:test"+"    " + xhr.statusText);
                           cDoc = new Document(null);
                    }
                    cDoc.updateHTML();
                    setLocalDocument(cDoc);
            }
    }
    xhr.send();
}*/
