
/**
 * Editors
 */
var Xinha = function() {
    this.name = "Xinha";
    this.load = function() {
        _editor_url  = "xinha/";
        getCurrentPage().include("xinha/XinhaCore.js","script");
        getCurrentPage().include("xinha/config.js","script");
        xinha_init();
    }
    this.saveEdition = function() {
        getCurrentDocument().saveEdition(xinha_editors.input_area.getEditorContent());
    }
    this.loadContentFromDocument = function(doc) {
        var setText = function() {xinha_editors.input_area.setEditorContent(doc.getContent());}
        waitBeforeSucceed(function() {return xinha_editors.input_area;},setText);
    }
    this.load();
}



/**
 * Text documents
 */

var JSONTextDocument = function() {
    JSONDocument.call(this);//inherits properties from JSONDocument
    this.type = "text";
}

JSONTextDocument.prototype = new JSONDocument();//inherits methods from JSONDocument

JSONTextDocument.prototype.saveEdition = function(content) {
    this.setContent(content);
    this.setLastModification(currentTime());
    this.setAsCurrentDocument();
}
JSONTextDocument.prototype.setAsCurrentDocument = function() {
    getCurrentPage().displayDocumentTitle(this);
    getCurrentPage().displayDocumentState(this);
    getCurrentPage().displayDocumentContent(this);
    getCurrentPage().displayAuthorName(this);
    getCurrentPage().displayLastModification(this);
    setCurrentDocument(this);
}

getCurrentDocument = function() {
    var doc = new JSONTextDocument();
    doc.load(JSON.parse(localStorage.getItem("currentDocument")));
    return doc;
}
