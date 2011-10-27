dojo.declare("GadgetSite", null, {

        constants : {
            GADGET_CLASSNAMES: ['gadgetHeader', 'gadgetBody', 'gadgetTitle']
        },

        constructor: function(container, id, views) {
            this.gadgetContainer = container;
            this.widgetId = id;
            this.views = views;
            if (container) {
                this.adopt(container);
            }
            if ( ! dijit.byId(id + "_propMenu") ) {
                // Due to a bug in IE 6/7, we cannot call this method directly.
                // This constructor is called from inline JavaScript and tries
                // to manipulate the DOM of the containing element.  On IE 6/7,
                // this leads to a crash of the JS engine.  In order to avoid
                // that, we create the menu after the DOM has loaded.
                dojo.addOnLoad(this, "createEditMenu");
            }
        },
        /**
         * create the edit menu for the widget attaching it to left click on
         * the widget edit image in the widget header
         * 
         */
        createEditMenu: function() {
            dojo.require('dijit.Menu');
            var targetImgNode = dojo.byId(this.widgetId+"_propMenuTarget");
            if ( ! targetImgNode ) { // nothing to bind to...
                return;
            }

            var widgetId = this.widgetId;
            pMenu = new dijit.Menu(
                    { 
                        targetNodeIds:[this.widgetId+"_propMenuTarget"], 
                        id: this.widgetId + "_propMenu",
                        leftClickToOpen: true
                    });
            pMenu.addChild(new dijit.MenuItem(
                    {
                        label: "Edit widget properties", 
                        onClick: //dojo.hitch( window,
                            function(evt) {
                                mashupMaker.editGadget( widgetId );
                            }
                        //)
                    }));
            pMenu.addChild(new dijit.MenuItem(
                    {
                        label: "Share widget", 
                        onClick:
                            function(evt) {
                                mashupMaker.shareGadget( widgetId );
                            }
                    }));

            // menu items for custom widget views go here
            if ( typeof this.views == "object" ) {
                var addedSeparator = false;
                for ( var i = 0; i < this.views.length; i++ ) {
                    var viewName = this.views[i];
                    
                    if ( viewName == 'default' ||
                         viewName == 'edit' ||
                         viewName == 'help' ) {
                        continue;
                    }
                    
                    // Add an extra separator if there are any custom views
                    if ( ! addedSeparator ) {
                        pMenu.addChild(new dijit.MenuSeparator());
                        addedSeparator = true;
                    }
                    
                    // Custom view names are QNames, which may consist of a
                    // prefix and a local part separated by a ':'.  For the
                    // menu, we'll only display the local part.
                    var localPart = viewName.split(":").pop();
                    pMenu.addChild(new dijit.MenuItem(
                        {
                            label: localPart.charAt(0).toUpperCase() + localPart.substr(1), 
                            onClick: 
                                function(evt) {
                                    var menuItem = dijit.getEnclosingWidget(evt.currentTarget);
                                    mashupMaker.openGadgetView( widgetId, menuItem.fullQName );
                                },
                            fullQName: viewName
                        }));
                }
            }
            
            pMenu.addChild(new dijit.MenuSeparator());
            if ( this.views && dojo.indexOf(this.views, 'help') != -1 ) {   // XXX this.views should exist; shouldn't need to check for it
                pMenu.addChild(new dijit.MenuItem(
                    {
                        label: "Help",
                        onClick: 
                            function(evt) {
                                mashupMaker.openGadgetView( widgetId, 'help' );
                            }
                    }));
            } else {
                pMenu.addChild(new dijit.MenuItem({label: "Help", disabled: true}));
            }
            pMenu.startup();            
        },
        
        /**
         * Return the body html element for this site. The body element actually contains the widget
         *
         * @return HTML Element
         * @type {DOM}
         */
        getBody: function() {
            return(this.gadgetBody);
        },

        /**
         * Return the containing html element for this site. 
         *
         * @return HTML Element
         * @type {DOM}
         */
        getContainer: function() {
            return(this.gadgetContainer);
        },

        /**
         * Set the title of the gadget within the site.
         *
         * @param {String} title The title to be displayed
         */
        setTitle : function(title) {
            this._titleText = title;
            var titleTarget = this.getTitleElement();
            if (titleTarget) {
                titleTarget.innerHTML = title;
            }
        },

        /**
         * Get the title of the gadget within the site.
         *
         * @return The title to be displayed
         * @type {String}
         */
        getTitle : function() {
            var titleTarget = this.getTitleElement();
            if (! this._titleText && titleTarget) {
                this._titleText = titleTarget.innerHTML;        
            }
            return(this._titleText);
        },
        
        getTitleElement : function() {
            return(this.gadgetTitle);
        },

        /**
         * @param {DOM} containerDOM The DOM element to adopt as the container
         */
        adopt: function(containerDOM) {
            if (containerDOM.tagName != 'TABLE' || containerDOM.className != 'gadgetContainer') {
                return(false);
            }
            this.gadgetContainer = containerDOM;
            dojo.forEach(this.constants.GADGET_CLASSNAMES,
                         dojo.hitch(this,
                                    function(className) {
                                        var gadgetPart = dojo.query('.' + className, containerDOM);
                                        if (gadgetPart && gadgetPart.length) {
                                            this[className] = gadgetPart[0];
                                        }
                                    })
            );
        },

        getDimensions : function() {
            var dimensions = {};
            var style = dojo.getComputedStyle( this.gadgetBody );
            dimensions.width = parseInt( style.width );
            dimensions.height = parseInt( style.height );
            
            return dimensions;
        },
        
        getPosition : function() {
            var coords = dojo.coords( this.gadgetContainer );
            return { x: coords.x, y: coords.y };
        },
        
        resize : function( width, height ) {
            this.gadgetBody.style.width = width + "px";
            this.gadgetBody.style.height = height + "px";

	        // XXX 'gadgetHeader' sizing should be done in theme specific file
            if ( this.gadgetHeader ) {
                this.gadgetHeader.style.width = dojo.coords( this.gadgetBody ).w + "px";
            }
        }

});
