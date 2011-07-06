
/**
 * Editors
 */
SheetEditor = function() {
    this.name = "JQuery Sheet Editor";
    this.load = function() {
        $("#jQuerySheet0").sheet({
            buildSheet: '10x15',
            title: 'Spreadsheet Playground',
            inlineMenu: inlineMenu($.sheet.instance)
        });
    }
    this.saveEdition = function() {}
    this.loadContentFromDocument = function(doc) {}
    this.load();
}


/***
 * Spreadsheet documents
 */
var JSONSheetDocument = function() {
    JSONDocument.call(this);//inherits from JSONDocument
    this.type = "sheet";
    this.width = 10;
    this.height = 15;
}
JSONSheetDocument.prototype = new JSONDocument();//inheritance

//accessors
JSONSheetDocument.prototype.load({
    getWidth: function() {return this.width;},
    setWidth: function(newWidth) {this.width = newWidth;},
    getHeight: function() {return this.height;},
    setHeight: function(newHeight) {this.height = newHeight;},

    //save process
    saveEdition: function(content) {
        this.setLastUser(getCurrentUser());
        this.setContent(content);
        this.setLastModification(currentTime());
        this.setAsCurrentDocument();
    },

    //display document information
    setAsCurrentDocument: function() {
        getCurrentPage().displayDocumentTitle(this);
        //getCurrentPage().displayDocumentContent(this);
        getCurrentPage().displayDocumentState(this);
        getCurrentPage().displayLastUserName(this);
        getCurrentPage().displayLastModification(this);
        setCurrentDocument(this);
    }
});

getCurrentDocument = function() {
    var doc = new JSONSheetDocument();
    doc.load(JSON.parse(localStorage.getItem("currentDocument")));
    return doc;
}









function inlineMenu(instance) {
    var I = (instance ? instance.length : 0);
    var html = $('#inlineMenu').html().replace(/sheetInstance/g, "$.sheet.instance[" + I + "]");
    var menu = $(html);

    menu.find('.colorPickerCell')
        .colorPicker()
        .change(function() {
            $.sheet.instance[I].cellUndoable.add($.sheet.instance[I].obj.cellHighlighted());
            $.sheet.instance[I].obj.cellHighlighted().css('background-color', $(this).val());
            $.sheet.instance[I].cellUndoable.add($.sheet.instance[I].obj.cellHighlighted());
        });

    menu.find('.colorPickerFont')
        .colorPicker()
        .change(function() {
            $.sheet.instance[I].cellUndoable.add($.sheet.instance[I].obj.cellHighlighted());
            $.sheet.instance[I].obj.cellHighlighted().css('color', $(this).val());
            $.sheet.instance[I].cellUndoable.add($.sheet.instance[I].obj.cellHighlighted());
        });

    menu.find('.colorPickers')
        .children().eq(1).css('background-image', "url('jquery_sheet_editor/jquery_sheet_image/palette.png')");
    menu.find('.colorPickers')
        .children().eq(3).css('background-image', "url('jquery_sheet_editor/jquery_sheet_image/palette_bg.png')");

    return menu;
}

function goToObj(s) {
    $('html, body').animate({
        scrollTop: $(s).offset().top
    }, 'slow');
    return false;
}


