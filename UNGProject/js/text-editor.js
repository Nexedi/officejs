/**
 * This file provides classes needed by the text editor
 */

/**
 * Editors
 * editors must implement the following methods :
 * load : load the editor in the current page
 * saveEdition : save the edition made by this editor to the current document
 * loadContentFromDocument : display the content of the specified document in the editor
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
        tryUntilSucceed(setText);
    }
    this.load();
}

var AlohaInterface = function() {
    this.name = "Aloha";
    this.load = function() {
        includeJS("aloha/aloha/plugins/com.gentics.aloha.plugins.Format/plugin.js");
        includeJS("aloha/aloha/plugins/com.gentics.aloha.plugins.Table/plugin.js");
        includeJS("aloha/aloha/plugins/com.gentics.aloha.plugins.List/plugin.js");
	includeJS("aloha/aloha/plugins/com.gentics.aloha.plugins.Link/plugin.js");
        $("div#page_content div.input").html("<div id='aloha_editable'>test</div>");
        $("#aloha_editable").css("min-height","15em").css("border","5px solid #3399FF").css("overflow","auto");
        $("#aloha_editable").aloha();
    }
    this.saveEdition = function() {
        getCurrentDocument().saveEdition(GENTICS.Aloha.editables[0].getContents());
    }
    this.loadContentFromDocument = function(doc) {
        var setText = function() {$("div.aloha_editable").html(doc.getContent());}
        tryUntilSucceed(setText);
    }
    this.load();
}




/**
 * Text documents
 *
 * editable documents must implements the following arguments and methods
 * type : a unique type ID
 * saveEdition : set the argument as the new content of the document. Change last modification time and display the changes
 * setAsCurrentDocument : set the document as currentDocument in the local storage and display its properties in the current page


/**
 * class JSONTextDocument
 * @param arg : a json JSONTextDocument object to load
 */
var JSONTextDocument = function(arg) {
    JSONDocument.call(this,arg);//inherits properties from JSONDocument
    if(arg) {this.load(arg);}
    else {
        this.type = "text";
    }
}

JSONTextDocument.prototype = new JSONDocument();//inherits methods from JSONDocument

JSONTextDocument.prototype.saveEdition = function(content) {
    this.setLastUser(getCurrentUser().getName());
    this.setContent(content);
    this.setLastModification(currentTime());
    this.setAsCurrentDocument();
}
JSONTextDocument.prototype.setAsCurrentDocument = function() {
    getCurrentPage().displayDocumentTitle(this);
    getCurrentPage().displayDocumentState(this);
    getCurrentPage().displayDocumentContent(this);
    getCurrentPage().displayLastUserName(this);
    getCurrentPage().displayLastModification(this);
    setCurrentDocument(this);
}

getCurrentDocument = function() {
    return new JSONTextDocument(JSON.parse(localStorage.getItem("currentDocument")));
}
