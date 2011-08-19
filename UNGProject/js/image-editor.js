/**
 * This file provides classes needed by the illustration editor
 */

/**
 * Editors
 * editors must implement the following methods :
 * load : load the editor in the current page
 * saveEdition : save the edition made by this editor to the current document
 * loadContentFromDocument : display the content of the specified document in the editor
 */
SVGEditor = function() {
    this.name = "svg-editor";
    
    this.load = function() {$("#svgframe").attr("src", "svg-edit/svg-editor.html");}
    this.saveEdition = function() {
        var s = "svgframe";
        getCurrentDocument().saveEdition(window.frames[s].svgCanvas.getSvgString());
    }
    this.loadContentFromDocument = function(doc) {
        tryUntilSucceed(function() {window.frames["svgframe"].svgEditor.loadFromString(doc.getContent());});
    }
    this.load();
}

/**
 * SVG documents
 *
 * editable documents must implements the following arguments and methods
 * type : a unique type ID
 * saveEdition : set the argument as the new content of the document. Change last modification time and display the changes
 * setAsCurrentDocument : set the document as currentDocument in the local storage and display its properties in the current page
 *
 * @param arg : a json JSONTextDocument object to load
 */
var JSONIllustrationDocument = function(arg) {
    JSONDocument.call(this,arg);//inherits properties from JSONDocument
    if(arg) {this.load(arg);}
    else {
        this.type = "illustration";
    }
}

JSONIllustrationDocument.prototype = new JSONDocument();//inherits methods from JSONDocument

JSONIllustrationDocument.prototype.saveEdition = function(content) {
    this.setLastUser(getCurrentUser().getName());
    this.setContent(content);
    this.setLastModification(getCurrentTime());
    this.setAsCurrentDocument();
}
JSONIllustrationDocument.prototype.setAsCurrentDocument = function() {
    getCurrentPage().displayDocumentTitle(this);
    getCurrentPage().displayDocumentState(this);
    getCurrentPage().displayDocumentContent(this);
    getCurrentPage().displayLastUserName(this);
    getCurrentPage().displayLastModification(this);
    setCurrentDocument(this);
}

getCurrentDocument = function() {
    return new JSONIllustrationDocument(JSON.parse(localStorage.getItem("currentDocument")));
}

