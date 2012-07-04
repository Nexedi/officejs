
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
  newa.setAttribute("id",listnumber);
  newa.setAttribute("class","ui-link-inherit");
  newa.setAttribute("href","#text");
  newa.setAttribute("onclick","setTextEditorInformation(OfficeJS.list[this.id].title,OfficeJS.list[this.id].text);");
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

function CreateLists(){
  //clean all the lists
  var n = document.getElementById('textlist').childNodes.length;  
  for ( var i = 0; i < n; i++) {  
    document.getElementById('textlist').removeChild(  
    document.getElementById('textlist').firstChild);  
  }  
  //set the new lists
  for(i=0;i<OfficeJS.list.length;i++){
    NewList(i,OfficeJS.list[i].title,OfficeJS.list[i].text);
  }
}

function get_list_value(element){
  tr=document.all.para.value;
  document.all.para.value=element.value;
  var trid = element.value;
  alert(trid);
}

