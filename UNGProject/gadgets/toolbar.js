/*

        Copyright 2006-2008 OpenAjax Alliance

        Licensed under the Apache License, Version 2.0 (the "License"); 
        you may not use this file except in compliance with the License. 
        You may obtain a copy of the License at
        
                http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software 
        distributed under the License is distributed on an "AS IS" BASIS, 
        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
        See the License for the specific language governing permissions and 
        limitations under the License.
*/

var toolbarInit;
var retrieveMyStuff;
var searchRepositories;

(function(){

  toolbarInit = function()
  {
    dojo.require("dojo.parser");
    dojo.require("dojo.data.ItemFileReadStore");
    dojo.require("dijit.form.Button");
    dojo.require("dijit.form.FilteringSelect");
    dojo.require("dijit.form.TextBox");
    dojo.require("dijit.form.ValidationTextBox");
    dojo.require("dijit.Menu");
    dojo.require("dijit.Toolbar");
    dojo.require("dijit.TitlePane");
//    dojo.registerModulePath("nomad", "../../../nomad");
    dojo.require("nomad.widget.PaletteMenu");
    dojo.require("nomad.widget.CheckmarkMenuItem");

    dojo.addOnLoad(function(){
      var toolbar = dojo.byId('mashupToolbarContainer');
      dojo.parser.parse(toolbar);
//      toolbarOffsetY = toolbar.offsetTop + toolbar.offsetHeight + 10;
      
      // disable the "Save" and "Share" menu items if we didn't load from a page
      if ( mashupMaker.pageName == '' ) {
          dijit.byId( 'save' ).setDisabled( true );
          dijit.byId( 'share' ).setDisabled( true );
      }
      var searchDropDown = dojo.byId( 'searchResults' );
      dojo.connect(searchDropDown, 'onclick', null, populateDropDown);
    });
  }

  var __firstSearch = true;

   function populateDropDown() {
       if ( __firstSearch ) {
           window.retrieveMyStuff();
           __firstSearch = false;
       }
   }

  retrieveMyStuff = function() {
    var resourceUri = 'gadgets.html';
    var bindArgs = {
        handleAs: 'json',
        url:  resourceUri,
        sync: false,
        load: function(response) {
            buildPaletteFromSearchResults(response);
        },
        error: function(error, request) {
            alert('Search Error: \n'+error);
        }
    };
    dojo.xhrGet(bindArgs);
  }

  searchRepositories = function(event) {
    if (event.keyCode != 13 && event.type != 'click') {
        return;
    }
    var searchTerms = dojo.byId('widgetSearchTerms').value;
      if ( searchTerms == "Enter widget search terms" ) {
          searchTerms = "";
      }
    var resourceUri = 'gadgets.html?terms='+searchTerms;
    var advancedSearch = dijit.byId('searchResultsMenu_searchOptions');
    var selectedRepositories = advancedSearch.getSelectedRepositories();
    for (var i = 0; i < selectedRepositories.length; i++) {
      resourceUri += "&repos[]=" + encodeURIComponent(selectedRepositories[i]);
    }
    var bindArgs = {
        handleAs: 'json',
        url:  resourceUri,
        sync: true,
        load: function(response) {
            buildPaletteFromSearchResults(response);
        },
        error: function(error, request) {
            alert('Search Error: \n'+error);
        }
    };
    dojo.xhrGet(bindArgs);

  }

  function buildPaletteFromSearchResults(response) {
      var temp = '';
      var searchResults = dojo.byId('searchResultsMenu');
      var searchResultsWidget = dijit.byId('searchResultsMenu');

      // remove all of the previous search results
      dojo.query('*[id^="searchResults_foundWidget"]').forEach(
        function(itemFromMenu) {
          var widget = dijit.byId(itemFromMenu.id);
          if (widget) {
            searchResultsWidget.removeChild(widget);
            widget.destroyRecursive();
          }
        }
      );
      dojo.query('*[id^="searchResults_menuSeparator"]').forEach(
        function(itemFromMenu) {
          var widget = dijit.byId(itemFromMenu.id);
          if (widget) {
            searchResultsWidget.removeChild(widget);
            widget.destroyRecursive();
          }
        }
      );

      var tooltipConnectIds = [];
      for (var i = 0; i < response.length; i++) {
          var opt = response[i];
          var labelstr, url;

          // insert the menu separator first
          var menuItemWidget = new dijit.MenuSeparator({
              id: 'searchResults_menuSeparator'+i
            });
          searchResultsWidget.addChild(menuItemWidget);

          url = opt.url;
          labelstr = opt.name;

          // insert the menuitem for the gadget
          /* XXX probably need to be able to insert the widget's icon
           * if it has one rather than using nomadIconWidget iconclass
           * I put a method called setImage on the PaletteMenuItem class
           * to handle this once we know how to get the image src path
           * out of the repository.  Similar thing should be done for
           * the description, too.
           */
          menuItemWidget = new nomad.widget.PaletteItem({
              id: 'searchResults_foundWidget'+i,
              label: labelstr,
              iconClass: "nomadToolbarIcon nomadIconWidget",
              runIconClass: "nomadToolbarIcon nomadIconRun",
              bookmarkIconClass: "nomadToolbarIcon nomadIconBookmark",
              infoIconClass: "nomadToolbarIcon nomadIconInfo",
              itemUrl: url,
              onClick: function() {
                  mashupMaker.createGadget(this.itemUrl, null);
// XXX JHP TODO
//                  var gadgetCoords = dojo.coords(mashupMaker._creatingGadget.frame, true);
//                  window.scrollTo(gadgetCoords.x, gadgetCoords.y);
                }
            });
          searchResultsWidget.addChild(menuItemWidget);
            var tooltip = new dijit.Tooltip({
                label: "test info message",
                connectId: [menuItemWidget.id+"_infoIcon"]
              });
          // we are going to connect a tooltip to the 'more info' icons
          // on each palette item so build a list of the ids to use
          tooltipConnectIds.push(menuItemWidget.id+"_infoIcon");
      }

      var tooltip = new nomad.widget.PaletteTooltip({
          label: "",
          connectId: tooltipConnectIds
        });
      searchResultsWidget.setTooltip(tooltip);
      searchResultsWidget.resizePalette();
      if (searchResultsWidget.domNode.style.visibility == 'hidden') {
        // menu tries to blur its focused child but since we may have just
        // destroyed it in our clean up of menu items, we should null it out
        // to be safe
        dijit.byId('searchResults')._toggleDropDown();
      } else {
        searchResultsWidget.focusFirstItem();
      }
  }

})();  // end closure


  openMashup = function() {
      var dialogDiv = dojo.byId('__OAA_openDialog_container');
      dojo.parser.parse(dialogDiv);
      openDialog = dijit.byId('__OAA_open_dialog');
      openDialog.show();
  }

  doOpen = function(mashupname) {
      var url = OpenAjax.widget.baseURI + 'newmashup.php?pageName=' + mashupname;
      window.document.location = url;
  }

  saveMashup = function() {
      doSave(mashupMaker.pageName);
  }

  saveMashupAs = function() {
      var dialogDiv = dojo.byId('__OAA_saveAsDialog_container');
      dojo.parser.parse(dialogDiv);
      saveAsDialog = dijit.byId('__OAA_saveAs_dialog');
      saveAsDialog.show();
  }

  doSave = function(pagename) {
      var resourceUri = 'doSave.php';
      var serializedPage = mashupMaker.exportElement().innerHTML;
      var bindArgs = {
          handleAs: 'text',
          url:  resourceUri,
          sync: true,
          content: { page : pagename, data : serializedPage },
          load: function(response) {
              var select = dijit.byId( "openname" );
              if ( select ) {
                  // Since 'clearOnClose' is set to true on the data store,
                  // calling close() will cause the data store to refetch
                  // from the server next time.
                  select.store.close();
              }
          },
          error: function(error, request) {
              alert('Save error: \n'+error);
          }
      };
      dojo.xhrPost(bindArgs);
      
  }

  shareMashup = function() {
      var script = "&lt;script src=\"" + OpenAjax.widget.baseURI + "embedWidget.php?pageName=" + mashupMaker.pageName + "\"&gt;&lt;/script&gt;";
      var dialogDiv = dojo.byId('__OAA_shareDialog_container');
      dojo.parser.parse(dialogDiv);
      dojo.byId("__OAA_shareDialog_script_tag").innerHTML = script;
      dijit.byId("__OAA_share_dialog").show();
      return;
  }

  function resetTextfield() {
    var textbox = dijit.byId('widgetSearchTerms');
    var textboxNode = dojo.byId('widgetSearchTerms');
    textbox.setValue("");
    textboxNode.className = 'postEdit';
  }
  
  function launchAboutRefimpl( event ) {
    window.open( OpenAjax.widget.baseURI + 'README.html', 'aboutRefimpl',
            'width=800,height=570,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes' );
    dojo.stopEvent( event );
    return false;
  }
  
  function launchGeneralHelp( event ) {
    window.open( OpenAjax.widget.baseURI + 'HELP.html', 'generalHelp',
            'width=900,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes' );
    dojo.stopEvent( event );
    return false;
  }

  function launchGeneralHelp2( event ) {
    window.open( OpenAjax.widget.baseURI + 'HELP2.html', 'generalHelp2',
            'width=900,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes' );
    dojo.stopEvent( event );
    return false;
  }

  function launchParticipationHelp( event ) {
    window.open( OpenAjax.widget.baseURI + 'PARTICIPATE.html', 'participationHelp',
            'width=900,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes' );
    dojo.stopEvent( event );
    return false;
  }

  function launchMetadataIntro( event ) {
    window.open( OpenAjax.widget.baseURI + 'METADATAINTRO.html', 'metadataIntroHelp',
            'width=900,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes' );
    dojo.stopEvent( event );
    return false;
  }

  function launchHubIntro( event ) {
    window.open( OpenAjax.widget.baseURI + 'HUBINTRO.html', 'hubIntroHelp',
            'width=900,height=800,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes' );
    dojo.stopEvent( event );
    return false;
  }

  function launchOpenBug( event ) {
    window.open( 'http://sourceforge.net/tracker/?atid=874168&group_id=175671', 'openBug',
            'width=900,height=800,resizable=yes,scrollbars=yes,toolbar=no' );
    dojo.stopEvent( event );
    return false;
  }

  function launchRepository( event ) {
      var sarray = OpenAjax.widget.baseURI.split("/");
      var current = sarray.pop();
      while ( current != "gadgets" ) {
          current = sarray.pop();
      }
      var baseURL = sarray.join("/");
      window.open(  baseURL + '/repository/', 'launchRepository',
                    'resizable=yes,scrollbars=yes,toolbar=no' );
      dojo.stopEvent( event );
      return false;
  }

  function newMashup( event ) {
      window.document.location = OpenAjax.widget.baseURI + "newmashup.php";
      dojo.stopEvent( event );
      return false;
  }

//  var toolbarOffsetY = 0;
  toolbarInit();

