/*

        Copyright 2006-2009 OpenAjax Alliance

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

/**
 * The Wiring Overlay class does the work to overlay a gadget with a
 * semi-transparent DIV.  Through a context menu on the DIV, the user can
 * express a desire to wire one or more gadgets to the currently selected
 * property on the Property Dialog of a gadget.  Any wiring changes will be
 * committed once the user selects 'save' from the Property Dialog
 *
 * @class WiringOverlay
 */
function  WiringOverlay(/* Gadget */gadget, topic, /* boolean */publisher)
{
    // Create a DIV overlay that covers the given gadget.  We are overlaying the
    // gadget because we are overlaying gadgets that publish (if publisher is
    // true) or listen (if publisher is false) the given topic.
    if (!gadget) {
        return;
    }

    var container = gadget.getSite().getContainer();
    var gadgetCoords = dojo.coords(container, true);
    var overlay = document.createElement('div');
    overlay.id = gadget.getId()+'_overlay';
    overlay.style.left = gadgetCoords.x;
    overlay.style.top = gadgetCoords.y;
    overlay.style.width = gadgetCoords.w;
    overlay.style.height = gadgetCoords.h;
    var zIndex = container.style.zIndex;
    if (zIndex) {
        overlay.style.zIndex = zIndex+1;
    } else {
        overlay.style.zIndex = 1;
    }
    overlay.style.position = 'absolute';
    Browser.setAlpha(overlay, 0.6);
    dojo.body().appendChild(overlay);
    this.gadget = gadget;
    this.topic = topic;
    this.publish = publisher;
    this.element = overlay;
    // If we got to the point of creating an overlay, then we know that this
    // gadget is a possible match for wiring at least.  The type may be further
    // improved as we inspect the gadget's properties while building the context
    // menu.
    this.setType(WiringOverlay.POSSIBLE);
}

WiringOverlay.CURRENT     = 1;
WiringOverlay.RECOMMENDED = 2;
WiringOverlay.POSSIBLE    = 3;
WiringOverlay.WIRING_NONE   = 0;
WiringOverlay.WIRING_SINGLE = 1;
WiringOverlay.WIRING_MULTI  = 2;

WiringOverlay.prototype.setType = function(/* int */type)
{
    switch(type)
    {
    case WiringOverlay.CURRENT:
        this.element.className = 'nomadWiringOverlayCurrent';
        this.type = type;
        break;
    case WiringOverlay.RECOMMENDED:
        this.element.className = 'nomadWiringOverlayRecommended';
        this.type = type;
        break;
    case WiringOverlay.POSSIBLE:
        this.element.className = 'nomadWiringOverlayPossible';
        this.type = type;
        break;
    }
}

WiringOverlay.prototype.destroy = function()
{
    if (this.popupMenu) {
        dojo.forEach(this.popupMenu.getChildren(),
                     function(menuItem){
                         if (menuItem.popup) {
                             menuItem.popup.destroyRecursive();
                         }
                     }
                    );
        this.popupMenu.destroyRecursive();
        this.popupMenu = null;
    }
    if (this.tooltip) {
        this.tooltip.destroy();
        this.tooltip = null;
    }
    dojo.body().removeChild(this.element);
    this.gadget = null;
    this.element = null;
}

WiringOverlay.prototype.enable = function(/* int */zIndex)
{
    // Get the overlay ready so that the user can interact with it.  If zIndex
    // is specified, then this is the level to which we need to raise the overlay
    // so that it isn't hidden by some other window
    if (zIndex) {
        this.element.style.zIndex = zIndex;
    }
    if (!this.publish) {
        this.popupMenu = this.createListenerContextMenu();
    } else {
        this.popupMenu = this.createPublisherContextMenu();
    }

    this.tooltip = this.createTooltip();
}

WiringOverlay.prototype.createTooltip = function()
{
    var label = null;
    switch (this.type) {
    case WiringOverlay.CURRENT:
        if (this.publish) {
            label = 'This gadget publishes the topic '+this.topic+' which is currently bound to the selected property.'
        } else {
            label = 'This gadget currently listens to the topic '+this.topic+' which is currently published by the selected property.'
        }
        break;
    case WiringOverlay.RECOMMENDED:
        if (this.publish) {
            label = 'This gadget publishes the topic '+mashupMaker.getWiringManager().wiringProperty.defaultTopic()+' which is recommended for binding to the selected property.'
        } else {
            label = 'This gadget by default listens to the topic '+this.topic+' which is currently published by the selected property.  However, it is not currently listening for this topic.'
        }
        break;
    case WiringOverlay.POSSIBLE:
        if (this.publish) {
            label = 'This gadget publishes other topics that may be bound to the selected property.'
        } else {
            label = 'This gadget is able to listen to the topic '+this.topic+' but it does not currently do so.'
        }
        break;
    }

    if (!label) {
        return;
    }

    if (this.publish) {
        label += '  Caution should be used when selecting a non-recommended topic for binding.'
    } else if (this.type == WiringOverlay.POSSIBLE) {
        label += '  Caution should be used when asking a gadget to listen for a non-recommended topic.'
    }
    label += '  Bring up a context menu for further options.'

    var tooltip = new dijit.Tooltip({
        label: label,
        connectId: [this.element.id]
    });
    tooltip.domNode.id = "overlayTooltip";
    return tooltip;
}

