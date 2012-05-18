/* trigger when page is ready */
$(document).ready(function (){
  // Only bootstrap a div wich define a gadget
  RenderJs.bootstrap($("#gadget-header"));
  // Here we add gadget to an existing div with javascript code
  RenderJs.TabbularGadget.addNewTabGadget('gadget-article', 'gadget/article.html');
});