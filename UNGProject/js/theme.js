/**
 * This file provides main classes to display the web page
 */

/*
 * global variables
 */
applicationID = window.location.href.split("://")[1].split("/")[0]; //should be removed and better implemented
LANGUAGES = ["fr","en"];


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
            //load the user and the documentList in the page (wait for the storage being ready)
            getCurrentStorage().addWaiter(function() {
                getCurrentUser().setAsCurrentUser();
                getCurrentDocumentList()
            },Storage.USER_READY);
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
    loadEditor: function() {   //load the favourite editor of the user
        this.editor = new (getCurrentUser().getSetting("favouriteEditor")[this.getName()])();
    },

    //loaders
        /* load the xml document which contains the web page information
         * and display this information */
    loadXML: function(source) {
        var page = this;
        loadFile(source,"html",function(data) {
            page.xml = data;
            this.displayPageinformation();

            var dependencies = this.getDependencies();
            $(dependencies).find("linkfile").each(function() {page.include($(this).text(),"link");});//includes css
            $(dependencies).find("scriptfile").each(function() {page.include($(this).text(),"script");});//includes js

            // load the user, the editor and the document in the page (wait for the storage being ready)
            getCurrentStorage().addWaiter(function() {
                getCurrentUser().setAsCurrentUser();
                this.loadEditor();
                getCurrentDocument().setAsCurrentDocument();
            },Storage.USER_READY);
        });
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
        if(window.DocumentList) {this.documentList = new DocumentList(arg.documentList);}
        if(window.LabelList) {this.labelList = new LabelList(arg.labelList);}
        if(window.GroupList) {this.groupList = new GroupList(arg.groupList);}
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
    getDocumentList: function() {return this.documentList;},
    setDocumentList: function(list) {this.documentList = list;},

    getStorageLocation: function() {return this.storageLocation;},

    setAsCurrentUser: function() {
        getCurrentPage().displayUserInformation(this);
        getCurrentStorage().setUser(this);
        if(getCurrentPage().getName()=="ung") this.getDocumentList().setAsCurrentDocumentList();
    }
});

getCurrentUser = function () {
    return getCurrentStorage().getUser();
}





/**
 * Class Storage
 * this class provides usual API to save/load/delete elements
 * @param type : "local" to save in localStorage, or "JIO" for remote storage
 */
var Storage = function(type) {
    Storage.currentStorage = this;
    this.type = type;
    this.pendingList = [];
    
    //(re)initialize events
    this.userReady = false;
}
Storage.prototype = new UngObject();
Storage.prototype.load({
    getType: function() {return this.type;},
    getUser: function() {return this.user;},
    setUser: function(user) {
        this.user = user;
        user.setAsCurrentUser();
        this.userName = user.name;
        fireEvent(Storage.userReady);
        this.save();
    },
    updateUser: function() {localStorage[this.getUser().getName()] = JSON.stringify(this.getUser());},
    save: function() {
        this.updateUser();
        localStorage.setItem("currentStorage", JSON.stringify(this));
    },
    addWaiter: function(action, expectedEvent) {
        this[expectedEvent] ? action() : this.pendingList.push({action:action,expectedEvent:expectedEvent});
    },
    fireEvent: function(event) {
        for (var i=0; i<this.pendingList.length; i++) {
            var waiter = this.pendingList[i];
            if(waiter.expectedEvent===event) {
                waiter.action.apply(this, waiter.argument);
                this.pendingList(i,1);
                i--;
            }
        }
    }
});
Storage.initialize = function () {
    var dataStorage = JSON.parse(localStorage.getItem("currentStorage"));

    if(!dataStorage) {window.location.href = "login.html";}//if it's the first connexion
    if(dataStorage.type == "local") {
        Storage.currentStorage = new LocalStorage(dataStorage.userName);
    } else {
        Storage.currentStorage = new JIOStorage(dataStorage);
    }
}
Storage.USER_READY = "userReady";             // value of the USER_READY event

getCurrentStorage = function () {
    return Storage.currentStorage;
}


/**
 * Class LocalStorage
 * this class provides usual API to save/load/delete documents on the localStorage
 */
var LocalStorage = function(userName) {
    Storage.call(this,"local");
    if(userName) {
        var loaded = this.loadUser(userName)//load an existing user
        if(!loaded) {//create a new user if there was no such one
            var user = new User();
            user.setName(userName);
            user.documents = {};
            this.setUser(user);
        }
    }
}
LocalStorage.prototype = new Storage();
LocalStorage.prototype.load({
    /* try to load the user information in the storage and save it in the
     * storage instance.
     * @param userName : the name of the user
     * @return : true if the user existed and has been loaded, false otherwise
     */
    loadUser: function(userName) {
        try{
            if(!localStorage[userName]) {throw "noSuchUser";}
            this.setUser(new User(JSON.parse(localStorage[userName])));
            return true;
        } catch(e) {
            if(e!="noSuchUser") {alert(e);}
            return false
        }
    },
    getDocument: function(file, instruction) {
        var doc = new JSONDocument(this.getUser().documents[file]);
        if(instruction) instruction(doc);
        return doc;
    },
    getDocumentList: function() {
        return this.getUser().getDocumentList();
    },
    saveDocument: function(doc, file, instruction) {
        this.user.documents[file] = doc;
        this.save();
        if(instruction) instruction();
    },
    deleteDocument: function(file, instruction) {
        delete this.user.documents[file];
        this.save();
        if(instruction) instruction();
    }
});


