/**
 * This file provides the javascript used to display the list of user's documents
 */

/* global variable */
    /* the last modified document */
getCurrentDocumentID = function() {return localStorage.getItem("currentDocumentID");}
setCurrentDocumentID = function(ID) {return localStorage.setItem("currentDocumentID",ID);}

/**
 * class DocumentList
 * This class provides methods to manipulate the list of documents of the current user
 * @param arg : a documentList json object to load
 */
var DocumentList = function(arg) {
    //List.call(this);
    if(arg) {
        this.load(arg);
        this.load(new List(arg,JSONDocument));
        this.selectionList = new List(arg.selectionList);//load methods of selectionList
    }
    else {
        List.call(this);
        this.selectionList = new List();
    }
}
DocumentList.prototype = new List();
DocumentList.prototype.load({

    removeDocument: function(doc) {
        var i = this.find(doc);
        this.get(i).remove()//delete the file
        this.remove(i);//remove from the list
        getCurrentStorage().save();//save changes
    },

    getSelectionList: function() {return this.selectionList;},
    resetSelectionList: function() {
        this.selectionList = new List();

        //display consequences
        for(var i=0; i<this.size(); i++) {
            $("tr td.listbox-table-select-cell input#"+i).attr("checked",false);//uncheck
        }
        $("span#selected_row_number a").html(0);//display the selected row number
    },
    checkAll: function() {
        this.selectionList = new List();
        for(var i=0; i<this.size(); i++) {
            this.getSelectionList().add(this.get(i));
        }

        //display consequences
        for(i=0; i<this.size(); i++) {
            $("tr td.listbox-table-select-cell input#"+i).attr("checked",true);//check
        }
        $("span#selected_row_number a").html(this.size());//display the selected row number
    },

    deleteSelectedDocuments: function() {
        var selection = this.getSelectionList();
        while(!selection.isEmpty()) {
            var doc = selection.pop();
            this.removeDocument(doc);
        }
        this.display();
    },

    /* display the list of documents in the web page */
    displayContent: function() {
        $("table.listbox tbody").html("");//empty the previous displayed list
        for(var i=0;i<this.size();i++) {
            var doc = this.get(i);
            var ligne = new Line(doc,i);
            ligne.updateHTML();
            ligne.display();
            if(this.getSelectionList().contains(doc)) {ligne.setSelected(true);}//check the box if selected
        }
    },
    display: function() {
        this.displayContent();
    },

    /* update the ith document information */
    updateDocumentInformation: function(i) {
        var list = this;
        var doc = list.get(i);
        getCurrentStorage().getDocument(getDocumentAddress(doc), function(data) {
            doc.load(data);//todo : replace by data.header
            doc.setContent("");//
            list.set(i,doc);
        });
    },

    setAsCurrentDocumentList: function() {
        this.display();
    }
});
getDocumentList = function() {
    return getCurrentUser().getDocumentList();
}


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
    setSelected: function(bool) {$("tr td.listbox-table-select-cell input#"+this.getID()).attr("checked",bool)},
    isSelected: function() {
        return $("tr td.listbox-table-select-cell input#"+this.getID()).attr("checked");
    },

    /* add the document of this line to the list of selected documents */
    addToSelection: function() {
        getDocumentList().getSelectionList().add(this.getDocument());
    },
    /* remove the document of this line from the list of selected documents */
    removeFromSelection: function() {
        getDocumentList().getSelectionList().removeElement(this.getDocument());
    },
    /* check or uncheck the line */
    changeState: function() {
        this.isSelected() ? this.addToSelection() : this.removeFromSelection();
        $("span#selected_row_number a").html(getDocumentList().getSelectionList().size());//display the selected row number
    },

    /* load the document information in the html of a default line */
    updateHTML: function() {
        var line = this;

        this.setHTML($(this.getHTML()).attr("class",this.getType())
            .find("td.listbox-table-select-cell input")
                .attr("id",this.getID())//ID
                .click(function() {line.changeState();})//clic on a checkbox
            .end()
            .find("td.listbox-table-data-cell")
                .click(function() {//clic on a line
                    setCurrentDocumentID(line.getID());
                    startDocumentEdition(line.getDocument())
                })
                .find("a.listbox-document-icon")
                    .find("img")
                        .attr("src",supportedDocuments[this.getType()].icon)//icon
                    .end()
                .end()
                .find("a.listbox-document-title").html(limitedString(this.getDocument().getTitle(),10)).end()
                .find("a.listbox-document-date").html(this.getDocument().getLastModification()).end()
            .end());
    },
    /* add the line in the table */
    display: function() {$("table.listbox tbody").append($(this.getHTML()));}
}
/* load the html code of a default line */
Line.loadHTML = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) {Line.originalHTML = $(data).find("line table tbody").html();});
    return Line.originalHTML;
}
/* return the html code of a default line */
Line.getOriginalHTML = function() {return Line.originalHTML;}





 /**
  * create a new document and start an editor to edit it
  * @param type : the type of the document to create
  */
var createNewDocument = function(type) {
    if(type=="title") {return}
    var newDocument = new JSONDocument();
    newDocument.setType(type);

    newDocument.save(function() {
        getDocumentList().add(newDocument);
        getCurrentStorage().save();
        startDocumentEdition(newDocument);
    });
}
