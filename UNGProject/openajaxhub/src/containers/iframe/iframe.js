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

if ( typeof OpenAjax === "undefined" ) {
    OpenAjax = { hub: {} };
}

/**
 * Create a new Iframe Container.
 * @constructor
 * @extends OpenAjax.hub.Container
 * 
 * IframeContainer implements the Container interface to provide a container
 * that isolates client components into secure sandboxes by leveraging the
 * isolation features provided by browser iframes.
 * 
 * @param {OpenAjax.hub.ManagedHub} hub
 *    Managed Hub instance to which this Container belongs
 * @param {String} clientID
 *    A string ID that identifies a particular client of a Managed Hub. Unique
 *    within the context of the ManagedHub.
 * @param {Object} params  
 *    Parameters used to instantiate the IframeContainer.
 *    Once the constructor is called, the params object belongs exclusively to
 *    the IframeContainer. The caller MUST not modify it.
 *    The following are the pre-defined properties on params:
 * @param {Function} params.Container.onSecurityAlert
 *    Called when an attempted security breach is thwarted.  Function is defined
 *    as follows:  function(container, securityAlert)
 * @param {Function} [params.Container.onConnect]
 *    Called when the client connects to the Managed Hub.  Function is defined
 *    as follows:  function(container)
 * @param {Function} [params.Container.onDisconnect]
 *    Called when the client disconnects from the Managed Hub.  Function is
 *    defined as follows:  function(container)
 * @param {Object} [params.Container.scope]
 *    Whenever one of the Container's callback functions is called, references
 *    to "this" in the callback will refer to the scope object. If no scope is
 *    provided, default is window.
 * @param {Function} [params.Container.log]
 *    Optional logger function. Would be used to log to console.log or
 *    equivalent. 
 * @param {Object} params.IframeContainer.parent
 *    DOM element that is to be parent of iframe
 * @param {String} params.IframeContainer.uri
 *    Initial Iframe URI (Container will add parameters to this URI)
 * @param {String} params.IframeContainer.tunnelURI
 *    URI of the tunnel iframe. Must be from the same origin as the page which
 *    instantiates the IframeContainer.
 * @param {Object} [params.IframeContainer.iframeAttrs]
 *    Attributes to add to IFRAME DOM entity.  For example:
 *              { style: { width: "100%",
 *                         height: "100%" },
 *                className: "some_class" }
 * @param {Number} [params.IframeContainer.timeout]
 *    Load timeout in milliseconds.  If not specified, defaults to 15000.  If
 *    the client at params.IframeContainer.uri does not establish a connection
 *    with this container in the given time, the onSecurityAlert callback is
 *    called with a LoadTimeout error code.
 * @param {Function} [params.IframeContainer.seed]
 *    A function that returns a string that will be used to seed the
 *    pseudo-random number generator, which is used to create the security
 *    tokens.  An implementation of IframeContainer may choose to ignore this
 *    value.
 * @param {Number} [params.IframeContainer.tokenLength]
 *    Length of the security tokens used when transmitting messages.  If not
 *    specified, defaults to 6.  An implementation of IframeContainer may choose
 *    to ignore this value.
 *
 * @throws {OpenAjax.hub.Error.BadParameters}   if required params are not
 *          present or null
 * @throws {OpenAjax.hub.Error.Duplicate}   if a Container with this clientID
 *          already exists in the given Managed Hub
 * @throws {OpenAjax.hub.Error.Disconnected}   if hub is not connected
 */
OpenAjax.hub.IframeContainer = function( hub, clientID, params )
{
    if ( ! hub || ! clientID || ! params ||
            ! params.Container || ! params.Container.onSecurityAlert ||
            ! params.IframeContainer || ! params.IframeContainer.parent ||
            ! params.IframeContainer.uri || ! params.IframeContainer.tunnelURI ) {
        throw new Error(OpenAjax.hub.Error.BadParameters);
    }
    
    this._params = params;
    this._id = clientID;

    if ( window.postMessage ) {
        this._delegate = new OpenAjax.hub.IframePMContainer( this, hub, clientID, params );
    } else {
        this._delegate = new OpenAjax.hub.IframeFIMContainer( this, hub, clientID, params );
    }
    
    // Create IFRAME to hold the client
    this._iframe = this._createIframe( params.IframeContainer.parent, this._delegate.getURI(),
            params.IframeContainer.iframeAttrs );
    
    hub.addContainer( this );
}

    /*** OpenAjax.hub.Container interface implementation ***/

OpenAjax.hub.IframeContainer.prototype.getHub = function()
{
    return this._delegate.getHub();
}

OpenAjax.hub.IframeContainer.prototype.sendToClient = function( topic, data, subscriptionID )
{
    this._delegate.sendToClient( topic, data, subscriptionID );
}

OpenAjax.hub.IframeContainer.prototype.remove = function()
{
    this._delegate.remove();
    this._iframe.parentNode.removeChild( this._iframe );
    delete this._iframe;
}

OpenAjax.hub.IframeContainer.prototype.isConnected = function()
{
    return this._delegate.isConnected();
}

OpenAjax.hub.IframeContainer.prototype.getClientID = function()
{
    return this._id;
}

OpenAjax.hub.IframeContainer.prototype.getPartnerOrigin = function()
{
    return this._delegate.getPartnerOrigin();
}

