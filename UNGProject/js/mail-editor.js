/**
 * This file provides classes needed by the mail editor
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



/**
 * Text documents
 *
 * editable documents must implements the following arguments and methods
 * type : a unique type ID
 * saveEdition : set the argument as the new content of the document. Change last modification time and display the changes
 * setAsCurrentDocument : set the document as currentDocument in the local storage and display its properties in the current page


/**
 * class JSONEMail
 * @param arg : a json JSONEMail object to load
 */
var JSONEMail = function(arg) {
    if(arg) {this.load(arg);}
    else {
        this.senders = {};
        this.cc = {};
        this.bcc = {};
        this.object = "";
        this.recipients = {};
        this.date = currentTime();
        this.content = "";
        this.attachment = {};
    }
}

JSONEMail.prototype = new UngObject();//inherits methods from JSONDocument
JSONEMail.prototype.load({
    //setters,getters
    getSenders: function() {return this.senders;},
    getCC: function() {return this.cc;},
    getBCC: function() {return this.bcc;},
    getObject: function() {return this.object},
    getRecipients: function() {return this.recipients;},
    getDate: function() {return this.date;},
    setSenders: function(senderList) {this.senders = senderList;},
    setCC: function(ccList) {this.cc = ccList;},
    setBCC: function(bccList) {this.bcc = bccList;},
    setObject: function(object) {this.object = object;},
    setRecipients: function(recipientList) {this.recipients = recipientList;},
    setDate: function(date) {this.date = date;}


});