WiringOverlay.prototype.createPublisherContextMenu = function()
{
    // this function builds the context menu for the overlay and also initializes
    // the type for the overlay
    var topic = this.topic;
    if (topic === null) {
        return null;
    }

    var menu = new dijit.Menu({
        id: 'wiring_publishing_menu'+this.gadget.getId(),
        targetNodeIds: [this.element.id]
    });
    if (!menu) {
        return null;
    }

    var properties = this.gadget.OpenAjax._spec.property;
    var wiringManager = mashupMaker.getWiringManager();
    var boundGadget = null;
    var oldTopic = null;
    if (wiringManager.wiringProperty) {
        boundGadget = mashupMaker.getWidgetModelFromID(getPropertyInfo(wiringManager.wiringProperty, "singleBoundGadget"));
        oldTopic = getPropertyInfo(wiringManager.wiringProperty, "topic");
    }
    var newType = this.type,
        currType = this.type;
    // use topicList to make sure that even if a topic is published more than
    // once by the gadget, that it still only appears once on the list
    var topicList = {};
    for ( var name in properties ) {
        var property = properties[ name ];
        var state = null;
//        if (property.publish()) {
//            var publishedTopic = property.defaultTopic();
        if ( property.sharedAs ) {
            var publishedTopic = property.sharedAs;
            if (publishedTopic === null || topicList[publishedTopic]) {
                continue;
            }
            // assign menuitem.initChecked prior to menu.startup()
            var menuitem = null;
            menuitem = new nomad.widget.CheckmarkMenuItem({
                label: 'Publishes topic '+publishedTopic,
                onClick: dojo.hitch(wiringManager, "registerWiringChange", wiringManager.wiringProperty, publishedTopic, oldTopic, this.gadget)
            });
            topicList[publishedTopic] = menuitem;
            var checkable = publishedTopic == this.topic;
            // see if the overlay's type can be improved
            if (checkable) {
                if (!boundGadget) {
                    newType = WiringOverlay.CURRENT;
                } else if (boundGadget == this.gadget) {
                    newType = WiringOverlay.CURRENT;
                    menuitem.initChecked = true;
                } else if (publishedTopic == wiringManager.wiringProperty.defaultTopic()) {
                    newType = WiringOverlay.RECOMMENDED;
                }
            } else if (publishedTopic == wiringManager.wiringProperty.defaultTopic()) {
                newType = WiringOverlay.RECOMMENDED;
            }
            if (newType < currType) {
                currType = newType;
            }
            menu.addChild(menuitem);
        }
    }
    if (currType < this.type) {
        this.setType(currType);
    }
    menu.startup();
    return menu;
}
WiringOverlay.prototype.createListenerContextMenu = function()
{
    var topic = this.topic;
    if (!topic || topic.length == 0) {
        return;
    }

    var menu = new dijit.Menu({
        id: 'wiring_listener_menu'+this.gadget.getId(),
        targetNodeIds: [this.element.id]
    });
    if (!menu) {
        return null;
    }

    var properties = this.gadget._spec.property;
    var wiringProperty = mashupMaker.getWiringManager().wiringProperty;
    var newType = this.type,
        currType = this.type;
    for ( var name in properties ) {
        var property = properties[ name ];
        var state = null;
//        if (property.listen() && !property.hidden()) {
        if ( property.sharedAs && !property.hidden ) {
            if (getPropertyInfo(property, "topic") == topic) {
                if (getPropertyInfo(property, "singleBoundGadget")) {
                    if (getPropertyInfo(property, "singleBoundGadget") == wiringProperty.getGadget().getId()) {
                        state = WiringOverlay.WIRING_SINGLE;
                        newType = WiringOverlay.CURRENT;
//                    } else if (property.defaultTopic() == topic) {
                    } else if (property.sharedAs == topic) {
                        state = WiringOverlay.WIRING_NONE;
                        newType = WiringOverlay.RECOMMENDED;
                    }
                } else {
                    state = WiringOverlay.WIRING_MULTI;
                    newType = WiringOverlay.CURRENT;
                }
//            } else if (property.defaultTopic() == topic) {
            } else if (property.sharedAs == topic) {
                state = WiringOverlay.WIRING_NONE;
                newType = WiringOverlay.RECOMMENDED;
            } else {
                // XXX should we allow a publisher to publish a non-recommended topic
                // to any ol' listener?  For now we'll allow it
                state = WiringOverlay.WIRING_NONE;
            }

            if (state != null) {
                var popupmenu = this.createListenerSubmenu(topic, property, getPropertyInfo(property, "topic"), state);
                var menuitem = new dijit.PopupMenuItem({
                    label: 'binding for property '+property.name,
                    popup: popupmenu
                });
                // see if the overlay's type can be improved
                if (newType < currType) {
                    currType = newType;
                }
                menu.addChild(menuitem);
            }
        }
    }
    if (currType < this.type) {
        this.setType(currType);
    }

    menu.startup();
    return menu;
}
WiringOverlay.prototype.createListenerSubmenu = function(topic, property, originalTopic, /* int */checkedState)
{
    var menu = new dijit.Menu({
        id: 'wiring_listener_popup_'+this.gadget.getId()+'_'+property.name
    });
    if (!menu) {
        return null;
    }

    var wiringManager = mashupMaker.getWiringManager();

    // assign menuitem.initChecked prior to menu.startup()
    var menuitem = null;
    menuitem = new nomad.widget.CheckmarkMenuItem({
        label: 'Listen for all '+topic+' topics',
        onClick: dojo.hitch(wiringManager, "registerWiringChange", property, topic, originalTopic, null)
    });
    menuitem.initChecked = checkedState == WiringOverlay.WIRING_MULTI;
    menu.addChild(menuitem);
    menuitem = new nomad.widget.CheckmarkMenuItem({
        label: 'Listen for no '+topic+' topics',
        onClick: dojo.hitch(wiringManager, "registerWiringChange", property, "", originalTopic, null)
    });
    menuitem.initChecked = checkedState == WiringOverlay.WIRING_NONE;
    menu.addChild(menuitem);
    menuitem = new nomad.widget.CheckmarkMenuItem({
        label: 'Bind to source gadget only',
        handleEveryClick: true,
        onClick: dojo.hitch(wiringManager, "registerWiringChange", property, topic, originalTopic, wiringManager.wiringProperty.getGadget())
    });
    menuitem.initChecked = checkedState == WiringOverlay.WIRING_SINGLE;
    menu.addChild(menuitem);
    // need to call startup here as startup won't filter down through a
    // dijit.PopupMenuItem to its submenu
    menu.startup();
    return menu;
}

getPropertyInfo = function(property, /* string */key)
{
  // In order to make the overlays look and work correctly, we'll sometimes need
  // to know about any pending changes to the property that may not have taken
  // affect, yet.  This is especially true when trying to get the overlay
  // type correct and to have the context menus initialize with the currently
  // selected item correctly identified.
  if (!property || !key) {
    return;
  }
  
  var change = mashupMaker.getWiringManager().getWiringChange(property);
  switch (key) {
    case "topic":
      if (change) {
        return change.newTopic;
      }
//      return property.topic();
      return property.sharedAs;
    case "singleBoundGadget":
      if (change) {
        return change.publishingGadget.getId();
      }
      return property.getSingleBoundGadget();    // XXX JHP TODO
    default:
      return null;
  }
}

/**
 * The Wiring Manager class encapsulates the work that needs to happen each time
 * the property dialog rolls up so that the user can select gadgets to wire
 * to the current gadget.
 *
 * @class WiringManager
 */
function  WiringManager()
{
  this._wireableGadgets = new Array();
  this._subscribedTopics = null;
  this._publishedTopics = null;
  this._changeArray = null;
}

WiringManager.prototype.addGadget = function(gadget)
{
    if (!gadget) {
        return;
    }

    // if the gadget publishes or subscribes to any topics, find out which and
    // remember them
//  var properties = gadget.getProperties();
//  if ( properties ) {
//      for (var i = 0; i < properties.length; i++) {
//        var property = properties[i];
//        if (property.listen() || property.publish()) {
//          this._wireableGadgets[gadget.gID] = gadget;
//          break;
//        }
//      }
//  }
    for ( var name in gadget.OpenAjax._spec.property ) {
        var prop = gadget.OpenAjax._spec.property[ name ];
        if ( prop.sharedAs ) {
            this._wireableGadgets[ gadget.OpenAjax.getId() ] = gadget;
            break;
        }
    }
}

WiringManager.prototype.buildTopicsLists = function()
{
    if (this._publishedTopics || this._subscribedTopics) {
        return;
    }
    this._publishedTopics = new Array();
    this._subscribedTopics = new Array();
    for (var gID in this._wireableGadgets) {
        var gadget = this._wireableGadgets[gID];
      
        var props = gadget.OpenAjax._spec.property;
        for ( var name in props ) {
            var topic = props[ name ].sharedAs;
            if ( topic ) {
                if ( ! this._publishedTopics[ topic ] ) {
                    this._publishedTopics[ topic ] = {};
                }
                // make sure that a gadget only appears once on the list
                if ( ! this._publishedTopics[ topic ][ gID ] ) {
                    this._publishedTopics[ topic ][ gID ] = gadget;
                }
                
                if ( ! this._subscribedTopics[ topic ] ) {
                    this._subscribedTopics[ topic ] = {};
                }
                // make sure that a gadget only appears once on the list
                if ( ! this._subscribedTopics[ topic ][ gID ] ) {
                    this._subscribedTopics[ topic ][ gID ] = gadget;
                }
            }
        }
    }



//    // if the gadget publishes or subscribes to any topics, find out which and
//    // remember them
//    var topicInfo = gadget.getTopicInfo();
//    if (topicInfo) {
//        // topicInfo is an object that contains two arrays, topics that the gadget
//        // listens for and topics that the gadget publishes
//        var topicsArray = topicInfo.publishes;
//        if (topicsArray && topicsArray.length > 0) {
//            var topicsLength = topicsArray.length;
//            for (var j = 0; j < topicsLength; j++) {
//                var topic = topicInfo.publishes[j];
//          if (!this._publishedTopics[topic]) {
//            this._publishedTopics[topic] = {};
//                }
//                // make sure that a gadget only appears once on the list
//          if (!this._publishedTopics[topic][gadget.getId()]) {
//            this._publishedTopics[topic][gadget.getId()] = gadget;
//                }
//            }
//        }
//
//        topicsArray = topicInfo.subscribes;
//        if (topicsArray && topicsArray.length > 0) {
//            topicsLength = topicsArray.length;
//            for (var j = 0; j < topicsLength; j++) {
//                var topic = topicInfo.subscribes[j];
//          if (!this._subscribedTopics[topic]) {
//            this._subscribedTopics[topic] = {}
//                }
//                // make sure that a gadget only appears once on the list
//          if (!this._subscribedTopics[topic][gadget.gID]) {
//            this._subscribedTopics[topic][gadget.gID] = gadget;
//          }
//                }
//            }
//        }
//    }
}

