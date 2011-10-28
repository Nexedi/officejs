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

// XXX
if ( typeof console === "undefined" ) {
    console = {};
}
if ( typeof console.log === "undefined" ) {
    console.log = function() {};
}


if ( typeof OpenAjax !== "undefined" ) {

OpenAjax.hub.registerLibrary("OpenAjax.widget", "http://openajax.org/widget", "0.3", {});

// XXX make this a part of Loader params?
/*=====
oaaLoaderConfig = {
	// proxy: String
    //      URL of proxy which allows cross-domain calls.  The proxy must take
    //      a URL parameter "oawu", which is the requested URL.
    proxy: undefined
}
=====*/

if ( ! OpenAjax.widget ) {
    /**
     * @namespace
     */
    OpenAjax.widget = {};
}

(function() {

/**
 * @class
 * <p> Widget loader. </p>
 * 
 * @description
 * Creates a new Loader instance.
 * 
 * @param {Object} args
 *     Parameters used to instantiate the Loader.  This object may contain the
 *     following properties:
 * @param {Object} args.ManagedHub
 *     Parameters for creating a ManagedHub instance.
 */
OpenAjax.widget.Loader = function( args )
{
    var onsub = args.ManagedHub.onSubscribe;
    var onpub = args.ManagedHub.onPublish;
    var onunsub = args.ManagedHub.onUnsubscribe;
    var scope = args.scope || window;
    
    function _onSubscribe( topic, container )
    {
        return onsub.apply( scope, arguments );
    }
    
    function _onPublish( topic, data, pcont, scont )
    {
        return onpub.apply( scope, arguments );
    }
    
    function _onUnsubscribe( topic, container )
    {
        if ( onunsub ) {
            return onunsub.apply( scope, arguments );
        }
    }
    
    this.hub = new OpenAjax.hub.ManagedHub({
        onPublish: _onPublish,
        onSubscribe: _onSubscribe,
        onUnsubscribe: _onUnsubscribe,
        scope: scope,
        log: args.logs
    });
    
    _hub = this.hub;
    
    _metadataCache = {};
    
    // Find location of OpenAjax Hub files, so that we can generate 'tunnel.html'
    // location.
    _tunnelURI = null;
    _loaderRoot = null;
    var scripts = document.getElementsByTagName("script");
    // match "OpenAjax-mashup.js", "OpenAjaxManagedHub-std.js", "OpenAjaxManagedHub-core.js", or "OpenAjaxManagedHub-all.js"
    var reHub = /openajax(?:ManagedHub-.+|-mashup)\.js$/i;
    var reLoader = /loader\.js$/i;
    for ( var i = 0; (_tunnelURI === null || _loaderRoot === null) && i < scripts.length; i++ ) {
        var src = scripts[i].src;
        if ( src ) {
            var m;
            if ( _tunnelURI === null ) {
                if ( reHub.test( src ) ) {
                    // make URL absolute
                    src = /^\w+:/.test( src ) ? src : scripts[i].getAttribute('src', -1);
                    _hubBaseJS = src;
                    m = src.match( reHub );
                    var hubRoot = src.substring( 0, m.index );
                    if ( /openajax-mashup\.js/i.test( m[0] ) ) {
                        _tunnelURI = hubRoot + "containers/iframe/tunnel.html"; 
                    } else {
                        _tunnelURI = hubRoot + "tunnel.html";
                    }
                }
            }
            
            if ( _loaderRoot === null ) {
                if ( reLoader.test( src ) ) {
                    // make URL absolute
                    src = /^\w+:/.test( src ) ? src : scripts[i].getAttribute('src', -1);
                    m = src.match( reLoader );
                    _loaderRoot = src.substring( 0, m.index );
                }
            }
        }
    }
    
    // parse oaaLoaderConfig object
    if ( typeof oaaLoaderConfig !== "undefined" ) {
        // Save proxy URL, if specified
        if ( oaaLoaderConfig.proxy ) {
            _proxyURL = oaaLoaderConfig.proxy;
            if ( _proxyURL.charAt(0) !== "/" && ! /^\w+:/.test( _proxyURL ) ) {
                // make absolute
                _proxyURL = window.location.protocol + "//" + window.location.host +
                        /^(\/(.*\/)*)/.exec( window.location.pathname )[1] + _proxyURL;
            }
        }
    }
    
    _metadata_plurals = {
        authors: "author",
        categories: "category",
        configs: "config",
        contents: "content",
        enums: "enum",
        examples: "example",
        icons: "icon",
        javascripts: "javascript",
        libraries: "library",
        options: "option",
        properties: "property",
        references: "reference",
        requires: "require",
        topics: "topic"
    };
};

/**
 * Load and parse a widget specification. 
 *
 * @param {Object} args
 *     Parameters used to load widget metadata.  This object may contain the
 *     following properties:
 * @param {String} args.url
 *     The URL of the widget specification.
 * @param {String} [args.locale]
 *     The locale to be used when doing localization substitutions.  If not
 *     specified, defaults to the browser locale.
 * @param {Object} [args.properties]
 *     Initial widget properties.  This is an object of name-value pairs, where
 *     the name matches a property name as defined in the widget metadata.  This
 *     object is used when doing property value substitutions.  If this
 *     parameter is null, or if a given property name is not specified, then
 *     the substitution code will use the property's default value.
 * @param {Function} args.onComplete
 *     Callback which is invoked if loading the URL was successful,
 *     onSuccess(metadata).
 * @param {Function} args.onError
 *     Callback which is invoked if an error occurs, onError(error).
 * 
 * @returns {Object}
 *     An object whose properties represent the widget elements.
 */
OpenAjax.widget.Loader.prototype.loadMetadata = function( args )
{
    // XXX TODO properly handle plural elements
    
    // make sure the URL is absolute
    // XXX need a better method of doing this
    var a = document.createElement('a');
    a.href = args.url;
    var url = a.href;
    
    var cache = _metadataCache;
    var locale = null;
    
    // Return the attributes of the given DOM element as an object of
    // name-value pairs.
    var _getAttrs = function(elem) {
        var map = {}, domAttrs = elem.attributes;
        for(var i = 0; i < domAttrs.length; i++) {
            map[domAttrs[i].name] = domAttrs[i].value;
        }
        return map;
    };
    
    // Return the text content of the given DOM element.
    var _innerText = function( node ) {
        var text = node.innerText || node.textContent;
        if ( typeof text === "undefined" ) {
            text = "";
            var children = node.childNodes;
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    var n = children.item(i);
                    if (n.nodeType == 3 || n.nodeType == 4) {  // text or CDATA
                        text += n.nodeValue;
                    }
                }
            }
        }
        return text;
    };
    
    // Compute the appropriate text content of the give DOM element, doing
    // any necessary substitutions. 
    var _getContentText = function( node, item ) {
        function escapequotes( text ) {
            return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
        }
        
        function entityencode( text ) {
            return text.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
			        .replace(/>/gm, "&gt;").replace(/"/gm, "&quot;")
					.replace(/'/gm, "&#39;");
        }
        
        var text = null;
        if ( item.locid && locale ) {
            text = locale.getMsg( item.locid );
        }
        if ( ! text ) {
            text = _innerText( node );
        }
        
        if ( text ) {
            item._content_ = text.replace( /##(\w+)(?:\((\w+)\))?##/g,
                    function( str, p1, p2 ) {
                        var key = p2 || p1;
                        var newText = locale.getMsg( key );
                        if ( newText ) {
                            if ( p2 ) {
                                switch ( p1 ) {
                                    case "escapequotes":
                                        newText = escapequotes( newText );
                                        break;
                                    case "entityencode":
                                        newText = entityencode( newText );
                                        break;
                                }
                            }
                            return newText;
                        }
                        return str;
                    }
            ).replace( /__BIDI_\w+__/g,
                    function( str ) {
                        switch ( str ) {
                            case "__BIDI_START_EDGE__":
                                if ( locale.language_direction === "ltr" ) {
                                    return "left";
                                }
                                return "right";
                            case "__BIDI_END_EDGE__":
                                if ( locale.language_direction === "ltr" ) {
                                    return "right";
                                }
                                return "left";
                            case "__BIDI_DIR__":
                                return locale.language_direction;
                            case "__BIDI_REVERSE_DIR__":
                                if ( locale.language_direction === "ltr" ) {
                                    return "rtl";
                                }
                                return "ltr";
                        }
                        return str;
                    }
            );
        }
    };
    
    // Find which of the widget's message bundles to use for widget
    // localization.  Generates the "locale" object.
    var _getLocale = function( metadata, onComplete ) {
        // find the client's locale
        var userLocale = (args.locale ? args.locale :
                (navigator.language ? navigator.language : navigator.userLanguage)).toLowerCase();
        
        // find the closest widget locale match to the client's locale
        var localeNode = null;
        do {
            if ( metadata.locale[ userLocale ] ) {
                localeNode = metadata.locale[ userLocale ];
                break;
            }
            
            var idx = userLocale.lastIndexOf( "-" );
            if ( idx === -1 ) {
                break;
            }
            userLocale = userLocale.slice( 0, idx );
        } while(1);
        
        // no appropriate message bundle was found for the user's locale -- try
        // the fallback message bundle
        if ( ! localeNode ) {
            if ( metadata.locale.ALL ) {
                localeNode = metadata.locale.ALL;
            } else {
                // no appropriate message bundle found; don't create 'locale' object
                onComplete();
                return;
            }
        }
        
        // retrieve the message bundle file contents
        var u = _getProxyUrl( _resolveURI( localeNode.messages, metadata._src_ ) );
        OpenAjax.widget._xhrGet( u, true,
                /* onComplete */
                function( dom ) {
                    var messages = {};
                    var bundle = dom.getElementsByTagName( "messagebundle" ).item(0);
                    var msg = bundle.getElementsByTagName( "msg" );
                    for ( var j = 0; j < msg.length; j++ ) {
                        var name = msg[j].getAttribute( "name" );
                        var text = _innerText( msg[j] );
                        messages[ name ] = text;
                    }
                    
                    // create locale object, in context of loadMetadata()
                    locale = {
                        lang: localeNode.lang,
                        language_direction: localeNode.language_direction ? localeNode.language_direction : "ltr",
                        _messages: messages,
                        getMsg: function( name ) {
                            return this._messages[ name ];
                        }
                    };
                    onComplete();
                },
                /* onError */
                function( error ) {
                    args.onError( "Failed to retrieve message bundle file -- " +
                            "url: " + u + "  error: " + error );
                }
        );
    };
    
    // Parse the given DOM element's children and add data to the "parentObj"
    // object. 
    var _parseElement = function( element, parentObj, grandparentObj ) {
        if ( element.childNodes.length === 0 ) {
            return true; // return true in order to circumvent _innerText() call
        }
        
        var elemName = element.tagName.toLowerCase();
        var hasNonTextContent = false;
        
        for ( var i = 0; i < element.childNodes.length; i++ ) {
            var node = element.childNodes.item( i );
            
            // for text nodes, "node.tagName" is undefined
            if ( ! node.tagName ) {
                continue;
            }
            var tagName = node.tagName.toLowerCase();
            
            if ( tagName in _metadata_plurals ) {
                // Ignore plural elements, but loop over their child nodes.
                _parseElement( node, parentObj, parentObj );
            } else {
                // If the parent of this element is a plural element, then we
                // only want to deal with the singular version of that parent,
                // and ignore all other elements.  For example, for the parent
                // <properties>, we only want to handle any child <property>
                // elements, while ignoring others such as <description>.
                // The only exception is the <library> element, which can be a
                // child of <requires>.
                if ( (elemName in _metadata_plurals) &&
                        tagName !== _metadata_plurals[ elemName ] &&
                        tagName !== "library" )
                {
                    continue;
                }
                
                // <locale> and <property> have already been handled
                if ( tagName === "locale" || tagName === "property" ) {
                    continue;
                }
                
                hasNonTextContent = true;

                // get the attributes for this element
                var item = _getAttrs( node );
                
                // handle any special cases
                var attrs,
                    obj = parentObj;
                switch ( tagName ) {
                    case "option":
                        // If <option> is a child of <options>, save the
                        // 'multiple' and 'unconstrained' attributes if they
                        // exist on the parent.
                        if ( elemName === "options" ) {
                            attrs = _getAttrs( node.parentNode );
                            if ( attrs.multiple ) {
                                item._multiple_ = attrs.multiple;
                            }
                            if ( attrs.unconstrained ) {
                                item._unconstrained_ = attrs.unconstrained;
                            }
                        }
                        break;
                    case "require":
                        // If a <require> element is a child of a <library>
                        // element, then we save the name of the library to
                        // which that require belongs.
                        if ( elemName === "library" ) {
                            obj = grandparentObj;
                            item._library_ = _getAttrs( node.parentNode ).name;
                        }
                        break;
                }
                
                // Add this element info to the object.  If this element has a
                // 'name' attribute, then we index using that.
                var name = item.name;
                if ( name ) {
                    if ( ! obj[ tagName ] ) {
                        obj[ tagName ] = {};
                    }
                    delete item.name;
                    obj[ tagName ][ name ] = item;
                } else {
                    if ( ! obj[ tagName ] ) {
                        obj[ tagName ] = [];
                    }
                    obj[ tagName ].push( item );
                }
                
                // See if this element has any child nodes that need to be
                // handled.  If not, then see if it has any text content.
                if ( ! _parseElement( node, item, parentObj ) ) {
                    _getContentText( node, item );
                }
            }
        }
        
        return hasNonTextContent;
    };
    
    // Convert the widget's DOM into a JavaScript object.
    var _transformXML = function( dom ) {
        var widget = dom.getElementsByTagName('widget').item(0);
        var metadata = _getAttrs(widget);
        
        // save location of widget metadata file
        metadata._src_ = url;
        
        // In order to handle substitutions, we need to first parse the 'locale'
        // and 'property' elements.
        var locales = widget.getElementsByTagName( "locale" );
        if ( locales.length > 0 ) {
            metadata.locale = {};
            for ( var i = 0; i < locales.length; i++ ) {
                var item = _getAttrs( locales[i] );
                var lang = item.lang ? item.lang.toLowerCase() : null;
                
                if ( ! lang ) {
                    // If <locale> has no "lang" attribute, then this is the
                    // fallback message bundle.  We only allow one, so just
                    // take the first one.
                    if ( ! metadata.locale.ALL ) {
                        metadata.locale.ALL = item;
                    }
                } else {
                    delete item.lang;
                    metadata.locale[ lang ] = item;
                }
            }
            
            // given these locale elements, find the user's locale
            _getLocale( metadata, finish );
        } else {
            finish();
        }
        
        function finish() {
            // Now that we've handled <locale>, we move on to <property>
            var properties = widget.getElementsByTagName( "property" );
            if ( properties.length > 0 ) {
                metadata.property = {};
                
                for ( var i = 0; i < properties.length; i++ ) {
                    var item = _getAttrs( properties[i] );
                    var name = item.name;
                    delete item.name;
                    
                    metadata.property[ name ] = item;

                    // If <property> is a child of <properties>, save the
                    // 'name' and 'managed' attributes if they exist on
                    // the parent.
                    if ( properties[i].parentNode.tagName.toLowerCase() === "properties" ) {
                        attrs = _getAttrs( properties[i].parentNode );
                        if ( attrs.name ) {
                            item._group_ = attrs.name;
                        }
                        if ( attrs.managed ) {
                            item._managed_ = attrs.managed;
                        }
                    }
                    
                    // see if it has any child elements
                    _parseElement( properties[i], item, null );
                }
            }
            
            // parse the rest of the widget DOM
            _parseElement( widget, metadata, metadata );
            
            if ( cache ) {
                cache[url] = metadata;
            }
            args.onComplete( metadata );
        }
    };

    if (cache && cache[url]) {
        args.onComplete(cache[url]);
    } else {
        // If a proxy has been defined, then we use it in order to get widget
        // definitions that live on other domains.
        var u = _getProxyUrl( url );
        OpenAjax.widget._xhrGet( u, true, _transformXML, args.onError);
    }
};


/**
 * Creates an instance of a widget and adds it to the page, loading resources as
 * needed.
 *
 * @param {Object} args
 *     Parameters used to create a widget.  This object may contain the
 *     following properties:
 * @param {Object | String} args.spec
 *     A widget spec object (as returned by
 *     {@link OpenAjax.widget.Loader#loadMetadata}) or a URL pointing to the
 *     widget specification.
 * @param {HTMLElement | String} args.target
 *     HTML DOM element or ID of element in which this widget is rendered.
 * @param {String} [args.id]
 *     A string identifier for this widget.  If null, one is generated.
 * @param {String} [args.mode]
 *     Initial mode of rendered widget.  If not specified, defaults to "view".
 * @param {String} [args.locale]
 *     The locale to be used when doing localization substitutions.  If not
 *     specified, defaults to the browser locale.
 * @param {Object} [args.properties]
 *     Initial widget properties.  This is an object of name-value pairs, where
 *     the name matches a property name as defined in the widget metadata.
 * @param {Object} [args.availableDimensions]
 *     The maximum size to which a widget can be sized inside of this mashup
 *     framework.  This object has "width" and "height" properties.  If either
 *     is omitted, then that dimension is considered unconstrained.
 * @param {Function} [args.adjustDimensions]
 *     A callback which gets invoked whenever a widget requests a resize.  This
 *     function takes two parameters: a widget ID and a dimensions object, with
 *     "width" and "height" properties.  If the callback returns null, the
 *     resize request is ignored.  Otherwise, the callback should return a
 *     dimensions object with dimensions less than or equal to those passed in,
 *     in order to size the widget to those dimensions.
 * @param {Boolean} [args.sandbox]
 *     If true, will load the widget as sandboxed (in an iframe), regardless
 *     of what the "sandbox" attribute is set to in the widget spec.  If false
 *     or unspecified, then we honor the "sandbox" attribute as specified in
 *     the widget spec.
 * @param {Function} args.onComplete
 *     Callback which is invoked if loading the URL was successful,
 *     onSuccess(metadata).
 * @param {Function} args.onError
 *     Callback which is invoked if an error occurs, onError(error).
 * 
 * @returns {Object}
 *     Widget instance object.
 */
OpenAjax.widget.Loader.prototype.create = function(args)
{
    var spec = args.spec;

    if(typeof spec == "string") {
        var that = this;
        return this.loadMetadata({
                url: spec,
                locale: args.locale,
                properties: args.properties,
                onComplete: function(metadata) {
                    args.spec = metadata;
                    that.create(args);
                },
                onError: onError
        });
    }

    var target = args.target,
        view = args.view,
        properties = args.properties || {},
        availDimensions = {},
        onComplete = args.onComplete,
        onError = args.onError || function(e) { console.error(e); };
    
    if ( typeof target == "string" ) {
        target = document.getElementById( target );
    }

    // XXX widget ID should be randomized
    var wid = args.id;
    if ( ! wid ) {
        while ((wid = "OAA" + ++_uniqueId) && document.getElementById(wid));
    }
    
    if ( args.availableDimensions ) {
        if ( args.availableDimensions.width ) {
            availDimensions.width = args.availableDimensions.width;
        }
        if ( args.availableDimensions.height ) {
            availDimensions.height = args.availableDimensions.height;
        }
    }
    
    var oaa;
    if ( spec.sandbox || args.sandbox ) {
        oaa = new ProxyWidget();
    } else {
        oaa = new BaseWidget();
    }
    oaa._init({
        spec: spec,
        id: wid,
        props: properties,
        root: target,
        availDimensions: availDimensions,
        adjustDimensions: args.adjustDimensions
    });
    
    oaa._render( target, view, onComplete );

    // XXX How does the mashup developer get access to the widget object (or even
    //     the widget ID)?  create() doesn't return anything.  But there is the
    //     byId() method.  So either have create() return the generated widget ID,
    //     so that the dev can get the widget object by calling byId(), or have
    //     create() return the widget object itself.
    return oaa._widget;
};

/**
 * Updates the available dimensions for the given widget.
 * 
 * @param {Object | String} widget
 *     Widget instance object or ID.
 * @param {Object} availDimensions
 *     The new available dimensions.  The object may have properties of "width"
 *     and "height".  If either property is undefined, then that dimensions is
 *     considered to be unconstrained.
 */
OpenAjax.widget.Loader.prototype.setAvailableDimensions = function( widget, availDimensions )
{
    if ( typeof widget == "String" ) {
        widget = OpenAjax.widget.byId( widget );
    }
    widget.OpenAjax._setAvailableDimensions( availDimensions );
};

/**
 * Returns a widget instance for the given ID.
 * 
 * @param {Object} id
 *     Requested widget ID.
 */
OpenAjax.widget.byId = function( id )
{
    return _widgetTable[id];
};



    //*************** private functions and variables ***************//


// ManagedHub instance
var _hub;
// optional cache object.  hide in closure? expose  remove?
var _metadataCache;
// shared counter to be used for __WID__ substitution
var _uniqueId = 0;
// lookup table for widgets
var _widgetTable = {};
// hash to keep track of loaded requires
//var _requiresCache = {};
// absolute URL of main OpenAjax Hub JS file
var _hubBaseJS;
// absolute URL of OpenAjax Hub tunnel.html
var _tunnelURI;
// base URL for this JS file
var _loaderRoot;
// arrays of element names; used by loadMetadata() to parse widget XML file
var _metadata_plurals;

// URL of proxy, if specified
var _proxyURL = null;

/**
 * Returns the proxied version of the given URL.  If a proxy was never
 * specified, or if the given URL is in the same origin, then the URL is
 * returned unchanged.
 *  
 * @param {String} url
 * @returns {String}
 *     Proxied version of URL
 */
function _getProxyUrl( url ) {
    if ( _proxyURL ) {
        if ( url.match( /^(\w+:\/\/[^\/?#]+).*/ )[1] ===
                (window.location.protocol + "//" + window.location.host) ) {
            // no need to use proxy if 'url' is in same origin
            return url;
        }
        return _proxyURL + "?oawu=" + encodeURIComponent( url );
    }
    return url;
}

/**
 * Returns an absolute URI version of the passed-in uri.  URI is resolved
 * against the widget metadata location.
 * 
 * @param {Object} uri
 *     URI to resolve
 * @param {Object} specURI
 *     URI of widget metadata file
 */
function _resolveURI( uri, specURI )
{
    // if absolute URI, return
    // XXX save off RegExp object, rather than creating anew every time?
    if ( /^\w+:\/\/.+/.exec( uri ) !== null ) {
        return uri;
    }
    
    if ( uri.charAt(0) !== "/" ) {
        return specURI.slice( 0, specURI.lastIndexOf("/") + 1 ) + uri;
    }
    
    return (/^(\w+:\/\/[^\/]+).*/.exec( specURI ))[1] + uri;
}

var _head = document.getElementsByTagName('HEAD').item(0);
if (!_head) {
    _head = document.createElement('HEAD');
    document.body.insertBefore(_head, document.body.childNodes.item(0));
}


////////////////////////////////////////////////////////////////////////////
//    BaseWidget
////////////////////////////////////////////////////////////////////////////

var BaseWidget = function() {};

BaseWidget.prototype = 
{
    //*** OpenAjax Metadata Widget APIs ***//
   
    getId: function() {
        return this._id;
    },
    
    getAvailableDimensions: function() {
        return this._availableDimensions;
    },
    
    getDimensions: function() {
        return {
            width: parseInt( this._rootElement.style.width, 10 ),
            height: parseInt( this._rootElement.style.height, 10 )
        };
    },
    
    adjustDimensions: function( dimensions ) {
        // ask the app if this widget is allowed to resize to the
        // requested dimensions
        if ( this._adjustDimensionsCB ) {
            // XXX scope for callback?
            dimensions = this._adjustDimensionsCB( this._widget, dimensions );
        }
        if ( dimensions ) {
            this._rootElement.style.width = dimensions.width + "px";
            this._rootElement.style.height = dimensions.height + "px";
            return dimensions;
        }
        return null;
    },
    
    getMode: function() {
        // XXX TODO
        alert( "BaseWidget.getMode not implemented" );
    },
    
    requestMode: function( mode ) {
        // XXX TODO
        alert( "BaseWidget.requestMode not implemented" );
    },
    
    getPropertyValue: function(name) {
        return this._properties[name] || this._spec.property[name].defaultValue;
    },
    
    setPropertyValue: function( name, value )
    {
        if ( this._setPropertyValue( name, value, true, true ) ) {
            var prop = this._spec.property[ name ];
            if ( prop.sharedAs ) {
                this._hubClient.publish( prop.sharedAs,
                        this._encodePropValue( name, value ) );
            }
        }
    },
    
    getPropertyNames: function() {
        var names = [];
        for (var name in this._spec.property) {
            names.push(name);
        }
        return names;
    },
    
    getMsg: function( key )
    {
        // XXX TODO
        alert( "BaseWidget.getMsg not implemented" );
    },
    
    rewriteURI: function( url )
    {
        return _getProxyUrl( _resolveURI( url, this._spec._src_ ) );
    },
    
// XXX old code
//      getSupportedViews: function() {
//          var views = {};
//          for (var i=0; i < this.spec.contents; i++) {
//              var list = (this.spec.contents[i].view || "default").split(",");
//              for (var j=0; j < list.length; j++) {
//                  //TODO: this method is supposed to construct a hash of View objects. What are View objects? 
//                  views[list[j] = undefined];
//              }
//          }
//          return views;
//      },
//      requestNavigateTo: function() {
//          //TODO
//      },
    
    //*** private functions ***//
   
    _init: function ( args )
    {
        this._id = args.id;
        this._spec = args.spec;
        this._properties = args.props || {};
        this._rootElement = args.root;
        this._availableDimensions = args.availDimensions;
        this._adjustDimensionsCB = args.adjustDimensions;
        
        this._connectToHub();
        this._createHubSubObject();
        this._handlePropSubscriptions();
        
        // XXX should we directly set size on rootElement, or create a DIV
        //   inside and change its dimensions?
        this._rootElement.style.width = this._spec.width + "px";
        this._rootElement.style.height = this._spec.height + "px";
    },
    
    _connectToHub: function()
    {
        // XXX add error checks
        this._container = new OpenAjax.hub.InlineContainer( _hub, this._id,
                {   Container: {
                        onSecurityAlert: function( source, alertType ) {
                            console.log( "onSecurityAlert: s=" + source.getClientID() + " a=" + alertType );
                        },
                        scope: this,
                        log: function( msg ) { console.log( msg ); }
                    }
                }
        );
        
        this._hubClient = new OpenAjax.hub.InlineHubClient({
                HubClient: {
                    onSecurityAlert: function( source, alertType ) {
                        console.log( "onSecurityAlert: s=" + source.getClientID() + " a=" + alertType );
                    },
                    scope: this,
                    log: function(msg) { console.log( msg ); }
                },
                InlineHubClient: {
                    container: this._container
                }
        });
        this._hubClient.connect();
    },
    
    _createHubSubObject: function()
    {
        var that = this;
        this.hub = new function() {
            this.subscribe = function() {
                that._hubClient.subscribe.apply( that._hubClient, arguments );
            };
            
            this.publish = function() {
                that._hubClient.publish.apply( that._hubClient, arguments );
            };
            
            this.unsubscribe = function() {
                that._hubClient.unsubscribe.apply( that._hubClient, arguments );
            };
            
            this.isConnected = function() {
                that._hubClient.isConnected.apply( that._hubClient, arguments );
            };
            
            this.getScope = function() {
                that._hubClient.getScope.apply( that._hubClient, arguments );
            };
            
            this.getSubscriberData = function() {
                that._hubClient.getSubscriberData.apply( that._hubClient, arguments );
            };
            
            this.getSubscriberScope = function() {
                that._hubClient.getSubscriberScope.apply( that._hubClient, arguments );
            };
            
            // do no expose this function
            this.getParameters = function() {};
        };
    },
    
    _handlePropSubscriptions: function()
    {
        var that = this;
        function createSubscription( name, prop ) {
            return that._hubClient.subscribe( prop.sharedAs,
                    function( topic, data ) {
                        that._setPropertyValue( name, data, true, false );
                    },
                    that
            );
        }
        
        this._subscriptions = [];
        for ( var name in this._spec.property ) {
            var prop = this._spec.property[ name ];
            if ( prop.sharedAs ) {
                var sid = createSubscription( name, prop );
                this._subscriptions.push( sid );
            }
        }
    },
    
    _setPropertyValue: function( name, newValue, notify, self )
    {
        var oldValue = this.getPropertyValue( name );
        newValue = this._decodePropValue( name, newValue );
        
        if ( this._equals( name, oldValue, newValue )) {
            return false;
        }
        
        this._properties[ name ] = newValue;

        // call onChange* functions
        if ( notify ) {
            var event = {
                property: name,
                oldValue: oldValue,
                newValue: newValue,
                self: self
            };
            if ( this._widget.onChange ) {
                this._widget.onChange.call( this._widget, event );
            }
            var cb = "onChange" + name.charAt(0).toUpperCase() + name.substring(1);
            if ( this._widget[ cb ] ) {
                this._widget[ cb ].call( this._widget, event );
            }
        }
        
        return true;
    },
    
    _equals: function( propName, value1, value2 )
    {
        var prop = this._spec.property[ propName ];
        switch( prop.datatype ) {
            case "Date":
                return value1.valueOf() == value2.valueOf();
            default:
                return value1 == value2;
        }
    },
    
    _encodePropValue: function( name, value )
    {
        var prop = this._spec.property[ name ];
        switch ( prop.datatype ) {
            // XXX for type 'Date', we transmit the value as milliseconds
            case "Date":
                if ( typeof value === "object" ) {
                    value = value.getTime();
                }
                break;
        }
        return value;
    },
    
    _decodePropValue: function( name, value )
    {
        var prop = this._spec.property[ name ];
        switch ( prop.datatype ) {
            case "Date":
                if ( typeof value !== "object" ) {
                    if ( value === "" ) {
                        // XXX assume empty string for type 'Date' signifies "now"
                        value = new Date();
                    } else {
                        value = new Date( value );
                    }
                }
                break;
        }
        return value;
    },

    _render: function( target, view, onComplete )
    {
        var that = this;
        
        this._widgetContext = new function() {
            // Keep track of the widget's content.  The scripts are separated
            // from each other, depending on when they should run.
            this.body = {
                jsBefore: [],
                content: null,
                jsContent: [],
                jsAfter: [],
                jsEnd: []
            };
            this.loadedCallbacks = 0;
            this.runDeferredScripts = function() {
                if (--this.loadedCallbacks) {
                    return;
                }

                var _getObject = function(clazz, context) {
                    var obj = context || window,
                        path = clazz.split(".");
                    for (var i=0; i < path.length; i++) {
                        obj = obj[path[i]];
                    }
                    return obj;
                };

                // create widget instance
                var widget;
                if ( that._spec.jsClass ) {
                    widget = new (_getObject( that._spec.jsClass ))();
                } else {
                    widget = {};
                }
                widget.OpenAjax = that;
                that._widget = widget;
                // XXX How do we handle _widgetTable in the sandbox case?  Should it only be used
                //     on the app side?  Or is it also necessary inside an iframe?  Where does
                //     the developer get the widget ID from?
                _widgetTable[ that._id ] = widget;
                
                // evaluate widget content -- render content and run scripts
                // in order
                var s = [ "jsBefore", "jsContent", "jsAfter", "jsEnd" ];
                for ( i = 0; i < s.length; i++ ) {
                    if ( s[i] == "jsContent" ) {
                        // add content to page, before running the scripts we
                        // had previously extracted from the content
                        target.innerHTML = this.body.content;
                    }

                    var scripts = this.body[ s[i] ];
                    this.body[ s[i] ] = [];

                    for ( var j = 0; j < scripts.length; j++ ) {
                        OpenAjax.widget._runScript( scripts[j]/*, onError*/ );    // XXX handle error
                    }
                }
                
                // let the widget code know that the widget has been fully
                // loaded
                if ( widget.onLoad ) {
                    widget.onLoad( {} );
                }

                if ( onComplete ) {
                    onComplete( widget );
                }
            };
        };

        this._widgetContext.loadedCallbacks++;
        
        if ( this._spec.require ) {
            this._loadAndEvalRequires();
        }
        
        this._loadContent( target, view );

        this._widgetContext.runDeferredScripts();
    },
    
    _loadAndEvalRequires: function()
    {
        var scripts = [];
        var prepost = {};
        
        for (var i = 0; i < this._spec.require.length; i++) {
            var req = this._spec.require[i];

//            // check for duplicates
//            // XXX This is for use by inline widgets, where multiple widgets
//            //    exist on the same page and may have similar requires. The
//            //    problem with this approach is that the first instance of a
//            //    given library of file is used.  Rather, we should probably
//            //    use the one with the greatest version.
//            var requireInfo;
//            if (req.src in _requiresCache && (requireInfo = _requiresCache[req.src]).library == req.library) {
//                if (requireInfo.inFlight) {
//                    this._widgetContext.loadedCallbacks++;
//                    requireInfo.callbacks.push(function(uri){
//                        that._widgetContext.runDeferredScripts();
//                    });
//                }
//
//                // already loaded on page
//                continue;
//            }
//
//            _requiresCache[req.src] = {
//                library: req.library
//            };
//
//            var library = req.library && this._spec.libraries[req.library];
//
//            if (library && library.preload) {
//                this._runScript(library.preload);
//            }
//
//            this._insertResource(document, req, library ? library.src : "");
//
//            if (library && library.postload) {
//                this._runScript(library.postload);
//            }
            
            var library = req._library_ && this._spec.library[ req._library_ ];
            if ( library && library.preload && ! (req._library_ in prepost) ) {
                scripts.push( { text: library.preload[0]._content_ } );
            }
            
            var prefix = library ? library.src : "";
            // relative URLs are assumed to be relative to widget XML file
            var uri = req.src ? _resolveURI( prefix + req.src, this._spec._src_ ) : null;
            switch ( req.type ) {
                case "javascript":
                    scripts.push( uri ?
                            { src: uri } :
                            { text: req._content_ }
                    );
                    break;
                case "css":
                    // XXX Directly loading the CSS require could result in it
                    //    being loaded out of order as compared to the JS
                    //    requires as defined in the widget XML.
                    this._loadCSS( req._content_, uri );
                    break;
                default:
                    // XXX TODO
            }
            
            if ( library && library.postload && ! (req._library_ in prepost) ) {
                scripts.push( { text: library.postload[0]._content_ } );
            }
            
            // keep track that we have already handled preload/postload for library
            if ( library ) {
                prepost[ req._library_ ] = true;
            }
        }
        
        this._widgetContext.loadedCallbacks++;
        var that = this;
        OpenAjax.widget._loadScripts( scripts, true,
                function( scripts, success, error ) { // onComplete
                    if ( success ) {
                        that._widgetContext.runDeferredScripts();
                        return;
                    }
                    // XXX handle error
console.error( error );
                }
        );
    },
    
    // load widget content (<content> & <javascript>)
    _loadContent: function( target, mode )
    {
        var that = this;
        var content;
        for (var i = 0; i < this._spec.content.length; i++) {
            var c = this._spec.content[i],
                list = ","+(c.mode||"view")+",";

            if (list.indexOf(","+(mode||"view")+",") != -1) {
                content = c;
                break;
            }
            if (!content && list.indexOf(",view,") != -1) {
                content = c;
            }
        }
        if ( ! content ) {
            // XXX handle error
            return;
        }

        var _propReplace = function(match, transform, name)
        {
			name = name || transform; // if no transform, name will be in the first position
			if (transform) {
				switch (transform) {
					case "escapequotes":
						name = name.replace(/'/g, "\\'").replace(/"/g, '\\"');
						break;
					case "entityencode":
						name = name.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
							.replace(/>/gm, "&gt;").replace(/"/gm, "&quot;")
							.replace(/'/gm, "&#39;");
//									break;
//								default:
						//TODO: error handling?
				}
			}

            return that._properties[name] || that._spec.property[name].defaultValue;
        };

        if ( content.src ) {
            // relative URLs are assumed to be relative to widget XML file
            var uri = _resolveURI( content.src, this._spec._src_ );
            this._widgetContext.loadedCallbacks++;
            OpenAjax.widget._xhrGet( uri, false,
                function(text){
                    text = text.replace(/__WID__/g, that._id).replace(/@@(\w+)(?:\((\w+)\))?@@/g, _propReplace);
                    that._widgetContext.body.content = that._extractScripts(text);
                    that._widgetContext.runDeferredScripts();
                },
                function(err){
                    target.innerHTML = "<b>An error occurred</b>"; // XXX TODO
                    console.error(err);
                    return;
                }
            );
        } else {
            var text = content._content_.replace(/__WID__/g, this._id).replace(/@@(\w+)(?:\((\w+)\))?@@/g, _propReplace);
            that._widgetContext.body.content = this._extractScripts(text);
        }

        if ( this._spec.javascript ) {
            this._widgetContext.loadedCallbacks++;
    
            var scripts = [];
            for ( i = 0; i < this._spec.javascript.length; i++ ) {
                scripts.push( this._spec.javascript[i] );
                var s = scripts[i];
                if ( s .src ) {
                    // relative URLs are assumed to be relative to widget XML file
                    s.src = _resolveURI( s.src, this._spec._src_ );
                } else {
                    s.text = s._content_;
                }
            }
            
            // load <javascript> elements, but don't evaluate yet
            OpenAjax.widget._loadScripts( scripts, false,
                    function( scripts, success, error ) {
                        if ( success ) {
                            var jsBefore = 0, jsAfter = 0, jsEnd = 0;
                            for ( var i = 0; i < scripts.length; i++ ) {
                                var text = scripts[i].text.replace(/__WID__/g, that._id).replace(/@@(\w+)(?:\((\w+)\))?@@/g, _propReplace);
                                switch ( scripts[i].location ) {
                                    case "beforeContent":
                                        that._widgetContext.body.jsBefore[ jsBefore++ ] = text;
                                        break;
                                    case "atEnd":
                                        that._widgetContext.body.jsEnd[ jsEnd++ ] = text;
                                        break;
                                    default:
                                    //case "afterContent":
                                        that._widgetContext.body.jsAfter[ jsAfter++ ] = text;
                                        break;
                                }
                            }
                            that._widgetContext.runDeferredScripts();
                            return;
                        }
                        // XXX handle error
console.error( error );
                    },
                    false // doEval
            );
        }
    },

    _loadCSS: function( data, uri )
    {
        if (uri) {
            var link = document.createElement('LINK');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', uri);
            _head.appendChild(link);
        } else {
            var style = document.createElement('STYLE');
            if (!window.attachEvent) { //XXX FIXME: odd test
                style.text = data;
            } else {
                document.styleSheets[document.styleSheets.length - 1].cssText = data;
            }
            _head.appendChild(style);
        }
    },

    _extractScripts: function( text )
    {
//XXX TODO: avoid SCRIPT in <!-- -->
// XXX See old version of createGadget() in minimashup.js, where we create a DOM
//     node (DIV), inject the HTML code and use DOM APIs to acquire and remove
//     the script elements.  This should get around the issue of accidentally
//     matching <script> in comments.
        var that = this;
        return text.replace(/<script\s*(?:[^>]*?(?:src=(['"]?)([^>]*?)\1[^>]*)?)*>([\s\S]*?)<\/script>/gi, function(ignore, delim, src, code){
            if (src) {
                OpenAjax.widget._xhrGet( src, false,
                    function(text){
                        that._widgetContext.body.jsContent.push( text );
                    },
                    function(err) {
                        console.error(err); // XXX TODO
                    }
                );
            } else {
                that._widgetContext.body.jsContent.push(code);
            }
            return "";
        });
    },
    
    _setAvailableDimensions: function( availDimensions )
    {
        if ( availDimensions.width ) {
            this._availableDimensions.width = availDimensions.width;
        } else {
            delete this._availableDimensions.width;
        }
        if ( availDimensions.height ) {
            this._availableDimensions.height = availDimensions.height;
        } else {
            delete this._availableDimensions.height;
        }
    },

    _unload: function( callback ) {
        if ( this._widget.onUnload ) {
            try {
                this._widget.onUnload( {} );
            } catch(e) {}
        }
        _hub.removeContainer( this._container );
        delete _widgetTable[ this._id ];
        callback( this._id );
    }
};

////////////////////////////////////////////////////////////////////////////
//    ProxyWidget
////////////////////////////////////////////////////////////////////////////

var ProxyWidget = function() {};

ProxyWidget.prototype = new BaseWidget();

  //*** OpenAjax Metadata Widget APIs ***//

ProxyWidget.prototype.adjustDimensions = function( dimensions )
{
    dimensions = BaseWidget.prototype.adjustDimensions.apply( this, arguments );
    if ( dimensions ) {
        _hub.publish( "openajax.widget." + this._id + "._sizeChanged", dimensions );
    }
};

ProxyWidget.prototype.setPropertyValue = function(name, value)
{
    if ( this._setPropertyValue( name, value, false, false ) ) {
        _hub.publish( "openajax.widget." + this._id + "._propValueChange.proxy",
                { p: name, v: this._encodePropValue( name, value ) } );
    }
};

  //*** private functions ***//

ProxyWidget.prototype._init = function( args )
{
    BaseWidget.prototype._init.apply( this, arguments );
    
    // create a dummy widget instance
    var widget = {
        OpenAjax: this
    };
    this._widget = widget;
    _widgetTable[ this._id ] = widget;
};

ProxyWidget.prototype._connectToHub = function()
{
    var widgetBaseURI = encodeURIComponent( this._spec._src_.slice( 0, this._spec._src_.lastIndexOf("/") + 1 ));
    //AP var stubURI = _loaderRoot + "widget.html?oawb=" + widgetBaseURI + "&oawh=" + encodeURIComponent( _hubBaseJS );
    var stubURI = "http://localhost/js/widget.html?oawb=" + widgetBaseURI + "&oawh=" + encodeURIComponent( _hubBaseJS );

    this._container = new OpenAjax.hub.IframeContainer( _hub, this._id,
            {   Container: {
                    onSecurityAlert: function( source, alertType ) {
                        console.log( "onSecurityAlert: s=" + source.getClientID() + " a=" + alertType );
                    },
                    scope: this,
                    log: function( msg ) { console.log( msg ); }
                },
                IframeContainer: {
                    uri: stubURI,
                    tunnelURI: _tunnelURI,
                    iframeAttrs: {
                            frameBorder: "0",
                            scrolling: "no",
                            style: { width: "100%", height: "100%" }
                        },
                    parent: this._rootElement
                }
            }
    );
    
    this._listenForEvents();
};

ProxyWidget.prototype._createHubSubObject = function() {};
ProxyWidget.prototype._handlePropSubscriptions = function() {};

ProxyWidget.prototype._listenForEvents = function()
{
    this._subs = [];
    var prefix = "openajax.widget." + this._id;
    
    var sid = _hub.subscribe( prefix + "._instantiated",
            function( topic, data ) {
                _hub.publish( prefix + "._init",
                        {   _spec: this._spec,
                            _properties: this._properties,
                            _sentinel: this._sentinel,
                            _subscriptions: this._subscriptions,
                            _availableDimensions: this._availableDimensions,
                            _proxy: _proxyURL
                        }
                );
                _hub.unsubscribe( sid );
            },
            this
    );
    
    this._subs.push( _hub.subscribe( prefix + ".api.*", this._apiCall, this ) );
    
    this._subs.push( _hub.subscribe( prefix + "._propValueChange.remote",
            function( topic, data ) {
                this._properties[ data.p ] = this._decodePropValue( data.p, data.v );
            },
            this
    ));
};

ProxyWidget.prototype._render = function( target, view, onComplete )
{
    // Call onComplete when the remote widget has finished loading
    if ( onComplete ) {
        var sid = _hub.subscribe(
                "openajax.widget." + this._id + "._loaded",
                function( topic, data ) {
                    onComplete( this._widget );
                    _hub.unsubscribe( sid );
                },
                this
        );
    }
};

ProxyWidget.prototype._apiCall = function( topic, data )
{
    var api = topic.slice( topic.lastIndexOf(".") + 1 );
    this[ api ].call( this, data );
};

ProxyWidget.prototype._setAvailableDimensions = function( availDimensions )
{
    BaseWidget.prototype._setAvailableDimensions.apply( this, arguments );
    _hub.publish( "openajax.widget." + this._id + "._availDimensions",
            this._availableDimensions );
};

ProxyWidget.prototype._unload = function( callback )
{
    var that = this;
    function finishUnload() {
        _hub.removeContainer( that._container );
        for ( var i = 0; i < that._subs.length; i++ ) {
            _hub.unsubscribe( that._subs[i] );
        }
        delete _widgetTable[ that._id ];
        callback( that._id );
    }
    
    var prefix = "openajax.widget." + this._id;
    
    // XXX set a timeout in case RemoteWidget never responds?
    this._subs.push( _hub.subscribe( prefix + "._unloaded",
            function( topic, data ) {    // onData
                // RemoteWidget finished unloading
                finishUnload();
            },
            this,
            function( item, success, errCode ) {    // onComplete
                if ( ! success ) {
                    // something went wrong -- log error and invoke callback
                    // XXX TODO log error
                    finishUnload();
                }
            }
    ));
    
    _hub.publish( prefix + "._unload", null );
};

////////////////////////////////////////////////////////////////////////////
//    RemoteWidget
////////////////////////////////////////////////////////////////////////////

var RemoteWidget = function( target )
{
    this._rootElement = target;
    this._proxyPropChange = false;
    
    this._hubClient = new OpenAjax.hub.IframeHubClient({
            HubClient: {
                onSecurityAlert: function( source, alertType ) {
                    console.log( "onSecurityAlert: s=" + source.getClientID() + " a=" + alertType );
                },
                scope: this,
                log: function(msg) { console.log( msg ); }
            }
    });
    
    this._id = this._hubClient.getClientID();
    
    this._hubClient.connect(
            function( item, success, errorCode ) {
                // XXX handle error
                // first, subscribe to "_init" msg from parent
                var topicPrefix = "openajax.widget." + this._id;
                this._initSub = this._hubClient.subscribe(
                        topicPrefix + "._init",
                        this._init,
                        this
                );
                
                // then, let parent know that we are ready
                this._hubClient.publish( topicPrefix + "._instantiated", null );
            },
            this
    );
};

RemoteWidget.prototype = new BaseWidget();

  //*** OpenAjax Metadata Widget APIs ***//
   
RemoteWidget.prototype.adjustDimensions = function( dimensions )
{
    this._hubClient.publish( "openajax.widget." + this._id + ".api.adjustDimensions", dimensions );
};

  //*** private functions ***//

RemoteWidget.prototype._init = function( topic, data )
{
    this._hubClient.unsubscribe( this._initSub );
    delete this._initSub;
    
    // mixin received object with 'this'
    for ( var prop in data ) {
        if ( ! (prop in this) ) {
            this[ prop ] = data[ prop ];
        }
    }
    
    _proxyURL = this._proxy;
    delete this._proxy;    // XXX handle this better
    
    this._createHubSubObject();
    this._handlePropSubscriptions();
    this._listenForEvents();
    
    // Add widget to page
    // _render() calls the widget objects "onLoad" method.
    var that = this;
    this._render( this._rootElement, /*view*/ null,
            function() { // onComplete
                that._hubClient.publish( "openajax.widget." + that._id + "._loaded", null );
            }
    );
    
    // set widget size
    this._rootElement.style.width = this._spec.width + "px";
    this._rootElement.style.height = this._spec.height + "px";
};

// already connected to hub in constructor - nothing to do here
RemoteWidget.prototype._connectToHub = function() {};

RemoteWidget.prototype._listenForEvents = function()
{
    var topicPrefix = "openajax.widget." + this._id;
    
    // widget has been resized
    this._hubClient.subscribe( topicPrefix + "._sizeChanged", this._sizeChanged, this);
    
    // update to the available (max) dimensions for this widget
    this._hubClient.subscribe( topicPrefix + "._availDimensions",
            function( topic, data ) {
                this._availableDimensions = data;
            },
            this
    );
    
    // ProxyWidget has updated property value
    this._hubClient.subscribe( topicPrefix + "._propValueChange.proxy",
            function( topic, data ) {
                this._proxyPropChange = true;
                this.setPropertyValue( data.p, this._decodePropValue( data.p, data.v ) );
                this._proxyPropChange = false;
            },
            this
    );
    
    this._hubClient.subscribe( topicPrefix + "._unload", this._unload, this );
};

RemoteWidget.prototype._setPropertyValue = function( name, value, notify, self )
{
    var changed = BaseWidget.prototype._setPropertyValue.apply( this, arguments );
    if ( changed && ! this._proxyPropChange ) {
        this._hubClient.publish( "openajax.widget." + this._id + "._propValueChange.remote",
                { p: name, v: this._encodePropValue( name, value ) }
        );
    }
    return changed;
};

RemoteWidget.prototype._sizeChanged = function( topic, data )
{
    // If the widget object has a 'sizeChanged' method, then we need to save
    // the current dimensions, before changing them.
    if ( this._widget.onSizeChanged ) {
        var oldDimensions = this.getDimensions();
    }
    
    // change dimensions based on data from parent
    BaseWidget.prototype.adjustDimensions.call( this, data );
    
    if ( this._widget.onSizeChanged ) {
        var newDimensions = this.getDimensions();
        this._widget.onSizeChanged.call(
                this._widget,
                {  oldWidth: oldDimensions.width,
                   oldHeight: oldDimensions.height,
                   newWidth:  newDimensions.width,
                   newHeight: newDimensions.height
                }
        );
    }
};

RemoteWidget.prototype._unload = function()
{
    if ( this._widget.onUnload ) {
        try {
            this._widget.onUnload( {} );
        } catch(e) {}
    }
    
    this._hubClient.publish( "openajax.widget." + this._id + "._unloaded",
            null );
};

OpenAjax.widget._createRemoteWidget = function( target )
{
    return new RemoteWidget( target );
};

})();


// remove object that may have been created previously (in case of widget.html)
if ( typeof window.__openajax_widget__ !== "undefined" ) {
    try {
        window.__openajax_widget__ = null;
        delete window.__openajax_widget__;
    } catch(e) {}
}

} // OpenAjax !== "undefined"


var oaw;
if ( typeof OpenAjax === "undefined" ) {
    oaw = window.__openajax_widget__ = {};
} else {
    oaw = OpenAjax.widget;
}

////////////////////////////////////////////////////////////////////////////
//    _xhrGet
////////////////////////////////////////////////////////////////////////////

/**
 * @memberOf OpenAjax.widget
 * 
 * @param {String} url
 * @param {Boolean} forceXml
 * @param {Function} onComplete
 * @param {Function} onError
 */
oaw._xhrGet = function(url, forceXml, onComplete, onError) {
    var activeX = "ActiveXObject" in window;

    //TODO: what happens to namespaces on various browsers?
    var toXml = function(xhr){
        var result = xhr.responseXML;
        if (activeX && (!result || !result.documentElement)){
            var dom = new ActiveXObject("Microsoft.XMLDOM");
            dom.async = false;
            dom.loadXML(xhr.responseText);
            result = dom;
        }

        if (result && result.documentElement.tagName == "parsererror") { // Annoying Mozilla behavior
            throw result.documentElement.firstChild.nodeValue;
        }
        if (!result) {
            throw "Parser error";
        }

        return result;
    };

    var xhr = ((typeof XMLHttpRequest == "undefined" || !location.href.indexOf("file:")) && activeX) ?
        new ActiveXObject("Msxml2.XMLHTTP") : new XMLHttpRequest();
    onError = onError || function(e) { console.error(e); };


    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (!xhr.status || xhr.status == 200) {
                try {
                    onComplete(forceXml ? toXml(xhr) : xhr.responseText);
                } catch(e) {
                    onError(e);
                }
            } else {
                onError(new Error("Unable to load " + url + " status:" + xhr.status));
            }
        }
    };
    if ( forceXml && xhr.overrideMimeType ) {
        xhr.overrideMimeType("text/xml");
    } 
    xhr.open("GET", url, true);
    try {
        xhr.send(null);
    } catch(e) {
        onError(e);
    }
};

////////////////////////////////////////////////////////////////////////////
//    _loadScripts
////////////////////////////////////////////////////////////////////////////

/**
 * Load all of the given scripts, making sure they are evaluated in order.
 * 
 * @memberOf OpenAjax.widget
 * 
 * @param {Object[]} scripts
 *     An array of scripts.  Each array element is an object which must have
 *     either a "text" property (the full script text) or a "src"
 *     property (URL of script).
 * @param {Boolean} [xdomain="false"]
 *     If true, signifies that the given scripts array may contain cross-domain
 *     URLs.  If false, it is assumed that all script URLs are within the
 *     current domain.
 * @param {Function} [onComplete]
 *     Callback function invoked on successful completion or error. The first
 *     parameter is the original 'scripts' array; each script now has a valid
 *     'text' property (when 'xdomain' is true, this may not be correct).
 *     Syntax is as follows:
 *     onComplete( //Object[]// scripts, //Boolean// success, //Error|String// error )  
 * @param {Boolean} [doEval="true"]
 *     By default, the scripts are evaluated after being loaded. Specify "false"
 *     to prevent evaluation.
 */
oaw._loadScripts = function( scripts, xdomain, onComplete, doEval )
{
    // For scripts that may be cross-domain, load them one-by-one  -- this
    // maintains the proper order.
    if ( xdomain ) {
        var head = document.getElementsByTagName('HEAD').item(0);
        function addScript( scripts, idx ) {
            if ( idx == scripts.length ) {
                if ( onComplete ) {
                    onComplete( scripts, true );
                }
                return;
            }
            
            var script = document.createElement( 'SCRIPT' );
            script.setAttribute( 'type', 'text/javascript' );
            if ( scripts[idx].text ) {
                script.text = scripts[idx].text;
                head.appendChild(script);
                addScript( scripts, idx + 1 );
            } else {
                script.setAttribute( 'src', scripts[idx].src );
                script.onload = script.onreadystatechange = function(e) {
                    if ((e && e.type == "load") || /complete|loaded/.test(script.readyState)) {
                        addScript( scripts, idx + 1 );
                    }
                };
                head.appendChild(script);
            }
        }
        
        addScript( scripts, 0 );
    }

    // If there are no cross-domain scripts, then use async XHR to load the
    // scripts, but make sure that they are evaluated in the proper order.
    else {
        doEval = (typeof doEval !== "undefined") ? doEval : true;
        
        var nextIdx = 0;
        function evalNextScript( idx ) {
            if ( idx === nextIdx ) {
                while ( nextIdx < scripts.length && scripts[ nextIdx ].text ) {
                    if ( doEval ) {
                        oaw._runScript( scripts[ nextIdx ].text,
                                function( errorMsg ) {
                                    onComplete( scripts, false, errorMsg );
                                }
                        );
                    }
                    nextIdx++;
                }

                if ( onComplete && nextIdx == scripts.length ) {
                    onComplete( scripts, true );
                }
            }
        }
        
        function getAndEval( idx ) {
            var s = scripts[idx];
            oaw._xhrGet( s.src, false,
                    function( text ) { // onComplete
                        s.text = text;
                        evalNextScript( idx );
                    },
                    function( err ) { // onError
                        if ( onComplete ) {
                            onComplete( scripts, false,
                                    "Failed to retrieve script, with error: " + err.toString() +
                                    "\nscript src = " + s.src );
                        }
                    }
            );
        }
        
        for ( var i = 0; i < scripts.length; i++ ) {
            var s = scripts[i];
            if ( s.text ) {
                evalNextScript( i );
            } else {
                getAndEval( i );
            }
        }
    }
};

////////////////////////////////////////////////////////////////////////////
//    _runScript
////////////////////////////////////////////////////////////////////////////

oaw._runScript = (function(){
    // Test window.eval first, since this is the standards compliant way of
    // running scripts.
    if ( window.eval ) {
        window.eval( "function __openajax_widget_fn__() {};" );
        if ( window.__openajax_widget_fn__ ) {
            delete window.__openajax_widget_fn__;
            return function( text ) {
                window.eval( text );
            };
        }
    }
    
    // fallbacks
    
    // Next, see if the browser provides the execScript function (IE).
    if ( window.execScript ) {
        return function( text ) {
            window.execScript( text );
        };
    }
    
    // Lastly, if all else fails, dynamically add script to HEAD
    // (i.e. Safari 3.2).
    var head = document.getElementsByTagName('HEAD').item(0);
    return function( text ) {
        var script = document.createElement( 'SCRIPT' );
        script.setAttribute( 'type', 'text/javascript' );
        script.text = text;
        head.appendChild( script );
    };
})();
