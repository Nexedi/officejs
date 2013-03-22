(function (scope) {
  "use strict";
  var OfficeJS, secureKey, secureObject;
  secureKey = function (obj, key, parameters) {
    parameters = parameters || {};
    Object.defineProperty(obj, key, {
      configurable: parameters.configurable || false,
      enumerable: parameters.enumerable || false,
      writable: parameters.writable || false,
      value: obj[key]
    });
  };
  secureObject = function (obj, parameters) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        secureKey(obj, key, parameters);
      }
    }
  };
  OfficeJS = {};
  //////////////////////////////////////////////////////////////////////

  OfficeJS.env = {};
  OfficeJS.tmp = {};
  OfficeJS.system = {};
  OfficeJS.run = {};
  OfficeJS.lib = {};
  OfficeJS.command = {};
  OfficeJS.io = {};
  secureObject(OfficeJS);
  //////////////////////////////////////////////////////////////////////

  OfficeJS.system.component_folder_path = 'src/component';
  OfficeJS.system.preferences = {};
  OfficeJS.system.applications = {};
  OfficeJS.system.mime = {};
  OfficeJS.system.icon = {};

  // Top Nav Bar //
  OfficeJS.system.applications['top_nav_bar'] = {
    name:          'top_nav_bar',
    componentpath: OfficeJS.system.component_folder_path +
      '/top_nav_bar.html',
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
    componentpath: OfficeJS.system.component_folder_path +
      '/left_nav_bar.html',
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
    componentpath: OfficeJS.system.component_folder_path +
      '/login.html',
    gadgetid:      'page-content',
    varname:       'OfficeJS_login',
    api: {
      connect: function (spec) {
        if (OfficeJS.run.jio) {
          OfficeJS.run.jio.close();
          delete OfficeJS.run.jio;
        }
        if (!OfficeJS.run.jio) {
          if (typeof spec === 'string') {
            spec = JSON.parse (spec);
          }
          OfficeJS.run.jio = jIO.newJio(spec);
          OfficeJS.system.applications['left_nav_bar'].
            lib.showTools();
          OfficeJS.lib.getDocumentList();
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
    componentpath: OfficeJS.system.component_folder_path +
      '/about.html',
    gadgetid:      'page-content'
  };
  // End about //

  // contact //
  OfficeJS.system.applications['contact'] = {
    type:          'contact',
    'class':       'viewer',
    name:          'contact',
    componentpath: OfficeJS.system.component_folder_path +
      '/contact.html',
    gadgetid:      'page-content'
  };
  // End contact //

  // elRTE //
  OfficeJS.system.applications['elrte'] = {
    type:          'html-editor',
    name:          'elrte',
    'class':       'editor',
    componentpath: OfficeJS.system.component_folder_path +
      '/elrte.html',
    gadgetid:      'page-content',
    varname:       'OfficeJS_elrte',
    exts:          ['html'],
    default_ext:   'html',
    mime_type:     'text/html',
    document_type: "WebPage",
    docid_elmnt:   '#elrte_docid',
    editor_elmnt:  '#elrte_editor',
    api: {
      save: function () {
        var id, body;
        id = OfficeJS.system.applications['elrte'].
          lib.getDocId();
        body = OfficeJS.system.applications['elrte'].
          lib.getContent();
        if (id) {
          OfficeJS.io.saveDocument(
            OfficeJS.system.applications.elrte,
            id + "." + OfficeJS.system.applications.elrte.default_ext,
            body || ""
          );
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
      OfficeJS.tmp.current_file = undefined;
      if (doc) {
        OfficeJS.tmp.current_file = doc._id;
        setTimeout(function(){
          OfficeJS.system.applications['elrte'].
            lib.setDocId(OfficeJS.lib.basename(doc._id));
          OfficeJS.system.applications['elrte'].
            lib.setContent('loading...');
          OfficeJS.io.loadDocument(doc._id, function (err, val) {
            if (val) {
              OfficeJS.tmp.recent_files[doc._id] = val.metadata;
              OfficeJS.system.applications['elrte'].
                lib.setContent(val.body);
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
    componentpath: OfficeJS.system.component_folder_path +
      '/svg-edit.html',
    gadgetid:      'page-content',
    varname:       'OfficeJS_svgedit',
    exts:          ['svg'],
    default_ext:   'svg',
    mime_type:     "image/svg+xml",
    document_type: "Image",
    docid_elmnt:   '#svg-edit_docid',
    editor_elmnt:  '#svg-edit_frame',
    api: {
      save: function () {
        var id, body;
        id = OfficeJS.system.applications['svg-edit'].
          lib.getDocId();
        body = OfficeJS.system.applications['svg-edit'].
          lib.getContent();
        if (id) {
          OfficeJS.io.saveDocument(
            OfficeJS.system.applications['svg-edit'],
            id + '.' + OfficeJS.system.applications['svg-edit'].default_ext,
            body || ""
          );
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
      OfficeJS.tmp.current_file = undefined;
      if (doc) {
        OfficeJS.tmp.current_file = doc._id;
        setTimeout(function(){
          OfficeJS.system.applications['svg-edit'].
            lib.setDocId(OfficeJS.lib.basename(doc._id));
          OfficeJS.io.loadDocument(doc._id,function (err,val) {
            if (val) {
              OfficeJS.tmp.recent_files[doc._id] = val.metadata;
              OfficeJS.system.applications['svg-edit'].
                lib.setContent(val.body);
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
    componentpath: OfficeJS.system.component_folder_path +
      '/jquery-sheet.html',
    gadgetid:      'page-content',
    varname:       'OfficeJS_jquerysheet',
    exts:          ['jqs'],
    default_ext:   'jqs',
    mime_type:     "text/html",
    document_type: "Spreadsheet",
    docid_elmnt:   '#jquery-sheet_docid',
    sheet_elmnt:   '#jQuerySheet',
    api: {
      save: function () {
        var id, body;
        id = OfficeJS.system.applications['jquery-sheet'].
          lib.getDocId();
        body = OfficeJS.system.applications['jquery-sheet'].
          lib.getContent();
        if (id) {
          OfficeJS.io.saveDocument(
            OfficeJS.system.applications['jquery-sheet'],
            id + '.' + OfficeJS.system.applications['jquery-sheet'].default_ext,
            body || ''
          );
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
          urlGet: OfficeJS.system.component_folder_path +
            '/newspreadsheet.html',
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
      OfficeJS.tmp.current_file = undefined;
      if (doc) {
        OfficeJS.tmp.current_file = doc._id;
        setTimeout(function(){
          OfficeJS.system.applications['jquery-sheet'].
            lib.setDocId(OfficeJS.lib.basename(doc._id));
          OfficeJS.io.loadDocument(doc._id, function (err,val) {
            if (val) {
              OfficeJS.tmp.recent_files[doc._id] = val.metadata;
              OfficeJS.system.applications['jquery-sheet'].
                lib.setContent(val.body);
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
    componentpath: OfficeJS.system.component_folder_path +
      '/slickgrid_document_lister.html',
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
        OfficeJS.lib.getDocumentList(function (err,val) {
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
        document_list,columns,options,
        showConflict = function (arrayi,row) {
          return function () {
            OfficeJS.lib.openApplication(
              OfficeJS.lib.getAppFromPref(
                'conflictsolver'),
              {_id:arrayi.id,row:row} // wrong
            );
          };
        };

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
          var arrayi = {}, cd, j;
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
                arrayi.showConflict = showConflict(arrayi,row);
                break;
              }
            }
          }
          // dates
          // FIXME : we can have 2012/1/1 12:5
          // we should have 2012/01/01 12:05
          cd = (new Date(document_list.rows[i].doc.last_modified));
          arrayi.last_modified = cd.getFullYear()+'/'+
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
        columns.push({id:"last_modified",name:"Modification Date",
                      field:"last_modified",sortable:true});
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
              result = (value1===value2?0:
                        (value1>value2?1:-1))*sign;
              if (result !== 0) {
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
            if (array[cell.row].showConflict) {
              array[cell.row].showConflict();
            }
          }
        };
        onRemoveSeveral = function () {
          var document_name_array = [], selected, i, l, cpt = 0,
          removeFun = function (err,val) {
            cpt ++;
            if (l === cpt) {
              OfficeJS_slickgrid.refresh();
            }
          };
          selected = grid.getSelectedRows();
          for (i = 0, l = selected.length; i < l; i+= 1) {
            OfficeJS.lib.removeDocument(
              document_list.rows[selected[i]].id,
              removeFun);
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
    componentpath: OfficeJS.system.component_folder_path +
      '/workinprogress.html',
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
      OfficeJS.tmp.current_file = undefined;
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
    componentpath: OfficeJS.system.component_folder_path +
      '/basic_conflict_solver.html',
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
              OfficeJS.lib.getDocumentList(function () {
                if (OfficeJS.tmp['page-content'].type ===
                    'documentlister') {
                  if (OfficeJS.tmp['page-content'].update) {
                    OfficeJS.tmp['page-content'].update();
                  }
                }
              });
              if (OfficeJS.tmp['page-content']['class'] ===
                  'editor') {
                if (OfficeJS.tmp['page-content'].update) {
                  OfficeJS.tmp['page-content'].update('');
                }
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
            "OfficeJS_basic_conflict_solver.removeRevision('"+doc._rev+"');"+
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
      var i,getFun = function (err,val) {
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
      };
      for (i = 0; i < OfficeJS.tmp.basic_conflict_solver_current_conflict.
           key.length; i+= 1) {
        OfficeJS.system.applications['top_nav_bar'].lib.spin('load');
        OfficeJS.lib.get(
          doc._id,
          OfficeJS.tmp.basic_conflict_solver_current_conflict.key[i],
          getFun);
      }
    }
  };
  OfficeJS.system.preferences['conflictsolver'] =
    OfficeJS.system.applications['basic_conflict_solver'];
  // End basic conflict solver //

  OfficeJS.system.applications['close_conflict_solver'] = {
    componentpath: OfficeJS.system.component_folder_path +
      '/empty.html',
    gadgetid:      'page-conflict'
  };
  //////////////////////////////////////////////////////////////////////

  OfficeJS.lib.basename = function (docid) {
    var basename = docid.split('.').slice(0,-1).join('.');
    if (basename === '') {
      return docid;
    }
    return basename;
  };
  OfficeJS.lib.extOf = function (docid) {
    var ext = docid.split('.').splice(-1)[0];
    if (ext === docid) {
      return '';
    }
    return ext;
  };
  OfficeJS.lib.getAppFromPref = function (spec) {
    return OfficeJS.system.preferences[spec];
  };
  OfficeJS.lib.getAppFromMime = function (ext) {
    return OfficeJS.lib.getAppFromPref(OfficeJS.system.mime[ext]);
  };
  OfficeJS.lib.cloneObjectRoot = function (obj) {
    var cloned_obj = {}, key;
    for (key in obj) {
      cloned_obj[key] = obj[key];
    }
    return cloned_obj;
  };
  OfficeJS.lib.cloneAndProtectObjectRoot = function (obj) {
    var cloned_obj = {}, key;
    for (key in obj) {
      cloned_obj[key] = obj[key];
    }
    secureObject(cloned_obj);
    return cloned_obj;
  };
  OfficeJS.lib.openApplication = function (app,obj) {
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
    RenderJs.addGadget(app.gadgetid, app.componentpath);
    OfficeJS.tmp[app.gadgetid] = app;
    // load
    if (app.onload) {
      app.onload(obj);
    }
    return true;
  };
  OfficeJS.lib.hideApplication = function (app) {
    // TODO :
  };
  OfficeJS.lib.setLastFailure = function (err, label, doc_id) {
    OfficeJS.tmp.lastfailure = err;
    OfficeJS.tmp.lastfailure.label = label;
    OfficeJS.tmp.lastfailure.docid = doc_id;
  };
  OfficeJS.lib.getDocumentList = function (callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.io.allDocs(function (err, response) {
        if (response) {
          OfficeJS.tmp.documentlist = response;
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.lib.removeDocument = function (doc_id, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.io.get({"_id": doc_id}, function (err, response) {
        if (err) {
          return;
        }
        OfficeJS.io.remove(response, callback);
      });
    }
  };
  secureObject(OfficeJS.lib);
  //////////////////////////////////////////////////////////////////////

  OfficeJS.command.getEnv = function (env) {
    return OfficeJS.env[env];
  };
  OfficeJS.command.setEnv = function (env,value) {
    OfficeJS.env[env] = value;
  };
  OfficeJS.command.setPreference = function (id,value) {
    // TODO :
  };
  secureObject(OfficeJS.command);
  //////////////////////////////////////////////////////////////////////

  OfficeJS.io.put = function (doc, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("save");
      OfficeJS.run.jio.put(doc, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("save");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "put", "");
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.io.putAttachment = function (attachment, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("save");
      OfficeJS.run.jio.putAttachment(attachment, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("save");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "putAttachment", "");
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.io.get = function (doc, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("load");
      OfficeJS.run.jio.get(doc, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("load");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "get", "");
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.io.getAttachment = function (attachment, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("load");
      OfficeJS.run.jio.getAttachment(attachment, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("load");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "getAttachment", "");
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.io.remove = function (doc, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("remove");
      OfficeJS.run.jio.remove(doc, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("remove");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "remove", "");
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.io.removeAttachment = function (attachment, callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("remove");
      OfficeJS.run.jio.removeAttachment(attachment, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("remove");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "removeAttachment", "");
        }
        callback(err, response);
      });
    }
  };
  OfficeJS.io.allDocs = function (callback) {
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("getlist");
      OfficeJS.run.jio.allDocs({
        "include_docs": true
      }, function (err, response) {
        OfficeJS.system.applications.top_nav_bar.lib.endspin("getlist");
        if (err) {
          OfficeJS.lib.setLastFailure(err, "allDocs", "");
        }
        callback(err, response);
      });
    }
  };

  OfficeJS.io.saveDocument = function (application, doc_id, body, callback) {
    var recent_metadata;
    if (OfficeJS.run.jio) {
      if (OfficeJS.tmp.current_file !== doc_id) {
        // if the document is treated as a new document
        OfficeJS.tmp.current_file = doc_id;
        OfficeJS.tmp.recent_files[doc_id] = {};
      }
      recent_metadata = OfficeJS.tmp.recent_files[doc_id] || {};
      recent_metadata._id = doc_id;
      recent_metadata.last_modified = Date.now();
      recent_metadata.posted_date = recent_metadata.posted_date || Date.now();
        // | TODO check if it is the first time or not
        //  `TODO it is not a W3C date!
      recent_metadata.format = [application.mime_type];
      recent_metadata.type = application.document_type;
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("save");
      OfficeJS.run.jio.put(recent_metadata, function (err, response) {
        if (err) {
          OfficeJS.system.applications.top_nav_bar.lib.endspin("save");
          OfficeJS.lib.setLastFailure(err, "put", doc_id);
          return callback(err, response);
        }
        OfficeJS.tmp.recent_files[doc_id] =
          OfficeJS.tmp.recent_files[doc_id] || {};
        OfficeJS.tmp.recent_files[doc_id]._id = response.id;
        OfficeJS.tmp.recent_files[doc_id]._rev = response.rev;
        OfficeJS.run.jio.putAttachment({
          "_id": doc_id,
          "_attachment": "body",
          "_rev": response.rev,
          "_data": body,
          "_mimetype": application.mime_type
        }, function (err, response) {
          OfficeJS.system.applications.top_nav_bar.lib.endspin("save");
          if (response) {
            OfficeJS.tmp.recent_files[doc_id] =
              OfficeJS.tmp.recent_files[doc_id] || {};
            OfficeJS.tmp.recent_files[doc_id]._id = response.id;
            OfficeJS.tmp.recent_files[doc_id]._rev = response.rev;
            OfficeJS.lib.getDocumentList();
          }
          if (err) {
            OfficeJS.lib.setLastFailure(err, "putAttachment", doc_id);
          }
          callback(err, response);
        });
      });
    }
  };
  OfficeJS.io.loadDocument = function (doc_id, callback) {
    var metadata, body;
    if (OfficeJS.run.jio) {
      callback = callback || function () {};
      OfficeJS.system.applications.top_nav_bar.lib.spin("load");
      OfficeJS.run.jio.get({"_id": doc_id}, {
        "conflicts": true
      }, function (err, response) {
        if (err) {
          OfficeJS.system.applications.top_nav_bar.lib.endspin("load");
          OfficeJS.lib.setLastFailure(err, "get", doc_id);
          return callback(err, response);
        }
        if (response._conflicts) {
          console.log("There's conflicts! Launch conflict solver for " +
                      doc_id + "!");
        }
        metadata = response;
        OfficeJS.run.jio.getAttachment({
          "_id": doc_id,
          "_attachment": "body"
        }, function (err, response) {
          OfficeJS.system.applications.top_nav_bar.lib.endspin("load");
          if (err) {
            OfficeJS.lib.setLastFailure(err, "getAttachment", doc_id);
          }
          callback(err, {"metadata": metadata, "body": response});
        });
      });
    }
  };
  //////////////////////////////////////////////////////////////////////

  scope.OfficeJS = OfficeJS.command;
  secureKey(scope,'OfficeJS');

  OfficeJS.tmp.recent_files = {};
  OfficeJS.lib.openApplication(OfficeJS.system.applications['top_nav_bar']);
  OfficeJS.lib.openApplication(OfficeJS.system.applications['left_nav_bar']);
  OfficeJS.lib.openApplication(OfficeJS.system.applications['login']);
}(window));

// configure RenderJs to skip its built in implicit gadget rendering
// as our application will do that explicitly
var RENDERJS_ENABLE_IMPLICIT_GADGET_RENDERING=false;
