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


// XXX revert r231 - Revision 231 added support for having the client pass back
// both the initial URI and the current URI, which are different in the case
// or redirection.  However, in order for this to work, the final client code
// must set smash._initialClientURI to the initial URI (the URI for the page
// that did the redirection).  There isn't a clean way to do this with the
// current Hub 2.0 APIs, so I'm disabling this feature for now.  Search the code
// for "XXX revert r231".


if ( typeof OpenAjax === "undefined" ) {
    OpenAjax = { hub: {} };
}

(function(){

OpenAjax.hub.IframeFIMContainer = function( container, hub, clientID, params )
{
    this._container = container;
    this._hub = hub;
    this._onSecurityAlert = params.Container.onSecurityAlert;
    this._onConnect = params.Container.onConnect ? params.Container.onConnect : null;
    this._onDisconnect = params.Container.onDisconnect ? params.Container.onDisconnect : null;
    this._scope = params.Container.scope || window;
    this._subs = {};
    
    // XXX Need to make sure URI is absolute, or change the "clientURI!=componentURI"
    // comparison in SEComm.initializationFinished (where 'clientURI' is always
    // absolute, but 'componentURI' is based on params.IframeContainer.uri and
    // may be relative, which makes the comparison fail)
    this._clientURI = params.IframeContainer.uri;

    smash.SEComm.tunnelURI = params.IframeContainer.tunnelURI;
    smash._loadTimeout = params.IframeContainer.timeout || 15000;
    
    if ( params.Container.log ) {
        var scope = this._scope;
        var logfunc = params.Container.log;
        this._log = function( msg ) {
            logfunc.call( scope, "IframeContainer::" + clientID + ": " + msg );
        };
    } else {
        this._log = function() {};
    }
    
    // configurable goodbyeMessage: protects against malicious unloading of the mashup application
//    if (params.goodbyeMessage != null) {
//        smash._goodbyeMessage = params.goodbyeMessage;
//    }
    // configurable securityTokenLength
//    if (params.securityTokenLength != null) {
//        smash._securityTokenLength = params.securityTokenLength;
//        smash._computeOtherTokenConstants();
//    }
    
    // create and configure the pseudo-random number generator, used to create
    // security tokens
    smash._createPRNG( this, params );
    
    smash._ensureSingletonManager();
    // the 'internal ID' is guaranteed to be unique within the page, not just
    // the ManagedHub instance
    this._internalID = smash._singletonManager.generateUniqueClientName( clientID );
}

OpenAjax.hub.IframeFIMContainer.prototype.getHub = function() {
	return this._hub;
};

OpenAjax.hub.IframeFIMContainer.prototype.sendToClient = function( topic, data, subscriptionID )
{
    smash._singletonManager.sendToClient( this._internalID, topic, data, [ subscriptionID ] );
}

OpenAjax.hub.IframeFIMContainer.prototype.remove = function()
{
    /**
     * Cleans up data-strucrures for communication with the given client. Needs to be called prior to unloading of the
     * client to prevent false positives about 'frame phishing' attacks.
     * smash.prepareForUnload(clientName: string)
     */
    return smash._singletonManager.prepareForUnload( this._internalID );
}

OpenAjax.hub.IframeFIMContainer.prototype.isConnected = function()
{
    return smash._singletonManager.isConnected( this._internalID );
}

OpenAjax.hub.IframeFIMContainer.prototype.getPartnerOrigin = function()
{
    return smash._singletonManager.getPartnerOrigin( this._internalID );
}

OpenAjax.hub.IframeFIMContainer.prototype.getURI = function()
{
    /**
     * Prepares for loading of a client in a separate iframe. In addition to setting up internal data-structures,
     * it updates the URI (potentially adding a fragment identifier and URI parameters). 
     * The updates are necessary to pass values needed to bootstrap communication.
     *
     * string smash.prepareForLoad({clientName: string, uri: string, 
     *  [commErrorCallback:function(clientName:string, error:string)]})
     * return value of null indicates failure, a non-null return value is the updated URI
     */
    var that = this;
    function errorCallback( clientID, error ) {
        var alertType = null;
        switch( error ) {
			case smash.SecurityErrors.INVALID_TOKEN:
			case smash.SecurityErrors.TOKEN_VERIFICATION_FAILED:
			    alertType = OpenAjax.hub.SecurityAlert.ForgedMsg;
			    break;
			case smash.SecurityErrors.TUNNEL_UNLOAD:
			    alertType = OpenAjax.hub.SecurityAlert.FramePhish;
			    break;
			case smash.SecurityErrors.COMPONENT_LOAD:
			    alertType = OpenAjax.hub.SecurityAlert.LoadTimeout;
			    break;
        }
        try {
            that._onSecurityAlert.call( that._scope, that._container, alertType );
        } catch( e ) {
            OpenAjax.hub._debugger();
            that._log( "caught error from onSecurityAlert callback to constructor: " + e.message );
        }
    }
    var newURI = smash._singletonManager.prepareForLoad({ clientName: this._internalID,
            uri: this._clientURI, commErrorCallback: errorCallback,
            oaaContainer: this, log: this._log });
    
    if ( newURI && OpenAjax.hub.enableDebug )  newURI += ":debug"; // REMOVE ON BUILD

    return newURI;
}

//------------------------------------------------------------------------------

OpenAjax.hub.IframeFIMHubClient = function( client, params )
{
    // XXX Since server redirection breaks hash communication (the server does
    // not receive the fragment value, therefore the final URL does not contain
    // this information), the initial message is transmitted as a URL param.
    // The SMash code, though, expects messages after the hash.  So we copy
    // the initial message value into the fragment.
    var initialMsg = new RegExp( "[\\?&]oahm=([^&#]*)" ).exec( window.location.search );
    if ( ! initialMsg ) {
        throw new Error( OpenAjax.hub.Error.WrongProtocol );
    }
    initialMsg = initialMsg[1];

    // check communications protocol ID
    var partnerProtocolID = initialMsg.split( ":", 1 );
    if ( partnerProtocolID[0] != smash._protocolID ) {
        throw new Error( OpenAjax.hub.Error.WrongProtocol );
    }
    // remove protocol ID from initialMsg, since decodeMessage() doesn't
    // expect it
    initialMsg = initialMsg.substring( partnerProtocolID[0].length + 1 );
    
    // copy initial message into URL fragment
    var url = window.location.href + "#" + initialMsg;
	window.location.replace( url );
	
    
    this._client = client;
    this._onSecurityAlert = params.HubClient.onSecurityAlert;
    this._scope = params.HubClient.scope || window;
    
    // pull out client id from initial message
    var re = new RegExp( "\\d{3}.{" + smash._securityTokenLength + "}.{" + smash._securityTokenLength + "}\\d{3}(.*)" );
    var payload = re.exec( initialMsg )[1];
    var parts = payload.split(":");
    var internalID = decodeURIComponent( parts[0] );
    this._id = internalID.substring( internalID.indexOf("_") + 1 );
    
    if ( parts[2] && parts[2] == "debug" )  OpenAjax.hub.enableDebug = true; // REMOVE ON BUILD

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
    
    // create and configure the pseudo-random number generator, used to create
    // security tokens
    smash._createPRNG( this, params );
    
    // configurable initialClientURI: only for those clients which perform URI redirection
    // at client load time
// XXX revert r231
//    if (params.initialClientURI) {
//        smash._initialClientURI = params.initialClientURI;
//    }
}

 /*** OpenAjax.hub.HubClient interface implementation ***/

OpenAjax.hub.IframeFIMHubClient.prototype.connect = function( onComplete, scope )
{
    if ( smash._singletonClientHub == null ) {
        // allow a null clientName since the SMash provider can find it in the fragment.
        smash._singletonClientHub = new smash.SEHubClient( null, this._log );
        // set to be notified of security errors
        var that = this;
        smash._singletonClientHub.setSecurityErrorCallback( function( errorcode ) {
            if ( errorcode != smash.SecurityErrors.INVALID_TOKEN ) {
                that._log( "unknown smash security error: " + errorcode );
            }
            try {
                that._onSecurityAlert.call( that._scope, that._client, OpenAjax.hub.SecurityAlert.ForgedMsg );
            } catch( e ) {
                OpenAjax.hub._debugger();
                that._log( "caught error from onSecurityAlert callback to constructor: " + e.message );
            }
        });
    }
    
    var that = this;
    function cb( success, seHubClient ) {
        if ( success ) {
            that._connected = true;
        }
        if ( onComplete ) {
            try {
                onComplete.call( scope, that._client, success );    // XXX which error to return when success == false?
            } catch( e ) {
                OpenAjax.hub._debugger();
                that._log( "caught error from onComplete callback to HubClient.connect(): " + e.message );
            }
        }
    }
    smash._singletonClientHub.connect( cb );
}

OpenAjax.hub.IframeFIMHubClient.prototype.disconnect = function( onComplete, scope )
{
    this._connected = false;
    var that = this;
    function cb( success, seHubClient ) {
        // XXX what happens if success == false
        if ( onComplete ) {
            try {
                onComplete.call( scope, that._client, success );    // XXX which error to return when success == false?
            } catch( e ) {
                OpenAjax.hub._debugger();
                that._log( "caught error from onComplete callback to HubClient.disconnect(): " + e.message );
            }
        }
    }
    smash._singletonClientHub.disconnect( cb );
}

OpenAjax.hub.IframeFIMHubClient.prototype.getPartnerOrigin = function()
{
    return smash._singletonClientHub ? smash._singletonClientHub.getPartnerOrigin() : null;
}

OpenAjax.hub.IframeFIMHubClient.prototype.getClientID = function()
{
    return this._id;
}

 /*** OpenAjax.hub.Hub interface implementation ***/

OpenAjax.hub.IframeFIMHubClient.prototype.subscribe = function( topic, onData, scope, onComplete, subscriberData )
{
    var subID = "" + this._subIndex++;

    var that = this;
    var completeCallback = ! onComplete ? null :
            function ( success, subHandle, error ) {
                try {
                    onComplete.call( scope, subID, success, error );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    that._log( "caught error from onComplete callback to HubClient.subscribe(): " + e.message );
                }
            };
    function dataCallback( subHandle, topic, data ) {
        try {
            onData.call( scope, topic, data, subscriberData );
        } catch( e ) {
            OpenAjax.hub._debugger();
            that._log( "caught error from onData callback to HubClient.subscribe(): " + e.message );
        }
    }
    this._subs[ subID ] = smash._singletonClientHub.subscribe( topic, completeCallback, dataCallback, scope, subscriberData );
    return subID;
}

OpenAjax.hub.IframeFIMHubClient.prototype.publish = function( topic, data )
{
    smash._singletonClientHub.publish( topic, data );
}

OpenAjax.hub.IframeFIMHubClient.prototype.unsubscribe = function( subID, onComplete, scope )
{
    if ( ! this._subs[ subID ] ) {
        throw new Error( OpenAjax.hub.Error.NoSubscription );
    }
    var that = this;
    function cb( success, subHandle ) {
        delete that._subs[ subID ];
        if ( onComplete ) {
            try {
                onComplete.call( scope, subID, success/*, error*/ );
            } catch( e ) {
                OpenAjax.hub._debugger();
                that._log( "caught error from onComplete callback to HubClient.unsubscribe(): " + e.message );
            }
        }
    };
    this._subs[ subID ].unsubscribe( cb );
}

OpenAjax.hub.IframeFIMHubClient.prototype.isConnected = function()
{
    return this._connected;
}

OpenAjax.hub.IframeFIMHubClient.prototype.getScope = function()
{
    return this._scope;
}

OpenAjax.hub.IframeFIMHubClient.prototype.getSubscriberData = function( subID )
{
    var sub = this._subs[ subID ];
    if ( sub ) {
        return sub.getSubscriberData();
    }
    throw new Error( OpenAjax.hub.Error.NoSubscription );
}

OpenAjax.hub.IframeFIMHubClient.prototype.getSubscriberScope = function( subID )
{
    var sub = this._subs[ subID ];
    if ( sub ) {
        return sub.getSubscriberScope();
    }
    throw new Error( OpenAjax.hub.Error.NoSubscription );
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

if ( typeof OpenAjax._smash == 'undefined' ) { OpenAjax._smash = {}; }
var smash = OpenAjax._smash;

// Ideally, should use a closure for private (and public) data and functions,
// but this was easier for the initial SMash refactoring.

smash._singletonManager = undefined; // the singleton that implements all the manager-side SPI
smash._singletonClientHub = undefined; // the singleton that implements all the client-side SPI

smash._protocolID = "openajax-2.0";

//smash._goodbyeMessage = undefined; // The goodbye message sent when unloading the mashup page. Protects against malicious unloading of the mashup application. If undefined, no message is displayed
//smash._loadTimeout = 20000; // The default timeout time during loading of a component. The lower the value the higher the security against frame-phishing but also the higer the chance of false detections.
// XXX revert r231
//smash._initialClientURI = undefined; // For use by the smash provider loaded by a client. Should only be changed from the default value if the client does URI redirection at load time. Otherwise, we will assume that the current URI was also the initial URI

// --- security token stuff ---
// configurable pseudo random number generator (prng) to use for generating the security token. 
// If not set, we use Math.random. 
// If set, the provided random number generator must support a function nextRandomB64Str(strlength:integer)
// that returns a string of length strlength, where each character is a "modified Base64 for URL" character.
// This includes A-Z, a-z, and 0-9 for the first 62 digits, like standard Base64 encoding, but
// no padding '='. And the '+', '/' characters of standard Base64 are replaced by '-', '_'.
smash._prng = undefined; 
smash._securityTokenLength = 6; // configurable security token length. If default value is not used, both manager and clients have to change it to the same value. 
smash._securityTokenOverhead = null; // the number of characters in a serialized message consumed by the security tokens
smash._computeOtherTokenConstants = function() {
	smash._securityTokenOverhead = 2*smash._securityTokenLength;
	smash._multiplier = Math.pow(10, smash._securityTokenLength-1);
}
smash._computeOtherTokenConstants();

smash._createPRNG = function( container, params )
{
    if ( ! smash._prng ) {
        // create pseudo-random number generator with a default seed
        var seed = new Date().getTime() + Math.random() + document.cookie;
        smash._prng = smash.crypto.newPRNG( seed );
    }
    
    var p = params.IframeContainer || params.IframeHubClient;
    if ( p && p.seed ) {
        try {
            var extraSeed = p.seed.call( container._scope );
            smash._prng.addSeed( extraSeed );
        } catch( e ) {
            OpenAjax.hub._debugger();
            container._log( "caught error from 'seed' callback: " + e.message );
        }
    }
}

/**
 * Randomly generates the security token which will be used to ensure message integrity.
 */
smash._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
smash._generateSecurityToken = function() {
	var r;
	if (smash._prng) 
		r = smash._prng.nextRandomB64Str(smash._securityTokenLength);
	else {
		var r1 = Math.random(); // value in (0,1)
		r = "";
		// assuming one Math.random() value has enough bits for smash._securityTokenLenght
		for (var i=0; i<smash._securityTokenLength; i++) {
			var r2 = r1 * 64; // get the most significant base-64 value
			var c = Math.floor(r2);
			r1 = (r2 - c); // the remaining fractional value
			r = r + smash._keyStr.charAt(c);
		}
	}
	return r;
}

//------------------------- manager-side implementation ------------------------

/** 
 * lazy creation of the manager-side singleton
 */
smash._ensureSingletonManager = function() {
	if (smash._singletonManager == null)
		smash._singletonManager = new smash.SEHub();
}

/**
 * Constructor.
 * The name SEHub is legacy. The provider on the manager-side does not implement any of the hub functionality
 * other than communication.
 */
smash.SEHub = function(){
	// This is used to make the object available to the private methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions. See http://www.crockford.com/javascript/private.html
	var that=this;
	// associative array indexed by componentId. Each element is a ComponentInfo object. 
	// Component is synonymous with client. componentId is the same as clientName
	this.componentInfo = [];
	
	/**
	 * Constructor for ComponentInfo objects
	 */
	function ComponentInfo(uri, eCallback) {
		this.uri = uri;
//		this.state = smash.SEHubConstants.START;
        this.connected = false;
		this.errorCallback = eCallback;
	}
    
    // create an ID that is unique within the page
    this.generateUniqueClientName = function( clientName ) {
        do {
            clientName = ((0x7fff * Math.random()) | 0).toString(16) + "_" + clientName;
        } while ( that.componentInfo[ clientName ] );
        return clientName;
    }
	
	// securityListener function registered for each component's security events
	function securityListener(errorType, clientName) {
//		var errorString = that.getSecurityErrorString(errorType); // get the error as a string
		var ci = that.componentInfo[clientName];
		if ( ci != null ) {
			var errorCallback = ci.errorCallback; // the errorCallback registered by the application
			if (errorCallback != null) { // if one was registered
//				errorCallback(clientName, errorString);
				errorCallback(clientName, errorType);
			}
		}
	}


	/** 
	 * string prepareForLoad({clientName: string, uri: string, 
	 *  [commErrorCallback:function(clientName:string, error:string)]})
	 * return value of null indicates failure, a non-null return value is the updated URI
	 */
	this.prepareForLoad = function(params) {
		var clientName = params.clientName; // componentId and clientName are the same thing in this code
		var componentURI = params.uri;
		if ((clientName == null) || (componentURI == null))
			return null;
		if (that.componentInfo[clientName] != null) {
			return null;
		}
		that.componentInfo[clientName] = new ComponentInfo(componentURI, params.commErrorCallback);
		that.componentInfo[clientName].seComm = new smash.SEComm(); //The SEComm library used for this component
		that.componentInfo[clientName].seComm.setSecurityListener(securityListener);
        that.componentInfo[clientName].oaaContainer = params.oaaContainer;
        return that.componentInfo[clientName].seComm.prepareForLoad(clientName, componentURI, that, smash._loadTimeout, params.log);
	}

	/**
	 * boolean prepareForUnload(clientName: string)
	 */
	this.prepareForUnload = function(clientName) {
		if (!that.componentInfo[clientName]) {
			// component does not exist.
			return true;
		}
//		// change state. pretty useless, since going to delete anyway
//		that.componentInfo[clientName].state = smash.SEHubConstants.UNLOADED;
		that._disconnect( clientName );
		that.componentInfo[clientName].seComm.prepareForUnload();
		// remove the relevant objects
		delete that.componentInfo[clientName];
		return true;
	}

	/**
	 * boolean isConnected(clientName:string)
	 */
	this.isConnected = function(clientName) {
//		if ( that.componentInfo[clientName] && that.componentInfo[clientName].state == smash.SEHubConstants.LOADED )
		if ( that.componentInfo[clientName] && that.componentInfo[clientName].connected ) {
		    return true;
	    }
		return false;
	}

	/** 
	 * sendToClient(clientName:string, topic: string, data:JSON|string, matchingSubs:array of string)
	 */
	this.sendToClient = function(clientName, topic, data, matchingSubs) {
		// send to the component
		if (that.isConnected(clientName)) {
			var comms = that.componentInfo[clientName].seComm;
			if (comms) {
				comms.distribute(topic, matchingSubs, data);
			}
		}
	}

    /** Callback when component loaded */
    this.componentLoaded = function(clientName, partnerURL) {
        if (that.componentInfo[clientName]) {
//            that.componentInfo[clientName].state = smash.SEHubConstants.LOADED;
            that.componentInfo[clientName].connected = true;
            that.componentInfo[clientName].partnerOrigin = new RegExp( "^([a-zA-Z]+://[^:/?#]+).*" ).exec( partnerURL )[1];
            
            var oaaContainer = that.componentInfo[ clientName ].oaaContainer;
            oaaContainer._container.getIframe().style.visibility = "visible";
            if ( oaaContainer._onConnect ) {
                try {
                    oaaContainer._onConnect.call( oaaContainer._scope, oaaContainer._container );
                } catch( e ) {
                    OpenAjax.hub._debugger();
                    oaaContainer._log( "caught error from onConnect callback to constructor: " + e.message );
                }
            }
        }
    }

    
    /**
     * A message received from a component
     * @param componentId The component that sent the message
     * @param topic 
     * @param message The payload of the message (JSON|string)
     */
    this.publishInternal = function(componentId, topic, message) {
        if (that.componentInfo[componentId]) {
            // component exists
            var oaaContainer = that.componentInfo[ componentId ].oaaContainer;
            oaaContainer._hub.publishForClient( oaaContainer._container, topic, message );
        }
    }

    /**
     * A subscribe message received from a component
     * @param componentId The component that sent the message
     * @param subId The subscription id
     * @param topic 
     */
    this.subscribeInternal = function(componentId, subId, topic) {
        var oaaContainer = that.componentInfo[ componentId ].oaaContainer;
        oaaContainer._subs[ subId ] = oaaContainer._hub.subscribeForClient( oaaContainer._container, topic, subId );
    }

    /**
     * A unsubscribe message received from a component
     * @param componentId The component that sent the message
     * @param subId
     * @returns true if unsubscribe was accepted else false
     */
    this.unsubscribeInternal = function(componentId, subId) {
        try {
            var oaaContainer = that.componentInfo[ componentId ].oaaContainer;
            var handle = oaaContainer._subs[ subId ];
            oaaContainer._hub.unsubscribeForClient( oaaContainer._container, handle );
            return true;
        } catch( e ) {}
        return false;
    }
    
    this.disconnect = function( componentId )
    {
        that._disconnect( componentId );

        var oaaContainer = that.componentInfo[ componentId ].oaaContainer;
        if ( oaaContainer._onDisconnect ) {
            try {
                oaaContainer._onDisconnect.call( oaaContainer._scope, oaaContainer._container );
            } catch( e ) {
                OpenAjax.hub._debugger();
                oaaContainer._log( "caught error from onDisconnect callback to constructor: " + e.message );
            }
        }
    }
    
    this._disconnect = function( componentId )
    {
        if ( that.componentInfo[ componentId ].connected ) {
    	    that.componentInfo[ componentId ].connected = false;

    	    // hide component iframe
            var oaaContainer = that.componentInfo[ componentId ].oaaContainer;
            oaaContainer._container.getIframe().style.visibility = "hidden";
        
            // unsubscribe from all subs
            for ( var sub in oaaContainer._subs ) {
                oaaContainer._hub.unsubscribeForClient( oaaContainer._container, oaaContainer._subs[ sub ] );
            }
            oaaContainer._subs = {};
        }
    }
    
    this.getPartnerOrigin = function( componentId )
    {
        if ( that.componentInfo[ componentId ]. connected ) {
            return that.componentInfo[ componentId ].partnerOrigin;
        }
        return null;
    }

	/**
	 * Converts a security error code into a readable error message.
	 * @param error The error code.
	 */
//	this.getSecurityErrorString = function(error) {
//		switch (error) {
//			case smash.SecurityErrors.INVALID_TOKEN: return smash.SecurityErrors.INVALID_TOKEN_MSG;
//			case smash.SecurityErrors.TOKEN_VERIFICATION_FAILED: return smash.SecurityErrors.TOKEN_VERIFICATION_FAILED_MSG;
//			case smash.SecurityErrors.TUNNEL_UNLOAD: return smash.SecurityErrors.TUNNEL_UNLOAD_MSG;
//			case smash.SecurityErrors.COMPONENT_LOAD: return smash.SecurityErrors.COMPONENT_LOAD_MSG;
//			default: return "UNKNOWN";
//		}
//	}
	
	
	/**
	 * Sets the unload function which shows the goodbye message.
	 */	
//	window.onunload=function(){
//		if (smash._goodbyeMessage != undefined)
//			alert(smash._goodbyeMessage);
//	}
}

//---------- client-side implementation ----------------------------------------

/**
 * SEHubClient implementation linking the SECommClient together with the component side logic.
 */
smash.SEHubClient = function( clientName, logfunc )
{
	//-------- interface implemented by connHandle in Hub 1.1. We use the SEHub instance itself
	//-------- as the connHandle object for the "manager".

	this.equals = function(anotherConn) { return that === anotherConn; }
	this.isConnected = function() { return connected; }
	this.getClientName = function() { return clientName; }
	
	this.connect = function( callback ) {
	    connectCallback = function( success ) {
	        if ( success ) {
	            connected = true;
	        }
	        callback( success, that );
	    };
	    seCommClient.connect( connectCallback );
	}
	
	this.disconnect = function(callback) {
	    disconnectCallback = function( success ) {
	        if ( success ) {
    	        connected = false;
    		    subHandles = [];    // delete all existing subscriptions
            }
            callback( success, that );		    
	    };
	    seCommClient.disconnect();
		return;
	}
	
	/**
	 * connHandle.subscribe(topic:string, callback:function, eventCallback:function)
	 * returns a subHandle object, or null if it fails immediately.
	 */
	this.subscribe = function(topic, callback, eventCallback, scope, subscriberData) {
		// keep track of the callback so that the incomming message can be distributed correctly
		var subId = (subCount + ''); // assign the subscription id - making it a string
		subCount++;
		subHandles[subId] = new SubHandle(subId, topic, callback, eventCallback, that, scope, subscriberData);
		seCommClient.subscribe(subId, topic);
		return subHandles[subId];
	}
	/**
	 * connHandle.publish(topic:string, data:JSON|string)
	 */
	this.publish = function(topic, data) {
		seCommClient.publish(topic,data);
		return true;
	}
	function SubHandle(subId, topic, callback, eventCallback, sehubClient, scope, subscriberData) {
		var _isSubscribed = false;
		var _data = subscriberData;
		var _scope = scope;
		var that = this;
		this.getTopic = function() {
			return topic;
		}
		this.getConnHandle = function() {
			return sehubClient;
		}
		this.equals = function(anotherSubHandle) {
			if ((anotherSubHandle._getSubId != null) && (typeof anotherSubHandle._getSubId == "function")
				&& (anotherSubHandle.getConnHandle != null) && (typeof anotherSubHandle.getConnHandle == "function")) {
					if ((subId === anotherSubHandle._getSubId()) && (sehubClient === anotherSubHandle.getConnHandle()))
						return true;
				}
			return false;
		}
		this.isSubscribed = function() {
			return _isSubscribed;
		}
		this.unsubscribe = function(callback) {
			return sehubClient._unsubscribe(that, callback);
		}
		this.getSubscriberData = function() {
		    return _data;
		}
		this.getSubscriberScope = function() {
		    return _scope;
		}
		this._getSubId = function() {
			return subId;
		}
		this._setIsSubscribed = function(value) {
			_isSubscribed = value;
		}
		this._getCallback = function() {
			return callback;
		}
		this._getEventCallback = function() {
			return eventCallback;
		}
	}
	
	this.getPartnerOrigin = function() {
		if ( connected && seCommClient != null ) {
			var ptu = seCommClient.getParsedTunnelUrl();
			if ( ptu != null ) {
			    return ptu.scheme + "://" + ptu.host;
		    }
		}
		return null;
	}
	//-------- end of interface implemented by connHandle in Hub 1.1.

	//------- addition public interfaces not part of Hub 1.1 -----
	/**
	 * Set a callback to find out about security errors.
	 * Not part of the OpenAjax Hub 1.1 standard
	 */
	this.setSecurityErrorCallback = function(errorcallback) {
		securityErrorCallback = errorcallback;
	}
//	this.getManagerDomain = function() { 
//		if (seCommClient != null) {
//			var ptu = seCommClient.getParsedTunnelUrl();
//			if (ptu != null) return ptu.host;
//		}
//		return null;
//	}
	
	//------- private stuff ------
	/**
	 * _unsubscribe(subHandle:object, callback:function)
	 * returns a subHandle object, or null if it fails immediately.
	 */
	this._unsubscribe = function(subHandle, callback) {
		var subId = subHandle._getSubId();
        if ( ! subHandles[ subId ] ) {
            throw new Error( OpenAjax.hub.Error.NoSubscription );
        }
		subHandles[subId] = undefined;
		seCommClient.unsubscribe(subId);
		// no async callback as no confirmation message from manager
		if (callback != null) {
			callback(true, subHandle); // function(success:boolean, subHandle:object).
		}
		return subHandle;
	}
	var securityErrorCallback = undefined; // securityErrorCallback registered by the application in this component/frame
	// subscriptions: each subscription is assigned an integer id that is unique to this client
	var subCount = 0;
	// mapping the subscription ids to the SubHandles
	var subHandles=[];
	// SECommClient serving the communication between the SEHub and the SEHub client
	var seCommClient=new smash.SECommClient( clientName, logfunc );
//	var state = smash.SEHubConstants.LOADED; // initialize my state to LOADED.
    var connected = false;
	// This is used to make the object available to the private methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions. See http://www.crockford.com/javascript/private.html
	var that=this;
	var connectCallback = null;
	var disconnectCallback = null;

	/**
	 * Processes messages received by the SECommClient
	 * @param message The actual message.
	 */
	function handleIncomingMessage(message)
	{
	    if ( ! connected && message.type != smash.SECommMessage.CONNECT_ACK ) {
	        return;
	    }
	    
		switch (message.type) {
		case smash.SECommMessage.DISTRIBUTE:
			if ((message.additionalHeader != null) && (message.additionalHeader.s != null)) {
				var subs = message.additionalHeader.s;
				for (var i=0; i < subs.length; i++) {
					var subId = subs[i];
					if ((subId != null) && (subHandles[subId] != null)) {
						var eventCallback = subHandles[subId]._getEventCallback();
						if (eventCallback != null)
							eventCallback(subHandles[subId], message.topic, message.payload);
					}
				}
			}
			break;
		case smash.SECommMessage.SUBSCRIBE_ACK:
			if (message.additionalHeader != null) {
				var subId = message.additionalHeader.subId;
				var isOk =  message.additionalHeader.isOk;
				var err = message.additionalHeader.err;
				if ((subId != null) && (isOk != null)) {
					if (subHandles[subId] != null) {
						var callback = subHandles[subId]._getCallback();
						if (isOk) {
							subHandles[subId]._setIsSubscribed(true);
							if (callback != null)
								callback(true, subHandles[subId]);
						}
						else {
							if (callback != null)
								callback(false, subHandles[subId], err);
							subHandles[subId] = undefined; // unsubscribe
						}
					}
				}
			}
			// else ignore the message
			break;
		case smash.SECommMessage.CONNECT_ACK:
		    connectCallback( true );
		    break;
		case smash.SECommMessage.DISCONNECT_ACK:
		    disconnectCallback( true );
		    break;
		}
	}
	function securityListenerCallback(errorcode) {
//		var errorString = getSecurityErrorString(errorcode);
		if (securityErrorCallback != null) {
//			securityErrorCallback(errorString);
			securityErrorCallback(errorcode);
		}
		else {
			throw new Error(errorString);
		}
	}
//	function getSecurityErrorString(error) {
//		switch (error) {
//			case smash.SecurityErrors.INVALID_TOKEN: return smash.SecurityErrors.INVALID_TOKEN_MSG;
//			default: return "UNKNOWN";
//		}
//	}
    	
	// Override the SECommClient's received method with our own implementation
	seCommClient.handleIncomingMessage = handleIncomingMessage;
	seCommClient.setSecurityListener( securityListenerCallback );
}
//-----------------------------------------------------------------------------------------------
//smash.SEHubConstants = {
//
//	// Constants representing states of a component.
//	// Component State Machine: START -> LOADED -> UNLOADED
//
//	START: 0,
//	LOADED: 1,
//	UNLOADED: 2
//
//};
//-----------------------------------------------------------------------------------------------
/**
 * Constants representing the different types of attacks that can be detected and prevented by the library.
 */
smash.SecurityErrors = {


	// This error occurs when the CommLib detects a message with a different security token than the one with wich it was initialized.
	INVALID_TOKEN: 0,
//	INVALID_TOKEN_MSG: "The sender of the received message could not be verified because the received security token was not correct.",
	// This error occurs when the SEComm receives a different security token than the one that was sent by the SEComm during the loading of the component.
	TOKEN_VERIFICATION_FAILED: 1,		
//	TOKEN_VERIFICATION_FAILED_MSG: "The security token could not be verified. A different security token than the one that was sent during the loading of the component was received after loading.",
	// Phishing error
	TUNNEL_UNLOAD: 2,
//	TUNNEL_UNLOAD_MSG: "The tunnel was unloaded without the component being unloaded by the mashup application. Frame-phishing may have occured after the component was loaded successfully.",
	// Phishing error before successfull load
	COMPONENT_LOAD: 3
//	COMPONENT_LOAD_MSG: "A timeout occured before the communication channel between the component and the mashup application was set up correctly. Frame-phishing may have occured during the loading of the component."
};
//-----------------------------------------------------------------------------------------------
/**
 * The object implementing the message serializer and deserializer for use in SEComm.
 * The topic and payload are typically under application control and may contain URI reserved characters.
 * These will be percent-encoded and decoded, and the application has to deal with the composition issues
 * if it is passing in data or topics that are already percent-encoded. 
 */


smash.SECommMessage = function(){
	// The type of the message. A string
	this.type=null;
	// The topic of the message. A string
	this.topic=null;
	// The remaining header information. A JSON object
	this.additionalHeader=null;
	// The payload of the message. A string
	this.payload=null;
	// The name used in the name value pair transmission. one character for efficiency. only use a letter or number
	var typeName="y";
	var topicName="t";
	var additionalHeaderName = "h"; // other header information that is not handled by typeName and topicName
	var payloadName="p";

	/**
	 * Serializes the message into a string which can be transmitted over a communication channel.
	 * URI-encodes the topic and payload and uses "=", "&" as separators. The communication channel
	 * must not perform any URI-encoding as "=", "&" are not reserved for fragments. 
	 * If using something other than fragment messaging at the communication channel, the serialization
	 * may need to change.
	 * @returns The serialized message.
	 */
	this.serialize=function(){
		var returnValue = typeName + "=" + this.type;
		if (this.topic != null) {
			var topicString = encodeURIComponent(this.topic);
			var topicSer = "&" + topicName + "=" + topicString;  
			returnValue += topicSer;
		}
		if (this.additionalHeader != null) {
			var headerString = encodeURIComponent(JSON.stringify(this.additionalHeader));
			var headerSer = "&" + additionalHeaderName + "=" + headerString;  
			returnValue += headerSer;
		}
		if (this.payload != null) {
			var payloadString = encodeURIComponent(this.payload);
			var payloadSer = "&" + payloadName + "=" + payloadString;  
			returnValue += payloadSer;
		}
		return returnValue;
	}
	
	/**
	 * Deserializes a serialized message and initializes the objects parameters.
	 */
	this.deserialize=function(serializedMessage){
		var messageParts = serializedMessage.split("&");
		for(var i = 0; i < messageParts.length; i++){
			var nameValue = messageParts[i].split("=");
			switch(nameValue[0]){
			case typeName:
				this.type=nameValue[1];
				break;
			case topicName:
				this.topic=decodeURIComponent(nameValue[1]);
				break;
			case additionalHeaderName:
				var headerString = decodeURIComponent(nameValue[1]);
				this.additionalHeader = JSON.parse(headerString);
				break;
			case payloadName:
				this.payload=decodeURIComponent(nameValue[1]);
				break;
			}	
		}
	}	
}

// only use letters or numbers as characters

// CONNECT message
smash.SECommMessage.CONNECT="con";
smash.SECommMessage.CONNECT_ACK="cac";
// DISCONNECT message
smash.SECommMessage.DISCONNECT="xcon";
smash.SECommMessage.DISCONNECT_ACK="xac";
// PUBLISH message: additionalHeader is {f:"S"} or {f:"J"} representing that the payload is a string or JSON, 
// topic and payload are topic, payload of message
smash.SECommMessage.PUBLISH="pub"; 
// DISTRIBUTE message: additionalHeader is {f: string, s:[string, ...]} where f is defined as in the PUBLISH message, 
// and s representing subIds that should receive this message; topic and payload are as in PUBLISH message 
smash.SECommMessage.DISTRIBUTE="dis"; 
// SUSCRIBE message: additionalHeader is {subId: string}, payload==null, topic is subscription topic
smash.SECommMessage.SUBSCRIBE="sub"; 
// UNSUBSCRIBE message: additionalHeader is {subId: string}, topic==null, payload==null
smash.SECommMessage.UNSUBSCRIBE="uns";
// SUBCRIBE_ACK message: additionalHeader is {subId: string, isOk: boolean, err: string}, topic==null, payload == null
smash.SECommMessage.SUBSCRIBE_ACK="sac"; 

smash.SECommMessage.ERROR="err"; // TBD


//-----------------------------------------------------------------------------------------------
/**
 * Definitions of exceptions used by SECom
 */
smash.SECommErrors = {};
smash.SECommErrors.tunnelNotSetError = new Error ("The tunnel URI was not set. Please set the tunnel URI.");
//smash.SECommErrors.componentNotFoundError = new Error ("The component could not be identified. Please declare the component correctly.");
//smash.SECommErrors.securityTokenNotVerifiedError = new Error (smash.SecurityErrors.TOKEN_VERIFICATION_FAILED_MSG);
//smash.SECommErrors.tunnelUnloadError = new Error (smash.SecurityErrors.TUNNEL_UNLOAD_MSG);
//smash.SECommErrors.componentLoadError = new Error (smash.SecurityErrors.COMPONENT_LOAD_MSG);

/**
 * Links the SEHub and the SEHubClient together over the communication implemented by CommLib bridge
 *
 * TODO: Check if the component loading allows valid HTML.
 * TODO: Propagate the style of the enclosing tag into the iFrame
 * TODO: Check if there is a better way than polling to see if the tunnel's commLib has been registered
 */
smash.SEComm = function(){
	// The timer used to delay the phishing message. This makes sure that a page navigation does not cause phishing errors.
	// Setting it to 1 ms is enough for it not to be triggered on regular page navigations.
	var unloadTimer=1;
	// Variable storing the identifier for the setInterval if processing a registrationTimer	
	var registrationTimerProcess=null;
	var loadTimeout = 0;
	var reconnectTimerProcess = null;
	// The URI of the component being manages by this SEComm.
	var componentURI=null;
	// The commLib of the tunnel
	var commLib=null;
	// Variable storing the identifier to clear when the setInterval is called
	var commLibPoll=null;
	// The HTML id of the component for which this is a SEComm
	var componentID=null;
	// A queue for outgoing messages. This queue is used when new send requests are done while we are still sending or receiving a message.
	var queueOut=[];
	// Variable storing the identifier for the setInterval if processing an output queue
	var queueOutProcess=null;
	// Variable storing a reference to the SEHub which is managing this SEComm
	var seHUB=null;
	// The iframe in which the component is loaded
	var myIframe = null;
	// The security token used for this component
	var securityTokenParent=null;
	// Variable storing the callback to the security listener function
	var securityListener=null;
	// This is used to make the object available to the private methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions. See http://www.crockford.com/javascript/private.html
	var that=this;		
	// keeps track of the initialization
	var initialized=false;
	// logging function
	var logfunc = null;

	/**
	 * Sets the callback for security errors.
	 * 
	 * @param The callback for security errors.
	 */
	this.setSecurityListener=function(callback){
		securityListener=callback;
	}

    function insertURLParams( uri, params ) {
        var parts = uri.split( "?" );
        if ( parts.length > 1 ) {
            return parts[0] + "?" + params + "&" + parts[1];
        }
        parts = uri.split( "#" );
        if ( parts.length > 1 ) {
            return parts[0] + "?" + params + parts[1];
        }
        return uri + "?" + params;
    }
    
	/**
	 * Prepares for loading a component into an iframe.
	 * @returns The modified URI
	 */
	this.prepareForLoad=function(componentId, frameURI, seHub, loadtimeout, logFunc)
	{
	    logfunc = logFunc;
		this.log( "Parent connecting to : " + componentId );
		// Store the SEHub
		seHUB=seHub;
		// Store the component Id
		componentID=componentId;
		loadTimeout = loadtimeout;
		// Check if the tunnel is set
		if (smash.SEComm.tunnelURI==null)throw smash.SECommErrors.tunnelNotSetError;
		// modify the URI
		securityTokenParent=smash._generateSecurityToken();
		// include the token twice since the child token value does not matter yet
// XXX revert r231
//		componentURI = insertURLParams( frameURI, "id=" + encodeURIComponent(componentId) );
//		var modifiedURIWithFragment = componentURI + "#100" + securityTokenParent + securityTokenParent + "000" + encodeURIComponent(componentId) + ":" + encodeURIComponent(smash.SEComm.tunnelURI);
        // Since a server redirect does not take into account the fragment value
        // (it is not transmitted by the browser to the server), the initial
        // message must be sent as a URL param.
        componentURI = insertURLParams( frameURI, "oahm=" + smash._protocolID + ":100" + securityTokenParent + securityTokenParent + "000" + encodeURIComponent(componentId) + ":" + encodeURIComponent(smash.SEComm.tunnelURI) );
		// Make the instance available for the tunnel.
		smash.SEComm.instances[componentId]=that;	
		// Set a timer which detects if the component loaded successfully
		// We are using an interval not to lose our evaluation context.
		registrationTimerProcess=setInterval(pollForIncomingCommLibTimeout,loadTimeout);

		return componentURI;
	}

	function pollForIncomingCommLibTimeout(){
		clearInterval(registrationTimerProcess);
		registrationTimerProcess = null;
		//No CommLib has been registered.
		if ( ! commLib ) {
		     that.handleSecurityError( smash.SecurityErrors.COMPONENT_LOAD );
		}
	}
	
	function reconnectTimeout() {
		clearInterval( reconnectTimerProcess );
		that.handleSecurityError( smash.SecurityErrors.COMPONENT_LOAD );
	}

	/**
	 * Gets the scope. Should only be used by the tunnel during INIT. 
	 * @returns scope (object) the scope in which the callback needs to be called.
	 **/
	this.getScope=function(){
		return this;
	}

	/**
	 * Gets the callback. Should only be used by the tunnel during INIT. 
	 * @param c (string) the name of the callback method	 
	 **/
	this.getCallback=function(){
		return "messageReceived";
	}

	
	/**
	 * Called when the initialisaiton of the library is done and processes all messages in the queue
	 */
	this.initializationFinished=function(tunnelCommLib, token, currentClientURI, initialClientURI, tunnelWindow)
	{
		this.log( "Tunnel commLib initialization finished. Processing outgoing queue. Security token: " + token );
// XXX revert r231
//		// verify the security token and currentClientURI
//		if ((securityTokenParent!=token) || (initialClientURI!=componentURI)) {
        // verify the security token
        if (securityTokenParent!=token) {
			that.handleSecurityError(smash.SecurityErrors.TOKEN_VERIFICATION_FAILED);
			return false;
		}
		else {
			commLib=tunnelCommLib;		
			initialized=true;
			this.log( "Token verified." );
			// register the onunload handler
			tunnelWindow.onunload=tunnelUnloadHandler;
			// switch the state to loaded in the seHUB. 
			seHUB.componentLoaded(componentID, currentClientURI);
			// process the current outgoing queue.
			while (queueOut.length>0)commLib.send(queueOut.shift());
			return true;
		}
	}
	
	this.prepareForUnload = function() {
		// stop all timers
		if (registrationTimerProcess != null) {
			clearInterval(registrationTimerProcess);
			registrationTimerProcess = null;
		}
	}
	
	function securityListenerClosure(error, componentId) {
		return function() {
			securityListener(error, componentId);
		}
	}

	this.handleSecurityError = function( error ) {
	    // if we have a timeout error, then overwrite initializationFinished()
	    // to return false by default, in order to prevent client connection
	    if ( error == smash.SecurityErrors.COMPONENT_LOAD ) {
	        this.initializationFinished = function() {
	            return false;
	        }
	    }
	    
		if (securityListener==null){
			throw new Error (error);							
		}
		else{
			securityListener(error,componentID);
		}
		return;
	}

	/** 
	 * 
	 */
	function tunnelUnloadHandler(){		
		if (securityListener==null){
			setTimeout("throw tunnelUnloadError;", unloadTimer);
		}
		else{
			setTimeout(securityListenerClosure(smash.SecurityErrors.TUNNEL_UNLOAD, componentID), unloadTimer);
		}						
	}
	
	/**
	 * Function processing the incomming data from commLib
	 *
	 * @param message The message containing the incomming data
	 */
	this.messageReceived=function (message){
		var msg=new smash.SECommMessage();
		msg.deserialize(message);
		switch(msg.type){
		case smash.SECommMessage.PUBLISH:
			if (msg.additionalHeader != null) {
				var payload = msg.payload;
				if (msg.additionalHeader.f == "J")
					payload = JSON.parse(msg.payload);
				seHUB.publishInternal(componentID, msg.topic, payload);
			} // else no additionalHeader defining the payload format. hence ignore the message
			break;
		case smash.SECommMessage.SUBSCRIBE:
			if (msg.additionalHeader != null)  {
			    var isOk = true;
			    var errMsg = "";
			    try {
				    seHUB.subscribeInternal(componentID, msg.additionalHeader.subId, msg.topic);
			    } catch( e ) {
			        isOk = false;
			        errMsg = e.message;
			    }
				var msgack = new smash.SECommMessage();
				msgack.type = smash.SECommMessage.SUBSCRIBE_ACK;
				msgack.additionalHeader={subId: msg.additionalHeader.subId, isOk: isOk, err: errMsg};
				send(msgack.serialize());
			}
			break;
		case smash.SECommMessage.UNSUBSCRIBE:
			if (msg.additionalHeader != null)
				seHUB.unsubscribeInternal(componentID, msg.additionalHeader.subId);
			break;
		case smash.SECommMessage.CONNECT:
		    clearInterval( reconnectTimerProcess );
		    // switch the state to loaded in the seHUB. 
			seHUB.componentLoaded( componentID, msg.payload );
		    // send acknowledgement
		    var msg = new smash.SECommMessage();
		    msg.type = smash.SECommMessage.CONNECT_ACK;
		    send( msg.serialize() );
			break;
		case smash.SECommMessage.DISCONNECT:
		    seHUB.disconnect( componentID );
		    // Set a timer which detects if the component reloaded
    		// We are using an interval not to lose our evaluation context.
    		reconnectTimerProcess = setInterval( reconnectTimeout, loadTimeout );
		    // send acknowledgement
		    var msg = new smash.SECommMessage();
		    msg.type = smash.SECommMessage.DISCONNECT_ACK;
		    send( msg.serialize() );
		    break;
		}
	}
	/**
	 * Sends a published message to the partner component
	 */
	this.distribute=function(topic, matchingSubs, payload){
		var msg=new smash.SECommMessage();
		msg.type=smash.SECommMessage.DISTRIBUTE;
		msg.topic=topic;
		msg.additionalHeader = {s: matchingSubs};
		if ((typeof payload) == "string") {
			msg.additionalHeader.f = "S";
			msg.payload=payload;
		}
		else {
			msg.additionalHeader.f = "J";
			msg.payload = JSON.stringify(payload);
		}	
		send(msg.serialize());
	}

	function send(message) {
		// Queue the message if sending or if there is no communication partner yet
		if (initialized==false){
			queueOut.push(message);
		}
		else{
			commLib.send(message);
		}
	}
	
	this.log = function( msg )
	{
	    logfunc( msg );
	}
}

// Static array which contains the list of the currently loaded instances. The array is indexed by the url of the child component. 
smash.SEComm.instances=[];

//-----------------------------------------------------------------------------------------------

/**
 * SEHubClient implementation linking the SEComm together with the component side logic.
 */
smash.SECommClient = function( clientName, logfunc )
{
	// Storing the CommLib used for communicating
	var controllers=[];
	controllers["child"]=this;
	var commLib=new smash.CommLib(true, controllers, clientName);
	// This is used to make the object available to the private methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions. See http://www.crockford.com/javascript/private.html
	var that=this;
	// A queue for outgoing messages. This queue is used when new send requests are done while we are still sending or receiving a message.
	var queueOut=[];
	// keeps track of the initialization
	var initialized=false;
	var securityListener=null;
	var jsonPayloadHeader = {f: "J"};
	var stringPayloadHeader = {f: "S"};
	var parsedTunnelUrl = null;	
	/**
	 * Publishes a message to a certain topic
	 * @param topic string
	 * @param data JSON|string
	 */
	this.publish=function(topic, data){
		var msg=new smash.SECommMessage();
		msg.type=smash.SECommMessage.PUBLISH;
		msg.topic=topic;
		if ((typeof data) == "string") {
			msg.additionalHeader = stringPayloadHeader;
			msg.payload=data;
		}
		else {
			msg.additionalHeader = jsonPayloadHeader;
			msg.payload = JSON.stringify(data);
		}	
		send(msg.serialize());
	}

	/**
	 * subscribes to a certain topic
	 */
	this.subscribe=function(subId, topic){
		var msg=new smash.SECommMessage();
		msg.type=smash.SECommMessage.SUBSCRIBE;
		msg.topic=topic;
		msg.additionalHeader = {subId: subId};
		send(msg.serialize());
	}
	
	this.connect = function( callback ) {
        if ( initialized ) {
            var msg = new smash.SECommMessage();
            msg.type = smash.SECommMessage.CONNECT;
            msg.payload = window.location.href.split("#")[0];
            send( msg.serialize() );
            return;
        }
        connectCallback = callback;
	}
	
	this.disconnect = function() {
	    var msg = new smash.SECommMessage();
	    msg.type = smash.SECommMessage.DISCONNECT;
	    send( msg.serialize() );
	}
	
	/**
	 * Called when the initialisaiton of the library is done and processes all messages in the queue
	 */
	this.initializationFinished=function(tunnelUrl)
	{
		this.log( "Initialization finished. Processing outgoing queue." );
		parsedTunnelUrl = new ParsedUrl(tunnelUrl);

		initialized=true;
		connectCallback( true );
		while (queueOut.length>0)commLib.send(queueOut.shift());
	}
	this.getParsedTunnelUrl=function() { return parsedTunnelUrl; }

	var _regex = new RegExp("^((http|https):)?(//([^/?#:]*))?(:([0-9]*))?([^?#]*)(\\?([^#]*))?");
	function ParsedUrl(url) {
		var matchedurl = url.match(_regex);
		this.scheme = (matchedurl[2] == "") ? null : matchedurl[2];
		this.host = (matchedurl[4] == "") ? null : matchedurl[4];
		this.port = (matchedurl[6] == "") ? null : matchedurl[6];
		this.path = (matchedurl[7] == "") ? null : matchedurl[7];
		this.query = (matchedurl[8] == "") ? null : matchedurl[8];
	}

	/**
	 * unsubscribes
	 */
	this.unsubscribe=function(subId){
		var msg=new smash.SECommMessage();
		msg.type=smash.SECommMessage.UNSUBSCRIBE;
		msg.additionalHeader={subId: subId};
		send(msg.serialize());
	}
	
	function send(message) {
		// Queue the message if sending or if there is no communication partner yet
		if (initialized==false){
			queueOut.push(message);
		}
		else{
			commLib.send(message);
		}
	}


	/**
	 * Function processing the incomming data from commLib
	 *
	 * @param message The message containing the incomming data
	 */
	this.messageReceived=function (message){
		var msg=new smash.SECommMessage();
		msg.deserialize(message);
		// parse the JSON payload
		if (msg.type == smash.SECommMessage.DISTRIBUTE) {
			var header = msg.additionalHeader;
			if ((header != null) && (header.f == "J"))
				msg.payload = JSON.parse(msg.payload);
		} 
// For now, pass all messages to handleIncomingMessage()		
//		if ((msg.type == smash.SECommMessage.DISTRIBUTE) || (msg.type == smash.SECommMessage.SUBSCRIBE_ACK))
			that.handleIncomingMessage(msg);
	}

	
	this.handleSecurityError=function (error){
		if (securityListener==null){
			throw new Error (error);							
		}
		else{
			securityListener( error, clientName );
		}
		return;
	}


	/**
	 * Sets the callback for security errors.
	 * 
	 * @param The callback for security errors.
	 */
	this.setSecurityListener=function(callback){
		securityListener=callback;
	}

	/**
	 * This method is the location for the callback to the SECommClient library.
	 * The application using this library overrides this method with its own implementation.
	 * HACK: this is terrible from a layering perspective. Ideally all message formatting details, such
	 * as header formats should be handled at this layer alone.
	 * The default behavior is to alert a message.
	 *
	 * @param message The actual message.
	 */
	this.handleIncomingMessage=function(message){
		alert("SECommClient\n\nTopic: " + message.topic + "\n\nPayload: " + message.payload);
	}
	
	this.log = function( msg ) {
	    logfunc( msg );
	}
}

/**
 * Provides the low level communication layer.
 * @param child (boolean) indicating if this is a child iframe or not.  
 * @param controllers (object []) an array indexed by the clientName of objects implementing the controller interface.
 * @param clientName - only explicitly passed for the child iframe
 * 
 * controller.messageReceived - called when the commlib recieves an incomming message.
 * controller.initializationFinished - called when the commlib finished its initialzation.
 * controller.handleSecurityError - called when a security error occurs.
 * 
 */
smash.CommLib=function(child, controllers, clientName){
    /**BEGIN of communcation protocol **/       
    /*
      Message format:
     | Message Type | Message Sequence Number | Security Token Parent | Security Token Child | ACK          | ACK Message Sequence Number   | Payload         |
     | 1 character  | 2 characters            |  x characters         | x characters         | 1 character  | 2 characters                  | varable length  | 
    */
	// Init message payload=communication partner url
	var INIT="1";		
	// An ack message without any payload. The reciever is not supposed to ack this message therefore the message sequence number will be 00.
	var ACK="2";		
	// The part message indicates that this is a message that needed to be split up. It will contain the payload of a part of the total message.
	var PART="3";
	// The end message indicates that this is the last part of a split up message. The full message has arrived after processing this message.
	var END="4";		
	
	/** END of communcation protocol **/
	// This is used to make the object available to the private methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions. See http://www.crockford.com/javascript/private.html
	var that=this;		
	// polling and queue processing interval
	var interval=100;
	// The maximul length of a URL. If the message is longer it will be split into different parts.
	var urlLimit = 4000;
	// Protocol overhead excluding security token overhead
	var protocolOverhead=6;
	// Need to do an acknowledgement
	var ack=0;
	// Raw incoming data
	var currentHash=null;
	// The newly decoded incoming message
	var messageIn=null;
	// The last decoded incoming message
	var previousIn=null;
	// The currently transmitted message
	var messageOut=null;
	// The previously transmitted message
	var previousOut=null;		
	// The url of the  partner
	var partnerURL=null;
	// The window object of the partner
	var partnerWindow=null;
	// A queue for outgoing messages. This queue is used when new send requests are done while we are still sending or recieving a message.
	var queueOut=[];
	// Storing the last sent message number
	var msn=00;
	// Buffer for storing the incoming message parts
	var messageBuffer="";
	// Variable storing the timerId of the message timer.
	var timerId=null;
	// Two security tokens - One created by the parent frame (the manager) and one by the child frame (the client)
	var securityTokenParent=null;
	var securityTokenChild=null;
	// 
	var controller = null;
	var logQ = [];
	
	/**
	 * Sends a message to the communication partner
	 * @param message (string) the message that needs to be delivered to the communication partner
	 */
	this.send=function(message){
		// check if we are properly initialized
		if (partnerURL==null){
			log( "Trying to send without proper initialization. Message will be discarded. " +  message );
			return;
		}
		log( "Sending: " + message );
		// URL encode the message
		// var encodedMessage=encodeURIComponent(message);
		var encodedMessage=message;
		// determine the payload size
		var payloadLength=urlLimit-protocolOverhead-smash._securityTokenOverhead-partnerURL.length;
		// DEBUG LARGE MESSAGES 
		//if(oah_ifr_debug)payloadLength=1;
		// Split up into separate messages if necessary
		var currentMessage=encodedMessage;
		while (currentMessage.length>0){
			// split up and put in output queue
			var part=currentMessage.substr(0,payloadLength);
			currentMessage=currentMessage.substr(payloadLength);
			if (currentMessage==0){
				queueOut.push({type: END, payload: part});
			}
			else{
				queueOut.push({type: PART, payload: part});
			}
		}
	}
	
	/**
	 * The timer triggering the flow of messages through the system.
	 */
	function messageTimer(){
		// check if there is a new message
		if(checkMessage()){
			// check if it can be decoded properly
			if (decodeMessage()){
				// check if it is conform the security requirements
				if (checkSecurity()){
					// process it
					processMessage();
				}					
			}				
		}
		// Only sent if an ack was received for the last transmitted message.
		if (checkAck()){
			// send anything that might be in the out queue
			sendMessage();
		}
	}
	
	/**
	 * Returns true if the previously transmitted message was acknowledged.
	 * 
	 * Possible exception situations to take into account: 
	 * - One of the parties takes two turns in a row.
	 *   p   p   c   
	 * c p1  - 
	 * p         p1'
	 * 
	 *   c   p   p   c
	 * c     ac1 p1  
	 * p c1          p1'
 	 * 
	 */
	function checkAck(){
		// No ack is expected for an ack.
		if (previousOut.type==ACK)return true;
		// Ack is received. 
		if ((previousOut.msn==messageIn.ackMsn) && (messageIn.ack==1)) return true;
		// Wait for the ack to arrive.
		log( "Waiting for ACK : " + previousOut.msn );
		return false;
	}
	
	/**
	 * Helper method providing a new  message sequence number
	 * @returns (string) the new sequence number
	 */
	function getNewMsn(){
		msn++;
		if (msn==100) msn=0;
		if (msn<10) return "0" + msn;
		return "" + msn;			
	}
	
	/**
	 * Checks the information after the hash to see if there is a new incomming message.
	 */
	function checkMessage(){
		//Can't use location.hash because at least Firefox does a decodeURIComponent on it.
		var urlParts = window.location.href.split("#");
		if(urlParts.length == 2){
			var newHash = urlParts[1];
			if(newHash!="" && newHash != currentHash){
				currentHash = newHash;
				return true;
			}
		}
		return false;
	}

	/**
	 * Decodes an incomming message and checks to see if it is syntactially valid.
	 */		
	function decodeMessage() {
// new RegExp( "(\\d)(\\d{2})(.{" + smash._securityTokenLength + "})(.{" + smash._securityTokenLength + "})(\\d)(\\d{2})(.*)" )
		var type=currentHash.substr(0,1);
		var msn=currentHash.substr(1,2);
		var nextStart = 3;
		var tokenParent=currentHash.substr(nextStart,smash._securityTokenLength);
		nextStart += smash._securityTokenLength;
		var tokenChild=currentHash.substr(nextStart,smash._securityTokenLength);
		nextStart += smash._securityTokenLength;
		var ack=currentHash.substr(nextStart,1);
		nextStart += 1;
		var ackMsn=currentHash.substr(nextStart,2);
		nextStart += 2;
		// The payload needs to stay raw since the uri decoding needs to happen on the concatenated data in case of a large message
		var payload=currentHash.substr(nextStart);
		log( "In : Type: " + type + " msn: " + msn + " tokenParent: " + tokenParent + " tokenChild: " + tokenChild + " ack: " + ack + " msn: " + ackMsn + " payload: " + payload );
		messageIn={type: type, msn: msn, tokenParent: tokenParent, tokenChild: tokenChild, ack: ack, ackMsn: ackMsn, payload: payload};
		return true;
	}

	/**
	 * Check if there have been any security breaches in the message.
	 */				
	function checkSecurity(){			
		// Check the security tokens
		if (messageIn.type!=INIT && (messageIn.tokenParent!=securityTokenParent || messageIn.tokenChild!=securityTokenChild)){
			log( "Security token error: Invalid security token received. The message will be discarded." );
			handleSecurityError(smash.SecurityErrors.INVALID_TOKEN);
			return false;
		}		
		// Attacks should never pass the security check. Code below is to debug the implementation.
//		if(oah_ifr_debug){
//			if (messageIn.type!=INIT && messageIn.type!=ACK && messageIn.type!=PART && messageIn.type!=END){
//				if(oah_ifr_debug)debug("Syntax error: Message Type. The message will be discarded.");
//				return false;
//			}
//			if (!(messageIn.msn>=0 && messageIn.msn<=99)){
//				if(oah_ifr_debug)debug("Syntax error: Message Sequence Number. The message will be discarded.");
//				return false;
//			}
//			if (!(messageIn.ack==0 || messageIn.ack==1)){
//				if(oah_ifr_debug)debug("Syntax error: ACK. The message will be discarded.");
//				return false;
//			}
//			if (!(messageIn.ackMsn>=0 && messageIn.ackMsn<=99)){
//				if(oah_ifr_debug)debug("Syntax error: ACK Message Sequence Number. The message will be discarded.");
//				return false;
//			}
//		}
		return true;
	}

	/**
	 * Process the incoming message.
	 */						
	function processMessage(){
		ack=1;
		// The child is initialized as soon as there is an ack for the init message sent by the child.
		if (messageIn.type!=INIT && child && previousOut.type==INIT && messageIn.ack=="1" && previousOut.msn==messageIn.ackMsn) {
		    controller.initializationFinished(partnerURL);
	    }
							
		// Call the actual processing functions
		switch(messageIn.type){
			case INIT:
				processInit();
				break;
			case ACK:
				processAck();
				break;
			case PART:
				processPart();
				break;
			case END:
				processEnd();
				break;					
		}
		// Set the processed message as the previousIn message
		previousIn=messageIn;		
	}

	/**
	 * Implementation of the INIT message type
	**/
	function processInit(){
		var parts = messageIn.payload.split(":");
		var cname = decodeURIComponent(parts[0]);
		partnerURL=decodeURIComponent(parts[1]);
		securityTokenParent=messageIn.tokenParent;
		securityTokenChild=messageIn.tokenChild;
		// Initialize a component
		if (child){
			if (clientName != null) cname = clientName; // override what is read from the URL
			// generate a real security token for the child
			securityTokenChild = smash._generateSecurityToken();
			// GUI which will be used to name the iFrame tunnel.
			var tunnelGUID="3827816c-f3b1-11db-8314-0800200c9a66";
			// Generate the hidden iframe for communicating
			var iframe = document.createElement("iframe");
			var currentClientURI = encodeURIComponent(window.location.href.split("#")[0]);
			var initialClientURI = currentClientURI;
//			if (smash._initialClientURI) {
//				initialClientURI = encodeURIComponent(smash._initialClientURI);
//			}
			var initpayload = encodeURIComponent(cname) + ":" + currentClientURI + ":" + initialClientURI;

			// sending an ack for msn "00" to the tunnel, since have processed the INIT message,
			// and so that the INIT message the component is sending to the tunnel will result
			// in an ack to be sent back.
            // XXX Since server redirection breaks hash communication (the server does
            //  not receive the fragment value, therefore the final URL does not contain
            //  this information), the initial message is transmitted as a URL param.
			partnerURL += (partnerURL.indexOf("?") != -1 ? "&" : "?") + "oahm=100" + securityTokenParent + securityTokenChild + "100" + initpayload;
			iframe.src = partnerURL;
			iframe.name=tunnelGUID;
			iframe.id=tunnelGUID;
			document.body.appendChild(iframe);
			iframe.style.position = "absolute";
			iframe.style.left = iframe.style.top = "-10px";
			iframe.style.height = iframe.style.width = "1px";
			iframe.style.visibility = "hidden";
			// We do not send an ack directly to the parent frame since it is impossible to directly communicate with it in IE7
			// The ack is done indirectly when the registerTunnelCommLib is done
			ack=0;
			// set up the partner window
			partnerWindow=window.frames[tunnelGUID];
			// store the last sent message - will be used to detect intialization and for detecting security breaches
			previousOut={type: INIT, msn: "00", tokenParent: securityTokenParent, tokenChild: securityTokenChild, ack: "0", ackMsn: "00", payload: initpayload}; // only using type and msn of previousOut. presumably the rest is for FDK's retransmit stuff? should get rid of this complexity
			// set the controller for this component
			controller=controllers["child"];
		}
		// Initialize a tunnel
		else{
			var initialClientURI = decodeURIComponent(parts[2]);
			// set up the partner window
			partnerWindow=window.parent;
			// set the controller for this component
			controller=controllers[cname];
			var success = controller.initializationFinished(that, securityTokenParent, partnerURL, initialClientURI, window);
			if (!success) ack = 0; // don't send an ack signalling the completion of connection setup.
			// store the last sent message - will be used to detect intialization and for detecting security breaches
			previousOut={type: INIT, msn: "00", tokenParent: securityTokenParent, tokenChild: securityTokenChild, ack: "0", ackMsn: "00", payload: (encodeURIComponent(cname) + ":" + encodeURIComponent(window.location.href.split("#")[0]))}; // only using type and msn of previousOut. presumably the rest is for FDK's retransmit stuff? should get rid of this complexity				
		}
		if (partnerWindow==null) {
			log( "Init failed." );
		}
	}	
			
	/**
	 * Implementation of the ACK message type
	**/
	function processAck(){
		// do not ack an ack
		ack=0;
	}

	/**
	 * Implementation of the PART message type
	**/
	function processPart(){
		// Process message
		messageBuffer+=messageIn.payload;
	}		
	
	/**
	 * Implementation the END message type
	**/
	function processEnd(){
		// Process message
		messageBuffer+=messageIn.payload;
		// messageBuffer=decodeURIComponent(messageBuffer);
		log( "Received: " + messageBuffer );
		controller.messageReceived(messageBuffer);
		messageBuffer="";
	}
	
	/**
	 * Send a reply to the incoming message.
	 */								
	function sendMessage(){						
		// If there is nothing in the queue and an ack needs to be sent put the ack on the queue;
		if (queueOut.length==0 && ack==1){
			// The correct values will be filled in later. Just push a clean ack message
			queueOut.push({type: ACK, payload: ""});
		}
		// Process the output queue
		if (queueOut.length!=0){
			messageOut=queueOut.shift();
			// Fill in the security token
			messageOut.tokenParent=securityTokenParent;
			messageOut.tokenChild=securityTokenChild;
			// Get a new sequence number
			messageOut.msn=getNewMsn();
			// Fill in the right ack values 
			// The protocol keeps acking the last received message to ensure that there are no 
			// problems with overwriting a pure ack message. Which could happen because there is 
			// no waiting for an ack of an ack.			
			messageOut.ack="1";
			messageOut.ackMsn=previousIn.msn;
			// turn of the ack
			ack=0;			
			writeToPartnerWindow();
		}
	}				
	
	/**
	 * Writes the message to the partner window's fragment id
	**/		
	function writeToPartnerWindow(){			
		var url = partnerURL + "#" + messageOut.type + messageOut.msn + messageOut.tokenParent + messageOut.tokenChild + messageOut.ack + messageOut.ackMsn + messageOut.payload;
		partnerWindow.location.replace(url);
		previousOut=messageOut;
		log( "Out: Type: " + messageOut.type + " msn: " + messageOut.msn + " tokenParent: " + messageOut.tokenParent + " tokenChild: " + messageOut.tokenChild + " ack: " + messageOut.ack + " msn: " + messageOut.ackMsn + " payload: " + messageOut.payload );
	}		
	
	/**
	 * Default handler of the security listener. If a security error occurs, the CommLib is switched off. And communication is no longer possible.
	 * 
	 */
	function handleSecurityError(error){
		// Stop the communication
		clearInterval(timerId);	
		// If there	is a securityListener inform the controller of what happened.
		controller.handleSecurityError(error);
	}
	
	function log( msg )
	{
	    if ( controller ) {
	        while ( logQ.length > 0 ) {
	            controller.log( logQ.shift() );
	        }
	        controller.log( msg );
	    } else {
	        logQ.push( msg );
	    }
	}
		
	// Start listening for incoming messages
	timerId=setInterval(messageTimer, interval);
};

})(); // end closure