WiringManager.prototype.removeGadget = function(gadget)
{
    if (!gadget) {
        return;
    }

    // if the gadget publishes or subscribes to any topics, find out which and
  if (this._wireableGadgets[gadget.gID]) {
    delete this._wireableGadgets[gadget.gID];
    }
}

WiringManager.prototype.findGadgets = function(/* string */topic, /* boolean */publish)
{
    // If topic is specified, only gadgets related to that topic will be returned.
    // If no topic, then all gadgets meeting the publish/listen requirement will
    // be returned.
    var results = new Array();
    var topicArray = null;
    var searchArray = null;

    if (topic) {
        searchArray = publish ? this._publishedTopics[topic] : this._subscribedTopics[topic];
    } else {
        topicArray = publish ? this._publishedTopics : this._subscribedTopics;
    }
    if (topicArray) {
        for (var topic in topicArray) {
            searchArray = topicArray[topic];
            for (var gadgetId in searchArray) {
              // since the same gadget can publish/subscribe to multiple topics,
              // make sure that they are on the result list only once
              if (!results[gadgetId]) {
                results[gadgetId] = searchArray[gadgetId];
              }
            }
        }
    } else if (searchArray) {
        for (var gadgetId in searchArray) {
            if (searchArray[gadgetId]) {
                results.push(searchArray[gadgetId]);
            }
        }
    }
    return results;
}

WiringManager.prototype.highlightTopic = function(/* string */topic, /* boolean */publishers, /* gadget */ignoreGadget)
{
    // overlay all of the gadgets that publish/subscribe the given topic and
    // give them a type of WiringOverlay.CURRENT
    if (!topic || topic.length == 0) {
        return;
    }

    this._overlayGadgets(this.findGadgets(topic, publishers), topic, publishers, ignoreGadget);
    if (this.overlays && this.overlays.length) {
        var numOverlays = this.overlays.length;
        for (var i = 0; i < numOverlays; i++) {
            var overlay = this.overlays[i];
            overlay.setType(WiringOverlay.CURRENT);
        }
    }
}
WiringManager.prototype.highlightGadgets = function(/* array */gadgets, /* string */topic, /* boolean */publishers)
{
    if (!gadgets) {
        return;
    }

    this._overlayGadgets(gadgets, topic, publishers, null);
    if (this.overlays && this.overlays.length) {
        var numOverlays = this.overlays.length;
        for (var i = 0; i < numOverlays; i++) {
            var overlay = this.overlays[i];
            overlay.setType(WiringOverlay.CURRENT);
        }
    }
}
WiringManager.prototype._overlayPotentialPublishers = function()
{
    // create overlays for all gadgets that could publish to the current
    // wiring property, ignoring the gadget that contains the current wiring
    // property
  this._overlayGadgets(this.findGadgets(null, true), getPropertyInfo(this.wiringProperty, "topic"), true, this.wiringProperty.getGadget());
}
WiringManager.prototype._overlayPotentialListeners = function()
{
    // create overlays for all gadgets that could publish to the current
    // wiring property, ignoring the gadget that contains the current wiring
    // property
    this._overlayGadgets(this.findGadgets(null, false), this.wiringProperty.defaultTopic(), false, this.wiringProperty.getGadget());
}
WiringManager.prototype.unhighlightTopic = function()
{
    this.unhighlightGadgets();
}
WiringManager.prototype.unhighlightGadgets = function()
{
    dojo.forEach(this.overlays,
                 function(overlay, index, array) {
                     overlay.destroy();
                     delete overlay;
                 }
                );
    this.overlays = null;
}

WiringManager.prototype._overlayGadgets = function(/* array of gadgets */gadgetArray, topic, /* boolean */publishers, /* gadget */ignoreGadget)
{
    var overlays = new Array();
    var currGadget;
    if (typeof ignoreGadget === "undefined") {
        currGadget = null;
    } else {
        currGadget = ignoreGadget;
    }
    
    for (gadgetId in gadgetArray) {
        var gadget = gadgetArray[gadgetId];
        if (gadget != currGadget) {
            var overlay = new WiringOverlay(gadget, topic, publishers);
            overlays.push(overlay);
        }
    }
    this.overlays = overlays;
}

WiringManager.prototype.stopWiringProperty = function()
{
    // Either the user has completed the wiring session or cancelled it.  But
    // the dialog hasn't been dismissed, yet, so more wiring sessions could happen
    // with the wiring gadget so keep the wiring changes around for now.
    this.unhighlightTopic();
}

WiringManager.prototype.notifyWiringPropertyComplete = function()
{
    mashupMaker.hub.publish("nomad-wiring-property-complete", null);
    this.stopWiringProperty();
}

WiringManager.prototype.wirePropertyToGadget = function(property, /* boolean */selectAPublishingGadget)
{
    var topic = null;
    if (selectAPublishingGadget) {
        topic = getPropertyInfo(property, "topic");
    } else {
        topic = property.defaultTopic();
    }
    if (topic == null) {
        this.notifyWiringPropertyComplete();
        return;
    }
    this.wiringProperty = property;

    // Build overlays for each gadget that listen for topic and since they need
    // to be clickable, set their zIndex to the zIndex of the dialog underlay.
    // If the user is being asked to selectAPublishingGadget, only overlay
    // gadgets that publish topics.  Otherwise we'll only overlay gadgets that
    // could listen for the topic that the given property publishes.
    if (selectAPublishingGadget) {
        this._overlayPotentialPublishers();
    } else {
        this._overlayPotentialListeners();
        //    this.highlightTopic(topic, selectAPublishingGadget, property.getGadget());
    }
    var dialogUnderlays = dojo.query("BODY > .dijitDialogUnderlayWrapper");
    var zIndex = 0;
    if (dialogUnderlays && dialogUnderlays.length) {
        // have to ask for z-index this way, doesn't exist in the node.style object
        zIndex = dojo.style(dialogUnderlays[0], "zIndex");
        if (zIndex && zIndex.length) {
            zIndex = parseInt(zIndex);
        }
    }
    if (this.overlays && this.overlays.length) {
        var numOverlays = this.overlays.length;
        for (var i = 0; i < numOverlays; i++) {
            var overlay = this.overlays[i];
            overlay.enable(zIndex);
        }
    }
}

WiringManager.prototype.registerWiringChange = function(property, newTopic, originalTopic, publishingGadget)
{
    // Build a list of wiring changes that happened while this property editing
    // session was in affect.  These will either be forgotten if the user decides
    // to cancel or they will be committed when the changes are saved.
    // These changes will be changes affecting the subscriptions that property
    // has (i.e. topic subscribing to, gadget bound to, etc) since wiring doesn't
    // affect publishing.
    if (!property || newTopic == null || typeof publishingGadget === "undefined") {
        return;
    }

    if (!this._changeArray) {
        this._changeArray = new Array();
    }
    // Come up with a unique key.  We need to know if the change affects the input
    // topic or the output topic of the property, too, since it is possible that
    // a property will both listen and publish and the user might change both
    // wirings.
    var uniqueKey = property.getGadget().getId()+'_'+property.name;
    this._changeArray[uniqueKey] = {property: property, newTopic: newTopic, oldTopic: originalTopic, publishingGadget: publishingGadget};

    if (newTopic != originalTopic) {
        var found = false;
        var changedGadget = property.getGadget();
//        var gadgetProperties = changedGadget.getProperties();
//        for (var i = 0; i < gadgetProperties.length; i++) {
//            var gadgetProperty = gadgetProperties[i];
//            if (gadgetProperty.listen()) {
//                if (gadgetProperty.name() != property.name() &&
//                    gadgetProperty.topic() == originalTopic) {
//                    // gadget still has a property that listens for this topic so keep
//                    // it in the list
//                    found = true;
//                    break;
//                }
//            }
//        }
        var gadgetProperties = changedGadget.OpenAjax._spec.property;
        for ( var name in gadgetProperties ) {
            var gadgetProperty = gadgetProperties[ name ];
            if ( gadgetProperty.sharedAs ) {
                if ( name != property.name &&
                    gadgetProperty.sharedAs == originalTopic) {
                    // gadget still has a property that listens for this topic so keep
                    // it in the list
                    found = true;
                    break;
                }
            }
        }
        // if this gadget no longer listens to oldTopic, remove it from the list
        // of listeners
        if (!found) {
      delete this._subscribedTopics[originalTopic][changedGadget.gID];
        }
        // if this gadget isn't already on the list for newTopic, add it
    if (!this._subscribedTopics[newTopic]) {
      this._subscribedTopics[newTopic] = {};
        }
    if (!this._subscribedTopics[newTopic][changedGadget.getId()]) {
      this._subscribedTopics[newTopic][changedGadget.getId()] = changedGadget;
        }
    }

    this.notifyWiringPropertyComplete();
}