OpenAjax.hub.IframeContainer.prototype.getParameters = function()
{
    return this._params;
}

/**
 * Get the iframe associated with this iframe container
 * 
 * This function returns the iframe associated with an IframeContainer,
 * allowing the Manager Application to change its size, styles, scrollbars, etc.
 * 
 * CAUTION: The iframe is owned exclusively by the IframeContainer. The Manager
 * Application MUST NOT destroy the iframe directly. Also, if the iframe is
 * hidden and disconnected, the Manager Application SHOULD NOT attempt to make
 * it visible. The Container SHOULD automatically hide the iframe when it is
 * disconnected; to make it visible would introduce security risks. 
 * 
 * @returns iframeElement
 * @type {Object}
 */
OpenAjax.hub.IframeContainer.prototype.getIframe = function() 
{
    return this._iframe;
}

    /*** Helper Functions ***/

/**
 * Return function that runs in given scope.
 *
 * @param {Object} toWhom  scope in which to run given function
 * @param {Function} callback  function to run in given scope
 * @returns {Function}
 */
OpenAjax.hub.IframeContainer.bind = function( toWhom, callback )
{
    var __method = callback;
    return function() {
        return __method.apply(toWhom, arguments);
    }
}


    /*** Private Functions ***/

OpenAjax.hub.IframeContainer.prototype._createIframe = function( parent, src, attrs )
{
    var iframe = document.createElement( "iframe" );
    
    // Add iframe attributes
    if ( attrs ) {
        for ( var attr in attrs ) {
            if ( attr == "style" ) {
                for ( var style in attrs.style ) {
                    iframe.style[ style ] = attrs.style[ style ];
                }
            } else {
                iframe[ attr ] = attrs[ attr ];
            }
        }
    }

    // initially hide IFRAME content, in order to lessen frame phishing impact
    iframe.style.visibility = "hidden";
    
    // (1) Setting the iframe src after it has been added to the DOM can cause
    // problems in IE6/7.  Specifically, if the code is being executed on a page
    // that was served through HTTPS, then IE6/7 will see an iframe with a blank
    // src as a non-secure item and display a dialog warning the user that "this
    // page contains both secure and nonsecure items."  To prevent that, we
    // first set the src to a dummy value, then add the iframe to the DOM, then
    // set the real src value.
    // (2) Trying to fix the above issue by setting the real src before adding
    // the iframe to the DOM breaks Firefox 3.x.  For some reason, when
    // reloading a page that has instantiated an IframeContainer, Firefox will
    // load a previously cached version of the iframe content, whose source
    // contains stale URL query params or hash.  This results in errors in the
    // Hub code, which is expected different values.
    iframe.src = 'javascript:"<html></html>"';
    parent.appendChild( iframe );
    iframe.src = src;
    return iframe;
}

//------------------------------------------------------------------------------

/**
 * Create a new IframeHubClient.
 * @constructor
 * @extends OpenAjax.hub.HubClient
 * 
 * @param {Object} params
 *    Once the constructor is called, the params object belongs to the
 *    HubClient. The caller MUST not modify it.
 *    The following are the pre-defined properties on params:
 * @param {Function} params.HubClient.onSecurityAlert
 *     Called when an attempted security breach is thwarted
 * @param {Object} [params.HubClient.scope]
 *     Whenever one of the HubClient's callback functions is called,
 *     references to "this" in the callback will refer to the scope object.
 *     If not provided, the default is window.
 * @param {Function} [params.HubClient.log]
 *     Optional logger function. Would be used to log to console.log or
 *     equivalent. 
 * @param {Function} [params.IframeHubClient.seed]
 *     A function that returns a string that will be used to seed the
 *     pseudo-random number generator, which is used to create the security
 *     tokens.  An implementation of IframeHubClient may choose to ignore
 *     this value.
 * @param {Number} [params.IframeHubClient.tokenLength]
 *     Length of the security tokens used when transmitting messages.  If
 *     not specified, defaults to 6.  An implementation of IframeHubClient
 *     may choose to ignore this value.
 *     
 * @throws {OpenAjax.hub.Error.BadParameters} if any of the required
 *          parameters is missing, or if a parameter value is invalid in 
 *          some way.
 */
OpenAjax.hub.IframeHubClient = function( params )
{
    if ( ! params || ! params.HubClient || ! params.HubClient.onSecurityAlert ) {
        throw new Error( OpenAjax.hub.Error.BadParameters );
    }
    
    this._params = params;
    
    if ( window.postMessage ) {
        this._delegate = new OpenAjax.hub.IframePMHubClient( this, params );
    } else {
        this._delegate = new OpenAjax.hub.IframeFIMHubClient( this, params );
    }
}

 /*** OpenAjax.hub.HubClient interface implementation ***/

OpenAjax.hub.IframeHubClient.prototype.connect = function( onComplete, scope )
{
    scope = scope || window;
    if ( this.isConnected() ) {
        throw new Error( OpenAjax.hub.Error.Duplicate );
    }
    
    this._delegate.connect( onComplete, scope );
}

OpenAjax.hub.IframeHubClient.prototype.disconnect = function( onComplete, scope )
{
    scope = scope || window;
    if ( ! this.isConnected() ) {
        throw new Error( OpenAjax.hub.Error.Disconnected );
    }
    
    this._delegate.disconnect( onComplete, scope );
}

