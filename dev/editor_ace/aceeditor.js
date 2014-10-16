/*global ace, rJS */
/*jslint nomen: true*/
(function(window, rJS) {
    "use strict";
    var gk = rJS(window);
    gk.declareMethod("setContent", function(value) {
        this.editor.getSession().setValue(value);
    }).declareMethod("getContent", function() {
        return this.editor.getSession().getValue();
    });
    gk.ready(function(g) {
        g.editor = ace.edit(g.__element.getElementsByTagName("div")[0]);
        g.editor.setTheme("ace/theme/monokai");
    });
})(window, rJS, ace);