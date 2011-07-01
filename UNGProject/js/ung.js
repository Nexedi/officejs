/**
 * This file provides the javascript used to display the list of user's documents
 */

/**
 * class DocumentList
 * This class provides methods to manipulate the list of documents of the current user
 */
var DocumentList = function() {List.call(this);}
DocumentList.prototype = new List();
DocumentList.prototype.load({
    get: function(i) {
        var doc = new JSONDocument();
        doc.load(this.content[i]);
        return doc;
    },
    add: function(doc) {
        this.content[this.size()]=doc;
        this.length++;
        setDocumentList(this)
    },
    display: function() {
        var n = getDocumentList().size();
        for(var i=0;i<n;i++) {
            var ligne = new Line(getDocumentList().get(i),0);
            ligne.updateHTML();
            ligne.display();
        }
    }
})

/* initialize the list */
//current lines are just for testing
setDocumentList(new List());
loadTest("dav/temp.json");
loadTest("dav/temp2.json");
getDocumentList().add(new JSONDocument());




/**
 * create a line representing a document in the main table
 * @param doc : document to represent
 * @param i : ID of the line (number)
 */
var Line = function(doc, i) {
    this.document = doc;
    this.ID = i;
    this.html = Line.getOriginalHTML();
}
Line.prototype = {
    getDocument: function() {return this.document;},
    getID: function() {return this.ID;},
    getType: function() {return this.document.getType() ? this.document.getType() : "other";},
    getHTML: function() {return this.html;},
    setHTML: function(newHTML) {this.html = newHTML;},
    isSelected: function() {
        return $("tr td.listbox-table-select-cell input#"+this.ID).attr("checked");
    },

    /* load the document information in the html of a default line */
    updateHTML: function() {
        var line = this;
        this.setHTML($(this.getHTML()).attr("class",this.getType())
            .find("td.listbox-table-select-cell input").attr("id",this.getID()).end()//ID
            .find("td.listbox-table-data-cell")
                .click(function() {line.startEdition(line.getDocument())})//clic
                .find("a.listbox-document-icon")
                    .find("img")
                        .attr("src",supportedDocuments[this.getType()].icon)//icon
                    .end()
                .end()
                .find("a.listbox-document-title").html(this.getDocument().getTitle()).end()
                .find("a.listbox-document-state").html(this.getDocument().getState()[getCurrentUser().getLanguage()]).end()
                .find("a.listbox-document-date").html(this.getDocument().getLastModification()).end()
            .end());
    },
    /* add the line in the table */
    display: function() {$("table.listbox tbody").append($(this.getHTML()));},
    /* edit the document if clicked */
    startEdition: function(doc) {
        setCurrentDocument(doc);
        if(supportedDocuments[doc.getType()].editorPage) {window.location = "theme.html";}
        else alert("no editor available for this document");
    }

}
/* load the html code of a default line */
Line.loadHTML = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) {Line.originalHTML = $(data).find("line table tbody").html();});
    return Line.originalHTML;
}
/* return the html code of a default line */
Line.getOriginalHTML = function() {return Line.originalHTML;}
