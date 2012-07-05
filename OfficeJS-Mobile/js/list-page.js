
//automatically build the list
NewList = function (listnumber,listname,listcontent){
  //get the main list
  var mainList = document.getElementById("textlist");
  //set the new element
  newElement = document.createElement("li");
  newElement.setAttribute("class","ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-static ui-body-c ui-btn-up-c");
  newElement.setAttribute("data-theme","c");	
  newElement.setAttribute("data-iconpos","right");	
  newElement.setAttribute("data-icon","arrow-r");
  newElement.setAttribute("data-wrapperels","div");
  newElement.setAttribute("data-iconshadow","true");
  newElement.setAttribute("data-shadow","false");
  newElement.setAttribute("data-corners","false");
  mainList.appendChild(newElement);	
  //set firstdiv
  newFirstdiv = document.createElement("div");
  newFirstdiv.setAttribute("class","ui-btn-inner ui-li ui-li-static ui-body-c");
  newElement.appendChild(newFirstdiv);
  //set seconddiv
  newSeconddiv = document.createElement("div");
  newSeconddiv.setAttribute("class","ui-btn-text");
  newFirstdiv.appendChild(newSeconddiv);
  //set a tag
  newa = document.createElement("a");
  newa.setAttribute("id",listname);
  newa.setAttribute("class","listcontent ui-link-inherit");
  newa.setAttribute("href","#text");
  newa.setAttribute("onclick","OfficeJS.load(this.id);");
  newSeconddiv.appendChild(newa);
  //set head 
  newhead = document.createElement("h3");
  newhead.setAttribute("class","ui-li-heading");
  newa.appendChild(newhead);
  newHeadtext = document.createTextNode(listname);
  newhead.appendChild(newHeadtext);
  //set content
  newcontent = document.createElement("p");
  newcontent.setAttribute("class","ui-li-desc");
  newa.appendChild(newcontent);
  newContenttext = document.createTextNode(listcontent);
  newcontent.appendChild(newContenttext);
  //set shadow
  newshadow = document.createElement("span");
  newshadow.setAttribute("class","ui-icon ui-icon-arrow-r ui-icon-shadow");
  newFirstdiv.appendChild(newshadow);
}

//set the List
setList = function (result_return_value){
  removeLists();
  //set all the list
  for(var i=0;i<result_return_value.length;i++){
    NewList(i,result_return_value[i].name,"text-Editor");
  }
}

//remove all lists
removeLists = function(){
  var n = document.getElementById('textlist').childNodes.length;  
  for ( var i = 0; i < n; i++) {  
    document.getElementById('textlist').removeChild(  
    document.getElementById('textlist').firstChild);  
  }  
}

//set the popup dialog for remove all button
$(document).delegate('#removeall', 'click', function() {
  $('<div>').simpledialog2({
    mode: 'button',
    headerText: 'Are you sure?',
    headerClose: true,
    buttonPrompt: 'Can not be retrieved',
    buttons : {
      'OK': {
        click: function () { 
          RemoveAllDocument();
          removeLists();
        }
      },
      'Cancel': {
        click: function () { 
        },
        icon: "delete",
        theme: "c"
      }
    }
  })
})

//remove all
RemoveAllDocument = function(){
  var document_name_array = [];
  var document_list=document.getElementsByClassName('listcontent');
  for (var i = 0; i < document_list.length; i++) {
    document_name_array.push(document_list[i].id);
  }
  OfficeJS.removeSeveralFromArray (document_name_array);
}