OpenAjax.hub.IframeHubClient.prototype.getPartnerOrigin = function()
{
    return this._delegate.getPartnerOrigin();
}

OpenAjax.hub.IframeHubClient.prototype.getClientID = function()
{
    return this._delegate.getClientID();
}

 /*** OpenAjax.hub.Hub interface implementation ***/

OpenAjax.hub.IframeHubClient.prototype.subscribe = function( topic, onData, scope, onComplete, subscriberData )
{
    this._assertConn();
    this._assertSubTopic( topic );
    if ( ! onData ) {
        throw new Error( OpenAjax.hub.Error.BadParameters );
    }

    scope = scope || window;
    return this._delegate.subscribe( topic, onData, scope, onComplete, subscriberData );
}

OpenAjax.hub.IframeHubClient.prototype.publish = function( topic, data )
{
    this._assertConn();
    this._assertPubTopic( topic );
    this._delegate.publish( topic, data );
}

OpenAjax.hub.IframeHubClient.prototype.unsubscribe = function( subscriptionID, onComplete, scope )
{
    this._assertConn();
    if ( typeof subscriptionID === "undefined" || subscriptionID == null ) {
        throw new Error( OpenAjax.hub.Error.BadParameters );
    }
    scope = scope || window;
    this._delegate.unsubscribe( subscriptionID, onComplete, scope );
}

OpenAjax.hub.IframeHubClient.prototype.isConnected = function()
{
    return this._delegate.isConnected();
}

OpenAjax.hub.IframeHubClient.prototype.getScope = function()
{
    return this._delegate.getScope();
}

OpenAjax.hub.IframeHubClient.prototype.getSubscriberData = function( subscriptionID )
{
    this._assertConn();
    return this._delegate.getSubscriberData( subscriptionID );
}

OpenAjax.hub.IframeHubClient.prototype.getSubscriberScope = function( subscriptionID )
{
    this._assertConn();
    return this._delegate.getSubscriberScope( subscriptionID );
}

OpenAjax.hub.IframeHubClient.prototype.getParameters = function()
{
    return this._params;
}

 /*** Private Functions ***/

OpenAjax.hub.IframeHubClient.prototype._assertConn = function()
{
    if ( ! this.isConnected() ) {
        throw new Error( OpenAjax.hub.Error.Disconnected );
    }
}

OpenAjax.hub.IframeHubClient.prototype._assertSubTopic = function( topic )
{
    if ( ! topic ) {
        throw new Error(OpenAjax.hub.Error.BadParameters);
    }
    var path = topic.split(".");
    var len = path.length;
    for (var i = 0; i < len; i++) {
        var p = path[i];
        if ((p == "") ||
           ((p.indexOf("*") != -1) && (p != "*") && (p != "**"))) {
            throw new Error(OpenAjax.hub.Error.BadParameters);
        }
        if ((p == "**") && (i < len - 1)) {
            throw new Error(OpenAjax.hub.Error.BadParameters);
        }
    }
}

OpenAjax.hub.IframeHubClient.prototype._assertPubTopic = function( topic )
{
    if ((topic == null) || (topic == "") || (topic.indexOf("*") != -1) ||
        (topic.indexOf("..") != -1) ||  (topic.charAt(0) == ".") ||
        (topic.charAt(topic.length-1) == "."))
    {
        throw new Error(OpenAjax.hub.Error.BadParameters);
    }
}

/******************************************************************************
 *  PostMessage Iframe Container
 *
 *      Implementation of the Iframe Container which uses window.postMessage()
 *      for communicating between an iframe and its parent.
 ******************************************************************************/

OpenAjax.hub.IframePMContainer = function( container, hub, clientID, params )
{
    this._container = container;
    this._hub = hub;
    this._id = clientID;
    this._onSecurityAlert = params.Container.onSecurityAlert;
    this._onConnect = params.Container.onConnect ? params.Container.onConnect : null;
    this._onDisconnect = params.Container.onDisconnect ? params.Container.onDisconnect : null;
    this._scope = params.Container.scope || window;
    this._uri = params.IframeContainer.uri;
    this._tunnelURI = params.IframeContainer.tunnelURI;
    this._timeout = params.IframeContainer.timeout || 15000;
    
    if ( params.Container.log ) {
        var scope = this._scope;
        var logfunc = params.Container.log;
        this._log = function( msg ) {
            logfunc.call( scope, "IframeContainer::" + clientID + ": " + msg );
        };
    } else {
        this._log = function() {};
    }
    
    this._securityToken = this._generateSecurityToken( params );
    
    this._connected = false;
    this._subs = {};
    
    // test if the postMessage impl of this browser is synchronous
    if ( typeof OpenAjax.hub.IframePMContainer._pmCapabilities === "undefined" ) {
        this._testPostMessage();
    }
    
    // if postMessage is synchronous, wrap in a setTimeout
    if ( OpenAjax.hub.IframePMContainer._pmCapabilities.indexOf("s") == -1 ) {
        this._postMessage = function( win, msg, origin ) {
            win.postMessage( msg, origin );
        }
    } else {
        this._postMessage = function( win, msg, origin ) {
            setTimeout(
                function() {
                    win.postMessage( msg, origin );
                },
                0
            );
        }
    }
    
    // register this container with the singleton message listener
    if ( ! OpenAjax.hub.IframePMContainer._pmListener ) {
        OpenAjax.hub.IframePMContainer._pmListener =
                new OpenAjax.hub.IframePMContainer.PMListener();
    }
    // the 'internal ID' is guaranteed to be unique within the page, not just
    // the ManagedHub instance
    this._internalID = OpenAjax.hub.IframePMContainer._pmListener.addContainer( this );
    
    this._startLoadTimer();
}