WiringManager.prototype.cancelWiringChanges = function()
{
    // This is called when the property dialog is dismissed so none of the
    // accumulated changes should occur.
    this.unhighlightGadgets();

    this._changeArray = null;
    this._publishedTopics = null;
    this._subscribedTopics = null;
    this.wiringProperty = null;
}

WiringManager.prototype.commitWiringChanges = function()
{
    var changeObj = null;
    for (var property in this._changeArray) {
        changeObj = this._changeArray[property];
        changeObj.property.topic(changeObj.newTopic, changeObj.publishingGadget);
    }
    this.unhighlightGadgets();

    this._changeArray = null;
    this._publishedTopics = null;
    this._subscribedTopics = null;
    this.wiringProperty = null;
}

WiringManager.prototype.getWiringChange = function(property)
{
    if (!this._changeArray) {
        return null;
    }
    var uniqueKey = property.getGadget().getId()+'_'+property.name;
    if (this._changeArray[uniqueKey]) {
        return this._changeArray[uniqueKey];
    }
    return null;
}

/**
 * The Mashup Maker class encapsulate the reponsibility of the mashup canvas such as
 * loading and creating gadgets and associating the gadgets with a layout.
 *
 * @class MashupMaker
 */

function MashupMaker()
{
    this.models = new Array();
    this.isIE      = (navigator.userAgent.indexOf('MSIE')  != -1);
    this._features = { editor: {file: 'editor.js'}};

    // Not really used in the core code, yet...but we can now pass debug=true
    // through newmashup.php to stop refimpldojo.js from loading.  If that
    // happens, this member variable will be set.  So if we want to add more
    // logging, etc. that we don't want to get rid of but isn't really necessary
    // in the release, we can key off of this.
    this._debug = false;

    //config (for now need trailing '/')      

    /*
     * Resolving the base URL for gadgets
     */
    var index;
    var loc = document.location.href.toString();
    if ( document.location.search ) {
        index = loc.indexOf( document.location.search );
        loc = loc.substr( 0, index + 1 );
    }
    index = loc.lastIndexOf('/');
    if (index != -1) {
        OpenAjax.widget.baseURI = loc.substr(0, index + 1);
    } else {
        alert("Illegal location href:" + loc);
    }
    OpenAjax.widget.frameworkURI = OpenAjax.widget.baseURI + "../src/";

    if (! this.propertyEditorURL) {
        // if not property editor specified default to the simple one
        this.propertyEditorURL = OpenAjax.widget.baseURI + 'gadgets/propertyeditor/propertyeditor_oam.xml';        
    }
    this.wiringManager = new WiringManager();

    // instantiate managed hub instance
    this.loader = new OpenAjax.widget.Loader({
            ManagedHub: {
                onPublish: this.onWidgetPublish,
                onSubscribe: this.onWidgetSubscribe,
                onSecurityAlert: this.onWidgetSecurityAlert,
                scope: this
            }
    });
    this.hub = this.loader.hub;
}

MashupMaker.prototype.onWidgetPublish = function( topic, message, pcont, scont )
{
    var pid = pcont ? pcont.getClientID() : "manager";
    var sid = scont ? scont.getClientID() : "manager";
    console.log( ">> onPublish: from=" + pid + " to=" + sid + " t=" + topic + " d=" + JSON.stringify(message) );
    if ( this.publishManagers && this.publishManagers.length > 0 ) {
        for ( var i = 0; i < this.publishManagers.length; i++ ) {
            try {
                this.publishManagers[i]( topic, message, pcont, scont );
            } catch (e) {}
        }
    }
    return true;
}

MashupMaker.prototype.onWidgetSubscribe = function( topic, container )
{
    var id = container ? container.getClientID() : "manager";
    console.log( "++ onSubscribe: w=" + id + "  t=" + topic );
    if ( this.subscribeManagers && this.subscribeManagers.length > 0 ) {
        for ( var i = 0; i < this.subscribeManagers.length; i++ ) {
            try {
                this.subscribeManagers[i]( topic, container );
            } catch (e) {}
        }
    }
    return true;
}

MashupMaker.prototype.onWidgetSecurityAlert = function( source, alertType )
{
    // XXX TODO
}

MashupMaker.prototype.addPubSubManagerCallback = function( type, callback )
{
    switch( type ) {
        case 'publish' :
            if ( ! this.publishManagers ) {
                this.publishManagers = [];
            }
            this.publishManagers.push( callback );
            break;

        case 'subscribe' :
            if ( ! this.subscribeManagers ) {
                this.subscribeManagers = [];
            }
            this.subscribeManagers.push( callback );
            break;
    }
}

MashupMaker.prototype.removePubSubManagerCallback = function( type, callback )
{
    var cbs;
    if ( type == 'publish' ) {
        cbs = this.publishManagers;
    } else if ( type == 'subscribe' ) {
        cbs = this.subscribeManagers;
    } else {
        return;
    }
    
    for ( var i = 0; i < cbs.length; i++ ) {
        if ( cbs[i] === callback ) {
            cbs.splice( i, 1 );
            break;
        }
    }
}

MashupMaker.prototype.getFeature = function(feature, loadedCB)
{
    if (this._features[feature]) {
        if (! this._features[feature].loaded) {
            var head = document.getElementsByTagName('head').item(0);
            var scriptBlock = document.createElement('SCRIPT');
            scriptBlock.src = this._features[feature].file;
            head.appendChild(scriptBlock);        
            this._featureCB = loadedCB;
            this._pendingFeature = feature;
        } else {
            if (loadedCB) {
                loadedCB(this._features[feature].instance);
            }
        }
    }
}

MashupMaker.prototype.featureLoadedCB = function(instance)
{
    this._features[this._pendingFeature].loaded = true;
    this._features[this._pendingFeature].feature = instance;
    if (this._featureCB) {
        this._featureCB(instance);
    }
}

