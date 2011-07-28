/**
 * This file provides the javascript used to display the list of user's documents
 */

/* global variable */
    /* the last modified document */
getCurrentDocumentID = function() {return localStorage.getItem("currentDocumentID");}
setCurrentDocumentID = function(ID) {return localStorage.setItem("currentDocumentID",ID);}

/**
 * class EMailList
 * This class provides methods to manipulate the list of emails of the current user
 * @param arg : an eMailList json object to load
 */
var EMailList = function(arg) {
    //List.call(this);
    if(arg) {
        this.load(arg);
        this.load(new List(arg,JSONEMail));
        this.selectionList = new List(arg.selectionList);//load methods of selectionList
    } else {
        List.call(this);
        this.displayInformation = {};
        this.displayInformation.page = 1;
        this.selectionList = new List();
    }
}
EMailList.prototype = new List();
EMailList.prototype.load({

    removeEMail: function(doc) {
        var i = this.find(doc);
        this.get(i).remove()//delete the file
        this.remove(i);//remove from the list
        getCurrentStorage().save();//save changes
    },

    getSelectionList: function() {return this.selectionList;},
    resetSelectionList: function() {
        this.selectionList = new List();

        //display consequences
        for(var i=this.getDisplayInformation().first-1; i<this.getDisplayInformation().last; i++) {
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
        for(i=this.getDisplayInformation().first-1; i<this.getDisplayInformation().last; i++) {
            $("tr td.listbox-table-select-cell input#"+i).attr("checked",true);//check
        }
        $("span#selected_row_number a").html(this.size());//display the selected row number
    },

    applyToSelection: function(action,location) {
        var selection = this.getSelectionList();

        var toApply;
        switch(action) {
            case "moveTo": toApply = getCurrentEMailList().label=="bin" ? function(mail) {this.removeEMail(mail)} : function(mail) {};break;
            case "read": toApply=function(mail) {};break;
            case "unread": toApply=function(mail) {};break;
        }
        
        while(!selection.isEmpty()) {
            var mail = selection.pop();
            toApply(mail);
        }
        this.resetSelectionList();
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
    displayContent: function() {
        $("table.listbox tbody").html("");//empty the previous displayed list
        for(var i=this.getDisplayInformation().first-1;i<this.getDisplayInformation().last;i++) {
            var doc = this.get(i);
            var ligne = new Line(doc,i);
            ligne.updateHTML();
            ligne.display();
            if(this.getSelectionList().contains(doc)) {ligne.setSelected(true);}//check the box if selected
        }
    },
    displayListInformation: function() {
        if(this.size()>0) {
            $("div.listbox-number-of-records").css("display","inline");

            $("span#page_start_number").html(this.getDisplayInformation().first);
            $("span#page_stop_number").html(this.getDisplayInformation().last);
            $("span#total_row_number a").html(this.size());
            $("span#selected_row_number a").html(this.getSelectionList().size());
        }
        else {$("div.listbox-number-of-records").css("display","none");}
    },
    displayNavigationElements: function() {
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
        this.updateDisplayInformation();
        this.displayContent();
        this.displayListInformation();
        this.displayNavigationElements();
    },
    /* update the document to be displayed */
    updateDisplayInformation: function() {
        var infos = this.getDisplayInformation();
        infos.step = getCurrentUser().getSetting("displayPreferences"),//documents per page
        infos.first = (infos.page-1)*infos.step + 1,//number of the first displayed document
        infos.last = (this.size()<(infos.first+infos.step)) ? this.size() : infos.first+infos.step-1//number of the last displayed document
        infos.lastPage = Math.ceil(this.size()/infos.step);
    },

    setAsCurrentDocumentList: function() {
        this.display();
    }
});
getEMailList = function() {
    return getCurrentUser().getEMailList();
}


/**
 * create a line representing a document in the main table
 * @param mail : email to represent
 * @param i : ID of the line (number)
 */
var Line = function(mail, i) {
    this.email = mail;
    this.ID = i;
    this.html = Line.getOriginalHTML();
}
Line.prototype = {
    getEMail: function() {return this.email;},
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
                    setCurrentEMailID(line.getID());
                    startEMailEdition(line.getEMail())
                })
                .find("a.listbox-email-sender").html(this.getEMail().getSenders()).end()
                .find("a.listbox-email-object").html(this.getEMail().getObject()[getCurrentUser().getSetting("language")]).end()
                .find("a.listbox-email-date").html(this.getEMail().getLastModification()).end()
            .end());
        if(getEmail().getAttachment()) {
            this.setHTML($("<img>",{src:"images/icons/attachment.png", css:{height:"1em"}}).appendTo(this.getHTML().find("a.listbox-email-attachment")));
        }
    },
    /* add the line in the table */
    display: function() {$("table.listbox tbody").append($(this.getHTML()));}
}
/* load the html code of a default line */
Line.loadHTML = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) {Line.originalHTML = $(data).find("email table tbody").html();});
    return Line.originalHTML;
}
/* return the html code of a default line */
Line.getOriginalHTML = function() {return Line.originalHTML;}





 /**
  * create a new email and start an editor to edit it
  */
var createNewEMail = function() {
    var newEMail = new EMail();
    newEMail.save(function() {
        getMailList().add(newEMail);
        getCurrentStorage().save();
        startEMailEdition(newEMail);
    });
}


createMoveToMenu = function(labelList) {
    $("div#move_to_list").html("");
    for(var label in labelList) {
        var span = JQuery("<span>",{text:label});
        var div = $("<div>",{click: function() {getMailList().applyToSelection('moveTo',label)}});
        $("<li>", {}).html(div.html(span)).appendTo("div#move_to_list");
    }
}


/**
 * Class IMAPStorage
 * this class provides usual API to save/load/delete emails with imap
 */
var IMAPStorage = function(userName) {
    getCurrentStorage().load({
        loadEmail: function(ID) {},
        saveEmail: function(mail,ID) {},
        deleteEmail: function(ID) {}
    });
}

/**
 * Class Label
 * used to load the methods of emails
 */
var Label = function(arg) {
    this.load(arg ? new List(arg,JSONEMail) : new List());
}

/**
 * Class MailBox
 * this class provides API to send/receive and manipulate emails
 */
var initMailBox = function(user, mailProvider) {
    getCurrentStorage().load({
        userName: user,
        provider: mailProvider,
        saveEmail: function(mail,ID) {},
        deleteEmail: function(ID) {},
        sendEMail: function(mail) {},
        loadEMail: function(ID) {}
    });
}
    if(arg) {

    } else {
        this.provider = "";
        this.userName = "";
        this.labelList = new List();
    }
}
MailBox.prototype = new UNGProject();
MailBox.prototype.load({
    getLabelList: function() {return this.labelList;},
    getLabelList: function() {return this.labelList;},
    getLabelList: function() {return this.labelList;},
    getLabelList: function() {return this.labelList;},

});

getCurrentEMail = function() {
    if(!currentEMail) {
        currentEMail = new JSONEMail(JSON.parse(localStorage.getItem("currentEMail")));
    }
    return currentEMail;
}
setCurrentEMail = function(mail) {
    currentEMail = mail;
    localStorage.setItem("currentEMail",JSON.stringify(mail));
}