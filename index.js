function XDMessage () {
	this.sites = {};
	this.parentOrigin = null;
	this.listeners = [];

	eventListen(window, "message", this.messageListener.bind(this), false);
}

XDMessage.prototype.addListener = function(cb) {
	this.listeners.push(cb);
};

XDMessage.prototype.messageListener = function (event) {
	this.setParentOrigin( event.origin );

	for (var i = 0; i < this.listeners.length; i++) {
		this.listeners[i](event);
	}
};

XDMessage.prototype.sendToChild = function(site, message) {
	this.getTargetFrame(site, function(err, target){
		target.contentWindow.postMessage(message, getProperOrigin(site));
	});
};

XDMessage.prototype.sendToParent = function(message) {
	if (!this.parentOrigin) {
		console.warn("Cannot send message to parent until link has been established.");
	} else {
		window.parent.postMessage(message, this.parentOrigin);
	}
};

XDMessage.prototype.setParentOrigin = function(origin) {
	this.parentOrigin = getProperOrigin( origin );
};

XDMessage.prototype.getTargetFrame = function(site, cb) {
	var xdmessage = this;
	var siteOrigin = getProperOrigin(site);

	if (!xdmessage.sites[siteOrigin]) {
		createTargetFrame(site, function(err, frame){
			xdmessage.sites[siteOrigin] = frame;

			cb(null, frame);
		});
	} else {
		cb( null, xdmessage.sites[siteOrigin] );
	}
};

function createTargetFrame (site, cb) {
	var origin = getProperOrigin(site);
	var iframe = document.getElementById(origin);

	if (!iframe) {
		iframe = document.createElement("iframe");

		iframe.width  = 1;
		iframe.height = 1;
		iframe.src    = site;
		iframe.id     = origin;
		iframe.name   = origin;

		iframe.style.display = "none";

		document.body.appendChild(iframe);
	}

	eventListen(iframe, "load",function(){
		cb( null, iframe );
	});
}

/**
 * Modified from posting at http://dustindiaz.com/rock-solid-addevent
 * Date: 2016/07/22
 * Original author: Dustin Diaz
 * License: CC-GNU LGPL
**/
function eventListen ( targetNode, eventType, handler, useCapture ) {
	if (targetNode.addEventListener) {
		targetNode.addEventListener( eventType, handler, Boolean(useCapture) );
	} else if (targetNode.attachEvent) {
		targetNode["e"+eventType+handler] = handler;

		targetNode[eventType+handler] = function() { targetNode["e"+eventType+handler]( window.event ); };

		targetNode.attachEvent( "on"+eventType, targetNode[eventType+handler] );
	} else {
		targetNode["on"+eventType] = targetNode["e"+eventType+handler];
	}
}

function getProperOrigin (url){
	url = url||"";

	return url.toString().split("/").splice(0,3).join("/");
}

if (typeof window !== "undefined") window.XDMessage = XDMessage;
if (typeof module !== "undefined") module.exports = XDMessage;