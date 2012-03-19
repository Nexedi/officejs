
/**
 * Editors
 */
SheetEditor = function() {
    this.name = "JQuery Sheet Editor";

    this.objectName = "SheetEditor"  // name of the object reference
    this.load = function() {
             $('#jQuerySheet').sheet({
                    title: 'Spreadsheet Playground',
                    inlineMenu: inlineMenu(jQuery.sheet.instance),
                    buildSheet: '10x20',
                    autoFiller: true
                });
    }

    this.saveEdition = function() {
	var sheetNumber = jQuery.sheet.instance[0].exportSheet.html().length;
	var a="";
	for(var i=0;i<sheetNumber;i++){
		var objE=document.createElement("div");
		objE.appendChild(jQuery.sheet.instance[0].exportSheet.html()[i]);
		a=a+objE.innerHTML;
	}
   	getCurrentDocument().saveEdition(a);
    }
    this.loadContentFromDocument = function(doc) {
	if(doc.getContent()){
		jQuery.sheet.instance[0].killTab();
		var o=parseDom(doc.getContent());
		tryUntilSucceed(load = function() {
	                $('#jQuerySheet').sheet({
               	        title: 'Spreadsheet Playground',
                 	inlineMenu: inlineMenu(jQuery.sheet.instance),
			buildSheet: o,
			autoFiller:true
                	});
		}
		);
	}
    }
    this.load();
}

parseDom=function(arg){
	var objE=document.createElement("div");
	objE.innerHTML=arg;
	return objE.childNodes;
}

function inlineMenu(I){
                I = (I ? I.length : 0);
                
                //we want to be able to edit the html for the menu to make them multi-instance
                var html = $('#inlineMenu').html().replace(/sheetInstance/g, "$.sheet.instance[" + I + "]");
          
                var menu = $(html);
                //The following is just so you get an idea of how to style cells
                menu.find('.colorPickerCell').colorPicker().change(function(){
                    $.sheet.instance[I].cellChangeStyle('background-color', $(this).val());
                });
                
                menu.find('.colorPickerFont').colorPicker().change(function(){
                    $.sheet.instance[I].cellChangeStyle('color', $(this).val());
                });
                
                menu.find('.colorPickers').children().eq(1).css('background-image', "url('jquery.sheet/images/palette.png')");
                menu.find('.colorPickers').children().eq(3).css('background-image', "url('jquery.sheet/images/palette_bg.png')");
                
                
                return menu;
            }

JSONDocument.prototype.type = "table";
JSONDocument.prototype.saveEdition = function(content) {
    this.setLastUser(getCurrentUser().getName());
    this.setContent(content);
    this.setLastModification(getCurrentTime());
    getCurrentPage().displayDocumentInformation(this);
}