// communications protocol identifier
OpenAjax.hub.IframePMContainer.protocolID = "openajax-2.0";

// Singleton message listener
OpenAjax.hub.IframePMContainer._pmListener = null;

OpenAjax.hub.IframePMContainer.prototype.getHub = function() {
	return this._hub;
};

OpenAjax.hub.IframePMContainer.prototype.sendToClient = function( topic, data, subscriptionID )
{
    this._sendMessage( "pub", { t: topic, d: data, s: subscriptionID } );
}

OpenAjax.hub.IframePMContainer.prototype.remove = function()
{
    this._disconnect();
    OpenAjax.hub.IframePMContainer._pmListener.removeContainer( this._internalID );
    clearTimeout( this._loadTimer );
    delete this._iframe;
}

OpenAjax.hub.IframePMContainer.prototype.isConnected = function()
{
    return this._connected;
}

OpenAjax.hub.IframePMContainer.prototype.getPartnerOrigin = function()
{
    if ( this._connected ) {
        // remove port, if it is present
        return new RegExp( "^([a-zA-Z]+://[^:]+).*" ).exec( this._partnerOrigin )[1];
    }
    return null;
}

OpenAjax.hub.IframePMContainer.prototype.receiveMessage = function( event, msg )
{
    // check that security token and client window origin for incoming message
    // are what we expect
    if ( msg.t != this._securityToken ||
            ( typeof this._partnerOrigin != "undefined" &&
              ! OpenAjax.hub.IframePMContainer.originMatches( this, event )))
    {
        // security error -- incoming message is not valid; ignore
        this._invokeSecurityAlert( OpenAjax.hub.SecurityAlert.ForgedMsg );
        return;
    }
    
    this._log( "received message: [" + event.data + "]" );

    switch ( msg.m ) {
        // subscribe
        case "sub":
            var errCode = "";  // empty string is success
            try {
                this._subs[ msg.p.s ] = this._hub.subscribeForClient( this._container, msg.p.t, msg.p.s );
            } catch( e ) {
                errCode = e.message;
            }
            this._sendMessage( "sub_ack", { s: msg.p.s, e: errCode } );
            break;
        
        // publish
        case "pub":
            this._hub.publishForClient( this._container, msg.p.t, msg.p.d );
            break;

        // unsubscribe
        case "uns":
            var handle = this._subs[ msg.p.s ];
            this._hub.unsubscribeForClient( this._container, handle );
            delete this._subs[ msg.p.s ];
            this._sendMessage( "uns_ack", msg.p.s );
            break;

        // connect is handled elsewhere -- see IframePMContainer.prototype.connect
        
        // disconnect
        case "dis":
            this._startLoadTimer();
            this._disconnect();
            this._sendMessage( "dis_ack", null );
            if ( this._onDisconnect ) {
                try {
                    this._onDisconnect.call( this._scope, this._container );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    this._log( "caught error from onDisconnect callback to constructor: " + e.message );
                }
            }
            break;
    }
}

/**
 * Complete connection from HubClient to this Container.
 *
 * @param {String} origin  IframePMHubClient's window's origin
 * @param {String} securityToken  Security token originally sent by Container
 * @param {Object} tunnelWindow  window object reference of tunnel window
 */
OpenAjax.hub.IframePMContainer.prototype.connect = function( origin, securityToken, tunnelWindow )
{
    this._log( "client connecting to container " + this._id +
            " :: origin = " + origin + " :: securityToken = " + securityToken );

    // check that security token is what we expect
    if ( securityToken != this._securityToken ) {
        // security error -- incoming message is not valid
        this._invokeSecurityAlert( OpenAjax.hub.SecurityAlert.ForgedMsg );
        return;
    }
    
    // set unload handler on tunnel window
    var that = this;
    tunnelWindow.onunload = function() {
        if ( that.isConnected() ) {
        	// Use a timer to delay the phishing message. This makes sure that
        	// page navigation does not cause phishing errors.
        	// Setting it to 1 ms is enough for it not to be triggered on
        	// regular page navigations.
            setTimeout(
                function() {
                    that._invokeSecurityAlert( OpenAjax.hub.SecurityAlert.FramePhish );
                }, 1
            );
        }
    };
    
    clearTimeout( this._loadTimer );

    this._iframe = this._container.getIframe();
    this._iframe.style.visibility = "visible";

    this._partnerOrigin = origin;
    // if "message" event doesn't support "origin" property, then save hostname
    // (domain) also
    if ( OpenAjax.hub.IframePMContainer._pmCapabilities.indexOf("d") != -1 ) {
        this._partnerDomain = new RegExp( "^.+://([^:]+).*" ).exec( this._partnerOrigin )[1];
    }
    
    this._sendMessage( "con_ack", null );
    this._connected = true;
    if ( this._onConnect ) {
        try {
            this._onConnect.call( this._scope, this._container );
        } catch( e ) {
            OpenAjax.hub._debugger();
            this._log( "caught error from onConnect callback to constructor: " + e.message );
        }
    }
}

