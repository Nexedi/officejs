/* trigger when page is ready */
$(document).ready(function (){
  RenderJs.TabbularGadget.addNewTabGadget('gadget-header', 'gadget/cached_navigation.html');
  RenderJs.TabbularGadget.addNewTabGadget('gadget-article', 'gadget/article.html');
});