    xinha_editors = null;
    xinha_config  = null;
    xinha_plugins = null;

    xinha_init = function() {

      _editor_lang = "en"; // the language we need to use in the editor.
      _editor_skin = ""; // the skin we use in the editor
// What are the plugins you will be using in the editors on this page.
// List all the plugins you will need, even if not all the editors will use all the plugins.
      xinha_plugins = [
       //'CharacterMap',
       //'ContextMenu',
       //'Stylist',
       //'Linker',
       //'SuperClean',
       //'CSS'
      ];

      // THIS BIT OF JAVASCRIPT LOADS THE PLUGINS, NO TOUCHING  :)
      if(!Xinha.loadPlugins(xinha_plugins, xinha_init)) return;

// What are the names of the textareas you will be turning into editors?
      //var dest = document.getElementById("editors_here");
      //var lipsum = window.parent.menu.document.getElementById('myTextarea0').value;

      xinha_editors = ['input_area']

// Create a default configuration to be used by all the editors.
    var settings = null;
    settings = {
        width: "auto",
        height: "auto",
        sizeIncludesBars: true,
        sizeIncludesPanels: true,
        statusBar: true,
        htmlareaPaste: false,
        mozParaHandler: "best",
        getHtmlMethod: "DOMwalk",
        undoSteps: 20,
        undoTimeout: 500,
        changeJustifyWithDirection: false,
        fullPage: false,
        pageStyle: "",
        baseHref: null,
        expandRelativeUrl: true,
        stripBaseHref: true,
        stripSelfNamedAnchors: true,
        only7BitPrintablesInURLs: true,
        sevenBitClean: false,
        killWordOnPaste: true,
        makeLinkShowsTarget: true,
        flowToolbars: true,
        stripScripts: false,
        CharacterMapMode: "popup",
        ListTypeMode: "toolbar",
        showLoading: false,
        showChar: true,
        showWord: true,
        showHtml: true
    };

      xinha_config = new Xinha.Config();
      xinha_config.width = settings.width;
      xinha_config.height = settings.height;
      xinha_config.sizeIncludesBars = settings.sizeIncludesBars;
      xinha_config.sizeIncludesPanels = settings.sizeIncludesPanels;
      xinha_config.statusBar = settings.statusBar;
      xinha_config.htmlareaPaste = settings.htmlareaPaste;
      xinha_config.mozParaHandler = settings.mozParaHandler;
      xinha_config.getHtmlMethod = settings.getHtmlMethod;
      xinha_config.undoSteps = settings.undoSteps;
      xinha_config.undoTimeout = settings.undoTimeout;
      xinha_config.changeJustifyWithDirection = settings.changeJustifyWithDirection;
      xinha_config.fullPage = settings.fullPage;
      xinha_config.pageStyle = settings.pageStyle;
      xinha_config.baseHref = settings.baseHref;
      xinha_config.expandRelativeUrl = settings.expandRelativeUrl;
      xinha_config.stripBaseHref = settings.stripBaseHref;
      xinha_config.stripSelfNamedAnchors = settings.stripSelfNamedAnchors;
      xinha_config.only7BitPrintablesInURLs = settings.only7BitPrintablesInURLs;
      xinha_config.sevenBitClean = settings.sevenBitClean;
      xinha_config.killWordOnPaste = settings.killWordOnPaste;
      xinha_config.makeLinkShowsTarget = settings.makeLinkShowsTarget;
      xinha_config.flowToolbars = settings.flowToolbars;
      xinha_config.stripScripts = settings.stripScripts;
      xinha_config.flowToolbars = settings.flowToolbars;
      xinha_config.showLoading = settings.showLoading;
      xinha_config.pageStyleSheets = ["css/ung.css"];

// Create a default configuration for the plugins
      if (typeof CharCounter != 'undefined') {
        xinha_config.CharCounter.showChar = settings.showChar;
        xinha_config.CharCounter.showWord = settings.showWord;
        xinha_config.CharCounter.showHtml = settings.showHtml;
      }

      if(typeof CharacterMap != 'undefined') xinha_config.CharacterMap.mode = settings.CharacterMapMode;
      if(typeof ListType != 'undefined') xinha_config.ListType.mode = settings.ListTypeMode;
      if(typeof CSS != 'undefined') xinha_config.pageStyle = xinha_config.pageStyle + "\n" + "@import url(xinha/examples/files/custom.css);";
      if(typeof DynamicCSS != 'undefined') xinha_config.pageStyle = "@import url(dynamic.css);";
      if(typeof Filter != 'undefined') xinha_config.Filters = ["Word", "Paragraph"];

      if(typeof Stylist != 'undefined') {
        // We can load an external stylesheet like this - NOTE : YOU MUST GIVE AN ABSOLUTE URL
        //  otherwise it won't work!
        xinha_config.stylistLoadStylesheet(document.location.href.replace(/[^\/]*\.html/, 'xinha/examples/files/stylist.css'));

        // Or we can load styles directly
        xinha_config.stylistLoadStyles('p.red_text { color:red }');

        // If you want to provide "friendly" names you can do so like
        // (you can do this for stylistLoadStylesheet as well)
        xinha_config.stylistLoadStyles('p.pink_text { color:pink }', {'p.pink_text' : 'Pretty Pink'});
      }
      
      if(typeof InsertWords != 'undefined') {
        // Register the keyword/replacement list
        var keywrds1 = new Object();
        var keywrds2 = new Object();

        keywrds1['-- Dropdown Label --'] = '';
        keywrds1['onekey'] = 'onevalue';
        keywrds1['twokey'] = 'twovalue';
        keywrds1['threekey'] = 'threevalue';

        keywrds2['-- Insert Keyword --'] = '';
        keywrds2['Username'] = '%user%';
        keywrds2['Last login date'] = '%last_login%';
        xinha_config.InsertWords = {
          combos : [ { options: keywrds1, context: "body" },
                     { options: keywrds2, context: "li" } ]
        }
      }

      xinha_editors = Xinha.makeEditors(xinha_editors, xinha_config, xinha_plugins);
      Xinha.startEditors(xinha_editors);
    }
