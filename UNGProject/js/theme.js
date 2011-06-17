/*
 * global variables
 */
languages = ["fr","en"];
var availableLanguages = $("#available_languages");

currentPage = null;


/*
 * load page functions
 */
var Page = function(page) {
    this.name = page;
    this.html = window.document;
    this.xml = null;
    this.editor = null;

    //define as current page
    currentPage = this;
    this.loadXML("xml/"+page+".xml");
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

    //loaders
        /* load the xml document which contains the web page information */
    loadXML: function(source) {
        $.ajax( {
            type: "GET",
            url: source,
            dataType: "html",
            async: false,
            success: function(data) {
                getCurrentPage().setXML(data);
            }
        });
    },
        /* update the HTML page from the XML document */
    loadPage: function() {
        this.displayPageTitle();
        this.displayPageContent();
        var dependencies = this.getDependencies();
        $(dependencies).find("scriptfile").each(function() {currentPage.include($(this).text(),"script");});//includes js
        $(dependencies).find("linkfile").each(function() {currentPage.include($(this).text(),"link");});//includes css
        switch(this.name) {
            case "editor":
                    this.editor = new Xinha();
                    break;
        }
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

        var head = this.getHTML().getElementsByTagName("head");
        $(head[0]).append(object);
    },

    //printers
        //user information
        /* display the list of availaible languages */
    displayLanguages: function(user) {
        var avLang = "";

        for (var i = 0; i<languages.length; i++) {
            var l = languages[i];
            if(l==user.getLanguage()) {this.getHTML().getElementById("current_language").innerHTML = l;}
            else {
                avLang = avLang + "<li><span onclick='changeLanguage(this.innerHTML)' id='" +l+ "'>"+l+"</span></li>\n"
            }
        }
        this.getHTML().getElementById("available_languages").innerHTML = avLang;
    },
    displayUserName: function(user) {this.getHTML().getElementById("userName").innerHTML = user.getName();},

        //document information
    displayAuthorName: function(doc) {this.getHTML().getElementById("author").innerHTML = doc.getAuthor();},
    displayLastModification: function(doc) {this.getHTML().getElementById("last_update").innerHTML = doc.getLastModification();},
    displayDocumentTitle: function(doc) {this.getHTML().getElementById("document_title").innerHTML = doc.getTitle();},
    displayDocumentState: function(doc) {
        var stateArea = this.getHTML().getElementById("document_state");
        stateArea.innerHTML = doc.getState()[getCurrentUser().getLanguage()];
    },

        //web page information
    displayPageTitle: function() {
        var pageTitle = this.getHTML().getElementById("page_title");
        pageTitle.innerHTML = this.getTitle();
    },
    displayPageContent: function() {
        var pageContent = this.getHTML().getElementById("page_content");
        pageContent.innerHTML = this.getContent();
    }
}

getCurrentPage = function() {return currentPage;}
setCurrentPage = function(page) {
    currentPage = new Page(page);
}

/*
 * user class
 */
var User = function() {
    this.name = "unknown";
    this.language = "en";
    this.storage = "http://www.unhosted-dav.com";
    this.identityProvider = "http://www.webfinger.com";
}
User.prototype = {
    getName: function() {return this.name;},
    setName: function(newName) {this.name = newName;},
    getLanguage: function() {return this.language;},
    setLanguage:function(language) {this.language = language;},
    getStorageLocation: function() {return this.storage;},
    setStorageLocation: function(storage) {this.storage = storage;},
    getIdentityProvider: function() {return this.identityProvider;},
    setIdentityProvider: function(IDProv) {this.identityProvider = IDProv;},

    setAsCurrentUser: function() {
        getCurrentPage().displayUserName(this);
        getCurrentPage().displayLanguages(this);
        setCurrentUser(this);
    }
}

getCurrentUser = function() {
    var user = new User();
    user.load(JSON.parse(localStorage.getItem("currentUser")))
    return user;
}
setCurrentUser = function(user) {localStorage.setItem("currentUser", JSON.stringify(user));}



/**
 * Documents
 */

/* JSON document */
var JSONDocument = function() {
    this.type = "text";
    this.language = getCurrentUser().getLanguage();
    this.version = null;

    this.author=getCurrentUser().getName();
    this.title="Untitled";
    this.content="";
    this.creation=currentTime();
    this.lastModification=currentTime();
    this.state=Document.states.draft;
}
JSONDocument.prototype = {
    //type
    getType: function() {return this.type;},
    
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

    save: function() {}
}
Document.states = {
    draft:{"fr":"Brouillon","en":"Draft"},
    saved:{"fr":"Enregistré","en":"Saved"},
    deleted:{"fr":"Supprimé","en":"Deleted"}
}
getCurrentDocument = function() {
    var doc = new JSONDocument();
    doc.load(JSON.parse(localStorage.getItem("currentDocument")));
    return doc;
}
setCurrentDocument = function(doc) {localStorage.setItem("currentDocument",JSON.stringify(doc));}


/*
 * actions
 */
editDocumentSettings = function() {
  $("#edit_document").dialog({
    autoOpen: false,
    height: 131,
    width: 389,
    modal: true,
    buttons: {
      "Save": function(){
        /*getCurrentDocument().setTitle($(getCurrentDocument()).find("#name").attr("value"));
        //var new_short_title = $("input#short_title.short_title").attr("value");
        getCurrentDocument().setLanguage($(getCurrentDocument()).find("#language").attr("value"));
        getCurrentDocument().setVersion($(getCurrentDocument()).find("#version").attr("value"));
        //var new_int_index = $("input#sort_index.sort_index").attr("value");
        //var new_subject_list = $("textarea#keyword_list").attr("value").replace(/\n+/g, ",");
        getCurrentDocument().setAsCurrentDocument();//diplay modifications
        //save_button.click();*/
        $(this).dialog("close");
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    }
  });
}

changeLanguage = function(language) {
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