OpenAjax.hub.IframePMContainer.prototype.getURI = function()
{
    // add the client ID and a security token as URL query params when loading
    // the client iframe
    var paramStr =
            "oahpv=" + encodeURIComponent( OpenAjax.hub.IframePMContainer.protocolID ) +
            "&oahi=" + encodeURIComponent( this._internalID ) +
            "&oaht=" + this._securityToken +
            "&oahu=" + encodeURIComponent( this._tunnelURI ) +
            "&oahpm=" + OpenAjax.hub.IframePMContainer._pmCapabilities;
    if ( this._id !== this._internalID ) {
        paramStr += "&oahj=" + this._internalID;
    }
    paramStr += OpenAjax.hub.enableDebug ? "&oahd=true" : ""; // REMOVE ON BUILD

    var parts = this._uri.split("#");
    parts[0] = parts[0] + ((parts[0].indexOf( "?" ) != -1) ? "&" : "?") + paramStr;
    if ( parts.length == 1 ) {
        return parts[0];
    }
    return parts[0] + "#" + parts[1];
}

 /*** Helper Functions ***/

OpenAjax.hub.IframePMContainer.originMatches = function( obj, event )
{
  if ( event.origin ) {
      return event.origin == obj._partnerOrigin;
  } else {
      return event.domain == obj._partnerDomain;
  }
}

 /*** Private Function ***/

OpenAjax.hub.IframePMContainer.prototype._generateSecurityToken = function( params )
{
    if ( ! OpenAjax.hub.IframePMContainer._prng ) {
        // create pseudo-random number generator with a default seed
        var seed = new Date().getTime() + Math.random() + document.cookie;
        OpenAjax.hub.IframePMContainer._prng = OpenAjax._smash.crypto.newPRNG( seed );
    }
    
    if ( params.IframeContainer.seed ) {
        try {
            var extraSeed = params.IframeContainer.seed.call( this._scope );
            OpenAjax.hub.IframePMContainer._prng.addSeed( extraSeed );
        } catch( e ) {
            OpenAjax.hub._debugger();
            this._log( "caught error from 'seed' callback: " + e.message );
        }
    }
    
    var tokenLength = params.IframeContainer.tokenLength || 6;
    return OpenAjax.hub.IframePMContainer._prng.nextRandomB64Str( tokenLength );
}

/**
 * Some browsers (IE, Opera) have an implementation of postMessage that is
 * synchronous, although HTML5 specifies that it should be asynchronous.  In
 * order to make all browsers behave consistently, we run a small test to detect
 * if postMessage is asynchronous or not.  If not, we wrap calls to postMessage
 * in a setTimeout with a timeout of 0.
 * Also, Opera's "message" event does not have an "origin" property (at least,
 * it doesn't in version 9.64;  presumably, it will in version 10).  If
 * event.origin does not exist, use event.domain.  The other difference is that
 * while event.origin looks like <scheme>://<hostname>:<port>, event.domain
 * consists only of <hostname>.
 */
OpenAjax.hub.IframePMContainer.prototype._testPostMessage = function()
{
    // String identifier that specifies whether this browser's postMessage
    // implementation differs from the spec:
    //      contains "s" - postMessage is synchronous
    //      contains "d" - "message" event does not have an "origin" property;
    //                     the code looks for the "domain" property instead
    OpenAjax.hub.IframePMContainer._pmCapabilities = "";

    var hit = false;
    
    function receiveMsg(event) {
        if ( event.data == "postmessage.test" ) {
            hit = true;
            if ( typeof event.origin === "undefined" ) {
                OpenAjax.hub.IframePMContainer._pmCapabilities += "d";
            }
        }
    }
    
    if ( window.addEventListener ) {
        window.addEventListener( "message", receiveMsg, false );
    } else if ( window.attachEvent ) {
        window.attachEvent( "onmessage", receiveMsg );
    }
    window.postMessage( "postmessage.test", "*" );
    
    // if 'hit' is true here, then postMessage is synchronous
    if ( hit ) {
        OpenAjax.hub.IframePMContainer._pmCapabilities += "s";
    }

    if ( window.removeEventListener ) {
        window.removeEventListener( "message", receiveMsg, false );
    } else {
        window.detachEvent( "onmessage", receiveMsg );
    }
}

OpenAjax.hub.IframePMContainer.prototype._startLoadTimer = function()
{
    var that = this;
    this._loadTimer = setTimeout(
        function() {
            // don't accept any messages from client
            OpenAjax.hub.IframePMContainer._pmListener.removeContainer( that._internalID );
            // alert the security alert callback
            that._invokeSecurityAlert( OpenAjax.hub.SecurityAlert.LoadTimeout );
        },
        this._timeout
    );
}

/**
 * Send a string message to the associated hub client.
 *
 * The message is a JSON representation of the following object:
 *      {
 *          m: message type,
 *          i: client id,
 *          t: security token,
 *          p: payload (depends on message type)
 *      }
 *
 * The payload for each message type is as follows:
 *      TYPE        DESCRIPTION                     PAYLOAD
 *      "con_ack"    connect acknowledgment          N/A
 *      "dis_ack"    disconnect acknowledgment       N/A
 *      "sub_ack"    subscribe acknowledgment        { s: subscription id, e: error code (empty string if no error) }
 *      "uns_ack"    unsubscribe acknowledgment      { s: subscription id }
 *      "pub"        publish (i.e. sendToClient())   { t: topic, d: data, s: subscription id }
 */