MashupMaker.prototype.createGadget = function( url, targetDOM, id, nochrome, positionInfo, privileged )
{
    if ( ! targetDOM ) {
        targetDOM = this.getDefaultGadgetContainer();
    }
    
//    <table class="gadgetContainer" _widgetid="gID_4a0c4ba6cc238" style="" cellspacing="0" cellpadding="0">
//	    <tbody>
//	        <tr>
//	            <td>
//            		<div class="gadgetBoxHeader"><div></div></div>
//            		<div class="gadgetBoxContent">
//            		    <div class="gadgetHeader">
//            		        <IMG CLASS="absDeleteImg" SRC="gadgets/layout/images/deleteIcon_11x11.gif">
//            		        <IMG ID="gID_4a0c4ba6cc238_propMenuTarget" CLASS="absPropEditImg" SRC="gadgets/layout/images/prop_edit.gif">
//            		        <DIV CLASS="gadgetTitle">ColorPalette</DIV>
//            		    </div>
//            		    <div class="gadgetBody" id="gID_4a0c4ba6cc238_gadgetBody" style="width:208px;height:148px;">
//            		        <SPAN>
//            		            <iframe id="gID_4a0c4ba6cc238_frame" class="gadgetFrame" name="gID_4a0c4ba6cc238_frame" frameborder="0" scrolling="no" style="width:100%;height:100%"></iframe>
//            		            <script>
//                                    var __gID_4a0c4ba6cc238_data = [{"topic":"color","publish":"true","default":"#ffffff","name":"color","datatype":"String"}];
//                                    var __gID_4a0c4ba6cc238_views = ["default"];
//                                    mashupMaker.createGadgetInstance(
//                                            'gID_4a0c4ba6cc238',
//                                            null,
//                                            __gID_4a0c4ba6cc238_data,
//	                                        __gID_4a0c4ba6cc238_views,
//	                                        'http://www.openajax.org/2008_InteropFest/mashupapp/gadgets/samples/gadgets/colorpalette/colorpalette_oam.xml',
//	                                        'page',
//	                                        { url: 'http://c50.openajax.org/2008_InteropFest/mashupapp/gadgets/samples/showGadget.php?url=http%3A%2F%2Fwww.openajax.org%2F2008_InteropFest%2Fmashupapp%2Fgadgets%2Fsamples%2Fgadgets%2Fcolorpalette%2Fcolorpalette_oam.xml',
//	                                          frameID: 'gID_4a0c4ba6cc238_frame'
//                                            }
//                                    );
//
//                                </script>
//                            </SPAN>
//                        </div>
//            		</div>
//            		<div class="gadgetBoxFooter"><div></div></div>
//            	</td>
//            </tr>
//        </tbody>
//	</table>
    
    if ( ! id ) {
        id = "gID_" + ((0x7fffffff * Math.random()) | 0).toString(16);
    }
	
	var response = '' +
        '<table class="gadgetContainer" _widgetid="' + id + '" style="" cellspacing="0" cellpadding="0">' +
        '    <tbody>' +
        '        <tr>' +
        '            <td>';
    if ( ! nochrome ) {
        response +=
        '            <div class="gadgetBoxHeader"><div></div></div>' +
        '                <div class="gadgetBoxContent">' +
        '                   <div class="gadgetHeader">' +
        '                       <IMG CLASS="absDeleteImg" SRC="gadgets/layout/images/delete.png">' +
        //'                       <IMG ID="' + id + '_propMenuTarget" CLASS="absPropEditImg" SRC="gadgets/layout/images/prop_edit.gif">' +
        '                       <DIV CLASS="gadgetTitle">...loading...</DIV>' +
        '                   </div>';
    }
    response +=
        '                   <div class="gadgetBody" id="' + id + '_gadgetBody">' +
        '                   </div>';
    if ( ! nochrome ) {
        response +=
        '               </div>' +
        '               <div class="gadgetBoxFooter"><div></div></div>';
    }
    response +=
        '           </td>' +
        '        </tr>' +
        '    </tbody>' +
        '</table>';
    
    var temp = document.createElement('DIV');
    temp.innerHTML = response;
    var containers = dojo.query(".gadgetContainer", temp);
    var gadgetContainer = (containers && containers.length > 0) ? containers[0] : null;

    var dropInfo = positionInfo || null;

    if (gadgetContainer) {
        this.layout.setLayoutStyles(gadgetContainer);
        if (dropInfo) {
            gadgetContainer.style.left = dropInfo.x;
            gadgetContainer.style.top = dropInfo.y;
            this._insertWidget( targetDOM, null, gadgetContainer, 'child' );
        } else {
            this._insertWidget( targetDOM, null, gadgetContainer, 'child' );
        }
    }
    
    delete temp;
    
    var mm = this;
    this.loader.loadMetadata({
        url: url,
        onComplete: function( spec )
        {
            // Look through the spec for references to Dojo.  If it is the same
            // version as our "local" version, then replace with location of
            // our Dojo build.
            for ( var libname in spec.library ) {
                if ( libname.toLowerCase() === "dojo" ) {
                    var lib = spec.library[ libname ];
                    var ver = lib.version.split(".");
                    if ( dojo.version.major == ver[0] && dojo.version.minor == ver[1] ) {
                        // update 'src' to point to our local Dojo
                        lib.src = dojo.baseUrl.match(/(.+\/)[^\/]+\/?$/)[1];
                        // if lib.src is relative, make absolute
                        if ( lib.src.charAt(0) !== "/" && ! lib.src.match(/^http(s)?\:/) ) {
                            lib.src = OpenAjax.widget.baseURI + lib.src;
                        }
                        
                        // Some JS files may be XD versions of Dojo files --
                        // rename to remove the "xd".
                        // Also, remember the index of "dojo.js"; we'll use
                        // that later when adding in "refimpldojo.js".
                        var dojoJsIdx = -1;
                        for ( var i = 0; i < spec.require.length; i++ ) {
                            var req = spec.require[i];
                            if ( req._library_ !== "dojo" || req.type !== "javascript" ) {
                                continue;
                            }
                            req.src = req.src.replace( /(.+)\.xd\.js$/, "$1.js" );
                            if ( dojoJsIdx === -1 && req.src.match( /^(.*\/)?dojo\.js$/ ) ) {
                                dojoJsIdx = i;
                            }
                        }
                        
                        // Add "refimpldojo.js" as a require, right after
                        // "dojo.js".
                        var arr = spec.require.slice( 0, dojoJsIdx + 1 );
                        var end = spec.require.slice( dojoJsIdx + 1 );
                        arr.push({
                            _library_: "dojo",
                            src: "dojo/refimpldojo.js",
                            type: "javascript"
                        });
                        spec.require = arr.concat( end );
                    }
                    break;
                }
            }
            
            mm.loader.create({
                id: id,
                spec: spec,
                target: id + "_gadgetBody",
                sandbox: true,
                onComplete: function( widget )
                {
                    // (2) create the widget model -- used by MashupMaker...
    
                    // bind widget model to hub -- use __<ID> in order to avoid conflict when
                    // binding widget instance (which uses <ID>)
    //                this.hub.bind( "__" + id );
    
    //                var widgetModel = null;
    //                if ( type == "google" ) {
    //                    widgetModel = new OpenAjax.widget.GoogleGadgetModel( id, properties, views, data.url, data.frameID );
    //                } else {
    //                    widgetModel = new OpenAjax.widget.WidgetModel( id, properties, views );
    //                }
    //
    //                if ( specurl != null ) {
    //                    widgetModel.setSpecUrl( specurl );
    //                }
    
                    var container = dojo.query(".gadgetContainer[_widgetid=\"" + id + "\"]");
                    mm.layout.setLayoutStyles(container[0]);
                    widget.OpenAjax._site = new GadgetSite(container[0], id/*, views*/);    // XXX JHP TODO handle views
                    
                    // set title
                    if ( ! nochrome ) {
                        dojo.query( ".gadgetTitle", container[0] )[0].innerHTML = widget.OpenAjax._spec.name;
                    }
                    
                    // add "gadgetFrame" class to widget iframe
                    dojo.query( "iframe", container[0] ).addClass( "gadgetFrame" );
    
                    // make sure that the widget container is on top of the other windows on
                    // the canvas
                    mm.layout.putOnTop( container );
    
                    mm.models[id] = widget;   // XXX not needed - use OpenAjax.widget.byId()
                    mm.wiringManager.addGadget( widget );
    //                widgetModel.type = type;
    
                    // keep a reference to the Widget instance inside the WidgetModel
                    // (only for 'fragment' [non-sandboxed] widgets)
    //                widgetModel.widget = widget;
    
    
                    // XXX from sandboxedWidgetLoaded
                    console.log('widget loaded id='+id);
                    
                    widget.OpenAjax._loaded = true;
                },
                onError: function( error )
                {
                    // XXX handle error better
                    console.log(" !!! failed to create widget instance " + id + " :: " + url );
                }
            });
        },
        onError: function( error )
        {
            // XXX handle error
            console.error( error );
        }
    });
}

MashupMaker.prototype._insertWidget = function( parentElement, referenceElement, widgetContainer, position )
{
    // pull out any scripts -- we handle those below
//    var scripts = [];
//    var elems = widgetContainer.getElementsByTagName('SCRIPT');
//    for ( var i = 0; i < elems.length; i++ ) {
//        scripts.push( elems[i].parentNode.removeChild( elems[i] ) );
//    }
    
    if ( position == 'before' ) {
        parentElement.insertBefore( widgetContainer, referenceElement );
    } else {
        parentElement.appendChild( widgetContainer );
    }

    // now that the content has been added to the page, run any scripts
//    for ( var j = 0; j < scripts.length; j++ ) {
//        if ( typeof window.execScript === 'function' ) {
//            window.execScript( scripts[j].text );
//        } else {
//            (function() { eval.call( window, scripts[j].innerHTML ); } )();
//        }
//    }
}


