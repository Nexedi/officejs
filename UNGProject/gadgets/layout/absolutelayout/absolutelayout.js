function AbsoluteLayout(params)
{
    for (var obj in params) {
        this[obj] = params[obj];
    }
    this._bindCallbacks();
    this.registerLayout();

    this._top = 0;
}


AbsoluteLayout.prototype._keyPress = function(event)
{
    event = event ? event : window.event;
    var target = event.target ? event.target : event.srcElement;
    if ((this._isDraggingGadget || this._isDraggingPaletteItem) && event.keyCode == 27) {
        Browser.removeEventListener('mousemove', window.document, this._boundMouseMove);
        this._hijackFrames(true);
        if (this._isDraggingGadget) {
          Browser.setAlpha(this._container, '1.0');
          this._container.style.left = this._gadgetLeft + "px";
          this._container.style.top = this._gadgetTop + "px";
          this._isDraggingGadget = false;
          this._container = null;
        } else {
          Browser.removeEventListener('click', window.document, this._boundClick);
          this._isDraggingPaletteItem = false;
          if (this._dragDIV) {
            this._dragDIV = null;
            delete this._dragDIVLeft;
            delete this._dragDIVTop;
          }
          if (this._dragDoneCallback) {
            this._dragDoneCallback(false, null);
            this._dragDoneCallback = null;
          }
        }
    }
}

AbsoluteLayout.prototype.getGadgets = function(element)
{
    var tables = element.getElementsByTagName('TABLE');
    var inputs = new Array();
    for (var i =0; i < tables.length; i++) {
        var table = tables.item(i);
        if (table.className == 'gadgetContainer') {
            inputs.push(table);
        }
    }
    var result = new Array();

    for (var i = 0; i < inputs.length; i++) {
        var id = inputs[i].getAttribute('_widgetid');
        var gadget = mashupMaker.getWidgetModelFromID(id);
        if (gadget) {
            var site = gadget._site;
            if (site && site.getContainer() != inputs[i]) {
                site = new GadgetSite(inputs[i], id/*,
                        mashupMaker.models[id].views*/);    // XXX JHP TODO handle views
            }
            result.push({gadget:gadget, site: site });
        } 
    }   
    return(result);
}

AbsoluteLayout.prototype._bindCallbacks = function()
{
    this._boundMouseDown = Browser.bind(this._mouseDown, this);
    this._boundMouseUp   = Browser.bind(this._mouseUp, this);
    this._boundMouseMove = Browser.bind(this._mouseMove, this);
    this._boundKeyPress  = Browser.bind(this._keyPress, this);
    this._boundClick     = Browser.bind(this._click, this);

}

AbsoluteLayout.prototype._mouseDown  = function(event)
{
    if (this._isDraggingPaletteItem) {
        // since we use sticky drag for palette items, we don't want to 
        // do anything on mousedown if we are in the middle of one.
        return(Browser.cancelEvent(event));
    }
    event = event ? event : window.event;
    var target = event.target ? event.target : event.srcElement;
    switch (target.className) {
    case 'gadgetHeader':
    case 'gadgetTitle':
    case 'gadgetFooter':
        this._dragGadget(this._getGadgetContainer(target), event.clientX, event.clientY);
        return(Browser.cancelEvent(event));
    case 'gadgetBoxFooter':
    case 'absSizerImg':
        this._sizeGadget(this._getGadgetContainer(target), event.clientX, event.clientY);
        return(Browser.cancelEvent(event));
    }       
}

AbsoluteLayout.prototype._mouseUp  = function(event)
{
    if (this._isDraggingPaletteItem) {
        // since we use sticky drag for palette items, we don't want to 
        // do anything on mousedown if we are in the middle of one.
        return(Browser.cancelEvent(event));
    }

    event = event ? event : window.event;
    var target = event.target ? event.target : event.srcElement;

    switch (target.className) {
        case 'absDeleteImg':
            var container = this._getGadgetContainer(target);
            if ( container.getAttribute("_widgetid") != "" ) {
                mashupMaker.deleteGadget( container.getAttribute("_widgetid") );
            } else {
                container.parentNode.removeChild(container);
                delete container;
            }
            return(Browser.cancelEvent(event));

        case 'absPropEditImg':
            return(false);
    }

    if (this._isSizing || this._isDraggingGadget) {
        Browser.removeEventListener('mousemove', window.document, this._boundMouseMove);
        if ( this._isSizing ) {
            // We cannot use "target" in order to get the widget container,
            // since the target may not be related to a part of the widget
            // DOM structure (for example, if the widget is sized outside of the
            // window, then target may come back as the top level "document").
            // Instead, we save the container when sizing starts and use it here.
            var container = this._sizingContainer;
            this._isSizing = false;
            this._sizingContainer = null;
            var id = container.getAttribute("_widgetid"); 
            if ( id != "" ) {
                mashupMaker.handleWidgetResize( id );
            }
        }
        if (this._saveIndex) {
          if (this._container) {
            this._container.style.zIndex =  this._saveIndex;
            this._saveIndex = null;
          }
        }
        this._hijackFrames(true);
        if (this._isDraggingGadget) {
          if (this._container) {
            Browser.setAlpha(this._container, "1.0");
          }
          this._isDraggingGadget = false;
        }
        this._container = null;
        return(Browser.cancelEvent(event));
    }
}