OpenAjax.hub.IframePMContainer.prototype._sendMessage = function( type, payload )
{
    var msg = JSON.stringify({
        m: type,
        i: this._internalID,
        t: this._securityToken,
        p: payload
    });
    this._postMessage( this._iframe.contentWindow, msg, this._partnerOrigin );
}

OpenAjax.hub.IframePMContainer.prototype._disconnect = function()
{
    if ( this._connected ) {
        this._connected = false;
        this._iframe.style.visibility = "hidden";
    
        // unsubscribe from all subs
        for ( var sub in this._subs ) {
            this._hub.unsubscribeForClient( this._container, this._subs[ sub ] );
        }
        this._subs = {};
    }
}

OpenAjax.hub.IframePMContainer.prototype._invokeSecurityAlert = function( errorMsg )
{
    try {
        this._onSecurityAlert.call( this._scope, this._container, errorMsg );
    } catch( e ) {
        OpenAjax.hub._debugger();
        this._log( "caught error from onSecurityAlert callback to constructor: " + e.message );
    }
}


//------------------------------------------------------------------------------

OpenAjax.hub.IframePMContainer.PMListener = function()
{
    this._containers = {};
    
    if ( window.addEventListener ) {
        window.addEventListener( "message",
                OpenAjax.hub.IframeContainer.bind( this, this._receiveMessage ), false); 
    } else if ( window.attachEvent ) {
        window.attachEvent( "onmessage",
                OpenAjax.hub.IframeContainer.bind( this, this._receiveMessage ) );
    }
}

/**
 * Add an IframePMContainer to listen for messages.  Returns an ID for the given
 * container that is unique within the PAGE, not just the ManagedHub instance.
 */
OpenAjax.hub.IframePMContainer.PMListener.prototype.addContainer = function( container )
{
    var id = container._id;
    while ( this._containers[ id ] ) {
        // a client with the specified ID already exists on this page;
        // create a unique ID
        id = ((0x7fff * Math.random()) | 0).toString(16) + "_" + id;
    }

    this._containers[ id ] = container;
    return id;
}

OpenAjax.hub.IframePMContainer.PMListener.prototype.removeContainer = function( internalID )
{
    delete this._containers[ internalID ];
    // XXX TODO If no more postMessage containers, remove listener?
}

/**
 * Complete connection between HubClient and Container identified by "id".  This
 * function is only called by the tunnel window.
 */
OpenAjax.hub.IframePMContainer.PMListener.prototype.connectFromTunnel = function( internalID, origin, securityToken, tunnelWindow )
{
    if ( this._containers[ internalID ] ) {
        this._containers[ internalID ].connect( origin, securityToken, tunnelWindow );
    }
}

OpenAjax.hub.IframePMContainer.PMListener.prototype._receiveMessage = function( event )
{
    // If the received message isn't JSON parseable or if the resulting
    // object doesn't have the structure we expect, then just return.
    try {
        var msg = JSON.parse( event.data );
    } catch( e ) {
        return;
    }
    if ( ! this._verifyMsg( msg ) ) {
        return;
    }
    
    if ( this._containers[ msg.i ] ) {
        var container = this._containers[ msg.i ].receiveMessage( event, msg );
    }
}

OpenAjax.hub.IframePMContainer.PMListener.prototype._verifyMsg = function( msg )
{
    return typeof msg.m == "string" && typeof msg.i == "string" &&
            "t" in msg && "p" in msg;
}

//------------------------------------------------------------------------------

OpenAjax.hub.IframePMHubClient = function( client, params )
{
    // check communications protocol ID
    this._checkProtocolID();
    
    this._client = client;
    this._onSecurityAlert = params.HubClient.onSecurityAlert;
    this._scope = params.HubClient.scope || window;
    this._id = OpenAjax.hub.IframePMHubClient.queryURLParam( "oahi" );
    this._internalID = OpenAjax.hub.IframePMHubClient.queryURLParam( "oahj" ) || this._id;
    this._securityToken = OpenAjax.hub.IframePMHubClient.queryURLParam( "oaht" );
    this._tunnelURI = OpenAjax.hub.IframePMHubClient.queryURLParam( "oahu" );
    OpenAjax.hub.IframePMContainer._pmCapabilities = OpenAjax.hub.IframePMHubClient.queryURLParam( "oahpm" );
    
    // if any of the URL params are missing, throw WrongProtocol error
    if ( ! this._id || ! this._securityToken || ! this._tunnelURI ) {
        throw new Error( OpenAjax.hub.Error.WrongProtocol );
    }
    
    if ( OpenAjax.hub.IframePMHubClient.queryURLParam("oahd") )  OpenAjax.hub.enableDebug = true; // REMOVE ON BUILD
    
    this._partnerOrigin = new RegExp( "^([a-zA-Z]+://[^/?#]+).*" ).exec( this._tunnelURI )[1];
    // if "message" event doesn't support "origin" property, then save hostname
    // (domain) also
    if ( OpenAjax.hub.IframePMContainer._pmCapabilities.indexOf("d") != -1 ) {
        this._partnerDomain = new RegExp( "^.+://([^:]+).*" ).exec( this._partnerOrigin )[1];
    }
    
    if ( params.HubClient.log ) {
        var id = this._id;
        var scope = this._scope;
        var logfunc = params.HubClient.log;
        this._log = function( msg ) {
            logfunc.call( scope, "IframeHubClient::" + id + ": " + msg );
        };
    } else {
        this._log = function() {};
    }
    
    this._connected = false;
    this._subs = {};
    this._subIndex = 0;
    
    // if postMessage is synchronous, wrap in a setTimeout
    if ( OpenAjax.hub.IframePMContainer._pmCapabilities.indexOf("s") == -1 ) {
        this._postMessage = function( win, msg, origin ) {
            win.postMessage( msg, origin );
        }
    } else {
        this._postMessage = function( win, msg, origin ) {
            setTimeout(
                function() {
                    win.postMessage( msg, origin );
                },
                0
            );
        }
    }
}