/**
 * Class JIO
 * this class provides usual API to save/load/delete documents on a remote storage
 */
var JIOStorage = function(arg) {
    Storage.call(this,"JIO");

    if(arg.jio && arg.jio.jioFileContent) {
        //recreate the storage from the localStorage (arg = localStorage.currentStorage)
        this.jio = JIO.initialize(arg.jio.jioFileContent, {"ID":"www.ungproject.com"});
        this.setUser(new User(arg.user));
        waitBeforeSucceed(JIO.isReady,this.save);
    } else {
        //load jio from the dav storage
        this.jio = initializeFromDav(arg.userName, arg.storageLocation, {"ID":"www.ungproject.com", "password":arg.applicationPassword});
        //try to load user parameters
        var storage = this;
        var option = {
            success: function(data) {//success
                storage.setUser(new User(JSON.parse(data)));
                storage.user.storageLocation = arg.storageLocation;
                storage.save();
            },
            errorHandler: function(errorEvent) {//fail
                if(errorEvent.status==404){//create a new user if there was no such one
                    var user = new User();
                    user.setName(arg.userName);
                    storage.setUser(user);
                    storage.user.storageLocation = arg.storageLocation;
                    storage.save();
                }
            },
            asynchronous: false
        }
        JIO.loadDocument(arg.userName+".profile", option);
    }

    /**
     * load JIO file from a DAV and create and return the JIO object
     * This function will be replaced. The aim is to load JIO in more various ways, and use JIO.initialize after
     * @param userName : name of the user
     * @param location : server location
     * @param applicant : (optional) information about the person/application needing this JIO object (allow limited access)
     * @return JIO object
     */
    function initializeFromDav(userName, location, applicant) {
        //get the user personal JIO file
        $.ajax({
            url: location+"/dav/"+userName+"/"+applicant.ID+"/"+"jio.json",//we could use userAdress instead...
            type: "GET",
            async: false,
            dataType: "text",
            headers: {Authorization: "Basic "+Base64.encode(userName+":"+applicant.password)},
            fields: {withCredentials: "true"},
            success: function(jioContent){
                            JIO.initialize(jioContent,applicant);
                        },
            error: function(type) {alert("Error "+type.status+" : fail while trying to load jio.json");}
        });
        return JIO;
    }

}
JIOStorage.prototype = new Storage();
JIOStorage.prototype.load({
    getJIO: function() {return this.jio;},
    loadUser: function(userName) {//warning no return value
        var storage = this;
        var option = {
            success: function(data) {storage.setUser(new User(JSON.parse(data)));},
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
    saveDocument: function(doc, fileName, instruction) {
        var metaData = doc.copy();
        delete metaData.content;
        var option = {
            success: instruction,
            metaData: metaData
        };
        JIO.saveDocument(JSON.stringify(doc), fileName, option);
    },
    deleteDocument: function(file, instruction) {
        var option = {option: {success: instruction}};
        JIO.deleteDocument(file, option);
    },
    save: function() {
        this.updateUser();
        this.saveDocument(this.user,this.user.getName()+".profile",function() {
            localStorage.setItem("currentStorage",JSON.stringify(this));
        });
    }

});









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
    },

     /**
      * start an editor to edit the document
      * @param doc : the document to edit
      */
    startDocumentEdition: function(doc) {
        getCurrentStorage().getDocument(doc.fileName, function(data) {
            this.setCurrentDocument(data);
            if(Document.supportedDocuments[data.getType()].editorPage) {window.location.href = "theme.html";}
            else alert("no editor available for this document");
        });
    },

     /**
      * save document modification and go back to the documentList
      */
    stopDocumentEdition: function() {
        this.saveCurrentDocument();
        window.location.href = "ung.html";
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
    },

     /**
      * generate a unique name for the document
      */
    getAddress: function(doc) {
        return doc.getCreation();
    }
}
getCurrentDocument = function() {
    if(!Document.currentDocument) {
        Document.currentDocument = new JSONDocument(JSON.parse(localStorage.getItem("currentDocument")));
    }
    return Document.currentDocument;
}
setCurrentDocument = function(doc) {
    localStorage.setItem("currentDocument",JSON.stringify(doc));
    this.currentDocument = doc;
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
        this.creation=getCurrentTime();
        this.lastModification=getCurrentTime();
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
    getCreation:function() {return this.creation;},
    getLastModification:function() {return (new Date(this.lastModification)).toUTCString();},
    setLastModification:function(date) {this.lastModification=date;},

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
        var doc = this;
        getCurrentStorage().saveDocument(doc, Document.getAddress(this), instruction);
    },
    remove: function(instruction) {//remove the document
        getCurrentStorage().deleteDocument(Document.getAddress(this), instruction);
    }
});
JSONDocument.prototype.states = {
    draft:{"fr":"Brouillon","en":"Draft"},
    saved:{"fr":"Enregistré","en":"Saved"},
    deleted:{"fr":"Supprimé","en":"Deleted"}
}

setCurrentDocument = function(doc) {
    currentDocument = doc;
    localStorage.setItem("currentDocument",JSON.stringify(doc));
}








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
                    Document.saveCurrentDocument();
                    doc.setAsCurrentDocument();//diplay modifications
                    $(this).dialog("close");
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            }
        });
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