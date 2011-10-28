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
 * Create a new Inline Container.
 * @constructor
 * @extends OpenAjax.hub.Container
 *
 * InlineContainer implements the Container interface to provide a container
 * that places components within the same browser frame as the main mashup
 * application. As such, this container does not isolate client components into
 * secure sandboxes.
 * 
 * @param {OpenAjax.hub.ManagedHub} hub
 *    Managed Hub instance to which this Container belongs
 * @param {String} clientID
 *    A string ID that identifies a particular client of a Managed Hub. Unique
 *    within the context of the ManagedHub.
 * @param {Object} params  
 *    Parameters used to instantiate the InlineContainer.
 *    Once the constructor is called, the params object belongs exclusively to
 *    the InlineContainer. The caller MUST not modify it.
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
 *
 * @throws {OpenAjax.hub.Error.BadParameters}   if required params are not
 *    present or null
 * @throws {OpenAjax.hub.Error.Duplicate}   if a Container with this clientID
 *    already exists in the given Managed Hub
 * @throws {OpenAjax.hub.Error.Disconnected}   if ManagedHub is not connected
 */
OpenAjax.hub.InlineContainer = function( hub, clientID, params )
{
    if ( ! hub || ! clientID || ! params ||
            ! params.Container || ! params.Container.onSecurityAlert ) {
        throw new Error(OpenAjax.hub.Error.BadParameters);
    }
    
    this._params = params;
    this._hub = hub;
    this._id = clientID;
    this._onSecurityAlert = params.Container.onSecurityAlert;
    this._onConnect = params.Container.onConnect ? params.Container.onConnect : null;
    this._onDisconnect = params.Container.onDisconnect ? params.Container.onDisconnect : null;
    this._scope = params.Container.scope || window;
    
    if ( params.Container.log ) {
        var scope = this._scope;
        var logfunc = params.Container.log;
        this._log = function( msg ) {
            logfunc.call( scope, "InlineContainer::" + clientID + ": " + msg );
        };
    } else {
        this._log = function() {};
    }
    
    this._connected = false;
    this._subs = [];
    this._subIndex = 0;

    hub.addContainer( this );
}

    /*** OpenAjax.hub.Container interface implementation ***/

OpenAjax.hub.InlineContainer.prototype.getHub = function() {
	return this._hub;
};

OpenAjax.hub.InlineContainer.prototype.sendToClient = function( topic, data, subscriptionID )
{
    if ( this.isConnected() ) {
        var sub = this._subs[ subscriptionID ];
        try {
            sub.cb.call( sub.sc, topic, data, sub.d );
        } catch( e ) {
            OpenAjax.hub._debugger();
            this._client._log( "caught error from onData callback to HubClient.subscribe(): " + e.message );
        }
    }
}

OpenAjax.hub.InlineContainer.prototype.remove = function()
{
    if ( this.isConnected() ) {
        this._disconnect();
    }
}

OpenAjax.hub.InlineContainer.prototype.isConnected = function()
{
    return this._connected;
}

OpenAjax.hub.InlineContainer.prototype.getClientID = function()
{
    return this._id;
}

OpenAjax.hub.InlineContainer.prototype.getPartnerOrigin = function()
{
    if ( this._connected ) {
        return window.location.protocol + "//" + window.location.hostname;
    }
    return null;
}

OpenAjax.hub.InlineContainer.prototype.getParameters = function()
{
    return this._params;
}

    /*** OpenAjax.hub.HubClient interface implementation ***/

OpenAjax.hub.InlineContainer.prototype.connect = function( client, onComplete, scope )
{
    if ( this._connected ) {
        throw new Error( OpenAjax.hub.Error.Duplicate );
    }
    
    this._connected = true;
    this._client = client;
    
    if ( this._onConnect ) {
        try {
            this._onConnect.call( this._scope, this );
        } catch( e ) {
            OpenAjax.hub._debugger();
            this._log( "caught error from onConnect callback to constructor: " + e.message );
        }
    }
    
    this._invokeOnComplete( onComplete, scope, client, true );
}

