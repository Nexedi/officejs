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
 * the list object is the documentList returned by the storage.
 * the detailedList object is the synchronized list containing more detailed information about documents
 * @param documentList : documents information loaded from the storage
 */
var DocumentList = function(documentList) {
    this.detailedList = {}
    if(documentList) {
        for(var doc in documentList) {
            this.detailedList[doc] = new JSONDocument(documentList[doc]);
        }
    }
    this.displayInformation = {};
    this.displayInformation.page = 1;
    this.selectionList = [];

     //check the user document list on the remote storage every 10 seconds
    var list = this;
    var updateDocumentList = function () {
        JIO.getDocumentList({
            success: function(data) {
                list.detailedList = data;
            }
        });
    }
    recursiveTask(function() {if(JIO.isReady()){updateDocumentList()}},10000);
}
DocumentList.prototype = new UngObject();
DocumentList.prototype.load({

    removeDocument: function(fileName) {
        getCurrentStorage().remove(fileName)//delete the file
        delete this.detailedList[fileName];//
        this.save();//save changes
    },

    get: function(fileName) {return this.getDetailedList()[fileName]},
    getList: function() {return getCurrentStorage().getDocumentList();},
    getDetailedList: function() {return this.detailedList},
    getSelectionList: function() {return this.selectionList;},
    resetSelectionList: function() {
        this.selectionList = [];

        //display consequences
        for(var i=this.getDisplayInformation().first-1; i<this.getDisplayInformation().last; i++) {
            $("tr td.listbox-table-select-cell input#"+i).attr("checked",false);//uncheck
        }
        $("span#selected_row_number a").html(0);//display the selected row number
    },
    checkAll: function() {
        this.selectionList = [];
        var list = toArray(this.getList());

        var begin = 0;
        var end = list.length;
        if(getCurrentUser().getSetting("checkAllMethod")=="page") {
            begin = this.getDisplayInformation().first-1;
            end = this.getDisplayInformation().last;
        }
        for(var i=begin; i<end; i++) {
            this.addToSelection(list[i].fileName);
        }

        //display consequences
        for(i=this.getDisplayInformation().first-1; i<this.getDisplayInformation().last; i++) {
            $("tr td.listbox-table-select-cell input#"+i).attr("checked",true);//check
        }
        $("span#selected_row_number a").html(list.length);//display the selected row number
    },
    addToSelection: function(fileName) {
        this.getSelectionList().push(fileName);
    },
    removeFromSelection: function(fileName) {
        var selection = getDocumentList().getSelectionList();
        selection.splice(selection.indexOf(fileName),1);
    },

    deleteSelectedDocuments: function() {
        var selection = this.getSelectionList();
        while(selection.length>0) {
            var fileName = selection.pop();
            this.removeDocument(fileName);
        }
        this.display();
    },

    getDisplayInformation: function() {return this.displayInformation;},
    getDisplayedPage: function() {return this.getDisplayInformation().page;},
    setDisplayedPage: function(index) {
        this.displayInformation.page = index;
        this.display();
    },
    changePage: function(event) {
        var newPage = this.getDisplayedPage();
        switch(event.target.className.split(" ")[0]) {
            case "listbox_set_page":newPage = event.target.value;break;
            case "listbox_next_page":newPage++;break;
            case "listbox_previous_page":newPage--;break;
            case "listbox_last_page":newPage = this.getDisplayInformation().lastPage;break;
            case "listbox_first_page":newPage = 1;break;
        }
        this.setDisplayedPage(newPage);
    },

    /* display the list of documents in the web page */
    displayContent: function(list) {//display the list of document itself
        $("table.listbox tbody").html("");//empty the previous displayed list
        var detailedList = this.getDetailedList();
        for(var i=this.getDisplayInformation().first-1;i<this.getDisplayInformation().last;i++) {
            var fileName = list[i].fileName;
            var doc = detailedList[fileName];
            var documentList = this;
            (function tryToDisplay(j) {//update document information before displaying
                if(!doc || new Date(detailedList[fileName].lastModification+1000)<new Date(list[j].lastModify)) {
                    documentList.updateDocumentInformation(fileName);
                    setTimeout(function(){tryToDisplay.call(this,j)},500);
                } else {
                    var line = new Line(doc,j);
                    line.updateHTML();
                    line.display();
                    if(this.getSelectionList().indexOf(doc.fileName)) {line.setSelected(true);}//check the box if selected
                }
            })(i)

        }
    },
    displayListInformation: function(list) {//display number of records, first displayed document, last displayed document...
        if(list.length>0) {
            $("div.listbox-number-of-records").css("display","inline");

            $("span#page_start_number").html(this.getDisplayInformation().first);
            $("span#page_stop_number").html(this.getDisplayInformation().last);
            $("span#total_row_number a").html(list.length);
            $("span#selected_row_number a").html(this.getSelectionList().length);
        }
        else {$("div.listbox-number-of-records").css("display","none");}
    },
    displayNavigationElements: function() {//display buttons first-page, previous, next, last-page
        var lastPage = this.getDisplayInformation().lastPage;
        var disp = function(element,bool) {
            bool ? $(element).css("display","inline") : $(element).css("display","none");
        }
        disp("div.listbox-navigation",this.getDisplayInformation().lastPage>1);
        if(lastPage>1) {
            $("div.listbox-navigation input.listbox_set_page").attr("value",this.getDisplayedPage());
            $("div.listbox-navigation span.listbox_last_page").html(lastPage);

            disp("div.listbox-navigation button.listbox_first_page",this.getDisplayedPage()>1);
            disp("div.listbox-navigation button.listbox_previous_page",this.getDisplayedPage()>1);
            disp("div.listbox-navigation button.listbox_next_page",this.getDisplayedPage()<lastPage);
            disp("div.listbox-navigation button.listbox_last_page",this.getDisplayedPage()<lastPage);
        }
    },
    display: function() {
        var list = toArray(this.getList());
        this.updateDisplayInformation(list);
        this.displayContent(list);
        this.displayListInformation(list);
        this.displayNavigationElements();
    },

    /* update the ith document information */
    updateDocumentInformation: function(fileName) {
        var list = this.getDetailedList();
        getCurrentStorage().getDocument(fileName, function(doc) {
            list[fileName]=doc;
            list[fileName].fileName = fileName;
            doc.setContent("");
        });
    },
    /* update the document to be displayed */
    updateDisplayInformation: function(list) {
        var infos = this.getDisplayInformation();
        infos.step = getCurrentUser().getSetting("displayPreferences"),//documents per page
        infos.first = (infos.page-1)*infos.step + 1,//number of the first displayed document
        infos.last = list.length<(infos.first+infos.step) ? list.length : (infos.first+infos.step-1);//number of the last displayed document
        infos.lastPage = Math.ceil(list.length/infos.step);
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
    getType: function() {return this.document.getType() || "other";},
    getHTML: function() {return this.html;},
    setHTML: function(newHTML) {this.html = newHTML;},
    setSelected: function(bool) {$("tr td.listbox-table-select-cell input#"+this.getID()).attr("checked",bool)},
    isSelected: function() {
        return $("tr td.listbox-table-select-cell input#"+this.getID()).attr("checked");
    },

    /* add the document of this line to the list of selected documents */
    addToSelection: function() {
        getDocumentList().addToSelection(this.getDocument().fileName);
    },
    /* remove the document of this line from the list of selected documents */
    removeFromSelection: function() {
        getDocumentList().removeFromSelection(this.getDocument().fileName);
    },
    /* check or uncheck the line */
    changeState: function() {
        this.isSelected() ? this.addToSelection() : this.removeFromSelection();
        $("span#selected_row_number a").html(getDocumentList().getSelectionList().length);//display the selected row number
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
                    Document.startDocumentEdition(line.getDocument())
                })
                .find("a.listbox-document-icon")
                    .find("img")
                        .attr("src",Document.supportedDocuments[this.getType()].icon)//icon
                    .end()
                .end()
                .find("a.listbox-document-title").html(this.getDocument().getTitle()).end()
                .find("a.listbox-document-state").html(this.getDocument().getState()[getCurrentUser().getSetting("language")]).end()
                .find("a.listbox-document-date").html(this.getDocument().getLastModification()).end()
            .end());
    },
    /* add the line in the table */
    display: function() {$("table.listbox tbody").append($(this.getHTML()));}
}
/* load the html code of a default line and execute the callback */
Line.loadHTML = function(callback) {
    loadFile("xml/xmlElements.xml", "html", function(data) {
        Line.originalHTML = $(data).find("line table tbody").html();
        callback(Line.getOriginalHTML());
    });
    return Line.originalHTML;
}
/* return the html code of a default line */
Line.getOriginalHTML = function() {return Line.originalHTML;}





 /**
  * create a new document and start an editor to edit it
  * @param type : the type of the document to create
  */
var createNewDocument = function(type) {
    var newDocument = new JSONDocument();
    newDocument.setType(type);
    var fileName = DOcument.getAddress(newDocument);

    newDocument.save(function() {
        getDocumentList()[fileName]=newDocument;
        getCurrentStorage().save();
        Document.startDocumentEdition(newDocument);
    });
}
