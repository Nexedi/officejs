/**
 * This file provides main classes to display the web page
 */

/*
 * global variables
 */
languages = ["fr","en"];
var availableLanguages = $("#available_languages");

currentPage = null;


/*
 * Page Class
 * used to decompose the page and give access to useful elements
 * @param page : name of the page to be created
 */
var Page = function(page) {
    this.name = page;
    this.html = window.document;
    this.xml = null;
    this.editor = null;
    //define as current page
    currentPage = this;
    if(page!=undefined) {this.loadXML("xml/"+page+".xml");}
}
Page.prototype = {
    setXML: function(data) {
        this.xml = data;
        this.loadPage();
    },
    //getters
    getXML: function() {return this.xml;},
    getHTML: function() {return this.html;},
    getTitle: function() {return $(this.getXML()).find("title").text();},
    getContent: function() {return $(this.getXML()).find("content").html();},
    getDependencies: function() {return $(this.getXML()).find("dependencies");},
    getEditor: function() {return this.editor;},
    setEditor: function(editor) {this.editor = editor;},

    //loaders
        /* load the xml document which contains the web page information */
    loadXML: function(source) {
        loadFile(source,"html",function(data) {getCurrentPage().setXML(data);});
    },
        /* update the HTML page from the XML document */
    loadPage: function() {
        //Page content
        this.displayPageTitle();
        this.displayPageContent();
        var dependencies = this.getDependencies();
        $(dependencies).find("linkfile").each(function() {currentPage.include($(this).text(),"link");});//includes css
        $(dependencies).find("scriptfile").each(function() {currentPage.include($(this).text(),"script");});//includes js
        
        var doc = null;
        var editor = null;
        /* load the editor to work with and a new document to work on */
        switch(this.name) {
            case "text-editor":
                    editor = new Xinha();
                    doc=new JSONTextDocument();
                    break;
            case "table-editor":
                    editor = new SheetEditor();
                    doc=new JSONSheetDocument();
                    break;
            case "image-editor":
                    editor = new SVGEditor();
                    doc=new JSONIllustrationDocument();
                    break;
            default://renvoie à la page d'accueil
                    window.location = "ung.html";
                    return;
                    break;
        }

        if(getCurrentDocument()) {doc.load(getCurrentDocument());}
        this.setEditor(editor);
        doc.setAsCurrentDocument();

    },
    /* include a javascript or a css file */
    include: function(file,type) {
        var object = null;
        switch(type) {
            case "script":
                    object = this.getHTML().createElement("script");
                    object.type = "text/javascript";
                    object.src = file;
                    break;

            case "style":
                    object = this.getHTML().createElement("link");
                    object.rel = "stylesheet";
                    object.href = file;
                    object.type = "text/css";
                    break;
        }

        var head = $(this.getHTML()).find("head").append(object);
    },


/* these methods display dynamically information about the page, user or current document
 * at the right place on the web page
 */
        //user information
        /* display the list of availaible languages */
    displayLanguages: function(user) {
        var avLang = "";

        for (var i = 0; i<languages.length; i++) {
            var l = languages[i];
            if(l==user.getLanguage()) {$("span#current_language").html(l);}
            else {
                avLang = avLang + "<li><span onclick='changeLanguage($(this).html())' id='" +l+ "'>"+l+"</span></li>\n"
            }
        }
        $("ul#available_languages").html(avLang);
    },
    displayUserName: function(user) {$("a#userName").html(user.getName());},

        //document information
    displayLastUserName: function(doc) {$("a#author").html(doc.getAuthor());},
    displayLastModification: function(doc) {$("a#last_update").html(doc.getLastModification());},
    displayDocumentTitle: function(doc) {
        var title = (doc.getTitle().length < 30) ? doc.getTitle() : doc.getTitle().substring(0,30) + "...";
        $("a#document_title").html(title);
    },
    displayDocumentContent: function(doc) {this.getEditor().loadContentFromDocument(doc);},
    displayDocumentState: function(doc) {$("a#document_state").html(doc.getState()[getCurrentUser().getLanguage()]);},

        //web page information
    displayPageTitle: function() {$("title#page_title").html(this.getTitle());},
    displayPageContent: function() {$("div#page_content").html(this.getContent());}
}
getCurrentPage = function() {return currentPage;}
setCurrentPage = function(page) {currentPage = page;}

