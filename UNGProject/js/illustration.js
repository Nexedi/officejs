
/**
 * Editors
 */
SVGEditor = function() {
    this.name = "svg-editor";
    
    this.load = function() {$("#svgframe").attr("src", "svg-editor/svg-editor.html")}
    this.saveEdition = function() {
        var s = "svgframe";
        getCurrentDocument().saveEdition(window.frames[s].svgCanvas.getSvgString());
    }
    this.loadContentFromDocument = function(doc) {
        var s = "svgframe";
        window.frames[s].svgCanvas.setSvgString(doc.getContent());
    }

    var s = "svgframe";
    this.svgCanvas = window.frames[s].svgCanvas;

    this.load();
}

/**
 * SVG documents
 */
var JSONIllustrationDocument = function() {
    JSONDocument.call(this);//inherits properties from JSONDocument
    this.type = "illustration";
}

JSONIllustrationDocument.prototype = new JSONDocument();//inherits methods from JSONDocument

JSONIllustrationDocument.prototype.saveEdition = function(content) {
    this.setContent(content);
    this.setLastModification(currentTime());
    this.setAsCurrentDocument();
}
JSONIllustrationDocument.prototype.setAsCurrentDocument = function() {
    getCurrentPage().displayDocumentTitle(this);
    getCurrentPage().displayDocumentState(this);
    getCurrentPage().displayDocumentContent(this);
    getCurrentPage().displayAuthorName(this);
    getCurrentPage().displayLastModification(this);
    setCurrentDocument(this);
}

getCurrentDocument = function() {
    var doc = new JSONIllustrationDocument();
    doc.load(JSON.parse(localStorage.getItem("currentDocument")));
    return doc;
}

// save
saveXHR = function() {
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
    xhr.open("PUT", "dav/temp2.json", true);
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
loadXHR = function() {

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

    xhr.open("GET", "dav/temp2.json", false);
    xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {

                    var cDoc = new JSONIllustrationDocument();
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