// XXX this is the old version
MashupMaker.prototype.__createGadget = function(url, targetDOM, id, callback, argobj, nochrome, positionInfo)
{
    if ( ! targetDOM ) {
        targetDOM = this.getDefaultGadgetContainer();
    }
    var resourceUri = OpenAjax.widget.baseURI + 'insertGadget.php?url=' + encodeURIComponent(url);
    if ( id ) {
        resourceUri += '&id=' + id;
    }
    if ( nochrome ) {
        resourceUri += '&nochrome=' + Boolean(nochrome).toString();
    }
    if ( this._debug ) {
        resourceUri += '&debug=true';
    }
    var mm = this;
    var bindArgs = {
        preventCache: false,
        handleAs: 'text',
        url:  resourceUri,
        sync: true,
        load: function(response) {
            var temp = document.createElement('DIV');
            temp.innerHTML = response;
            var containers = dojo.query(".gadgetContainer", temp);
            var gadgetContainer = null;
            if (containers && containers.length > 0) {
                gadgetContainer = containers[0];
            }

            var frames = temp.getElementsByTagName('IFRAME');
            if (frames.length) {
                var frame = frames.item(0);
                mm._creatingGadget = {frame: frame, callback: callback, argobj: argobj}
            }
            var dropInfo = null;
            if (typeof positionInfo != 'undefined') {
                dropInfo = positionInfo;
            }
            if (gadgetContainer) {
                mm.layout.setLayoutStyles(gadgetContainer);
                if (dropInfo) {
                    gadgetContainer.style.left = dropInfo.x;
                    gadgetContainer.style.top = dropInfo.y;
                    this.insertWidget( targetDOM, null, gadgetContainer, 'child' );
                } else {
                    this.insertWidget( targetDOM, null, gadgetContainer, 'child' );
                }
            }
            delete temp;
        },
        error: function(error, request) {
            alert(error);
        },
        insertWidget: function( parentElement, referenceElement, widgetContainer, position ) {
            // pull out any scripts -- we handle those below
            var scripts = [];
            var elems = widgetContainer.getElementsByTagName('SCRIPT');
            for ( var i = 0; i < elems.length; i++ ) {
                scripts.push( elems[i].parentNode.removeChild( elems[i] ) );
            }
            
            if ( position == 'before' ) {
                parentElement.insertBefore( widgetContainer, referenceElement );
            } else {
                parentElement.appendChild( widgetContainer );
            }

            // now that the content has been added to the page, run any scripts
            for ( var j = 0; j < scripts.length; j++ ) {
                if ( typeof window.execScript === 'function' ) {
                    window.execScript( scripts[j].text );
                } else {
                    (function() { eval.call( window, scripts[j].innerHTML ); } )();
                }
            }
        }
    };
    dojo.xhrGet(bindArgs);
}

MashupMaker.prototype.getDefaultGadgetContainer = function()
{
    var dgc = document.getElementById('__replaceablecontent__');
    if ( ! dgc ) {
        if (document.body) {
            dgc = document.createElement('DIV');
            dgc.setAttribute('id', '__replaceablecontent__');
            document.body.appendChild(dgc);
        }
    }
    return dgc;
}

/**
 * @param {String} id  The ID to be used for the created widget.
 * @param {Function} widgetClass  Name of widget class.  If not specified,
 *          uses OpenAjax.widget.Widget.
 * @param {array} properties  Array of properties for the widget -- these are
 *          either read from persistent storage or the defaults as specified
 *          in the widget spec.
 * @param {array} views  Array of view names
 * @param {String} specurl  URL for the widget specification file.
 * @param {String} type  Widget type.  Supported values are 'fragment' or 'page'.
 *          If omitted, defaults to 'fragment'.
 * @param {Object} data  A data object that is specific to the given 'type'
 * @param {Object} dimensions  Initial dimensions of widget - {w, h}
 *
 * @returns the widget instance
 * @type Object
 */
MashupMaker.prototype.createGadgetInstance = function( id, widgetClass,
        properties, views, specurl, type, data, dimensions )
{
    // (1) create the object that is used by the widget...

    if ( type != "google" ) { // don't create widget instance for Google Gadgets
        // bind widget instance to hub
        //AP this.hub.bind( id );
    
        if ( ! type ) {
            type = 'fragment';
        }
        var widget = null;
    
        switch ( type ) {
            case 'fragment' :
                widget = OpenAjax.widget.Widget.createWidgetObjectInstance( id,
                        widgetClass, properties, null, dimensions, views );
                break;
        
            case 'page' :
                // Use SMash to connect to 'page' widgets
                function smashLoadError( id, error ) {
                    // XXX handle smash error
                    alert( 'The widget ' + id + ' failed to load (' + error + ')' );
                }
                //AP var newURI = smash.prepareForLoad({ clientName: id, uri: data.url, commErrorCallback: smashLoadError });
        
                // set iframe URL (load sandboxed gadget)
                dojo.byId( data.frameID ).src = newURI;
                
                break;
        
            default :
                throw 'unsupported widget type';
        }
        
        // listen for when this widget gets loaded
        var callback = function( success, subHandle ) {
            if ( !success ) {
                // XXX handle error
                alert( "subscribe failed" );
            }
        };
        this.hub.subscribe( "openajax.widget." + id + "._loaded",
                callback, dojo.hitch(this, this.sandboxedWidgetLoaded) );
    }

    // (2) create the widget model -- used by MashupMaker...
    
    // bind widget model to hub -- use __<ID> in order to avoid conflict when
    // binding widget instance (which uses <ID>)
    this.hub.bind( "__" + id );

    var widgetModel = null;
    if ( type == "google" ) {
        widgetModel = new OpenAjax.widget.GoogleGadgetModel( id, properties, views, data.url, data.frameID );
    } else {
        widgetModel = new OpenAjax.widget.WidgetModel( id, properties, views );
    }

    if ( specurl != null ) {
        widgetModel.setSpecUrl( specurl );
    }

    var container = dojo.query(".gadgetContainer[_widgetid=\""+widgetModel.getId()+"\"]");
    this.layout.setLayoutStyles(container[0]);
    widgetModel._site = new GadgetSite(container[0], id, views);

    // make sure that the widget container is on top of the other windows on
    // the canvas
    this.layout.putOnTop(widgetModel.getSite().getContainer());

    this.models[id] = widgetModel;
    this.wiringManager.addGadget(widgetModel);
    widgetModel.type = type;
    
    // keep a reference to the Widget instance inside the WidgetModel
    // (only for 'fragment' [non-sandboxed] widgets)
    widgetModel.widget = widget;
    
    return widget;
}

MashupMaker.prototype.onload = function(event, debug)
{
    this.hub.publish( 'openajax.widget.mashup.load', null );

    // cycle through all 'fragment' widgets and call their __onLoad() method
    for ( var id in this.models ) {
        var w = this.models[ id ].widget;
        if ( w && typeof w.__onLoad === 'function' ) {
            w.__onLoad();
        }
    }

    this._debug = debug;
}

MashupMaker.prototype.handleWidgetResize = function( widgetID )
{
    if ( ! widgetID ) {
        return;
    }
    var widget = this.getWidgetModelFromID( widgetID );
    var dimensions = widget.OpenAjax._site.getDimensions();
    widget.OpenAjax.adjustDimensions( dimensions );    // XXX need a better API for this?
}

MashupMaker.prototype.deleteGadget = function( widgetID )
{
    // notify widget instance of removal -- before removing widget from canvas
    // we have to wait for acknowledgment that it has run its 'onUnload'
    // callback.
    var widget = this.models[ widgetID ];
    if ( widget.OpenAjax._loaded ) {
        widget.OpenAjax._unload( dojo.hitch( this, this.finishDeleteGadget ) );
    } else {
        this.finishDeleteGadget( widgetID );
    }
}

MashupMaker.prototype.finishDeleteGadget = function( widgetID )
{
    var widgetModel = this.models[ widgetID ];

    this.wiringManager.removeGadget( widgetModel );

    var site = widgetModel.OpenAjax._site;
    if ( site ) {
        var container = site.getContainer();
        // We cannot delete the widget container directly right now, since one
        // of the methods up the stack is a SMash method running from the
        // tunnel.html. If we delete the container, we delete the tunnel IFRAME,
        // which means that when this method returns to the SMash code, the
        // Javascript environment has been destroyed and hilarity ensues. So
        // instead, we use a setTimeout with an interval of zero to allow this
        // stream of code to conclude, and then delete the widget container.
        setTimeout( function() {
            container.parentNode.removeChild(container);
            delete container;
        }, 0 );
    }

    delete this.models[ widgetID ];
}

