var newDAVStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'base' ), priv = {};

    priv.username = spec.username || '';
    priv.applicationname = spec.applicationname || 'untitled';
    priv.url = spec.url || '';
    priv.password = spec.password || ''; // TODO : is it secured ?

    var super_serialized = that.serialized;
    that.serialized = function() {
        var o = super_serialized();
        o.username = priv.username;
        o.applicationname = priv.applicationname;
        o.url = priv.url;
        o.password = priv.password; // TODO : not realy secured...
        return o;
    };

    /**
     * If some other parameters is needed, it returns an error message.
     * @method validateState
     * @return {string} '' -> ok, 'message' -> error
     */
    that.validateState = function() {
        if (priv.username && priv.url) {
            return '';
        }
        return 'Need at least 2 parameters: "username" and "url".';
    };

    /**
     * Saves a document in the distant dav storage.
     * @method saveDocument
     */
    that.saveDocument = function (command) {

        // TODO if path of /dav/user/applic does not exists, it won't work!
        //// save on dav
        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/' +
                command.getPath(),
            type: 'PUT',
            data: command.getContent(),
            async: true,
            dataType: 'text', // TODO is it necessary ?
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username+':'+priv.password)},
            // xhrFields: {withCredentials: 'true'}, // cross domain
            success: function () {
                that.done();
            },
            error: function (type) {
                type.message = 'Cannot save "' + command.getPath() +
                    '" into DAVStorage.';
                that.fail(type);
            }
        } );
        //// end saving on dav
    };

    /**
     * Loads a document from a distant dav storage.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var doc = {},
        getContent = function () {
            $.ajax ( {
                url: priv.url + '/dav/' +
                    priv.username + '/' +
                    priv.applicationname + '/' +
                    command.getPath(),
                type: "GET",
                async: true,
                dataType: 'text', // TODO is it necessary ?
                headers: {'Authorization':'Basic '+Base64.encode(
                    priv.username + ':' + priv.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function (content) {
                    doc.content = content;
                    that.done(doc);
                },
                error: function (type) {
                    if (type.status === 404) {
                        type.message = 'Document "' +
                            command.getPath() +
                            '" not found in localStorage.';
                    } else {
                        type.message =
                            'Cannot load "' + command.getPath() +
                            '" from DAVStorage.';
                    }
                    that.fail(type);
                }
            } );
        };
        doc.name = command.getPath(); // TODO : basename
        // NOTE : if (command.getOption('content_only') { return getContent(); }
        // Get properties
        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/' +
                command.getPath(),
            type: "PROPFIND",
            async: true,
            dataType: 'xml',
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username + ':' + priv.password )},
            success: function (xmlData) {
                // doc.last_modified =
                $(xmlData).find(
                    'lp1\\:getlastmodified, getlastmodified'
                ).each( function () {
                    doc.last_modified = $(this).text();
                });
                $(xmlData).find(
                    'lp1\\:creationdate, creationdate'
                ).each( function () {
                    doc.creation_date = $(this).text();
                });
                if (!command.getOption('metadata_only')) {
                    getContent();
                } else {
                    that.done(doc);
                }
            },
            error: function (type) {
                type.message = 'Cannot load "' + command.getPath() +
                    '" informations from DAVStorage.';
                that.fail(type);
            }
        } );
    };

    /**
     * Gets a document list from a distant dav storage.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var document_array = [], file = {}, path_array = [];

        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/',
            async: true,
            type: 'PROPFIND',
            dataType: 'xml',
            headers: {'Authorization': 'Basic '+Base64.encode(
                priv.username + ':' + priv.password ), Depth: '1'},
            success: function (xmlData) {
                $(xmlData).find(
                    'D\\:response, response'
                ).each( function(i,data){
                    if(i>0) { // exclude parent folder
                        file = {};
                        $(data).find('D\\:href, href').each(function(){
                            path_array = $(this).text().split('/');
                            file.name =
                                (path_array[path_array.length-1] ?
                                 path_array[path_array.length-1] :
                                 path_array[path_array.length-2]+'/');
                        });
                        if (file.name === '.htaccess' ||
                            file.name === '.htpasswd') { return; }
                        $(data).find(
                            'lp1\\:getlastmodified, getlastmodified'
                        ).each(function () {
                            file.last_modified = $(this).text();
                        });
                        $(data).find(
                            'lp1\\:creationdate, creationdate'
                        ).each(function () {
                            file.creation_date = $(this).text();
                        });
                        document_array.push (file);
                    }
                });
                that.done(document_array);
            },
            error: function (type) {
                type.message =
                    'Cannot get a document list from DAVStorage.';
                that.fail(type);
            }
        } );
    };

    /**
     * Removes a document from a distant dav storage.
     * @method removeDocument
     */
    that.removeDocument = function (command) {

        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/' +
                command.getPath(),
            type: "DELETE",
            async: true,
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username + ':' + priv.password )},
            // xhrFields: {withCredentials: 'true'}, // cross domain
            success: function () {
                that.done();
            },
            error: function (type) {
                if (type.status === 404) {
                    that.done();
                } else {
                    type.message = 'Cannot remove "' + that.getFileName() +
                        '" from DAVStorage.';
                    that.fail(type);
                }
            }
        } );
    };

    return that;
};
Jio.addStorageType('dav', newDAVStorage);