/*
 * User Class
 * stores useful information about a user and provides methods to manipulate them
 * @param arg : a json User object to load
 */
var User = function(arg) {
    if(arg) {this.load(arg);}
    else {
        this.name = "unknown";
        this.language = "en";
        this.storage = "http://www.unhosted-dav.com";
        this.identityProvider = "http://www.webfinger.com";
        this.displayPreferences = 15;//number of displayed document in the list
    }
}
User.prototype = new UngObject();//inherits from UngObject
User.prototype.load({//add methods thanks to the UngObject.load method
    getName: function() {return this.name;},
    setName: function(newName) {this.name = newName;},
    getLanguage: function() {return this.language;},
    setLanguage:function(language) {this.language = language;},
    getStorageLocation: function() {return this.storage;},
    setStorageLocation: function(storage) {this.storage = storage;},
    getIdentityProvider: function() {return this.identityProvider;},
    setIdentityProvider: function(IDProv) {this.identityProvider = IDProv;},
    getDisplayPreferences: function() {return this.displayPreferences;},
    setDisplayPreferences: function(n) {this.displayPreferences = n;},

    setAsCurrentUser: function() {
        getCurrentPage().displayUserName(this);
        getCurrentPage().displayLanguages(this);
        setCurrentUser(this);
    }
});

getCurrentUser = function() {
    return new User(JSON.parse(localStorage.getItem("currentUser")));
}
setCurrentUser = function(user) {localStorage.setItem("currentUser", JSON.stringify(user));}



/**
 * Documents
 * This class is used to store information about document and provide methodes
 * to manipulate these elements.
 */

/**
 * JSON document
 * @param arg : a json JSONDocument object to load
 */
var JSONDocument = function(arg) {
    if(arg) {this.load(arg);}
    else {
        this.language = getCurrentUser().getLanguage();
        this.version = null;

        this.author=getCurrentUser().getName();
        this.lastUser=getCurrentUser().getName();
        this.title="Untitled";
        this.content="";
        this.creation=currentTime();
        this.lastModification=currentTime();
        this.state=JSONDocument.prototype.states.draft;
    }
}
JSONDocument.prototype = new UngObject();//inherits from UngObject

JSONDocument.prototype.load({//add methods thanks to the UngObject.load method
    //type
    getType: function() {return this.type;},
    setType: function(newType) {this.type = newType;},
    
    //version
    getVersion: function() {return this.version;},
    setVersion: function(version) {this.version = version;},

    //language
    getLanguage: function() {return this.language;},
    setLanguage: function(language) {this.language = language;},

    //content
    getContent:function() {return this.content;},
    setContent:function(content) {this.content=content;},

    //title
    getTitle:function() {return this.title;},
    setTitle:function(title) {this.title=title;},

    //author
    getAuthor:function() {return this.author;},
    setAuthor:function(userName) {this.author=userName;},
    getLastUser:function() {return this.lastUser;},
    setLastUser:function(user) {this.lastUser = user;},

    //dates
    getCreation:function() {return this.creation;},
    getLastModification:function() {return this.lastModification;},
    setLastModification:function(date) {this.lastModification=date;},

    //state
    getState:function() {return this.state;},
    setState:function(state) {this.state=state;},

    setAsCurrentDocument: function() {
        setCurrentDocument(this);
    },

    save: function(instruction) {
        var doc = this;
        saveFile(getDocumentAddress(this), doc, instruction);
    },
    remove: function(instruction) {deleteFile(getDocumentAddress(this), instruction);}
});
JSONDocument.prototype.states = {
    draft:{"fr":"Brouillon","en":"Draft"},
    saved:{"fr":"Enregistré","en":"Saved"},
    deleted:{"fr":"Supprimé","en":"Deleted"}
}
getCurrentDocument = function() {
    return new JSONDocument(JSON.parse(localStorage.getItem("currentDocument")));
}
setCurrentDocument = function(doc) {localStorage.setItem("currentDocument",JSON.stringify(doc));}

