/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * jQuery between Extension
 * 
 * insert either html code, a dom object OR a jQuery object inside of an existing text node.
 * if the chained jQuery object is not a text node, nothing will happen.
 * 
 * @param content HTML Code, DOM object or jQuery object to be inserted
 * @param offset character offset from the start where the content should be inserted
 */
jQuery.fn.between = function(content, offset) {
	if (this[0].nodeType !== 3) {
		// we are not in a text node, just insert the element at the corresponding position
		if (offset > this.children().size()) {
			offset = this.children().size();
		}
		if (offset <= 0) {
			this.prepend(content);
		} else {
			this.children().eq(offset -1).after(content);
		}
	} else {
		// we are in a text node so we have to split it at the correct position
		if (offset <= 0) {
			this.before(content);
		} else if (offset >= this[0].length) {
			this.after(content);		
		} else {
			var fullText = this[0].data;
			this[0].data = fullText.substring(0, offset);
			this.after(fullText.substring(offset, fullText.length));
			this.after(content);
		}
	}
};
/**
 * jQuery removeCss Extension
 * 
 * removes one or more style attributes completely. If the style attribute would be empty,
 * it will be removed  
 * 
 * @param cssName CSS style names, devided by ;
 */

jQuery.fn.removeCss = function( cssName ) {
	return this.each( function() {
		var oldstyle = jQuery(this).attr('style');
    	var style = jQuery.grep(jQuery(this).attr('style').split(";"), function(curStyleAttr) {
        			var curStyleAttrName = curStyleAttr.split(":");
        			if (curStyleAttrName[0]) {
        				if ( curStyleAttrName[0].toUpperCase().trim().indexOf(cssName.toUpperCase()) == -1) {
        					return curStyleAttr;
        				}
        			}
                }).join(";").trim();
		jQuery(this).removeAttr('style');
    	if (style.trim()) {
    		jQuery(this).attr('style', style);
    	}
    	return jQuery(this);
    });
};

/**
 * Make the object contenteditable. Care about browser version (name of contenteditable attribute depends on it)
 */
jQuery.fn.contentEditable  = function( b ) {
	// ie does not understand contenteditable but contentEditable
	// contentEditable is not xhtml compatible.
	var ce = 'contenteditable';
	if (jQuery.browser.msie && parseInt(jQuery.browser.version) == 7 ) {
		ce = 'contentEditable';
	}
	if ( b == undefined ) {
		return jQuery(this).attr(ce);
	} else if (b === '') {
		jQuery(this).removeAttr(ce);
	} else {
		if (b && b !== 'false') {
			b='true';
		} else {
			b='false';
		}
		jQuery(this).attr(ce, b);
	}
};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof GENTICS == 'undefined' || !GENTICS) {
	var GENTICS = {};
}

if (typeof GENTICS.Utils == 'undefined' || !GENTICS) {
	GENTICS.Utils = {};
}

/**
 * Takes over all properties from the 'properties' object to the target object.
 * If a property in 'target' with the same name as a property in 'properties' is already defined it is overridden.
 * 
 * Example:
 * 
 * var o1 = {a : 1, b : 'hello'};
 * var o2 = {a : 3, c : 'world'};
 * 
 * GENTICS.Utils.applyProperties(o1, o2);
 * 
 * Will result in an o1 object like this:
 * 
 * {a : 3, b: 'hello', c: 'world'}
 * 
 * @static
 * @return void
 */
GENTICS.Utils.applyProperties = function (target, properties) {
	var name;
	for (name in properties) {
		if (properties.hasOwnProperty(name)) {
			target[name] = properties[name];
		}
	}
};

/**
 * Generate a unique hexadecimal string with 4 charachters
 * @return {string} 
 */
GENTICS.Utils.uniqeString4 = function () {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

/**
 * Generate a unique value represented as a 32 character hexadecimal string,
 * such as 21EC2020-3AEA-1069-A2DD-08002B30309D
 * @return {string} 
 */
GENTICS.Utils.guid = function () {
	var S4 = GENTICS.Utils.uniqeString4;
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof GENTICS == 'undefined' || !GENTICS) {
	var GENTICS = {};
}

if (typeof GENTICS.Utils == 'undefined' || !GENTICS) {
	GENTICS.Utils = {};
}

/**
 * @namespace GENTICS.Utils
 * @class RangeObject
 * Represents a selection range in the browser that 
 * has some advanced features like selecting the range.
 * @param {object} param if boolean true is passed, the range will be deducted from the current browser selection.
 * If another rangeObject is passed, it will be cloned.
 * If nothing is passed, the rangeObject will be empty.
 * @constructor
 */
GENTICS.Utils.RangeObject = function(param) {
	/**
	 * DOM object of the start container of the selection.
	 * This is always has to be a DOM text node.
	 * @property startContainer
	 * @type {DOMObject}
	 */
	this.startContainer;
	
	/**
	 * Offset of the selection in the start container
	 * @property startOffset
	 * @type {Integer}
	 */
	this.startOffset;
	
	/**
	 * DOM object of the end container of the selection.
	 * This is always has to be a DOM text node.
	 * @property endContainer
	 * @type {DOMObject}
	 */
	this.endContainer;
	
	/**
	 * Offset of the selection in the end container
	 * @property endOffset
	 * @type {Integer}
	 */
	this.endOffset;

	/**
	 * Parents of the start container up to different limit objects
	 */
	this.startParents = [];

	/**
	 * Parents of the end container up to different limit objects
	 */
	this.endParents = [];

	/**
	 * @hide
	 * RangeTree cache for different root objects
	 */
	this.rangeTree = [];

	// Take the values from the passed object
	if (typeof param === 'object') {
		if (param.startContainer !== undefined) {
			this.startContainer = param.startContainer;
		}
		if (param.startOffset !== undefined) {
			this.startOffset = param.startOffset;
		}
		if (param.endContainer !== undefined) {
			this.endContainer = param.endContainer;
		}
		if (param.endOffset !== undefined) {
			this.endOffset = param.endOffset;
		}		
	} else if (param === true) {
		this.initializeFromUserSelection();
	}
};

/**
 * Output some log
 * TODO: move this to GENTICS.Aloha.Log
 * @param message log message to output
 * @param obj optional JS object to output
 * @return void
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.log = function(message, obj) {
	if (GENTICS && GENTICS.Aloha && GENTICS.Aloha.Log) {
		GENTICS.Aloha.Log.debug(this, message);
		return false;
	}
	if (console) {		
		console.log(message);
		if (obj) {
			console.log(obj);
		}
	}
};

/**
 * Method to test if a range object is collapsed. 
 * A range is considered collapsed if either no endContainer exists or the endContainer/Offset equal startContainer/Offset
 * @return {boolean} true if collapsed, false otherwise
 * @method
 */
GENTICS.Utils.RangeObject.prototype.isCollapsed = function() {
	return (!this.endContainer || (this.startContainer === this.endContainer && this.startOffset === this.endOffset));
};

/**
 * Method to (re-)calculate the common ancestor container and to get it.
 * The common ancestor container is the DOM Object which encloses the
 * whole range and is nearest to the start and end container objects.
 * @return {DOMObject} get the common ancestor container
 * @method
 */
GENTICS.Utils.RangeObject.prototype.getCommonAncestorContainer = function() {
	if (this.commonAncestorContainer) {
		// sometimes it's cached (or was set)
		return this.commonAncestorContainer;
	}
	
	// if it's not cached, calculate and then cache it
	this.updateCommonAncestorContainer();
	
	// now return it anyway
	return this.commonAncestorContainer;
};

/**
 * Get the parent elements of the startContainer/endContainer up to the given limit. When the startContainer/endContainer
 * is no text element, but a node, the node itself is returned as first element.
 * @param {jQuery} limit limit object (default: body)
 * @param {boolean} fromStart true to fetch the parents from the startContainer, false for the endContainer
 * @return {jQuery} parent elements of the startContainer/endContainer as jQuery objects
 * @method
 */
GENTICS.Utils.RangeObject.prototype.getContainerParents = function (limit, fromEnd) {
	var container = fromEnd ? this.endContainer : this.startContainer;
	var parentStore = fromEnd ? this.endParents : this.startParents;

	if (!container) {
		return false;
	}

	if (typeof limit == 'undefined') {
		limit = jQuery('body');
	}

	if (!parentStore[limit.get(0)]) {
		var parents;

		// for text nodes, get the parents
		if (container.nodeType == 3) {
			parents = jQuery(container).parents();
		} else {
			parents = jQuery(container).parents();
			for (var i = parents.length; i > 0; --i) {
				parents[i] = parents[i - 1];
			}
			parents[0] = container;
		}

		// now slice this array
		var limitIndex = parents.index(limit);

		if (limitIndex >= 0) {
			parents = parents.slice(0, limitIndex);
		}

		// store it (might be used again)
		parentStore[limit.get(0)] = parents;
	}

	return parentStore[limit.get(0)];
};

/**
 * Get the parent elements of the startContainer up to the given limit. When the startContainer
 * is no text element, but a node, the node itself is returned as first element.
 * @param {jQuery} limit limit object (default: body)
 * @return {jQuery} parent elements of the startContainer as jQuery objects
 * @method
 */
GENTICS.Utils.RangeObject.prototype.getStartContainerParents = function(limit) {
	return this.getContainerParents(limit, false);
};

/**
 * Get the parent elements of the endContainer up to the given limit. When the endContainer is
 * no text element, but a node, the node itself is returned as first element.
 * @param {jQuery} limit limit object (default: body)
 * @return {jQuery} parent elements of the endContainer as jQuery objects
 * @method
 */
GENTICS.Utils.RangeObject.prototype.getEndContainerParents = function(limit) {
	return this.getContainerParents(limit, true);
};

/**
 * TODO: the commonAncestorContainer is not calculated correctly, if either the start or 
 * the endContainer would be the cac itself (e.g. when the startContainer is a textNode 
 * and the endContainer is the startContainer's parent <p>). in this case the cac will be set
 * to the parent div
 * Method to update a range object internally
 * @param commonAncestorContainer (DOM Object); optional Parameter; if set, the parameter 
 * will be used instead of the automatically calculated CAC
 * @return void
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.updateCommonAncestorContainer = function(commonAncestorContainer) {
	// this will be needed either right now for finding the CAC or later for the crossing index
	var parentsStartContainer = this.getStartContainerParents();
	var parentsEndContainer = this.getEndContainerParents();

	// if no parameter was passed, calculate it
	if (!commonAncestorContainer) {
		// find the crossing between startContainer and endContainer parents (=commonAncestorContainer)
		if (!(parentsStartContainer.length > 0 && parentsEndContainer.length > 0)) {
			GENTICS.Utils.RangeObject.prototype.log('could not find commonAncestorContainer');
			return false;
		}
		
		for (var i = 0; i < parentsStartContainer.length; i++) {
			if (parentsEndContainer.index( parentsStartContainer[ i ] ) != -1) {
				this.commonAncestorContainer = parentsStartContainer[ i ];
				break;
			}
		}
	} else {
		this.commonAncestorContainer = commonAncestorContainer;
	}

	// if everything went well, return true :-)
	GENTICS.Utils.RangeObject.prototype.log(commonAncestorContainer? 'commonAncestorContainer was set successfully' : 'commonAncestorContainer was calculated successfully');
	return true;
};

/**
 * Helper function for selection in IE. Creates a collapsed text range at the given position
 * @param container container
 * @param offset offset
 * @return collapsed text range at that position
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.getCollapsedIERange = function(container, offset) {
	// create a text range
	var ieRange = document.body.createTextRange();

	// search to the left for the next element
	var left = this.searchElementToLeft(container, offset);
	if (left.element) {
		// found an element, set the start to the end of that element
		var tmpRange = document.body.createTextRange();
		tmpRange.moveToElementText(left.element);
		ieRange.setEndPoint('StartToEnd', tmpRange);

		// and correct the start
		if (left.characters != 0) {
			ieRange.moveStart('character', left.characters);
		} else {
			// this is a hack, when we are at the start of a text node, move the range anyway
			ieRange.moveStart('character', 1);
			ieRange.moveStart('character', -1);
		}
	} else {
		// found nothing to the left, so search right
		var right = this.searchElementToRight(container, offset);
		if (false && right.element) {
			// found an element, set the start to the start of that element
			var tmpRange = document.body.createTextRange();
			tmpRange.moveToElementText(right.element);
			ieRange.setEndPoint('StartToStart', tmpRange);

			// and correct the start
			if (right.characters != 0) {
				ieRange.moveStart('character', -right.characters);
			} else {
				ieRange.moveStart('character', -1);
				ieRange.moveStart('character', 1);
			}
		} else {
			// also found no element to the right, use the container itself
			var parent = container.nodeType == 3 ? container.parentNode : container;
			var tmpRange = document.body.createTextRange();
			tmpRange.moveToElementText(parent);
			ieRange.setEndPoint('StartToStart', tmpRange);

			// and correct the start
			if (left.characters != 0) {
				ieRange.moveStart('character', left.characters);
			}
		}
	}
	ieRange.collapse();

	return ieRange;
};

/**
 * Sets the visible selection in the Browser based on the range object.
 * If the selection is collapsed, this will result in a blinking cursor, 
 * otherwise in a text selection.
 * @method
 */
GENTICS.Utils.RangeObject.prototype.select = document.createRange === undefined ? function() { // first the IE version of this method
	if (GENTICS.Aloha.Log.isDebugEnabled()) {
		GENTICS.Aloha.Log.debug(this, 'Set selection to current range (IE version)');
	}
	// when the startcontainer is a textnode, which is followed by a blocklevel node (p, h1, ...), we need to add a <br> in between
	if (this.startContainer.nodeType == 3
			&& GENTICS.Utils.Dom.isBlockLevelElement(this.startContainer.nextSibling)) {
		jQuery(this.startContainer).after('<br/>');
		// we eventually also need to update the offset of the end container
		if (this.endContainer === this.startContainer.parentNode
				&& GENTICS.Utils.Dom.getIndexInParent(this.startContainer) < this.endOffset) {
			this.endOffset++;
		}
	}

	// create a text range
	var ieRange = document.body.createTextRange();

	// get the start as collapsed range
	var startRange = this.getCollapsedIERange(this.startContainer, this.startOffset);
	ieRange.setEndPoint('StartToStart', startRange);

	if (this.isCollapsed()) {
		// collapse the range
		ieRange.collapse();
	} else {
		// get the end as collapsed range
		var endRange = this.getCollapsedIERange(this.endContainer, this.endOffset);
		ieRange.setEndPoint('EndToStart', endRange);
	}

	// select our range now
	ieRange.select();
} : function() { // now for the rest of the world
	if (GENTICS.Aloha.Log.isDebugEnabled()) {
		GENTICS.Aloha.Log.debug(this, 'Set selection to current range (non IE version)');
	}

	// create a range
	var range = document.createRange();
	
	// set start and endContainer
	range.setStart(this.startContainer,this.startOffset);	
	range.setEnd(this.endContainer, this.endOffset);
	
	// update the selection
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
};

/**
 * Starting at the given position, search for the next element to the left and count the number of characters are in between
 * @param container container of the startpoint
 * @param offset offset of the startpoint in the container
 * @return object with 'element' (null if no element found) and 'characters'
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.searchElementToLeft = function (container, offset) {
	var checkElement = undefined;
	var characters = 0;

	if (container.nodeType == 3) {
		// start is in a text node
		characters = offset;
		// begin check at the element to the left (if any)
		checkElement = container.previousSibling;
	} else {
		// start is between nodes, begin check at the element to the left (if any)
		if (offset > 0) {
			checkElement = container.childNodes[offset - 1];
		}
	}

	// move to the right until we find an element
	while (checkElement && checkElement.nodeType == 3) {
		characters += checkElement.data.length;
		checkElement = checkElement.previousSibling;
	}

	return {'element' : checkElement, 'characters' : characters};
};

/**
 * Starting at the given position, search for the next element to the right and count the number of characters that are in between
 * @param container container of the startpoint
 * @param offset offset of the startpoint in the container
 * @return object with 'element' (null if no element found) and 'characters'
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.searchElementToRight = function (container, offset) {
	var checkElement = undefined;
	var characters = 0;

	if (container.nodeType == 3) {
		// start is in a text node
		characters = container.data.length - offset;

		// begin check at the element to the right (if any)
		checkElement = container.nextSibling;
	} else {
		// start is between nodes, begin check at the element to the right (if any)
		if (offset < container.childNodes.length) {
			checkElement = container.childNodes[offset];
		}
	}

	// move to the right until we find an element
	while (checkElement && checkElement.nodeType == 3) {
		characters += checkElement.data.length;
		checkElement = checkElement.nextSibling;
	}

	return {'element' : checkElement, 'characters' : characters};
};

/**
 * Method which updates the rangeObject including all extending properties like commonAncestorContainer etc...
 * TODO: is this method needed here? or should it contain the same code as GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.update?
 * @return void
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.update = function(event) {
	GENTICS.Utils.RangeObject.prototype.log('==========');
	GENTICS.Utils.RangeObject.prototype.log('now updating rangeObject');
	this.initializeFromUserSelection(event);
	this.updateCommonAncestorContainer();
};

/**
 * Initialize the current range object from the user selection of the browser.
 * @param event which calls the method
 * @return void
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.initializeFromUserSelection = function(event) {
	// get Browser selection via IERange standardized window.getSelection()
	var selection = window.getSelection();
	if (!selection) {
		return false;
	}
	
	// getBrowserRange
	var browserRange = selection.getRangeAt(0);
	if (!browserRange) {
		return false;
	}

	// initially set the range to what the browser tells us
	this.startContainer = browserRange.startContainer;
	this.endContainer = browserRange.endContainer;
	this.startOffset = browserRange.startOffset;
	this.endOffset = browserRange.endOffset;

	// now try to correct the range
	this.correctRange();
	return;
};

/**
 * Correct the current range. The general goal of the algorithm is to have start
 * and end of the range in text nodes if possible and the end of the range never
 * at the beginning of an element or text node. Details of the algorithm can be
 * found in the code comments
 * @method
 */
GENTICS.Utils.RangeObject.prototype.correctRange = function() {
	this.clearCaches();
	if (this.isCollapsed()) {
		// collapsed ranges are treated specially

		// first check if the range is not in a text node
		if (this.startContainer.nodeType == 1) {
			if (this.startOffset > 0 && this.startContainer.childNodes[this.startOffset - 1].nodeType == 3) {
				// when the range is between nodes (container is an element
				// node) and there is a text node to the left -> move into this text
				// node (at the end)
				this.startContainer = this.startContainer.childNodes[this.startOffset - 1];
				this.startOffset = this.startContainer.data.length;
				this.endContainer = this.startContainer;
				this.endOffset = this.startOffset;
				return;
			}

			if (this.startOffset > 0 && this.startContainer.childNodes[this.startOffset - 1].nodeType == 1) {
				// search for the next text node to the left
				var adjacentTextNode = GENTICS.Utils.Dom.searchAdjacentTextNode(this.startContainer, this.startOffset, true);
				if (adjacentTextNode) {
					this.startContainer = this.endContainer = adjacentTextNode;
					this.startOffset = this.endOffset = adjacentTextNode.data.length;
					return;
				}
				// search for the next text node to the right
				adjacentTextNode = GENTICS.Utils.Dom.searchAdjacentTextNode(this.startContainer, this.startOffset, false);
				if (adjacentTextNode) {
					this.startContainer = this.endContainer = adjacentTextNode;
					this.startOffset = this.endOffset = 0;
					return;
				}
			}

			if (this.startOffset < this.startContainer.childNodes.length && this.startContainer.childNodes[this.startOffset].nodeType == 3) {
				// when the range is between nodes and there is a text node
				// to the right -> move into this text node (at the start)
				this.startContainer = this.startContainer.childNodes[this.startOffset];
				this.startOffset = 0;
				this.endContainer = this.startContainer;
				this.endOffset = 0;
				return;
			}
		}

		// when the selection is in a text node at the start, look for an adjacent text node and if one found, move into that at the end
		if (this.startContainer.nodeType == 3 && this.startOffset == 0) {
			var adjacentTextNode = GENTICS.Utils.Dom.searchAdjacentTextNode(this.startContainer.parentNode, GENTICS.Utils.Dom.getIndexInParent(this.startContainer), true);
			if (adjacentTextNode) {
				this.startContainer = this.endContainer = adjacentTextNode;
				this.startOffset = this.endOffset = adjacentTextNode.data.length;
			}
		}
	} else {
		// expanded range found

		// correct the start, but only if between nodes
		if (this.startContainer.nodeType == 1) {
			// if there is a text node to the right, move into this
			if (this.startOffset < this.startContainer.childNodes.length && this.startContainer.childNodes[this.startOffset].nodeType == 3) {
				this.startContainer = this.startContainer.childNodes[this.startOffset];
				this.startOffset = 0;
			} else if (this.startOffset < this.startContainer.childNodes.length && this.startContainer.childNodes[this.startOffset].nodeType == 1) {
				// there is an element node to the right, so recursively check all first child nodes until we find a text node
				var textNode = false;
				var checkedElement = this.startContainer.childNodes[this.startOffset];
				while (textNode === false && checkedElement.childNodes && checkedElement.childNodes.length > 0) {
					// go to the first child of the checked element
					checkedElement = checkedElement.childNodes[0];
					// when this element is a text node, we are done
					if (checkedElement.nodeType == 3) {
						textNode = checkedElement;
					}
				}

				// found a text node, so move into it
				if (textNode !== false) {
					this.startContainer = textNode;
					this.startOffset = 0;
				}
			}
		}

		// check whether the start is inside a text node at the end
		if (this.startContainer.nodeType == 3 && this.startOffset == this.startContainer.data.length) {
			// check whether there is an adjacent text node to the right and if
			// yes, move into it
			var adjacentTextNode = GENTICS.Utils.Dom
					.searchAdjacentTextNode(this.startContainer.parentNode, GENTICS.Utils.Dom
							.getIndexInParent(this.startContainer) + 1, false);
			if (adjacentTextNode) {
				this.startContainer = adjacentTextNode;
				this.startOffset = 0;
			}
		}

		// now correct the end
		if (this.endContainer.nodeType == 3 && this.endOffset == 0) {
			// we are in a text node at the start
			if (this.endContainer.previousSibling && this.endContainer.previousSibling.nodeType == 3) {
				// found a text node to the left -> move into it (at the end)
				this.endContainer = this.endContainer.previousSibling;
				this.endOffset = this.endContainer.data.length;
			} else if (this.endContainer.previousSibling && this.endContainer.previousSibling.nodeType == 1 && this.endContainer.parentNode) {
				// found an element node to the left -> move in between
				var parentNode = this.endContainer.parentNode;
				for (var offset = 0; offset < parentNode.childNodes.length; ++offset) {
					if (parentNode.childNodes[offset] == this.endContainer) {
						this.endOffset = offset;
						break;
					}
				}
				this.endContainer = parentNode;
			}
		}

		if (this.endContainer.nodeType == 1 && this.endOffset == 0) {
			// we are in an element node at the start, possibly move to the previous sibling at the end
			if (this.endContainer.previousSibling) {
				if (this.endContainer.previousSibling.nodeType == 3) {
					// previous sibling is a text node, move end into here (at the end)
					this.endContainer = this.endContainer.previousSibling;
					this.endOffset = this.endContainer.data.length;
				} else if (this.endContainer.previousSibling.nodeType == 1
						&& this.endContainer.previousSibling.childNodes
						&& this.endContainer.previousSibling.childNodes.length > 0) {
					// previous sibling is another element node with children,
					// move end into here (at the end)
					this.endContainer = this.endContainer.previousSibling;
					this.endOffset = this.endContainer.childNodes.length;
				}
			}
		}

		// correct the end, but only if between nodes
		if (this.endContainer.nodeType == 1) {
			// if there is a text node to the left, move into this
			if (this.endOffset > 0 && this.endContainer.childNodes[this.endOffset - 1].nodeType == 3) {
				this.endContainer = this.endContainer.childNodes[this.endOffset - 1];
				this.endOffset = this.endContainer.data.length;
			} else if (this.endOffset > 0 && this.endContainer.childNodes[this.endOffset - 1].nodeType == 1) {
				// there is an element node to the left, so recursively check all last child nodes until we find a text node
				var textNode = false;
				var checkedElement = this.endContainer.childNodes[this.endOffset - 1];
				while (textNode === false && checkedElement.childNodes && checkedElement.childNodes.length > 0) {
					// go to the last child of the checked element
					checkedElement = checkedElement.childNodes[checkedElement.childNodes.length - 1];
					// when this element is a text node, we are done
					if (checkedElement.nodeType == 3) {
						textNode = checkedElement;
					}
				}

				// found a text node, so move into it
				if (textNode !== false) {
					this.endContainer = textNode;
					this.endOffset = this.endContainer.data.length;
				}
			}
		}
	}
};

/**
 * Clear the caches for this range. This method must be called when the range itself (start-/endContainer or start-/endOffset) is modified.
 * @method
 */
GENTICS.Utils.RangeObject.prototype.clearCaches = function () {
	this.rangeTree = [];
	this.startParents = [];
	this.endParents = [];
	this.commonAncestorContainer = undefined;
};

/**
 * Get the range tree of this range.
 * The range tree will be cached for every root object. When the range itself is modified, the cache should be cleared by calling GENTICS.Utils.RangeObject.clearCaches
 * @param {DOMObject} root root object of the range tree, if non given, the common ancestor container of the start and end containers will be used
 * @return {RangeTree} array of RangeTree object for the given root object
 * @method
 */
GENTICS.Utils.RangeObject.prototype.getRangeTree = function (root) {
	if (typeof root == 'undefined') {
		root = this.getCommonAncestorContainer();
	}

	if (this.rangeTree[root]) {
		// sometimes it's cached
		return this.rangeTree[root];
	}

	this.inselection = false;
	this.rangeTree[root] = this.recursiveGetRangeTree(root);

	return this.rangeTree[root];
};

/**
 * Recursive inner function for generating the range tree.
 * @param currentObject current DOM object for which the range tree shall be generated
 * @return array of Tree objects for the children of the current DOM object
 * @hide
 */
GENTICS.Utils.RangeObject.prototype.recursiveGetRangeTree = function (currentObject) {
	// get all direct children of the given object
	var jQueryCurrentObject = jQuery(currentObject);
	var childCount = 0;
	var that = this;
	var currentElements = new Array();

	jQueryCurrentObject.contents().each(function(index) {
		var type = 'none';
		var startOffset = false;
		var endOffset = false;
		var collapsedFound = false;

		// check for collapsed selections between nodes
		if (that.isCollapsed() && currentObject === that.startContainer && that.startOffset == index) {
			// insert an extra rangetree object for the collapsed range here
			currentElements[childCount] = new GENTICS.Utils.RangeTree();
			currentElements[childCount].type = 'collapsed';
			currentElements[childCount].domobj = undefined;
			that.inselection = false;
			collapsedFound = true;
			childCount++;
		}

		if (!that.inselection && !collapsedFound) {
			// the start of the selection was not yet found, so look for it now
			// check whether the start of the selection is found here

			// check is dependent on the node type
			switch(this.nodeType) {
			case 3: // text node
				if (this === that.startContainer) {
					// the selection starts here
					that.inselection = true;

					// when the startoffset is > 0, the selection type is only partial
					type = that.startOffset > 0 ? 'partial' : 'full';
					startOffset = that.startOffset;
					endOffset = this.length;
				}
				break;
			case 1: // element node
				if (this === that.startContainer && that.startOffset == 0) {
					// the selection starts here
					that.inselection = true;
					type = 'full';
				}
				if (currentObject === that.startContainer && that.startOffset == index) {
					// the selection starts here
					that.inselection = true;
					type = 'full';
				}
				break;
			}
		}

		if (that.inselection && !collapsedFound) {
			if (type == 'none') {
				type = 'full';
			}
			// we already found the start of the selection, so look for the end of the selection now
			// check whether the end of the selection is found here

			switch(this.nodeType) {
			case 3: // text node
				if (this === that.endContainer) {
					// the selection ends here
					that.inselection = false;

					// check for partial selection here
					if (that.endOffset < this.length) {
						type = 'partial';
					}
					if (startOffset === false) {
						startOffset = 0;
					}
					endOffset = that.endOffset;
				}
				break;
			case 1: // element node
				if (this === that.endContainer && that.endOffset == 0) {
					that.inselection = false;
				}
				break;
			}
			if (currentObject === that.endContainer && that.endOffset <= index) {
				that.inselection = false;
				type = 'none';
			}
		}

		// create the current selection tree entry
		currentElements[childCount] = new GENTICS.Utils.RangeTree();
		currentElements[childCount].domobj = this;
		currentElements[childCount].type = type;
		if (type == 'partial') {
			currentElements[childCount].startOffset = startOffset;
			currentElements[childCount].endOffset = endOffset;
		}

		// now do the recursion step into the current object
		currentElements[childCount].children = that.recursiveGetRangeTree(this);

		// check whether a selection was found within the children
		if (currentElements[childCount].children.length > 0) {
			var noneFound = false;
			var partialFound = false;
			var fullFound = false;
			for (var i = 0; i < currentElements[childCount].children.length; ++i) {
				switch(currentElements[childCount].children[i].type) {
				case 'none':
					noneFound = true;
					break;
				case 'full':
					fullFound = true;
					break;
				case 'partial':
					partialFound = true;
					break;
				}
			}

			if (partialFound || (fullFound && noneFound)) {
				// found at least one 'partial' DOM object in the children, or both 'full' and 'none', so this element is also 'partial' contained
				currentElements[childCount].type = 'partial';
			} else if (fullFound && !partialFound && !noneFound) {
				// only found 'full' contained children, so this element is also 'full' contained
				currentElements[childCount].type = 'full';
			}
		}

		childCount++;
	});

	// extra check for collapsed selections at the end of the current element
	if (this.isCollapsed()
			&& currentObject === this.startContainer
			&& this.startOffset == currentObject.childNodes.length) {
		currentElements[childCount] = new GENTICS.Utils.RangeTree();
		currentElements[childCount].type = 'collapsed';
		currentElements[childCount].domobj = undefined;
	}

	return currentElements;
};

/**
 * Find certain the first occurrence of some markup within the parents of either the start or the end of this range.
 * The markup can be identified by means of a given comparator function. The function will be passed every parent (up to the eventually given limit object, which itself is not considered) to the comparator function as this.
 * When the comparator function returns boolean true, the markup found and finally returned from this function as dom object.<br/>
 * Example for finding an anchor tag at the start of the range up to the active editable object:<br/>
 * <pre>
 * range.findMarkup(
 *   function() {
 *     return this.nodeName.toLowerCase() == 'a';
 *   },
 *   jQuery(GENTICS.Aloha.activeEditable.obj)
 * );
 * </pre>
 * @param {function} comparator comparator function to find certain markup
 * @param {jQuery} limit limit objects for limit the parents taken into consideration
 * @param {boolean} atEnd true for searching at the end of the range, false for the start (default: false)
 * @return {DOMObject} the found dom object or false if nothing found.
 * @method
 */
GENTICS.Utils.RangeObject.prototype.findMarkup = function (comparator, limit, atEnd) {
	var parents = this.getContainerParents(limit, atEnd);
	var returnValue = false;
	jQuery.each(parents, function (index, domObj) {
		if (comparator.apply(domObj)) {
			returnValue = domObj;
			return false;
		}
	});

	return returnValue;
};

/**
 * @namespace GENTICS.Utils
 * @class RangeTree
 * Class definition of a RangeTree, which gives a tree view of the DOM objects included in this range
 * Structure:
 * <pre>
 * +
 * |-domobj: <reference to the DOM Object> (NOT jQuery)
 * |-type: defines if this node is marked by user [none|partial|full|collapsed]
 * |-children: recursive structure like this
 * </pre>
 */
GENTICS.Utils.RangeTree = function() {
	/**
	 * DOMObject, if the type is one of [none|partial|full], undefined if the type is [collapsed]
	 * @property domobj
	 * @type {DOMObject}
	 */
	this.domobj = new Object();

	/**
	 * type of the participation of the dom object in the range. Is one of:
	 * <pre>
	 * - none the DOMObject is outside of the range
	 * - partial the DOMObject partially in the range
	 * - full the DOMObject is completely in the range
	 * - collapsed the current RangeTree element marks the position of a collapsed range between DOM nodes
	 * </pre>
	 * @property type
	 * @type {String}
	 */
	this.type;

	/**
	 * Array of RangeTree objects which reflect the status of the child elements of the current DOMObject
	 * @property children
	 * @type {Array}
	 */
	this.children = new Array();
};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof GENTICS == 'undefined' || !GENTICS) {
	var GENTICS = {};
}

if (typeof GENTICS.Utils == 'undefined' || !GENTICS) {
	GENTICS.Utils = {};
}

/**
 * position utility, which will provide scroll and mouse positions
 * please note that the positions provided by this class are not
 * realtime - instead they are calculated with a 0.5 second delay
 */
GENTICS.Utils.Position = {};

/**
 * jquery reference to the window object
 */
GENTICS.Utils.Position.w = jQuery(window);

/**
 * contains the current scroll top and left position, and indicates if the user is currently scrolling
 * @api
 */
GENTICS.Utils.Position.Scroll = {
		top : 0,
		left : 0,
		isScrolling : false
};

/**
 * contains the current mouse position (x,y) as well as an indicator if the mouse is moving
 * @api
 */
GENTICS.Utils.Position.Mouse = {
		x : 0,
		y : 0,
		oldX : 0,
		oldY : 0,
		isMoving : false,
		triggeredMouseStop : true
};

/**
 * contains all mousestop callbacks
 */
GENTICS.Utils.Position.mouseStopCallbacks = new Array();

/**
 * contains all mousemove callbacks
 */
GENTICS.Utils.Position.mouseMoveCallbacks = new Array();

/**
 * updates scroll position and the scrolling status 
 */
GENTICS.Utils.Position.update = function () {
	// update scroll position
	var st = this.w.scrollTop();
	var sl = this.w.scrollLeft();
	
	if (this.Scroll.isScrolling) {
		if (this.Scroll.top == st && this.Scroll.left == sl) {
			// stopped scrolling
			this.Scroll.isScrolling = false;
		}
	} else {
		if (this.Scroll.top != st || this.Scroll.left != sl) {
			// started scrolling
			this.Scroll.isScrolling = true;
		}
	}
	
	// update scroll positions
	this.Scroll.top = st;
	this.Scroll.left = sl;
	
	// check wether the user has stopped moving the mouse
	if (this.Mouse.x == this.Mouse.oldX && this.Mouse.y == this.Mouse.oldY) {
		this.Mouse.isMoving = false;
		// now check if we've triggered the mousestop event
		if (!this.Mouse.triggeredMouseStop) {
			this.Mouse.triggeredMouseStop = true;
			// iterate callbacks
			for (var i=0; i<this.mouseStopCallbacks.length; i++) {
				this.mouseStopCallbacks[i].call();
			}
		}
	} else {
		this.Mouse.isMoving = true;
		this.Mouse.triggeredMouseStop = false;
		// iterate callbacks
		for (var i=0; i<this.mouseMoveCallbacks.length; i++) {
			this.mouseMoveCallbacks[i].call();
		}
	}
	
	// update mouse positions
	this.Mouse.oldX = this.Mouse.x;
	this.Mouse.oldY = this.Mouse.y;
};

/**
 * adds a callback method which is invoked when the mouse has stopped moving
 * @param	callback	the callback method to be invoked
 * @return	index of the callback
 */
GENTICS.Utils.Position.addMouseStopCallback = function (callback) {
	this.mouseStopCallbacks.push(callback);
	return (this.mouseStopCallbacks.length - 1);
};

/**
 * adds a callback method which is invoked when the mouse is moving
 * @param	callback	the callback method to be invoked
 * @return	index of the callback
 */
GENTICS.Utils.Position.addMouseMoveCallback = function (callback) {
	this.mouseMoveCallbacks.push(callback);
	return (this.mouseMoveCallbacks.length - 1);
};

// set interval to update the scroll position
// NOTE high timeout of 500ms is required here
// to prevent issues with mousemove. too short
// timeouts will interfere with mouse movement
// detection
setInterval("GENTICS.Utils.Position.update()", 500);

// listen to the mousemove event and update positions
jQuery('html').mousemove(function (e) {
	GENTICS.Utils.Position.Mouse.x = e.pageX;
	GENTICS.Utils.Position.Mouse.y = e.pageY;
});/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof GENTICS == 'undefined' || !GENTICS) {
	var GENTICS = {};
}

if (typeof GENTICS.Utils == 'undefined' || !GENTICS.Utils) {
	GENTICS.Utils = {};
}

if (typeof GENTICS.Utils.Dom == 'undefined' || !GENTICS.Utils.Dom) {
	/**
	 * @namespace GENTICS.Utils
	 * @class Dom provides methods to get information about the DOM and to manipulate it
	 * @singleton
	 */
	GENTICS.Utils.Dom = function () {};
} 

/**
 * Tags which can safely be merged
 * @hide
 */
GENTICS.Utils.Dom.prototype.mergeableTags = ['a', 'b', 'code', 'del', 'em', 'i', 'ins', 'strong', 'sub', 'sup', '#text'];

/**
 * Tags which do not mark word boundaries
 * @hide
 */
GENTICS.Utils.Dom.prototype.nonWordBoundaryTags = ['a', 'b', 'code', 'del', 'em', 'i', 'ins', 'span', 'strong', 'sub', 'sup', '#text'];

/**
 * Tags which are considered 'nonempty', even if they have no children (or not data)
 * TODO: finish this list
 * @hide
 */
GENTICS.Utils.Dom.prototype.nonEmptyTags = ['br'];

/**
 * Tags which make up Flow Content or Phrasing Content, according to the HTML 5 specification,
 * @see http://dev.w3.org/html5/spec/Overview.html#flow-content
 * @see http://dev.w3.org/html5/spec/Overview.html#phrasing-content
 * @hide
 */
GENTICS.Utils.Dom.prototype.tags = {
	'flow' : [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
			'b', 'bdo', 'blockquote', 'br', 'button', 'canvas', 'cite', 'code',
			'command', 'datalist', 'del', 'details', 'dfn', 'div', 'dl', 'em',
			'embed', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3',
			'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'iframe', 'img',
			'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math',
			'menu', 'meter', 'nav', 'noscript', 'object', 'ol', 'output', 'p',
			'pre', 'progress', 'q', 'ruby', 'samp', 'script', 'section',
			'select', 'small', 'span', 'strong', 'style', 'sub', 'sup', 'svg',
			'table', 'textarea', 'time', 'ul', 'var', 'video', 'wbr', '#text' ],
	'phrasing' : [ 'a', 'abbr', 'area', 'audio', 'b', 'bdo', 'br', 'button',
			'canvas', 'cite', 'code', 'command', 'datalist', 'del', 'dfn',
			'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
			'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
			'object', 'output', 'progress', 'q', 'ruby', 'samp', 'script',
			'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg',
			'textarea', 'time', 'var', 'video', 'wbr', '#text' ]
};

/**
 * Possible children of tags, according to the HTML 5
 * specification.
 * See http://dev.w3.org/html5/spec/Overview.html#elements-1
 * Moved to http://www.whatwg.org/specs/web-apps/current-work/#elements-1
 * @hide
 */
GENTICS.Utils.Dom.prototype.children = {
	'a' : 'phrasing', // transparent
	'abbr' : 'phrasing',
	'address' : 'flow',
	'area' : 'empty',
	'article' : 'flow',
	'aside' : 'flow',
	'audio' : 'source', // transparent
	'b' : 'phrasing',
	'base' : 'empty',
	'bdo' : 'phrasing',
	'blockquote' : 'flow',
	'body' : 'flow',
	'br' : 'empty',
	'button' : 'phrasing',
	'canvas' : 'phrasing', // transparent
	'caption' : 'flow',
	'cite' : 'phrasing',
	'code' : 'phrasing',
	'col' : 'empty',
	'colgroup' : 'col',
	'command' : 'empty',
	'datalist' : ['phrasing', 'option'],
	'dd' : 'flow',
	'del' : 'phrasing',
	'div' : 'flow',
	'details' : ['summary', 'flow'],
	'dfn' : 'flow',
	'div' : 'flow',
	'dl' : ['dt','dd'],
	'dt' : 'phrasing', // varies
	'em' : 'phrasing',
	'embed' : 'empty',
	'fieldset' : ['legend', 'flow'],
	'figcaption': 'flow',
	'figure' :  ['figcaption', 'flow'],
	'footer' : 'flow',
	'form' : 'flow',
	'h1' : 'phrasing',
	'h2' : 'phrasing',
	'h3' : 'phrasing',
	'h4' : 'phrasing',
	'h5' : 'phrasing',
	'h6' : 'phrasing',
	//head
	'header' : 'flow',
	'hgroup' : ['h1','h2','h3','h4','h5','h6'],
	'hr' : 'empty',
	//html :)
	'i' : 'phrasing',
	'iframe' : '#text',
	'img' : 'empty',
	'input' : 'empty',
	'ins' : 'phrasing', // transparent
	'kbd' : 'phrasing',
	'keygen' : 'empty',
	'label' : 'phrasing',
	'legend' : 'phrasing',
	'li' : 'flow',
	'link' : 'empty',
	'map' : 'area', // transparent
	'mark' : 'phrasing',
	'menu' : ['li', 'flow'],
	'meta' : 'empty',
	'meter' : 'phrasing',
	'nav' : 'flow',
	'noscript' : 'phrasing', // varies
	'object' : 'param', // transparent
	'ol' : 'li',
	'optgroup' : 'option',
	'option' : '#text',
	'output' : 'phrasing',
	'p' : 'phrasing',
	'param' : 'empty',
	'pre' : 'phrasing',
	'progress' : 'phrasing',
	'q' : 'phrasing',
	'rp' : 'phrasing',
	'rt' : 'phrasing',
	'ruby' : ['phrasing', 'rt', 'rp'],
	's' : 'phrasing',
	'samp' : 'pharsing',
	'script' : '#script', //script 
	'section' : 'flow',
	'select' : ['option', 'optgroup'],
	'small' : 'phrasing',
	'source' : 'empty',
	'span' : 'phrasing',
	'strong' : 'phrasing',
	'style' : 'phrasing', // varies
	'sub' : 'phrasing',
	'summary' : 'phrasing',
	'sup' : 'phrasing',
	'table' : ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr'],
	'tbody' : 'tr',
	'td' : 'flow',
	'textarea' : '#text',
	'tfoot' : 'tr',
	'th' : 'phrasing',
	'thead' : 'tr',
	'time' : 'phrasing',
	'title' : '#text',
	'tr' : ['th', 'td'],
	'track' : 'empty',
	'ul' : 'li',
	'var' : 'phrasing',
	'video' : 'source', // transparent
	'wbr' : 'empty'
};

/**
 * List of nodenames of blocklevel elements
 * TODO: finish this list
 * @hide
 */
GENTICS.Utils.Dom.prototype.blockLevelElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'pre'];

/**
 * List of nodenames of list elements
 * @hide
 */
GENTICS.Utils.Dom.prototype.listElements = ['li', 'ol',	'ul'];

/**
 * Splits a DOM element at the given position up until the limiting object(s), so that it is valid HTML again afterwards.
 * @param {RangeObject} range Range object that indicates the position of the splitting.
 * 				This range will be updated, so that it represents the same range as before the split.
 * @param {jQuery} limit Limiting node(s) for the split. 
 * 				The limiting node will not be included in the split itself.
 * 				If no limiting object is set, the document body will be the limiting object.
 * @param {boolean} atEnd If set to true, the DOM will be splitted at the end of the range otherwise at the start.
 * @return {object} jQuery object containing the two root DOM objects of the split, true if the DOM did not need to be split or false if the DOM could not be split
 * @method
 */
GENTICS.Utils.Dom.prototype.split = function (range, limit, atEnd) {
	var splitElement = jQuery(range.startContainer);
	var splitPosition = range.startOffset;
	
	if (atEnd) {
		splitElement = jQuery(range.endContainer);
		splitPosition = range.endOffset;
	}
	
	if (limit.length < 1) {
		limit = jQuery(document.body);
	}
	
	// we may have to update the range if it is not collapsed and we are splitting at the start
	var updateRange = (!range.isCollapsed() && !atEnd);
	
	// find the path up to the highest object that will be splitted
	var path;
	var parents = splitElement.parents().get();
	parents.unshift(splitElement.get(0));
		
	jQuery.each(parents, function(index, element) {
		var isLimit = limit.filter(
				function(){
					return this == element;
				}).length;
		if (isLimit) {
			if (index > 0) {
				path = parents.slice(0, index);
			}
			return false;
		}
	});
	
	// nothing found to split -> return here
	if (! path) {
		return true;
	}
	
	path = path.reverse();
	var newDom;
	var insertElement;
	
	// iterate over the path, create new dom nodes for every element and move 
	// the contents right of the split to the new element 
	for(var i=0; i < path.length; i++) {
		var element = path[i];
		if (i === path.length -1) {
			// last element in the path -> we have to split it
			var secondPart;
			
			// split the last part into two parts
			if (element.nodeType === 3) {
				// text node
				secondPart = document.createTextNode(element.data.substring(splitPosition, element.data.length));
				element.data = element.data.substring(0, splitPosition);	
			} else {
				// other nodes
				var newElement = jQuery(element).clone(false).empty();
				var children = jQuery(element).contents();
				secondPart = newElement.append(children.slice(splitPosition, children.length)).get(0);
			}
			
			// update the range if necessary
			if (updateRange && range.endContainer === element) {
				range.endContainer = secondPart;
				range.endOffset -= splitPosition;
				range.clearCaches();
			}
			
			// add the second part
			if (insertElement) {
				insertElement.prepend(secondPart);
			} else {
				jQuery(element).after(secondPart);
			}
		} else {
			// create the new element of the same type and prepend it to the previously created element
			var newElement = jQuery(element).clone(false).empty();
			
			if (!newDom) {
				newDom = newElement;
				insertElement = newElement;
			} else {
				insertElement.prepend(newElement);
				insertElement = newElement;
			}
			
			// move all contents right of the split to the new element
			var next;
			while (next = path[i+1].nextSibling) {
				insertElement.append(next);
			}
			
			// update the range if necessary
			if (updateRange && range.endContainer === element) {
				range.endContainer = newElement.get(0);
				var prev = path[i+1];
				var offset = 0;
				while (prev = prev.previousSibling) {
					offset++;
				}
				range.endOffset -= offset;
				range.clearCaches();
			}
		}
	}
	
	// append the new dom
	jQuery(path[0]).after(newDom);

	return jQuery([path[0], newDom ? newDom.get(0) : secondPart]);
};

/**
 * Check whether the HTML 5 specification allows direct nesting of the given DOM
 * objects.
 * @param {object} outerDOMObject
 *            outer (nesting) DOM Object
 * @param {object} innerDOMObject
 *            inner (nested) DOM Object
 * @return {boolean} true when the nesting is allowed, false if not
 * @method
 */
GENTICS.Utils.Dom.prototype.allowsNesting = function (outerDOMObject, innerDOMObject) {
	if (!outerDOMObject || !outerDOMObject.nodeName || !innerDOMObject
			|| !innerDOMObject.nodeName) {
		return false;
	}

	var outerNodeName = outerDOMObject.nodeName.toLowerCase();
	var innerNodeName = innerDOMObject.nodeName.toLowerCase();

	if (!this.children[outerNodeName]) {
		return false;
	}

	// check whether the nesting is configured by node names (like for table)
	if (this.children[outerNodeName] == innerNodeName) {
		return true;
	}
	if (jQuery.isArray(this.children[outerNodeName])
			&& jQuery.inArray(innerNodeName, this.children[outerNodeName]) >= 0) {
		return true;
	}

	if (jQuery.isArray(this.tags[this.children[outerNodeName]])
			&& jQuery.inArray(innerNodeName,
					this.tags[this.children[outerNodeName]]) >= 0) {
		return true;
	}

	return false;
};

/**
 * Apply the given markup additively to the given range. The given rangeObject will be modified if necessary
 * @param {GENTICS.Utils.RangeObject} rangeObject range to which the markup shall be added
 * @param {jQuery} markup markup to be applied as jQuery object
 * @param {boolean} allownesting true when nesting of the added markup is allowed, false if not (default: false)
 * @method
 */
GENTICS.Utils.Dom.prototype.addMarkup = function (rangeObject, markup, nesting) {
	// split partially contained text nodes at the start and end of the range
	if (rangeObject.startContainer.nodeType == 3 && rangeObject.startOffset > 0
			&& rangeObject.startOffset < rangeObject.startContainer.data.length) {
		this.split(rangeObject, jQuery(rangeObject.startContainer).parent(),
			false);
	}
	if (rangeObject.endContainer.nodeType == 3 && rangeObject.endOffset > 0
			&& rangeObject.endOffset < rangeObject.endContainer.data.length) {
		this.split(rangeObject, jQuery(rangeObject.endContainer).parent(),
			true);
	}

	// get the range tree
	var rangeTree = rangeObject.getRangeTree();
	this.recursiveAddMarkup(rangeTree, markup, rangeObject, nesting);

	// cleanup DOM
	this.doCleanup({'merge' : true, 'removeempty' : true}, rangeObject);
};

/**
 * Recursive helper method to add the given markup to the range
 * @param rangeTree rangetree at the current level
 * @param markup markup to be applied
 * @param rangeObject range object, which eventually is updated
 * @param nesting true when nesting of the added markup is allowed, false if not
 * @hide
 */
GENTICS.Utils.Dom.prototype.recursiveAddMarkup = function (rangeTree, markup, rangeObject, nesting) {
	// iterate through all rangetree objects of that level
	for (var i = 0; i < rangeTree.length; ++i) {
		// check whether the rangetree object is fully contained and the markup may be wrapped around the object
		if (rangeTree[i].type == 'full' && this.allowsNesting(markup.get(0), rangeTree[i].domobj)) {
			// we wrap the object, when
			// 1. nesting of markup is allowed or the node is not of the markup to be added
			// 2. the node an element node or a non-empty text node
			if ((nesting || rangeTree[i].domobj.nodeName != markup.get(0).nodeName)
					&& (rangeTree[i].domobj.nodeType != 3 || jQuery
							.trim(rangeTree[i].domobj.data).length != 0)) {
				// wrap the object
				jQuery(rangeTree[i].domobj).wrap(markup);

				// TODO eventually update the range (if it changed)

				// when nesting is not allowed, we remove the markup from the inner element
				if (!nesting && rangeTree[i].domobj.nodeType != 3) {
					var innerRange = new GENTICS.Utils.RangeObject();
					innerRange.startContainer = innerRange.endContainer = rangeTree[i].domobj.parentNode;
					innerRange.startOffset = 0;
					innerRange.endOffset = innerRange.endContainer.childNodes.length;
					this.removeMarkup(innerRange, markup, jQuery(rangeTree[i].domobj.parentNode));
				}
			}
		} else {
			// TODO check whether the object may be replaced by the given markup
			if (false) {
				// TODO replace
			} else {
				// recurse into the children (if any), but not if nesting is not
				// allowed and the object is of the markup to be added
				if (nesting || rangeTree[i].domobj.nodeName != markup.get(0).nodeName) {
					if (rangeTree[i].children && rangeTree[i].children.length > 0) {
						this.recursiveAddMarkup(rangeTree[i].children, markup);
					}
				}
			}
		}
	}
};

/**
 * Find the highest occurrence of a node with given nodename within the parents
 * of the start. When limit objects are given, the search stops there.
 * The limiting object is of the found type, it won't be considered
 * @param {DOMObject} start start object
 * @param {String} nodeName name of the node to search for (case-insensitive)
 * @param {jQuery} limit Limiting node(s) as jQuery object (if none given, the search will stop when there are no more parents)
 * @return {DOMObject} the found DOM object or undefined
 * @method
 */
GENTICS.Utils.Dom.prototype.findHighestElement = function (start, nodeName, limit) {
	var testObject = start;
	nodeName = nodeName.toLowerCase();

	// helper function to stop when we reach a limit object
	var isLimit = limit ? function () {
		return limit.filter(
				function() {
					return testObject == this;
				}
		).length;
	} : function () {
		return false;
	};

	// this will be the highest found markup object (up to a limit object)
	var highestObject = undefined;

	// now get the highest parent that has the given markup (until we reached
	// one of the limit objects or there are no more parent nodes)
	while (!isLimit() && testObject) {
		if (testObject.nodeName.toLowerCase() == nodeName) {
			highestObject = testObject;
		}
		testObject = testObject.parentNode;
	};

	return highestObject;
};

/**
 * Remove the given markup from the given range. The given rangeObject will be modified if necessary
 * TODO: add parameter deep/shallow
 * @param {GENTICS.Utils.RangeObject} rangeObject range from which the markup shall be removed
 * @param {jQuery} markup markup to be removed as jQuery object
 * @param {jQuery} limit Limiting node(s) as jQuery object
 * @method
 */
GENTICS.Utils.Dom.prototype.removeMarkup = function (rangeObject, markup, limit) {
	var nodeName = markup.get(0).nodeName;
	var startSplitLimit = this.findHighestElement(rangeObject.startContainer, nodeName, limit);
	var endSplitLimit = this.findHighestElement(rangeObject.endContainer, nodeName, limit);
	var didSplit = false;

	if (startSplitLimit /* && rangeObject.startOffset > 0 */) {
		// when the start is in the start of its container, we don't split
		this.split(rangeObject, jQuery(startSplitLimit).parent(), false);
		didSplit = true;
	}

	if (endSplitLimit) {
		// when the end is in the end of its container, we don't split
//		if (rangeObject.endContainer.nodeType == 3 && rangeObject.endOffset < rangeObject.endContainer.data.length) {
			this.split(rangeObject, jQuery(endSplitLimit).parent(), true);
			didSplit = true;
//		}
//		if (rangeObject.endContainer.nodeType == 1 && rangeObject.endOffset < rangeObject.childNodes.length) {
//			this.split(rangeObject, jQuery(endSplitLimit).parent(), true);
//			didSplit = true;
//		}
	}

	// when we split the DOM, we maybe need to correct the range
	if (didSplit) {
		rangeObject.correctRange();
	}

	// find the highest occurrence of the markup
	var highestObject = this.findHighestElement(rangeObject.getCommonAncestorContainer(), nodeName, limit);
	var root = highestObject ? highestObject.parentNode : undefined;

	// construct the range tree
	var rangeTree = rangeObject.getRangeTree(root);
	// remove the markup from the range tree
	this.recursiveRemoveMarkup(rangeTree, markup);
	
	// cleanup DOM
	this.doCleanup({'merge' : true, 'removeempty' : true}, rangeObject, root);
};

/**
 * TODO: pass the range itself and eventually update it if necessary
 * Recursive helper method to remove the given markup from the range
 * @param rangeTree rangetree at the current level
 * @param markup markup to be applied
 * @hide
 */
GENTICS.Utils.Dom.prototype.recursiveRemoveMarkup = function (rangeTree, markup) {
	// iterate over the rangetree objects of this level
	for (var i = 0; i < rangeTree.length; ++i) {
		// check whether the object is the markup to be removed and is fully into the range
		if (rangeTree[i].type == 'full' && rangeTree[i].domobj.nodeName == markup.get(0).nodeName) {
			// found the markup, so remove it
			var content = jQuery(rangeTree[i].domobj).contents();
			if (content.length > 0) {
				// when the object has children, we unwrap them
				content.first().unwrap();
			} else {
				// obj has no children, so just remove it
				jQuery(rangeTree[i].domobj).remove();
			}
		}

		// if the object has children, we do the recursion now
		if (rangeTree[i].children) {
			this.recursiveRemoveMarkup(rangeTree[i].children, markup);
		}
	}
};

/**
 * Cleanup the DOM, starting with the given startobject (or the common ancestor container of the given range)
 * Cleanup modes (given as properties in 'cleanup'):
 * <pre>
 * - merge: merges multiple successive nodes of same type, if this is allowed, starting at the children of the given node (defaults to false)
 * - removeempty: removes empty element nodes (defaults to false)
 * </pre>
 * Example for calling this method:<br/>
 * <code>GENTICS.Utils.Dom.doCleanup({merge:true,removeempty:false}, range)</code>
 * @param {object} cleanup type of cleanup to be done
 * @param {GENTICS.Utils.RangeObject} rangeObject range which is eventually updated
 * @param {DOMObject} start start object, if not given, the commonancestorcontainer is used as startobject insted
 * @return {boolean} true when the range (startContainer/startOffset/endContainer/endOffset) was modified, false if not
 * @method
 */
GENTICS.Utils.Dom.prototype.doCleanup = function(cleanup, rangeObject, start) {
	var that = this;

	if (typeof cleanup == 'undefined') {
		cleanup = {'merge' : true, 'removeempty' : true};
	}

	if (typeof start == 'undefined') {
		if (rangeObject) {
			start = rangeObject.getCommonAncestorContainer();
		}
	}
	// remember the previous node here (successive nodes of same type will be merged into this)
	var prevNode = false;
	// check whether the range needed to be modified during merging
	var modifiedRange = false;
	// get the start object
	var startObject = jQuery(start);

	// iterate through all sub nodes
	startObject.contents().each(function(index) {
		// decide further actions by node type
		switch(this.nodeType) {
		// found a non-text node
		case 1:
			if (prevNode && prevNode.nodeName == this.nodeName) {
				// found a successive node of same type

				// now we check whether the selection starts or ends in the mother node after the current node
				if (rangeObject.startContainer === startObject && rangeObject.startOffset > index) {
					// there will be one less object, so reduce the startOffset by one
					rangeObject.startOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}
				if (rangeObject.endContainer === startObject && rangeObject.endOffset > index) {
					// there will be one less object, so reduce the endOffset by one
					rangeObject.endOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}

				// merge the contents of this node into the previous one
				jQuery(prevNode).append(jQuery(this).contents());

				// after merging, we eventually need to cleanup the prevNode again
				modifiedRange |= that.doCleanup(cleanup, rangeObject, prevNode);

				// remove this node
				jQuery(this).remove();
			} else {
				// do the recursion step here
				modifiedRange |= that.doCleanup(cleanup, rangeObject, this);

				// eventually remove empty elements
				var removed = false;
				if (cleanup.removeempty) {
					if (GENTICS.Utils.Dom.isBlockLevelElement(this) && this.childNodes.length == 0) {
						jQuery(this).remove();
						removed = true;
					}
					if (jQuery.inArray(this.nodeName.toLowerCase(), that.mergeableTags) >= 0 
							&& jQuery(this).text().length == 0 && this.childNodes.length == 0) {
						jQuery(this).remove();
						removed = true;
					}
				}

				// when the current node was not removed, we eventually store it as previous (mergeable) tag
				if (!removed) {
					if (jQuery.inArray(this.nodeName.toLowerCase(), that.mergeableTags) >= 0) {
						prevNode = this;
					} else {
						prevNode = false;
					}
				}
			}

			break;
		// found a text node
		case 3:
			// found a text node
			if (prevNode && prevNode.nodeType == 3 && cleanup.merge) {
				// the current text node will be merged into the last one, so
				// check whether the selection starts or ends in the current
				// text node
				if (rangeObject.startContainer === this) {
					// selection starts in the current text node

					// update the start container to the last node
					rangeObject.startContainer = prevNode;

					// update the start offset
					rangeObject.startOffset += prevNode.length;

					// set the flag for range modification
					modifiedRange = true;
				}
				
				if (rangeObject.endContainer === this) {
					// selection ends in the current text node

					// update the end container to be the last node
					rangeObject.endContainer = prevNode;

					// update the end offset
					rangeObject.endOffset += prevNode.length;

					// set the flag for range modification
					modifiedRange = true;
				}

				// now we check whether the selection starts or ends in the mother node after the current node
				if (rangeObject.startContainer === startObject && rangeObject.startOffset > index) {
					// there will be one less object, so reduce the startOffset by one
					rangeObject.startOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}
				if (rangeObject.endContainer === startObject && rangeObject.endOffset > index) {
					// there will be one less object, so reduce the endOffset by one
					rangeObject.endOffset -= 1;
					// set the flag for range modification
					modifiedRange = true;
				}

				// now append the contents of the current text node into the previous
				prevNode.data += this.data;

				// remove this text node
				jQuery(this).remove();
			} else {
				// remember it as the last text node
				prevNode = this;
			}
			break;
		}
	});

	// eventually remove the startnode itself
	if (cleanup.removeempty
			&& GENTICS.Utils.Dom.isBlockLevelElement(start)
			&& (!start.childNodes || start.childNodes.length == 0)) {
		if (rangeObject.startContainer == start) {
			rangeObject.startContainer = start.parentNode;
			rangeObject.startOffset = GENTICS.Utils.Dom.getIndexInParent(start);
		}
		if (rangeObject.endContainer == start) {
			rangeObject.endContainer = start.parentNode;
			rangeObject.endOffset = GENTICS.Utils.Dom.getIndexInParent(start);
		}
		startObject.remove();
		modifiedRange = true;
	}

	if (modifiedRange) {
		rangeObject.clearCaches();
	}

	return modifiedRange;
};

/**
 * Get the index of the given node within its parent node
 * @param {DOMObject} node node to check
 * @return {Integer} index in the parent node or false if no node given or node has no parent
 * @method
 */
GENTICS.Utils.Dom.prototype.getIndexInParent = function (node) {
	if (!node) {
		return false;
	}
	var index = 0;
	var check = node.previousSibling;
	while(check) {
		index++;
		check = check.previousSibling;
	};

	return index;
};

/**
 * Check whether the given node is a blocklevel element
 * @param {DOMObject} node node to check
 * @return {boolean} true if yes, false if not (or null)
 * @method
 */
GENTICS.Utils.Dom.prototype.isBlockLevelElement = function (node) {
	if (!node) {
		return false;
	}
	if (node.nodeType == 1 && jQuery.inArray(node.nodeName.toLowerCase(), this.blockLevelElements) >= 0) {
		return true;
	} else {
		return false;
	}
};

/**
 * Check whether the given node is a linebreak element
 * @param {DOMObject} node node to check
 * @return {boolean} true for linebreak elements, false for everything else
 * @method
 */
GENTICS.Utils.Dom.prototype.isLineBreakElement = function (node) {
	if (!node) {
		return false;
	}
	return node.nodeType == 1 && node.nodeName.toLowerCase() == 'br';
};

/**
 * Check whether the given node is a list element
 * @param {DOMObject} node node to check
 * @return {boolean} true for list elements (li, ul, ol), false for everything else
 * @method
 */
GENTICS.Utils.Dom.prototype.isListElement = function (node) {
	if (!node) {
		return false;
	}
	return node.nodeType == 1 && jQuery.inArray(node.nodeName.toLowerCase(), this.listElements) >= 0;
};

/**
 * This method checks, whether the passed dom object is a dom object, that would
 * be split in cases of pressing enter. This currently is true for paragraphs
 * and headings
 * @param {DOMObject} el
 *            dom object to check
 * @return {boolean} true for split objects, false for other
 * @method
 */
GENTICS.Utils.Dom.prototype.isSplitObject = function(el) {
	if (el.nodeType === 1){
		switch(el.nodeName.toLowerCase()) {
		case 'p':
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
		case 'li':
			return true;
		}
	}
	return false;
};

/**
 * Starting with the given position (between nodes), search in the given direction to an adjacent notempty text node
 * @param {DOMObject} parent parent node containing the position
 * @param {Integer} index index of the position within the parent node
 * @param {boolean} searchleft true when search direction is 'left' (default), false for 'right'
 * @param {object} stopat define at which types of element we shall stop, may contain the following properties
 * <pre>
 * - blocklevel (default: true)
 * - list (default: true)
 * - linebreak (default: true)
 * </pre>
 * @return {DOMObject} the found text node or false if none found
 * @method
 */
GENTICS.Utils.Dom.prototype.searchAdjacentTextNode = function (parent, index, searchleft, stopat) {
	if (!parent || parent.nodeType != 1 || index < 0 || index > parent.childNodes.length) {
		return false;
	}

	if (typeof stopat == 'undefined') {
		stopat = {'blocklevel' : true, 'list' : true, 'linebreak' : true};
	}

	if (stopat.blocklevel == 'undefined') {
		stopal.blocklevel = true;
	}
	if (stopat.list == 'undefined') {
		stopal.list = true;
	}
	if (stopat.linebreak == 'undefined') {
		stopal.linebreak = true;
	}

	if (typeof searchleft == 'undefined') {
		searchleft = true;
	}

	var nextNode = undefined;
	var currentParent = parent;

	// start at the node left/right of the given position
	if (searchleft && index > 0) {
		nextNode = parent.childNodes[index - 1];
	}
	if (!searchleft && index < parent.childNodes.length) {
		nextNode = parent.childNodes[index];
	}

	while (typeof currentParent != 'undefined') {
		if (!nextNode) {
			// no next node found, check whether the parent is a blocklevel element
			if (stopat.blocklevel && this.isBlockLevelElement(currentParent)) {
				// do not leave block level elements
				return false;
			} else if (stopat.list && this.isListElement(currentParent)) {
				// do not leave list elements
				return false;
			} else {
				// continue with the parent
				nextNode = searchleft ? currentParent.previousSibling : currentParent.nextSibling;
				currentParent = currentParent.parentNode;
			}
		} else if (nextNode.nodeType == 3 && jQuery.trim(nextNode.data).length > 0) {
			// we are lucky and found a notempty text node
			return nextNode;
		} else if (stopat.blocklevel && this.isBlockLevelElement(nextNode)) {
			// we found a blocklevel element, stop here
			return false;
		} else if (stopat.linebreak && this.isLineBreakElement(nextNode)) {
			// we found a linebreak, stop here
			return false;
		} else if (stopat.list && this.isListElement(nextNode)) {
			// we found a linebreak, stop here
			return false;
		} else if (nextNode.nodeType == 3) {
			// we found an empty text node, so step to the next
			nextNode = searchleft ? nextNode.previousSibling : nextNode.nextSibling;
		} else {
			// we found a non-blocklevel element, step into
			currentParent = nextNode;
			nextNode = searchleft ? nextNode.lastChild : nextNode.firstChild;
		}
	};
};

/**
 * Insert the given DOM Object into the start/end of the given range. The method
 * will find the appropriate place in the DOM tree for inserting the given
 * object, and will eventually split elements in between. The given range will
 * be updated if necessary. The updated range will NOT embrace the inserted
 * object, which means that the object is actually inserted before or after the
 * given range (depending on the atEnd parameter)
 * 
 * @param {jQuery}
 *            object object to insert into the DOM
 * @param {GENTICS.Utils.RangeObject}
 *            range range where to insert the object (at start or end)
 * @param {jQuery}
 *            limit limiting object(s) of the DOM modification
 * @param {boolean}
 *            atEnd true when the object shall be inserted at the end, false for
 *            insertion at the start (default)
 * @return true if the object could be inserted, false if not.
 * @method
 */
GENTICS.Utils.Dom.prototype.insertIntoDOM = function (object, range, limit, atEnd) {
	// first find the appropriate place to insert the given object
	var parentElements = range.getContainerParents(limit, atEnd);
	var that = this;
	var newParent;

	if (!limit) {
		limit = jQuery(document.body);
	}

	// if no parent elements exist (up to the limit), the new parent will be the
	// limiter itself
	if (parentElements.length == 0) {
		newParent = limit.get(0);
	} else {
		jQuery.each(parentElements, function (index, parent) {
			if (that.allowsNesting(parent, object.get(0))) {
				newParent = parent;
				return false;
			}
		});
	}

	if (typeof newParent == 'undefined' && limit.length > 0) {
		// found no possible new parent, so split up to the limit object
		// TODO check whether it is allowed to insert the element at all
		newParent = limit.get(0);
	}

	if (typeof newParent != 'undefined') {
		// we found a possible new parent, so we split the DOM up to the new parent
		var splitParts = this.split(range, jQuery(newParent), atEnd);
		if (splitParts === true) {
			// DOM was not split (there was no need to split it), insert the new object anyway
			var container = range.startContainer;
			var offset = range.startOffset;
			if (atEnd) {
				container = range.endContainer;
				offset = range.endOffset;
			}
			if (offset == 0) {
				// insert right before the first element in the container
				var contents = jQuery(container).contents();
				if (contents.length > 0) {
					contents.eq(0).before(object);
				} else {
					jQuery(container).append(object);
				}
				return true;
			} else {
				// insert right after the element at offset-1
				jQuery(container).contents().eq(offset-1).after(object);
				return true;
			}
		} else if (splitParts) {
			// if the DOM could be split, we insert the new object in between the split parts
			splitParts.eq(0).after(object);
			return true;
		} else {
			// could not split, so could not insert
			return false;
		}
	} else {
		// found no possible new parent, so we shall not insert
		return false;
	}
};

/**
 * Remove the given DOM object from the DOM and modify the given range to reflect the user expected range after the object was removed
 * TODO: finish this
 * @param {DOMObject} object DOM object to remove
 * @param {GENTICS.Utils.RangeObject} range range which eventually be modified
 * @param {boolean} preserveContent true if the contents of the removed DOM object shall be preserved, false if not (default: false)
 * @return true if the DOM object could be removed, false if not
 * @hide
 */
GENTICS.Utils.Dom.prototype.removeFromDOM = function (object, range, preserveContent) {
	if (preserveContent) {
		// check whether the range will need modification
		var indexInParent = this.getIndexInParent(object);
		var numChildren = jQuery(object).contents().length;
		var parent = object.parentNode;

		if (range.startContainer == parent && range.startOffset > indexInParent) {
			range.startOffset += numChildren - 1;
		} else if (range.startContainer == object) {
			range.startContainer = parent;
			range.startOffset = indexInParent + range.startOffset;
		}

		if (range.endContainer == parent && range.endOffset > indexInParent) {
			range.endOffset += numChildren - 1;
		} else if (range.endContainer == object) {
			range.endContainer = parent;
			range.endOffset = indexInParent + range.endOffset;
		}

		// we simply unwrap the children of the object
		jQuery(object).contents().unwrap();

		// eventually do cleanup
		this.doCleanup({'merge' : true}, range, parent);
	} else {
		// TODO
	}
};

/**
 * Extend the given range to have start and end at the nearest word boundaries to the left (start) and right (end)
 * @param {GENTICS.Utils.RangeObject} range range to be extended
 * @param {boolean} fromBoundaries true if extending will also be done, if one or both ends of the range already are at a word boundary, false if not, default: false
 * @method
 */
GENTICS.Utils.Dom.prototype.extendToWord = function (range, fromBoundaries) {
	// search the word boundaries to the left and right
	var leftBoundary = this.searchWordBoundary(range.startContainer, range.startOffset, true);
	var rightBoundary = this.searchWordBoundary(range.endContainer, range.endOffset, false);

	// check whether we must not extend the range from word boundaries
	if (!fromBoundaries) {
		// we only extend the range if both ends would be different
		if (range.startContainer == leftBoundary.container && range.startOffset == leftBoundary.offset) {
			return;
		}
		if (range.endContainer == rightBoundary.container && range.endOffset == rightBoundary.offset) {
			return;
		}
	}

	// set the new boundaries
	range.startContainer = leftBoundary.container;
	range.startOffset = leftBoundary.offset;
	range.endContainer = rightBoundary.container;
	range.endOffset = rightBoundary.offset;

	// correct the range
	range.correctRange();

	// clear caches
	range.clearCaches();
};

/**
 * Helper method to check whether the given DOM object is a word boundary.
 * @param {DOMObject} object DOM object in question
 * @return {boolean} true when the DOM object is a word boundary, false if not
 * @hide
 */
GENTICS.Utils.Dom.prototype.isWordBoundaryElement = function (object) {
	if (!object || !object.nodeName) {
		return false;
	}
	return jQuery.inArray(object.nodeName.toLowerCase(), this.nonWordBoundaryTags) == -1;
};

/**
 * Search for the next word boundary, starting at the given position
 * @param {DOMObject} container container of the start position
 * @param {Integer} offset offset of the start position
 * @param {boolean} searchleft true for searching to the left, false for searching to the right (default: true)
 * @return {object} object with properties 'container' and 'offset' marking the found word boundary
 * @method
 */
GENTICS.Utils.Dom.prototype.searchWordBoundary = function (container, offset, searchleft) {
	if (typeof searchleft == 'undefined') {
		searchleft = true;
	}
	var boundaryFound = false;
	while (!boundaryFound) {
		// check the node type
		if (container.nodeType == 3) {
			// we are currently in a text node

			// find the nearest word boundary character
			if (!searchleft) {
				// search right
				var wordBoundaryPos = container.data.substring(offset).search(/\W/);
				if (wordBoundaryPos != -1) {
					// found a word boundary
					offset = offset + wordBoundaryPos;
					boundaryFound = true;
				} else {
					// found no word boundary, so we set the position after the container
					offset = this.getIndexInParent(container) + 1;
					container = container.parentNode;
				}
			} else {
				// search left
				var wordBoundaryPos = container.data.substring(0, offset).search(/\W/);
				var tempWordBoundaryPos = wordBoundaryPos;
				while (tempWordBoundaryPos != -1) {
					wordBoundaryPos = tempWordBoundaryPos;
					tempWordBoundaryPos = container.data.substring(
							wordBoundaryPos + 1, offset).search(/\W/);
					if (tempWordBoundaryPos != -1) {
						tempWordBoundaryPos = tempWordBoundaryPos + wordBoundaryPos + 1;
					}
				}

				if (wordBoundaryPos != -1) {
					// found a word boundary
					offset = wordBoundaryPos + 1;
					boundaryFound = true;
				} else {
					// found no word boundary, so we set the position before the container
					offset = this.getIndexInParent(container);
					container = container.parentNode;
				}
			}
		} else if (container.nodeType == 1) {
			// we are currently in an element node (between nodes)

			if (!searchleft) {
				// check whether there is an element to the right
				if (offset < container.childNodes.length) {
					// there is an element to the right, check whether it is a word boundary element
					if (this.isWordBoundaryElement(container.childNodes[offset])) {
						// we are done
						boundaryFound = true;
					} else {
						// element to the right is no word boundary, so enter it
						container = container.childNodes[offset];
						offset = 0;
					}
				} else {
					// no element to the right, check whether the element itself is a boundary element
					if (this.isWordBoundaryElement(container)) {
						// we are done
						boundaryFound = true;
					} else {
						// element itself is no boundary element, so go to parent
						offset = this.getIndexInParent(container) + 1;
						container = container.parentNode;
					}
				}
			} else {
				// check whether there is an element to the left
				if (offset > 0) {
					// there is an element to the left, check whether it is a word boundary element
					if (this.isWordBoundaryElement(container.childNodes[offset - 1])) {
						// we are done
						boundaryFound = true;
					} else {
						// element to the left is no word boundary, so enter it
						container = container.childNodes[offset - 1];
						offset = container.nodeType == 3 ? container.data.length : container.childNodes.length;
					}
				} else {
					// no element to the left, check whether the element itself is a boundary element
					if (this.isWordBoundaryElement(container)) {
						// we are done
						boundaryFound = true;
					} else {
						// element itself is no boundary element, so go to parent
						offset = this.getIndexInParent(container);
						container = container.parentNode;
					}
				}
			}
		}
	}

	if (container.nodeType != 3) {
		var textNode = this.searchAdjacentTextNode(container, offset, !searchleft);
		if (textNode) {
			container = textNode;
			offset = searchleft ? 0 : container.data.length;
		}
	}

	return {'container' : container, 'offset' : offset};
};

/**
 * Check whether the given dom object is empty
 * @param {DOMObject} domObject object to check
 * @return {boolean} true when the object is empty, false if not
 * @method
 */
GENTICS.Utils.Dom.prototype.isEmpty = function (domObject) {
	// a non dom object is considered empty
	if (!domObject) {
		return true;
	}

	// some tags are considered to be non-empty
	if (jQuery.inArray(domObject.nodeName.toLowerCase(), this.nonEmptyTags) != -1) {
		return false;
	}

	// text nodes are not empty, if they contain non-whitespace characters
	if (domObject.nodeType == 3) {
		return domObject.data.search(/\S/) == -1;
	}

	// all other nodes are not empty if they contain at least one child which is not empty
	for (var i = 0; i < domObject.childNodes.length; ++i) {
		if (!this.isEmpty(domObject.childNodes[i])) {
			return false;
		}
	}

	// found no contents, so the element is empty
	return true;
};

/**
 * Set the cursor (collapsed selection) right after the given DOM object
 * @param domObject DOM object
 * @method
 */
GENTICS.Utils.Dom.prototype.setCursorAfter = function (domObject) {
	var newRange = new GENTICS.Utils.RangeObject();
	newRange.startContainer = newRange.endContainer = domObject.parentNode;
	newRange.startOffset = newRange.endOffset = this.getIndexInParent(domObject);

	// select the range
	newRange.select();
};

/**
 * Set the cursor (collapsed selection) at the start into the given DOM object
 * @param domObject DOM object
 * @method
 */
GENTICS.Utils.Dom.prototype.setCursorInto = function (domObject) {
	// set a new range into the given dom object
	var newRange = new GENTICS.Utils.RangeObject();
	newRange.startContainer = newRange.endContainer = domObject;
	newRange.startOffset = newRange.endOffset = 0;

	// select the range
	newRange.select();
};

/**
 * Create the singleton object
 * @hide
 */
GENTICS.Utils.Dom = new GENTICS.Utils.Dom();
/*!
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*

*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.

*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*//*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
Ext.data.AlohaProxy = function( ) {
    // Must define a dummy api with "read" action to satisfy Ext.data.Api#prepare *before* calling super
    var api = {};
    api[Ext.data.Api.actions.read] = true;
    Ext.data.AlohaProxy.superclass.constructor.call(this, {
        api: api
    });
    this.params = {
    		queryString: null,
    		objectTypeFilter: null,
    		filter: null,
    		inFolderId: null,
    		orderBy: null,
    		maxItems: null,
    		skipCount: null,
    		renditionFilter: null,
    		repositoryId: null
    };
};

Ext.extend(Ext.data.AlohaProxy, Ext.data.DataProxy, {
	doRequest : function(action, rs, params, reader, cb, scope, arg) {
		var p = this.params;
		jQuery.extend(p, params);
        try {
        	GENTICS.Aloha.RepositoryManager.query( p, function( items ) {
        		var result = reader.readRecords( items );
 	 	        cb.call(scope, result, arg, true);
        	});
        } catch (e) {
            this.fireEvent("loadexception", this, null, arg, e);
            this.fireEvent('exception', this, 'response', action, arg, null, e);
            return false;
        }
	},
	setObjectTypeFilter : function (otFilter) {
		this.params.objectTypeFilter = otFilter;
	},
	getObjectTypeFilter : function () {
		return this.params.objectTypeFilter;
	},
	setParams : function (p) {
		jQuery.extend(this.params, p);
	}
});	
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/	
Ext.data.AlohaObjectReader = function(meta, recordType) {
	meta = {};
    Ext.applyIf(meta, {
		idProperty: 'id',
		root: 'items',
		totalProperty: 'results',
		fields: [
			'id',
			'url',
			'name',
			'type',
			'weight',
			'repositoryId'
		]
    });
    Ext.data.JsonReader.superclass.constructor.call(this, meta, meta.fields);
};

Ext.extend(Ext.data.AlohaObjectReader, Ext.data.JsonReader, {
	// extend of necessary
});/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
Ext.tree.AlohaTreeLoader = function(config) {
	Ext.apply(this, config);
	Ext.tree.AlohaTreeLoader.superclass.constructor.call(this);
};

Ext.extend( Ext.tree.AlohaTreeLoader, Ext.tree.TreeLoader, {
	paramOrder: ['node', 'id'],
	nodeParameter: 'id',
	directFn : function(node, id, callback) {
		var params = {
				inFolderId: node.id,
				objectTypeFilter: this.objectTypeFilter,
				repositoryId: node.repositoryId
		};
		GENTICS.Aloha.RepositoryManager.getChildren ( params, function( items ) {
 	        var response = {};
 	        response= {
 	            status: true,
 	            scope: this,
 			    argument: {callback: callback, node: node}
 	   		};
 	      	if(typeof callback == "function"){
 	        	callback(items, response);
 	      	}	 	        
    	});
	},
    createNode: function(node) {
		if ( node.name ) {
			node.text = node.name;
		}
		if ( node.hasMoreItems ) {
			node.leaf = !node.hasMoreItems;
		}
		if ( node.objectType ) {
			node.cls = node.objectType;
		}
        return Ext.tree.TreeLoader.prototype.createNode.call(this, node);
    },
	objectTypeFilter : null,
	setObjectTypeFilter : function (otFilter) {
		this.objectTypeFilter = otFilter;
	},
	getObjectTypeFilter : function () {
		return this.objectTypeFilter;
	}
});	
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof GENTICS == 'undefined' || !GENTICS) {
	/*
	 * The GENTICS global namespace object. If GENTICS is already defined, the
	 * existing GENTICS object will not be overwritten so that defined
	 * namespaces are preserved.
	 */
	var GENTICS = {};
}

/**
 * Base Aloha Object
 * @namespace GENTICS.Aloha
 * @class Aloha The Aloha base object, which contains all the core functionality
 * @singleton
 */
GENTICS.Aloha = function () {};

// determine path of aloha for configuration
GENTICS.Aloha.setAutobase = function () {
	var scriptTags = document.getElementsByTagName('script');
	var path = scriptTags[scriptTags.length-1].src.split('?')[0]; // use last script tag (others are not yet parsed), remove any ?query
	path = path.split('/');
	var substitute = 1;
	// included by include-js.inc so it is referenced by the "core/" path
	if ('core' === path[path.length -2]) {
		substitute = 2;
	}
	GENTICS.Aloha.prototype.autobase = path.slice(0, substitute * -1).join('/') + '/';
};
GENTICS.Aloha.setAutobase();

// provide aloha version, is automatically set during build process
GENTICS.Aloha.prototype.version='0.9.3';

/**
 * Array of editables that are managed by Aloha
 * @property
 * @type Array
 */
GENTICS.Aloha.prototype.editables = new Array();

/**
 * The currently active editable is referenced here
 * @property
 * @type GENTICS.Aloha.Editable
 */
GENTICS.Aloha.prototype.activeEditable = null;

/**
 * Flag to mark whether Aloha is ready for use. Will be set at the end of the init() Function.
 * @property
 * @type boolean
 */
GENTICS.Aloha.prototype.ready = false;

/**
 * The aloha dictionaries
 * @hide
 */
GENTICS.Aloha.prototype.dictionaries = {};

/**
 * settings object, which will contain all Aloha settings
 * @cfg {Object} object Aloha's settings
 */
GENTICS.Aloha.prototype.settings = {};


/**
 * This represents the name of the users OS. Could be:
 * 'Mac', 'Linux', 'Win', 'Unix', 'Unknown'
 * @property
 * @type string
 */
GENTICS.Aloha.prototype.OSName = "Unknown";

/**
 * Array of callback functions to call when Aloha is ready
 * @property
 * @type Array
 * @hide
 */
GENTICS.Aloha.prototype.readyCallbacks = new Array();

/**
 * Initialize Aloha
 * called automatically by the loader
 * @event the "ready" event is triggered as soon as Aloha has finished it's initialization process
 * @hide
 */
GENTICS.Aloha.prototype.init = function () {
	// check browser version on init
	// this has to be revamped, as 
	if (jQuery.browser.webkit && parseFloat(jQuery.browser.version) < 532.5 || // Chrome/Safari 4
		jQuery.browser.mozilla && parseFloat(jQuery.browser.version) < 1.9 || // FF 3.5
		jQuery.browser.msie && jQuery.browser.version < 7 || // IE 7	
		jQuery.browser.opera) { // right now, Opera does not work :(
		alert("Sorry, your browser is not supported at the moment.");
		return;
	}
	
	
	var that = this;
	
	// register the body click event to blur editables
	jQuery('html').mousedown(function() {
		// if an Ext JS modal is visible, we don't want to loose the focus on
		// the editable as we assume that the user must have clicked somewhere
		// in the modal... where else could he click?
		// loosing the editable focus in this case hinders correct table
		// column/row deletion, as the table module will clean it's selection
		// as soon as the editable is deactivated. Furthermore you'd have to
		// refocus the editable again, which is just strange UX
		if (that.activeEditable && !that.isMessageVisible()) {
			that.activeEditable.blur();
			that.FloatingMenu.setScope('GENTICS.Aloha.empty');
			that.activeEditable = null;
		}
	});
	
	// initialize the base path to the aloha files
	if (typeof this.settings.base == 'undefined' || !this.settings.base) {
		this.settings.base = GENTICS.Aloha.autobase;
		if (typeof GENTICS_Aloha_base != 'undefined') {
			this.settings.base = GENTICS_Aloha_base;
		}
	}

	// initialize the Log
	this.Log.init();

	// initialize the error handler for general javascript errors
	if (!(this.settings.errorhandling == false)) {
		window.onerror = function (msg, url, linenumber) {
			GENTICS.Aloha.Log.error(GENTICS.Aloha, 'Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
			// TODO eventually add a message to the message line?
			return true;
		};
	}

	// OS detection
	if (navigator.appVersion.indexOf("Win") != -1) {
		this.OSName = "Win";
	}
	if (navigator.appVersion.indexOf("Mac") != -1) {
		this.OSName = "Mac";
	}
	if (navigator.appVersion.indexOf("X11") != -1) {
		this.OSName = "Unix";
	}
	if (navigator.appVersion.indexOf("Linux") != -1) {
		this.OSName = "Linux";
	}
	
	// initialize the Aloha core components
	this.initI18n();
	this.PluginRegistry.init();
	this.RepositoryManager.init();
	this.Ribbon.init();
	this.FloatingMenu.init();

	// internationalize ext js message box buttons
	Ext.MessageBox.buttonText.yes = GENTICS.Aloha.i18n(this, 'yes');
	Ext.MessageBox.buttonText.no = GENTICS.Aloha.i18n(this, 'no');
	Ext.MessageBox.buttonText.cancel = GENTICS.Aloha.i18n(this, 'cancel');
	Ext.ux.AlohaAttributeField.prototype.listEmptyText = GENTICS.Aloha.i18n( GENTICS.Aloha, 'repository.no_item_found' );
	Ext.ux.AlohaAttributeField.prototype.loadingText = GENTICS.Aloha.i18n( GENTICS.Aloha, 'repository.loading' ) + '...';
	
	// set aloha ready
	this.ready = true; 

	// activate registered editables
	for (var i = 0; i < this.editables.length; i++) {
		if ( !this.editables[i].ready ) {
			this.editables[i].init();
		}
	}
	
	GENTICS.Aloha.EventRegistry.trigger(
		new GENTICS.Aloha.Event("ready", GENTICS.Aloha, null)
	);
};

/**
 * Activates editable and deactivates all other Editables
 * @param {Editable} editable the Editable to be activated
 * @return void
 */
GENTICS.Aloha.prototype.activateEditable = function (editable) {

	// blur all editables, which are currently active
	for (var i = 0; i < this.editables.length; i++) {
		if (this.editables[i] != editable && this.editables[i].isActive) {
			// remember the last editable for the editableActivated event
			var oldActive = this.editables[i]; 
			this.editables[i].blur();
		}
	}
	
	this.activeEditable = editable;
};

/**
 * Returns the current Editable
 * @return {Editable} returns the active Editable
 */
GENTICS.Aloha.prototype.getActiveEditable = function() {
	return this.activeEditable;
};

/**
 * deactivated the current Editable
 * @return void
 */
GENTICS.Aloha.prototype.deactivateEditable = function () {
	
	if ( typeof this.activeEditable == 'undefined' || this.activeEditable == null ) {
		return;
	}

	// blur the editable
	this.activeEditable.blur();
	
	// set scope for floating menu
	this.FloatingMenu.setScope('GENTICS.Aloha.empty');
	
	this.activeEditable = null;
};

/**
 * Gets an editable by an ID or null if no Editable with that ID registered.
 * @param {string} id the element id to look for.
 * @return {GENTICS.Aloha.Editable} editable
 */
GENTICS.Aloha.prototype.getEditableById = function (id) {
	
	// serach all editables for id
	for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {
		if (GENTICS.Aloha.editables[i].getId() == id) {
			return GENTICS.Aloha.editables[i];
		}
	}
	
	return null;
};

/**
 * Logs a message to the console
 * @param level Level of the log ("error", "warn" or "info", "debug")
 * @param component Component that calls the log
 * @param message log message
 * @return void
 * @hide
 */
GENTICS.Aloha.prototype.log = function(level, component, message) {
	GENTICS.Aloha.Log.log(level, component, message);
};

/**
 * build a string representation of a jQuery or DOM object
 * @param object to be identified
 * @return string representation of the object
 * @hide
 */
GENTICS.Aloha.prototype.identStr = function (object) {
	if (object instanceof jQuery) {
		object = object[0];
	}
	if (!(object instanceof HTMLElement)) { 
		GENTICS.Aloha.Log.warn(this, '{' + object.toString() + '} provided is not an HTML element');
		return object.toString();
	}

	var out = object.tagName.toLowerCase();
	
	// an id should be unique, so we're okay with that
	if (object.id) {
		return out + '#' + object.id; 
	}
	
	// as there was no id, we fall back to the objects class 
	if (object.className) {
		return out + '.' + object.className;
	}
	
	// could not identify object by id or class name - so just return the tag name
	return out;
};

/**
 * a basic trim function as found on
 * http://blog.stevenlevithan.com/archives/faster-trim-javascript
 * 
 * @param str
 *            to be trimmed
 * @return trimmed string
 * @hide
 */
GENTICS.Aloha.prototype.trim = function(str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
};

/**
 * Initialize i18n, load the dictionary file
 * Languages may have format as defined in 
 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.10
 * All language codes available http://www.loc.gov/standards/iso639-2/php/langcodes-search.php
 * 
 * @hide
 */
GENTICS.Aloha.prototype.initI18n = function() {
	
	if (typeof this.settings.i18n == 'undefined' || !this.settings.i18n) {
		this.settings.i18n = {};
	}

	// TODO read dict files automatically on build. Develop only with "en"
	if (typeof this.settings.i18n.available == 'undefined' 
		|| !this.settings.i18n.available 
		|| !this.settings.i18n.available instanceof Array) {
		
		this.settings.i18n.available = ['en', 'de', 'fr', 'eo', 'fi', 'ru', 'it', 'pl'];
	}

	/* 
	 * try to guess ACCEPT-LANGUAGE from http header
	 * reference http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
	 * ACCEPT-LANGUAGE 'de-de,de;q=0.8,it;q=0.6,en-us;q=0.7,en;q=0.2';
	 * Any implementation has to set it server side because this is not
	 * accessible by JS. http://lists.w3.org/Archives/Public/public-html/2009Nov/0454.html
	*/ 
	if ( (typeof this.settings.i18n.current == 'undefined' || !this.settings.i18n.current) &&
		typeof this.settings.i18n.acceptLanguage == 'string' ) {

		var acceptLanguage = [];
		// Split the string from ACCEPT-LANGUAGE
	    var preferredLanugage = this.settings.i18n.acceptLanguage.split(",");
	    for(i = 0; i < preferredLanugage.length; i++){
	    	
	    	// split language setting
	    	var lang = preferredLanugage[i].split(";");
	    	
	    	// convert quality to float
	    	if ( typeof lang[1] == 'undefined' || !lang[1] ) {
	    	  lang[1] = 1;
	    	} else {
	    	  lang[1] = parseFloat(lang[1].substring(2, lang[1].length)); 
	    	}
	    	
	    	// add converted language to accepted languages
	    	acceptLanguage.push(lang);
	    }
	    
	    // sort by quality
	    acceptLanguage.sort(function (a,b) {return b[1] - a[1];});
	    
	    // check in sorted order if any of preferred languages is available
	    for(i = 0; i < acceptLanguage.length; i++) {
	    	if ( jQuery.inArray(acceptLanguage[i][0], this.settings.i18n.available) >= 0 ) {
	    		this.settings.i18n.current = acceptLanguage[i][0];
	    		break;
	    	}
	    }
	}

	/*
	 * default language from for the browser navigator API.
	 */ 
	if (typeof this.settings.i18n.current == 'undefined' || !this.settings.i18n.current) {
		this.settings.i18n.current = (navigator.language
				? navigator.language       // gecko/webkit/opera
				: navigator.userLanguage   // IE
		);
	}

	// determine the actual language based on current and available languages
	var actualLanguage = this.getLanguage(this.settings.i18n.current, this.settings.i18n.available);

	if (!actualLanguage) {
		GENTICS.Aloha.Log.error(this, 'Could not determine actual language.');
	} else {
		// TODO load the dictionary file for the actual language
		var fileUrl = this.settings.base + 'i18n/' + actualLanguage + '.dict';
		this.loadI18nFile(fileUrl, this);
	}
};


/**
 * Check is language is among available languages
 * @method
 * @param {String} language language to be set
 * @param {Array} availableLanguages list of available languages
 * @return the actual language as a string
 */
GENTICS.Aloha.prototype.getLanguage = function(language, availableLanguages) {
	
	if (!availableLanguages instanceof Array) {
		GENTICS.Aloha.Log.error(this, 'Available languages must be an Array');
		return null;
	}
	
	if (typeof language == 'undefined' || !language) {
		return availableLanguages[0];
	}
	
	for (var i = 0; i < availableLanguages.length; ++i) {
		if (language == availableLanguages[i]) {
			return language;
		}
	}

	return availableLanguages[0];
};

/**
 * parses an i18n file
 * @param {String} fileUrl
 * @param {String} component
 * @hide
 */
GENTICS.Aloha.prototype.loadI18nFile = function(fileUrl, component) {
	// Note: this ajax request must be done synchronously, because the otherwise
	// the first i18n calls might come before the dictionary is available
	jQuery.ajax(
		{
			async : false,
			datatype : 'text',
			url : fileUrl,
			error: function(request, textStatus, error) {
				GENTICS.Aloha.Log.error(component, 'Error while getting dictionary file ' + fileUrl + ': server returned ' + textStatus);
			},
			success: function(data, textStatus, request) {
				if (GENTICS.Aloha.Log.isInfoEnabled()) {
					GENTICS.Aloha.Log.info(component, 'Loaded dictionary file ' + fileUrl);
				}
				GENTICS.Aloha.parseI18nFile(data, component);
			}
		}
	);
};

/**
 * 
 * @param data
 * @param component
 * @hide
 */
GENTICS.Aloha.prototype.parseI18nFile = function(data, component) {
	data = data.replace(/\r/g, '');
	var entries = data.split('\n');
	var dictionary = new Object();
	for (var i = 0; i < entries.length; ++i) {
		var entry = entries[i];
		var equal = entry.indexOf('=');
		if (equal > 0) {
			var key = GENTICS.Aloha.trim(entry.substring(0, equal));
			var value = GENTICS.Aloha.trim(entry.substring(equal + 1, entry.length));
			value = value.replace(/\\n/g, '\n');
			value = value.replace(/\\\\/g, '\\');

			// check for duplicate keys and print a warning
			if (dictionary[key]) {
				GENTICS.Aloha.Log.warn(component, 'Found duplicate key ' + key + ' in dictionary file, ignoring');
			} else {
				dictionary[key] = value;
			}
		}
	}

	this.dictionaries[component.toString()] = dictionary;
};

/**
 * Method to translate the given key for the given component either from the component dictionary, or from the Aloha core library.
 * @method
 * @param {String} component component for which the key shall be localized
 * @param {String} key key to be localized
 * @param {Array} replacements array of replacements 
 * @return localized string
 */
GENTICS.Aloha.prototype.i18n = function(component, key, replacements) {
	var value = null;

	// first get the dictionary for the component
	if (this.dictionaries[component.toString()]) {
		if (this.dictionaries[component.toString()][key]) {
			value = this.dictionaries[component.toString()][key];
		}
	}

	// when the value was not found and component is not GENTICS.Aloha, do a fallback
	if (!value && component != GENTICS.Aloha) {
		if (this.dictionaries[GENTICS.Aloha.toString()]) {
			if (this.dictionaries[GENTICS.Aloha.toString()][key]) {
				value = this.dictionaries[GENTICS.Aloha.toString()][key];
			}
		}
	}

	// value still not found, so output the key
	if (!value) {
		return '??? ' + key + ' ???';
	} else {
		// substitute placeholders
		if (typeof replacements != 'undefined' && replacements != null) {
			for ( var i = 0; i < replacements.length; ++i) {
				if (typeof replacements[i] != 'undefined' && replacements[i] != null) {
					var regEx = new RegExp('\\{' + (i) + '\\}', 'g');
					var safeArgument = replacements[i].toString().replace(/\{/g, '\\{');
					safeArgument = safeArgument.replace(/\}/g, '\\}');
					value = value.replace(regEx, safeArgument);
				}
			}
		}

		value = value.replace(/\{\d\}/g, '');
		value = value.replace(/\\\{/g, '{');
		value = value.replace(/\\\}/g, '}');
		return value;
	}
};


/**
 * Register the given editable
 * @param editable editable to register
 * @return void
 * @hide
 */
GENTICS.Aloha.prototype.registerEditable = function (editable) {
	this.editables.push(editable);
};

/**
 * Unregister the given editable. It will be deactivated and removed from editables.
 * @param editable editable to unregister
 * @return void
 * @hide
 */
GENTICS.Aloha.prototype.unregisterEditable = function (editable) {
	
	// Find the index
	var id = this.editables.indexOf( editable ); 
	// Remove it if really found!
	if (id != -1) {
		this.editables.splice(id, 1); 
	}
};

/**
 * Displays a message according to it's type
 * @method
 * @param {GENTICS.Aloha.Message} message the GENTICS.Aloha.Message object to be displayed
 */
GENTICS.Aloha.prototype.showMessage = function (message) {
	
	if (GENTICS.Aloha.FloatingMenu.obj) {
		GENTICS.Aloha.FloatingMenu.obj.css('z-index', 8900);
	}
	
	switch (message.type) {
		case GENTICS.Aloha.Message.Type.ALERT:
		    Ext.MessageBox.alert(message.title, message.text, message.callback);
		    break;
		case GENTICS.Aloha.Message.Type.CONFIRM:
		    Ext.MessageBox.confirm(message.title, message.text, message.callback);
		    break;
		case GENTICS.Aloha.Message.Type.WAIT:
		    Ext.MessageBox.wait(message.text, message.title);
		    break;
		default:
			this.log('warn', this, 'Unknown message type for message {' + message.toString() + '}');
			break;
	}
};

/**
 * Hides the currently active modal, which was displayed by showMessage()
 * @method
 */
GENTICS.Aloha.prototype.hideMessage = function () {
	Ext.MessageBox.hide();
};

/**
 * checks if a modal dialog is visible right now
 * @method
 * @return true if a modal is currently displayed
 */
GENTICS.Aloha.prototype.isMessageVisible = function () {
	return Ext.MessageBox.isVisible();
};

/**
 * String representation
 * @hide
 */
GENTICS.Aloha.prototype.toString = function () {
	return 'GENTICS.Aloha';
};

/**
 * Check whether at least one editable was modified
 * @method
 * @return {boolean} true when at least one editable was modified, false if not
 */
GENTICS.Aloha.prototype.isModified = function () {
	// check if something needs top be saved
	for (var i in this.editables) {
		if (this.editables[i].isModified) {
			if (this.editables[i].isModified()) {
				return true;
			}
		}
	}

	return false;
};

GENTICS.Aloha = new GENTICS.Aloha();

/**
 * TODO move to util
 * reimplementation of indexOf for current Microsoft Browsers
 * IE does not support indexOf() for Arrays
 * @param object to look for
 * @return index of obj in Array or -1 if not found
 * @hide
 */
if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
		    if(this[i]===obj){
		     return i;
		    }
	   	}
	   	return -1;
	};
}

/**
 * Initialize Aloha when the dom is ready and Ext is ready
 * @hide
 */
jQuery(document).ready(function() {
	if (Ext.isReady) {
		GENTICS.Aloha.init();
	} else {
		Ext.onReady(function() {
			GENTICS.Aloha.init();
		});
	}
});/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof GENTICS.Aloha.ui == 'undefined') {
	GENTICS.Aloha.ui = function() {};
}

/**
 * Constructor for an Aloha button.
 * @namespace GENTICS.Aloha.ui
 * @class Button
 * @param {Object} properties Properties of the button:
 * - label: Label that is displayed on the button.
 * - onclick: Callback function of the button when activated.
 * - menu: Array of GENTICS.Aloha.ui.Button elements that are displayed as drop-down menu.
 * - iconClass: Icon displayed on the button.
 * - icon: URL to an icon that is displayed on the button.
 * - toggle: Boolean that indicates if the button is a toggle button.
 */
GENTICS.Aloha.ui.Button = function(properties) {
	this.init(properties);
};

/**
 * Init method for an Aloha button.
 * This method is necessary due to JS specific initalization.
 * @namespace GENTICS.Aloha.ui
 * @class Button
 * @param {Object} properties Properties of the button:
 * - label: Label that is displayed on the button.
 * - onclick: Callback function of the button when activated.
 * - menu: Array of GENTICS.Aloha.ui.Button elements that are displayed as drop-down menu.
 * - iconClass: Icon displayed on the button.
 * - icon: URL to an icon that is displayed on the button.
 * - toggle: Boolean that indicates if the button is a toggle button.
 */
GENTICS.Aloha.ui.Button.prototype.init = function(properties) {
	/**
	 * Label that is displayed on the button
	 * @hide
	 */
	this.label;
	
	/**
	 * CSS class for an icon on the button
	 * @hide
	 */
	this.iconClass;
	
	/**
	 * URL to an icon to display on the button
	 * @hide
	 */
	this.icon;
	
	/**
	 * Callback function when the button is activated.
	 * The "this" variable refers to the button inside the callback function.
	 * @hide
	 */
	this.onclick;
	
	/**
	 * Array of buttons that are displayed in a drop down menu.
	 * If a menu is provided and no onclick callback then clicking the button also opens the menu
	 * @hide
	 */
	this.menu;
	
	/**
	 * Indicates if the button is a toggle button
	 * @hide
	 */
	this.toggle;
	
	/**
	 * Property that indicates if the button is in pressed state
	 * @hide
	 */
	this.pressed = false;

	/**
	 * Property that indicates whether the button is currently visible
	 * @hide
	 */
	this.visible = true;

	/**
	 * Property that indicates whether the button is currently enabled
	 * @hide
	 */
	this.enabled = true;

	/**
	 * Tooltip text
	 * @hide
	 */
	this.tooltip;

	/**
	 * holds the ext object of the button
	 * @hide
	 */
	this.extButton;

	/**
	 * holds the listeners of the button
	 * @hide
	 */
	this.listenerQueue = [];
	
	GENTICS.Utils.applyProperties(this, properties);

	/**
	 * Unique Id of the button
	 * @hide
	 */
	this.id = this.generateId();
};

/**
 * id counter, for generation of unique id's for the buttons
 * @hide
 */
GENTICS.Aloha.ui.Button.idCounter = 0;

/**
 * Generate a unique id for the button
 * @return unique id
 * @hide
 */
GENTICS.Aloha.ui.Button.prototype.generateId = function () {
	GENTICS.Aloha.ui.Button.idCounter = GENTICS.Aloha.ui.Button.idCounter + 1;
	return 'GENTICS_Aloha_ui_Button_' + GENTICS.Aloha.ui.Button.idCounter;
};

/**
 * Set the 'pressed' state of the button if it is a toggle button
 * @param {bool} pressed true when the button shall be 'pressed', false if not
 */
GENTICS.Aloha.ui.Button.prototype.setPressed = function(pressed) {
	if (this.toggle) {
		this.pressed = pressed;
		if (typeof this.extButton == 'object' && this.extButton.pressed != pressed) {
			this.extButton.toggle(this.pressed);
		}
	}
};

/**
 * Indicates if the button is currently in "pressed" state. 
 * This is only relevant if the button is a toggle button.
 * If the button is no toggle button this function always returns false.
 * @return {bool} True if the button is pressed, false otherwise.
 */
GENTICS.Aloha.ui.Button.prototype.isPressed = function() {
	if (this.toggle) {
		return this.pressed;
	} else {
		return false;
	}
};

/**
 * Show the button. When this button is added to the FloatingMenu, it is
 * necessary to call GENTICS.Aloha.FloatingMenu.doLayout() after the visibility
 * of the button is changed
 */
GENTICS.Aloha.ui.Button.prototype.show = function() {
	this.visible = true;
};

/**
 * Hide the button. When this button is added to the FloatingMenu, it is
 * necessary to call GENTICS.Aloha.FloatingMenu.doLayout() after the visibility
 * of the button is changed
 */
GENTICS.Aloha.ui.Button.prototype.hide = function() {
	this.visible = false;
};

/**
 * Check whether the button is visible or not
 * @return true when the button is visible, false if not
 */
GENTICS.Aloha.ui.Button.prototype.isVisible = function() {
	return this.visible;
};

/**
 * Enable the button - make it clickable
 */
GENTICS.Aloha.ui.Button.prototype.enable = function() {
	this.enabled = true;
	if (typeof this.extButton == 'object') {
		this.extButton.enable();
	}
};

/**
 * Disable the button
 */
GENTICS.Aloha.ui.Button.prototype.disable = function() {
	this.enabled = false;
	if (typeof this.extButton == 'object') {
		this.extButton.disable();
	}
};

/**
 * Check whether the button is currently enabled
 * @return true when the button is enabled, false if it is disabled
 */
GENTICS.Aloha.ui.Button.prototype.isEnabled = function() {
	return this.enabled;
};

/**
 * Get the Ext menu from this button
 * @return Ext menu
 * @hide
 */
GENTICS.Aloha.ui.Button.prototype.getExtMenu = function() {
	if (typeof this.menu === 'object') {
		// build the drop down menu
		var menu = new Ext.menu.Menu();
		for (var i = 0; i < this.menu.length; ++i) {
			var entry = this.menu[i];
			menu.addItem(new Ext.menu.Item(entry.getExtMenuConfigProperties()));
		}
	}
	return menu;
};

/**
 * Get the config properties for this button as menu entry
 * @return config properties for this button as menu entry
 * @hide
 */
GENTICS.Aloha.ui.Button.prototype.getExtMenuConfigProperties = function() {
	var that = this;
	var submenu = this.getExtMenu();

	return {
		text: this.label,
		icon: this.icon,
		iconCls: this.iconClass,
		handler: function () {
			if (typeof that.onclick == 'function') {
				that.onclick();
			}
		},
		menu: submenu 
	};
};

/**
 * Return an object containing the config properties to generate this button
 * @return config properties
 * @hide
 */
GENTICS.Aloha.ui.Button.prototype.getExtConfigProperties = function() {
	var that = this;
	var menu = this.getExtMenu();
		
	// configuration for the button
	var buttonConfig = {
		text : this.label,
		enableToggle: this.toggle,
		pressed : this.pressed,
		icon: this.icon,
		iconCls: this.iconClass,
		scale : this.scale||this.size,
		width : this.width||undefined,
		rowspan : this.rowspan || ((this.size == 'large' || this.size == 'medium') ? 2 : 1),
		menu : menu,
		handler : function(element, event) {
			if (typeof that.onclick === 'function') {
				that.onclick.apply(that, [element, event]);
			}
			that.pressed = !that.pressed;
		},
		xtype : (menu && typeof this.onclick == 'function') ? 'splitbutton' : 'button',
		tooltipType : 'qtip',
		tooltip : this.tooltip,
		id : this.id,
        arrowAlign: this.arrowAlign || (this.size == 'large' || this.size == 'small' ? 'right' : 'bottom')
	};

	return buttonConfig;
};

/**
 * extJS GENTICS Multi Split Button
 *
 * Display a Word-like formatting selection button
 * Selection images are typically 52*42 in size
 *
 * Example configuration 
 * xtype : 'genticsmultisplitbutton',
 * items : [{
 *   'name'  : 'normal', // the buttons name, used to identify it 
 *   'title' : 'Basic Text', // the buttons title, which will be displayed 
 *	 'icon'  : 'img/icon.jpg', // source for the icon
 *	 'click' : function() { alert('normal'); } // callback if the button is clicked
 *   'wide'  : false // wether it's a wide button, which would be dispalyed at the bottom
 * }]
 *
 * you might want to check out the tutorial at
 * http://www.extjs.com/learn/Tutorial:Creating_new_UI_controls
 * @hide
 */
Ext.ux.GENTICSMultiSplitButton = Ext.extend(Ext.Component, {
	/**
	 * add a css class to the wrapper-div autogenerated by extjs
	 * @hide
	 */
	autoEl: {
    	cls: 'GENTICS_multisplit-wrapper'
	},

	/**
	 * will contain a reference to the ul dom object
	 * @hide
	 */
	ulObj: null,

	/**
	 * holds a reference to the expand button
	 * @hide
	 */
	panelButton: null,

	/**
	 * hold a reference to the wrapper div
	 * @hide
	 */
	wrapper: null,

	/**
	 * true if the panel is expanded
	 * @hide
	 */
	panelOpened: false,

	/**
	 * render the multisplit button
	 * @return void
	 * @hide
	 */
	onRender: function() {
    	Ext.ux.GENTICSMultiSplitButton.superclass.onRender.apply(this, arguments);
		// create a reference to this elements dom object
    	this.wrapper = jQuery(this.el.dom);

    	var item;
        var html = '<ul class="GENTICS_multisplit">';

		// add a new button to the list for each configured item
		for (var i=0; i<this.items.length; i++) {
			item = this.items[i];
			if (item.visible == undefined) {
				item.visible = true;
			}
			// wide buttons will always be rendered at the bottom of the list
			if (item.wide) {
				continue;
			}
        	html += '<li>' +
        		'<button xmlns:ext="http://www.extjs.com/" class="' + item.iconClass + '" ext:qtip="' + item.tooltip + '" gtxmultisplititem="' + i + '">&#160;</button>' + 
        		'</li>';
        }

        // now add the wide buttons at the bottom of the list
		for (var i=0; i<this.items.length; i++) {
			item = this.items[i];
			// now only wide buttons will be rendered
			if (!item.wide) {
				continue;
			}
			
        	html += '<li>' +
    		'<button xmlns:ext="http://www.extjs.com/" class="GENTICS_multisplit-wide ' + item.iconClass + '" ext:qtip="' + item.tooltip + '" gtxmultisplititem="' + i + '">' + 
    			item.text + '</button>' + 
    			'</li>';

        }

        html += '</ul>';

		var that = this;

		// register on move event, which occurs when the panel was dragged
    	// this should be done within the constructor, but ist not possible there
    	// since the extTabPanel will not be initialized at this moment
    	GENTICS.Aloha.FloatingMenu.extTabPanel.on('move', function () {
    		that.closePanel();
    	});
    	GENTICS.Aloha.FloatingMenu.extTabPanel.on('tabchange', function () {
    		that.closePanel();
    	});

		// add onclick event handler
		this.ulObj = jQuery(this.el.createChild(html).dom);
		this.ulObj.click(function (event) {
			that.onClick(event);
		});
		
		// add the expand button
		this.panelButton = jQuery(
			this.el.createChild('<button class="GENTICS_multisplit_toggle GENTICS_multisplit_toggle_open">&#160;</button>').dom
		);
		this.panelButton.click(function () {
			that.togglePanel();
		});
    },

	/**
	 * callback if a button has been clicked
	 * @param event jquery event object
	 * @return void
	 * @hide
	 */
    onClick: function(event) {
		// check if the element has a gtxmultisplititem attribute assigned
		if (!event.target.attributes.gtxmultisplititem) {
			return;
		}
		var el = jQuery(event.target);

		// collapse the panel
		this.closePanel();

		// wide buttons cannot become the active element
		if (!el.hasClass('GENTICS_multisplit-wide')) {
			this.setActiveDOMElement(el);
		}
		
		// invoke the items function
		this.items[event.target.attributes.gtxmultisplititem.value].click();
    },

	/**
	 * set the active item specified by its name
	 * @param name the name of the item to be marked as active
	 * @return void
	 * @hide
	 */
	setActiveItem: function(name) {
		// collapse the panel
		this.closePanel();

		// do nothing if item already set to be active
		if (this.activeItem == name) {
			return;
		}

		for (var i=0; i < this.items.length; i++) {
			if (this.items[i].name == name) {
				// found the item
				var button = jQuery(this.ulObj).find('[gtxmultisplititem='+i+']');
				this.setActiveDOMElement(button);
				this.activeItem = name;
				return;
			}
        }
		this.activeItem = null;
		this.setActiveDOMElement(null);
    },

	/**
	 * mark an item as active
	 * @param el jquery obj for item to be marked as active
	 * @return void
	 * @hide
	 */
	setActiveDOMElement: function(el) {
		// when the component (or one of its owners) is currently hidden, we need to set the active item later
    	var ct = this;
    	while (typeof ct != 'undefined') {
    		if (ct.hidden) {
    			this.activeDOMElement = el;
    			return;
    		}
    		ct = ct.ownerCt;
    	}

		jQuery(this.ulObj).find('.GENTICS_multisplit-activeitem').removeClass('GENTICS_multisplit-activeitem');
		if(el) {
			el.addClass('GENTICS_multisplit-activeitem');
		}

		if (el == null || el.parent().is(':hidden')) {
			return;
		}
		
		// reposition multisplit contents to the active item
		if (el && this.ulObj) {
			this.ulObj.css('margin-top', 0);
			var top = el.position().top;
			this.ulObj.css('margin-top', - top + 6);
			this.ulObj.css('height', 46 + top - 6);
		}

		this.activeDOMElement = undefined;
    },

	/**
	 * toggle the panel display from closed to expanded or vice versa
	 * @return void
	 * @hide
	 */
	togglePanel: function() {
		if (this.panelOpened) {
			this.closePanel();
		} else {
			this.openPanel();
		}
    },
	    
    /**
     * expand the button panel
     * @return void
     * @hide
     */
    openPanel: function() {
		if (this.panelOpened) {
			return;
		}
		
    	// detach the ul element and reattach it onto the body
		this.ulObj.appendTo(jQuery(document.body));
		this.ulObj.addClass('GENTICS_multisplit-expanded');
		this.ulObj.mousedown(function (e) {
			e.stopPropagation();
		});

		// relocate the ul
		var o = this.wrapper.offset();
		this.ulObj.css('top', o.top - 1);
		this.ulObj.css('left', o.left - 1);

		// display expand animation
		this.ulObj.animate({
			height: this.ulObj.attr('scrollHeight')
		});

		// TODO change to css
		this.panelButton.removeClass('GENTICS_multisplit_toggle_open');
		this.panelButton.addClass('GENTICS_multisplit_toggle_close');
		this.panelOpened = true;
    },

    /**
     * collapses the panel
     * @return void
     * @hide
     */
    closePanel: function() {
		if (!this.panelOpened) {
			return;
		}

		this.ulObj.removeClass('GENTICS_multisplit-expanded');
		this.ulObj.appendTo(this.wrapper);

		// TODO change to css
		this.panelButton.addClass('GENTICS_multisplit_toggle_open');
		this.panelButton.removeClass('GENTICS_multisplit_toggle_close');
		this.panelOpened = false;
	},
	
	/**
	 * hides a multisplit item
	 * @return void
	 * @hide
	 */
	hideItem: function(name) {
		for (var i = 0; i<this.items.length; i++) {
			if (this.items[i].name == name) {
				this.items[i].visible = false;
				// hide the corresponding dom object
				jQuery('#' + this.id + ' [gtxmultisplititem=' + i + ']').parent().hide();
				return;
			}
		}
	},
	
	/**
	 * shows an item
	 * @return void
	 * @hide
	 */
	showItem: function(name) {
		for (var i = 0; i<this.items.length; i++) {
			if (this.items[i].name == name) {
				this.items[i].visible = true;
				// hide the corresponding dom object
				jQuery('#' + this.id + ' [gtxmultisplititem=' + i + ']').parent().show();
				return;
			}
		}
	}
});
Ext.reg('genticsmultisplitbutton', Ext.ux.GENTICSMultiSplitButton);

/**
 * Aloha MultiSplit Button
 * @namespace GENTICS.Aloha.ui
 * @class MultiSplitButton
 * @param {Object} properties properties object for the new multisplit button
 * 		however you just have to fill out the items property of this object
 * 		items : [{
 *   		'name'  : 'normal', // the buttons name, used to identify it 
 *   		'tooltip' : 'Basic Text', // the buttons tooltip, which will be displayed on hover 
 *   		'text'	: 'Basic Text', // text to display on wide buttons
 *	 		'icon'  : 'img/icon.jpg', // source for the icon
 *	 		'click' : function() { alert('normal'); } // callback if the button is clicked
 *   		'wide'  : false // whether it's a wide button, which would be dispalyed at the bottom
 * 		}]
 */
GENTICS.Aloha.ui.MultiSplitButton = function(properties) {
	/**
	 * Items in the Multisplit Button
	 * @hide
	 */
	this.items;

	GENTICS.Utils.applyProperties(this, properties);

	/**
	 * unique id for all buttons
	 * @hide
	 */
	this.id = this.generateId();
};

/**
 * id counter, for generation of unique id's for the buttons
 * @hide
 */
GENTICS.Aloha.ui.MultiSplitButton.idCounter = 0;

/**
 * Generate a unique id for the button
 * @return unique id
 * @hide
 */
GENTICS.Aloha.ui.MultiSplitButton.prototype.generateId = function () {
	GENTICS.Aloha.ui.MultiSplitButton.idCounter = GENTICS.Aloha.ui.MultiSplitButton.idCounter + 1;
	return 'GENTICS_Aloha_ui_MultiSplitButton_' + GENTICS.Aloha.ui.MultiSplitButton.idCounter;
};

/**
 * Return an object containing the config properties to generate this button
 * @return config properties
 * @hide
 */
GENTICS.Aloha.ui.MultiSplitButton.prototype.getExtConfigProperties = function() {
	return {
		'xtype' : 'genticsmultisplitbutton',
		'items' : this.items,
		'id' : this.id
	};
};

/**
 * Set the active item of the multisplitbutton
 * @param {String} name	name of the item to be set active
 */
GENTICS.Aloha.ui.MultiSplitButton.prototype.setActiveItem = function(name) {
	this.extButton.setActiveItem(name);
};

/**
 * check whether the multisplit button is visible
 * @return boolean true if visible
 */
GENTICS.Aloha.ui.MultiSplitButton.prototype.isVisible = function() {
	// if all items are hidden, disable this item
	for (var i=0; i<this.items.length; i++) {
		// if just one item is visible that's enough
		if (this.items[i].visible) {
			return true;
		}
	}
	return false;
};

/**
 * shows an item of the multisplit button
 * @param {String} name the item's name
 */
GENTICS.Aloha.ui.MultiSplitButton.prototype.showItem = function(name) {
	this.extButton.showItem(name);
};

/**
 * hides an item of the multisplit button
 * @param {String} name the item's name
 */
GENTICS.Aloha.ui.MultiSplitButton.prototype.hideItem = function(name) {
	this.extButton.hideItem(name);
};/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

Ext.ux.AlohaAttributeField = Ext.extend(Ext.form.ComboBox, {
    typeAhead: false,
    mode: 'remote',
    triggerAction: 'all',
	width: 300,
	hideTrigger: true,
	minChars: 3,
	valueField: 'id',
	displayField: 'url',
	enableKeyEvents: true,
	store: new Ext.data.Store({
		proxy: new Ext.data.AlohaProxy(),
		reader: new Ext.data.AlohaObjectReader()
    }),
    tpl: new Ext.XTemplate(
        '<tpl for="."><div class="x-combo-list-item">',
            '<span><b>{name}</b><br />{url}</span>',
        '</div></tpl>'
    ),
    onSelect: function (item) {
		this.setItem(item.data);
		if ( typeof this.alohaButton.onSelect == 'function' ) {
			this.alohaButton.onSelect.call(this.alohaButton, item.data);
		}
		this.collapse();
	},
    listeners: {
		// repository object types could have changed
		'beforequery': function (event) {
			if( this.noQuery ) {
				event.cancel = true;
				return;
			}
			if (this.store != null && this.store.proxy != null) {
				this.store.proxy.setParams({
					objectTypeFilter: this.getObjectTypeFilter(),
					queryString: event.query
				});
			}
		},
		'afterrender': function (obj, event) {
			var that = this; 
			jQuery(this.wrap.dom.children[0]).blur(function(e){ 		        
				that.triggerBlur();
			});
			
		},
    	'keydown': function (obj, event) {
			// on ENTER or ESC leave the editing
			// just remember here the status and remove cursor on keyup event
			// Otherwise cursor moves to content and no more blur event happens!!??
		    if (event.keyCode == 13 || event.keyCode == 27) {
		    	if ( this.isExpanded() ) {
		    		this.ALOHAwasExpanded = true;
		    	} else {
		    		this.ALOHAwasExpanded = false;
		    	}
		    }
		},
		'keyup': function (obj, event) {
		    if ((event.keyCode == 13 || event.keyCode == 27) && !this.ALOHAwasExpanded) {
		    	// work around stupid behavior when moving focus :/
		    	setTimeout( function() {
			    	// Set focus to link element and select the object
			        GENTICS.Aloha.activeEditable.obj[0].focus();
			        GENTICS.Aloha.Selection.getRangeObject().select();
		    	}, 0);
		    }
		    // update attribute 
			var v = this.wrap.dom.children[0].value;
	        this.setAttribute(this.targetAttribute, v);
		},
	    'focus': function(obj, event) {
			// set background color to give visual feedback which link is modified
	        var target = jQuery(this.getTargetObject());
	        var s = target.css('background-color');
	        if ( target && target.context.style && target.context.style['background-color'] ) {
	        	target.attr('data-original-background-color', target.context.style['background-color']);
	        }
	        target.css('background-color','Highlight');
	    },
	    'blur': function(obj, event) {
	        // remove the highlighting and restore original color if was set before
	        var target = jQuery(this.getTargetObject());
	        if ( target ) {
	        	if ( color = target.attr('data-original-background-color')  ) {
	        		jQuery(target).css('background-color', color);
	        	} else {
	        		jQuery(target).removeCss('background-color');
	        	}
	    		jQuery(target).removeAttr('data-original-background-color');
	        }
	    },
	    'expand': function (combo ) {
	    	if( this.noQuery ) {
	    		this.collapse();
	    	}
	    }
    }, 
    setItem: function( item, displayField ) {
    	this.resourceItem = item;
    	if ( item ) {
	    	displayField = (displayField) ? displayField : this.displayField;
			// TODO split display field by '.' and get corresponding attribute, because it could be a properties attribute.
			var v = item[displayField];
	    	this.setValue( v );
			this.setAttribute(this.targetAttribute, v);
			// call the repository marker
			GENTICS.Aloha.RepositoryManager.markObject(this.targetObject, item);
    	}
    },
    getItem: function( ) {
    	return this.resourceItem;
    },
    // Private hack to allow attribute setting by regex
    setAttribute: function (attr, value, regex, reference) {
    	
        if ( this.targetObject) {
            
        	// set the attribute
        	var setAttr = true;

            // check if a reference value is submitted to check against with a regex
	        if ( typeof reference != 'undefined' ) {
	            var regxp = new RegExp( regex );
	            if ( !reference.match(regxp) ) {
	                setAttr = false;
	            }
	        }
	        
	        // if no regex was successful or no reference value 
	        // was submitted remove the attribute
            if ( setAttr ) {
        		jQuery(this.targetObject).attr(attr, value);
            } else {
            	jQuery(this.targetObject).removeAttr(attr);
            }
        }
    },
	setTargetObject : function (obj, attr) {
	    this.targetObject = obj;
	    this.targetAttribute = attr;
        if (this.targetObject && this.targetAttribute) {
            this.setValue(jQuery(this.targetObject).attr(this.targetAttribute));
        } else {
            this.setValue('');
        }
	},
	getTargetObject : function () {
	    return this.targetObject;
	},
	setObjectTypeFilter : function (otFilter) {
		this.objectTypeFilter = otFilter;
	},
	getObjectTypeFilter : function () {
		return this.objectTypeFilter;
	},
	noQuery: true
});

/**
 * Register the Aloha attribute field 
 * @hide
 */
Ext.reg('alohaattributefield', Ext.ux.AlohaAttributeField);


/**
 * Aloha Attribute Field Button
 * @namespace GENTICS.Aloha.ui
 * @class AttributeField
 */
GENTICS.Aloha.ui.AttributeField = function (properties) {

	/**
	 * @cfg Function called when an element is selected
	 */
	this.onSelect = null;
	this.listenerQueue = [];
	this.objectTypeFilter = null;
	this.tpl = null;
	this.displayField = null;

	this.init(properties);
};

/**
 * Inherit all methods and properties from GENTICS.Aloha.ui.Button
 * @hide
 */
GENTICS.Aloha.ui.AttributeField.prototype = new GENTICS.Aloha.ui.Button();

/**
 * Create a extjs alohaattributefield
 * @hide
 */
GENTICS.Aloha.ui.AttributeField.prototype.getExtConfigProperties = function() {
    return {
    	alohaButton: this,
        xtype : 'alohaattributefield',
        rowspan: this.rowspan||undefined,
        width: this.width||undefined,
        id : this.id
    };
};

/**
 * Sets the target Object of which the Attribute should be modified
 * @param {jQuery} obj the target object
 * @param {String} attr Attribute to be modified ex. "href" of a link
 * @void
 */
GENTICS.Aloha.ui.AttributeField.prototype.setTargetObject = function (obj, attr) {
    if (this.extButton) {
        this.extButton.setTargetObject(obj, attr);
    }
};

/**
 * @return {jQuery} object Returns the current target Object
 */
GENTICS.Aloha.ui.AttributeField.prototype.getTargetObject = function () {
    if (this.extButton) {
        return this.extButton.getTargetObject();
    } else {
    	return null;
    }
};


/**
 * Focus to this field
 * @void
 */
GENTICS.Aloha.ui.AttributeField.prototype.focus = function () {
    if (this.extButton) {
        this.extButton.focus();
        if ( this.extButton.getValue().length > 0 ) {
               this.extButton.selectText( 0, this.extButton.getValue().length );
        }
    }
};

/**
 * Adding a listener to the field
 * @param {String} eventname The name of the event. Ex. 'keyup'
 * @param {function} handler The function that should be called when the event happens.
 * @param {Object} scope The scope object which the event should be attached
 */
GENTICS.Aloha.ui.AttributeField.prototype.addListener = function ( eventName, handler, scope) {
    if (this.extButton) {
    	this.extButton.addListener(eventName, handler, null);
    } else {
    	// if extButton not yet initialized adding listeners could be a problem
    	// so all events are collected in a queue and added on initalizing
    	listener = {
    			'eventName': eventName,
    			'handler': handler,
    			'scope': scope,
    			'options': null
    	};
    	this.listenerQueue.push(listener);
    }
};

/**
 * Sets an attribute optionally based on a regex on reference
 * @param {String} attr The Attribute name which should be set. Ex. "lang"
 * @param {String} value The value to set. Ex. "de-AT"
 * @param {String} regex The regex when the attribute should be set. The regex is applied to the value of refernece.
 * @param {String} reference The value for the regex.
 */
GENTICS.Aloha.ui.AttributeField.prototype.setAttribute = function (attr, value, regex, reference) {
    if (this.extButton) {
    	this.extButton.setAttribute(attr, value, regex, reference);
    }
};

/**
 * When at least on objectType is set the value in the Attribute field does a query to all registered repositories.
 * @param {Array} objectTypeFilter The array of objectTypeFilter to be searched for.
 * @void
 */
GENTICS.Aloha.ui.AttributeField.prototype.setObjectTypeFilter = function (objectTypeFilter) {
    if (this.extButton) {
    	this.noQuery = false;
    	this.extButton.setObjectType(objectTypeFilter);
    } else {
    	if ( !objectTypeFilter ) {
    		objectTypeFilter = 'all';
    	}
    	this.objectTypeFilter = objectTypeFilter;
    }
};

/**
 * Sets an item to the link tag.
 * @param {resourceItem} item  
 */
GENTICS.Aloha.ui.AttributeField.prototype.setItem = function ( item , displayField ) {
    if (this.extButton) {
    	this.extButton.setItem( item, displayField );
    }
};

/**
 * Gets current item set.
 * @return {resourceItem} item  
 */
GENTICS.Aloha.ui.AttributeField.prototype.getItem = function ( ) {
    if (this.extButton) {
    	return this.extButton.getItem();
    }
    return null;
};

/**
 * Returns the current value
 * @return {String} attributeValue
 */
GENTICS.Aloha.ui.AttributeField.prototype.getValue = function () {
    if (this.extButton) {
    	return this.extButton.getValue();
    }
    return null;
};

/**
 * Sets the current value
 * @param {String} va attributeValue
 */
GENTICS.Aloha.ui.AttributeField.prototype.setValue = function (v) {
    if (this.extButton) {
    	this.extButton.setValue(v);
    }
};

/**
 * Returns the current query value.
 * @return {String} queryValue
 */
GENTICS.Aloha.ui.AttributeField.prototype.getQueryValue = function () {
    if (this.extButton) {
    	//return this.extButton.getValue();
    	return this.extButton.wrap.dom.children[0].value;
    }
    return null;
};

/**
 * Set the display field, which is displayed in the combobox
 * @param {String} displayField name of the field to be displayed
 * @return display field name on success, null otherwise
 */
GENTICS.Aloha.ui.AttributeField.prototype.setDisplayField = function (displayField) {
    if (this.extButton) {
    	return this.extButton.displayField = displayField;
    } else {
    	return this.displayField = displayField;
    }
    return null;
};

/**
 * Set the row template for autocomplete hints. The default template is:
 * <span><b>{name}</b><br />{url}</span>
 * @param {String} tpl template to be rendered for each row
 * @return template on success or null otherwise
 */
GENTICS.Aloha.ui.AttributeField.prototype.setTemplate = function (tpl) {
	if (this.extButton) {
		return this.extButton.tpl = '<tpl for="."><div class="x-combo-list-item">' + tpl + '</div></tpl>';
	} else {
		return this.tpl = '<tpl for="."><div class="x-combo-list-item">' + tpl + '</div></tpl>';
	}
	return null;
};/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * !!!! ATTENTION !!!!
 * This is work in progress. This implemenation may change heavily.
 * Not yet implemented:
 * - configuring and templating the list
 * - DnD
 * - passing all possible query attributes to the repository
 * - query of subtree
 * - icon representation
 */
GENTICS.Aloha.ui.Browser = function () {

	/**
	 * @cfg Function called when an element is selected
	 */
	this.onSelect = null;
	
	var that = this;
	
	// define the grid that represents the filelist
	this.grid = new Ext.grid.GridPanel( {
		region : 'center',
		autoScroll : true,
		// the datastore can be used by the gridpanel to fetch data from
		// repository manager
		store : new Ext.data.Store( {
			proxy : new Ext.data.AlohaProxy(),
			reader : new Ext.data.AlohaObjectReader()
		}),
		columns : [ {
			id : 'name',
			header : 'Name',
			width : 100,
			sortable : true,
			dataIndex : 'name'
		}, {
			header : 'URL',
			renderer : function(val) {
				return val;
			},
			width : 300,
			sortable : true,
			dataIndex : 'url'
		} ],
		stripeRows : true,
		autoExpandColumn : 'name',
		height : 350,
		width : 600,
		title : 'Objectlist',
		stateful : true,
		stateId : 'grid',
		selModel: new Ext.grid.RowSelectionModel({singleSelect:true}),
		listeners : {
			'dblclick' : function(e) {
				that.onItemSelect();
			}
		}
	});
    this.grid.getSelectionModel().on({
    	'selectionchange' : function(sm, n, node){
    		var resourceItem = that.grid.getSelectionModel().getSelected();
    		if (resourceItem) {
                this.win.buttons[1].enable();
    		} else {
                this.win.buttons[1].disable();
    		}
        },
        scope:this
    });


	// define the treepanel
	this.tree = new Ext.tree.TreePanel( {
		region : 'center',
		useArrows : true,
		autoScroll : true,
		animate : true,
		enableDD : true,
		containerScroll : true,
		border : false,
		loader : new Ext.tree.AlohaTreeLoader(),
		root : {
			nodeType : 'async',
			text : 'Aloha Repositories',
			draggable : false,
			id : 'aloha'
		},
		rootVisible : false,
		listeners : {
			'beforeload' : function(node) {
				this.loader.baseParams = {
					node : node.attributes
				};
			}
		}
	});
    this.tree.getSelectionModel().on({
        'selectionchange' : function(sm, node){
            if (node) {
            	var resourceItem = node.attributes;
        		that.grid.store.load({ params: {
        			inFolderId: resourceItem.id,
        			objectTypeFilter: that.objectTypeFilter,
        			repositoryId: resourceItem.repositoryId
        		}});
            }
        },
        scope:this
    });

	// nest the tree within a panel
	this.nav = new Ext.Panel( {
		title : 'Navigation',
		region : 'west',
		width : 300,
		layout : 'fit',
		collapsible : true,
		items : [ this.tree ]
	});
				
	// add the nested tree and grid (filelist) to the window
	this.win = new Ext.Window( {
		title : 'Resource Selector',
		layout : 'border',
		width : 800,
		height : 300,
		closeAction : 'hide',
		onEsc: function () { 
			this.hide();
		},
		defaultButton: this.nav,
		plain : true,
		initHidden: true,
		items : [ this.nav, this.grid ],
		buttons : [{
			text : 'Close',
			handler : function() {
				that.win.hide();
			}
		}, {
			text : 'Select',
			disabled : true,
			handler : function() {
				that.onItemSelect();
			}
		}],
	    toFront : function(e) {
	        this.manager = this.manager || Ext.WindowMgr;
	        this.manager.bringToFront(this); 
	        this.setZIndex(9999999999); // bring really to front (floating menu is not registered as window...)
	        return this;
	    }
	});
	
	this.onItemSelect = function () {
		var sm =  this.grid.getSelectionModel();
		var sel = (sm) ? sm.getSelected() : null;
		var resourceItem = (sel) ? sel.data : null;
		this.win.hide();
		if ( typeof this.onSelect == 'function' ) {
			this.onSelect.call(this, resourceItem);
		}
	};
};
	
GENTICS.Aloha.ui.Browser.prototype.setObjectTypeFilter = function(otf) {
	this.objectTypeFilter = otf;
};

GENTICS.Aloha.ui.Browser.prototype.getObjectTypeFilter = function() {
	return this.objectTypeFilter;
};

GENTICS.Aloha.ui.Browser.prototype.show = function() {
	this.win.show(); // first show,
	this.win.toFront(true);
	this.win.focus();
};
/* This is auto generated on build-dev-include build. Templates at /build/deps/includecss* */ 
(function(){
	
	if ( typeof this.GENTICS_Aloha_autoloadcss == 'undefined' || !(this.GENTICS_Aloha_autoloadcss == false) ) {
	
		/* Check if base DIR is set through configuration otherwise set to default */
		var base = GENTICS.Aloha.autobase;
		if (typeof GENTICS_Aloha_base != 'undefined') {
				base = GENTICS_Aloha_base;
		}
	
		/* load stylsheets */
		var header = document.getElementsByTagName("head")[0];
		header.appendChild(cssElement(base + 'css/aloha.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'deps/extjs/resources/css/ext-all.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'deps/extjs/resources/css/xtheme-gray.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'deps/prettyPhoto/resources/css/prettyPhoto.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'plugins/com.gentics.aloha.plugins.Table/resources/table.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'plugins/com.gentics.aloha.plugins.Link/css/Link.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'plugins/com.gentics.aloha.plugins.HighlightEditables/css/HighlightEditables.css?v=' + GENTICS.Aloha.version));
		header.appendChild(cssElement(base + 'plugins/com.gentics.aloha.plugins.LinkChecker/css/LinkChecker.css?v=' + GENTICS.Aloha.version));

	}

	/* Generate xHTML valid css Elements */
	function cssElement( link ) {
		var csslink = document.createElement("link");
		csslink.setAttribute("rel", "stylesheet");
		csslink.setAttribute("type", "text/css");
		csslink.setAttribute("href", link);
		csslink.setAttribute("media", "all");
		return csslink;
	}
})();
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Editable object
 * @namespace GENTICS.Aloha
 * @class Editable
 * @method
 * @constructor
 * @param {Object} obj jQuery object reference to the object
 */
GENTICS.Aloha.Editable = function(obj) {

	// check wheter the object has an ID otherwise generate and set globally unique ID
	if ( !obj.attr('id') ) {
		obj.attr('id', GENTICS.Utils.guid());
	}

	// store object reference
	this.obj = obj;

	// the editable is not yet ready
	this.ready = false;

	// register the editable with Aloha
	GENTICS.Aloha.registerEditable(this);

	// try to initialize the editable
	this.init();
};

/**
 * True, if this editable is active for editing
 * @property
 * @type boolean
 */
GENTICS.Aloha.Editable.prototype.isActive = false;

/**
 * stores the original content to determine if it has been modified
 * @hide
 */
GENTICS.Aloha.Editable.prototype.originalContent = null;

/**
 * every time a selection is made in the current editable the selection has to
 * be saved for further use
 * @hide
 */
GENTICS.Aloha.Editable.prototype.range = undefined;

/**
 * Check if object can be edited by Aloha Editor
 * @return {boolean } editable true if Aloha Editor can handle else false 
 * @hide
 */
GENTICS.Aloha.Editable.prototype.check = function() {
	
	/* TODO check those elements
	'map', 'meter', 'object', 'output', 'progress', 'samp',
	'time', 'area', 'datalist', 'figure', 'kbd', 'keygen',
	'mark', 'math', 'wbr', 'area',
    */
	
	// Extract El
	var	obj = this.obj,
		el = obj.get(0),
		nodeName = el.nodeName.toLowerCase();
	
	// supported elements
	var textElements = [ 'a', 'abbr', 'address', 'article', 'aside',
				'b', 'bdo', 'blockquote',  'cite', 'code', 'command',
				'del', 'details', 'dfn', 'div', 'dl', 'em', 'footer', 'h1', 'h2',
				'h3', 'h4', 'h5', 'h6', 'header', 'i', 'ins', 'menu',
				'nav', 'p', 'pre', 'q', 'ruby',  'section', 'small',
				'span', 'strong',  'sub', 'sup', 'var']; 	
	
	for (var i = 0; i < textElements.length; i++) {
		var e = nodeName;
		if ( nodeName == textElements[i] ) {
			return true;
		}
	}
	
	// special handled elements
	switch ( nodeName ) {
		case 'label':
		case 'button':
			// TODO need some special handling.
	    	break;
		
		case 'textarea':
			// Create a div alongside the textarea
			var div = jQuery('<div/>').insertAfter(obj);
			// Populate the div with the value of the textarea
			div.html(obj.val());
			// Hide the textarea
			obj.hide();
			// Attach a onsubmit to the form to place the HTML of the div back into the textarea
			var updateFunction = function(){
				var val = div.html();
				obj.val(val);
			};
			obj.parents('form:first').submit(updateFunction);
			// Swap textarea reference with the new div
			this.obj = div;
			// Supported
			return true;
			
		default:
			break;
	}
				
	// the following elements are not supported
	/*		
	'canvas', 'audio', 'br', 'embed', 'fieldset', 'hgroup', 'hr', 
	'iframe', 'img', 'input', 'map', 'script', 'select', 'style', 
	'svg', 'table', 'ul', 'video', 'ol', 'form', 'noscript',
	 */
	return false;
};


/**
 * Initialize the editable
 * @return void
 * @hide
 */
GENTICS.Aloha.Editable.prototype.init = function() {
	var that = this;
	
	// check if Aloha can handle the obj as Editable
	if ( !this.check( this.obj ) ) {
		//GENTICS.Aloha.log('warn', this, 'Aloha cannot handle {' + this.obj[0].nodeName + '}');
		this.destroy();
		return;
	}
	
	// only initialize the editable when Aloha is ready
	if (GENTICS.Aloha.ready) {

		// initialize the object
		this.obj.addClass('GENTICS_editable');
		this.obj.attr('contentEditable', true);
		
		// add focus event to the object to activate
		this.obj.mousedown(function(e) {
			that.activate(e);
			e.stopPropagation();
		});
		
		this.obj.focus(function(e) {
			that.activate(e);
		});
		
		// by catching the keydown we can prevent the browser from doing its own thing
		// if it does not handle the keyStroke it returns true and therefore all other
		// events (incl. browser's) continue
		this.obj.keydown( function(event) { 
			return GENTICS.Aloha.Markup.preProcessKeyStrokes(event);
		});

		// handle shortcut keys
		this.obj.keyup( function(event) { 
			if (event['keyCode'] == 27 ) {
				GENTICS.Aloha.deactivateEditable();
				return false;
			}
		});
		
		// register the onSelectionChange Event with the Editable field
		this.obj.GENTICS_contentEditableSelectionChange(function (event) {
			GENTICS.Aloha.Selection.onChange(that.obj, event);
			return that.obj;
		});
		
		// throw a new event when the editable has been created
		/**
		 * @event editableCreated fires after a new editable has been created, eg. via $('#editme').aloha()
		 * The event is triggered in Aloha's global scope GENTICS.Aloha
		 * @param {Event} e the event object
		 * @param {Array} a an array which contains a reference to the currently created editable on its first position 
		 */
		GENTICS.Aloha.EventRegistry.trigger(
				new GENTICS.Aloha.Event(
						'editableCreated',
						GENTICS.Aloha,
						[ this ]
				)
		);

		// mark the editable as unmodified
		this.setUnmodified();
		
		// now the editable is ready
		this.ready = true;
	}
};

/**
 * destroy the editable
 * @return void
 * @hide
 */
GENTICS.Aloha.Editable.prototype.destroy = function() {
	var that = this;
	
	// leave the element just to get sure
	this.blur();
	
	// now the editable is not ready any more
	this.ready = false;

	// initialize the object
	this.obj.removeClass('GENTICS_editable');
	this.obj.removeAttr('contentEditable');
	
	// unbind all events 
	// TODO should only unbind the specific handlers.
	this.obj.unbind('mousedown'); 
	this.obj.unbind('focus'); 
	this.obj.unbind('keydown'); 
	this.obj.unbind('keyup'); 
	
	/* TODO remove this event, it should implemented as bind and unbind
	// register the onSelectionChange Event with the Editable field
	this.obj.GENTICS_contentEditableSelectionChange(function (event) {
		GENTICS.Aloha.Selection.onChange(that.obj, event);
		return that.obj;
	});
	*/
	
	// throw a new event when the editable has been created
	/**
	 * @event editableCreated fires after a new editable has been destroyes, eg. via $('#editme').mahalo()
	 * The event is triggered in Aloha's global scope GENTICS.Aloha
	 * @param {Event} e the event object
	 * @param {Array} a an array which contains a reference to the currently created editable on its first position 
	 */
	GENTICS.Aloha.EventRegistry.trigger(
			new GENTICS.Aloha.Event(
					'editableDestroyed',
					GENTICS.Aloha,
					[ this ]
			)
	);

	// finally register the editable with Aloha
	GENTICS.Aloha.unregisterEditable(this);

};

/**
 * marks the editables current state as unmodified. Use this method to inform the editable
 * that it's contents have been saved
 * @method
 */
GENTICS.Aloha.Editable.prototype.setUnmodified = function () {
	this.originalContent = this.getContents();
};

/**
 * check if the editable has been modified during the edit process#
 * @method
 * @return boolean true if the editable has been modified, false otherwise
 */
GENTICS.Aloha.Editable.prototype.isModified = function () {
	if (this.originalContent != this.getContents()) {
		return true;
	} else {
		return false;
	}
};

/**
 * String representation of the object
 * @method
 * @return GENTICS.Aloha.Editable
 */
GENTICS.Aloha.Editable.prototype.toString = function() {  
	return 'GENTICS.Aloha.Editable';
};

/**
 * check whether the editable has been disabled 
 */
GENTICS.Aloha.Editable.prototype.isDisabled = function () {
	if (this.obj.attr("contentEditable") == "false" || !this.obj.attr("contentEditable")) {
		return true;
	} else {
		return false;
	}
};

/**
 * disable this editable
 * a disabled editable cannot be written on by keyboard
 */
GENTICS.Aloha.Editable.prototype.disable = function() {
	if (this.isDisabled()) {
		return;
	}
	this.obj.attr("contentEditable", "false");
};

/**
 * enable this editable
 * reenables a disabled editable to be writteable again 
 */
GENTICS.Aloha.Editable.prototype.enable = function() {
	if (!this.isDisabled()) {
		return;
	}
	this.obj.attr("contentEditable", "true");
};


/**
 * activates an Editable for editing
 * disables all other active items
 * @method
 */
GENTICS.Aloha.Editable.prototype.activate = function(e) {
	
	// leave immediately if this is already the active editable
	if (this.isActive || this.isDisabled()) {
		return;
	}

	// get active Editable before setting the new one.
	var oldActive = GENTICS.Aloha.getActiveEditable(); 
	
	// set active Editable in core
	GENTICS.Aloha.activateEditable( this );
	
	// ie specific: trigger one mouseup click to update the range-object
	if (document.selection && document.selection.createRange) {
		this.obj.mouseup();
	}

	// finally mark this object as active
	this.isActive = true;
	
	/**
	 * @event editableActivated fires after the editable has been activated by clicking on it.
	 * This event is triggered in Aloha's global scope GENTICS.Aloha
	 * @param {Event} e the event object
	 * @param {Array} a an array which contains a reference to last active editable on its first position, as well
	 * as the currently active editable on it's second position 
	 */
	// trigger a 'general' editableActivated event
	GENTICS.Aloha.EventRegistry.trigger(
		new GENTICS.Aloha.Event('editableActivated', GENTICS.Aloha, {
			'oldActive' : oldActive,
			'editable' : this
		})
	);

	/**
	 * @event editableActivated fires after the editable has been activated by clicking on it.
	 * This event is triggered in the Editable's local scope
	 * @param {Event} e the event object
	 * @param {Array} a an array which contains a reference to last active editable on its first position 
	 */
	// and trigger our *finished* event
	GENTICS.Aloha.EventRegistry.trigger(
			new GENTICS.Aloha.Event('editableActivated', this, {
				'oldActive' : GENTICS.Aloha.getActiveEditable()
			})
	);

};

/**
 * handle the blur event
 * this must not be attached to the blur event, which will trigger far too often
 * eg. when a table within an editable is selected
 * @hide 
 */
GENTICS.Aloha.Editable.prototype.blur = function() {

	// blur this contenteditable
	this.obj.blur();

	// disable active status
	this.isActive = false;
	
	/**
	 * @event editableDeactivated fires after the editable has been activated by clicking on it.
	 * This event is triggered in Aloha's global scope GENTICS.Aloha
	 * @param {Event} e the event object
	 * @param {Array} a an array which contains a reference to this editable 
	 */	
	// trigger a 'general' editableDeactivated event
	GENTICS.Aloha.EventRegistry.trigger(
		new GENTICS.Aloha.Event('editableDeactivated', GENTICS.Aloha, {
			'editable' : this
		})
	);

	/**
	 * @event editableDeactivated fires after the editable has been activated by clicking on it.
	 * This event is triggered in the Editable's scope
	 * @param {Event} e the event object
	 */	
	GENTICS.Aloha.EventRegistry.trigger(
			new GENTICS.Aloha.Event('editableDeactivated', this)
	);
};

/**
 * check if the string is empty
 * used for zerowidth check
 * @return true if empty or string is null, false otherwise
 * @hide
 */
GENTICS.Aloha.Editable.prototype.empty = function(str) {
	if (null === str) {
		return true;
	}

	// br is needed for chrome
	return (GENTICS.Aloha.trim(str) == '' || str == '<br>');
};

/**
 * Get the contents of this editable as a HTML string
 * @method
 * @return contents of the editable
 */
GENTICS.Aloha.Editable.prototype.getContents = function() {
	// clone the object
	var clonedObj = this.obj.clone(true);
	GENTICS.Aloha.PluginRegistry.makeClean(clonedObj);
	return clonedObj.html();
};

/**
 * Get the id of this editable
 * @method
 * @return id of this editable
 */
GENTICS.Aloha.Editable.prototype.getId = function() {
	return this.obj.attr('id');
};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Aloha Ribbon
 * <p>Setting GENTICS.Aloha.settings.ribbon to bool false before Aloha is loaded will hide the ribbon.</p>  
 * @namespace GENTICS.Aloha
 * @class Ribbon
 * @singleton
 */
GENTICS.Aloha.Ribbon = function() {
	
	var that = this;

	// flag to mark whether ribbon is visible
	this.visible = false;

	// the ribbon
	this.toolbar = new Ext.Toolbar({
		height: 30,
		cls: 'GENTICS_ribbon ext-root'
	});
	
	// left spacer to gain some space from the left screen border
	this.toolbar.add(new Ext.Toolbar.Spacer({width: '5'}));
	// icon
	this.icon = new Ext.Toolbar.Spacer();
	this.toolbar.add(this.icon);
	// fill so that everything after it is aligned right
	this.toolbar.add(new Ext.Toolbar.Fill());
	// seperator before the fade out button
	this.toolbar.add(new Ext.Toolbar.Separator());
	// fade out button
	var fadeButton = new Ext.Button({
		iconCls : 'GENTICS_fade_out',
		handler : function (button) {
			var toolbar = jQuery(that.toolbar.getEl().dom);
			
			if (button.iconCls == 'GENTICS_fade_out') {
				toolbar.css('marginLeft', '34px');
				toolbar.animate({
					left: '-100%'
				});
				jQuery('body').animate({
					paddingTop: 0
				});
				button.setIconClass('GENTICS_fade_in');
			} else {
				toolbar.css('marginLeft', '0px');
				toolbar.animate({
					left: '0%'
				});
				jQuery('body').animate({
					paddingTop: 30
				});
				button.setIconClass('GENTICS_fade_out');
			}
			that.toolbar.doLayout();
		}
	});
	this.toolbar.add(fadeButton);
	// spacer to gain some space from the right screen border
	this.toolbar.add(new Ext.Toolbar.Spacer({width: '5'}));
};

/**
 * Sets the icon class for the ribbon icon
 * @param {String} iconClass CSS class for the icon
 */
GENTICS.Aloha.Ribbon.prototype.setIcon = function (iconClass) {
	if (typeof this.icon.cls != 'undefined') {
		this.icon.removeClass(this.icon.cls);
	}
	
	this.icon.addClass(iconClass);
};

/**
 * Adds a GENTICS.Aloha.ui.Button the Ribbon
 * @param {Button} button Button to be added to the Ribbon
 */
GENTICS.Aloha.Ribbon.prototype.addButton = function (button) {
	
	if (typeof button.menu === 'object') {
		// build the drop down menu
		var menu = new Ext.menu.Menu();
		jQuery.each(button.menu, function(index, entry) {
			menu.addItem(new Ext.menu.Item({
				text: entry.label,
				icon: entry.icon,
				iconCls: entry.iconClass,
				handler: function() {
					entry.onclick.apply(entry);
				}
			}));
		});
	}
	
	// configuration for the button
	var buttonConfig = {
		text : button.label,
		enableToggle: button.toggle,
		icon: button.icon,
		pressed : button.pressed,
		iconCls: button.iconClass,
		menu : menu,
		handler : function() {
			if (typeof button.onclick === 'function') {
				button.onclick.apply(button);
			}
			button.pressed = !button.pressed;
		}
	};
	
	var extButton;
	
	// Build a split button if we have a menu and a handler
	if (menu && typeof button.onclick == 'function') {
		// build the split button for the menu
		extButton = new Ext.SplitButton(buttonConfig);
	} else {
		// build a normal button
		extButton = new Ext.Button(buttonConfig);
	}
	
	this.toolbar.insert(this.toolbar.items.getCount() - 3, extButton);
};

/**
 * Adds a seperator to the Ribbon.
 */
GENTICS.Aloha.Ribbon.prototype.addSeparator = function() {
	this.toolbar.insert(this.toolbar.items.getCount() - 3, new Ext.Toolbar.Separator());
};

/**
 * Initilization of the Ribbon
 * @hide
 */
GENTICS.Aloha.Ribbon.prototype.init = function() {
	
	this.toolbar.render(document.body, 0);
	
	if (GENTICS.Aloha.settings.ribbon === true) {
		
		jQuery('body').css('paddingTop', '30px !important');
		this.show();
	}
};

/**
 * Shows the ribbon
 */
GENTICS.Aloha.Ribbon.prototype.hide = function () {
	jQuery('.GENTICS_ribbon').fadeOut();
	this.visible = false;
};

/**
 * Hides the ribbon
 */
GENTICS.Aloha.Ribbon.prototype.show = function () {
	jQuery('.GENTICS_ribbon').fadeIn();
	this.visible = true;
};

/**
 * Check whether the ribbon is visible right now
 * @return true when the ribbon is visible, false when not
 */
GENTICS.Aloha.Ribbon.prototype.isVisible = function () {
	return this.visible;
};

GENTICS.Aloha.Ribbon = new GENTICS.Aloha.Ribbon();/*!
* 
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @namespace GENTICS.Aloha
 * @class Event represents an Aloha Event	
 * @constructor
 * @param {String} eventName the name of the event
 * @param {Object} eventSource the source of the event, which might be any Aloha-specific object. Use the Gentics.Aloha object for global events
 * @param {Object} properties Container object which might contain additional event properties
 */
GENTICS.Aloha.Event = function (eventName, eventSource, properties) {
  this.name = eventName;
  if (eventSource) {
    this.source = eventSource;
  } else {
    this.source = GENTICS.Aloha;
  }
  this.properties = properties;
};

/**
 * @namespace GENTICS.Aloha
 * @class EventRegistry is accountable for managing event subscriptions and triggering events
 * @constructor
 * @singleton
 */
GENTICS.Aloha.EventRegistry = function () {};

/**
 * Subscribe on the given Event from the event source
 * @method
 * @param {object} eventSource event source object
 * @param {string} eventName event name
 * @param {function} handleMethod event handler method
 */
GENTICS.Aloha.EventRegistry.prototype.subscribe = function (eventSource, eventName, handleMethod) {
	jQuery(eventSource).bind(eventName, handleMethod);
};

/**
 * Trigger the given event
 * @method
 * @param {object} event Aloha event object
 */
GENTICS.Aloha.EventRegistry.prototype.trigger = function (event) {
	jQuery(event.source).trigger(event.name, event.properties);
};

GENTICS.Aloha.EventRegistry = new GENTICS.Aloha.EventRegistry();


/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Aloha's Floating Menu
 * @namespace GENTICS.Aloha
 * @class FloatingMenu
 * @singleton
 */
GENTICS.Aloha.FloatingMenu = {};

/**
 * Define the default scopes
 * @property
 * @type Object
 */
GENTICS.Aloha.FloatingMenu.scopes = {
	'GENTICS.Aloha.empty' : {
		'name' : 'GENTICS.Aloha.empty',
		'extendedScopes' : [],
		'buttons' : []
	},
	'GENTICS.Aloha.global' : {
		'name' : 'GENTICS.Aloha.global',
		'extendedScopes' : ['GENTICS.Aloha.empty'],
		'buttons' : []
	},
	'GENTICS.Aloha.continuoustext' : {
		'name' : 'GENTICS.Aloha.continuoustext',
		'extendedScopes' : ['GENTICS.Aloha.global'],
		'buttons' : []
	}
};

/**
 * Array of tabs within the floatingmenu
 * @hide
 */
GENTICS.Aloha.FloatingMenu.tabs = new Array();

/**
 * 'Map' of tabs (for easy access)
 * @hide
 */
GENTICS.Aloha.FloatingMenu.tabMap = {};

/**
 * Flag to mark whether the floatingmenu is initialized
 * @hide
 */
GENTICS.Aloha.FloatingMenu.initialized = false;

/**
 * Array containing all buttons
 * @hide
 */
GENTICS.Aloha.FloatingMenu.allButtons = new Array();

/**
 * top part of the floatingmenu position
 * @hide
 */
GENTICS.Aloha.FloatingMenu.top = 100;

/**
 * left part of the floatingmenu position
 * @hide
 */
GENTICS.Aloha.FloatingMenu.left = 100;

/**
 * store pinned status - true, if the FloatingMenu is pinned
 * @property
 * @type boolean
 */
GENTICS.Aloha.FloatingMenu.pinned = false;

/**
 * just a reference to the jQuery(window) object, which is used quite often
 */
GENTICS.Aloha.FloatingMenu.window = jQuery(window);

/**
 * Initialize the floatingmenu
 * @hide
 */
GENTICS.Aloha.FloatingMenu.init = function() {
	this.currentScope = 'GENTICS.Aloha.global';
	var that = this;
	this.window.unload(function () {
		// store fm position if the panel is pinned to be able to restore it next time
		if (that.pinned) {
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.pinned', 'true');
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.top', that.obj.offset().top);
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.left', that.obj.offset().left);
			if (GENTICS.Aloha.Log.isInfoEnabled()) {
				GENTICS.Aloha.Log.info(this, 'stored FloatingMenu pinned position {' + that.obj.offset().left 
						+ ', ' + that.obj.offset().top + '}');
			}
		} else {
			// delete old cookies
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.pinned', null);
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.top', null);
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.left', null);
		}
		if (that.userActivatedTab) {
			jQuery.cookie('GENTICS.Aloha.FloatingMenu.activeTab', that.userActivatedTab);
		}
	}).resize(function () {
		var target = that.calcFloatTarget(GENTICS.Aloha.Selection.getRangeObject());
		if (target) {
			that.floatTo(target);
		}
	});
	this.generateComponent();	
	this.initialized = true;
};

/**
 * jQuery reference to the extjs tabpanel
 * @hide
 */
GENTICS.Aloha.FloatingMenu.obj = null;

/**
 * jQuery reference to the shadow obj
 * @hide
 */
GENTICS.Aloha.FloatingMenu.shadow = null;

/**
 * jQuery reference to the panels body wrap div
 * @hide
 */
GENTICS.Aloha.FloatingMenu.panelBody = null;

/**
 * Generate the rendered component for the floatingmenu
 * @hide
 */
GENTICS.Aloha.FloatingMenu.generateComponent = function () {
	var that = this;

	// Initialize and configure the tooltips
	Ext.QuickTips.init();
	Ext.apply(Ext.QuickTips.getQuickTip(), {
		minWidth : 10
	});
	
	if (this.extTabPanel) {
		// TODO dispose of the ext component
	}

	// generate the tabpanel object
	this.extTabPanel = new Ext.TabPanel({
		activeTab: 0,
		width: 400, // 336px this fits the multisplit button and 6 small buttons placed in 3 cols
		plain: false,
		draggable: {
			insertProxy: false,
			onDrag : function(e) {
				var pel = this.proxy.getEl();
				this.x = pel.getLeft(true);
				this.y = pel.getTop(true);
				GENTICS.Aloha.FloatingMenu.shadow.hide();
			},
			endDrag : function(e) {
				if (GENTICS.Aloha.FloatingMenu.pinned) {
					var top = this.y - jQuery(document).scrollTop();
				} else {
					var top = this.y;
				}
				that.left = this.x;
				that.top = top;
				this.panel.setPosition(this.x, top);
				GENTICS.Aloha.FloatingMenu.refreshShadow();
				GENTICS.Aloha.FloatingMenu.shadow.show();
			}
		},
		floating: true,
		defaults: {
			autoScroll: true 
		},
		layoutOnTabChange : true,
		shadow: false,
		cls: 'GENTICS_floatingmenu ext-root',
		listeners : {
			'tabchange' : {
				'fn' : function(tabPanel, tab) {
					if (tab.title != that.autoActivatedTab) {
						if (GENTICS.Aloha.Log.isDebugEnabled()) {
							GENTICS.Aloha.Log.debug(that, 'User selected tab ' + tab.title);
						}
						// remember the last user-selected tab
						that.userActivatedTab = tab.title;
					} else {
						if (GENTICS.Aloha.Log.isDebugEnabled()) {
							GENTICS.Aloha.Log.debug(that, 'Tab ' + tab.title + ' was activated automatically');
						}
					}
					that.autoActivatedTab = undefined;

					// ok, this is kind of a hack: when the tab changes, we check all buttons for multisplitbuttons (which have the method setActiveDOMElement).
					// if a DOM Element is queued to be set active, we try to do this now.
					// the reason for this is that the active DOM element can only be set when the multisplit button is currently visible.
					jQuery.each(that.allButtons, function(index, buttonInfo) {
						if (typeof buttonInfo.button != 'undefined'
							&& typeof buttonInfo.button.extButton != 'undefined'
							&& typeof buttonInfo.button.extButton.setActiveDOMElement == 'function') {
							if (typeof buttonInfo.button.extButton.activeDOMElement != 'undefined') {
								buttonInfo.button.extButton.setActiveDOMElement(buttonInfo.button.extButton.activeDOMElement);
							}
						}
					});
					
					// adapt the shadow
					GENTICS.Aloha.FloatingMenu.shadow.show();
					GENTICS.Aloha.FloatingMenu.refreshShadow();
				}
			}
		},
		enableTabScroll : true
	});

	// add the tabs
	jQuery.each(this.tabs, function(index, tab) {
		// let each tab generate its ext component and add them to the panel
		that.extTabPanel.add(tab.getExtComponent());
	});
	
	// add the dropshadow
	jQuery('body').append('<div id="GENTICS_floatingmenu_shadow" class="GENTICS_shadow">&#160;</div>');
	this.shadow = jQuery('#GENTICS_floatingmenu_shadow');
	
	// add an empty pin tab item, store reference
	var pinTab = this.extTabPanel.add({
		title : '&#160;'
	});

	// finally render the panel to the body
	this.extTabPanel.render(document.body);

	// finish the pin element after the FM has rendered (before there are noe html contents to be manipulated
	jQuery(pinTab.tabEl)
		.addClass('GENTICS_floatingmenu_pin')
		.html('&#160;')
		.mousedown(function (e) {
			that.togglePin();
			e.stopPropagation();
		});
	
	// a reference to the panels body needed for shadow size & position
	this.panelBody = jQuery('.GENTICS_floatingmenu .x-tab-panel-bwrap');
	
	// do the visibility
	this.doLayout();

	// bind jQuery reference to extjs obj
	// this has to be done AFTER the tab panel has been rendered
	this.obj = jQuery(this.extTabPanel.getEl().dom);
	
	if (jQuery.cookie('GENTICS.Aloha.FloatingMenu.pinned') == 'true') {
		this.togglePin();
		
		this.top = parseInt(jQuery.cookie('GENTICS.Aloha.FloatingMenu.top'));
		this.left = parseInt(jQuery.cookie('GENTICS.Aloha.FloatingMenu.left'));
		
		// do some positioning fixes
		if (this.top < 30) {
			this.top = 30;
		}
		if (this.left < 0) {
			this.left = 0;
		}
		
		if (GENTICS.Aloha.Log.isInfoEnabled()) {
			GENTICS.Aloha.Log.info(this, 'restored FloatingMenu pinned position {' + this.left + ', ' + this.top + '}');
		}
		
		this.refreshShadow();
	}

	// set the user activated tab stored in a cookie
	if (jQuery.cookie('GENTICS.Aloha.FloatingMenu.activeTab')) {
		this.userActivatedTab = jQuery.cookie('GENTICS.Aloha.FloatingMenu.activeTab');
	}

	// for now, position the panel somewhere
	this.extTabPanel.setPosition(this.left, this.top);
	
	// disable event bubbling for mousedown, because we don't want to recognize
	// a click into the floatingmenu to be a click into nowhere (which would
	// deactivate the editables)
	this.obj.mousedown(function (e) {
		e.stopPropagation();
	});
	
	// listen to selectionChanged event
	GENTICS.Aloha.EventRegistry.subscribe(
			GENTICS.Aloha,
			'selectionChanged',
			function(event, rangeObject) {
				if (!that.pinned) {
					var pos = that.calcFloatTarget(rangeObject);
					if (pos) {
						that.floatTo(pos);
					}
				}
	});
};

/**
 * reposition & resize the shadow
 * the shadow must not be repositioned outside this method!
 * position calculation is based on this.top and this.left coordinates
 * @method
 */
GENTICS.Aloha.FloatingMenu.refreshShadow = function () {
	if (!this.panelBody) {
		return;
	}
	GENTICS.Aloha.FloatingMenu.shadow.css('top', this.top + 24); // 24px top offset to reflect tab bar height
	GENTICS.Aloha.FloatingMenu.shadow.css('left', this.left);
	GENTICS.Aloha.FloatingMenu.shadow.width(this.panelBody.width());
	GENTICS.Aloha.FloatingMenu.shadow.height(this.panelBody.height());
};

/**
 * toggles the pinned status of the floating menu
 * @method
 */
GENTICS.Aloha.FloatingMenu.togglePin = function() {
	var el = jQuery('.GENTICS_floatingmenu_pin');
	if (this.pinned) {
		el.removeClass('GENTICS_floatingmenu_pinned');
		this.top = this.obj.offset().top;
		
		this.obj.css('top', this.top);
		this.obj.css('position', 'absolute');

		this.shadow.css('position', 'absolute');
		this.refreshShadow();
		
		this.pinned = false;
	} else {
		el.addClass('GENTICS_floatingmenu_pinned');
		this.top = this.obj.offset().top - this.window.scrollTop();
		
		// update position as preparation for fixed position 
		this.obj.css('top', this.top);
		// fix the floating menu in place
		this.obj.css('position', 'fixed');
		
		// do the same for the shadow
		this.shadow.css('position', 'fixed');
		this.refreshShadow();
		
		this.pinned = true;
	}
};

/**
 * Create a new scopes
 * @method
 * @param {String} scope name of the new scope (should be namespaced for uniqueness)
 * @param {String} extendedScopes Array of scopes this scope extends. Can also be a single String if
 *            only one scope is extended, or omitted if the scope should extend
 *            the empty scope
 */
GENTICS.Aloha.FloatingMenu.createScope = function(scope, extendedScopes) {
	if (typeof extendedScopes == 'undefined') {
		extendedScopes = ['GENTICS.Aloha.empty'];
	} else if (typeof extendedScopes == 'string') {
		extendedScopes = [extendedScopes];
	}

	// TODO check whether the extended scopes already exist

	var scopeObject = this.scopes[scope];
	if (scopeObject) {
		// TODO what if the scope already exists?
	} else {
		// generate the new scope
		this.scopes[scope] = {'name' : scope, 'extendedScopes' : extendedScopes, 'buttons' : []};
	}
};

/**
 * Adds a button to the floatingmenu
 * @method
 * @param {String} scope the scope for the button, should be generated before (either by core or the plugin)
 * @param {Button} button instance of GENTICS.Aloha.ui.button to add at the floatingmenu
 * @param {String} tab label of the tab to which the button is added
 * @param {int} group index of the button group in the tab, lowest index is left
 */
GENTICS.Aloha.FloatingMenu.addButton = function(scope, button, tab, group) {
	// check whether the scope exists
	var scopeObject = this.scopes[scope];
	if (typeof scopeObject == 'undefined') {
		// TODO log an error and exit
	}

	// generate a buttonInfo object
	var buttonInfo = {'button' : button, 'scopeVisible' : false};

	// add the button to the list of all buttons
	this.allButtons.push(buttonInfo);

	// add the button to the scope
	scopeObject.buttons.push(buttonInfo);

	// get the tab object
	var tabObject = this.tabMap[tab];
	if (typeof tabObject == 'undefined') {
		// the tab object does not yet exist, so create a new tab and add it to the list
		tabObject = new GENTICS.Aloha.FloatingMenu.Tab(tab);
		this.tabs.push(tabObject);
		this.tabMap[tab] = tabObject;
	}

	// get the group
	var groupObject = tabObject.getGroup(group);

	// now add the button to the group
	groupObject.addButton(buttonInfo);

	// finally, when the floatingmenu is already initialized, we need to create the ext component now
	if (this.initialized) {
		this.generateComponent();
	}
};

/**
 * Recalculate the visibility of tabs, groups and buttons (depending on scope and button hiding)
 * @hide
 */
GENTICS.Aloha.FloatingMenu.doLayout = function () {
	if (GENTICS.Aloha.Log.isDebugEnabled()) {
		GENTICS.Aloha.Log.debug(this, 'doLayout called for FloatingMenu, scope is ' + this.currentScope);
	}
	var that = this;
	var firstVisibleTab = false;
	var activeExtTab = this.extTabPanel.getActiveTab();
	var activeTab = false;
	var floatingMenuVisible = false;
	var showUserActivatedTab = false;

	// let the tabs layout themselves
	jQuery.each(this.tabs, function(index, tab) {
		// remember the active tab
		if (tab.extPanel == activeExtTab) {
			activeTab = tab;
		}

		// remember whether the tab is currently visible
		var tabVisible = tab.visible;

		// let each tab generate its ext component and add them to the panel
		if (tab.doLayout()) {
			// found a visible tab, so the floatingmenu needs to be visible as well
			floatingMenuVisible = true;

			// make sure the tabstrip is visible
			if (!tabVisible) {
				if (GENTICS.Aloha.Log.isDebugEnabled()) {
					GENTICS.Aloha.Log.debug(that, 'showing tab strip for tab ' + tab.label);
				}
				that.extTabPanel.unhideTabStripItem(tab.extPanel);
			}

			// remember the first visible tab
			if (firstVisibleTab == false) {
				// this is the first visible tab (in case we need to switch to it)
				firstVisibleTab = tab;
			}

			// check whether this visible tab is the last user activated tab and currently not active
			if (that.userActivatedTab == tab.extPanel.title && tab.extPanel != activeExtTab) {
				showUserActivatedTab = tab;
			}
		} else {
			// make sure the tabstrip is hidden
			if (tabVisible) {
				if (GENTICS.Aloha.Log.isDebugEnabled()) {
					GENTICS.Aloha.Log.debug(that, 'hiding tab strip for tab ' + tab.label);
				}
				that.extTabPanel.hideTabStripItem(tab.extPanel);
			}
		}
	});

	// check whether the last tab which was selected by the user is visible and not the active tab
	if (showUserActivatedTab) {
		if (GENTICS.Aloha.Log.isDebugEnabled()) {
			GENTICS.Aloha.Log.debug(this, 'Setting active tab to ' + showUserActivatedTab.label);
		}
		this.extTabPanel.setActiveTab(showUserActivatedTab.extPanel);
	} else if (typeof activeTab == 'object' && typeof firstVisibleTab == 'object') {
		// now check the currently visible tab, whether it is visible and enabled
		if (!activeTab.visible) {
			if (GENTICS.Aloha.Log.isDebugEnabled()) {
				GENTICS.Aloha.Log.debug(this, 'Setting active tab to ' + firstVisibleTab.label);
			}
			this.autoActivatedTab = firstVisibleTab.extPanel.title;
			this.extTabPanel.setActiveTab(firstVisibleTab.extPanel);
		}
	}

	// set visibility of floatingmenu
	if (floatingMenuVisible && this.extTabPanel.hidden) {
		// set the remembered position
		this.extTabPanel.show();
		this.refreshShadow();
		this.shadow.show();
		this.extTabPanel.setPosition(this.left, this.top);
	} else if (!floatingMenuVisible && !this.extTabPanel.hidden) {
		// remember the current position
		var pos = this.extTabPanel.getPosition(true);
		// restore previous position if the fm was pinned
		this.left = pos[0] < 0 ? 100 : pos[0];
		this.top = pos[1] < 0 ? 100 : pos[1];
		this.extTabPanel.hide();
		this.shadow.hide();
	}

	// let the Ext object render itself again
	this.extTabPanel.doLayout();
};

/**
 * Set the current scope
 * @method
 * @param {String} scope name of the new current scope
 */
GENTICS.Aloha.FloatingMenu.setScope = function(scope) {
	// get the scope object
	var scopeObject = this.scopes[scope];

	if (typeof scopeObject == 'undefined') {
		// TODO log an error
	} else if (this.currentScope != scope) {
		this.currentScope = scope;

		// first hide all buttons
		jQuery.each(this.allButtons, function(index, buttonInfo) {
			buttonInfo.scopeVisible = false;
		});

		// now set the buttons in the given scope to be visible
		this.setButtonScopeVisibility(scopeObject);

		// finally refresh the layout
		this.doLayout();
	}
};

/**
 * Set the scope visibility of the buttons for the given scope. This method will call itself for the motherscopes of the given scope.
 * @param scopeObject scope object
 * @hide
 */
GENTICS.Aloha.FloatingMenu.setButtonScopeVisibility = function(scopeObject) {
	var that = this;

	// set all buttons in the given scope to be visible
	jQuery.each(scopeObject.buttons, function(index, buttonInfo) {
		buttonInfo.scopeVisible = true;
	});

	// now do the recursion for the motherscopes
	jQuery.each(scopeObject.extendedScopes, function(index, scopeName) {
		var motherScopeObject = that.scopes[scopeName];
		if (typeof motherScopeObject == 'object') {
			that.setButtonScopeVisibility(motherScopeObject);
		}
	});
};

/**
 * returns the next possible float target dom obj
 * the floating menu should only float to h1-h6, p, div, td and pre elements
 * if the current object is not valid, it's parentNode will be considered, until
 * the limit object is hit
 * @param obj the dom object to start from (commonly this would be the commonAncestorContainer)
 * @param limitObj the object that limits the range (this would be the editable)
 * @return dom object which qualifies as a float target
 * @hide
 */
GENTICS.Aloha.FloatingMenu.nextFloatTargetObj = function (obj, limitObj) {
	// if we've hit the limit object we don't care for it's type
	if (!obj || obj == limitObj) {
		return obj;
	}

	// fm will only float to h1-h6, p, div, td
	switch (obj.nodeName.toLowerCase()) {
		case "h1":
		case "h2":
		case "h3":
		case "h4":
		case "h5":
		case "h6":
		case "p":
		case "div":
		case "td":
		case "pre":
		case "ul":
		case "ol":
			return obj;
			break;
		default:
			return this.nextFloatTargetObj(obj.parentNode, limitObj);
			break;
	}
};

/**
 * calculates the float target coordinates for a range
 * @param range the fm should float to
 * @return object containing x and y coordinates, like { x : 20, y : 43 }
 * @hide
 */
GENTICS.Aloha.FloatingMenu.calcFloatTarget = function(range) {
	if (!GENTICS.Aloha.activeEditable) {
		return false;
	}
	
	// check if the designated editable is disabled
	for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {
		if (GENTICS.Aloha.editables[i].obj.get(0) == range.limitObject &&
				GENTICS.Aloha.editables[i].isDisabled()) {
			return false;
		}
	}
	
	var targetObj = jQuery(this.nextFloatTargetObj(range.getCommonAncestorContainer(), range.limitObject));
	var scrollTop = GENTICS.Utils.Position.Scroll.top;

	var y = targetObj.offset().top - this.obj.height() - 50; // 50px offset above the current obj to have some space above

	// if the floating menu would be placed higher than the top of the screen... 
	var ribbonOffset = 0;
	if ( GENTICS.Aloha.Ribbon && 
			GENTICS.Aloha.settings.ribbon === true) {
		ribbonOffset = 30; // 30px = 26px ribbon height + some breathing room
	}
	if ( y < (scrollTop + ribbonOffset)) { 
		y = targetObj.offset().top + targetObj.height() + ribbonOffset;
	}
	
	// if the floating menu would float off the bottom of the screen
	// we don't want it to move, so we'll return false
	if (y > this.window.height() + this.window.scrollTop()) {
		return false;
	}
	
	return {
		x : GENTICS.Aloha.activeEditable.obj.offset().left,
		y : y 
	};
};

/**
 * float the fm to the desired position
 * the floating menu won't float if it is pinned
 * @method
 * @param {Object} object coordinate object which has a x and y property
 */
GENTICS.Aloha.FloatingMenu.floatTo = function(position) {
	// no floating if the panel is pinned
	if (this.pinned) {
		return;
	}
	
	var that = this;

	// move to the new position
	if (!this.floatedTo || this.floatedTo.x != position.x || this.floatedTo.y != position.y) {
		this.obj.animate({
			top:  position.y,
			left: position.x
		}, { 
			queue : false,
			step : function (step, props) {
				// update position reference
				if (props.prop == 'top') {
					that.top = props.now;
				} else if (props.prop == 'left') {
					that.left = props.now;
				}
				that.refreshShadow();
			}
		});

		// remember the position we floated to
		this.floatedTo = position;
	}
};

/**
 * Constructor for a floatingmenu tab
 * @namespace GENTICS.Aloha.FloatingMenu
 * @class Tab
 * @constructor
 * @param {String} label label of the tab
 */
GENTICS.Aloha.FloatingMenu.Tab = function(label) {
	this.label = label;
	this.groups = new Array();
	this.groupMap = {};
	this.visible = true;
};

/**
 * Get the group with given index. If it does not yet exist, create a new one
 * @method
 * @param {int} group group index of the group to get
 * @return group object
 */
GENTICS.Aloha.FloatingMenu.Tab.prototype.getGroup = function(group) {
	var groupObject = this.groupMap[group];
	if (typeof groupObject == 'undefined') {
		groupObject = new GENTICS.Aloha.FloatingMenu.Group();
		this.groupMap[group] = groupObject;
		this.groups.push(groupObject);
		// TODO resort the groups
	}

	return groupObject;
};

/**
 * Get the EXT component representing the tab
 * @return EXT component (EXT.Panel)
 * @hide
 */
GENTICS.Aloha.FloatingMenu.Tab.prototype.getExtComponent = function () {
	var that = this;

	if (typeof this.extPanel == 'undefined') {
		// generate the panel here
		this.extPanel = new Ext.Panel({
			'tbar' : [],
			'title' : this.label,
			'style': 'margin-top:0px',
			'bodyStyle': 'display:none',
			'autoScroll': true
		});

		// add the groups
		jQuery.each(this.groups, function(index, group) {
			// let each group generate its ext component and add them to the panel
			that.extPanel.getTopToolbar().add(group.getExtComponent());
		});
	}

	return this.extPanel;
};

/**
 * Recalculate the visibility of all groups within the tab
 * @hide
 */
GENTICS.Aloha.FloatingMenu.Tab.prototype.doLayout = function() {
	var that = this;

	if (GENTICS.Aloha.Log.isDebugEnabled()) {
		GENTICS.Aloha.Log.debug(this, 'doLayout called for tab ' + this.label);
	}
	this.visible = false;

	// check all groups in this tab
	jQuery.each(this.groups, function(index, group) {
		that.visible |= group.doLayout();
	});

	if (GENTICS.Aloha.Log.isDebugEnabled()) {
		GENTICS.Aloha.Log.debug(this, 'tab ' + this.label + (this.visible ? ' is ' : ' is not ') + 'visible now');
	}

	return this.visible;
};

/**
 * Constructor for a floatingmenu group
 * @namespace GENTICS.Aloha.FloatingMenu
 * @class Group
 * @constructor
 */
GENTICS.Aloha.FloatingMenu.Group = function() {
	this.buttons = new Array();
};

/**
 * Add a button to this group
 * @param {Button} buttonInfo to add to the group
 */
GENTICS.Aloha.FloatingMenu.Group.prototype.addButton = function(buttonInfo) {
	this.buttons.push(buttonInfo);
};

/**
 * Get the EXT component representing the group (Ext.ButtonGroup)
 * @return the Ext.ButtonGroup
 * @hide
 */
GENTICS.Aloha.FloatingMenu.Group.prototype.getExtComponent = function () {
	var that = this;

	if (typeof this.extButtonGroup == 'undefined') {
		var items = new Array();
		var buttonCount = 0;

		// add all buttons
		jQuery.each(this.buttons, function(index, button) {
			// let each button generate its ext component and add them to the group
			items.push(button.button.getExtConfigProperties());

			// count the number of buttons (large buttons count as 2)
			buttonCount += button.button.size == 'small' ? 1 : 2;
		});
		
		this.extButtonGroup = new Ext.ButtonGroup({
			'columns' : Math.ceil(buttonCount / 2),
			'items': items
		});

		// now find the Ext.Buttons and set to the GENTICS buttons
		jQuery.each(this.buttons, function(index, buttonInfo) {
			buttonInfo.button.extButton = that.extButtonGroup.findById(buttonInfo.button.id);
			// the following code is a work arround because ExtJS initializes later.
			// The ui wrapper store the information and here we use it... ugly.
			// if there are any listeners added before initializing the extButtons
			if ( buttonInfo.button.listenerQueue && buttonInfo.button.listenerQueue.length > 0 ) {
				while ( l = buttonInfo.button.listenerQueue.shift() ) {
					buttonInfo.button.extButton.addListener(l.eventName, l.handler, l.scope, l.options);
				}
			}
			if (buttonInfo.button.extButton.setObjectTypeFilter) {
				if (buttonInfo.button.objectTypeFilter) {
					buttonInfo.button.extButton.noQuery = false;
				}
				if ( buttonInfo.button.objectTypeFilter == 'all' ) {
					buttonInfo.button.objectTypeFilter = null;
				}
				buttonInfo.button.extButton.setObjectTypeFilter(buttonInfo.button.objectTypeFilter);
				if ( buttonInfo.button.displayField) {
					buttonInfo.button.extButton.displayField = buttonInfo.button.displayField;
				}
				if ( buttonInfo.button.tpl ) {
					buttonInfo.button.extButton.tpl = buttonInfo.button.tpl;
				}
			}
		});
	}

	return this.extButtonGroup;
};

/**
 * Recalculate the visibility of the buttons and the group
 * @hide
 */
GENTICS.Aloha.FloatingMenu.Group.prototype.doLayout = function () {
	var groupVisible = false;
	var that = this;

	jQuery.each(this.buttons, function(index, button) {
		var extButton = that.extButtonGroup.findById(button.button.id);
		var buttonVisible = button.button.isVisible() && button.scopeVisible;

		if (buttonVisible && extButton.hidden) {
			extButton.show();
		} else if (!buttonVisible && !extButton.hidden) {
			extButton.hide();
		}

		groupVisible |= buttonVisible;
	});

	if (groupVisible && this.extButtonGroup.hidden) {
		this.extButtonGroup.show();
	} else if (!groupVisible && !this.extButtonGroup.hidden) {
		this.extButtonGroup.hide();
	}

	return groupVisible;
};/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*
*
*   Only execute the following code if we are in IE (check for
*   document.attachEvent, this is a microsoft event and therefore only available
*   in IE).
*/
if(document.attachEvent && document.selection) {
/*!
*   DOM Ranges for Internet Explorer (m2)
*	  
*   Copyright (c) 2009 Tim Cameron Ryan
*   Released under the MIT/X License
*   available at http://code.google.com/p/ierange/
*/
	 
	/*
	  Range reference:
	    http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
	    http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsRange.cpp
	    https://developer.mozilla.org/En/DOM:Range
	  Selection reference:
	    http://trac.webkit.org/browser/trunk/WebCore/page/DOMSelection.cpp
	  TextRange reference:
	    http://msdn.microsoft.com/en-us/library/ms535872.aspx
	  Other links:
	    http://jorgenhorstink.nl/test/javascript/range/range.js
	    http://jorgenhorstink.nl/2006/07/05/dom-range-implementation-in-ecmascript-completed/
	    http://dylanschiemann.com/articles/dom2Range/dom2RangeExamples.html
	*/
	
	//[TODO] better exception support
	
	(function () {	// sandbox
	
	/*
	  DOM functions
	 */
	
	var DOMUtils = {
		findChildPosition: function (node) {
			for (var i = 0; node = node.previousSibling; i++)
				continue;
			return i;
		},
		isDataNode: function (node) {
			return node && node.nodeValue !== null && node.data !== null;
		},
		isAncestorOf: function (parent, node) {
			return !DOMUtils.isDataNode(parent) &&
			    (parent.contains(DOMUtils.isDataNode(node) ? node.parentNode : node) ||		    
			    node.parentNode == parent);
		},
		isAncestorOrSelf: function (root, node) {
			return DOMUtils.isAncestorOf(root, node) || root == node;
		},
		findClosestAncestor: function (root, node) {
			if (DOMUtils.isAncestorOf(root, node))
				while (node && node.parentNode != root)
					node = node.parentNode;
			return node;
		},
		getNodeLength: function (node) {
			return DOMUtils.isDataNode(node) ? node.length : node.childNodes.length;
		},
		splitDataNode: function (node, offset) {
			if (!DOMUtils.isDataNode(node))
				return false;
			var newNode = node.cloneNode(false);
			node.deleteData(offset, node.length);
			newNode.deleteData(0, offset);
			node.parentNode.insertBefore(newNode, node.nextSibling);
		}
	};
	
	/*
	  Text Range utilities
	  functions to simplify text range manipulation in ie
	 */
	
	var TextRangeUtils = {
		convertToDOMRange: function (textRange, document) {
			function adoptBoundary(domRange, textRange, bStart) {
				// iterate backwards through parent element to find anchor location
				var cursorNode = document.createElement('a'), cursor = textRange.duplicate();
				cursor.collapse(bStart);
				var parent = cursor.parentElement();
				do {
					parent.insertBefore(cursorNode, cursorNode.previousSibling);
					cursor.moveToElementText(cursorNode);
				} while (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRange) > 0 && cursorNode.previousSibling);
	
				// when we exceed or meet the cursor, we've found the node
				if (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRange) == -1 && cursorNode.nextSibling) {
					// data node
					cursor.setEndPoint(bStart ? 'EndToStart' : 'EndToEnd', textRange);
					domRange[bStart ? 'setStart' : 'setEnd'](cursorNode.nextSibling, cursor.text.length);
				} else {
					// element
					domRange[bStart ? 'setStartBefore' : 'setEndBefore'](cursorNode);
				}
				cursorNode.parentNode.removeChild(cursorNode);
			}
		
			// return a DOM range
			var domRange = new DOMRange(document);
			adoptBoundary(domRange, textRange, true);
			adoptBoundary(domRange, textRange, false);
			return domRange;
		},
	
		convertFromDOMRange: function (domRange) {
			function adoptEndPoint(textRange, domRange, bStart) {
				// find anchor node and offset
				var container = domRange[bStart ? 'startContainer' : 'endContainer'];
				var offset = domRange[bStart ? 'startOffset' : 'endOffset'], textOffset = 0;
				var anchorNode = DOMUtils.isDataNode(container) ? container : container.childNodes[offset];
				var anchorParent = DOMUtils.isDataNode(container) ? container.parentNode : container;
				// visible data nodes need a text offset
				if (container.nodeType == 3 || container.nodeType == 4)
					textOffset = offset;
	
				// create a cursor element node to position range (since we can't select text nodes)
				var cursorNode = domRange._document.createElement('a');
				anchorParent.insertBefore(cursorNode, anchorNode);
				var cursor = domRange._document.body.createTextRange();
				cursor.moveToElementText(cursorNode);
				cursorNode.parentNode.removeChild(cursorNode);
				// move range
				textRange.setEndPoint(bStart ? 'StartToStart' : 'EndToStart', cursor);
				textRange[bStart ? 'moveStart' : 'moveEnd']('character', textOffset);
			}
			
			// return an IE text range
			var textRange = domRange._document.body.createTextRange();
			adoptEndPoint(textRange, domRange, true);
			adoptEndPoint(textRange, domRange, false);
			return textRange;
		}
	};
	
	/*
	  DOM Range
	 */
	 
	function DOMRange(document) {
		// save document parameter
		this._document = document;
		
		// initialize range
	//[TODO] this should be located at document[0], document[0]
		this.startContainer = this.endContainer = document.body;
		this.endOffset = DOMUtils.getNodeLength(document.body);
	}
	DOMRange.START_TO_START = 0;
	DOMRange.START_TO_END = 1;
	DOMRange.END_TO_END = 2;
	DOMRange.END_TO_START = 3;
	
	DOMRange.prototype = {
		// public properties
		startContainer: null,
		startOffset: 0,
		endContainer: null,
		endOffset: 0,
		commonAncestorContainer: null,
		collapsed: false,
		// private properties
		_document: null,
		
		// private methods
		_refreshProperties: function () {
			// collapsed attribute
			this.collapsed = (this.startContainer == this.endContainer && this.startOffset == this.endOffset);
			// find common ancestor
			var node = this.startContainer;
			while (node && node != this.endContainer && !DOMUtils.isAncestorOf(node, this.endContainer))
				node = node.parentNode;
			this.commonAncestorContainer = node;
		},
		
		// range methods
	//[TODO] collapse if start is after end, end is before start
		setStart: function(container, offset) {
			this.startContainer = container;
			this.startOffset = offset;
			this._refreshProperties();
		},
		setEnd: function(container, offset) {
			this.endContainer = container;
			this.endOffset = offset;
			this._refreshProperties();
		},
		setStartBefore: function (refNode) {
			// set start to beore this node
			this.setStart(refNode.parentNode, DOMUtils.findChildPosition(refNode));
		},
		setStartAfter: function (refNode) {
			// select next sibling
			this.setStart(refNode.parentNode, DOMUtils.findChildPosition(refNode) + 1);
		},
		setEndBefore: function (refNode) {
			// set end to beore this node
			this.setEnd(refNode.parentNode, DOMUtils.findChildPosition(refNode));
		},
		setEndAfter: function (refNode) {
			// select next sibling
			this.setEnd(refNode.parentNode, DOMUtils.findChildPosition(refNode) + 1);
		},
		selectNode: function (refNode) {
			this.setStartBefore(refNode);
			this.setEndAfter(refNode);
		},
		selectNodeContents: function (refNode) {
			this.setStart(refNode, 0);
			this.setEnd(refNode, DOMUtils.getNodeLength(refNode));
		},
		collapse: function (toStart) {
			if (toStart)
				this.setEnd(this.startContainer, this.startOffset);
			else
				this.setStart(this.endContainer, this.endOffset);
		},
	
		// editing methods
		cloneContents: function () {
			// clone subtree
			return (function cloneSubtree(iterator) {
				for (var node, frag = document.createDocumentFragment(); node = iterator.next(); ) {
					node = node.cloneNode(!iterator.hasPartialSubtree());
					if (iterator.hasPartialSubtree())
						node.appendChild(cloneSubtree(iterator.getSubtreeIterator()));
					frag.appendChild(node);
				}
				return frag;
			})(new RangeIterator(this));
		},
		extractContents: function () {
			// cache range and move anchor points
			var range = this.cloneRange();
			if (this.startContainer != this.commonAncestorContainer)
				this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
			this.collapse(true);
			// extract range
			return (function extractSubtree(iterator) {
				for (var node, frag = document.createDocumentFragment(); node = iterator.next(); ) {
					iterator.hasPartialSubtree() ? node = node.cloneNode(false) : iterator.remove();
					if (iterator.hasPartialSubtree())
						node.appendChild(extractSubtree(iterator.getSubtreeIterator()));
					frag.appendChild(node);
				}
				return frag;
			})(new RangeIterator(range));
		},
		deleteContents: function () {
			// cache range and move anchor points
			var range = this.cloneRange();
			if (this.startContainer != this.commonAncestorContainer)
				this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
			this.collapse(true);
			// delete range
			(function deleteSubtree(iterator) {
				while (iterator.next())
					iterator.hasPartialSubtree() ? deleteSubtree(iterator.getSubtreeIterator()) : iterator.remove();
			})(new RangeIterator(range));
		},
		insertNode: function (newNode) {
			// set original anchor and insert node
			if (DOMUtils.isDataNode(this.startContainer)) {
				DOMUtils.splitDataNode(this.startContainer, this.startOffset);
				this.startContainer.parentNode.insertBefore(newNode, this.startContainer.nextSibling);
			} else {
				this.startContainer.insertBefore(newNode, this.startContainer.childNodes[this.startOffset]);
			}
			// resync start anchor
			this.setStart(this.startContainer, this.startOffset);
		},
		surroundContents: function (newNode) {
			// extract and surround contents
			var content = this.extractContents();
			this.insertNode(newNode);
			newNode.appendChild(content);
			this.selectNode(newNode);
		},
	
		// other methods
		compareBoundaryPoints: function (how, sourceRange) {
			// get anchors
			var containerA, offsetA, containerB, offsetB;
			switch (how) {
			    case DOMRange.START_TO_START:
			    case DOMRange.START_TO_END:
				containerA = this.startContainer;
				offsetA = this.startOffset;
				break;
			    case DOMRange.END_TO_END:
			    case DOMRange.END_TO_START:
				containerA = this.endContainer;
				offsetA = this.endOffset;
				break;
			}
			switch (how) {
			    case DOMRange.START_TO_START:
			    case DOMRange.END_TO_START:
				containerB = sourceRange.startContainer;
				offsetB = sourceRange.startOffset;
				break;
			    case DOMRange.START_TO_END:
			    case DOMRange.END_TO_END:
				containerB = sourceRange.endContainer;
				offsetB = sourceRange.endOffset;
				break;
			}
			
			// compare
			return containerA.sourceIndex < containerB.sourceIndex ? -1 :
			    containerA.sourceIndex == containerB.sourceIndex ?
			        offsetA < offsetB ? -1 : offsetA == offsetB ? 0 : 1
			        : 1;
		},
		cloneRange: function () {
			// return cloned range
			var range = new DOMRange(this._document);
			range.setStart(this.startContainer, this.startOffset);
			range.setEnd(this.endContainer, this.endOffset);
			return range;
		},
		detach: function () {
	//[TODO] Releases Range from use to improve performance. 
		},
		toString: function () {
			return TextRangeUtils.convertFromDOMRange(this).text;
		},
		createContextualFragment: function (tagString) {
			// parse the tag string in a context node
			var content = (DOMUtils.isDataNode(this.startContainer) ? this.startContainer.parentNode : this.startContainer).cloneNode(false);
			content.innerHTML = tagString;
			// return a document fragment from the created node
			for (var fragment = this._document.createDocumentFragment(); content.firstChild; )
				fragment.appendChild(content.firstChild);
			return fragment;
		}
	};
	
	/*
	  Range iterator
	 */
	
	function RangeIterator(range) {
		this.range = range;
		if (range.collapsed)
			return;
	
	//[TODO] ensure this works
		// get anchors
		var root = range.commonAncestorContainer;
		this._next = range.startContainer == root && !DOMUtils.isDataNode(range.startContainer) ?
		    range.startContainer.childNodes[range.startOffset] :
		    DOMUtils.findClosestAncestor(root, range.startContainer);
		this._end = range.endContainer == root && !DOMUtils.isDataNode(range.endContainer) ?
		    range.endContainer.childNodes[range.endOffset] :
		    DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling;
	}
	
	RangeIterator.prototype = {
		// public properties
		range: null,
		// private properties
		_current: null,
		_next: null,
		_end: null,
	
		// public methods
		hasNext: function () {
			return !!this._next;
		},
		next: function () {
			// move to next node
			var current = this._current = this._next;
			this._next = this._current && this._current.nextSibling != this._end ?
			    this._current.nextSibling : null;
	
			// check for partial text nodes
			if (DOMUtils.isDataNode(this._current)) {
				if (this.range.endContainer == this._current)
					(current = current.cloneNode(true)).deleteData(this.range.endOffset, current.length - this.range.endOffset);
				if (this.range.startContainer == this._current)
					(current = current.cloneNode(true)).deleteData(0, this.range.startOffset);
			}
			return current;
		},
		remove: function () {
			// check for partial text nodes
			if (DOMUtils.isDataNode(this._current) &&
			    (this.range.startContainer == this._current || this.range.endContainer == this._current)) {
				var start = this.range.startContainer == this._current ? this.range.startOffset : 0;
				var end = this.range.endContainer == this._current ? this.range.endOffset : this._current.length;
				this._current.deleteData(start, end - start);
			} else
				this._current.parentNode.removeChild(this._current);
		},
		hasPartialSubtree: function () {
			// check if this node be partially selected
			return !DOMUtils.isDataNode(this._current) &&
			    (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer) ||
			        DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer));
		},
		getSubtreeIterator: function () {
			// create a new range
			var subRange = new DOMRange(this.range._document);
			subRange.selectNodeContents(this._current);
			// handle anchor points
			if (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer))
				subRange.setStart(this.range.startContainer, this.range.startOffset);
			if (DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer))
				subRange.setEnd(this.range.endContainer, this.range.endOffset);
			// return iterator
			return new RangeIterator(subRange);
		}
	};
	
	/*
	  DOM Selection
	 */
	 
	//[NOTE] This is a very shallow implementation of the Selection object, based on Webkit's
	// implementation and without redundant features. Complete selection manipulation is still
	// possible with just removeAllRanges/addRange/getRangeAt.
	
	function DOMSelection(document) {
		// save document parameter
		this._document = document;
		
		// add DOM selection handler
		var selection = this;
		document.attachEvent('onselectionchange', function () { selection._selectionChangeHandler(); });
	}
	
	DOMSelection.prototype = {
		// public properties
		rangeCount: 0,
		// private properties
		_document: null,
		
		// private methods
		_selectionChangeHandler: function () {
			// check if there exists a range
			this.rangeCount = this._selectionExists(this._document.selection.createRange()) ? 1 : 0;
		},
		_selectionExists: function (textRange) {
			// checks if a created text range exists or is an editable cursor
			return textRange.compareEndPoints('StartToEnd', textRange) != 0 ||
			    textRange.parentElement().isContentEditable;
		},
		
		// public methods
		addRange: function (range) {
			// add range or combine with existing range
			var selection = this._document.selection.createRange(), textRange = TextRangeUtils.convertFromDOMRange(range);
			if (!this._selectionExists(selection))
			{
				// select range
				textRange.select();
			}
			else
			{
				// only modify range if it intersects with current range
				if (textRange.compareEndPoints('StartToStart', selection) == -1)
					if (textRange.compareEndPoints('StartToEnd', selection) > -1 &&
					    textRange.compareEndPoints('EndToEnd', selection) == -1)
						selection.setEndPoint('StartToStart', textRange);
				else
					if (textRange.compareEndPoints('EndToStart', selection) < 1 &&
					    textRange.compareEndPoints('EndToEnd', selection) > -1)
						selection.setEndPoint('EndToEnd', textRange);
				selection.select();
			}
		},
		removeAllRanges: function () {
			// remove all ranges
			this._document.selection.empty();
		},
		getRangeAt: function (index) {
			// return any existing selection, or a cursor position in content editable mode
			var textRange = this._document.selection.createRange();
			if (this._selectionExists(textRange))
				return TextRangeUtils.convertToDOMRange(textRange, this._document);
			return null;
		},
		toString: function () {
			// get selection text
			return this._document.selection.createRange().text;
		}
	};
	
	/*
	  scripting hooks
	 */
	
	document.createRange = function () {
		return new DOMRange(document);
	};
	
	var selection = new DOMSelection(document);
	window.getSelection = function () {
		return selection;
	};
	
	//[TODO] expose DOMRange/DOMSelection to window.?
	
	})();
}/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * jQuery Aloha Plugin
 * 
 * turn all dom elements to continous text
 * @return	jQuery object for the matched elements
 * @api
 */
jQuery.fn.aloha = function() {
	return this.each(function() {
		// create a new aloha editable object for each queried object
		new GENTICS.Aloha.Editable(jQuery(this));
	});
};

/**
 * namespaced fallback for aloha jQuery plugin
 * 
 * turn all dom elements to continous text
 * @return	jQuery object for the matched elements
 * @api
 */
jQuery.fn.GENTICS_aloha = function() {
	return this.each(function() {
		// create a new aloha editable object for each queried object
		new GENTICS.Aloha.Editable(jQuery(this));
	});
}; 

/**
 * jQuery destroy elements as editable
 * 
 * destroy all mached elements editable capabilities
 * @return	jQuery object for the matched elements
 * @api
 */
jQuery.fn.mahalo = function() {
	return this.each(function() {
		if ( jQuery(this).hasClass('GENTICS_editable') ) {
			for (var i=0; i<GENTICS.Aloha.editables.length; i++) {
				if ( GENTICS.Aloha.editables[i].obj.get(0) === this ) {
					GENTICS.Aloha.editables[i].destroy();
				}
			}
		}
	});
};

/**
 * namespaced fallback for jQuery destroy elements as editable
 * 
 * destroy all mached elements editable capabilities
 * @return	jQuery object for the matched elements
 * @api
 */
jQuery.fn.GENTICS_mahalo = function() {
	return this.each(function() {
		var that = this;
	});
}; 

/**
 * jQuery Extension
 * new Event which is triggered whenever a selection (length >= 0) is made in 
 * an Aloha Editable element
 */
jQuery.fn.GENTICS_contentEditableSelectionChange = function(callback) {
	var that = this;

	// update selection when keys are pressed
	this.keyup(function(event){
		var rangeObject = GENTICS.Aloha.Selection.getRangeObject();
		callback(event);
	});
	
	// update selection on doubleclick (especially important for the first automatic selection, when the Editable is not active yet, but is at the same time activated as the selection occurs
	this.dblclick(function(event) {
		callback(event);
	});
	
	// update selection when text is selected
	this.mousedown(function(event){
		// remember that a selection was started
		that.selectionStarted = true;
	});
	jQuery(document).mouseup(function(event) {
		GENTICS.Aloha.Selection.eventOriginalTarget = that;
		if (that.selectionStarted) {
			callback(event);
		}
		GENTICS.Aloha.Selection.eventOriginalTarget = false;
		that.selectionStarted = false;
	});
	
	return this;
};

jQuery.fn.outerHTML = function(s) {
	if (s) {
		return this.before(s).remove();
	} else {
		return jQuery("<p>").append(this.eq(0).clone()).html();
	}
};	/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * This is the aloha Log
 * @namespace GENTICS.Aloha
 * @class Log
 * @singleton
 */
GENTICS.Aloha.Log = function () {};

/**
 * Log History as array of Message Objects. Every object has the properties
 * 'level', 'component' and 'message'
 * @property
 * @type Array
 * @hide
 */
GENTICS.Aloha.Log.prototype.logHistory = null;

/**
 * Flag, which is set as soon as the highWaterMark for the log history is reached.
 * This flag is reset on every call of flushLogHistory()
 * @hide
 */
GENTICS.Aloha.Log.prototype.highWaterMarkReached = false;

/**
 * Initialize the logging
 * @hide
 */
GENTICS.Aloha.Log.prototype.init = function() {
	// initialize the logging settings (if not present)
	if (typeof GENTICS.Aloha.settings.logLevels == 'undefined' || !GENTICS.Aloha.settings.logLevels) {
		GENTICS.Aloha.settings.logLevels = {'error' : true, 'warn' : true};
	}

	// initialize the logHistory settings (if not present)
	if (typeof GENTICS.Aloha.settings.logHistory == 'undefined' || !GENTICS.Aloha.settings.logHistory) {
		GENTICS.Aloha.settings.logHistory = {};
	}
	// set the default values for the loghistory
	if (!GENTICS.Aloha.settings.logHistory.maxEntries) {
		GENTICS.Aloha.settings.logHistory.maxEntries = 100;
	}
	if (!GENTICS.Aloha.settings.logHistory.highWaterMark) {
		GENTICS.Aloha.settings.logHistory.highWaterMark = 90;
	}
	if (!GENTICS.Aloha.settings.logHistory.levels) {
		GENTICS.Aloha.settings.logHistory.levels = {'error' : true, 'warn' : true};
	}
	this.flushLogHistory();
};

/**
 * Logs a message to the console
 * @method
 * @param {String} level Level of the log ('error', 'warn' or 'info', 'debug')
 * @param {String} component Component that calls the log
 * @param {String} message log message
 */
GENTICS.Aloha.Log.prototype.log = function(level, component, message) {
	if (typeof level == 'undefined' || !level) {
		level = 'error';
	}
	level = level.toLowerCase();

	// now check whether the log level is activated
	if (!GENTICS.Aloha.settings.logLevels[level]) {
		return;
	}

	this.addToLogHistory({'level' : level, 'component' : component.toString(), 'message' : message, 'date' : new Date()});
	switch (level) {
	case 'error':
		if (window.console && console.error) {
			console.error(component.toString() + ': ' + message);
		}
		break;
	case 'warn':
		if (window.console && console.warn) {
			console.warn(component.toString() + ': ' + message);
		}
		break;
	case 'info':
		if (window.console && console.info) {
			console.info(component.toString() + ': ' + message);
		}
		break;
	case 'debug':
		if (window.console && console.log) {
			console.log(component.toString() + ' [' + level + ']: ' + message);
		}
		break;
	default:
		if (window.console && console.log) {
			console.log(component.toString() + ' [' + level + ']: ' + message);
		}
		break;
	}
};

/**
 * Log a message of log level 'error'
 * @method
 * @param {String} component Component that calls the log
 * @param {String} message log message
 */
GENTICS.Aloha.Log.prototype.error = function(component, message) {
	this.log('error', component, message);
};

/**
 * Log a message of log level 'warn'
 * @method
 * @param {String} component Component that calls the log
 * @param {String} message log message
 */
GENTICS.Aloha.Log.prototype.warn = function(component, message) {
	this.log('warn', component, message);
};

/**
 * Log a message of log level 'info'
 * @method
 * @param {String} component Component that calls the log
 * @param {String} message log message
 */
GENTICS.Aloha.Log.prototype.info = function(component, message) {
	this.log('info', component, message);
};

/**
 * Log a message of log level 'debug'
 * @param {String} component Component that calls the log
 * @param {String} message log message
 */
GENTICS.Aloha.Log.prototype.debug = function(component, message) {
	this.log('debug', component, message);
};

/**
 * Check whether the given log level is currently enabled
 * @param {String} level
 * @return true when log level is enabled, false if not
 */
GENTICS.Aloha.Log.prototype.isLogLevelEnabled = function(level) {
	return GENTICS.Aloha.settings && GENTICS.Aloha.settings.logLevels && (GENTICS.Aloha.settings.logLevels[level] == true);
};

/**
 * Check whether error logging is enabled
 * @return true if error logging is enabled, false if not
 */
GENTICS.Aloha.Log.prototype.isErrorEnabled = function() {
	return this.isLogLevelEnabled('error');
};

/**
 * Check whether warn logging is enabled
 * @return true if warn logging is enabled, false if not
 */
GENTICS.Aloha.Log.prototype.isWarnEnabled = function() {
	return this.isLogLevelEnabled('warn');
};

/**
 * Check whether info logging is enabled
 * @return true if info logging is enabled, false if not
 */
GENTICS.Aloha.Log.prototype.isInfoEnabled = function() {
	return this.isLogLevelEnabled('info');
};

/**
 * Check whether debug logging is enabled
 * @return true if debug logging is enabled, false if not
 */
GENTICS.Aloha.Log.prototype.isDebugEnabled = function() {
	return this.isLogLevelEnabled('debug');
};

/**
 * Add the given entry to the log history. Check whether the highWaterMark has been reached, and fire an event if yes.
 * @param {Object} entry entry to be added to the log history
 * @hide
 */
GENTICS.Aloha.Log.prototype.addToLogHistory = function(entry) {
	// when maxEntries is set to something illegal, we do nothing (log history is disabled)
	if (GENTICS.Aloha.settings.logHistory.maxEntries <= 0) {
		return;
	}

	// check whether the level is one we like to have logged
	if (!GENTICS.Aloha.settings.logHistory.levels[entry.level]) {
		return;
	}

	// first add the entry as last element to the history array
	this.logHistory.push(entry);

	// check whether the highWaterMark was reached, if so, fire an event
	if (this.highWaterMarkReached == false) {
		if (this.logHistory.length >= GENTICS.Aloha.settings.logHistory.maxEntries * GENTICS.Aloha.settings.logHistory.highWaterMark / 100) {
			// fire the event
			GENTICS.Aloha.EventRegistry.trigger(
				new GENTICS.Aloha.Event(
					'logFull',
					GENTICS.Aloha.Log
				)
			);
			// set the flag (so we will not fire the event again until the logHistory is flushed)
			this.highWaterMarkReached = true;
		}
	}

	// check whether the log is full and eventually remove the oldest entries
	while (this.logHistory.length > GENTICS.Aloha.settings.logHistory.maxEntries) {
		this.logHistory.shift();
	}
};

/**
 * Get the log history
 * @return log history as array of objects
 * @hide
 */
GENTICS.Aloha.Log.prototype.getLogHistory = function() {
	return this.logHistory;
};

/**
 * Flush the log history. Remove all log entries and reset the flag for the highWaterMark
 * @return void
 * @hide
 */
GENTICS.Aloha.Log.prototype.flushLogHistory = function() {
	this.logHistory = new Array();
	this.highWaterMarkReached = false;
};

/**
 * Create the Log object
 * @hide
 */
GENTICS.Aloha.Log = new GENTICS.Aloha.Log();
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Markup object
 */
GENTICS.Aloha.Markup = function() {};

/**
 * Key handlers for special key codes
 */
GENTICS.Aloha.Markup.prototype.keyHandlers = {};

/**
 * Add a key handler for the given key code
 * @param keyCode key code
 * @param handler handler function
 */
GENTICS.Aloha.Markup.prototype.addKeyHandler = function (keyCode, handler) {
	if (!this.keyHandlers[keyCode]) {
		this.keyHandlers[keyCode] = [];
	}

	this.keyHandlers[keyCode].push(handler);
};

GENTICS.Aloha.Markup.prototype.insertBreak = function () {
	var range = GENTICS.Aloha.Selection.rangeObject;
	if (!range.isCollapsed()) {
		this.removeSelectedMarkup();
	}

	var newBreak = jQuery('<br/>');
	GENTICS.Utils.Dom.insertIntoDOM(newBreak, range, GENTICS.Aloha.activeEditable.obj);

	var nextTextNode = GENTICS.Utils.Dom.searchAdjacentTextNode(newBreak.parent().get(0), GENTICS.Utils.Dom.getIndexInParent(newBreak.get(0)) + 1, false);
	if (nextTextNode) {
		// trim leading whitespace
		var nonWSIndex = nextTextNode.data.search(/\S/);
		if (nonWSIndex > 0) {
			nextTextNode.data = nextTextNode.data.substring(nonWSIndex);
		}
	}

	range.startContainer = range.endContainer = newBreak.get(0).parentNode;
	range.startOffset = range.endOffset = GENTICS.Utils.Dom.getIndexInParent(newBreak.get(0)) + 1;
	range.correctRange();
	range.clearCaches();
	range.select();
};

/** 
 * first method to handle key strokes
 * @param event DOM event
 * @param rangeObject as provided by GENTICS.Aloha.Selection.getRangeObject();
 * @return "GENTICS.Aloha.Selection"
 */
GENTICS.Aloha.Markup.prototype.preProcessKeyStrokes = function(event) {
	if (event.type != 'keydown') {
		return false;
	}
	
	var rangeObject = GENTICS.Aloha.Selection.rangeObject;

	if (this.keyHandlers[event['keyCode']]) {
		var handlers = this.keyHandlers[event['keyCode']];
		for (var i = 0; i < handlers.length; ++i) {
			if (!handlers[i](event)) {
				return false;
			}
		}
	}

	switch(event['keyCode']) {
		case 13: // ENTER
			if (event.shiftKey) {
				GENTICS.Aloha.Log.debug(this, '... got a smoking Shift+Enter, Cowboy');
				// when the range is expanded, we remove the selected text
				if (!rangeObject.isCollapsed()) {
					this.removeSelectedMarkup();
				}

				GENTICS.Aloha.Selection.updateSelection(false, true);
				this.processShiftEnter(rangeObject);

//				this.insertBreak();

				return false;
			} else {
				GENTICS.Aloha.Log.debug(this, '... got a lonely Enter, Mum');
				if (!rangeObject.isCollapsed()) {
					this.removeSelectedMarkup();
				}
				GENTICS.Aloha.Selection.updateSelection(false, true);
				this.processEnter(rangeObject);

/*
				// next find the nearest enclosing split object
				var splitObject = rangeObject.findMarkup(function() {
					return GENTICS.Utils.Dom.isSplitObject(this);
				}, GENTICS.Aloha.activeEditable.obj);

				// if one found, split it, otherwise insert a break
				if (splitObject) {
					var splitResult = GENTICS.Utils.Dom.split(rangeObject, jQuery([splitObject.parentNode, GENTICS.Aloha.activeEditable.obj.get(0)]));
					if (splitResult) {
						// cleanup in the second part
						GENTICS.Utils.Dom.doCleanup({'merge' : true, 'removeempty' : true}, rangeObject, splitResult.get(1));

						// get the first text node in the second part of the split
						var nextTextNode = GENTICS.Utils.Dom.searchAdjacentTextNode(splitResult.get(1), 0, false);
						if (nextTextNode) {
							// trim leading whitespace
							var nonWSIndex = nextTextNode.data.search(/\S/);
							if (nonWSIndex > 0) {
								nextTextNode.data = nextTextNode.data.substring(nonWSIndex);
							}
						}

						// check whether the split created an element which is empty and needs to have an element to be visible
						if (GENTICS.Utils.Dom.isEmpty(splitResult.get(0))) {
							splitResult.eq(0).append(this.getFillUpElement(splitResult.get(0)));
						}
						if (GENTICS.Utils.Dom.isEmpty(splitResult.get(1))) {
							splitResult.eq(1).append(this.getFillUpElement(splitResult.get(1)));
						}

						rangeObject.startContainer = rangeObject.endContainer = splitResult.get(1);
						rangeObject.startOffset = rangeObject.endOffset = 0;
						rangeObject.correctRange();
						rangeObject.clearCaches();
						rangeObject.select();
					} else {
						this.insertBreak();
					}
				} else {
					this.insertBreak();
				}
*/

				return false;
			}
			break;
	}
	return true;
};

/** 
 * method handling shiftEnter
 * @param GENTICS.Aloha.Selection.SelectionRange of the current selection
 * @return void
 */
GENTICS.Aloha.Markup.prototype.processShiftEnter = function(rangeObject) {  
	this.insertHTMLBreak(rangeObject.getSelectionTree(), rangeObject);
};

/** 
 * method handling Enter
 * @param GENTICS.Aloha.Selection.SelectionRange of the current selection
 * @return void
 */
GENTICS.Aloha.Markup.prototype.processEnter = function(rangeObject) { 
	if (rangeObject.splitObject) {
		// now comes a very evil hack for ie, when the enter is pressed in a text node in an li element, we just append an empty text node
		if (jQuery.browser.msie
				&& GENTICS.Utils.Dom
						.isListElement(rangeObject.splitObject)) {
			jQuery(rangeObject.splitObject).append(
					jQuery(document.createTextNode('')));
		}

		this.splitRangeObject(rangeObject);
	} else { // if there is no split object, the Editable is the paragraph type itself (e.g. a p or h2)
		this.insertHTMLBreak(rangeObject.getSelectionTree(), rangeObject);
	}
};

/**
 * Insert the given html markup at the current selection
 * @param html html markup to be inserted
 */
GENTICS.Aloha.Markup.prototype.insertHTMLCode = function (html) {
	var rangeObject = GENTICS.Aloha.Selection.rangeObject;

	this.insertHTMLBreak(rangeObject.getSelectionTree(), rangeObject, jQuery(html));
};

/** 
 * insert an HTML Break <br /> into current selection
 * @param GENTICS.Aloha.Selection.SelectionRange of the current selection
 * @return void
 */
GENTICS.Aloha.Markup.prototype.insertHTMLBreak = function(selectionTree, rangeObject, inBetweenMarkup) {
	inBetweenMarkup = inBetweenMarkup ? inBetweenMarkup: jQuery('<br />');
	for (var i = 0; i < selectionTree.length; i++) {
		var el = selectionTree[i];
		var jqEl = el.domobj ? jQuery(el.domobj) : undefined;
		if (el.selection !== 'none') { // before cursor, leave this part inside the splitObject
			if (el.selection == 'collapsed') {
				// collapsed selection found (between nodes)
				if (i > 0) {
					// not at the start, so get the element to the left
					var jqElBefore = jQuery(selectionTree[i-1].domobj);
					// and insert the break after it
					jqElBefore.after(inBetweenMarkup);
				} else {
					// at the start, so get the element to the right
					var jqElAfter = jQuery(selectionTree[1].domobj);
					// and insert the break before it
					jqElAfter.before(inBetweenMarkup);
				}

				// now set the range
				rangeObject.startContainer = rangeObject.endContainer = inBetweenMarkup[0].parentNode;
				rangeObject.startOffset = rangeObject.endOffset = GENTICS.Utils.Dom.getIndexInParent(inBetweenMarkup[0]) + 1;
				rangeObject.correctRange();
			} else if (el.domobj && el.domobj.nodeType === 3) { // textNode
				// when the textnode is immediately followed by a blocklevel element (like p, h1, ...) we need to add an additional br in between
				if (el.domobj.nextSibling
						&& el.domobj.nextSibling.nodeType == 1
						&& GENTICS.Aloha.Selection.replacingElements[el.domobj.nextSibling.nodeName
								.toLowerCase()]) {
					jqEl.after('<br/>');
				}
				// when the textnode is the last inside a blocklevel element
				// (like p, h1, ...) we need to add an additional br as very
				// last object in the blocklevel element
				var checkObj = el.domobj;
				while (checkObj) {
					if (checkObj.nextSibling) {
						checkObj = false;
					} else {
						// go to the parent
						checkObj = checkObj.parentNode;
						// reached the limit object, we are done
						if (checkObj === rangeObject.limitObject) {
							checkObj = false;
						}
						// found a blocklevel element, we are done
						if (GENTICS.Utils.Dom.isBlockLevelElement(checkObj)) {
							break;
						}
					}
				}
				// when we found a blocklevel element, insert a break at the end
				if (checkObj) {
					jQuery(checkObj).append('<br/>');
				}

				// insert the break
				jqEl.between(inBetweenMarkup, el.startOffset);

				// correct the range
				// count the number of previous siblings
				var offset = 0;
				var tmpObject = inBetweenMarkup[0];
				while (tmpObject) {
					tmpObject = tmpObject.previousSibling;
					offset++;
				}

				rangeObject.startContainer = inBetweenMarkup[0].parentNode;
				rangeObject.endContainer = inBetweenMarkup[0].parentNode;
				rangeObject.startOffset = offset;
				rangeObject.endOffset = offset;
				rangeObject.correctRange();
			} else if (el.domobj && el.domobj.nodeType === 1) { // other node, normally a break
				if (jqEl.parent().find('br.GENTICS_ephemera').length === 0) {
					// but before putting it, remove all:
					jQuery(rangeObject.limitObject).find('br.GENTICS_ephemera').remove();
					//  now put it:
					jQuery(rangeObject.commonAncestorContainer).append(this.getFillUpElement(rangeObject.splitObject));
				}
				jqEl.after(inBetweenMarkup);
				
				// now set the selection. Since we just added one break do the currect el
				// the new position must be el's position + 1. el's position is the index 
				// of the el in the selection tree, which is i. then we must add
				// another +1 because we want to be AFTER the object, not before. therefor +2
				rangeObject.startContainer = rangeObject.commonAncestorContainer;
				rangeObject.endContainer = rangeObject.startContainer;
				rangeObject.startOffset = i+2;
				rangeObject.endOffset = i+2;			
				rangeObject.update();
			}
		}
	}
	rangeObject.select();
};

/**
 * Get the currently selected text or false if nothing is selected (or the selection is collapsed)
 * @return selected text
 */
GENTICS.Aloha.Markup.prototype.getSelectedText = function () {
	var rangeObject = GENTICS.Aloha.Selection.rangeObject;

	if (rangeObject.isCollapsed()) {
		return false;
	}

	return this.getFromSelectionTree(rangeObject.getSelectionTree(), true);
};

/**
 * Recursive function to get the selected text from the selection tree starting at the given level
 * @param selectionTree array of selectiontree elements
 * @param astext true when the contents shall be fetched as text, false for getting as html markup
 * @return selected text from that level (incluiding all sublevels)
 */
GENTICS.Aloha.Markup.prototype.getFromSelectionTree = function (selectionTree, astext) {
	var text = '';
	for (var i = 0; i < selectionTree.length; i++) {
		var el = selectionTree[i];
		if (el.selection == 'partial') {
			if (el.domobj.nodeType == 3) {
				// partial text node selected, get the selected part
				text += el.domobj.data.substring(el.startOffset, el.endOffset);
			} else if (el.domobj.nodeType == 1 && el.children) {
				// partial element node selected, do the recursion into the children
				if (astext) {
					text += this.getFromSelectionTree(el.children, astext);
				} else {
					// when the html shall be fetched, we create a clone of the element and remove all the children
					var clone = jQuery(el.domobj).clone(false).empty();
					// then we do the recursion and add the selection into the clone
					clone.html(this.getFromSelectionTree(el.children, astext));
					// finally we get the html of the clone
					text += clone.outerHTML();
				}
			}
		} else if (el.selection == 'full') {
			if (el.domobj.nodeType == 3) {
				// full text node selected, get the text
				text += jQuery(el.domobj).text();
			} else if (el.domobj.nodeType == 1 && el.children) {
				// full element node selected, get the html of the node and all children
				text += astext ? jQuery(el.domobj).text() : jQuery(el.domobj).outerHTML();
			}
		}
	}

	return text;
};

/**
 * Get the currently selected markup or false if nothing is selected (or the selection is collapsed)
 * @return selected markup
 */
GENTICS.Aloha.Markup.prototype.getSelectedMarkup = function () {
	var rangeObject = GENTICS.Aloha.Selection.rangeObject;

	if (rangeObject.isCollapsed()) {
		return false;
	}

	return this.getFromSelectionTree(rangeObject.getSelectionTree(), false);
};

/**
 * Remove the currently selected markup
 */
GENTICS.Aloha.Markup.prototype.removeSelectedMarkup = function () {
	var rangeObject = GENTICS.Aloha.Selection.rangeObject;

	if (rangeObject.isCollapsed()) {
		return;
	}

	var newRange = new GENTICS.Aloha.Selection.SelectionRange();
	// remove the selection
	this.removeFromSelectionTree(rangeObject.getSelectionTree(), newRange);

	// do a cleanup now (starting with the commonancestorcontainer)
	newRange.update();
	GENTICS.Utils.Dom.doCleanup({'merge' : true, 'removeempty' : true}, GENTICS.Aloha.Selection.rangeObject);
	GENTICS.Aloha.Selection.rangeObject = newRange;

	// need to set the collapsed selection now
	newRange.correctRange();
	newRange.update();
	newRange.select();
	GENTICS.Aloha.Selection.updateSelection();
};

/**
 * Recursively remove the selected items, starting with the given level in the selectiontree
 * @param selectionTree current level of the selectiontree
 * @param newRange new collapsed range to be set after the removal
 */
GENTICS.Aloha.Markup.prototype.removeFromSelectionTree = function (selectionTree, newRange) {
	// remember the first found partially selected element node (in case we need
	// to merge it with the last found partially selected element node)
	var firstPartialElement = undefined;

	// iterate through the selection tree
	for (var i = 0; i < selectionTree.length; i++) {
		var el = selectionTree[i];
		// check the type of selection
		if (el.selection == 'partial') {
			if (el.domobj.nodeType == 3) {
				// partial text node selected, so remove the selected portion
				var newdata = '';
				if (el.startOffset > 0) {
					newdata += el.domobj.data.substring(0, el.startOffset);
				}
				if (el.endOffset < el.domobj.data.length) {
					newdata += el.domobj.data.substring(el.endOffset, el.domobj.data.length);
				}
				el.domobj.data = newdata;

				// eventually set the new range (if not done before)
				if (!newRange.startContainer) {
					newRange.startContainer = newRange.endContainer = el.domobj;
					newRange.startOffset = newRange.endOffset = el.startOffset;
				}
			} else if (el.domobj.nodeType == 1 && el.children) {
				// partial element node selected, so do the recursion into the children
				this.removeFromSelectionTree(el.children, newRange);
				if (firstPartialElement) {
					// when the first parially selected element is the same type
					// of element, we need to merge them
					if (firstPartialElement.nodeName == el.domobj.nodeName) {
						// merge the nodes
						jQuery(firstPartialElement).append(jQuery(el.domobj).contents());
						// and remove the latter one
						jQuery(el.domobj).remove();
					}
				} else {
					// remember this element as first partially selected element
					firstPartialElement = el.domobj;
				}
			}
		} else if (el.selection == 'full') {
			// eventually set the new range (if not done before)
			if (!newRange.startContainer) {
				var adjacentTextNode = GENTICS.Utils.Dom.searchAdjacentTextNode(el.domobj.parentNode, GENTICS.Utils.Dom.getIndexInParent(el.domobj) + 1, false, {'blocklevel' : false});
				if (adjacentTextNode) {
					newRange.startContainer = newRange.endContainer = adjacentTextNode;
					newRange.startOffset = newRange.endOffset = 0;
				} else {
					newRange.startContainer = newRange.endContainer = el.domobj.parentNode;
					newRange.startOffset = newRange.endOffset = GENTICS.Utils.Dom.getIndexInParent(el.domobj) + 1;
				}
			}

			// full node selected, so just remove it (will also remove all children)
			jQuery(el.domobj).remove();
		}
	}
};

/** 
 * split passed rangeObject without or with optional markup
 * @param GENTICS.Aloha.Selection.SelectionRange of the current selection
 * @param markup object (jQuery) to insert in between the split elements
 * @return void
 */
GENTICS.Aloha.Markup.prototype.splitRangeObject = function(rangeObject, markup) {
	// UAAAA: first check where the markup can be inserted... *grrrrr*, then decide where to split
	// object which is split up
	var splitObject = jQuery(rangeObject.splitObject);

	// update the commonAncestor with the splitObject (so that the selectionTree is correct)
	rangeObject.update(rangeObject.splitObject); // set the splitObject as new commonAncestorContainer and update the selectionTree

	// calculate the selection tree. NOTE: it is necessary to do this before
	// getting the followupcontainer, since getting the selection tree might
	// possibly merge text nodes, which would lead to differences in the followupcontainer
	var selectionTree = rangeObject.getSelectionTree();

	// object to be inserted after the splitObject
	var followUpContainer = this.getSplitFollowUpContainer(rangeObject);

	// now split up the splitObject into itself AND the followUpContainer
	this.splitRangeObjectHelper(selectionTree, rangeObject, followUpContainer); // split the current object into itself and the followUpContainer

	// check whether the followupcontainer is still marked for removal
	if (followUpContainer.hasClass('preparedForRemoval')) {
		// TODO shall we just remove the class or shall we not use the followupcontainer?
		followUpContainer.removeClass('preparedForRemoval');
	}

	// now let's find the place, where the followUp is inserted afterwards. normally that's the splitObject itself, but in
	// some cases it might be their parent (e.g. inside a list, a <p> followUp must be inserted outside the list)
	var insertAfterObject = this.getInsertAfterObject(rangeObject, followUpContainer);
	
	// now insert the followUpContainer
	jQuery(followUpContainer).insertAfter(insertAfterObject); // attach the followUpContainer right after the insertAfterObject
	
	// in some cases, we want to remove the "empty" splitObject (e.g. LIs, if enter was hit twice)
	if (rangeObject.splitObject.nodeName.toLowerCase() === 'li' && !GENTICS.Aloha.Selection.standardTextLevelSemanticsComparator(rangeObject.splitObject, followUpContainer)) {
		jQuery(rangeObject.splitObject).remove();
	}
	
	// find a possible text node in the followUpContainer and set the selection to it
	// if no textnode is available, set the selection to the followup container itself
	rangeObject.startContainer = followUpContainer.textNodes(true, true).first().get(0);
	if (!rangeObject.startContainer) { // if no text node was found, select the parent object of <br class="GENTICS_ephemera" />
		rangeObject.startContainer = followUpContainer.textNodes(false).first().parent().get(0);
	}
	if (rangeObject.startContainer) {
		// the cursor is always at the beginning of the followUp
		rangeObject.endContainer = rangeObject.startContainer;
		rangeObject.startOffset = 0;
		rangeObject.endOffset = 0;
	} else {
		rangeObject.startContainer = rangeObject.endContainer = followUpContainer.parent().get(0);
		rangeObject.startOffset = rangeObject.endOffset = GENTICS.Utils.Dom.getIndexInParent(followUpContainer.get(0));
	}
	
	// finally update the range object again
	rangeObject.update();
	
	// now set the selection
	rangeObject.select();
};

/** 
 * method to get the object after which the followUpContainer can be inserted during splitup
 * this is a helper method, not needed anywhere else
 * @param rangeObject GENTICS.Aloha.Selection.SelectionRange of the current selection
 * @param followUpContainer optional jQuery object; if provided the rangeObject will be split and the second part will be insert inside of this object
 * @return object after which the followUpContainer can be inserted
 */
GENTICS.Aloha.Markup.prototype.getInsertAfterObject = function(rangeObject, followUpContainer) {
	for (var i = 0; i < rangeObject.markupEffectiveAtStart.length; i++) {
		el = rangeObject.markupEffectiveAtStart[ i ];
		// check if we have already passed the splitObject (some other markup might come before)
		if (el === rangeObject.splitObject){
			var passedSplitObject = true;
		}
		// if not passed splitObject, skip this markup
		if (!passedSplitObject) {
			continue;
		}
		// once we are passed, check if the followUpContainer is allowed to be inserted into the currents el's parent
		if (GENTICS.Aloha.Selection.canTag1WrapTag2(jQuery(el).parent()[0].nodeName, followUpContainer[0].nodeName)) {
			return el;
		}
	}
	return false;
};

/** 
 * method to get the html code for a fillUpElement. this is needed for empty paragraphs etc., so that they take up their expected height
 * @param splitObject split object (dom object)
 * @return fillUpElement HTML Code
 */
GENTICS.Aloha.Markup.prototype.getFillUpElement = function(splitObject) {
	if (jQuery.browser.msie) {
		return false;
	} else {
		return jQuery('<br class="GENTICS_ephemera" />');
	}
};

/** 
 * removes textNodes from passed array, which only contain contentWhiteSpace (e.g. a \n between two tags)
 * @param domArray array of domObjects
 * @return void
 */
GENTICS.Aloha.Markup.prototype.removeElementContentWhitespaceObj = function(domArray) {
	var correction = 0;
	var removeLater = [];
	for (var i = 0; i < domArray.length; i++) {
		var el = domArray[i];
		if (el.isElementContentWhitespace) {
			removeLater[removeLater.length] = i;
		}
	}
	for (var i = 0; i < removeLater.length; i++) {
		var removeIndex = removeLater[i];
		domArray.splice(removeIndex - correction, 1);
		correction++;
	}
};

/** 
 * recursive method to parallelly walk through two dom subtrees, leave elements before startContainer in first subtree and move rest to other
 * @param selectionTree tree to iterate over as contained in rangeObject. must be passed separately to allow recursion in the selection tree, but not in the rangeObject
 * @param rangeObject GENTICS.Aloha.Selection.SelectionRange of the current selection
 * @param followUpContainer optional jQuery object; if provided the rangeObject will be split and the second part will be insert inside of this object
 * @param inBetweenMarkup jQuery object to be inserted between the two split parts. will be either a <br> (if no followUpContainer is passed) OR e.g. a table, which must be inserted between the splitobject AND the follow up
 * @return void
 */
GENTICS.Aloha.Markup.prototype.splitRangeObjectHelper = function(selectionTree, rangeObject, followUpContainer, inBetweenMarkup) {
	if (!followUpContainer) {
		GENTICS.Aloha.Log.warn(this, 'no followUpContainer, no inBetweenMarkup, nothing to do...');			
	}	
	var fillUpElement = this.getFillUpElement(rangeObject.splitObject);
	var splitObject = jQuery(rangeObject.splitObject);
	var startMoving = false;
	if (selectionTree.length > 0) {		
		var mirrorLevel = followUpContainer.contents();
		
		// if length of mirrorLevel and selectionTree are not equal, the mirrorLevel must be corrected. this happens, when the mirrorLevel contains whitespace textNodes
		if (mirrorLevel.length !== selectionTree.length) {
			this.removeElementContentWhitespaceObj(mirrorLevel);
		}
		
//			var originalLevel = jQuery(rangeObject.commonAncestorContainer).contents();
		for (var i = 0; i < selectionTree.length; i++) {
			var el = selectionTree[i];
			// remove all objects in the mirrorLevel, which are BEFORE the cursor
			// OR if the cursor is at the last position of the last Textnode (causing an empty followUpContainer to be appended)
			if (
					(el.selection === 'none' && startMoving === false) || 
					(el.domobj && el.domobj.nodeType === 3 && el === selectionTree[ (selectionTree.length-1) ] && el.startOffset === el.domobj.data.length)
			) {
				// iteration is before cursor, leave this part inside the splitObject, remove from followUpContainer
				// however if the object to remove is the last existing textNode within the followUpContainer, insert a BR instead
				// otherwise the followUpContainer is invalid and takes up no vertical space
				if (followUpContainer.textNodes().length > 1) {
					mirrorLevel.eq(i).remove();
				} else if (GENTICS.Utils.Dom.isSplitObject(followUpContainer[0])) {
					if (fillUpElement) {
						followUpContainer.html(fillUpElement); // for your zoological german knowhow: ephemera = Eintagsfliege
					} else {
						followUpContainer.empty();
					}
				} else {
					followUpContainer.empty();
					followUpContainer.addClass('preparedForRemoval');
				}
				continue;
			} else
				
				// split objects, which are AT the cursor Position or directly above
				if (el.selection !== 'none') { // before cursor, leave this part inside the splitObject
					// TODO better check for selection == 'partial' here?
					if (el.domobj && el.domobj.nodeType === 3 && el.startOffset !== undefined) {
						var completeText = el.domobj.data;
						if (el.startOffset > 0) {// first check, if there will be some text left in the splitObject 
							el.domobj.data = completeText.substr(0,el.startOffset);
						} else if (selectionTree.length > 1) { // if not, check if the splitObject contains more than one node, because then it can be removed. this happens, when ENTER is pressed inside of a textnode, but not at the borders
							jQuery(el.domobj).remove();
						} else { // if the "empty" textnode is the last node left in the splitObject, replace it with a ephemera break
							// if the parent is a blocklevel element, we insert the fillup element
							var parent = jQuery(el.domobj).parent();
							if (GENTICS.Utils.Dom.isSplitObject(parent[0])) {
								if (fillUpElement) {
									parent.html(fillUpElement);
								} else {
									parent.empty();
								}
							} else {
								// if the parent is no blocklevel element and would be empty now, we completely remove it
								parent.remove();
							}
						}
						if (completeText.length - el.startOffset > 0) {
							// first check if there is text left to put in the followUpContainer's textnode. this happens, when ENTER is pressed inside of a textnode, but not at the borders
							mirrorLevel[i].data = completeText.substr(el.startOffset, completeText.length);
						} else if (mirrorLevel.length > 1) {
							// if not, check if the followUpContainer contains more than one node, because if yes, the "empty" textnode can be removed
							mirrorLevel.eq( (i) ).remove();
						} else if (GENTICS.Utils.Dom.isBlockLevelElement(followUpContainer[0])) {
							// if the "empty" textnode is the last node left in the followUpContainer (which is a blocklevel element), replace it with a ephemera break
							if (fillUpElement) {
								followUpContainer.html(fillUpElement);
							} else {
								followUpContainer.empty();
							}
						} else {
							// if the "empty" textnode is the last node left in a non-blocklevel element, mark it for removal
							followUpContainer.empty();
							followUpContainer.addClass('preparedForRemoval');
						}
					}
					startMoving = true;
					if (el.children.length > 0) {
						this.splitRangeObjectHelper(el.children, rangeObject, mirrorLevel.eq(i), inBetweenMarkup);
					}
				} else 
					
					// remove all objects in the origien, which are AFTER the cursor
					if (el.selection === 'none' && startMoving === true) { 
						// iteration is after cursor, remove from splitObject and leave this part inside the followUpContainer
						jqObj = jQuery(el.domobj).remove();
					}
		}
	} else {
		GENTICS.Aloha.Log.error(this, 'can not split splitObject due to an empty selection tree');
	}
	
	// and finally cleanup: remove all fillUps > 1
	splitObject.find('br.GENTICS_ephemera:gt(0)').remove(); // remove all elements greater than (gt) 0, that also means: leave one
	followUpContainer.find('br.GENTICS_ephemera:gt(0)').remove(); // remove all elements greater than (gt) 0, that also means: leave one

	// remove objects prepared for removal
	splitObject.find('.preparedForRemoval').remove();
	followUpContainer.find('.preparedForRemoval').remove();

	// if splitObject / followUp are empty, place a fillUp inside
	if (splitObject.contents().length === 0 && GENTICS.Utils.Dom.isSplitObject(splitObject[0]) && fillUpElement) {
		splitObject.html(fillUpElement);
	}
	if (followUpContainer.contents().length === 0 && GENTICS.Utils.Dom.isSplitObject(followUpContainer[0]) && fillUpElement) {
		followUpContainer.html(fillUpElement);
	}
 };

/** 
 * returns a jQuery object fitting the passed splitObject as follow up object
 * examples, 
 * - when passed a p it will return an empty p (clone of the passed p)
 * - when passed an h1, it will return either an h1 (clone of the passed one) or a new p (if the collapsed selection was at the end)
 * @param rangeObject Gentics.Aloha.RangeObject
 * @return void
 */
GENTICS.Aloha.Markup.prototype.getSplitFollowUpContainer = function(rangeObject) {
	var tagName = rangeObject.splitObject.nodeName.toLowerCase();
	switch(tagName) {
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
			var lastObj = jQuery(rangeObject.splitObject).textNodes().last()[0];
			// special case: when enter is hit at the end of a heading, the followUp should be a <p>
			if (lastObj && rangeObject.startContainer === lastObj && rangeObject.startOffset === lastObj.length) {
				var returnObj = jQuery('<p></p>');
				var inside = jQuery(rangeObject.splitObject).clone().contents();
				returnObj.append(inside);
				return returnObj;
			}
			break;

		case 'li':
			// TODO check whether the li is the last one
			// special case: if enter is hit twice inside a list, the next item should be a <p> (and inserted outside the list)
			if (rangeObject.startContainer.nodeName.toLowerCase() === 'br' && jQuery(rangeObject.startContainer).hasClass('GENTICS_ephemera')) {
				var returnObj = jQuery('<p></p>');
				var inside = jQuery(rangeObject.splitObject).clone().contents();
				returnObj.append(inside);
				return returnObj;				
			}
			// when the li is the last one and empty, we also just return a <p>
			if (!rangeObject.splitObject.nextSibling && jQuery.trim(jQuery(rangeObject.splitObject).text()).length == 0) {
				var returnObj = jQuery('<p></p>');
				return returnObj;
			}
	}
	return jQuery(rangeObject.splitObject).clone();
};

/**
 * Transform the given domobj into an object with the given new nodeName.
 * Preserves the content and all attributes
 * @param domobj dom object to transform
 * @parma nodeName new node name
 * @api
 * @return new object as jQuery object
 */
GENTICS.Aloha.Markup.prototype.transformDomObject = function (domobj, nodeName) {
	// first create the new element
	var jqOldObj = jQuery(domobj);
	var jqNewObj = jQuery('<' + nodeName + '></' + nodeName + '>');
	// TODO what about attributes?

	// now move the contents of the old dom object into the new dom object
	jqOldObj.contents().appendTo(jqNewObj);

	// finally replace the old object with the new one
	jqOldObj.replaceWith(jqNewObj);

	return jqNewObj;
};

/** 
 * String representation
 * @return "GENTICS.Aloha.Selection"
 */
GENTICS.Aloha.Markup.prototype.toString = function() {  
	return 'GENTICS.Aloha.Markup';
};

GENTICS.Aloha.Markup = new GENTICS.Aloha.Markup();/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Message Object
 * @namespace GENTICS.Aloha
 * @class Message
 * @constructor
 * @param {Object} data object which contains the parts of the message
 *		title: the title
 * 		text: the message text to be displayed
 * 		type: one of GENTICS.Aloha.Message.Type
 * 		callback: callback function, which will be triggered after the message was confirmed, closed or accepted
 */
GENTICS.Aloha.Message = function (data) {
	this.title = data.title;
	this.text = data.text;
	this.type = data.type;
	this.callback = data.callback;
};

/**
 * Message types enum. Contains all allowed types of messages
 * @property
 */
GENTICS.Aloha.Message.Type = {
// reserved for messages
//	SUCCESS : 'success',
//	INFO : 'info',
//	WARN : 'warn',
//	CRITICAL : 'critical',
	CONFIRM : 'confirm', // confirm dialog, like js confirm()
	ALERT : 'alert', // alert dialog like js alert()
	WAIT : 'wait' // wait dialog with loading bar. has to be hidden via GENTICS.Aloha.hideMessage()
};

/**
 * Returns a textual representation of the message
 * @return textual representation of the message
 * @hide
 */
GENTICS.Aloha.Message.prototype.toString = function () {
  return this.type + ": " + this.message;
};

/**
 * This is the message line
 * @hide
 */
GENTICS.Aloha.MessageLine = function () {
  this.messages = new Array();
};

/**
 * Add a new message to the message line
 * @param message message to add
 * @return void
 * @hide
 */
GENTICS.Aloha.MessageLine.prototype.add = function(message) {
  // dummy implementation to add a message
  this.messages[this.messages.length] = message;
  while(this.messages.length > 4) {
	this.messages.shift();
  }
  jQuery("#gtx_aloha_messageline").html("");
  for ( var i = 0; i < this.messages.length; i++) {
	  jQuery("#gtx_aloha_messageline").append((this.messages[i].toString() + "<br/>"));
  }
};

/**
 * Message Line Object
 * @hide
 */
GENTICS.Aloha.MessageLine = new GENTICS.Aloha.MessageLine();
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Plugin Registry
 * @namespace GENTICS.Aloha
 * @class PluginRegistry
 * @singleton
 */
GENTICS.Aloha.PluginRegistry = function() {
	this.plugins = new Array();
};

/**
 * Register a plugin
 * @param {Plugin} plugin plugin to register
 */
GENTICS.Aloha.PluginRegistry.prototype.register = function(plugin) {
	if (plugin instanceof GENTICS.Aloha.Plugin) {
		// TODO check for duplicate plugin prefixes
		this.plugins.push(plugin);
	}
};

/**
 * Initialize all registered plugins
 * @return void
 * @hide
 */
GENTICS.Aloha.PluginRegistry.prototype.init = function() {
	// iterate through all registered plugins
	for ( var i = 0; i < this.plugins.length; i++) {
		var plugin = this.plugins[i];

		// get the plugin settings
		if (GENTICS.Aloha.settings.plugins == undefined) {
			GENTICS.Aloha.settings.plugins = {};
		}
		
		plugin.settings = GENTICS.Aloha.settings.plugins[plugin.prefix];
		
		if (plugin.settings == undefined) {
			plugin.settings = {};
		}
		
		if (plugin.settings.enabled == undefined) {
			plugin.settings.enabled = true;
		}

		// initialize i18n for the plugin
		// determine the actual language
		var actualLanguage = plugin.languages ? GENTICS.Aloha.getLanguage(GENTICS.Aloha.settings.i18n.current, plugin.languages) : null;

		if (!actualLanguage) {
			GENTICS.Aloha.Log.warn(this, 'Could not determine actual language, no languages available for plugin ' + plugin);
		} else {
			// load the dictionary file for the actual language
			var fileUrl = GENTICS.Aloha.settings.base + 'plugins/' + plugin.basePath + '/i18n/' + actualLanguage + '.dict';
			GENTICS.Aloha.loadI18nFile(fileUrl, plugin);
		}

		if (plugin.settings.enabled == true) {
			// initialize the plugin
			this.plugins[i].init();
		}
	}
};

/**
 * Pass the given jQuery object, which represents an editable to all plugins, so that they can make the content clean (prepare for saving)
 * @param obj jQuery object representing an editable
 * @return void
 * @hide
 */
GENTICS.Aloha.PluginRegistry.prototype.makeClean = function(obj) {
	// iterate through all registered plugins
	for ( var i = 0; i < this.plugins.length; i++) {
		var plugin = this.plugins[i];
		if (GENTICS.Aloha.Log.isDebugEnabled()) {
			GENTICS.Aloha.Log.debug(this, "Passing contents of HTML Element with id { " + obj.attr("id") + " } for cleaning to plugin { " + plugin.prefix + " }");
		}
		plugin.makeClean(obj);
	}
};

/**
 * Create the PluginRegistry object
 * @hide
 */
GENTICS.Aloha.PluginRegistry = new GENTICS.Aloha.PluginRegistry();

/**
 * Expose a nice name for the PluginRegistry
 * @hide
 */
GENTICS.Aloha.PluginRegistry.toString = function() {
	return "com.gentics.aloha.PluginRegistry";
};

/**
 * Abstract Plugin Object
 * @namespace GENTICS.Aloha
 * @class Plugin
 * @constructor
 * @param {String} pluginPrefix unique plugin prefix
 * @param {String} basePath (optional) basepath of the plugin (relative to 'plugins' folder). If not given, the basePath pluginPrefix is taken
 */
GENTICS.Aloha.Plugin = function(pluginPrefix, basePath) {
	/**
	 * Settings of the plugin
	 */
	this.prefix = pluginPrefix;
	this.basePath = basePath ? basePath : pluginPrefix;
	GENTICS.Aloha.PluginRegistry.register(this);
};

/**
 * contains the plugin's settings object
 * @cfg {Object} settings the plugins settings stored in an object
 */
GENTICS.Aloha.Plugin.prototype.settings = null;

/**
 * Init method of the plugin. Called from Aloha Core to initialize this plugin
 * @return void
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.init = function() {};

/**
 * Get the configuration settings for an editable obj.
 * 
 * The default configuration parameters are:
 * <pre>
 * "com.gentics.aloha.plugins.List": { 
 *		config : [ 'b', 'h1' ],
 * 		editables : {
 *			'#title'	: [ ], 
 *			'div'		: [ 'b', 'i' ], 
 *			'.article'	: [ 'h1' ]
 *	  	}
 *	}
 * </pre>
 *  
 * The hash keys of the editables are css selectors. For a
 *  
 * <pre>
 *  <div class="article">content</div>
 * </pre>
 *  
 *  the selectors 'div' and '.article' match and the returned configuration is
 *  
 * <pre>
 *  [ 'b', 'i', 'h1'] 
 * </pre>
 * 
 * The '#title' object would return an empty configuration.
 * 
 * <pre>
 *  [ ] 
 * </pre>
 *  
 *  All other objects would get the 'config' configuration. If config is not set
 * the plugin default configuration is returned.
 * 
 * <pre>
 *  [ 'b', 'h1'] 
 * </pre>
 * 
 * @param {jQuery} obj jQuery object of an Editable Object
 * @return {Array} config A Array with configuration entries 
 */
GENTICS.Aloha.Plugin.prototype.getEditableConfig = function (obj) {
	
	var config = [];
	var configSpecified = false;
	
	if ( this.settings.editables ) {
	
		// check if the editable's selector matches and if so add its configuration to object configuration
		jQuery.each( this.settings.editables, function (selector, selectorConfig) {
			if ( obj.is(selector) ) {
				configSpecified = true;
				config = jQuery.merge(config, selectorConfig);
			}
		});	
	}
	
	// fall back to default configuration
	if ( !configSpecified ) {
		if ( typeof this.settings.config == 'undefined' || !this.settings.config ) {
			config = this.config;
		} else {
			config = this.settings.config;
		}
	}
	
	return config;
};

/**
 * Make the given jQuery object (representing an editable) clean for saving
 * @param obj jQuery object to make clean
 * @return void
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.makeClean = function (obj) {};

/**
 * Make a system-wide unique id out of a plugin-wide unique id by prefixing it with the plugin prefix
 * @param id plugin-wide unique id
 * @return system-wide unique id
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.getUID = function(id) {
	return this.prefix + "." + id;
};

/**
 * Localize the given key for the plugin.
 * @param key key to be localized
 * @param replacements array of replacement strings
 * @return localized string
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.i18n = function(key, replacements) {
	return GENTICS.Aloha.i18n(this, key, replacements);
};

/**
 * Return string representation of the plugin, which is the prefix
 * @return prefix
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.toString = function() {
	return this.prefix;
};

/**
 * Log a plugin message to the logger
 * @param level log level
 * @param message log message
 * @return void
 * @hide
 */
GENTICS.Aloha.Plugin.prototype.log = function (level, message) {
	GENTICS.Aloha.Log.log(level, this, message);
};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
jQuery.fn.zap = function () {
	return this.each(function(){ jQuery(this.childNodes).insertBefore(this); }).remove();
};

jQuery.fn.textNodes = function(excludeBreaks, includeEmptyTextNodes) {
    var ret = [];

    (function(el){
        if (
        		(el.nodeType == 3 && jQuery.trim(el.data) != '' && !includeEmptyTextNodes) || 
        		(el.nodeType == 3 && includeEmptyTextNodes) || 
        		(el.nodeName =="BR" && !excludeBreaks)) {
            ret.push(el);
        } else {
            for (var i=0; i < el.childNodes.length; ++i) {
                arguments.callee(el.childNodes[i]);
            }
        }
    })(this[0]);
    return jQuery(ret);
};

/**
 * @namespace GENTICS.Aloha
 * @class Selection
 * This singleton class always represents the current user selection
 * @singleton
 */
GENTICS.Aloha.Selection = function() {
	this.rangeObject = new Object(); // Pseudo Range Clone being cleaned up for better HTML wrapping support

	// define basics first
	this.tagHierarchy = {
		'textNode' : [],
		'abbr' : ['textNode'],
		'b' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img','a','del','ins','u', 'cite', 'q', 'code', 'abbr', 'strong'],
		'pre' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img','a','del','ins','u', 'cite','q', 'code', 'abbr', 'code'],
		'blockquote' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img','a','del','ins','u', 'cite', 'q', 'code', 'abbr', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		'ins' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img','a','u', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		'ul' : ['li'],
		'ol' : ['li'],
		'li' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'del', 'ins', 'u'],
		'tr' : ['td','th'],
		'table' : ['tr'],
		'div' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img', 'ul', 'ol', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'del', 'ins', 'u', 'p', 'div', 'pre', 'blockquote'],
		'h1' : ['textNode', 'b', 'i', 'em', 'sup', 'sub', 'br', 'span', 'img','a', 'del', 'ins', 'u']
	};
	// now reference the basics for all other equal tags (important: don't forget to include 
	// the basics itself as reference: 'b' : this.tagHierarchy.b
	this.tagHierarchy = {
		'textNode' : this.tagHierarchy.textNode,
		'abbr' : this.tagHierarchy.abbr,
		'br' : this.tagHierarchy.textNode,
		'img' : this.tagHierarchy.textNode,
		'b' : this.tagHierarchy.b,
		'strong' : this.tagHierarchy.b,
		'code' : this.tagHierarchy.b,
		'q' : this.tagHierarchy.b,
		'blockquote' : this.tagHierarchy.blockquote,
		'cite' : this.tagHierarchy.b,
		'i' : this.tagHierarchy.b,
		'em' : this.tagHierarchy.b,
		'sup' : this.tagHierarchy.b,
		'sub' : this.tagHierarchy.b,
		'span' : this.tagHierarchy.b,
		'del' : this.tagHierarchy.del,
		'ins' : this.tagHierarchy.ins,
		'u' : this.tagHierarchy.b,
		'p' : this.tagHierarchy.b,
		'pre' : this.tagHierarchy.pre,
		'a' : this.tagHierarchy.b,
		'ul' : this.tagHierarchy.ul,
		'ol' : this.tagHierarchy.ol,
		'li' : this.tagHierarchy.li,
		'td' : this.tagHierarchy.li,
		'div' : this.tagHierarchy.div,
		'h1' : this.tagHierarchy.h1,
		'h2' : this.tagHierarchy.h1,
		'h3' : this.tagHierarchy.h1,
		'h4' : this.tagHierarchy.h1,
		'h5' : this.tagHierarchy.h1,
		'h6' : this.tagHierarchy.h1,
		'table' : this.tagHierarchy.table
	};
			
	// When applying this elements to selection they will replace the assigned elements
	this.replacingElements = {
		'h1' : ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6','pre'],
		'blockquote' : ['blockquote']
	};
	this.replacingElements = {
			'h1' : this.replacingElements.h1,
			'h2' : this.replacingElements.h1,
			'h3' : this.replacingElements.h1,
			'h4' : this.replacingElements.h1,
			'h5' : this.replacingElements.h1,
			'h6' : this.replacingElements.h1,
			'pre' : this.replacingElements.h1,
			'p' : this.replacingElements.h1,
			'blockquote' : this.replacingElements.blockquote
	};
	this.allowedToStealElements = {
			'h1' : ['textNode']
	};
	this.allowedToStealElements = {
			'h1' : this.allowedToStealElements.h1,
			'h2' : this.allowedToStealElements.h1,
			'h3' : this.allowedToStealElements.h1,
			'h4' : this.allowedToStealElements.h1,
			'h5' : this.allowedToStealElements.h1,
			'h6' : this.allowedToStealElements.h1,
			'p' : this.tagHierarchy.b
	};	
};

/**
 * Class definition of a SelectionTree (relevant for all formatting / markup changes)
 * TODO: remove this (was moved to range.js)
 * Structure:
 * +
 * |-domobj: <reference to the DOM Object> (NOT jQuery)
 * |-selection: defines if this node is marked by user [none|partial|full]
 * |-children: recursive structure like this
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionTree = function() {
	this.domobj = new Object();
	this.selection;
	this.children = new Array();
};

/**
 * INFO: Method is used for integration with Gentics Aloha, has no use otherwise
 * Updates the rangeObject according to the current user selection
 * Method is always called on selection change
 * @param objectClicked Object that triggered the selectionChange event
 * @return true when rangeObject was modified, false otherwise
 * @hide
 */
GENTICS.Aloha.Selection.prototype.onChange = function(objectClicked, event) {
	if (this.updateSelectionTimeout) {
		window.clearTimeout(this.updateSelectionTimeout);
		this.updateSelectionTimeout = undefined;
	}
	this.updateSelectionTimeout = window.setTimeout(function () {
		GENTICS.Aloha.Selection.updateSelection(event);
	}, 5);
};

/**
 * INFO: Method is used for integration with Gentics Aloha, has no use otherwise
 * Updates the rangeObject according to the current user selection
 * Method is always called on selection change
 * @param event jQuery browser event object
 * @return true when rangeObject was modified, false otherwise
 * @hide
 */
GENTICS.Aloha.Selection.prototype.updateSelection = function(event) {
	// get the rangeObject
	var rangeObject = this.rangeObject = new GENTICS.Aloha.Selection.SelectionRange(true);

	// find the CAC (Common Ancestor Container) and update the selection Tree
	rangeObject.update();

	// initially set the scope to 'continuoustext'
	GENTICS.Aloha.FloatingMenu.setScope('GENTICS.Aloha.continuoustext');

	// throw the event that the selection has changed. Plugins now have the
	// chance to react on the changed selection
	GENTICS.Aloha.EventRegistry.trigger(
			new GENTICS.Aloha.Event(
					'selectionChanged',
					GENTICS.Aloha,
					[ rangeObject, event ]
			)
	);

	return true;	
};

/**
 * creates an object with x items containing all relevant dom objects.
 * Structure:
 * +
 * |-domobj: <reference to the DOM Object> (NOT jQuery)
 * |-selection: defines if this node is marked by user [none|partial|full]
 * |-children: recursive structure like this ("x.." because it's then shown last in DOM Browsers...)
 * TODO: remove this (was moved to range.js)
 * 
 * @param rangeObject "Aloha clean" range object including a commonAncestorContainer
 * @return obj selection
 * @hide
 */
GENTICS.Aloha.Selection.prototype.getSelectionTree = function(rangeObject) {
	if (!rangeObject) { // if called without any parameters, the method acts as getter for this.selectionTree
		return this.rangeObject.getSelectionTree();
	}
	if (!rangeObject.commonAncestorContainer) {
		GENTICS.Aloha.Log.error(this, 'the rangeObject is missing the commonAncestorContainer');
		return false;
	}

	this.inselection = false;

	// before getting the selection tree, we do a cleanup
	if (GENTICS.Utils.Dom.doCleanup({'mergetext' : true}, rangeObject)) {
		this.rangeObject.update();
		this.rangeObject.select();
	}

	return this.recursiveGetSelectionTree(rangeObject, rangeObject.commonAncestorContainer);
};

/**
 * Recursive inner function for generating the selection tree.
 * TODO: remove this (was moved to range.js)
 * @param rangeObject range object
 * @param currentObject current DOM object for which the selection tree shall be generated
 * @return array of SelectionTree objects for the children of the current DOM object
 * @hide
 */
GENTICS.Aloha.Selection.prototype.recursiveGetSelectionTree = function (rangeObject, currentObject) {
	// get all direct children of the given object
	var jQueryCurrentObject = jQuery(currentObject);
	var childCount = 0;
	var that = this;
	var currentElements = new Array();

	jQueryCurrentObject.contents().each(function(index) {
		var selectionType = 'none';
		var startOffset = false;
		var endOffset = false;
		var collapsedFound = false;

		// check for collapsed selections between nodes
		if (rangeObject.isCollapsed() && currentObject === rangeObject.startContainer && rangeObject.startOffset == index) {
			// insert an extra selectiontree object for the collapsed selection here
			currentElements[childCount] = new GENTICS.Aloha.Selection.SelectionTree();
			currentElements[childCount].selection = 'collapsed';
			currentElements[childCount].domobj = undefined;
			that.inselection = false;
			collapsedFound = true;
			childCount++;
		}

		if (!that.inselection && !collapsedFound) {
			// the start of the selection was not yet found, so look for it now
			// check whether the start of the selection is found here

			// check is dependent on the node type
			switch(this.nodeType) {
			case 3: // text node
				if (this === rangeObject.startContainer) {
					// the selection starts here
					that.inselection = true;

					// when the startoffset is > 0, the selection type is only partial
					selectionType = rangeObject.startOffset > 0 ? 'partial' : 'full';
					startOffset = rangeObject.startOffset;
					endOffset = this.length;
				}
				break;
			case 1: // element node
				if (this === rangeObject.startContainer && rangeObject.startOffset == 0) {
					// the selection starts here
					that.inselection = true;
					selectionType = 'full';
				}
				if (currentObject === rangeObject.startContainer && rangeObject.startOffset == index) {
					// the selection starts here
					that.inselection = true;
					selectionType = 'full';
				}
				break;
			}
		}

		if (that.inselection && !collapsedFound) {
			if (selectionType == 'none') {
				selectionType = 'full';
			}
			// we already found the start of the selection, so look for the end of the selection now
			// check whether the end of the selection is found here

			switch(this.nodeType) {
			case 3: // text node
				if (this === rangeObject.endContainer) {
					// the selection ends here
					that.inselection = false;

					// check for partial selection here
					if (rangeObject.endOffset < this.length) {
						selectionType = 'partial';
					}
					if (startOffset === false) {
						startOffset = 0;
					}
					endOffset = rangeObject.endOffset;
				}
				break;
			case 1: // element node
				if (this === rangeObject.endContainer && rangeObject.endOffset == 0) {
					that.inselection = false;
				}
				break;
			}
			if (currentObject === rangeObject.endContainer && rangeObject.endOffset <= index) {
				that.inselection = false;
				selectionType = 'none';
			}
		}

		// create the current selection tree entry
		currentElements[childCount] = new GENTICS.Aloha.Selection.SelectionTree();
		currentElements[childCount].domobj = this;
		currentElements[childCount].selection = selectionType;
		if (selectionType == 'partial') {
			currentElements[childCount].startOffset = startOffset;
			currentElements[childCount].endOffset = endOffset;
		}

		// now do the recursion step into the current object
		currentElements[childCount].children = that.recursiveGetSelectionTree(rangeObject, this);

		// check whether a selection was found within the children
		if (currentElements[childCount].children.length > 0) {
			var noneFound = false;
			var partialFound = false;
			var fullFound = false;
			for (var i = 0; i < currentElements[childCount].children.length; ++i) {
				switch(currentElements[childCount].children[i].selection) {
				case 'none':
					noneFound = true;
					break;
				case 'full':
					fullFound = true;
					break;
				case 'partial':
					partialFound = true;
					break;
				}
			}

			if (partialFound || (fullFound && noneFound)) {
				// found at least one 'partial' selection in the children, or both 'full' and 'none', so this element is also 'partial' selected
				currentElements[childCount].selection = 'partial';
			} else if (fullFound && !partialFound && !noneFound) {
				// only found 'full' selected children, so this element is also 'full' selected
				currentElements[childCount].selection = 'full';
			}
		}

		childCount++;
	});

	// extra check for collapsed selections at the end of the current element
	if (rangeObject.isCollapsed()
			&& currentObject === rangeObject.startContainer
			&& rangeObject.startOffset == currentObject.childNodes.length) {
		currentElements[childCount] = new GENTICS.Aloha.Selection.SelectionTree();
		currentElements[childCount].selection = 'collapsed';
		currentElements[childCount].domobj = undefined;
	}

	return currentElements;
};

/**
 * Get the currently selected range
 * @return {GENTICS.Aloha.Selection.SelectionRange} currently selected range
 * @method
 */
GENTICS.Aloha.Selection.prototype.getRangeObject = function() {
	return this.rangeObject;
};

/**
 * method finds out, if a node is within a certain markup or not
 * @param rangeObj Aloha rangeObject
 * @param startOrEnd boolean; defines, if start or endContainer should be used: false for start, true for end
 * @param markupObject jQuery object of the markup to look for
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @param limitObject dom object which limits the search are within the dom. normally this will be the active Editable
 * @return true, if the markup is effective on the range objects start or end node
 * @hide
 */
GENTICS.Aloha.Selection.prototype.isRangeObjectWithinMarkup = function(rangeObject, startOrEnd, markupObject, tagComparator, limitObject) {
	domObj = !startOrEnd?rangeObject.startContainer:rangeObject.endContainer;
	// check if a comparison method was passed as parameter ...
	if (typeof tagComparator !== 'undefined' && typeof tagComparator !== 'function') {
		GENTICS.Aloha.Log.error(this,'parameter tagComparator is not a function');		
	}
	// ... if not use this as standard tag comparison method
	var that = this;
	if (typeof tagComparator === 'undefined') {
		tagComparator = function(domobj, markupObject) {
			return that.standardTextLevelSemanticsComparator(domobj, markupObject); // TODO should actually be this.getStandardTagComparator(markupObject)
		};
	}	
	var parents = jQuery(domObj).parents();
	var returnVal = false;
	var i = -1;
	var that = this;
	if (parents.length > 0) {
		parents.each(function() {
			// the limit object was reached (normally the Editable Element)
			if (this === limitObject) {
				GENTICS.Aloha.Log.debug(that,'reached limit dom obj');		
				return false; // break() of jQuery .each(); THIS IS NOT THE FUNCTION RETURN VALUE
			}
			if (tagComparator(this, markupObject)) {
				if (returnVal === false) {
					returnVal = new Array();
				}
				GENTICS.Aloha.Log.debug(that,'reached object equal to markup');		
				i++;
				returnVal[i] = this;
				return true; // continue() of jQuery .each(); THIS IS NOT THE FUNCTION RETURN VALUE
			}
		});
	}
	return returnVal;
};

/**
 * standard method, to compare a domobj and a jquery object for sections and grouping content (e.g. p, h1, h2, ul, ....). 
 * is always used when no other tag comparator is passed as parameter
 * @param domobj domobject to compare with markup
 * @param markupObject jQuery object of the markup to compare with domobj
 * @return true if objects are equal and false if not
 * @hide
 */
GENTICS.Aloha.Selection.prototype.standardSectionsAndGroupingContentComparator = function(domobj, markupObject) {
	if  (domobj.nodeType === 1) {
		if (markupObject[0].tagName && GENTICS.Aloha.Selection.replacingElements[ domobj.tagName.toLowerCase() ] && GENTICS.Aloha.Selection.replacingElements[ domobj.tagName.toLowerCase() ].indexOf(markupObject[0].tagName.toLowerCase()) != -1) {
			return true;
		}
	} else {
		GENTICS.Aloha.Log.debug(this,'only element nodes (nodeType == 1) can be compared');
	}
	return false;
};

/**
 * standard method, to compare a domobj and a jquery object for text level semantics (aka span elements, e.g. b, i, sup, span, ...).
 * is always used when no other tag comparator is passed as parameter
 * @param domobj domobject to compare with markup
 * @param markupObject jQuery object of the markup to compare with domobj
 * @return true if objects are equal and false if not
 * @hide
 */
GENTICS.Aloha.Selection.prototype.standardTextLevelSemanticsComparator = function(domobj, markupObject) {
	// only element nodes can be compared
	if  (domobj.nodeType === 1) {
		if (domobj.tagName.toLowerCase() != markupObject[0].tagName.toLowerCase()) {
//			GENTICS.Aloha.Log.debug(this, 'tag comparison for <' + domobj.tagName.toLowerCase() + '> and <' + markupObject[0].tagName.toLowerCase() + '> failed because tags are different');
			return false;
		}
		if (!this.standardAttributesComparator(domobj, markupObject)) {
			return false;
		}
		return true;
	} else {
		GENTICS.Aloha.Log.debug(this,'only element nodes (nodeType == 1) can be compared');
	}
	return false;
};


/**
 * standard method, to compare attributes of one dom obj and one markup obj (jQuery) 
 * @param domobj domobject to compare with markup
 * @param markupObject jQuery object of the markup to compare with domobj
 * @return true if objects are equal and false if not
 * @hide
 */
GENTICS.Aloha.Selection.prototype.standardAttributesComparator = function(domobj, markupObject) {
	if (domobj.attributes && domobj.attributes.length && domobj.attributes.length > 0) {
		for (var i = 0; i < domobj.attributes.length; i++) {
			var attr = domobj.attributes[i];
			if (attr.nodeName.toLowerCase() == 'class' && attr.nodeValue.length > 0) {
				var classString = attr.nodeValue;
				var classes = classString.split(' ');
			}
		}
	}
	if (markupObject[0].attributes && markupObject[0].attributes.length && markupObject[0].attributes.length > 0) {
		for (var i = 0; i < markupObject[0].attributes.length; i++) {
			var attr = markupObject[0].attributes[i];
			if (attr.nodeName.toLowerCase() == 'class' && attr.nodeValue.length > 0) {
				var classString = attr.nodeValue;
				var classes2 = classString.split(' ');
			}
		}
	}

	if (classes && !classes2 || classes2 && !classes) {
		GENTICS.Aloha.Log.debug(this, 'tag comparison for <' + domobj.tagName.toLowerCase() + '> failed because one element has classes and the other has not');
		return false;
	}
	if (classes && classes2 && classes.length != classes.length) {
		GENTICS.Aloha.Log.debug(this, 'tag comparison for <' + domobj.tagName.toLowerCase() + '> failed because of a different amount of classes');
		return false;
	}
	if (classes && classes2 && classes.length == classes2.length && classes.length != 0) {
		for (var i = 0; i < classes.length; i++) {
			if (!markupObject.hasClass(classes[ i ])) {
				GENTICS.Aloha.Log.debug(this, 'tag comparison for <' + domobj.tagName.toLowerCase() + '> failed because of different classes');
				return false;
			}
		}
	}
	return true;
};

/**
 * method finds out, if a node is within a certain markup or not
 * @param rangeObj Aloha rangeObject
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @return void; TODO: should return true if the markup applied successfully and false if not
 * @hide
 */
GENTICS.Aloha.Selection.prototype.changeMarkup = function(rangeObject, markupObject, tagComparator) {
	var tagName = markupObject[0].tagName.toLowerCase();
	// if the element is a replacing element (like p/h1/h2/h3/h4/h5/h6...), which must not wrap each other
	// use a clone of rangeObject
	if (this.replacingElements[ tagName ]) {
		// backup rangeObject for later selection;
		var backupRangeObject = rangeObject;
		
		// create a new range object to not modify the orginal
		rangeObject = new this.SelectionRange(rangeObject);
		
		// either select the active Editable as new commonAncestorContainer (CAC) or use the body
		if (GENTICS.Aloha.activeEditable) {
			var newCAC= GENTICS.Aloha.activeEditable.obj.get(0);
		} else {
			var newCAC = document.body;
		}		
		// update rangeObject by setting the newCAC and automatically recalculating the selectionTree
		rangeObject.update(newCAC);
		
		// store the information, that the markupObject can be replaced (not must be!!) inside the jQuery markup object
		markupObject.isReplacingElement = true;
	} 
	// if the element is NOT a replacing element, then something needs to be selected, otherwise it can not be wrapped
	// therefor the method can return false, if nothing is selected ( = rangeObject is collapsed)
	else {
		if (rangeObject.isCollapsed()) {
			GENTICS.Aloha.Log.debug(this, 'early returning from applying markup because nothing is currently selected');
			return false;
		}
	}

	// is Start/End DOM Obj inside the markup to change
	if (GENTICS.Aloha.activeEditable) {
		var limitObject = GENTICS.Aloha.activeEditable.obj[0];
	} else {
		var limitObject = document.body;
	}
	
	var relevantMarkupObjectsAtSelectionStart = this.isRangeObjectWithinMarkup(rangeObject, false, markupObject, tagComparator, limitObject);
	var relevantMarkupObjectsAtSelectionEnd = this.isRangeObjectWithinMarkup(rangeObject, true, markupObject, tagComparator, limitObject);
	
	if (!markupObject.isReplacingElement && rangeObject.startOffset == 0) { // don't care about replacers, because they never extend
		var prevSibling;
		if (prevSibling = this.getTextNodeSibling(false, rangeObject.commonAncestorContainer.parentNode, rangeObject.startContainer)) {
			var relevantMarkupObjectBeforeSelection = this.isRangeObjectWithinMarkup({startContainer : prevSibling, startOffset : 0}, false, markupObject, tagComparator, limitObject);
		}
	}
	if (!markupObject.isReplacingElement && (rangeObject.endOffset == rangeObject.endContainer.length)) { // don't care about replacers, because they never extend
		var nextSibling;
		if (nextSibling = this.getTextNodeSibling(true, rangeObject.commonAncestorContainer.parentNode, rangeObject.endContainer)) {
			var relevantMarkupObjectAfterSelection = this.isRangeObjectWithinMarkup({startContainer: nextSibling, startOffset: 0}, false, markupObject, tagComparator, limitObject);
		}
	}
	
	// decide what to do (expand or reduce markup)
	// Alternative A: from markup to no-markup: markup will be removed in selection; 
	// reapplied from original markup start to selection start
	if (!markupObject.isReplacingElement && (relevantMarkupObjectsAtSelectionStart && !relevantMarkupObjectsAtSelectionEnd)) {
		GENTICS.Aloha.Log.info(this, 'markup 2 non-markup');
		this.prepareForRemoval(rangeObject.getSelectionTree(), markupObject, tagComparator);
		jQuery(relevantMarkupObjectsAtSelectionStart).addClass('preparedForRemoval');
		this.insertCroppedMarkups(relevantMarkupObjectsAtSelectionStart, rangeObject, false, tagComparator);
	} else
	
	// Alternative B: from markup to markup:
	// remove selected markup (=split existing markup if single, shrink if two different)
	if (!markupObject.isReplacingElement && relevantMarkupObjectsAtSelectionStart && relevantMarkupObjectsAtSelectionEnd) {
		GENTICS.Aloha.Log.info(this, 'markup 2 markup');
		this.prepareForRemoval(rangeObject.getSelectionTree(), markupObject, tagComparator);
		this.splitRelevantMarkupObject(relevantMarkupObjectsAtSelectionStart, relevantMarkupObjectsAtSelectionEnd, rangeObject, tagComparator);
	} else
	
	// Alternative C: from no-markup to markup OR with next2markup: 
	// new markup is wrapped from selection start to end of originalmarkup, original is remove afterwards
	if (!markupObject.isReplacingElement && ((!relevantMarkupObjectsAtSelectionStart && relevantMarkupObjectsAtSelectionEnd) || relevantMarkupObjectAfterSelection || relevantMarkupObjectBeforeSelection )) { // 
		GENTICS.Aloha.Log.info(this, 'non-markup 2 markup OR with next2markup');
		// move end of rangeObject to end of relevant markups
		if (relevantMarkupObjectBeforeSelection && relevantMarkupObjectAfterSelection) {
			var extendedRangeObject = new GENTICS.Aloha.Selection.SelectionRange(rangeObject);
			extendedRangeObject.startContainer = jQuery(relevantMarkupObjectBeforeSelection[ relevantMarkupObjectBeforeSelection.length-1 ]).textNodes()[0];
			extendedRangeObject.startOffset = 0;
			extendedRangeObject.endContainer = jQuery(relevantMarkupObjectAfterSelection[ relevantMarkupObjectAfterSelection.length-1 ]).textNodes().last()[0];
			extendedRangeObject.endOffset = extendedRangeObject.endContainer.length;
			extendedRangeObject.update();
			this.applyMarkup(extendedRangeObject.getSelectionTree(), rangeObject, markupObject, tagComparator);
			GENTICS.Aloha.Log.info(this, 'double extending previous markup(previous and after selection), actually wrapping it ...');
			
		} else if (relevantMarkupObjectBeforeSelection && !relevantMarkupObjectAfterSelection && !relevantMarkupObjectsAtSelectionEnd) {
			this.extendExistingMarkupWithSelection(relevantMarkupObjectBeforeSelection, rangeObject, false, tagComparator);
			GENTICS.Aloha.Log.info(this, 'extending previous markup');

		} else if (relevantMarkupObjectBeforeSelection && !relevantMarkupObjectAfterSelection && relevantMarkupObjectsAtSelectionEnd) {
			var extendedRangeObject = new GENTICS.Aloha.Selection.SelectionRange(rangeObject);
			extendedRangeObject.startContainer = jQuery(relevantMarkupObjectBeforeSelection[ relevantMarkupObjectBeforeSelection.length-1 ]).textNodes()[0];
			extendedRangeObject.startOffset = 0;
			extendedRangeObject.endContainer = jQuery(relevantMarkupObjectsAtSelectionEnd[ relevantMarkupObjectsAtSelectionEnd.length-1 ]).textNodes().last()[0];
			extendedRangeObject.endOffset = extendedRangeObject.endContainer.length;
			extendedRangeObject.update();
			this.applyMarkup(extendedRangeObject.getSelectionTree(), rangeObject, markupObject, tagComparator);
			GENTICS.Aloha.Log.info(this, 'double extending previous markup(previous and relevant at the end), actually wrapping it ...');
			
		} else if (!relevantMarkupObjectBeforeSelection && relevantMarkupObjectAfterSelection) {
			this.extendExistingMarkupWithSelection(relevantMarkupObjectAfterSelection, rangeObject, true, tagComparator);
			GENTICS.Aloha.Log.info(this, 'extending following markup backwards');
			
		} else {
			this.extendExistingMarkupWithSelection(relevantMarkupObjectsAtSelectionEnd, rangeObject, true, tagComparator);
		}
	} else	
		
	// Alternative D: no-markup to no-markup: easy
	if (markupObject.isReplacingElement || (!relevantMarkupObjectsAtSelectionStart && !relevantMarkupObjectsAtSelectionEnd && !relevantMarkupObjectBeforeSelection && !relevantMarkupObjectAfterSelection)) {
		GENTICS.Aloha.Log.info(this, 'non-markup 2 non-markup');
		this.applyMarkup(rangeObject.getSelectionTree(), rangeObject, markupObject, tagComparator, {setRangeObject2NewMarkup: true});
	}
	
	// remove all marked items
	jQuery(".preparedForRemoval").zap();
	
	// recalculate cac and selectionTree
	rangeObject.update();
	
	// update selection
	if (markupObject.isReplacingElement) {
//		this.setSelection(backupRangeObject, true);
		backupRangeObject.select();
	} else {
//		this.setSelection(rangeObject);
		rangeObject.select();
	}
};

/**
 * method compares a JS array of domobjects with a range object and decides, if the rangeObject spans the whole markup objects. method is used to decide if a markup2markup selection can be completely remove or if it must be splitted into 2 separate markups
 * @param relevantMarkupObjectsAtSelectionStart JS Array of dom objects, which are parents to the rangeObject.startContainer
 * @param relevantMarkupObjectsAtSelectionEnd JS Array of dom objects, which are parents to the rangeObject.endContainer
 * @param rangeObj Aloha rangeObject
 * @return true, if rangeObjects and markup objects are identical, false otherwise
 * @hide
 */
GENTICS.Aloha.Selection.prototype.areMarkupObjectsAsLongAsRangeObject = function(relevantMarkupObjectsAtSelectionStart, relevantMarkupObjectsAtSelectionEnd, rangeObject) {
	if (rangeObject.startOffset !== 0) {
		return false;
	}
	for (var i = 0; i < relevantMarkupObjectsAtSelectionStart.length; i++) {
		var el = relevantMarkupObjectsAtSelectionStart[i];
		if (jQuery(el).textNodes().first()[0] !== rangeObject.startContainer) {
			return false;
		}
	}
	for (var i = 0; i < relevantMarkupObjectsAtSelectionEnd.length; i++) {
		var el = relevantMarkupObjectsAtSelectionEnd[i];
		if (jQuery(el).textNodes().last()[0] !== rangeObject.endContainer || jQuery(el).textNodes().last()[0].length != rangeObject.endOffset) {
			return false;
		}
	}	
	
	return true;
};

/**
 * method used to remove/split markup from a "markup2markup" selection
 * @param relevantMarkupObjectsAtSelectionStart JS Array of dom objects, which are parents to the rangeObject.startContainer
 * @param relevantMarkupObjectsAtSelectionEnd JS Array of dom objects, which are parents to the rangeObject.endContainer
 * @param rangeObj Aloha rangeObject
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @return true (always, since no "false" case is currently known...but might be added)
 * @hide
 */
GENTICS.Aloha.Selection.prototype.splitRelevantMarkupObject = function(relevantMarkupObjectsAtSelectionStart, relevantMarkupObjectsAtSelectionEnd, rangeObject, tagComparator) {
	// mark them to be deleted
	jQuery(relevantMarkupObjectsAtSelectionStart).addClass('preparedForRemoval');
	jQuery(relevantMarkupObjectsAtSelectionEnd).addClass('preparedForRemoval');
	
	// check if the rangeObject is identical with the relevantMarkupObjects (in this case the markup can simply be removed)
	if (this.areMarkupObjectsAsLongAsRangeObject(relevantMarkupObjectsAtSelectionStart, relevantMarkupObjectsAtSelectionEnd, rangeObject)) {
		return true;
	}

	// find intersection (this can always only be one dom element (namely the highest) because all others will be removed
	var relevantMarkupObjectAtSelectionStartAndEnd = this.intersectRelevantMarkupObjects(relevantMarkupObjectsAtSelectionStart, relevantMarkupObjectsAtSelectionEnd);
	
	if (relevantMarkupObjectAtSelectionStartAndEnd) {
		this.insertCroppedMarkups([relevantMarkupObjectAtSelectionStartAndEnd], rangeObject, false, tagComparator);
		this.insertCroppedMarkups([relevantMarkupObjectAtSelectionStartAndEnd], rangeObject, true, tagComparator);
	} else {
		this.insertCroppedMarkups(relevantMarkupObjectsAtSelectionStart, rangeObject, false, tagComparator);
		this.insertCroppedMarkups(relevantMarkupObjectsAtSelectionEnd, rangeObject, true, tagComparator);		
	}
	return true;
};

/**
 * method takes two arrays of bottom up dom objects, compares them and returns either the object closest to the root or false
 * @param relevantMarkupObjectsAtSelectionStart JS Array of dom objects
 * @param relevantMarkupObjectsAtSelectionEnd JS Array of dom objects
 * @return dom object closest to the root or false
 * @hide
 */
GENTICS.Aloha.Selection.prototype.intersectRelevantMarkupObjects = function(relevantMarkupObjectsAtSelectionStart, relevantMarkupObjectsAtSelectionEnd) {
	var intersection = false;
	if (!relevantMarkupObjectsAtSelectionStart || !relevantMarkupObjectsAtSelectionEnd) {
		return intersection; // we can only intersect, if we have to arrays!
	}
	for (var i = 0; i < relevantMarkupObjectsAtSelectionStart.length; i++) {
		var elStart = relevantMarkupObjectsAtSelectionStart[i];
		for (var j = 0; j < relevantMarkupObjectsAtSelectionEnd.length; j++) {
			var elEnd = relevantMarkupObjectsAtSelectionEnd[j];
			if (elStart === elEnd) {
				intersection = elStart;
			}
		}
	}
	return intersection;
};

/**
 * method used to add markup to a nonmarkup2markup selection
 * @param relevantMarkupObjects JS Array of dom objects effecting either the start or endContainer of a selection (which should be extended)
 * @param rangeObject Aloha rangeObject the markups should be extended to
 * @param startOrEnd boolean; defines, if the existing markups should be extended forwards or backwards (is propably redundant and could be found out by comparing start or end container with the markup array dom objects)
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @return true
 * @hide
 */
GENTICS.Aloha.Selection.prototype.extendExistingMarkupWithSelection = function(relevantMarkupObjects, rangeObject, startOrEnd, tagComparator) {
	if (!startOrEnd) { // = Start
		// start part of rangeObject should be used, therefor existing markups are cropped at the end
		var extendMarkupsAtStart = true;
	}
	if (startOrEnd) { // = End
		// end part of rangeObject should be used, therefor existing markups are cropped at start (beginning)
		var extendMarkupsAtEnd = true;
	}	
	var objects = [];
	for(var i = 0; i<relevantMarkupObjects.length; i++){
		objects[i] = new this.SelectionRange();
		el = relevantMarkupObjects[i];
		if (extendMarkupsAtEnd && !extendMarkupsAtStart) {
			objects[i].startContainer = rangeObject.startContainer; // jQuery(el).contents()[0];
			objects[i].startOffset = rangeObject.startOffset;
			textnodes = jQuery(el).textNodes(true);
			objects[i].endContainer = textnodes[ textnodes.length-1 ];
			objects[i].endOffset = textnodes[ textnodes.length-1 ].length;
			objects[i].update();
			this.applyMarkup(objects[i].getSelectionTree(), rangeObject, this.getClonedMarkup4Wrapping(el), tagComparator, {setRangeObject2NewMarkup: true});
		}
		if (!extendMarkupsAtEnd && extendMarkupsAtStart) {
			textnodes = jQuery(el).textNodes(true);
			objects[i].startContainer = textnodes[0]; // jQuery(el).contents()[0];
			objects[i].startOffset = 0;
			objects[i].endContainer = rangeObject.endContainer;
			objects[i].endOffset = rangeObject.endOffset;
			objects[i].update();
			this.applyMarkup(objects[i].getSelectionTree(), rangeObject, this.getClonedMarkup4Wrapping(el), tagComparator, {setRangeObject2NewMarkup: true});
		}		
	}
	return true;
};

/**
 * method creates an empty markup jQuery object from a dom object passed as paramter
 * @param domobj domobject to be cloned, cleaned and emptied
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @return jQuery wrapper object to be passed to e.g. this.applyMarkup(...)
 * @hide
 */
GENTICS.Aloha.Selection.prototype.getClonedMarkup4Wrapping = function(domobj) {
	var wrapper = jQuery(domobj).clone().removeClass('preparedForRemoval').empty();
	if (wrapper.attr('class').length == 0) {
		wrapper.removeAttr('class');
	}
	return wrapper;
};
/**
 * method used to subtract the range object from existing markup. in other words: certain markup is removed from the selections defined by the rangeObject
 * @param relevantMarkupObjects JS Array of dom objects effecting either the start or endContainer of a selection (which should be extended)
 * @param rangeObject Aloha rangeObject the markups should be removed from
 * @param startOrEnd boolean; defines, if the existing markups should be reduced at the beginning of the tag or at the end (is propably redundant and could be found out by comparing start or end container with the markup array dom objects)
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @return true
 * @hide
 */
GENTICS.Aloha.Selection.prototype.insertCroppedMarkups = function(relevantMarkupObjects, rangeObject, startOrEnd, tagComparator) {
	if (!startOrEnd) { // = Start
		// start part of rangeObject should be used, therefor existing markups are cropped at the end
		var cropMarkupsAtEnd = true;
	}
	if (startOrEnd) { // = End
		// end part of rangeObject should be used, therefor existing markups are cropped at start (beginning)
		var cropMarkupsAtStart = true;
	}	
	var objects = [];
	for(var i = 0; i<relevantMarkupObjects.length; i++){
		objects[i] = new this.SelectionRange();
		var el = relevantMarkupObjects[i];
		if (cropMarkupsAtEnd && !cropMarkupsAtStart) {
			var textNodes = jQuery(el).textNodes(true);
			objects[i].startContainer = textNodes[0];
			objects[i].startOffset = 0;
			// if the existing markup startContainer & startOffset are equal to the rangeObject startContainer and startOffset,
			// then markupobject does not have to be added again, because it would have no content (zero-length)
			if (objects[i].startContainer === rangeObject.startContainer && objects[i].startOffset === rangeObject.startOffset) {
				continue;
			}
			if (rangeObject.startOffset == 0) {
				objects[i].endContainer = this.getTextNodeSibling(false, el, rangeObject.startContainer);
				objects[i].endOffset = objects[i].endContainer.length;
			} else {
				objects[i].endContainer = rangeObject.startContainer;
				objects[i].endOffset = rangeObject.startOffset;				
			}
			
			objects[i].update();

			this.applyMarkup(objects[i].getSelectionTree(), rangeObject, this.getClonedMarkup4Wrapping(el), tagComparator, {setRangeObject2NextSibling: true}); 
		}

		if (!cropMarkupsAtEnd && cropMarkupsAtStart) {
			objects[i].startContainer = rangeObject.endContainer; // jQuery(el).contents()[0];
			objects[i].startOffset = rangeObject.endOffset;
			textnodes = jQuery(el).textNodes(true);
			objects[i].endContainer = textnodes[ textnodes.length-1 ];
			objects[i].endOffset = textnodes[ textnodes.length-1 ].length;
			objects[i].update();
			this.applyMarkup(objects[i].getSelectionTree(), rangeObject, this.getClonedMarkup4Wrapping(el), tagComparator, {setRangeObject2PreviousSibling: true});
		}
	}
	return true;
};

/**
 * apply a certain markup to the current selection
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.changeMarkupOnSelection = function(markupObject) {
	// change the markup
	this.changeMarkup(this.getRangeObject(), markupObject, this.getStandardTagComparator(markupObject));

	// merge text nodes
	GENTICS.Utils.Dom.doCleanup({'mergetext' : true}, this.rangeObject);
	// update the range and select it
	this.rangeObject.update();
	this.rangeObject.select();
};

/**
 * apply a certain markup to the selection Tree
 * @param selectionTree SelectionTree Object markup should be applied to
 * @param rangeObject Aloha rangeObject which will be modified to reflect the dom changes, after the the markup was applied (only if activated via options)
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @param options JS object, with the following boolean properties: setRangeObject2NewMarkup, setRangeObject2NextSibling, setRangeObject2PreviousSibling
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.applyMarkup = function(selectionTree, rangeObject, markupObject, tagComparator, options) {
	options = options ? options : new Object();
	// first same tags from within fully selected nodes for removal
	this.prepareForRemoval(selectionTree, markupObject, tagComparator);
	
	// first let's optimize the selection Tree in useful groups which can be wrapped together
	var optimizedSelectionTree = this.optimizeSelectionTree4Markup(selectionTree, markupObject, tagComparator);
	breakpoint = true;
	
	// now iterate over grouped elements and either recursively dive into object or wrap it as a whole
	for (var i = 0; i < optimizedSelectionTree.length; i++) {
		var el = optimizedSelectionTree[i];
		if (el.wrappable) {
			this.wrapMarkupAroundSelectionTree(el.elements, rangeObject, markupObject, tagComparator, options);
		} else {
			GENTICS.Aloha.Log.debug(this,'dive further into non-wrappable object');
			this.applyMarkup(el.element.children, rangeObject, markupObject, tagComparator, options);
		}
	}

};

/**
 * returns the type of the given markup (trying to match HTML5)
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @return string name of the markup type
 * @hide
 */
GENTICS.Aloha.Selection.prototype.getMarkupType = function(markupObject) {
	var nn = jQuery(markupObject)[0].nodeName.toLowerCase();
	if (markupObject.outerHTML) {
		GENTICS.Aloha.Log.debug(this, 'Node name detected: ' + nn + ' for: ' + markupObject.outerHTML());
	}
	if (nn == '#text') {return 'textNode';}
	if (this.replacingElements[ nn ]) {return 'sectionOrGroupingContent';}
	if (this.tagHierarchy [ nn ]) {return 'textLevelSemantics';}
	GENTICS.Aloha.Log.warn(this, 'unknown markup passed to this.getMarkupType(...): ' + markupObject.outerHTML());
};

/**
 * returns the standard tag comparator for the given markup object
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @return function tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @hide
 */
GENTICS.Aloha.Selection.prototype.getStandardTagComparator = function(markupObject) {
	var that = this;
	switch(this.getMarkupType(markupObject)) {
	case 'textNode':
		return function(p1, p2) {return false;};
		break;
	
	case 'sectionOrGroupingContent':
		return function(domobj, markupObject) {
			return that.standardSectionsAndGroupingContentComparator(domobj, markupObject);
		};
		break;
		
	case 'textLevelSemantics':
	default: 
		return function(domobj, markupObject) {
			return that.standardTextLevelSemanticsComparator(domobj, markupObject);
		};
	}
};

/**
 * searches for fully selected equal markup tags
 * @param selectionTree SelectionTree Object markup should be applied to
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.prepareForRemoval = function(selectionTree, markupObject, tagComparator) {
	var that = this;
	// check if a comparison method was passed as parameter ...
	if (typeof tagComparator !== 'undefined' && typeof tagComparator !== 'function') {
		GENTICS.Aloha.Log.error(this,'parameter tagComparator is not a function');		
	}
	// ... if not use this as standard tag comparison method
	if (typeof tagComparator === 'undefined') {
		tagComparator = this.getStandardTagComparator(markupObject);
	}
	for (var i = 0; i<selectionTree.length; i++) {
		var el = selectionTree[i];
		if (el.domobj && (el.selection == 'full' || (el.selection == 'partial' && markupObject.isReplacingElement))) {
			// mark for removal
			if (el.domobj.nodeType === 1 && tagComparator(el.domobj, markupObject)) {
				GENTICS.Aloha.Log.debug(this, 'Marking for removal: ' + el.domobj.nodeName);
				jQuery(el.domobj).addClass('preparedForRemoval');
			}
		}
		if (el.selection != 'none' && el.children.length > 0) {
			this.prepareForRemoval(el.children, markupObject, tagComparator);
		}
		
	}
};

/**
 * searches for fully selected equal markup tags
 * @param selectionTree SelectionTree Object markup should be applied to
 * @param rangeObject Aloha rangeObject the markup will be applied to
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @param tagComparator method, which is used to compare the dom object and the jQuery markup object. the method must accept 2 parameters, the first is the domobj, the second is the jquery object. if no method is specified, the method this.standardTextLevelSemanticsComparator is used
 * @param options JS object, with the following boolean properties: setRangeObject2NewMarkup, setRangeObject2NextSibling, setRangeObject2PreviousSibling
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.wrapMarkupAroundSelectionTree = function(selectionTree, rangeObject, markupObject, tagComparator, options) {
	// first let's find out if theoretically the whole selection can be wrapped with one tag and save it for later use
	var objects2wrap = new Array; // // this will be used later to collect objects
	var j = -1; // internal counter

	GENTICS.Aloha.Log.debug(this,'The formatting <' + markupObject[0].tagName + '> will be wrapped around the selection');
	
	var preText = '';
	var postText = '';

	// now lets iterate over the elements
	for (var i = 0; i < selectionTree.length; i++) {
		var el = selectionTree[i];
		
		// check if markup is allowed inside the elements parent
		if (el.domobj && !this.canTag1WrapTag2(el.domobj.parentNode.tagName.toLowerCase(), markupObject[0].tagName.toLowerCase())) {
			GENTICS.Aloha.Log.info(this,'Skipping the wrapping of <' + markupObject[0].tagName.toLowerCase() + '> because this tag is not allowed inside <' + el.domobj.parentNode.tagName.toLowerCase() + '>');
			continue;
		}

		// skip empty text nodes
		if (el.domobj && el.domobj.nodeType == 3 && jQuery.trim(jQuery(el.domobj).outerHTML()).length == 0) {
			continue;
		}

		// partial element, can either be a textnode and therefore be wrapped (at least partially)
		// or can be a nodeType == 1 (tag) which must be dived into
		if (el.domobj && el.selection == 'partial' && !markupObject.isReplacingElement) {
			if (el.startOffset !== undefined && el.endOffset === undefined) {
				j++;
				preText += el.domobj.data.substr(0,el.startOffset);
				el.domobj.data = el.domobj.data.substr(el.startOffset, el.domobj.data.length-el.startOffset);
				objects2wrap[j] = el.domobj;
			} else if (el.endOffset !== undefined && el.startOffset === undefined) {
				j++;
				postText += el.domobj.data.substr(el.endOffset, el.domobj.data.length-el.endOffset);
				el.domobj.data = el.domobj.data.substr(0, el.endOffset);
				objects2wrap[j] = el.domobj;
			} else if (el.endOffset !== undefined && el.startOffset !== undefined) {
				if (el.startOffset == el.endOffset) { // do not wrap empty selections
					GENTICS.Aloha.Log.debug(this, 'skipping empty selection');
					continue;
				}
				j++;
				preText += el.domobj.data.substr(0,el.startOffset);
				var middleText = el.domobj.data.substr(el.startOffset,el.endOffset-el.startOffset);
				postText += el.domobj.data.substr(el.endOffset, el.domobj.data.length-el.endOffset);
				el.domobj.data = middleText;
				objects2wrap[j] = el.domobj;
			} else {
				// a partially selected item without selectionStart/EndOffset is a nodeType 1 Element on the way to the textnode
				GENTICS.Aloha.Log.debug(this, 'diving into object');
				this.applyMarkup(el.children, rangeObject, markupObject, tagComparator, options);
			}
		}
		// fully selected dom elements can be wrapped as whole element
		if (el.domobj && (el.selection == 'full' || (el.selection == 'partial' && markupObject.isReplacingElement))) {
			j++;
			objects2wrap[j] = el.domobj;
		}
	}
	breakpoint = true;
	if (objects2wrap.length > 0) {
		// wrap collected DOM object with markupObject
		objects2wrap = jQuery(objects2wrap);

		// make a fix for text nodes in <li>'s in ie
		jQuery.each(objects2wrap, function(index, element) {
			if (jQuery.browser.msie && element.nodeType == 3
					&& !element.nextSibling && !element.previousSibling
					&& element.parentNode
					&& element.parentNode.nodeName.toLowerCase() == 'li') {
				element.data = jQuery.trim(element.data);
			}
		});

		var newMarkup = objects2wrap.wrapAll(markupObject).parent();
		newMarkup.before(preText).after(postText);
		var breakpoint = true;
		
		if (options.setRangeObject2NewMarkup) { // this is used, when markup is added to normal/normal Text
			var textnodes = objects2wrap.textNodes();
			
			if (textnodes.index(rangeObject.startContainer) != -1) {
				rangeObject.startOffset = 0;
			}
			if (textnodes.index(rangeObject.endContainer) != -1) {
				rangeObject.endOffset = rangeObject.endContainer.length;
			}			

			var breakpoint=true;
		}
		if (options.setRangeObject2NextSibling){
			var prevOrNext = true;
			var textNode2Start = newMarkup.textNodes(true).last()[0];
			if (objects2wrap.index(rangeObject.startContainer) != -1) {
				rangeObject.startContainer = this.getTextNodeSibling(prevOrNext, newMarkup.parent(), textNode2Start);
				rangeObject.startOffset = 0;				
			}
			if (objects2wrap.index(rangeObject.endContainer) != -1) {
				rangeObject.endContainer = this.getTextNodeSibling(prevOrNext, newMarkup.parent(), textNode2Start);
				rangeObject.endOffset = rangeObject.endOffset - textNode2Start.length;
			}
		}
		if (options.setRangeObject2PreviousSibling){
			var prevOrNext = false;
			var textNode2Start = newMarkup.textNodes(true).first()[0];
			if (objects2wrap.index(rangeObject.startContainer) != -1) {
				rangeObject.startContainer = this.getTextNodeSibling(prevOrNext, newMarkup.parent(), textNode2Start);
				rangeObject.startOffset = 0;				
			}
			if (objects2wrap.index(rangeObject.endContainer) != -1) {
				rangeObject.endContainer = this.getTextNodeSibling(prevOrNext, newMarkup.parent(), textNode2Start);
				rangeObject.endOffset = rangeObject.endContainer.length;
			}
		}		
	}
};

/**
 * takes a text node and return either the next recursive text node sibling or the previous
 * @param previousOrNext boolean, false for previous, true for next sibling
 * @param commonAncestorContainer dom object to be used as root for the sibling search
 * @param currentTextNode dom object of the originating text node
 * @return dom object of the sibling text node
 * @hide
 */
GENTICS.Aloha.Selection.prototype.getTextNodeSibling = function(previousOrNext, commonAncestorContainer, currentTextNode) {
	var textNodes = jQuery(commonAncestorContainer).textNodes(true);
	index = textNodes.index(currentTextNode);
	if (index == -1) { // currentTextNode was not found
		return false;
	}
	var newIndex = index + (!previousOrNext ? -1 : 1);
	return textNodes[newIndex] ? textNodes[newIndex] : false;
};

/**
 * takes a selection tree and groups it into markup wrappable selection trees
 * @param selectionTree rangeObject selection tree
 * @param markupObject jQuery object of the markup to be applied (e.g. created with obj = jQuery('<b></b>'); )
 * @return JS array of wrappable selection trees
 * @hide
 */
GENTICS.Aloha.Selection.prototype.optimizeSelectionTree4Markup = function(selectionTree, markupObject, tagComparator) {
	var groupMap = [];
	var outerGroupIndex = 0;
	var innerGroupIndex = 0;
	var that = this;
	if (typeof tagComparator === 'undefined') {
		tagComparator = function(domobj, markupObject) {
			return that.standardTextLevelSemanticsComparator(markupObject);
		};
	}	
	for(var i = 0; i<selectionTree.length; i++) {
		// we are just interested in selected item, but not in non-selected items
		if (selectionTree[i].domobj && selectionTree[i].selection != 'none') {
			if (markupObject.isReplacingElement && tagComparator(markupObject[0], jQuery(selectionTree[i].domobj))) {
				if (groupMap[outerGroupIndex] !== undefined) {
					outerGroupIndex++;
				}
				groupMap[outerGroupIndex] = new Object();
				groupMap[outerGroupIndex].wrappable = true;
				groupMap[outerGroupIndex].elements = new Array();
				groupMap[outerGroupIndex].elements[innerGroupIndex] = selectionTree[i];				
				outerGroupIndex++;
			
			} else 
			// now check, if the children of our item could be wrapped all together by the markup object	
			if (this.canMarkupBeApplied2ElementAsWhole([ selectionTree[i] ], markupObject)) {
				// if yes, add it to the current group
				if (groupMap[outerGroupIndex] === undefined) {
					groupMap[outerGroupIndex] = new Object();
					groupMap[outerGroupIndex].wrappable = true;
					groupMap[outerGroupIndex].elements = new Array();
				}
				if (markupObject.isReplacingElement) { //  && selectionTree[i].domobj.nodeType === 3	
					/* we found the node to wrap for a replacing element. however there might 
					 * be siblings which should be included as well
					 * although they are actually not selected. example:
					 * li
					 * |-textNode ( .selection = 'none')
					 * |-textNode (cursor inside, therefor .selection = 'partial')
					 * |-textNode ( .selection = 'none')
					 * 
					 * in this case it would be useful to select the previous and following textNodes as well (they might result from a previous DOM manipulation)
					 * Think about other cases, where the parent is the Editable. In this case we propably only want to select from and until the next <br /> ??
					 * .... many possibilities, here I realize the two described cases
					 */

					// first find start element starting from the current element going backwards until sibling 0
					var startPosition = i;
					for (var j = i-1; j >= 0; j--) {
						if (this.canMarkupBeApplied2ElementAsWhole([ selectionTree[ j ] ], markupObject) && this.isMarkupAllowedToStealSelectionTreeElement(selectionTree[ j ], markupObject)) {
							startPosition = j;
						} else {
							break;
						}
					}
					
					// now find the end element starting from the current element going forward until the last sibling
					var endPosition = i;
					for (var j = i+1; j < selectionTree.length; j++) {
						if (this.canMarkupBeApplied2ElementAsWhole([ selectionTree[ j ] ], markupObject) && this.isMarkupAllowedToStealSelectionTreeElement(selectionTree[ j ], markupObject)) {
							endPosition = j;
						} else {
							break;
						}
					}
					
					// now add the elements to the groupMap
					innerGroupIndex = 0;
					for (var j = startPosition; j <= endPosition; j++) {
						groupMap[outerGroupIndex].elements[innerGroupIndex]	= selectionTree[j];
						groupMap[outerGroupIndex].elements[innerGroupIndex].selection = 'full';
						innerGroupIndex++;
					}
					innerGroupIndex = 0;
				} else {
					// normal text level semantics object, no siblings need to be selected
					groupMap[outerGroupIndex].elements[innerGroupIndex] = selectionTree[i];
					innerGroupIndex++;
				}
			} else {
				// if no, isolate it in its own group
				if (groupMap[outerGroupIndex] !== undefined) {
					outerGroupIndex++;
				}
				groupMap[outerGroupIndex] = new Object();
				groupMap[outerGroupIndex].wrappable = false;
				groupMap[outerGroupIndex].element = selectionTree[i];
				innerGroupIndex = 0;
				outerGroupIndex++;
			}
		}
	}
	return groupMap;
};

/**
 * very tricky method, which decides, if a certain markup (normally a replacing markup element like p, h1, blockquote)
 * is allowed to extend the user selection to other dom objects (represented as selectionTreeElement)
 * to understand the purpose: if the user selection is collapsed inside e.g. some text, which is currently not
 * wrapped by the markup to be applied, and therefor the markup does not have an equal markup to replace, then the DOM
 * manipulator has to decide which objects to wrap. real example: 
 * <div>
 * 	<h1>headline</h1>
 * 	some text blabla bla<br>
 * 	more text HERE THE | CURSOR BLINKING and <b>even more bold text</b>
 * </div>
 * when the user now wants to apply e.g. a <p> tag, what will be wrapped? it could be useful if the manipulator would actually
 * wrap everything inside the div except the <h1>. but for this purpose someone has to decide, if the markup is 
 * allowed to wrap certain dom elements in this case the question would be, if the <p> is allowed to wrap 
 * textNodes, <br> and <b> and <h1>. therefore this tricky method should answer the question for those 3 elements 
 * with true, but for for the <h1> it should return false. and since the method does not know this, there is a configuration
 * for this
 * 
 * @param selectionTree rangeObject selection tree element (only one, not an array of)
 * @param markupObject lowercase string of the tag to be verified (e.g. "b")
 * @return true if the markup is allowed to wrap the selection tree element, false otherwise
 * @hide
 */
GENTICS.Aloha.Selection.prototype.isMarkupAllowedToStealSelectionTreeElement = function(selectionTreeElement, markupObject) {
	if (!selectionTreeElement.domobj) {
		return false;
	}
	var nodeName = selectionTreeElement.domobj.nodeName.toLowerCase();
	nodeName = (nodeName == '#text') ? 'textNode' : nodeName;
	var markupName = markupObject[0].nodeName.toLowerCase();
	// if nothing is defined for the markup, it's now allowed
	if (!this.allowedToStealElements[ markupName ]) {
		return false;
	}
	// if something is defined, but the specifig tag is not in the list
	if (this.allowedToStealElements[ markupName ].indexOf(nodeName) == -1) {
		return false;
	}
	return true;
};

/**
 * checks if a selection can be completey wrapped by a certain html tags (helper method for this.optimizeSelectionTree4Markup
 * @param selectionTree rangeObject selection tree
 * @param markupObject lowercase string of the tag to be verified (e.g. "b")
 * @return true if selection can be applied as whole, false otherwise
 * @hide
 */
GENTICS.Aloha.Selection.prototype.canMarkupBeApplied2ElementAsWhole = function(selectionTree, markupObject) {
	if (markupObject.jquery) htmlTag = markupObject[0].tagName;
	if (markupObject.tagName) htmlTag = markupObject.tagName;	
	
	returnVal = true;
	for (var i = 0; i < selectionTree.length; i++) {
		var el = selectionTree[i];
		if (el.domobj && (el.selection != "none" || markupObject.isReplacingElement)) {
			// GENTICS.Aloha.Log.debug(this, 'Checking, if  <' + htmlTag + '> can be applied to ' + el.domobj.nodeName);
			if (!this.canTag1WrapTag2(htmlTag, el.domobj.nodeName)) {
				return false;
			}
			if (el.children.length > 0 && !this.canMarkupBeApplied2ElementAsWhole(el.children, markupObject)) {
				return false;
			}
		}
	}
	return returnVal;
};

/**
 * checks if a tag 1 (first parameter) can wrap tag 2 (second parameter).
 * IMPORTANT: the method does not verify, if there have to be other tags in between
 * Example: this.canTag1WrapTag2("table", "td") will return true, because the method does not take into account, that there has to be a "tr" in between
 * @param t1 string: tagname of outer tag to verify, e.g. "b"
 * @param t2 string: tagname of inner tag to verify, e.g. "b"
 * @return true if tag 1 can wrap tag 2, false otherwise
 * @hide
 */
GENTICS.Aloha.Selection.prototype.canTag1WrapTag2 = function(t1, t2) {
	t1 = (t1 == '#text')?'textNode':t1.toLowerCase();
	t2 = (t2 == '#text')?'textNode':t2.toLowerCase();
	if (!this.tagHierarchy[ t1 ]) {
		// GENTICS.Aloha.Log.warn(this, t1 + ' is an unknown tag to the method canTag1WrapTag2 (paramter 1). Sadfully allowing the wrapping...');
		return true;
	}
	if (!this.tagHierarchy[ t2 ]) { 
		// GENTICS.Aloha.Log.warn(this, t2 + ' is an unknown tag to the method canTag1WrapTag2 (paramter 2). Sadfully allowing the wrapping...');
		return true;
	}
	var t1Array = this.tagHierarchy[ t1 ];
	var returnVal = (t1Array.indexOf( t2 ) != -1) ? true : false;
	return returnVal;	
};

/**
 * Check whether it is allowed to insert the given tag at the start of the
 * current selection. This method will check whether the markup effective for
 * the start and outside of the editable part (starting with the editable tag
 * itself) may wrap the given tag.
 * @param tagName {String} name of the tag which shall be inserted
 * @return true when it is allowed to insert that tag, false if not
 * @hide
 */
GENTICS.Aloha.Selection.prototype.mayInsertTag = function (tagName) {
	if (typeof this.rangeObject.unmodifiableMarkupAtStart == 'object') {
		// iterate over all DOM elements outside of the editable part
		for (var i = 0; i < this.rangeObject.unmodifiableMarkupAtStart.length; ++i) {
			// check whether an element may not wrap the given
			if (!this.canTag1WrapTag2(this.rangeObject.unmodifiableMarkupAtStart[i].nodeName, tagName)) {
				// found a DOM element which forbids to insert the given tag, we are done
				return false;
			}
		}

		// all of the found DOM elements allow inserting the given tag
		return true;
	} else {
		GENTICS.Aloha.Log.warn(this, 'Unable to determine whether tag ' + tagName + ' may be inserted');
		return true;
	}
};

/**
 * String representation
 * @return "GENTICS.Aloha.Selection"
 * @hide
 */
GENTICS.Aloha.Selection.prototype.toString = function() {  
	return 'GENTICS.Aloha.Selection';
};

/**
 * @namespace GENTICS.Aloha.Selection
 * @class SelectionRange
 * @extends GENTICS.Utils.RangeObject
 * Constructor for a range object.
 * Optionally you can pass in a range object that's properties will be assigned to the new range object.
 * @param rangeObject A range object thats properties will be assigned to the new range object. 
 * @constructor
 */
GENTICS.Aloha.Selection.prototype.SelectionRange = function(rangeObject) {
	// Call the super constructor
	GENTICS.Utils.RangeObject.apply(this, arguments);
	
	/**
	 * DOM object of the common ancestor from startContainer and endContainer
	 * @hide
	 */
	this.commonAncestorContainer;

	/**
	 * The selection tree
	 * @hide
	 */
	this.selectionTree;

	/**
	 * Array of DOM objects effective for the start container and inside the
	 * editable part (inside the limit object). relevant for the button status
	 * @hide
	 */
	this.markupEffectiveAtStart = [];

	/**
	 * Array of DOM objects effective for the start container, which lies
	 * outside of the editable portion (starting with the limit object)
	 * @hide
	 */
	this.unmodifiableMarkupAtStart = [];

	/**
	 * DOM object being the limit for all markup relevant activities
	 * @hide
	 */
	this.limitObject;
		
	/**
	 * DOM object being split when enter key gets hit
	 * @hide
	 */
	this.splitObject;
	
	// If a range object was passed in we apply the values to the new range object
	if (rangeObject) {
		if (rangeObject.commonAncestorContainer) {
			this.commonAncestorContainer = rangeObject.commonAncestorContainer;
		}
		if (rangeObject.selectionTree) {
			this.selectionTree = rangeObject.selectionTree;
		}
		if (rangeObject.limitObject) {
			this.limitObject = rangeObject.limitObject;
		}
		if (rangeObject.markupEffectiveAtStart) {
			this.markupEffectiveAtStart = rangeObject.markupEffectiveAtStart;			
		}
		if (rangeObject.unmodifiableMarkupAtStart) {
			this.unmodifiableMarkupAtStart = rangeObject.unmodifiableMarkupAtStart;
		}
		if (rangeObject.splitObject) {
			this.splitObject = rangeObject.splitObject;			
		}
	}
};

// Inherit all methods and properties from GENTICS.Utils.RangeObject
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype = new GENTICS.Utils.RangeObject();

/**
 * Sets the visible selection in the Browser based on the range object.
 * If the selection is collapsed, this will result in a blinking cursor, 
 * otherwise in a text selection.
 * @method
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.select = function() {
	// Call Utils' select()
	GENTICS.Utils.RangeObject.prototype.select.apply(this, arguments);

	// update the selection
	GENTICS.Aloha.Selection.updateSelection();
};

/**
 * Method to update a range object internally
 * @param commonAncestorContainer (DOM Object); optional Parameter; if set, the parameter 
 * will be used instead of the automatically calculated CAC
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.update = function(commonAncestorContainer) {
	this.updatelimitObject();
	this.updateMarkupEffectiveAtStart();
	this.updateCommonAncestorContainer(commonAncestorContainer);

	// reset the selectiontree (must be recalculated)
	this.selectionTree = undefined;
};

/**
 * Get the selection tree for this range
 * TODO: remove this (was moved to range.js)
 * @return selection tree
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.getSelectionTree = function () {
	// if not yet calculated, do this now
	if (!this.selectionTree) {
		this.selectionTree = GENTICS.Aloha.Selection.getSelectionTree(this);
	}

	return this.selectionTree;
};

/**
 * TODO: move this to range.js
 * Get an array of domobj (in dom tree order) of siblings of the given domobj, which are contained in the selection
 * @param domobj dom object to start with
 * @return array of siblings of the given domobj, which are also selected
 * @hide 
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.getSelectedSiblings = function (domobj) {
	var selectionTree = this.getSelectionTree();

	return this.recursionGetSelectedSiblings(domobj, selectionTree);
};

/**
 * TODO: move this to range.js
 * Recursive method to find the selected siblings of the given domobj (which should be selected as well)
 * @param domobj dom object for which the selected siblings shall be found
 * @param selectionTree current level of the selection tree
 * @return array of selected siblings of dom objects or false if none found
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.recursionGetSelectedSiblings = function (domobj, selectionTree) {
	var selectedSiblings = false;
	var foundObj = false;

	for (var i = 0; i < selectionTree.length; ++i) {
		if (selectionTree[i].domobj === domobj) {
			foundObj = true;
			selectedSiblings = [];
		} else if (!foundObj && selectionTree[i].children) {
			// do the recursion
			selectedSiblings = this.recursionGetSelectedSiblings(domobj, selectionTree[i].children);
			if (selectedSiblings !== false) {
				break;
			}
		} else if (foundObj && selectionTree[i].domobj && selectionTree[i].selection != 'collapsed' && selectionTree[i].selection != 'none') {
			selectedSiblings.push(selectionTree[i].domobj);
		} else if (foundObj && selectionTree[i].selection == 'none') {
			break;
		}
	}

	return selectedSiblings;
};

/**
 * TODO: move this to range.js
 * Method updates member var markupEffectiveAtStart and splitObject, which is relevant primarily for button status and enter key behaviour
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.updateMarkupEffectiveAtStart = function() {
	// reset the current markup
	this.markupEffectiveAtStart = [];
	this.unmodifiableMarkupAtStart = [];

	var parents = this.getStartContainerParents();
	var limitFound = false;
	for (var i = 0; i < parents.length; i++) {
		var el = parents[i];
		if (!limitFound && (el !== this.limitObject)) {
			this.markupEffectiveAtStart[ i ] = el;
			if (!splitObjectWasSet && GENTICS.Utils.Dom.isSplitObject(el)) {
				var splitObjectWasSet = true;
				this.splitObject = el;
			}
		} else {
			limitFound = true;
			this.unmodifiableMarkupAtStart.push(el);
		}
	}
	if (!splitObjectWasSet) {
		this.splitObject = false;
	}
	return;
};

/**
 * TODO: remove this
 * Method updates member var markupEffectiveAtStart, which is relevant primarily for button status
 * @return void
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.updatelimitObject = function() {
	if (GENTICS.Aloha.editables && GENTICS.Aloha.editables.length > 0) {
		var parents = this.getStartContainerParents();
		var editables = GENTICS.Aloha.editables;
		for (var i = 0; i < parents.length; i++) {
			var el = parents[i];
			for (var j = 0; j < editables.length; j++) {
				var editable = editables[j].obj[0];
				if (el === editable) {
					this.limitObject = el;
					return true;
				}
			}
		}
	}
	this.limitObject = document.body;
	return true;
};

/**
 * string representation of the range object
 * @param	verbose	set to true for verbose output
 * @return string representation of the range object
 * @hide
 */
GENTICS.Aloha.Selection.prototype.SelectionRange.prototype.toString = function(verbose) {
	if (!verbose) {
		return 'GENTICS.Aloha.Selection.SelectionRange';
	}
	return 'GENTICS.Aloha.Selection.SelectionRange {start [' + this.startContainer.nodeValue + '] offset ' 
		+ this.startOffset + ', end [' + this.endContainer.nodeValue + '] offset ' + this.endOffset + '}';
};

GENTICS.Aloha.Selection = new GENTICS.Aloha.Selection();
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Abstract Sidebar
 */
GENTICS.Aloha.Sidebar = function () {};

/**
 * Add a panel to this sidebar
 * @param panel panel to add to this sidebar
 * @return void
 */
GENTICS.Aloha.Sidebar.prototype.add = function(panel) {};

/**
 * Render this sidebar
 * @return HTML Code of the rendered sidebar
 */
GENTICS.Aloha.Sidebar.prototype.render = function() {};

/**
 * Open the given panel in the sidebar and close all other (not pinned) panels
 * @param panel panel to open
 * @return void
 */
GENTICS.Aloha.Sidebar.prototype.openPanel = function(panel) {};

/**
 * Close the given panel in the sidebar
 * @param panel panel to close
 * @return void
 */
GENTICS.Aloha.Sidebar.prototype.closePanel = function(panel) {};

/**
 * Toggle the "pinned" status of the panel
 * @param panel panel to pin/unpin
 * @return void
 */
GENTICS.Aloha.Sidebar.prototype.togglePinPanel = function(panel) {};

/**
 * Right Sidebar
 */
// GENTICS.Aloha.SidebarRight = function () {};
GENTICS.Aloha.SidebarRight = new GENTICS.Aloha.Sidebar();

/**
 * Left Sidebar
 */
// GENTICS.Aloha.SidebarLeft = function () {};
GENTICS.Aloha.SidebarLeft = new GENTICS.Aloha.Sidebar();


//################### Aloha Sidebar Panels ######################

/**
 * Abstract Sidebar Panel
 */
GENTICS.Aloha.Sidebar.Panel = function () {};

/**
 * Render this panel
 * @return HTML Code of the rendered panel
 */
GENTICS.Aloha.Sidebar.Panel.prototype.render = function() {};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Repository Manager
 * @namespace GENTICS.Aloha
 * @class RepositoryManager
 * @singleton
 */
GENTICS.Aloha.RepositoryManager = function() {
	this.repositories = new Array();
};


GENTICS.Aloha.RepositoryManager.prototype.openCallbacks = [];

/**
 * Initialize all registered repositories
 * @return void
 * @hide
 */
GENTICS.Aloha.RepositoryManager.prototype.init = function() {
	
	// get the repository settings
	if (GENTICS.Aloha.settings.repositories == undefined) {
		GENTICS.Aloha.settings.repositories = {};
	}

	// iterate through all registered repositories
	for ( var i = 0; i < this.repositories.length; i++) {
		var repository = this.repositories[i];
		
		if (repository.settings == undefined) {
			repository.settings = {};
		}
		
		// merge the specific settings with the repository default settings
		if ( GENTICS.Aloha.settings.repositories[repository.repositoryId] ) {
			jQuery.extend(repository.settings, GENTICS.Aloha.settings.repositories[repository.repositoryId]);
		}
		
		repository.init();
	}
};

/**
 * Register a Repository
 * @param {GENTICS.Aloha.Repository} repository Repository to register
 */

GENTICS.Aloha.RepositoryManager.prototype.register = function(repository) {
	
	if (repository instanceof GENTICS.Aloha.Repository) {
		if ( !this.getRepository(repository.repositoryId) ) {
			this.repositories.push(repository); 
		} else {
			GENTICS.Aloha.Log.warn(this, "A repository with name { " + repository.repositoryId+ " } already registerd. Ignoring this.");
		}
	} else {
		GENTICS.Aloha.Log.error(this, "Trying to register a repository which is not an instance of GENTICS.Aloha.Repository.");
	}
	
};

/**
 * Returns a repository object identified by repositoryId.
 * @param {String} repositoryId the name of the repository
 * @return {GENTICS.Aloha.Repository} a repository or null if name not found
 */
GENTICS.Aloha.RepositoryManager.prototype.getRepository = function(repositoryId) {
	
	for ( var i = 0; i < this.repositories.length; i++) {
		if ( this.repositories[i].repositoryId == repositoryId ) {
			return this.repositories[i];
		}
	}
	return null;
};

/** 
 * Searches a all repositories for repositoryObjects matching query and repositoryObjectType
 * @param {String} query the query string passed to the repository
 * @param {Array} objectTypeFilter an array of strings with searched objectTypeFilter
 * @param {function} callback defines an callback function( repositoryResult ) which will be called after a time out of 5sec or when all repositories returned their result
 * @return {Array} Array of Items
 */
GENTICS.Aloha.RepositoryManager.prototype.query = function( params, callback ) {
	
	var that = this;
	var allitems = [];
	var repositories = [];

	// reset callback queue
	this.openCallbacks = [];
	
	// start timer in case a repository does not deliver in time
	var timer = setTimeout( function() {
		// reset callback stack
		that.openCallbacks = [];
		that.queryCallback(callback, allitems, timer);
	}, 5000);

	// only query the repositoryId for Children Elements
	if ( params.repositoryId ) {
		repositories.push(this.getRepository(params.repositoryId));
	} else {
		repositories = this.repositories;
	}

	// iterate through all registered repositories
	for ( var i = 0; i < repositories.length; i++) {
		
		this.openCallbacks.push(repositories[i].repositoryId);
		
        try {
        	
			var notImplemented = repositories[i].query( params, function (items) {
			    
				// remove the repository from the callback stack
				var id = that.openCallbacks.indexOf( this.repositoryId );
				if (id != -1) {
					that.openCallbacks.splice(id, 1); 
				}
				
				// mark with repositoryId if not done by repository plugin
				if ( !items.length == 0 && !items[0].repositoryId ) {
					for ( var j = 0; j < items.length; j++) {
						items[j].repositoryId = this.repositoryId;
					}
				}
				
				// merge new items with the rest
				jQuery.merge( allitems, items ); 
	
				that.queryCallback(callback, allitems, timer);
			});
			
        } catch (e) {
//          this.fireEvent('exception', this, 'response', action, arg, null, e);
//          return false;
        	notImplemented = true;
        }
		
		// remove this repository from the callback stack
		if ( notImplemented ) {
			var id = that.openCallbacks.indexOf( repositories[i].repositoryId );
			if (id != -1) {
				this.openCallbacks.splice(id, 1);
				if ( i == repositories.length - 1 ) {
					this.queryCallback(callback, allitems, timer);
				}
			}
		}
	}
};

/**
 * checks if all repositories returned  and calls the callback
 * @return void
 * @hide
 */
GENTICS.Aloha.RepositoryManager.prototype.queryCallback = function (cb, items, timer) {

	// if we all callbacks came back we are done!
	if (this.openCallbacks.length == 0) {
		
		// unset the timer...
		clearTimeout(timer);
		
		// sort items by weight
		items.sort(function (a,b) {return b.weight - a.weight;});
	    
		// prepare result data for the JSON Reader
		var result =  {
			    results: items.length,
			    items: items
		 	 };
		
		// Give data back.
		cb.call( this, result);
	}
};

/**
 * Returns children items.
 */
GENTICS.Aloha.RepositoryManager.prototype.getChildren = function ( params, callback ) {

	var that = this;
	var allitems = [];
	var repositories = [];

	// reset callback queue
	this.openChildrenCallbacks = [];

	// return repositories
	if ( params.inFolderId == 'aloha' && this.repositories.length > 0 ) {
		var repos = [];
		for ( var i = 0; i < this.repositories.length; i++) {
			repos.push( new GENTICS.Aloha.Repository.Folder ({
				id: this.repositories[i].repositoryId,
				name: this.repositories[i].repositoryName,
				repositoryId: this.repositories[i].repositoryId,
				type: 'repository',
				hasMoreItems: true
			}));
		}
		that.getChildrenCallback(callback, repos, null);
		return;
	}
	
	// start timer in case a repository does not deliver in time
	var timer = setTimeout( function() {
		// reset callback stack
		that.openChildrenCallbacks = [];
		that.getChildrenCallback(callback, allitems, timer);
	}, 5000);

	// only query the repositoryId for Children Elements
	if ( params.repositoryId ) {
		repositories.push(this.getRepository(params.repositoryId));
	} else {
		repositories = this.repositories;
	}

	// iterate through all registered repositories
	for ( var i = 0; i < repositories.length; i++) {
		
		this.openChildrenCallbacks.push(repositories[i].repositoryId);
		
        try {
		
			var notImplemented = repositories[i].getChildren( params, function (items) {
			    
				// remove the repository from the callback stack
				var id = that.openChildrenCallbacks.indexOf( this.repositoryId );
				if (id != -1) {
					that.openChildrenCallbacks.splice(id, 1); 
				}
		
				// merge new items with the rest
				jQuery.merge( allitems, items ); 
	
				that.getChildrenCallback(callback, allitems, timer);
			});

        } catch (e) {
//          this.fireEvent('exception', this, 'response', action, arg, null, e);
//          return false;
        	notImplemented = true;
        }
		
		// remove this repository from the callback stack
		if ( notImplemented ) {
			var id = that.openChildrenCallbacks.indexOf( repositories[i].repositoryId );
			if (id != -1) {
				this.openChildrenCallbacks.splice(id, 1);
				if ( i == repositories.length - 1 ) {
					this.getChildrenCallback(callback, allitems, timer);
				}
			}
		}

	}
};

/**
* checks if all repositories returned  and calls the callback
* @return void
* @hide
*/
GENTICS.Aloha.RepositoryManager.prototype.getChildrenCallback = function (cb, items, timer) {

	// if we all callbacks came back we are done!
	if (this.openChildrenCallbacks.length == 0) {
		
		// unset the timer...
		if (timer) clearTimeout(timer);
    
		// Give data back.
		cb.call( this, items);
	}
};

/**
 * Pass an object, which represents an marked repository to corresponding repository, 
 * so that it can make the content clean (prepare for saving)
 * @param obj jQuery object representing an editable
 * @return void
 */
GENTICS.Aloha.RepositoryManager.prototype.makeClean = function(obj) {
	// iterate through all registered repositories
	var that = this;
	var repository = {};
	
	// find all repository tags
	obj.find('[data-GENTICS-aloha-repository=' + this.prefix + ']').each(function() {
		for ( var i = 0; i < that.repositories.length; i++) {
			repository.makeClean(obj);
		}	
		GENTICS.Aloha.Log.debug(that, "Passing contents of HTML Element with id { " + this.attr("id") + " } for cleaning to repository { " + repository.repositoryId + " }");
		repository.makeClean(this);
	});	
};

/**
 * Markes an object as repository of this type and with this item.id.
 * Objects can be any DOM objects as A, SPAN, ABBR, etc. or
 * special objects such as GENTICS_aloha_block elements.
 * This method marks the target obj with two private attributes:
 * (see http://dev.w3.org/html5/spec/elements.html#embedding-custom-non-visible-data)
 * * data-GENTICS-aloha-repository: stores the repositoryId
 * * data-GENTICS-aloha-object-id: stores the object.id
 * @param obj jQuery object to make clean
 * @param object Aloha.Repository.Object the item which is aplied to obj
 * @return void
 */
GENTICS.Aloha.RepositoryManager.prototype.markObject = function (obj, item) {
	var repository = this.getRepository(item.repositoryId);
	if ( repository ) {
		jQuery(obj).attr('data-GENTICS-aloha-repository', item.repositoryId);
		jQuery(obj).attr('data-GENTICS-aloha-object-id', item.id);
		repository.markObject(obj, item);
	} else {
		GENTICS.Aloha.Log.error(this, "Trying to apply a repository { " + item.name + " } to an object, but item has no repositoryId.");
	}
};

/**
 * Create the RepositoryManager object
 * @hide
 */
GENTICS.Aloha.RepositoryManager = new GENTICS.Aloha.RepositoryManager();

/**
 * Expose a nice name for the RepositoryManager
 * @hide
 */
GENTICS.Aloha.RepositoryManager.toString = function() {
	return "com.gentics.aloha.RepositoryManager";
};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Abstract Repository
 * @namespace GENTICS.Aloha
 * @class Repository
 * @constructor
 * @param {String} repositoryId unique repository identifier
 * @param {String} basePath (optional) basepath of the repository (relative to 'repositories' folder). If not given, the basePath is taken
 */
GENTICS.Aloha.Repository = function(repositoryId, repositoryName) {
	/**
	 * @cfg {String} repositoryId is the unique Id for this Repository instance 
	 */
	this.repositoryId = repositoryId;
	
	/**
	 * contains the repository's settings object
	 * @cfg {Object} settings the repository's settings stored in an object
	 */
	this.settings = {};

	/**
	 * @cfg {String} repositoryName is the name for this Repository instance 
	 */
	this.repositoryName = (repositoryName) ? repositoryName : repositoryId;
	
	GENTICS.Aloha.RepositoryManager.register(this);

};

/**
 * Init method of the repository. Called from Aloha Core to initialize this repository
 * @return void
 * @hide
 */
GENTICS.Aloha.Repository.prototype.init = function() {};

/** 
 * Searches a repository for object items matching queryString if none found returns null.
 * The returned object items must be an array of Aloha.Repository.Object
 * 
 * @property {String} queryString 
 * @property {array} objectTypeFilter OPTIONAL Object types that will be returned.
 * @property {array} filter OPTIONAL Attributes that will be returned.
 * @property {string} inFolderId OPTIONAL his is a predicate function that tests whether or not a candidate object is a child-object of the folder object identified by the given inFolderId (objectId).
 * @property {string} inTreeId OPTIONAL This is a predicate function that tests whether or not a candidate object is a descendant-object of the folder object identified by the given inTreeId (objectId).
 * @property {array} orderBy OPTIONAL ex. [{lastModificationDate:’DESC’, name:’ASC’}]
 * @property {Integer} maxItems OPTIONAL number items to return as result
 * @property {Integer} skipCount OPTIONAL This is tricky in a merged multi repository scenario
 * @property {array} renditionFilter OPTIONAL Instead of termlist an array of kind or mimetype is expected. If null or array.length == 0 all renditions are returned. See http://docs.oasis-open.org/cmis/CMIS/v1.0/cd04/cmis-spec-v1.0.html#_Ref237323310 for renditionFilter
 * @param {object} params object with properties
 * @param {function} callback this method must be called with all result items
 */
GENTICS.Aloha.Repository.prototype.query = function( params, callback ) { return true; };

/**
 * Returns all children of a given motherId.
 * @property {array} objectTypeFilter OPTIONAL Object types that will be returned.
 * @property {array} filter OPTIONAL Attributes that will be returned.
 * @property {string} inFolderId OPTIONAL his is a predicate function that tests whether or not a candidate object is a child-object of the folder object identified by the given inFolderId (objectId).
 * @property {array} orderBy OPTIONAL ex. [{lastModificationDate:’DESC’, name:’ASC’}]
 * @property {Integer} maxItems OPTIONAL number items to return as result
 * @property {Integer} skipCount OPTIONAL This is tricky in a merged multi repository scenario
 * @property {array} renditionFilter OPTIONAL Instead of termlist an array of kind or mimetype is expected. If null or array.length == 0 all renditions are returned. See http://docs.oasis-open.org/cmis/CMIS/v1.0/cd04/cmis-spec-v1.0.html#_Ref237323310 for renditionFilter
 * @param {object} params object with properties
 * @param {function} callback this method must be called with all result items
 */
GENTICS.Aloha.Repository.prototype.getChildren = function( params, callback ) { return true; };


/**
 * Make the given jQuery object (representing an object marked as object of this type)
 * clean. All attributes needed for handling should be removed. 
 * @param {jQuery} obj jQuery object to make clean
 * @return void
 */
GENTICS.Aloha.Repository.prototype.makeClean = function (obj) {};

/**
 * Mark or modify an object as needed by that repository for handling, processing or identification.
 * Objects can be any DOM object as A, SPAN, ABBR, etc. or
 * special objects such as GENTICS_aloha_block elements.
 * (see http://dev.w3.org/html5/spec/elements.html#embedding-custom-non-visible-data)
 * @param obj jQuery object to make clean
 * @return void
 */
GENTICS.Aloha.Repository.prototype.markObject = function (obj, repositoryItem) {};
/*!
*   This file is part of Aloha Editor
*   Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
*   Licensed unter the terms of http://www.aloha-editor.com/license.html
*//*
*	Aloha Editor is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.*
*
*   Aloha Editor is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU Affero General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * Abstract Document suitable for most Objects
 * @namespace GENTICS.Aloha.Repository
 * @class Document
 * @property {String} id unique identifier
 * @property {String} repositoryId unique repository identifier
 */

GENTICS.Aloha.Repository.Document = function(properties) {

	var p = properties;
	
	this.type = 'document';
	
	// Basic error checking for MUST attributes
	if (!p.id || 
		!p.name ||
		!p.repositoryId
	) {
//		GENTICS.Aloha.Log.error(this, "No valid Aloha Object. Missing MUST property");
		return;
	}
	
	GENTICS.Utils.applyProperties(this, properties);
	
	this.baseType = 'document';
};

GENTICS.Aloha.Repository.Folder = function(properties) {

	var p = properties;
	
	this.type = 'folder';
	
	// Basic error checking for MUST attributes
	if (!p.id || 
		!p.name ||
		!p.repositoryId
	) {
//		GENTICS.Aloha.Log.error(this, "No valid Aloha Object. Missing MUST property");
		return;
	}
	
	GENTICS.Utils.applyProperties(this, properties);
	
	this.baseType = 'folder';
};