OpenAjax.hub.InlineContainer.prototype.disconnect = function( client, onComplete, scope )
{
    if ( !this._connected ) {
        throw new Error( OpenAjax.hub.Error.Disconnected );
    }
    
    this._disconnect();

    if ( this._onDisconnect ) {
        try {
            this._onDisconnect.call( this._scope, this );
        } catch( e ) {
            OpenAjax.hub._debugger();
            this._log( "caught error from onDisconnect callback to constructor: " + e.message );
        }
    }
    
    this._invokeOnComplete( onComplete, scope, client, true );
}

    /*** OpenAjax.hub.Hub interface implementation ***/

OpenAjax.hub.InlineContainer.prototype.subscribe = function( topic, onData, scope, onComplete, subscriberData )
{
    this._assertConn();
    this._assertSubTopic( topic );
    if ( ! onData ) {
        throw new Error( OpenAjax.hub.Error.BadParameters );
    }
    
    var subID = "" + this._subIndex++;
    var success = false;
    var msg = null;
    try {
        var handle = this._hub.subscribeForClient( this, topic, subID );
        success = true;
    } catch( e ) {
        // failure
        subID = null;
        msg = e.message;
    }
    
    scope = scope || window;
    if ( success ) {
        this._subs[ subID ] = { h: handle, cb: onData, sc: scope, d: subscriberData };
    }
    
    this._invokeOnComplete( onComplete, scope, subID, success, msg );
    return subID;
}

OpenAjax.hub.InlineContainer.prototype.publish = function( topic, data )
{
    this._assertConn();
    this._assertPubTopic( topic );
    this._hub.publishForClient( this, topic, data );
}

OpenAjax.hub.InlineContainer.prototype.unsubscribe = function( subscriptionID, onComplete, scope )
{
    this._assertConn();
    if ( typeof subscriptionID === "undefined" || subscriptionID == null ) {
        throw new Error( OpenAjax.hub.Error.BadParameters );
    }
    var sub = this._subs[ subscriptionID ];
    if ( ! sub ) 
        throw new Error( OpenAjax.hub.Error.NoSubscription );    
    this._hub.unsubscribeForClient( this, sub.h );
    delete this._subs[ subscriptionID ];
    
    this._invokeOnComplete( onComplete, scope, subscriptionID, true );
}

OpenAjax.hub.InlineContainer.prototype.getSubscriberData = function( subID )
{
    this._assertConn();
    return this._getSubscription( subID ).d;
}

OpenAjax.hub.InlineContainer.prototype.getSubscriberScope = function( subID )
{
    this._assertConn();
    return this._getSubscription( subID ).sc;
}

    /*** PRIVATE FUNCTIONS ***/

OpenAjax.hub.InlineContainer.prototype._invokeOnComplete = function( func, scope, item, success, errorCode )
{
    if ( func ) { // onComplete is optional
        try {
            scope = scope || window;
            func.call( scope, item, success, errorCode );
        } catch( e ) {
            OpenAjax.hub._debugger();
            // _invokeOnComplete is only called for client interfaces (Hub and HubClient)
            this._client._log( "caught error from onComplete callback: " + e.message );
        }
    }
}

OpenAjax.hub.InlineContainer.prototype._disconnect = function()
{
    for ( var subID in this._subs ) {
        this._hub.unsubscribeForClient( this, this._subs[subID].h );
    }
    this._subs = [];
    this._subIndex = 0;
    this._connected = false;
}

OpenAjax.hub.InlineContainer.prototype._assertConn = function()
{
    if ( ! this._connected ) {
        throw new Error( OpenAjax.hub.Error.Disconnected );
    }
}

OpenAjax.hub.InlineContainer.prototype._assertPubTopic = function(topic) 
{
    if ((topic == null) || (topic == "") || (topic.indexOf("*") != -1) ||
        (topic.indexOf("..") != -1) ||  (topic.charAt(0) == ".") ||
        (topic.charAt(topic.length-1) == "."))
    {
        throw new Error(OpenAjax.hub.Error.BadParameters);
    }
}

OpenAjax.hub.InlineContainer.prototype._assertSubTopic = function(topic) 
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