AbsoluteLayout.prototype._mouseMove  = function(event) {
    event = event ? event : window.event;
    if (this._isSizing) {
        var dx = event.clientX - this._lastX;
        var dy = event.clientY - this._lastY;
        var gadgetBody = this._site.getBody();
        var pos = dojo.coords(gadgetBody);
        
        var newWidth = event.clientX - pos.x + this._offsetX;
        var newHeight = event.clientY - pos.y + this._offsetY;
        this._site.resize( newWidth, newHeight );

        if (this._overlay) {
            this._overlay.style.width = newWidth + "px";
            this._overlay.style.height = newHeight + "px";
        }

        this._lastX = event.clientX;
        this._lastY = event.clientY;
        return(Browser.cancelEvent(event));
    } else {
        if (this._dragDIV) {
          var dragX, dragY;
          if (event.pageX || event.pageY) {
            dragX = event.pageX - this._offsetX;
            dragY = event.pageY - this._offsetY;
          } else {
            dragX = event.clientX + window.document.body.scrollLeft - window.document.body.clientLeft - this._offsetX;
            dragY = event.clientY + window.document.body.scrollTop - window.document.body.clientTop - this._offsetY;
          }
          this._dragDIV.style.left = dragX + "px";
          this._dragDIV.style.top = dragY + "px";
        } else {
          this._container.style.left = event.clientX - this._offsetX + "px";
          this._container.style.top = event.clientY - this._offsetY + "px";
          if (this._overlay) {
              this._overlay.style.left = Browser.pixelValue(this._container.style.left) - this._overlayOffset.x + "px";
              this._overlay.style.top = Browser.pixelValue(this._container.style.top) - this._overlayOffset.y + "px";
          }
        }

        return(Browser.cancelEvent(event));
    }
}

AbsoluteLayout.prototype._getGadgetContainer = function(div)
{
    while (div && div.className != 'gadgetContainer') {
        div = div.parentNode;
    }
    return(div);
}

AbsoluteLayout.prototype._sizeGadget = function(container, startX, startY) 
{
    this._container = container;
    var id = container.getAttribute('_widgetid');
    this._site = new GadgetSite(container, id/*, mashupMaker.models[id].views*/); // XXX JHP TODO handle views
    var pos = dojo.coords(this._site.getBody());

    this._offsetX = pos.x + pos.w - startX;
    this._offsetY = pos.y + pos.h - startY;

    this._lastX = startX;
    this._lastY = startY;
    this._isSizing = true;
    this._sizingContainer = container;
    this._hijackFrames();
    if (this._frames) {
        this._overlay = this._frames[id];
    } else {
        this._overlay = null;
    }
    Browser.addEventListener('mousemove', window.document, this._boundMouseMove);
}