// communications protocol identifier
OpenAjax.hub.IframePMHubClient.protocolID = "openajax-2.0";

    /*** OpenAjax.hub.HubClient interface implementation ***/

OpenAjax.hub.IframePMHubClient.prototype.connect = function( onComplete, scope )
{
    if ( onComplete ) {
        this._connectOnComplete = { cb: onComplete, sc: scope };
    }
    
    // start listening for messages
    this._msgListener = OpenAjax.hub.IframeContainer.bind( this, this._receiveMessage );
    if ( window.addEventListener ) {
        window.addEventListener( "message", this._msgListener, false); 
    } else if ( window.attachEvent ) {
        window.attachEvent( "onmessage", this._msgListener );
    }
    
    // create tunnel iframe, which will finish connection to container
    var origin = window.location.protocol + "//" + window.location.host;
    var iframe = document.createElement( "iframe" );
    document.body.appendChild( iframe );
    iframe.src = this._tunnelURI +
            (this._tunnelURI.indexOf("?") == -1 ? "?" : "&") +
            "oahj=" + encodeURIComponent( this._internalID ) +
            "&oaht=" + this._securityToken + 
            "&oaho=" + encodeURIComponent( origin );
	iframe.style.position = "absolute";
	iframe.style.left = iframe.style.top = "-10px";
	iframe.style.height = iframe.style.width = "1px";
	iframe.style.visibility = "hidden";
	this._tunnelIframe = iframe;
}

OpenAjax.hub.IframePMHubClient.prototype.disconnect = function( onComplete, scope )
{
    this._connected = false;
    if ( onComplete ) {
        this._disconnectOnComplete = { cb: onComplete, sc: scope };
    }
    this._sendMessage( "dis", null );
}

OpenAjax.hub.IframePMHubClient.prototype.getPartnerOrigin = function()
{
    if ( this._connected ) {
        // remove port, if it is present
        return new RegExp( "^([a-zA-Z]+://[^:]+).*" ).exec( this._partnerOrigin )[1];
    }
    return null;
}

OpenAjax.hub.IframePMHubClient.prototype.getClientID = function()
{
    return this._id;
}

    /*** OpenAjax.hub.Hub interface implementation ***/

OpenAjax.hub.IframePMHubClient.prototype.subscribe = function( topic, onData, scope, onComplete, subscriberData )
{
    var subID = "" + this._subIndex++;
    this._subs[ subID ] = { cb: onData, sc: scope, d: subscriberData, oc: onComplete };
    this._sendMessage( "sub", { t: topic, s: subID } );
    return subID;
}

OpenAjax.hub.IframePMHubClient.prototype.publish = function( topic, data )
{
    this._sendMessage( "pub", { t: topic, d: data } );
}

OpenAjax.hub.IframePMHubClient.prototype.unsubscribe = function( subID, onComplete, scope )
{
    // if no such subID, or in process of unsubscribing given ID, throw error
    if ( ! this._subs[ subID ] || this._subs[ subID ].uns ) {
        throw new Error( OpenAjax.hub.Error.NoSubscription );
    }
    this._subs[ subID ].uns = { cb: onComplete, sc: scope };
    this._sendMessage( "uns", { s: subID } );
}

OpenAjax.hub.IframePMHubClient.prototype.isConnected = function()
{
    return this._connected;
}

OpenAjax.hub.IframePMHubClient.prototype.getScope = function()
{
    return this._scope;
}

OpenAjax.hub.IframePMHubClient.prototype.getSubscriberData = function( subID )
{
    var sub = this._subs[ subID ];
    if ( sub ) {
        return sub.d;
    }
    throw new Error( OpenAjax.hub.Error.NoSubscription );
}

OpenAjax.hub.IframePMHubClient.prototype.getSubscriberScope = function( subID )
{
    var sub = this._subs[ subID ];
    if ( sub ) {
        return sub.sc;
    }
    throw new Error( OpenAjax.hub.Error.NoSubscription );
}

    /*** Helper Functions ***/

OpenAjax.hub.IframePMHubClient.queryURLParam = function( param )
{
    var result = new RegExp( "[\\?&]" + param + "=([^&#]*)" ).exec( window.location.search );
    if ( result ) {
        return decodeURIComponent( result[1].replace( /\+/g, "%20" ) );
    }
    return null;
};

    /*** Private Functions ***/

