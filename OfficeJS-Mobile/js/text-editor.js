//set the text Editor 
function setTextEditorInformation(name,content){
  var nameTextarea = document.getElementById("input_file_name");
  nameTextarea.value=name;
  var contentTextarea = document.getElementById("input_file_content");
  contentTextarea.value=content;
}