AbsoluteLayout.prototype._hijackFrames = function(destroy)
{
    if (destroy) {
        if (this._frames) {
            for (var frameID in this._frames) {
                var div = this._frames[frameID];
                div.parentNode.removeChild(div);
                delete div;
            }
        }
    } else {
        var iframes = document.getElementsByTagName('IFRAME');
        this._frames = new Array();
        for (var i = 0; i < iframes.length; i++) {
            var frame = iframes.item(i);
            var container = this._getGadgetContainer(frame);
            if (!container) {
              // it is possible that dojo inserts iframes
              continue;
            }
            var id = container.getAttribute('_widgetid');
            if (! id) {
                continue;
            }
            var div = document.createElement('DIV');
            div.style.position = 'absolute';
            var pos = dojo.coords(frame, true);
            div.style.left   = pos.x + "px";
            div.style.top    = pos.y + "px";
            div.style.width  = pos.w + "px";
            div.style.height = pos.h + "px";
            div.style.zIndex = 10000;
            div.style.background = 'white';                
            div.innerHTML = '&nbsp;';
            Browser.setAlpha(div, "0");
            this._frames[id] = div;
            document.body.appendChild(div);
        }
    }
}
AbsoluteLayout.prototype._dragGadget = function(container, startX, startY) 
{
    this._container = container;
    this._offsetX = startX - container.offsetLeft;
    this._offsetY = startY - container.offsetTop;

    this._saveIndex = ++this._top;
    this._container.style.zIndex = 10001;
    this._isDraggingGadget = true;
    this._hijackFrames();
    if (this._frames) {
        this._overlay = this._frames[this._container.getAttribute('_widgetid')];
        if (this._overlay) {
            var pos = dojo.coords(container, true);
            this._overlayOffset = {x: pos.x - Browser.pixelValue(this._overlay.style.left),
                                   y: pos.y - Browser.pixelValue(this._overlay.style.top)};
            this._overlay.style.zIndex = Number(this._container.style.zIndex) + 1;
        }
    } else {
        this._overlay = null;
    }
    Browser.setAlpha(container, "0.4");
    this._gadgetLeft = container.offsetLeft;
    this._gadgetTop = container.offsetTop;
    Browser.addEventListener('mousemove', window.document, this._boundMouseMove);
}

AbsoluteLayout.prototype.putOnTop = function(container)
{
    while (container && container.className != 'gadgetContainer') {
        container = container.parentNode;
    }
    if (container) {
        container.style.zIndex  = ++this._top;
        return true;
    }
    return false;
}

AbsoluteLayout.prototype.unregisterLayout = function() {
    Browser.removeEventListener('mousedown', window.document, this._boundMouseDown);
    Browser.removeEventListener('mouseup', window.document, this._boundMouseUp);
    Browser.removeEventListener('keypress', window.document, this._boundKeyPress);
}

AbsoluteLayout.prototype.registerLayout = function() {
    Browser.addEventListener('mousedown', window.document, this._boundMouseDown);
    Browser.addEventListener('mouseup', window.document, this._boundMouseUp);
    Browser.addEventListener('keypress', window.document, this._boundKeyPress);
}
AbsoluteLayout.prototype.setLayoutStyles = function(container) {
  container.style.position = 'absolute';
}
AbsoluteLayout.prototype.removeLayoutStyles = function(container) {
  container.style.position = '';
}

AbsoluteLayout.prototype.dragPaletteItem = function(dragDIV, startX, startY, callback) 
{
  this._dragDoneCallback = callback;
  this._dragDIV = dragDIV;
  this._offsetX = startX - dragDIV.offsetLeft;
  this._offsetY = startY - dragDIV.offsetTop;

  this._saveIndex = ++this._top;
  this._dragDIV.style.zIndex = 10001;
  this._isDraggingPaletteItem = true;
  this._hijackFrames();
  this._overlay = null;
  this._dragDIVLeft = dragDIV.offsetLeft;
  this._dragDIVTop = dragDIV.offsetTop;
  Browser.addEventListener('mousemove', window.document, this._boundMouseMove);
  Browser.addEventListener('click', window.document, this._boundClick);
}
AbsoluteLayout.prototype._click = function(event)
{
  if (!this._isDraggingPaletteItem) {
    return;
  }
  this._isDraggingPaletteItem = false;
  if (this._dragDIV) {
    this._dragDIV = null;
    delete this._dragDIVLeft;
    delete this._dragDIVTop;
  }
  Browser.removeEventListener('click', window.document, this._boundClick);
  Browser.removeEventListener('mousemove', window.document, this._boundMouseMove);
  this._saveIndex = null;
  this._hijackFrames(true);
  if (this._dragDoneCallback) {
    var dropX, dropY;
    if (event.pageX || event.pageY) {
      dropX = event.pageX;
      dropY = event.pageY;
    } else {
      dropX = event.clientX + window.document.body.scrollLeft - window.document.body.clientLeft;
      dropY = event.clientY + window.document.body.scrollTop - window.document.body.clientTop;
    }
    this._dragDoneCallback(true, {layout: 'absolutelayout', x: dropX, y: dropY});
    this._dragDoneCallback = null;
  }
}