OpenAjax.hub.InlineContainer.prototype._getSubscription = function( subID )
{
    var sub = this._subs[ subID ];
    if ( sub ) {
        return sub;
    }
    throw new Error( OpenAjax.hub.Error.NoSubscription );
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Create a new InlineHubClient.
 * @constructor
 * @extends OpenAjax.hub.HubClient
 * 
 * @param {Object} params 
 *    Parameters used to instantiate the HubClient.
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
 * @param {OpenAjax.hub.InlineContainer} params.InlineHubClient.container
 *     Specifies the InlineContainer to which this HubClient will connect
 *  
 * @throws {OpenAjax.hub.Error.BadParameters} if any of the required
 *     parameters are missing
 */
OpenAjax.hub.InlineHubClient = function( params )
{
    if ( ! params || ! params.HubClient || ! params.HubClient.onSecurityAlert ||
            ! params.InlineHubClient || ! params.InlineHubClient.container ) {
        throw new Error(OpenAjax.hub.Error.BadParameters);
    }
    
    this._params = params;
    this._onSecurityAlert = params.HubClient.onSecurityAlert;
    this._scope = params.HubClient.scope || window;
    this._container = params.InlineHubClient.container;
    
    if ( params.HubClient.log ) {
        var id = this._container.getClientID();
        var scope = this._scope;
        var logfunc = params.HubClient.log;
        this._log = function( msg ) {
            logfunc.call( scope, "InlineHubClient::" + id + ": " + msg );
        };
    } else {
        this._log = function() {};
    }
}

 /*** OpenAjax.hub.HubClient interface implementation ***/

/**
 * Requests a connection to the ManagedHub, via the InlineContainer
 * associated with this InlineHubClient.
 * 
 * If the Container accepts the connection request, this HubClient's 
 * state is set to CONNECTED and the HubClient invokes the 
 * onComplete callback function.
 * 
 * If the Container refuses the connection request, the HubClient
 * invokes the onComplete callback function with an error code. 
 * The error code might, for example, indicate that the Container 
 * is being destroyed.
 * 
 * If the HubClient is already connected, calling connect will cause
 * the HubClient to immediately invoke the onComplete callback with
 * the error code OpenAjax.hub.Error.Duplicate.
 * 
 * @param {Function} [onComplete]
 *     Callback function to call when this operation completes.
 * @param {Object} [scope]  
 *     When the onComplete function is invoked, the JavaScript "this"
 *     keyword refers to this scope object.
 *     If no scope is provided, default is window.
 *    
 * In this implementation of InlineHubClient, this function operates 
 * SYNCHRONOUSLY, so the onComplete callback function is invoked before 
 * this connect function returns. Developers are cautioned that in  
 * IframeHubClient implementations, this is not the case.
 * 
 * A client application may call InlineHubClient.disconnect and then call
 * InlineHubClient.connect to reconnect to the Managed Hub.
 */
OpenAjax.hub.InlineHubClient.prototype.connect = function( onComplete, scope )
{
    this._container.connect( this, onComplete, scope );
}

/**
 * Disconnect from the ManagedHub
 * 
 * Disconnect immediately:
 * 
 * 1. Sets the HubClient's state to DISCONNECTED.
 * 2. Causes the HubClient to send a Disconnect request to the 
 * 		associated Container. 
 * 3. Ensures that the client application will receive no more
 * 		onData or onComplete callbacks associated with this 
 * 		connection, except for the disconnect function's own
 * 		onComplete callback.
 * 4. Automatically destroys all of the HubClient's subscriptions.
 * 	
 * @param {Function} [onComplete]
 *     Callback function to call when this operation completes.
 * @param {Object} [scope]  
 *     When the onComplete function is invoked, the JavaScript "this"
 *     keyword refers to the scope object.
 *     If no scope is provided, default is window.
 *    
 * In this implementation of InlineHubClient, the disconnect function operates 
 * SYNCHRONOUSLY, so the onComplete callback function is invoked before 
 * this function returns. Developers are cautioned that in IframeHubClient 
 * implementations, this is not the case.   
 * 
 * A client application is allowed to call HubClient.disconnect and 
 * then call HubClient.connect in order to reconnect.
 */
OpenAjax.hub.InlineHubClient.prototype.disconnect = function( onComplete, scope )
{
    this._container.disconnect( this, onComplete, scope );
}

OpenAjax.hub.InlineHubClient.prototype.getPartnerOrigin = function()
{
    return this._container.getPartnerOrigin();
}

OpenAjax.hub.InlineHubClient.prototype.getClientID = function()
{
    return this._container.getClientID();
}

 /*** OpenAjax.hub.Hub interface implementation ***/

/**
 * Subscribe to a topic.
 *
 * @param {String} topic
 *     A valid topic string. MAY include wildcards.
 * @param {Function} onData   
 *     Callback function that is invoked whenever an event is 
 *     published on the topic
 * @param {Object} [scope]
 *     When onData callback or onComplete callback is invoked,
 *     the JavaScript "this" keyword refers to this scope object.
 *     If no scope is provided, default is window.
 * @param {Function} [onComplete]
 *     Invoked to tell the client application whether the 
 *     subscribe operation succeeded or failed. 
 * @param {*} [subscriberData]
 *     Client application provides this data, which is handed
 *     back to the client application in the subscriberData
 *     parameter of the onData and onComplete callback functions.
 * 
 * @returns subscriptionID
 *     Identifier representing the subscription. This identifier is an 
 *     arbitrary ID string that is unique within this Hub instance
 * @type {String}
 * 
 * @throws {OpenAjax.hub.Error.Disconnected} if this Hub instance is not in CONNECTED state
 * @throws {OpenAjax.hub.Error.BadParameters} if the topic is invalid (e.g. contains an empty token)
 *
 * In this implementation of InlineHubClient, the subscribe function operates 
 * Thus, onComplete is invoked before this function returns. Developers are 
 * cautioned that in most implementations of HubClient, onComplete is invoked 
 * after this function returns.
 * 
 * If unsubscribe is called before subscribe completes, the subscription is 
 * immediately terminated, and onComplete is never invoked.
 */
OpenAjax.hub.InlineHubClient.prototype.subscribe = function( topic, onData, scope, onComplete, subscriberData )
{
    return this._container.subscribe( topic, onData, scope, onComplete, subscriberData );
}

/**
 * Publish an event on 'topic' with the given data.
 *
 * @param {String} topic
 *     A valid topic string. MUST NOT include wildcards.
 * @param {*} data
 *     Valid publishable data. To be portable across different
 *     Container implementations, this value SHOULD be serializable
 *     as JSON.
 *     
 * @throws {OpenAjax.hub.Error.Disconnected} if this Hub instance 
 *     is not in CONNECTED state
 * 
 * In this implementation, publish operates SYNCHRONOUSLY. 
 * Data will be delivered to subscribers after this function returns.
 * In most implementations, publish operates synchronously, 
 * delivering its data to the clients before this function returns.
 */
OpenAjax.hub.InlineHubClient.prototype.publish = function( topic, data )
{
    this._container.publish( topic, data );
}

/**
 * Unsubscribe from a subscription
 *
 * @param {String} subscriptionID
 *     A subscriptionID returned by InlineHubClient.prototype.subscribe()
 * @param {Function} [onComplete]
 *     Callback function invoked when unsubscribe completes
 * @param {Object} [scope]
 *     When onComplete callback function is invoked, the JavaScript "this"
 *     keyword refers to this scope object.
 *     
 * @throws {OpenAjax.hub.Error.NoSubscription} if no such subscription is found
 * 
 * To facilitate cleanup, it is possible to call unsubscribe even 
 * when the HubClient is in a DISCONNECTED state.
 * 
 * In this implementation of HubClient, this function operates SYNCHRONOUSLY. 
 * Thus, onComplete is invoked before this function returns. Developers are 
 * cautioned that in most implementations of HubClient, onComplete is invoked 
 * after this function returns.
 */
OpenAjax.hub.InlineHubClient.prototype.unsubscribe = function( subscriptionID, onComplete, scope )
{
    this._container.unsubscribe( subscriptionID, onComplete, scope );
}

OpenAjax.hub.InlineHubClient.prototype.isConnected = function()
{
    return this._container.isConnected();
}

OpenAjax.hub.InlineHubClient.prototype.getScope = function()
{
    return this._scope;
}

OpenAjax.hub.InlineHubClient.prototype.getSubscriberData = function( subID )
{
    return this._container.getSubscriberData( subID );
}

OpenAjax.hub.InlineHubClient.prototype.getSubscriberScope = function( subID )
{
    return this._container.getSubscriberScope( subID );
}

/**
 * Returns the params object associated with this Hub instance.
 * Allows mix-in code to access parameters passed into constructor that created
 * this Hub instance.
 *
 * @returns params  the params object associated with this Hub instance
 * @type {Object}
 */
OpenAjax.hub.InlineHubClient.prototype.getParameters = function()
{
    return this._params;
}
