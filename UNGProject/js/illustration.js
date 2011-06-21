
/**
 * Editors
 */
SVGEditor = function() {
    this.name = "svg-editor";
    
    this.load = function() {$("#svgframe").attr("src", "svg-editor/svg-editor.html")}
    this.saveEdition = function() {
        var s = "svgframe";
        getCurrentDocument().saveEdition(window.frames[s].svgCanvas.getSvgString());
    }
    this.loadContentFromDocument = function(doc) {
        var s = "svgframe";
        window.frames[s].svgCanvas.setSvgString(doc.getContent());
    }

    var s = "svgframe";
    this.svgCanvas = window.frames[s].svgCanvas;

    this.load();
}

/**
 * SVG documents
 */
var JSONIllustrationDocument = function() {
    JSONDocument.call(this);//inherits properties from JSONDocument
    this.type = "illustration";
}

JSONIllustrationDocument.prototype = new JSONDocument();//inherits methods from JSONDocument

JSONIllustrationDocument.prototype.saveEdition = function(content) {
    this.setContent(content);
    this.setLastModification(currentTime());
    this.setAsCurrentDocument();
}
JSONIllustrationDocument.prototype.setAsCurrentDocument = function() {
    getCurrentPage().displayDocumentTitle(this);
    getCurrentPage().displayDocumentState(this);
    getCurrentPage().displayDocumentContent(this);
    getCurrentPage().displayAuthorName(this);
    getCurrentPage().displayLastModification(this);
    setCurrentDocument(this);
}

getCurrentDocument = function() {
    var doc = new JSONIllustrationDocument();
    doc.load(JSON.parse(localStorage.getItem("currentDocument")));
    return doc;
}

