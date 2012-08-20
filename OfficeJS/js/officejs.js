(function (scope) {
    "use strict";
    var odf = function (obj,name,value) {
        Object.defineProperty(obj,name,{
            configurable:false,enumerable:false,writable:false,value:value
        });
    };
    var OfficeJS = {};
    //////////////////////////////////////////////////////////////////////

    odf(OfficeJS,'env',{});
    odf(OfficeJS,'tmp',{});
    odf(OfficeJS,'system',{});
    odf(OfficeJS,'run',{});
    odf(OfficeJS,'lib',{});
    odf(OfficeJS,'command',{});

    //////////////////////////////////////////////////////////////////////

    OfficeJS.system.preferences = {};
    OfficeJS.system.applications = {};
    OfficeJS.system.mime = {};
    OfficeJS.system.icon = {};

    // Top Nav Bar //
    OfficeJS.system.applications['top_nav_bar'] = {
        name:          'top_nav_bar',
        componentpath: 'component/top_nav_bar.html',
        gadgetid:      'page-top_nav_bar',
        varname:       'OfficeJS_top_nav_bar',
        api: {
            about: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.system.applications['about']);
            },
            contact: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.system.applications['contact']);
            }
        },
        lib: {
            spin:function (state) {
                OfficeJS.system.applications['top_nav_bar'].spin[state]();
            },
            endspin:function (state) {
                OfficeJS.system.applications['top_nav_bar'].spin['end'+state]();
            }
        },
        spin: {
            spinstate: 0,
            savestate: 0,
            loadstate: 0,
            getliststate: 0,
            removestate: 0,
            main: function (string){
                if (this[string+'state'] === 0){
                    document.querySelector ('#loading_'+string).
                        style.display = 'block';
                }
                this[string+'state'] ++;
            },
            endmain: function (string){
                if (this[string+'state']>0) {
                    this[string+'state']--;
                }
                if (this[string+'state']===0){
                    document.querySelector ('#loading_'+string).
                        style.display = 'none';
                }
            },
            spin:function(){this.main('spin');},
            save:function(){this.main('save');this.spin();},
            load:function(){this.main('load');this.spin();},
            getlist:function(){this.main('getlist');this.spin();},
            remove:function(){this.main('remove');this.spin();},
            endspin:function(){this.endmain('spin');},
            endsave:function(){this.endmain('save');this.endspin();},
            endload:function(){this.endmain('load');this.endspin();},
            endgetlist:function(){this.endmain('getlist');this.endspin();},
            endremove:function(){this.endmain('remove');this.endspin();}
        }
    };
    // End Top Nav Bar //

    // Left Nav Bar //
    OfficeJS.system.applications['left_nav_bar'] = {
        name:          'left_nav_bar',
        componentpath: 'component/left_nav_bar.html',
        gadgetid:      'page-left_nav_bar',
        varname:       'OfficeJS_left_nav_bar',
        api: {
            login: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.system.applications['login']
                );
            },
            newTextDocument: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.lib.getAppFromPref('html-editor')
                );
            },
            newImage: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.lib.getAppFromPref('svg-editor')
                );
            },
            newSpreadSheet: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.lib.getAppFromPref('jqs-sheet')
                );
            },
            showActivities: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.lib.getAppFromPref('activities')
                );
            },
            showDocumentList: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.lib.getAppFromPref('documentlister')
                );
            }
        },
        lib:{
            showTools: function () {
                var elmt;
                if (OfficeJS.run.jio && !OfficeJS.tmp.tools_opened) {
                    OfficeJS.tmp.tools_opened = true;
                    elmt = document.querySelector ('script#left-nav-tools');
                    document.querySelector ('#left-nav-bar').innerHTML +=
                    elmt.innerHTML;
                }
            }
        }
    };
    // End Left Nav Bar //

    // login //
    OfficeJS.system.applications['login'] = {
        name:          'login',
        componentpath: 'component/login.html',
        gadgetid:      'page-content',
        varname:       'OfficeJS_login',
        api: {
            connect: function (spec) {
                if (!OfficeJS.run.jio) {
                    if (typeof spec === 'string') {
                        spec = JSON.parse (spec);
                    }
                    OfficeJS.run.jio = jio.newJio(spec);
                    OfficeJS.system.applications['left_nav_bar'].
                        lib.showTools();
                    OfficeJS.lib.allDocs();
                }
            }
        }
    };
    // End login //

    // about //
    OfficeJS.system.applications['about'] = {
        type:          'about',
        'class':       'viewer',
        name:          'about',
        componentpath: 'component/about.html',
        gadgetid:      'page-content'
    };
    // End about //

    // contact //
    OfficeJS.system.applications['contact'] = {
        type:          'contact',
        'class':       'viewer',
        name:          'contact',
        componentpath: 'component/contact.html',
        gadgetid:      'page-content'
    };
    // End contact //

    // elRTE //
    OfficeJS.system.applications['elrte'] = {
        type:          'html-editor',
        name:          'elrte',
        'class':       'editor',
        componentpath: 'component/elrte.html',
        gadgetid:      'page-content',
        varname:       'OfficeJS_elrte',
        exts:          ['html'],
        default_ext:   'html',
        docid_elmnt:   '#elrte_docid',
        editor_elmnt:  '#elrte_editor',
        api: {
            save: function () {
                var id, content;
                id = OfficeJS.system.applications['elrte'].
                    lib.getDocId();
                content = OfficeJS.system.applications['elrte'].
                    lib.getContent();
                console.log ('content ' + content);
                if (id) {
                    OfficeJS.lib.put({
                        _id:id+'.'+OfficeJS.system.applications['elrte'].
                            default_ext,
                        content:content||''
                    },function (err,val) {
                        setTimeout(function(){
                            OfficeJS.lib.allDocs();
                        });
                    });
                }
            }
        },
        lib: {
            getDocId: function () {
                return $(OfficeJS.system.applications['elrte'].docid_elmnt).
                    attr('value');
            },
            getContent: function () {
                $(OfficeJS.system.applications['elrte'].editor_elmnt).
                    elrte('updateSource');
                return $(OfficeJS.system.applications['elrte'].editor_elmnt).
                    elrte('val');
            },
            setDocId: function (docid) {
                $(OfficeJS.system.applications['elrte'].docid_elmnt).
                    attr('value',docid);
            },
            setContent: function (content) {
                return $(OfficeJS.system.applications['elrte'].editor_elmnt).
                    elrte('val',content);
            }
        },
        onload: function (doc) {
            if (doc) {
                setTimeout(function(){
                    OfficeJS.system.applications['elrte'].
                        lib.setDocId(OfficeJS.lib.basename(doc._id));
                    OfficeJS.system.applications['elrte'].
                        lib.setContent('loading...');
                    console.log ('get docid ' + doc._id);
                    OfficeJS.lib.get(doc._id,null,function (err,val) {
                        if (val) {
                            console.log ('receive ' + JSON.stringify (val));
                            OfficeJS.system.applications['elrte'].
                                lib.setContent(val.content);
                        } else {
                            // TODO : 
                        }
                    });
                },500); // FIXME : 
            }
        },
        update: function (content) {
            OfficeJS.system.applications['elrte'].lib.setContent (content);
        }
    };
    OfficeJS.system.preferences['html-editor'] =
        OfficeJS.system.applications['elrte'];
    OfficeJS.system.mime['html'] = 'html-editor';
    OfficeJS.system.icon['html'] = '<i class="icon-font"></i>';
    // End elRTE //

    // svg edit //
    OfficeJS.system.applications['svg-edit'] = {
        type:          'svg-editor',
        name:          'svg-edit',
        'class':       'editor',
        componentpath: 'component/svg-edit.html',
        gadgetid:      'page-content',
        varname:       'OfficeJS_svgedit',
        exts:          ['svg'],
        default_ext:   'svg',
        docid_elmnt:   '#svg-edit_docid',
        editor_elmnt:  '#svg-edit_frame',
        api: {
            save: function () {
                var id, content;
                id = OfficeJS.system.applications['svg-edit'].
                    lib.getDocId();
                content = OfficeJS.system.applications['svg-edit'].
                    lib.getContent();
                if (id) {
                    OfficeJS.lib.put({
                        _id:id+'.'+OfficeJS.system.applications['svg-edit'].
                            default_ext,
                        content:content||''
                    },function (err,val) {
                        setTimeout(function(){
                            OfficeJS.lib.allDocs();
                        });
                    });
                }
            }
        },
        lib:{
            getDocId: function () {
                return $(OfficeJS.system.applications['svg-edit'].docid_elmnt).
                    attr('value');
            },
            setDocId: function (docid) {
                $(OfficeJS.system.applications['svg-edit'].docid_elmnt).
                    attr('value',docid);
            },
            getContent: function () {
                return document.querySelector (
                    OfficeJS.system.applications['svg-edit'].editor_elmnt).
                    contentWindow.svgCanvas.getSvgString();
            },
            setContent: function (content) {
                return document.querySelector (
                    OfficeJS.system.applications['svg-edit'].editor_elmnt).
                    contentWindow.svgCanvas.setSvgString(content);
            }
        },
        onload: function (doc) {
            if (doc) {
                setTimeout(function(){
                    OfficeJS.system.applications['svg-edit'].
                        lib.setDocId(OfficeJS.lib.basename(doc._id));
                    OfficeJS.lib.get(doc._id,null,function (err,val) {
                        if (val) {
                            OfficeJS.system.applications['svg-edit'].
                                lib.setContent(val.content);
                        } else {
                            // TODO : 
                        }
                    });
                },500); // FIXME : 
            }
        }
    };
    OfficeJS.system.preferences['svg-editor'] =
        OfficeJS.system.applications['svg-edit'];
    OfficeJS.system.mime['svg'] = 'svg-editor';
    OfficeJS.system.icon['svg'] = '<i class="icon-pencil"></i>';
    // End svg edit //

    // jquery-sheet //
    OfficeJS.system.applications['jquery-sheet'] = {
        type:          'jqs-sheet',
        name:          'jquery-sheet',
        'class':       'editor',
        componentpath: 'component/jquery-sheet.html',
        gadgetid:      'page-content',
        varname:       'OfficeJS_jquerysheet',
        exts:          ['jqs'],
        default_ext:   'jqs',
        docid_elmnt:   '#jquery-sheet_docid',
        sheet_elmnt:   '#jQuerySheet',
        api: {
            save: function () {
                var id, content;
                id = OfficeJS.system.applications['jquery-sheet'].
                    lib.getDocId();
                content = OfficeJS.system.applications['jquery-sheet'].
                    lib.getContent();
                if (id) {
                    OfficeJS.lib.put({
                        _id:id+'.'+OfficeJS.system.applications['jquery-sheet'].
                            default_ext,
                        content:content||''
                    },function (err,val) {
                        setTimeout(function(){
                            OfficeJS.lib.allDocs();
                        });
                    });
                }
            },
            firstload: function () {
                OfficeJS.system.applications['jquery-sheet'].lib.firstload();
            }
        },
        lib:{
            getDocId: function () {
                return $(OfficeJS.system.applications['jquery-sheet'].
                         docid_elmnt).attr('value');
            },
            setDocId: function (docid) {
                $(OfficeJS.system.applications['jquery-sheet'].
                  docid_elmnt).attr('value',docid);
            },
            getContent: function () {
                return JSON.stringify (
                    $.sheet.instance[0].exportSheet.json()
                );
            },
            setContent: function (content) {
                return $(OfficeJS.system.applications['jquery-sheet'].
                         sheet_elmnt).sheet({
                             title: '',
                             inlineMenu: OfficeJS.system.applications[
                                 'jquery-sheet'].lib.inlineMenu(
                                     $.sheet.instance),
                             buildSheet: $.sheet.makeTable.json(
                                 JSON.parse (content)),
                             autoFiller: true
                         });
            },
            //This function builds the inline menu to make it easy to
            //interact with each sheet instance
            inlineMenu: function (I) {
                I = (I ? I.length : 0);

                //we want to be able to edit the
                //html for the menu to make them multi
                //instance
                var html = $('#inlineMenu').html().
                    replace(/sheetInstance/g,
                            "$.sheet.instance[" + I + "]");
                var menu = $(html);

                //The following is just so you get an idea of how to style cells
                menu.find('.colorPickerCell').colorPicker().change(function(){
                    $.sheet.instance[I].cellChangeStyle(
                        'background-color', $(this).val());
                });

                menu.find('.colorPickerFont').colorPicker().change(function(){
                    $.sheet.instance[I].cellChangeStyle('color', $(this).val());
                });

                menu.find('.colorPickers').children().eq(1).
                    css('background-image',
                        "url('lib/jquery.sheet/images/palette.png')");
                menu.find('.colorPickers').children().eq(3).
                    css('background-image',
                        "url('lib/jquery.sheet/images/palette_bg.png')");
                return menu;
            },
            firstload: function () {
                //Here is where we initiate the sheets
                //every time sheet is created it creates a new
                //jQuery.sheet.instance
                //(array), to manipulate each sheet,
                //the jQuery object is returned
                $('#jQuerySheet').sheet({
                    title: '',
                    inlineMenu: OfficeJS.system.applications[
                        'jquery-sheet'].lib.inlineMenu($.sheet.instance),
                    urlGet: 'component/newspreadsheet.html',
                    // buildSheet: true,
                    editable: true,
                    autoFiller: true
                });

                //This is for some fancy menu stuff
                var o = $('#structures');
                var top = o.offset().top - 300;
                $(document).scroll(function(e){
                    if ($(this).scrollTop() > top) {
                        $('#lockedMenu').removeClass('locked');
                    }
                    else {
                        $('#lockedMenu').addClass('locked');
                    }
                }).scroll();
            }
        },
        onload: function (doc) {
            if (doc) {
                setTimeout(function(){
                    OfficeJS.system.applications['jquery-sheet'].
                        lib.setDocId(OfficeJS.lib.basename(doc._id));
                    OfficeJS.lib.get(doc._id,null,function (err,val) {
                        if (val) {
                            OfficeJS.system.applications['jquery-sheet'].
                                lib.setContent(val.content);
                        } else {
                            // TODO : 
                        }
                    });
                },500); // FIXME : 
            }
        }
    };
    OfficeJS.system.preferences['jqs-sheet'] =
        OfficeJS.system.applications['jquery-sheet'];
    OfficeJS.system.mime['jqs'] = 'jqs-sheet';
    OfficeJS.system.icon['jqs'] = '<i class="icon-signal"></i>';
    // End jquery-sheet //

    // slickgrid //
    OfficeJS.system.applications['slickgrid'] = {
        type:          'documentlister',
        name:          'slickgrid',
        'class':       'viewer',
        componentpath: 'component/slickgrid_document_lister.html',
        gadgetid:      'page-content',
        varname:       'OfficeJS_slickgrid',
        list_elmnt:    '#slickgrid_documentlist',
        api: {
            load: function () {
                setTimeout (function () {
                    try {
                        OfficeJS.tmp.slick_reload = 0;
                        OfficeJS.system.applications['slickgrid'].lib.reload();
                    } catch (e) {} // avoid reload the wrong component
                });
            },
            refresh: function () {
                OfficeJS.lib.allDocs(function (err,val) {
                    if (val) {
                        try {
                            OfficeJS.tmp.slick_reload = 0;
                            OfficeJS.system.applications['slickgrid'].
                                lib.reload();
                        } catch (e) {} // avoid reload the wrong component
                    } else {
                        // TODO : 
                    }
                });
            }
        },
        lib:{
            reload: function () {
                var grid, onSortFunction, onClickFunction,
                check_box_selector, i, array,
                onRemoveSeveral,showIconFormatter,
                document_list,columns,options;

                if (!OfficeJS.tmp.documentlist) {
                    if (OfficeJS.tmp.slick_reload === 3) { return; }
                    setTimeout(function() {
                        OfficeJS.tmp.slick_reload =
                            OfficeJS.tmp.slick_reload?
                            OfficeJS.tmp.slick_reload++:1;
                        OfficeJS.system.applications['slickgrid'].lib.reload();
                    },100);
                    return;
                }

                $(OfficeJS.system.applications['slickgrid'].
                  list_elmnt).html('');
                document_list = OfficeJS.tmp.documentlist;
                options = {
                    enableCellNavigation: true,
                    enableColumnReorder: false,
                    multiColumnSort: true,
                    forceFitColumns: true
                };
                showIconFormatter = function (
                    row,cell,value,columnDef,dataContext) {
                    return dataContext.icon;
                };
                // make array
                array = [];
                for (i = 0; i < document_list.total_rows; i+= 1) {
                    var arrayi = {}, lm, cd, j;
                    arrayi.id = document_list.rows[i].id;
                    arrayi.basename = OfficeJS.lib.basename(arrayi.id);
                    arrayi.ext = OfficeJS.lib.extOf(arrayi.id);
                    if (arrayi.ext) {
                        arrayi.icon = OfficeJS.system.icon[arrayi.ext] || '?';
                        arrayi.app = OfficeJS.lib.getAppFromMime(arrayi.ext) ||
                            OfficeJS.lib.getAppFromPref('html-editor');
                    } else {
                        arrayi.icon = '?';
                        arrayi.app = OfficeJS.lib.getAppFromPref('html-editor');
                    }
                    if (document_list.conflicts) {
                        arrayi.conflict = '';
                        for (j = 0;
                             j < document_list.conflicts.total_rows;
                             j+= 1) {
                            if (document_list.conflicts.rows[j].id ===
                                arrayi.id) {
                                var row = document_list.conflicts.rows[j];
                                arrayi.conflict = 'X';
                                arrayi.showConflict = function () {
                                    console.log ('showConflict');
                                    OfficeJS.lib.openApplication(
                                        OfficeJS.lib.getAppFromPref(
                                            'conflictsolver'),
                                        {_id:arrayi.id,row:row} // wrong
                                    );
                                };
                                break;
                            }
                        }
                    }
                    // dates
                    // FIXME : we can have 2012/1/1 12:5
                    // we should have 2012/01/01 12:05
                    lm = (new Date(document_list.rows[i].value._last_modified));
                    cd = (new Date(document_list.rows[i].value._creation_date));
                    arrayi.last_modified = lm.getFullYear()+'/'+
                        (lm.getMonth()+1)+'/'+lm.getDate()+' '+
                        lm.getHours()+':'+lm.getMinutes();
                    arrayi.creation_date = cd.getFullYear()+'/'+
                        (cd.getMonth()+1)+'/'+cd.getDate()+' '+
                        cd.getHours()+':'+cd.getMinutes();
                    array.push(arrayi);
                }
                check_box_selector = new Slick.CheckboxSelectColumn({
                    cssClass: "slick-cell-checkboxsel"
                });
                columns = [];
                columns.push(check_box_selector.getColumnDefinition());
                columns.push({id:"icon",name:"",field:"icon",
                              sortable:true,resizable:false,width:24,
                              formatter:showIconFormatter});
                columns.push({id:"file_name",name:"Document",
                              field:"basename",sortable:true});
                columns.push({id:"last_modified",name:"Modified",
                              field:"last_modified",sortable:true});
                columns.push({id:"creation_date",name:"Created",
                              field:"creation_date",sortable:true});
                if (document_list.conflicts) {
                    columns.push({id:'on_conflict',name:'',
                                  field:'conflict',sortable:true,
                                  resizable:false,width:24});
                }
                grid = new Slick.Grid(
                    OfficeJS.system.applications['slickgrid'].list_elmnt,
                    array,columns,options);
                grid.setSelectionModel(new Slick.RowSelectionModel(
                    {selectActiveRow: false}));
                grid.registerPlugin(check_box_selector);
                onSortFunction = function (e, args) {
                    var cols = args.sortCols;
                    document_list.sort(function (data_row1, data_row2) {
                        var i, l, field, sign, value1, value2, result;
                        for (i = 0, l = cols.length; i < l; i++) {
                            field = cols[i].sortCol.field;
                            sign = cols[i].sortAsc ? 1 : -1;
                            value1 = data_row1[field];
                            value2 = data_row2[field];
                            result = (value1==value2?0:
                                      (value1>value2?1:-1))*sign;
                            if (result != 0) {
                                return result;
                            }
                        }
                        return 0;
                    });
                    grid.invalidate();
                    grid.render();
                };
                onClickFunction = function (e) {
                    var cell = grid.getCellFromEvent(e);
                    if (cell.cell === grid.getColumnIndex('file_name')) {
                        OfficeJS.lib.openApplication(
                            array[cell.row].app,{_id:array[cell.row].id});
                    } else if (cell.cell ===
                               grid.getColumnIndex('on_conflict')) {
                        array[cell.row].showConflict?
                            array[cell.row].showConflict():true;
                    }
                };
                onRemoveSeveral = function () {
                    var document_name_array = [], selected, i, l, cpt = 0;
                    selected = grid.getSelectedRows();
                    for (i = 0, l = selected.length; i < l; i+= 1) {
                        OfficeJS.lib.remove(
                            {_id:document_list.rows[selected[i]].id},'last',
                            function (err,val) {
                                cpt ++;
                                if (l === cpt) {
                                    OfficeJS_slickgrid.refresh();
                                }
                            });
                    }
                };
                document.querySelector (
                    '#slickgrid_document_lister_remove_selected').
                    onclick = onRemoveSeveral;
                document.querySelector (
                    '#slickgrid_document_lister_refresh').
                    onclick = OfficeJS_slickgrid.refresh;
                grid.onClick.subscribe(onClickFunction);
                grid.onSort.subscribe(onSortFunction);
            }
        },
        update: function () {
            OfficeJS.system.applications['slickgrid'].lib.reload();
        }
    };
    OfficeJS.system.preferences['documentlister'] =
        OfficeJS.system.applications['slickgrid'];
    // End slickgrid //

    // work in progress //
    OfficeJS.system.applications['workinprogress'] = {
        type:          'activities',
        name:          'workinprogress',
        'class':       'viewer',
        componentpath: 'component/workinprogress.html',
        gadgetid:      'page-content',
        main_elmnt:    '#workinprogress_activities',
        api: {},
        lib:{
            id: null,
            start: function () {
                if (OfficeJS.system.applications['workinprogress'].
                    lib.id === null) {
                    var update = function () {
                        var act = OfficeJS.run.jio.getJobArray(), i, str = '';
                        for (i = 0; i < act.length; i+= 1) {
                            str += act[i].command.label +' try number '+
                                act[i].command.tried + '<br />';
                        }
                        if (OfficeJS.tmp.lastfailure) {
                            str += '<span style="color:red;">Last failure: '+
                                OfficeJS.tmp.lastfailure.label +
                                ', status: '+OfficeJS.tmp.lastfailure.status+
                                ', reason: '+OfficeJS.tmp.lastfailure.reason+
                                '</span><br/>';
                        }
                        if (str === '') {
                            str = 'There is no on going tasks.<br />';
                        }
                        document.querySelector (
                            OfficeJS.system.applications['workinprogress'].
                                main_elmnt).innerHTML = str;
                    };
                    update();
                    OfficeJS.system.applications['workinprogress'].
                        lib.id = setInterval (update, 200);
                }
            },
            stop: function () {
                if (OfficeJS.system.applications['workinprogress'].
                    lib.id !== null) {
                    clearInterval(OfficeJS.system.applications[
                        'workinprogress'].lib.id);
                    OfficeJS.system.applications['workinprogress'].
                        lib.id = null;
                }
            }
        },
        onload: function () {
            setTimeout(function(){
                OfficeJS.system.applications['workinprogress'].lib.start();
            },50);
        },
        onunload: function () {
            OfficeJS.system.applications['workinprogress'].lib.stop();
            return true;
        }
    };
    OfficeJS.system.preferences['activities'] =
        OfficeJS.system.applications['workinprogress'];
    // End work in progress //

    // basic conflict solver //
    OfficeJS.system.applications['basic_conflict_solver'] = {
        type:          'conflictsolver',
        'class':       'editor',
        name:          'basic_conflict_solver',
        componentpath: 'component/basic_conflict_solver.html',
        gadgetid:      'page-conflict',
        varname:       'OfficeJS_basic_conflict_solver',
        docid_elmnt:   '#basic_conflict_solver_docid',
        main_elmnt:    '#basic_conflict_solver_div',
        api: {
            abort: function () {
                OfficeJS.lib.openApplication(
                    OfficeJS.system.applications['close_conflict_solver']);
            },
            removeRevision: function () {
                OfficeJS.system.applications['top_nav_bar'].lib.spin('remove');
                OfficeJS.tmp.basic_conflict_solver_current_conflict.value.
                    _solveConflict(
                        {conflicts:true,revs:true,revs_info:true},
                        function (err,val) {
                            OfficeJS.system.applications['top_nav_bar'].lib.
                                endspin('remove');
                            if (err && err.conflicts.total_rows > 0) {
                                OfficeJS.lib.openApplication(
                                    OfficeJS.lib.getAppFromPref(
                                        'conflictsolver'));
                            }
                            OfficeJS.lib.allDocs ( function () {
                                if (OfficeJS.tmp['page-content'].type ===
                                    'documentlister') {
                                    OfficeJS.tmp['page-content'].update?
                                        OfficeJS.tmp['page-content'].update():
                                        true;
                                }
                            });
                            if (OfficeJS.tmp['page-content']['class'] ===
                                'editor') {
                                OfficeJS.tmp['page-content'].update?
                                    OfficeJS.tmp['page-content'].update(''):
                                    true;
                            }
                        });
                OfficeJS.system.applications['basic_conflict_solver'].
                    api.abort();
            },
            keepRevision: function (revision) {
                var content = $('#'+revision).text();
                OfficeJS.system.applications['top_nav_bar'].lib.spin('save');
                OfficeJS.tmp.basic_conflict_solver_current_conflict.value.
                    _solveConflict(
                        content,
                        {conflicts:true,revs:true,revs_info:true},
                        function (err,val) {
                            OfficeJS.system.applications['top_nav_bar'].lib.
                                endspin('save');
                            if (err && err.conflicts.total_rows > 0) {
                                OfficeJS.lib.openApplication(
                                    OfficeJS.lib.getAppFromPref(
                                        'conflictsolver'));
                            }
                            OfficeJS.lib.allDocs ( function () {
                                if (OfficeJS.tmp['page-content'].type ===
                                    'documentlister') {
                                    OfficeJS.tmp['page-content'].update?
                                        OfficeJS.tmp['page-content'].update():
                                        true;
                                }
                            });
                            if (OfficeJS.tmp['page-content']['class'] ===
                                'editor') {
                                OfficeJS.tmp['page-content'].update?
                                    OfficeJS.tmp['page-content'].update(
                                        content):
                                    true;
                            }
                        });
                OfficeJS.system.applications['basic_conflict_solver'].
                    api.abort();
            }
        },
        lib:{
            addRevision: function (doc) {
                setTimeout( function () {
                    document.querySelector (OfficeJS.system.applications[
                        'basic_conflict_solver'].main_elmnt+' #revisions').
                        innerHTML += '<div class="row-fluid"><div class="span12">'+
                        '<div>'+(new Date(doc._last_modified)).toString()+'</div>'+
                        '<div><textarea id="'+doc._rev+'">'+doc.content+
                        '</textarea></div>'+
                        '<div><button onclick="'+
                        //'console.log('+"'"+revision+"'"+');'+
                        "OfficeJS_basic_conflict_solver.keepRevision('"+doc._rev+"');"+
                        '">Save this one</button></div><hr/>'+
                        '</div></div>';
                },50);
            },
            addRemovedRevision: function (doc) {
                setTimeout( function () {
                    document.querySelector (OfficeJS.system.applications[
                        'basic_conflict_solver'].main_elmnt+' #revisions').
                        innerHTML += '<div class="row-fluid"><div class="span12">'+
                        '<div>'+(new Date(doc._last_modified)).toString()+'</div>'+
                        '<div>Removed</div>'+
                        '<div><button onclick="'+
                        //'console.log('+"'"+revision+"'"+');'+
                        "OfficeJS_basic_conflict_solver.removeRevision();"+
                        '">Save this one</button></div><hr/>'+
                        '</div></div>';
                },50);
            }
        },
        onload: function (doc) {
            // doc.row
            OfficeJS.tmp.basic_conflict_solver_current_conflict = doc.row;
            setTimeout(function(){
                document.querySelector (
                    OfficeJS.system.applications[
                        'basic_conflict_solver'].docid_elmnt
                ).textContent = doc._id;
            },50); // FIXME : wait for init end
            console.log (OfficeJS.tmp.basic_conflict_solver_current_conflict);
            var i;
            for (i = 0; i < OfficeJS.tmp.basic_conflict_solver_current_conflict.
                 key.length; i+= 1) {
                console.log ('a');
                OfficeJS.system.applications['top_nav_bar'].lib.spin('load');
                OfficeJS.lib.get(
                    doc._id,
                    OfficeJS.tmp.basic_conflict_solver_current_conflict.key[i],
                    function (err,val) {
                        OfficeJS.system.applications['top_nav_bar'].lib.
                            endspin('load');
                        if (val) {
                            OfficeJS.system.applications[
                                'basic_conflict_solver'].
                                lib.addRevision(val);
                        } else if (err && err.status === 404) {
                            OfficeJS.system.applications[
                                'basic_conflict_solver'].
                                lib.addRemovedRevision(err);
                        }
                    });
            }
        }
    };
    OfficeJS.system.preferences['conflictsolver'] =
        OfficeJS.system.applications['basic_conflict_solver'];
    // End basic conflict solver //

    OfficeJS.system.applications['close_conflict_solver'] = {
        componentpath: 'component/empty.html',
        gadgetid:      'page-conflict'
    };
    //////////////////////////////////////////////////////////////////////

    odf(OfficeJS.lib,'basename',function (docid) {
        var basename = docid.split('.').slice(0,-1).join('.');
        if (basename === '') {
            return docid;
        }
        return basename;
    });
    odf(OfficeJS.lib,'extOf',function (docid) {
        var ext = docid.split('.').splice(-1)[0];
        if (ext === docid) {
            return '';
        }
        return ext;
    });
    odf(OfficeJS.lib,'put',function (doc,callback) {
        if (OfficeJS.run.jio) {
            if (OfficeJS.tmp[doc._id + ' knownrevision']) {
                doc._rev = OfficeJS.tmp[doc._id + ' knownrevision'];
            }
            OfficeJS.system.applications['top_nav_bar'].lib.spin('save');
            OfficeJS.run.jio.put(
                doc,{conflicts:true,revs:true,revs_info:true},
                function (err,val) {
                    OfficeJS.system.applications['top_nav_bar'].lib.
                        endspin('save');
                    OfficeJS.tmp[doc._id + ' knownrevision'] =
                        (err||val||{rev:undefined}).rev;
                    if (err) {
                        OfficeJS.tmp.lastfailure =
                            OfficeJS.lib.cloneObjectRoot(err);
                        OfficeJS.tmp.lastfailure.label = 'put';
                        OfficeJS.tmp.lastfailure.docid = doc._id;
                    }
                    if ((err||val).conflicts &&
                        (err||val).conflicts.total_rows > 0) {
                        OfficeJS.lib.openApplication(
                            OfficeJS.lib.getAppFromPref(
                                'conflictsolver'),
                            {_id:doc._id,row:(err||val).conflicts.rows[0]}
                        );
                    }
                    callback?callback(err,val):true;
                }
            );
        }
    });
    odf(OfficeJS.lib,'get',function (docid,rev,callback) {
        if (OfficeJS.run.jio) {
            var opts = {conflicts:true,revs:true,revs_info:true,max_retry:3};
            if (rev) {
                opts.rev = rev;
            }
            OfficeJS.system.applications['top_nav_bar'].lib.spin('load');
            OfficeJS.run.jio.get(
                docid,opts,
                function (err,val) {
                    OfficeJS.system.applications['top_nav_bar'].lib.
                        endspin('load');
                    if (!rev) {
                        OfficeJS.tmp[docid + ' knownrevision'] =
                            (err||val||{_rev:undefined})._rev;
                        if ((err||val)._conflicts &&
                            (err||val)._conflicts.total_rows > 0) {
                            OfficeJS.lib.openApplication(
                                OfficeJS.lib.getAppFromPref(
                                    'conflictsolver'),
                                {_id:docid,row:(err||val)._conflicts.rows[0]}
                            );
                        }
                    }
                    if (err) {
                        OfficeJS.tmp.lastfailure =
                            OfficeJS.lib.cloneObjectRoot(err);
                        OfficeJS.tmp.lastfailure.label = 'get';
                        OfficeJS.tmp.lastfailure.docid = docid;
                    }
                    callback?callback(err,val):true;
                }
            );
        }
    });
    odf(OfficeJS.lib,'allDocs',function (callback) {
        if (OfficeJS.run.jio) {
            OfficeJS.system.applications['top_nav_bar'].lib.spin('getlist');
            OfficeJS.run.jio.allDocs(
                {conflicts:true,revs:true,revs_info:true,max_retry:3},
                function (err,val) {
                    OfficeJS.system.applications['top_nav_bar'].lib.
                        endspin('getlist');
                    if (val) {
                        OfficeJS.tmp.documentlist = val;
                    } else if (err) {
                        OfficeJS.tmp.lastfailure =
                            OfficeJS.lib.cloneObjectRoot(err);
                        OfficeJS.tmp.lastfailure.label = 'allDocs';
                    }
                    callback?callback(err,val):true;
                }
            );
        }
    });
    odf(OfficeJS.lib,'remove',function (doc,rev,callback) {
        if (OfficeJS.run.jio) {
            var opts = {conflicts:true,revs:true,revs_info:true};
            if (rev) {
                opts.rev = rev;
            } else if (OfficeJS.tmp[doc._id + ' knownrevision']) {
                opts.rev = OfficeJS.tmp[doc._id + ' knownrevision'];
            }
            OfficeJS.system.applications['top_nav_bar'].lib.spin('remove');
            OfficeJS.run.jio.remove(
                doc,opts,
                function (err,val) {
                    OfficeJS.system.applications['top_nav_bar'].lib.
                        endspin('remove');
                    if (err) {
                        OfficeJS.tmp.lastfailure =
                            OfficeJS.lib.cloneObjectRoot(err);
                        OfficeJS.tmp.lastfailure.label = 'remove';
                        OfficeJS.tmp.lastfailure.docid = doc._id;
                    }
                    callback?callback(err,val):true;
                }
            );
        }
    });
    odf(OfficeJS.lib,'getAppFromPref',function (spec) {
        return OfficeJS.system.preferences[spec];
    });
    odf(OfficeJS.lib,'getAppFromMime',function (ext) {
        return OfficeJS.lib.getAppFromPref(OfficeJS.system.mime[ext]);
    });
    odf(OfficeJS.lib,'cloneObjectRoot',function (obj) {
        var cloned_obj = {}, key;
        for (key in obj) {
            cloned_obj[key] = obj[key];
        }
        return cloned_obj;
    });
    odf(OfficeJS.lib,'cloneAndProtectObjectRoot',function (obj) {
        var cloned_obj = {}, key;
        for (key in obj) {
            odf(cloned_obj,key,obj[key]);
        }
        return cloned_obj;
    });
    odf(OfficeJS.lib,'openApplication',function (app,obj) {
        // unload
        if (app.gadgetid && OfficeJS.tmp[app.gadgetid] &&
            OfficeJS.tmp[app.gadgetid].onunload) {
            if (!OfficeJS.tmp[app.gadgetid].onunload()) {
                return false;
            }
        }
        // set api
        if (app.varname) {
            scope[app.varname]=OfficeJS.lib.cloneAndProtectObjectRoot(app.api);
        }
        // open
        TabbularGadget.addNewTabGadget(app.componentpath,app.gadgetid);
        OfficeJS.tmp[app.gadgetid] = app;
        // load
        if (app.onload) {
            app.onload(obj);
        }
        return true;
    });
    odf(OfficeJS.lib,'hideApplication',function (app) {
        // TODO : 
    });

    //////////////////////////////////////////////////////////////////////

    odf(OfficeJS.command,'getEnv',function (env) {
        return OfficeJS.env[env];
    });
    odf(OfficeJS.command,'setEnv',function (env,value) {
        OfficeJS.env[env] = value;
    });
    odf(OfficeJS.command,'setPreference',function (id,value) {
        // TODO : 
    });

    //////////////////////////////////////////////////////////////////////

    odf(scope,'OfficeJS',OfficeJS.command);

    OfficeJS.lib.openApplication(OfficeJS.system.applications['top_nav_bar']);
    OfficeJS.lib.openApplication(OfficeJS.system.applications['left_nav_bar']);
    OfficeJS.lib.openApplication(OfficeJS.system.applications['login']);
}(window));
