/*
 * (C) Copyright IBM Corp. 2007
 */

var partnerWindowNullError = new Error ("The communication partner's window was set to null.");
var notInitializedError = new Error ("CommLib was not initialized.");
/**
* Communication Library which takes care of the cross domain IFrame communication
* 
* Goal: Provide an policy independent communication module for use in experiments such as SEHub or policy for free.
* 
* The application using this library should not use any frames with the same name as the tunnelGUID.
**/

/**
 * The protocol that is implemented in this object uses the following message types
 * 
 * init: Initializes the CommLib. The data exchanged in this message contains configuration parameters.
 * start: The begining of a multimpart message. The data exchanged in this message is the first part of the multipart message.
 * part: An intermediate part of a multipart message. The data exchanged in this message is a part of the whole message.
 * end: The end of a message. If the message is a multipart message, this is the final part. If this is not a multipart message this is the only and therefore also final part.
 * ok: An acknowledgement message. This is sent back to the communicating partner to inform recieval of the message.
 * loaded: A message sent by the tunnel iframe to inform the component of the fact that the tunnel is now open.
 **/

function CommLib(){
	// polling and queue processing interval
	var interval=10
	// The maximul length of a URL. If the message is longer it will be split into different parts.
	var urlLimit = 4000; 
	// Keeps track of the sending state of the component.
	var sending = false; 
	// The current value of the data behind the Hash. Will be used to discover incoming messages.
	var currentHash = null; 
	// The URL of the partner iFrame.
	var partnerURL = null; 
	// The name of the window of the partner iFrame.
	var partnerWindow = null; 
	// The data that will be send to the partner iFrame.
	var messageOut = null;
	// The split version of the outgoing message to make sure that we don't go over the limit of the url length.	 
	var messageOutParts = []; 
	// The index of the current message that is being sent.
	var currentOutPart = 0; 
	// Unique identifier to track the current message which we are communicating. Currently used to make sure "ok" is mapped to the last send message.
	var messageNr = 0; 
	// The incomming message recieved from the partner iFrame.
	var messageIn = ""; 
	// This is used to make the object available to the private methods. This is a workaround for an error in the ECMAScript Language Specification which causes this to be set incorrectly for inner functions. See http://www.crockford.com/javascript/private.html
	var that=this;
	// A queue for outgoing messages. This queue is used when new send requests are done while we are still sending or recieving a message.
	var queueOut=[];
	// Variable storing the identifier for the setInterval if processing an output queue	
	var queueOutProcess=null;
	// A queue for incomming messages. This queue is used when new messages arrive but there is no reciepient set yet. This can occur if one of the frames requires a long loading time.
	var	queueIn=[];
	// Variable storing the identifier for the setInterval if processing an input queue	
	var queueInProcess=null;
	// Variable storing the callback to the recieved function
	var recieved=null;	
	// Variable storing the callback to the security listener function
	var securityListener=null;
	// Variable storing the initialization 
	var initialized=false;
	// The security token used for checking message origin
	var securityToken=null;
	/**
	 * Sends a message to the partner iFrame.
	 * 
	 * @param message The textual data that will be send to the partner iFrame
	 */
	this.send=function(message){
		// Queue the message if sending or if there is no communication partner yet
		if (sending || partnerWindow==null){
			queueOut[queueOut.length]=message;
			// Start a timer if no timer has started yet
			if (queueOut.length==1){
				queueOutProcess=setInterval(processOutQueue,interval);
			}
			return;
		}
		//URI encode the message for transport over the fragment
		var encodedData=encodeURIComponent(message);
		// Current code ignores messages when already sending		
		if(!sending){
			sending = true;
			messageOut = encodedData || "";
			sendMessageStart();
		}
	}

	/**
	 * Sets the callback which will be called when a new message has been recieved.
	 * 
	 * @param callback The callback to the recieved method;
	 */
	this.setRecieved=function(callback){
		recieved=callback;
	};
	
	/**
	 * Sets the callback for security errors.
	 * 
	 * @param The callback for security errors.
	 */
	this.setSecurityListener=function(callback){
		securityListener=callback;
	}
	
	/**
	 * Starts listening for incomming messages by polling the data after the #
	 */
	this.listen=function(){
		//console.debug ("CommLib.listen " + window.location.href.split("#")[0]);
		//Start counter to inspect hash value.
		setInterval(pollHash, interval);
	}
	
	/**
	 * Sets the communication partner's info
	 * @param parWindow The partner window.
	 * @param parURL The partner URL.
	 */
	this.setPartnerWindow=function(parWindow){
		if (parWindow==null)throw partnerWindowNullError;
		partnerWindow=parWindow;
	}
	
	/**
	 * Returns the URL of the partner of this CommLib.
	 */
	this.getPartnerURL=function(){
		return partnerURL;
	}

	/**
	 * Returns the security token used by this CommLib.
	 */
	this.getSecurityToken=function(){
		return securityToken;
	}

	/**
	 * Processes a the output queue
	 */
	function processOutQueue(){
		// return if not ready to send
		if (sending || partnerWindow==null)return;
		// Send the first element in the Array
		that.send(queueOut.shift());
		// Stop sending polling when the queue is empty
		if (queueOut.length==0)clearInterval(queueOutProcess);
	}
	
	/**
	 * Checks the information after the hash to see if there is a new incomming message.
	 */
	function pollHash(){
		//Can't use location.hash because at least Firefox does a decodeURIComponent on it.
		var urlParts = window.location.href.split("#");
		if(urlParts.length == 2){
			var newHash = urlParts[1];
			if(newHash != currentHash){
				try{
					messageReceived(newHash);
				}catch(e){
					//Make sure to not keep processing the error hash value.
					currentHash = newHash;
					throw e;
				}
				currentHash = newHash;
			}
		}
	}
	
	/**
	 * Processes a the output queue
	 */
	function processInQueue(){
		// return if the reciever method has not been set
		if (that.recieved==null)return;
		// Send the first element in the Array
		that.recieved(queueIn.shift());
		// Stop polling when the queue is empty
		if (queueIn.length==0)clearInterval(queueInProcess);
	}

	/**
	 * This method boots the sending of a messages. It is responsible for splitting the data in parts if necessary.
	 */
	function sendMessageStart(){
		//Break the message into parts, if necessary.
		messageOutParts = [];	
		var reqData = messageOut;
		var urlLength = partnerURL.length;
		var partLength = urlLimit - urlLength;
		var reqIndex = 0;
	
		while((reqData.length - reqIndex) + urlLength > urlLimit){
			var part = reqData.substring(reqIndex, reqIndex + partLength);
			//Safari will do some extra hex escaping unless we keep the original hex
			//escaping complete.
			var percentIndex = part.lastIndexOf("%");
			if(percentIndex == part.length - 1 || percentIndex == part.length - 2){
				part = part.substring(0, percentIndex);
			}
			messageOutParts.push(part);
			reqIndex += part.length;
		}
		messageOutParts.push(reqData.substring(reqIndex, reqData.length));
		
		currentOutPart = 0;
		sendMessagePart();	
	}
	
	/**
	 * Sends the current part of the message. This method is required for split messages.
	 */
	function sendMessagePart(){
		if(currentOutPart < messageOutParts.length){
			messageNr++;
			//Get the message part.
			var partData = messageOutParts[currentOutPart];
	
			//Get the command.
			var cmd = "part";
			if(currentOutPart + 1 == messageOutParts.length){
				cmd = "end";
			}else if (currentOutPart == 0){
				cmd = "start";
			}
			
			setPartnerUrl(cmd, messageNr, partData);
			currentOutPart++;
		}
		else{
			sending=false;
			currentOutPart=0;
		}
	}
	
	/**
	 * Sets the URL of the partner iFrame. This actually transmits the data to the partner iFrame.
	 * 
	 * @param cmd The current command that is being used. @see #messageReceived.
	 * @param messageNr A counter keeping track of the current message we are sending. This counter is used by both partners to identify which message they are exchanging.
	 * @param message The actual encoded messag which will be send to the partner.
	 */
	function setPartnerUrl(cmd, messageNr, message){
		if (!initialized)throw notInitializedError;
		var url = makePartnerUrl(cmd,messageNr,message);
		//console.debug ("CommLib.setPartnerUrl " + window.location.href.split("#")[0] + " "  + cmd + " " + message);
		//Safari won't let us replace across domains.
		if(navigator.userAgent.indexOf("Safari") == -1){
			partnerWindow.location.replace(url);
		}else{
			partnerWindow.location = url;
		}
	}


	/**
	 * Creates the full URL that will be sent to the partner. This method adds the command, message number, and data to the partner URL.
	 * 
	 * @param cmd The current command that is being used. @see #messageReceived.
	 * @param messageNr A counter keeping track of the current message we are sending. This counter is used by both partners to identify which message they are exchanging.
	 * @param message The actual encoded messag which will be send to the partner.	 * 
	 */	
	function makePartnerUrl(cmd, messageNr, message){
		var url = partnerURL + "#" + cmd + ":" + messageNr + ":" + securityToken;
		if(message){
			url += ":" + message;
		}
		return url;
	}
	
	/**
	 * Unwraps and decodes the incomming message. 
	 * @param encodedMessage The data behind the #.
	 * @return An object representing the decoded data.
	 */
	function unpackMessage(encodedMessage){
		var parts = encodedMessage.split(":");
		var command = parts[0];
		messageNr=parts[1];
		var token=parts[2];
		encodedMessage = parts[3] || "";
		var config = null;		
		if(command == "init"){
			// initialize security token
			securityToken=token;
			var configParts = encodedMessage.split("&");
			config = {};
			for(var i = 0; i < configParts.length; i++){
				var nameValue = configParts[i].split("=");
				config[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
			}
		}		
		else{
			//verify security token
			if (token!=securityToken){
				if (securityListener!=null){				
					securityListener(SecurityErrors.INVALID_TOKEN);
				}
				else{
					throw new Error (SecurityErrors.INVALID_TOKEN_MSG);
				}
				return null;
			}	
		}
		return {command: command, message: encodedMessage, config: config, number: messageNr};
	}

	/**
	 * Is called when a new message has been detected. I.e., when the data behind the # has changed.
	 * 
	 * @param encodedData The URI encoded data which is stored behind the #.
	 */
	function messageReceived(encodedData){
		//console.debug ("CommLib.messageRecieved " + window.location.href.split("#")[0] + " "  + encodedData);
		var msg = unpackMessage(encodedData);
		// msg is null when a security error occurs
		if (msg==null) return;
		switch(msg.command){
			case "init":
				init(msg.config);
				initialized=true;
				break;
			case "ok":
				sendMessagePart();
				break;
			case "start":
				messageIn = "";
				messageIn += msg.message;
				setPartnerUrl("ok", messageNr);
				break;
			case "part":
				messageIn += msg.message;
				setPartnerUrl("ok", messageNr);
				break;
			case "end":
				messageIn += msg.message;
				// Needed to be done before the actual message is processed.
				setPartnerUrl("ok", messageNr);
				// TODO check the actual impact of this change. It was needed to keep the code running. 
				// This basically says that recieving a new message before the ACK was recieved is considered as an ACK + the new message.
				sending=false;
				if (recieved==null || queueIn.length>0){
					//Queue the message and start the queue processor
					queueIn[queueIn.length]=decodeURIComponent(messageIn);
					// Start a timer if no timer has started yet
					if (queueIn.length==1){
						queueInProcess=setInterval(processInQueue,interval);
					}
				}				
				else{
					recieved(decodeURIComponent(messageIn));
				}
				messageIn="";
				break;				
		}
	}
	
	function init(config){	
		// get the partnerURL based on the config information
		partnerURL=config.pU;
	}	
	
	// Triggers reading the initialization information.
  pollHash();
};


function CommLibComponent(){
	// Variable storing the CommLib (Note the setting of the init callback upon creation)
	var commLib=new CommLib();
	// GUI which will be used to name the iFrame tunnel.
	var tunnelGUID="3827816c-f3b1-11db-8314-0800200c9a66"

	/**
	 * Sets the callback for incomming messages.
	 * 
	 * @param The callback for incomming messages.
	 */
	this.setRecieved=function(callback){
		commLib.setRecieved(callback);
	}

	/**
	 * Sets the callback for security errors.
	 * 
	 * @param The callback for security errors.
	 */
	this.setSecurityListener=function(callback){
		commLib.setSecurityListener(callback);
	}

	/**
	 * Sends a message to the partner iFrame.
	 * 
	 * @param message The textual data that will be send to the partner iFrame
	 */	
	this.send=function(message){
		return commLib.send(message);
	}

	/**
	 * Creates the iFrame though which the communication with the main application is done.
	 */
	function createTunnelIFrame(partnerURL,tunnelGUID, securityToken){
		var iframe = document.createElement("iframe");
		iframe.src=partnerURL + "#init:0:" + securityToken + ":pU=" + encodeURIComponent(window.location.href.split("#")[0]);
		iframe.name=tunnelGUID;
		iframe.id=tunnelGUID;
		document.body.appendChild(iframe);
		if (navigator.userAgent.indexOf("Safari") == -1) {
			iframe.style.position = "absolute";
		}
		iframe.style.left = iframe.style.top = "0px";
		iframe.style.height = iframe.style.width = "1px";
		iframe.style.visibility = "hidden";
	}

	/**
	 * Initializes the communication library based on the information in the config. There are two roles:
	 * 1. Component: In this role the CommLib resides inside the component and bridges the communication between the domain of the component and the domain of the main application.
 	 * 2. Tunnel: In this role the CommLib resides inside the tunnel iFrame and bridges the communication between the domain of the component and the domain of the main application.
 	 * In the tunnel role the iFrame is hidden internally in the component but since the iFrame in the component and the main application are in the same domain they can talk to each other. 
 	 * This is implemented in this way because of the required iFrame recursion for IE 7.0 See http://tagneto.blogspot.com/2006/10/ie-7-and-iframe-apis-part-2.html.
 	 * 
 	 * @param config The configuration information on which the lib will base it's initialization.
	 */
	function init(){
		// Generate the tunnel iframe
		createTunnelIFrame(commLib.getPartnerURL(),tunnelGUID,commLib.getSecurityToken());
		// Set the partner window
		commLib.setPartnerWindow(window.frames[tunnelGUID]);
		// Start listening
		commLib.listen();
	}
	init();		
};

function CommLibTunnel(){
	var commLib=new CommLib();

	/**
	 * Returns the URL of the partner of this CommLib.
	 */
	this.getPartnerURL=function(){
		return commLib.getPartnerURL();
	}

	/**
	 * Returns the security token used by this CommLib.
	 */
	this.getSecurityToken=function(){
		return commLib.getSecurityToken();
	}

	/**
	 * Sets the callback for incomming messages.
	 * 
	 * @param The callback for incomming messages.
	 */
	this.setRecieved=function(callback){
		commLib.setRecieved(callback);
	}
	
	/**
	 * Sets the callback for security errors.
	 * 
	 * @param The callback for security errors.
	 */
	this.setSecurityListener=function(callback){
		commLib.setSecurityListener(callback);
	}	

	/**
	 * Sends a message to the partner iFrame.
	 * 
	 * @param message The textual data that will be send to the partner iFrame
	 */	
	this.send=function(message){
		return commLib.send(message);
	}
	
	/**
	 * Initializes the communication library based on the information in the config. There are two roles:
	 * 1. Component: In this role the CommLib resides inside the component and bridges the communication between the domain of the component and the domain of the main application.
 	 * 2. Tunnel: In this role the CommLib resides inside the tunnel iFrame and bridges the communication between the domain of the component and the domain of the main application.
 	 * In the tunnel role the iFrame is hidden internally in the component but since the iFrame in the component and the main application are in the same domain they can talk to each other. 
 	 * This is implemented in this way because of the required iFrame recursion for IE 7.0 See http://tagneto.blogspot.com/2006/10/ie-7-and-iframe-apis-part-2.html.
 	 * 
 	 * @param config The configuration information on which the lib will base it's initialization.
	 */
	function init(config){	
		// Set the partner window
		commLib.setPartnerWindow(parent);
		// Start listening for incomming messages.
		commLib.listen();
	}
	
	this.setOnunloadHandler=function(callback){
		window.onunload=callback;
	}
	init();	
};
