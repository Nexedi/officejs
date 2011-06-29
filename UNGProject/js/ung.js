var documentList = getDocumentList();
documentList.add(new JSONDocument());
documentList.add(new JSONDocument());
documentList.add(new JSONDocument());

/**
 * create a ligne representing a document in the main table
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
        this.setHTML($(this.getHTML()).attr("class",this.getType())
            .find("td.listbox-table-select-cell input").attr("id",this.getID()).end()//ID
            //.find("td.listbox-table-data-cell a").attr("onclick",this.startEdition).end()//clic
            .find("td.listbox-table-data-cell")
                .click(this.startEdition)//clic
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
    startEdition: function() {
        setCurrentDocument(this.document);
        window.location = "theme.html";
    }
}
/* load the html code of a default line */
Line.loadHTML = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) {Line.originalHTML = $(data).find("line table tbody").html();});
    return Line.originalHTML;
}
/* return the html code of a default line */
Line.getOriginalHTML = function() {return Line.originalHTML;}

/* load the table */
waitBeforeSucceed(
    function(){return Line.loadHTML()},
    function() {
        for(var i=0;i<documentList.size();i++) {
            var ligne = new Line(documentList.get(i),0);
            ligne.updateHTML();
            ligne.display();
        }
    }
);