/**
 * If the widgetID belongs to a widget of type 'page', we'll disconnect the
 * widget from smash and tell the widget that it has been removed.  The gadget's
 * IFRAME src will also be changed to force its document to unload.  The
 * widgetModel for the widget will still live on, though.  maybeDisconnectWidget
 * should be called before moving the gadgetContainer in the DOM otherwise smash
 * will complain on browsers where IFRAMEs reload when moved in the DOM (like
 * Firefox).
 *
 * @param {String} widgetID  The ID of the widget to disconnect
 *
 * @returns whether the widget was actually disconnected such that a
 *          maybeReconnectWidget would be necessary
 * @type boolean
 */
MashupMaker.prototype.maybeDisconnectWidget = function( widgetID, callback )
{
    var widgetModel = this.models[ widgetID ];

    // If this isn't a 'page' type of widget, ignore.  We only want to be able
    // to disconnect a widget in certain instances and we should never have to
    // disconnect a non 'page' widget.  One such instance is when moving a
    // 'page' widget in the DOM since on FF this causes a reload of IFRAMES that
    // smash doesn't like.
    if ( widgetModel.type != 'page' ) {
        return false;
    }

    var that = this;
    this.hub.subscribe( 'openajax.widget.' + widgetID + '._removed',
            function( success, subHandle, callback ) {
                if ( ! success ) {
                    // something went wrong -- log the error and finish deletion
                    console.log( "ERROR: failed to subscribe to '_removed'" );
                    dojo.hitch( that, That.finishDisconnectWidget, callback );
                }
            },
            dojo.hitch( that, that.finishDisconnectWidget, callback )
    );
    // notify widget instance of removal
    widgetModel.fireEvent( "remove" );
    return true;
}

MashupMaker.prototype.finishDisconnectWidget = function( disconnectCallback, subHandle, topic, data )
{
    // don't need to listen on this topic anymore
    subHandle.unsubscribe();

    // pull widget ID from topic
    var widgetID = topic.split('.')[2];
    smash.prepareForUnload( widgetID );
    dojo.byId( widgetID + "_frame" ).src="about:blank";

    // don't delete the widget model since we need info from it to reconnect

    // We cannot allow the gadgetContainer to move around right now, since one
    // of the methods up the stack is a SMash method running from the
    // tunnel.html. If we move/remove the container, we delete the tunnel IFRAME,
    // which means that when this method returns to the SMash code, the
    // Javascript environment has been destroyed and hilarity ensues. So
    // instead, we use a setTimeout with an interval of zero to allow this
    // stream of code to conclude, and then call the callback.  We are assuming
    // that the callback is going to move/remove the gadgetContainer otherwise
    // way disconnect the gadget?
    setTimeout( function(){disconnectCallback();}, 0 );
}

/**
 * After maybeDisconnectWidget is called, the caller should reconnect widgets
 * only after allowing the disconnected widgets' frames to unload.  This is
 * because smash has logic in the frames' onunload handler.  So this is
 * probably best done doing something like setTimeout(reconnectMyWidgetsFunc, 0)
 * to set it up after the onunload events in the event queue.
 *
 * @param {String} widgetID  The ID of the widget to reconnect
 *
 */
MashupMaker.prototype.maybeReconnectWidget = function( widgetID )
{
    // XXX We should also probably only do this if we can determine if the
    // widgetModel has already been disconnected.  Currently this doesn't do
    // anything so commenting it out.
    var widgetModel = this.models[ widgetID ];
//    if (widgetModel.connHandle.isConnected()) {
//      return;
//    }

    // If this isn't a 'page' type of widget, ignore.  We only want to be able
    // to reconnect a widget that has been disconnected and we should never have
    // to disconnect a non 'page' widget.
    if ( widgetModel.type != 'page' ) {
        return;
    }

    // (2) create the object that is used by the widget...

    // bind widget instance to hub
    this.hub.bind( widgetID );

    // Use SMash to connect to 'page' widgets
    function smashLoadError( widgetID, error ) {
        // XXX handle smash error
        alert( 'The widget ' + widgetID + ' failed to load (' + error + ')' );
    }

    // set iframe URL (load sandboxed gadget), pass in the current widget
    // properties so that user changes aren't lost
    var properties = widgetModel.getPropertiesDatums();
    var propertiesJSON = JSON.stringify(properties);

    var showGadgetUrl =
        OpenAjax.widget.baseURI+'showGadget.php?url='
        + encodeURI(widgetModel.getSpecUrl()
        + '&properties='+ propertiesJSON);
        
    var newURI = smash.prepareForLoad({ clientName: widgetID, uri: showGadgetUrl,
            commErrorCallback: smashLoadError });

    dojo.byId( widgetID + "_frame" ).src = newURI;
}

/**
 * @param {OpenAjax.widget.Widget} sandboxedWidget  Sandboxed widget instance
 * @param {DOM:Element} container  DOM content related to given widget instance
 */
MashupMaker.prototype.sandboxedWidgetLoaded = function( subHandle, topic, dataString )
{
    // pull widget ID from topic
    var widgetID = topic.split('.')[2];
    var widgetModel = this.models[ widgetID ];

    console.log('widget loaded id='+widgetID);

    // now that widget is loaded, don't need to listen on this topic anymore
    subHandle.unsubscribe();

    if (this._creatingGadget) {
        // fire an 'insert' event
        widgetModel.fireEvent( 'insert' );

        var callback = this._creatingGadget.callback;
        if ( callback && typeof callback === "function" ) {
            console.log('createGadget calling callback id='+widgetID);
            callback( /*sandboxedWidget*/ null, this._creatingGadget.argobj );
        }
        
        this._creatingGadget = null;
    }

    widgetModel.loaded = true;
}

MashupMaker.prototype.openGadgetView = function( widgetID, viewName )
{
    var widgetModel = this.models[ widgetID ];
    widgetModel.fireEvent( "_showView", viewName );
}

MashupMaker.prototype.editGadget = function( widgetID )
{
    var widget = OpenAjax.widget.byId( widgetID );
    if ( widget.views && dojo.indexOf( widget.views, "edit" ) != -1 ) {    // XXX 'views' should exist; shouldn't need to check for it
        // widget has an 'edit' content view
        widget.fireEvent( "_showView", "edit" );
    } else {
        // show standard property editor
        this._generatePropertyEditor( widget );
    }
}

MashupMaker.prototype.shareGadget = function( widgetID )
{
    var widgetModel = this.models[ widgetID ];
    var script = "&lt;script src=\"" + OpenAjax.widget.baseURI + "embedWidget.php?specURL=" 
                 + widgetModel.getSpecUrl() + "\"&gt;&lt;/script&gt;";
    var dialogDiv = dojo.byId('__OAA_shareDialog_container');
    dojo.parser.parse(dialogDiv);
    dojo.byId("__OAA_shareDialog_script_tag").innerHTML = script;
    dijit.byId("__OAA_share_dialog").show();
    return;
}

MashupMaker.prototype._generatePropertyEditor = function( widget )
{
    if (this.propertyEditorURL)  {
        var widgetProps = widget.OpenAjax._spec.property;
        //if there are no properties, then show an alert
        var hasProps = false;
        for ( var n in widgetProps ) {    // XXX is there a better way to do this?
            hasProps = true;
            break;
        }
        if ( ! widgetProps || ! hasProps ) {
            alert( "No properties to edit!" );
            return;
        }
        var propDlg = dijit.byId('propertyDialog');
        var propDlgContents = dojo.byId(propDlg.id+'_Contents');
        var d = new Date();
        var t = d.getTime();
        var gid = 'gID_' + t;
//        var argobj = {gid:gid, editGadgetID: widget.OpenAjax.getId()};
        console.log('_generatePropertyEditor gid='+gid);
        if (propDlgContents) {
          if (!propDlg.propertyEditor) {
              var sid = this.hub.subscribe( "nomad-propertyEditor-ready",
                      function( topic, data ) {
                          this.hub.unsubscribe( sid );
                          this._completePropertyEditor( widget.OpenAjax.getId() );
                      },
                      this
              );
              mashupMaker.createGadget(this.propertyEditorURL, propDlgContents, gid, 
                                       true, null, true);
          } else {
              this._completePropertyEditor( widget.OpenAjax.getId() );
          }
        }
    } else {
        throw 'No property editor defined';
    }
}