supportedDocuments = {"text":{editorPage:"text-editor",icon:"images/icons/document.png"},
        "illustration":{editorPage:"image-editor",icon:"images/icons/svg.png"},
        "table":{editorPage:"table-editor",icon:"images/icons/table.png"},
        "other":{editorPage:null,icon:"images/icons/other.gif"},
        undefined:{editorPage:null,icon:"images/icons/other.gif"}
}
getDocumentAddress = function(doc) {return "dav/"+doc.getCreation();}

/*************************************************
 ******************   actions   ******************
 *************************************************/
/**
 * open a dialog box to edit document information
 */
editDocumentSettings = function() {
    saveCurrentDocument();
    loadFile("xml/xmlElements.xml", "html", function(data) {
        $("rename", data).dialog({
            autoOpen: true,
            height: 131,
            width: 389,
            modal: true,
            buttons: {
                "Save": function(){
                    var doc = getCurrentDocument();
                    doc.setTitle($(this).find("#name").attr("value"));
                    doc.setLanguage($(getCurrentDocument()).find("#language").attr("value"));
                    doc.setVersion($(getCurrentDocument()).find("#version").attr("value"));
                    saveCurrentDocument();
                    doc.setAsCurrentDocument();//diplay modifications
                    $(this).dialog("close");
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            }
        });
    }
)}

/**
 * open a dialog box to upload a document
 */
uploadDocument = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) {
        $("upload", data).dialog({
            autoOpen: false,
            height: 116,
            width: 346,
            modal: true
        });
    });
}

/**
 * open a dialog box to propose gadgets
 */
gadgetListBox = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) {
        $("gadget", data).dialog({
            autoOpen: false,
            height: 416,
            width: 600,
            modal: true,
            buttons: {
                "Add": function(){
                    var gadgetIdList = Array();
                    $("table#gadget-table tbody tr td input").each(function(){
                        if (this.checked){
                            gadgetIdList.push($(this).attr("id"));
                        }
                    });
                    if (gadgetIdList.length == 0){
                        $(this).dialog("close");
                    }
                    var tabTitle = $("div#tabs ul li.tab_selected span").html();
                    $.ajax({
                        type: "post",
                        url:"WebSection_addGadgetList",
                        data: [{name:"gadget_id_list", value: gadgetIdList}],
                        success: function(data) {
                            window.location.reload();
                        }
                    });
                }
            }
        });
    });
}


saveCurrentDocument = function() {
    getCurrentPage().getEditor().saveEdition();
    getCurrentDocument().save();
}

 /**
  * start an editor to edit the document
  * @param doc : the document to edit
  */
var startDocumentEdition = function(doc) {
    loadFile(getDocumentAddress(doc),"json",function(data) {
        doc.load(data);
        setCurrentDocument(doc);
        if(supportedDocuments[doc.getType()].editorPage) {window.location = "theme.html";}
        else alert("no editor available for this document");
    });
}
var stopDocumentEdition = function() {
    saveCurrentDocument();
    window.location = "ung.html";
}

/**
 * change the language of the user and reload the web page
 * @param language : the new language
 */
var changeLanguage = function(language) {
    var user = getCurrentUser();
    user.setLanguage(language);
    setCurrentUser(user);
    getCurrentPage().displayLanguages(user);
    window.location.reload();
}
cancel_sharing = function() {alert("cancel");}
translate = function() {alert("translate");}
submit = function() {alert("submit");}
share = function() {alert("share");}