OpenAjax.hub.IframePMHubClient.prototype._checkProtocolID = function()
{
    var partnerProtocolID = OpenAjax.hub.IframePMHubClient.queryURLParam( "oahpv" );
    if ( partnerProtocolID != OpenAjax.hub.IframePMHubClient.protocolID ) {
        throw new Error( OpenAjax.hub.Error.WrongProtocol );
    }
}

OpenAjax.hub.IframePMHubClient.prototype._receiveMessage = function( event )
{
    // If the received message isn't JSON parseable or if the resulting
    // object doesn't have the structure we expect, then just return.  This
    // message might belong to some other code on the page that is also using
    // postMessage for communication.
    try {
        var msg = JSON.parse( event.data );
    } catch( e ) {
        return;
    }
    if ( ! this._verifyMsg( msg ) ) {
        return;
    }
    
    // check that security token and window source for incoming message
    // are what we expect
    if ( msg.i != this._internalID ) {
        // this message might belong to an IframeContainer on this page
        return;
    } else if ( ! OpenAjax.hub.IframePMContainer.originMatches( this, event ) ||
            msg.t != this._securityToken )
    {
        // security error -- incoming message is not valid
        try{
            this._onSecurityAlert.call( this._scope, this._client,
                    OpenAjax.hub.SecurityAlert.ForgedMsg );
        } catch( e ) {
            OpenAjax.hub._debugger();
            this._log( "caught error from onSecurityAlert callback to constructor: " + e.message );
        }
        return;
    }

    this._log( "received message: [" + event.data + "]" );

    switch ( msg.m ) {
        // subscribe acknowledgement
        case "sub_ack":
            var subID = msg.p.s;
            var onComplete = this._subs[ subID ].oc;
            if ( onComplete ) {
                try {
                    delete this._subs[ subID ].oc;
                    var scope = this._subs[ subID ].sc;
                    onComplete.call( scope, msg.p.s, msg.p.e == "", msg.p.e );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    this._log( "caught error from onComplete callback to HubClient.subscribe(): " + e.message );
                }
            }
            break;
        
        // publish event
        case "pub":
            var subID = msg.p.s;
            // if subscription exists and we are not in process of unsubscribing...
            if ( this._subs[ subID ] && ! this._subs[ subID ].uns ) {
                var onData = this._subs[ subID ].cb;
                var scope = this._subs[ subID ].sc;
                var subscriberData = this._subs[ subID ].d;
                try {
                    onData.call( scope, msg.p.t, msg.p.d, subscriberData );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    this._log( "caught error from onData callback to HubClient.subscribe(): " + e.message );
                }
            }
            break;
        
        // unsubscribe acknowledgement
        case "uns_ack":
            var subID = msg.p;
            if ( this._subs[ subID ] ) {
                var onComplete = this._subs[ subID ].uns.cb;
                if ( onComplete ) {
                    try {
                        var scope = this._subs[ subID ].uns.sc;
                        onComplete.call( scope, subID, true );
                    } catch( e ) {
                        OpenAjax.hub._debugger();
                        this._log( "caught error from onComplete callback to HubClient.unsubscribe(): " + e.message );
                    }
                }
                delete this._subs[ subID ];
            }
            break;
        
        // connect acknowledgement
        case "con_ack":
            this._connected = true;
            if ( this._connectOnComplete ) {
                var onComplete = this._connectOnComplete.cb;
                var scope = this._connectOnComplete.sc;
                try {
                    onComplete.call( scope, this._client, true );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    this._log( "caught error from onComplete callback to HubClient.connect(): " + e.message );
                }
                delete this._connectOnComplete;
            }
            break;
        
        // disconnect acknowledgment
        case "dis_ack":
            // stop listening for messages
            if ( window.removeEventListener ) {
                window.removeEventListener( "message", this._msgListener, false );
            } else {
                window.detachEvent( "onmessage", this._msgListener );
            }
            delete this._msgListener;
            
            this._tunnelIframe.parentNode.removeChild( this._tunnelIframe );
            delete this._tunnelIframe;
            
            if ( this._disconnectOnComplete ) {
                try {
                    var onComplete = this._disconnectOnComplete.cb;
                    var scope = this._disconnectOnComplete.sc;
                    onComplete.call( scope, this._client, true );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    this._log( "caught error from onComplete callback to HubClient.disconnect(): " + e.message );
                }
                delete this._disconnectOnComplete;
            }
            break;
    }
}

OpenAjax.hub.IframePMHubClient.prototype._verifyMsg = function( msg )
{
    return typeof msg.m == "string" && "t" in msg && "p" in msg;
}

/**
 * Send a string message to the associated container.
 *
 * The message is a JSON representation of the following object:
 *      {
 *          m: message type,
 *          i: client id,
 *          t: security token,
 *          p: payload (depends on message type)
 *      }
 *
 * The payload for each message type is as follows:
 *      TYPE    DESCRIPTION     PAYLOAD
 *      "con"    connect         N/A
 *      "dis"    disconnect      N/A
 *      "sub"    subscribe       { t: topic, s: subscription id }
 *      "uns"    unsubscribe     { s: subscription id }
 *      "pub"    publish         { t: topic, d: data }
 */
OpenAjax.hub.IframePMHubClient.prototype._sendMessage = function( type, payload )
{
    var msg = JSON.stringify({
        m: type,
        i: this._internalID,
        t: this._securityToken,
        p: payload
    });
    this._postMessage( window.parent, msg, this._partnerOrigin );
}
