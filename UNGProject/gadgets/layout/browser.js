if (typeof Node == 'undefined') {
    Node = {};
    Node.ELEMENT_NODE = 1;
    Node.TEXT_NODE    = 3;
}

function gel(id) 
{
    return(document.getElementById(id));
}

Browser = {};
Browser.isIE      = (navigator.userAgent.indexOf('MSIE')  != -1);
Browser.isFirefox = (navigator.userAgent.indexOf('Firefox') != -1);
Browser.isSafari  = (navigator.userAgent.indexOf('Safari')  != -1);
Browser.isOpera   = (navigator.userAgent.indexOf('Opera')   != -1);

Browser.addEventListener = function(eventType, onWhom, callback) {
    if (onWhom.addEventListener) {
        onWhom.addEventListener(eventType, callback, false);
    } else {
        onWhom.attachEvent('on' + eventType, callback);
    }
}

Browser.removeEventListener = function(eventType, onWhom, callback) 
{
    if (onWhom.removeEventListener) {
        onWhom.removeEventListener(eventType, callback, false);
    } else {
        onWhom.detachEvent('on' + eventType, callback);
    }
}

Browser.bind = function(callback, toWom) 
{
    var __method = callback;
    return function() {
        return __method.apply(toWom, arguments);
    }
}

Browser.setAlpha = function(element, alpha) 
{
    if (Browser.isIE) {
        element.style.filter="Alpha(Opacity=" + (parseFloat(alpha) * 100) + ")";
    } else {
        element.style.opacity = alpha;
    }
}

Browser.cancelEvent = function(e) 
{
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.cancelBubble = true;
    e.cancel       = true;
    e.returnValue  = false;

    return(false);
}
Browser.fetchPreviousSibling = function(element, tagName)
{
    if (! tagName) {
        tagName = element.tagName;
    }
    element = element.previousSibling;
    while (element && element.tagName != tagName)  {
        element = element.previousSibling;
    }
    return(element);
}

Browser.fetchNextSibling = function(element, tagName)
{
    if (! tagName) {
        tagName = element.tagName;
    }
    element = element.nextSibling;
    while (element && element.tagName != tagName)  {
        element = element.nextSibling;
    }
    return(element);
}

Browser.fetchFirst = function(element, tagName)
{
    if (element.childNodes) {
        tagName = tagName.toUpperCase()
        for (var i = 0; i < element.childNodes.length; i++) {
            var child = element.childNodes.item(i);
            if ((child.tagName && child.tagName.toUpperCase() == tagName) || (!tagName && (child.nodeType == Node.ELEMENT_NODE))) {
                return(child);
            }
        }
    }
    return(null);
}

Browser.fetchChildren = function(element, tagName)
{
    var result = new Array();
    tagName = tagName.toUpperCase();
    result.item = function(index) {
        if (index >= 0 && index < this.length) {
            return(this[index]);
        }
        throw 'Index out of bounds';
    }
    if (element.childNodes) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var child = element.childNodes.item(i);
            if (child.tagName && child.tagName.toUpperCase() == tagName) {
                result.push(child);
            }
        }
    }
    return(result);
}

Browser.elementFromPoint = function(parent, x, y) {
    if (document.elementFromPoint) {
        var element = document.elementFromPoint(x, y);
        if (element) {
            return(element);
        }
    } else {
        var startPos = dojo.coords(parent);
    
        if ((x >= startPos.x && x <= (startPos.x + parent.offsetWidth)) && 
            (y >= startPos.y && y < (startPos.y + parent.offsetHeight))) {
            for (var i = 0; i < parent.childNodes.length; i++) {
                var child = parent.childNodes.item(i);
                if (child.nodeType == Node.ELEMENT_NODE) {
                    var result = this.elementFromPoint(child, x, y);
                    if (result) {
                        return(result);
                    }
                }
            }
            return(parent);
        }
    }
    return(false);
}

Browser.getScrollTop = function(){
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

Browser.getScrollLeft = function(){
    return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
}

Browser.sumAncestorProperties = function(node, prop) {
    if (!node) { 
        return 0; 
    } // FIXME: throw an error?

    var retVal = 0;
    while(node){
        var val = node[prop];
        if(val){
            retVal += val - 0;
            if(node==document.body){ break; }// opera and khtml #body & #html has the same values, we only need one value
        }
        node = node.parentNode;
    }
    return retVal;
}

Browser.getStyle = function(el, prop) {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    return document.defaultView.getComputedStyle(el, null)[prop];
  } else if (el.currentStyle) {
      var value = el.currentStyle[prop];
      if (typeof value == 'undefined') {
          value = el.style[prop];
      }
      return(value);
  } else {
    return el.style[prop];
  }
}
Browser.pixelValue = function(str) 
{
    if (typeof str == 'number') {
        return(str);
    }
    if (!str) {
        return(0);
    }    
    var match = str.match(/(.*)(px|\%)?/);
    if (match && match.length == 3) 
        return(parseFloat(match[1]));
    return(0);
}
Browser.createElement = function(tagName, style, parent) {
    var result = document.createElement(tagName);
    if (style) {
        result.className = style;
    }
    if (parent) {
        parent.appendChild(result);
    }
    return(result);
}
Browser.evalScriptGlobal = function(script) {
    // dojo.eval doesn't execute script in global scope on IE.  Be aware that
    // window.execScript doesn't return anything so really best just for
    // declaring things like functions, etc
    if (window.execScript) {
        window.execScript(script);
        return null;
    }

    return dojo.eval(script);
}

function _gel(id) {
    return(document.getElementById(id));
}
