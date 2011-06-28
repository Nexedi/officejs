createLine = function(doc) {
    var type = "other";
    try{if(doc.getType()) {type = doc.getType();}}
    catch(e) {console.log(e);}

    $.(table.listbox
    var tr = $(getCurrentPage().get)
    "<tr class='"+type+"'>\n\
        <td class='listbox-table-select-cell'>\n\
            <input type='checkbox' id='"+i+"'/>\n\
        </td>\n\
        <td class='listbox-table-data-cell'>\n\
            <a href='#' onclick='javascript:getPage()'>\n\
                <img src='images/icons/document.png'/>\n\
            </a>\n\
        </td>\n\
        <td class='listbox-table-data-cell'>
            <a href="...">Web Page</a>
        </td>

        <td class="listbox-table-data-cell">
            <a href="...">Deleted</a>
        </td>

        <td class="listbox-table-data-cell">
            <a href="ung_document_list_selection">2011/05/31&nbsp;&nbsp;&nbsp;11:44</a>
        </td>

    </tr>