/**
 * @param {OpenAjax.widget.Widget} propEditorWidget  Property Editor widget instance (may be null)
 * @param obj  Callback object that contains ID of Property Editor widget ('gid')
               and ID of widget whose properties we are editing
 */
MashupMaker.prototype._completePropertyEditor = function( editGadgetID )
{
    console.log( '_completePropertyEditor gid=' + this.propertyEditor.OpenAjax.getId() );
    var propDlg = dijit.byId('propertyDialog');
    var propDlgContents = dojo.byId(propDlg.id+'_Contents');
    if (propDlgContents) {
        if (!propDlg.propertyEditor) {
//            propDlg.propertyEditor = propEditorWidget;
            propDlg.propertyEditor = this.propertyEditor;
        }
        // some widgets add tooltips which will tweak the body size in an
        // undetectable way and scrollbars will show seemingly without reason
        // so get rid of scrollbars with overflow hidden
        var widget = this.getWidgetModelFromID( editGadgetID );
        var propDlgContainerID = propDlg.propertyEditor.OpenAjax.getId() + 'propertyEditor';
        propDlg.propertyEditor.editGadget( widget, propDlgContainerID, false, propDlg );
        propDlg.show();
    }
}

MashupMaker.prototype.getWidgetModelFromID = function( id )
{
//    return this.models[ id ];
    // XXX delete this function and replace with OpenAjax.widget.byId()
    return OpenAjax.widget.byId( id );
}

MashupMaker.prototype.exportElement = function(root, pruneCB) 
{
    if (! root && ! this.root) {
        root = document.getElementById('__replaceablecontent__');
        if (! root) {
            root = document.body;
        }
    } else {
        root = root ? root : (this.root ? this.root : document.body);
    }

    var clone = root.cloneNode(true);

    var gadgets = this.layout.getGadgets(clone);
    for (var i = 0; i < gadgets.length; i++) {
        var gadgetInfo = gadgets[i];
        var gadget = gadgetInfo.gadget;
        if ( ! gadget.getSite() ) {
            continue;
        }
        if (pruneCB) {
            pruneCB(gadget, gadgetInfo.site);
            continue;
        }
        var site = gadgetInfo.site;
        if (! site) {
            continue;
        } 
        var body = site.getBody();
        var gadgetParent = body;
        var nextSibling = null;
        /*
         * remove gadget container chrome
         */
        while ( gadgetParent.parentNode ) {
            if ( gadgetParent.className == "gadgetContainer" ) {
                temp = gadgetParent.parentNode;
                nextSibling = gadgetParent.nextSibling;
                temp.removeChild(gadgetParent);
                gadgetParent = temp;
                break;
            } else {
                gadgetParent = gadgetParent.parentNode;
            }
        }
        var properties = gadget.getProperties();
        var newWidget = gadgetParent.ownerDocument.createElement('SPAN');
        // need to insert the replacement span into the same place in the DOM
        // from which we removed the gadget container in case it was amongst
        // text nodes, in a table, etc.
        gadgetParent.insertBefore(newWidget, nextSibling);
        newWidget.className = 'widget';
        newWidget.setAttribute('id', gadget.getId());
        newWidget.setAttribute('url', gadget.getSpecUrl());
        
        var dimensions = gadget.getSite().getDimensions();
        newWidget.setAttribute('width', dimensions['width'] + 'px');
        newWidget.setAttribute('height', dimensions['height'] + 'px');

        var position = gadget.getSite().getPosition();
        newWidget.setAttribute('top', position.y + 'px');
        newWidget.setAttribute('left', position.x + 'px');

        if ( properties ) {
            var newProperties = gadgetParent.ownerDocument.createElement('SPAN');
            newWidget.appendChild(newProperties);
            newProperties.className = 'properties';
            newProperties.setAttribute('name', 'userproperties');
            for (var j = 0; j < properties.length; j++) {
                var prop = properties[j];
                var newProperty = gadgetParent.ownerDocument.createElement('SPAN');
                newProperty.className = 'property';
                newProperties.appendChild(newProperty);
                newProperty.setAttribute('name', prop.name());
                newProperty.setAttribute('datatype', prop.type());
                newProperty.setAttribute('publish', prop.publish());
                newProperty.setAttribute('subscribe', prop.subscribe());
                newProperty.setAttribute('topic', prop.topic());
                var sbgId = prop.getSingleBoundGadget();
                if ( sbgId ) {
                    newProperty.setAttribute('singlebound', sbgId);
                }
                var propValue = prop.evanescent() == "true" ? "" : prop.encodedValue();
                var tnode = gadgetParent.ownerDocument.createTextNode(propValue);
                newProperty.appendChild(tnode);
            }
        }        
    }
    return clone;
}

MashupMaker.prototype.getDragManager = function() {
    return this._dragInProgress;
}

MashupMaker.prototype.setDragManager = function(/* DragManager*/ dragManager) {
    this._dragInProgress = dragManager;
}

MashupMaker.prototype.startDND = function(event, dragItem) {
    dijit.byId('searchResults')._toggleDropDown();
    
    this.setDragManager(new DragManager(event, dragItem, null, null));
    this.layout.dragPaletteItem(this.getDragManager().dndNode, event.pageX, event.pageY, dojo.hitch(this, this.stopDND));
    dojo.stopEvent(event);
    return;
}

MashupMaker.prototype.dropCallback = function(/* event */ event, /* drop item */ item) {
    return;
}

MashupMaker.prototype.stopDND = function(/* boolean */dropSuccessful, /* object */dropInfo) {
  var dragManager = mashupMaker.getDragManager();
  // if the drop occurred (drag not cancelled) then create a gadget at the
  // drop location
  if (dropSuccessful) {
    this.createGadget(dragManager.getDragItem().itemUrl, null, null, false, dropInfo);
  }
  this.getDragManager().cancelDrag();
  this.setDragManager(null);
  dijit.byId('searchResults')._toggleDropDown();

  /* XXX do I need to set focus back to the palette item that was dragged when
   * the palette reappers?
   */
  return;
}

MashupMaker.prototype.getGadgets = function() {
    var root = document.getElementById('__replaceablecontent__');
    if (! root) {
        root = document.body;
    }

    return this.layout.getGadgets(root);
}

MashupMaker.prototype.getWiringManager = function() {
    if (!this.wiringManager) {
        this.wiringManager = new WiringManager();
    }
    return this.wiringManager;
}

MashupMaker.prototype.getRepositoryList = function(callback) {
    if (!this._repositoryList) {
        //AP OpenAjax.widget.baseURI+
      var resourceUri = 'http://www.openajax.org/samples/mashupapp/repository/oscontroller.php?action=getRepositories';
      var that = this;
      var bindArgs = {
          handleAs: 'json',
          url:  resourceUri,
          sync: true,
          load: function(response) {
              that._repositoryList = response;
              callback(response);
          },
          error: function(error, request) {
              console.log('Error retrieving repository list: \n'+error.message);
          }
      };
      dojo.xhrGet(bindArgs);
    }
    callback(this._repositoryList);
}

MashupMaker.prototype.getDebug = function() {
    return this._debug;
}

MashupMaker.prototype.setEditorWidget = function(editorWidget) {
    this.layout.setEditorWidget(editorWidget);
}

if (typeof Node == 'undefined') {
    Node = {};
    Node.ELEMENT_NODE = 1;
    Node.TEXT_NODE    = 3;
}

var mashupMaker = new MashupMaker((typeof mashupArgs != 'undefined' ? mashupArgs : null));
mashupMaker.propertyEditorURL = OpenAjax.widget.baseURI + 'nomad/propertyeditor/propertyeditor_oam.xml';        
