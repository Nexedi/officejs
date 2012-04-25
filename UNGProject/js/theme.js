/**
 * This file provides main classes to display the web page
 */

/*
 * global variables
 */
applicationID = window.location.href.split("://")[1].split("/")[0]; //should be removed and better implemented
LANGUAGES = ["fr","en"];
function getCurrentStorage() {
    return Storage.currentStorage;
}

/*
 * Page
 * used to decompose the page and give access to useful elements.
 * initialize with Page.initialize(pageName)
 * @param pageName : name of the page to be created
 */
var Page = {
    initialize: function(page) {
        this.name = page;
        this.xml = null;            //will contain some html elements
        this.editor = null;         //will contain the editor

        //load and include editors to the page
        //(could be written better)
        if(page!="ung" &&page!="mail" && page !=undefined) {
            this.loadXML("xml/"+page+".xml");
        } else {
            //display user information when the storage is ready
            if (Storage.user) {
                Page.displayUserInformation(getCurrentUser());
                DocumentList.initialize();
            } else {
                Storage.addEventHandler(function() {
                    Page.displayUserInformation(getCurrentUser());
                    DocumentList.initialize();
                },Storage.USER_READY);
            }
            //display the document list when the line factory is ready
            Line.loadHTML(function() {
                Storage.addEventHandler(function() {
                    DocumentList.detailedList = Storage.getDocumentList();
                    DocumentList.display();
                },Storage.LIST_READY);
                if(DocumentList.getDetailedList()) {DocumentList.display()}
            });
        }
    },
    //getters
    getName: function() {return this.name;},
    getXML: function() {return this.xml;},
    getHTML: function() {return window.document;},
    getTitle: function() {return $(this.getXML()).find("title").text();},
    getContent: function() {return $(this.getXML()).find("content").html();},
    getDependencies: function() {return $(this.getXML()).find("dependencies");},
    getEditor: function() {return this.editor;},
    loadEditor: function(editor) {   //load the favourite editor of the user
	this.editor = new editor();
    },

    //loaders
        /* load the xml document which contains the web page information
         * and display this information */
    loadXML: function(source) {
        var page = this;
        loadFile(source,"html",function(data) {
            page.xml = data;
            Page.displayPageInformation();

            var dependencies = Page.getDependencies();
            $(dependencies).find("linkfile").each(function() {page.include($(this).text(),"link");});//includes css
            $(dependencies).find("scriptfile").each(function() {page.include($(this).text(),"script");});//includes js
            // load the user, the editor and the document in the page (wait for the storage being ready)
            var initPage = function() { 
		var editor = window[getCurrentUser().getSetting("favouriteEditor")[Page.getName()]];
                if(!editor) {// this hack doesn't work and I have no idea why
                     setTimeout(function() {initPage()},500);console.log("try");
                     $.ajax({
                         url: "js/text-editor.js",
                         type: "GET",
                         dataType: "text",
		         cache: true,
                         success: function(data) {eval(data);},
                         error: function(type) {alert("Error "+type.status+" : fail while trying to load "+"js/text-editor.js");}
                     });
                }
                else {
                     Page.loadEditor(editor);
                     Page.displayUserInformation(getCurrentUser());
                     Page.displayDocumentInformation(getCurrentDocument());
                }
            }
            Storage[Storage.USER_READY] ? initPage() : Storage.addEventHandler(initPage,Storage.USER_READY);
	    });
    },

    /* include a javascript or a css file */
    // could be written better
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
    displayPageInformation: function () {
        this.displayPageTitle();
        this.displayPageContent();
    },
    displayUserInformation: function (user) {
        this.displayUserName(user);
        this.displayLanguages(user);
    },
    displayDocumentInformation: function (doc) {
        this.displayDocumentTitle(doc);
        this.displayDocumentState(doc);
        this.displayDocumentContent(doc);
        this.displayLastModification(doc);
        this.displayLastUserName(doc);
    },

        //user information
        /* display the list of availaible languages */
    displayLanguages: function(user) {
        var avLang = "";

        for (var i = 0; i<LANGUAGES.length; i++) {
            var l = LANGUAGES[i];
            if(l==user.getSetting("language")) {$("span#current_language").html(l);}
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
    displayDocumentState: function(doc) {$("a#document_state").html(doc.getState()[getCurrentUser().getSetting("language")]);},

        //web page information
    displayPageTitle: function() {$("title#page_title").html(this.getTitle());},
    displayPageContent: function() {$("div#page_content").html(this.getContent());}
}
function getCurrentPage() {return Page;}

/*
 * User Class
 * stores useful information about a user and provides methods to manipulate them
 * @param arg : a json User object to load
 */
var User = function(arg) {
    if(arg) {
        this.load(arg);
        if(window.LabelList) {this.labelList = new LabelList(arg.labelList);}// labels of the user
        if(window.GroupList) {this.groupList = new GroupList(arg.groupList);}// contact groups of the user
    }
    else {
        this.name = "UNG";//default name
        this.settings = {
            language: "en",
            displayPreferences: 15,//number of displayed document in the list
            checkAllMethod: "page",//check only the displayed page
            favouriteEditor: {
                "text-editor": "Xinha",
                "table-editor": "SheetEditor",
                "image-editor": "SVGEditor"
            }
        }
    }
}
User.prototype = new UngObject();//inherits from UngObject
User.prototype.load({//add methods thanks to the UngObject.load method
    getName: function() {return this.name;},
    setName: function(newName) {this.name = newName;},
    getSetting: function(key) {return this.settings[key];},
    setSetting: function(key,value) {this.settings[key] = value;},
    getSettings: function() {return this.settings;},

    getStorageLocation: function() {return this.storageLocation;}
});

getCurrentUser = function () {
    return getCurrentStorage().getUser();
}





/**
 * Storage
 * this element provides usual API to save/load/delete elements
 */
var Storage = new UngObject();
Storage.load({
    /* create the storage from storage. Used in the login page */
    create: function (jioFileContent) {
        this.jio = typeof jioFileContent == "string" ? JSON.parse(jioFileContent) : jioFileContent;
        JIO.initialize(jioFileContent,{"ID":"www.ungproject.com"});
        Storage.currentStorage = this;
        //try to load user parameters
        var storage = this;
        var option = {
            success: function(data) {//success
                storage.user = new User(JSON.parse(data));
                storage.userName = storage.user.getName();
                storage.save(function() {storage.fireEvent(Storage.STORAGE_CREATED);});
            },
            errorHandler: function(errorEvent) {//fail
                if(errorEvent.status==404){//create a new user if there was no such one
                    var user = new User();
                    //user.setName("host");
                    storage.user = user;
                    storage.userName = storage.user.getName();
                    storage.user.storageLocation = storage.jio.location;
                    storage.save(function() {storage.fireEvent(Storage.STORAGE_CREATED);});
                }
            }
        }
        JIO.ready(function(){JIO.loadDocument(storage.jio.userName+".profile", option)});


    },

    /* initialize the storage from the localStorage */
    initialize: function () {
        var dataStorage = JSON.parse(localStorage.getItem("currentStorage"));

     //   if(!dataStorage) {window.location.href = "index.html";}//if it's the first connexion
        this.jio = dataStorage.jio;
        JIO.initialize(dataStorage.jio, {"ID":"www.ungproject.com"});
        Storage.currentStorage = this;

        //wait for JIO being ready
        JIO.ready(function(){Storage.setUser(new User(dataStorage.user))});
    },
    USER_READY: "userReady",           // value of the USER_READY event
    LIST_READY: "listReady",           // value of the LIST_READY event
    STORAGE_CREATED: "storageCreated", // value of the STORAGE_CREATED event

    getJIO: function() {return this.jio;},
    loadUser: function(userName) {//warning no return value
        var option = {
            success: function(data) {Storage.setUser(new User(JSON.parse(data)));},
            errorHandler: function(errorEvent) {if(errorEvent.status==404){}}
        }
        JIO.loadDocument(userName+".profile", option);
    },
    getDocument: function(fileName, instruction) {
        var option = {
            success:function(content) {
                var doc = new JSONDocument(JSON.parse(content));
                if(instruction) instruction(doc);
            }
        };
        JIO.loadDocument(fileName, option);
    },
    getDocumentMetaData: function(fileName, instruction) {
        //optimized only if an indexedStorage is included in the storage
        var option = {
            metaDataOnly: true,
            success:function(content) {
                var doc = new JSONDocument(JSON.parse(content));
                if(instruction) instruction(doc);
            }
        };
        JIO.loadDocument(fileName, option);
    },
    saveDocument: function(doc, fileName, instruction) {
        var metaData = doc.copy();
        delete metaData.content;
        var option = {
            overwrite: true,
            success: instruction,
            metaData: metaData
        };
        JIO.saveDocument(JSON.stringify(doc), fileName, option);
    },
    deleteDocument: function(file, instruction) {
        var option = {success: instruction};
        JIO.deleteDocument(file, option);
    },
    getDocumentList: function(instruction) {
        if(instruction) instruction(this.documentList);
        return this.documentList;
    },
    updateDocumentList: function() {
        var option = {
            success: function(list) {
                delete list[getCurrentUser().getName()+".profile"];//remove the profile file
                var documentList = [];

                //treat JSON documents
                for (var element in list) {
                    if(!documentList[element]) {
                        documentList[element] = new JSONDocument(list[element]);
                    } else {
                        documentList[element].load(list[element])
                    }
                }
                Storage.documentList = documentList;
                Storage.fireEvent(Storage.LIST_READY);
            }
        }
        JIO.getDocumentList(option);
    },
    save: function(instruction) { // update and save user information in the localStorage
        var user = this.user;
        var metaData = user.copy();
        delete metaData.content;
        var option = {
            success: function() {
                var storage = {
                    jio:Storage.jio,
                    user:Storage.user,
                    userName:Storage.userName
                }
                localStorage.currentStorage = JSON.stringify(storage);
                if(instruction) {instruction();}
            },
            overwrite: true,
            metaData: metaData
        };
        JIO.saveDocument(JSON.stringify(user), user.getName()+".profile", option);
    },

    getUser: function() {return this.user;},
    setUser: function(user) {
        this.user = user;
        this.userName = user.getName();
        Storage.fireEvent(Storage.USER_READY);

        getCurrentStorage().save();
    },
    fireEvent: function(event) {
        Storage[event] = true;
        UngObject.prototype.fireEvent.call(this,event);
    }
});

function getCurrentStorage() {
    return Storage.currentStorage;
}





/**
 * Documents
 * This class is used to store information about document and provide methodes
 * to manipulate these elements.
 */



           
var Document = {
     /**
      * save document modification
      */
    saveCurrentDocument: function() {
        getCurrentPage().getEditor().saveEdition();
	getCurrentDocument().save();
        localStorage.currentDocument = JSON.stringify(getCurrentDocument());
    },

     /**
      * start an editor to edit the document
      * @param doc : the document to edit
      */

    startDocumentEdition: function(doc) {
        if(Document.supportedDocuments[doc.getType()].editorPage) {
            getCurrentStorage().getDocument(doc.getAddress(), function(data) {
	       this.setCurrentDocument(data);
	       // initialize
               var thedialog;
               var inittheme = function() {
                    Page.initialize(Document.supportedDocuments[getCurrentDocument().getType()].editorPage);
                    Storage.initialize();
                    thedialog = $("#diag").dialog({title:"",modal: true, autoOpen: false});
               }
               $(document).ready(inittheme);
	       showUng(false);
          });
        } else {
            alert("no editor available for this document");
        }
    },

     /**
      * save document modification and go back to the documentList
      */
    stopDocumentEdition: function() {
     //   this.saveCurrentDocument();

        showUng(true);
        return false;
    },

     /**
      * list of supported document types and the editor and icon linked to each type
      */
    supportedDocuments: {
        "text":{editorPage:"text-editor",icon:"images/icons/document.png"},
        "illustration":{editorPage:"image-editor",icon:"images/icons/svg.png"},
        "table":{editorPage:"table-editor",icon:"images/icons/table.png"},
        "other":{editorPage:null,icon:"images/icons/other.gif"},
        undefined:{editorPage:null,icon:"images/icons/other.gif"}
    }
}
function getCurrentDocument() {
    if(!Document.currentDocument) {
        Document.currentDocument = new JSONDocument(JSON.parse(localStorage.getItem("currentDocument")));
    }
    return Document.currentDocument;
}
function setCurrentDocument(doc) {
    localStorage.setItem("currentDocument",JSON.stringify(doc));
    Document.currentDocument = doc;
}

/**
 * JSON document
 * @param arg : a json JSONDocument object to load
 */
var JSONDocument = function(arg) {
    if(arg) {this.load(arg);}
    else {
        this.language = getCurrentUser().getSetting("language");
        this.version = null;

        this.author=getCurrentUser().getName();
        this.lastUser=getCurrentUser().getName();
        this.title="Untitled";
        this.content="";
        this.creationDate=getCurrentTime();
        this.lastModified=getCurrentTime();
        this.state=JSONDocument.prototype.states.draft;
        this.label = {};
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
    getCreation:function() {return this.creationDate;},
    getLastModification:function() {return (new Date(this.lastModified)).toUTCString();},
    setLastModification:function(date) {this.lastModified=date;},

    //state
    getState:function() {return this.state;},
    setState:function(state) {this.state=state;},

    //labels
    getLabel:function() {return this.label},
    isLabelised:function(label) {return this.label[label]},
    addLabel:function(label) {this.label[label]=true;},
    removeLabel:function(label) {delete this.label[label]},

    setAsCurrentDocument: function() {//display informations about this document in the webPage
        setCurrentDocument(this);
    },
    save: function(instruction) {//save the document
        getCurrentStorage().saveDocument(this, this.getAddress(), instruction);
    },
    remove: function(instruction) {//remove the document
        getCurrentStorage().deleteDocument(this.getAddress(), instruction);
    },
     /* generate a unique name for the document */
    getAddress: function() {
        return this.getCreation()+".json";
    }
});
JSONDocument.prototype.states = {
    draft:{"fr":"Brouillon","en":"Draft"},
    saved:{"fr":"Enregistré","en":"Saved"},
    deleted:{"fr":"Supprimé","en":"Deleted"}
}
JSONDocument.UPDATED = "updated";




/*************************************************
 ******************   actions   ******************
 *************************************************/
/**
 * change the language of the user and reload the web page
 * @param language : the new language
 */
var changeLanguage = function(language) {
    getCurrentUser().setSetting("language",language);
    getCurrentStorage().save();
    getCurrentPage().displayLanguages(getCurrentUser());
    window.location.reload();
}

var signOut = function() {
    delete localStorage.currentStorage;
    delete localStorage.currentDocumentID;
    delete localStorage.wallet;
    delete sessionStorage.documentList;
    window.location.href = "login.html";
    return false
}

cancel_sharing = function() {alert("cancel");}
translate = function() {alert("translate");}
submit = function() {alert("submit");}
share = function() {alert("share");}


/**
 * open a dialog box to edit document information
 */
editDocumentSettings = function() {
    Document.saveCurrentDocument();
    loadFile("xml/xmlElements.xml", "html", function(data) {
        thedialog.html($(data).find("rename"))
        thedialog.dialog("option", "width", 400);
        thedialog.dialog("option", "height", 200);

        thedialog.dialog("option", "buttons", {
                "Save": function(){
                    var doc = getCurrentDocument();
                    doc.setTitle($(this).find("#name").attr("value"));
                    doc.setLanguage($(getCurrentDocument()).find("#language").attr("value"));
                    doc.setVersion($(getCurrentDocument()).find("#version").attr("value"));
                    Document.saveCurrentDocument();
                    doc.setAsCurrentDocument();//diplay modifications
                    thedialog.dialog("close");
                },
                Cancel: function() {
                    thedialog.dialog("close");
                }
            }
        );
        $("p#more_properties") .click(function(){
            $("div#more_property").show();
            $("p#hide_properties").show();
            $("div#edit_document fieldset").animate({"height": "186px"}, "slow");
            $("div.ui-dialog").animate({"top": "50px"}, "slow")
                .animate({"height": "255px"}, "slow");
            $("div#edit_document").animate({"height": "183px"}, "slow");
            $("div#edit_document fieldset input").css("margin", "0")
                .css("width", "60%");
            $("div#edit_document fieldset label").css("float", "left")
                .css("width", "35%");
            $("div#more_property input").css("width", "47%");
            $("p#more_properties").hide();
        });
        $("p#hide_properties") .click(function(){
            $("div#more_property").hide();
            $("p#more_properties").show();
            $("p#hide_properties").hide();
            $("div#edit_document fieldset input").css("width", "95%")
                .css("margin-top", "14px");
            $("div#edit_document fieldset").animate({"height": "69px"}, "slow");
            $("div.ui-dialog").animate({"height": "148px"}, "slow");
            $("div#edit_document").animate({"height": "78px"}, "slow");
        });
    }
)}

/**
 * open a dialog box to upload a document
 */
uploadDocument = function() {
    loadFile("xml/xmlElements.xml", "html", function(data) { //load the upload form
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
			cache: true,
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

/**
 * open a dialog box to propose settings
 */
editUserSettings = function() {
    $("div#preference_dialog").dialog({
        autoOpen: false,
        height: 215,
        width: 319,
        modal:true,
        buttons: {
            "Save": function(){

            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });
}
