// Class jio
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    var jio_id_array_name = 'jio/id_array';
    priv.id = 1;
    priv.storage = jioNamespace.storage(spec, that);

    // initialize //
    (function () {
        // Initialize the jio id and add the new id to the list
        var i,
        jio_id_a = LocalOrCookieStorage.getItem (jio_id_array_name) || [];
        for (i = 0; i < jio_id_a.length; i+= 1) {
            if (jio_id_a[i] >= priv.id) {
                priv.id = jio_id_a[i] + 1;
            }
        }
        jio_id_a.push(priv.id);
        LocalOrCookieStorage.setItem (jio_id_array_name,jio_id_a);
    }());
    (function (){
        // Start Jio updater, and the jobManager
        activityUpdater.setId(priv.id);
        activityUpdater.start();
        jobManager.setId(priv.id);
        jobManager.start();
    }());

    // Methods //
    that.start = function() {
        jobManager.start();
    };
    that.stop = function() {
        jobManager.stop();
    };

    /**
     * Returns the jio id.
     * @method getId
     * @return {number} The jio id.
     */
    that.getId = function() {
        return priv.id;
    };

    /**
     * Checks if the storage description is valid or not.
     * @method validateStorageDescription
     * @param  {object} description The description object.
     * @return {boolean} true if ok, else false.
     */
    that.validateStorageDescription = function(description) {
        return jioNamespace.storage(description.type)(description).isValid();
    };

    /**
     * Save a document.
     * @method saveDocument
     * @param  {string} path The document path name.
     * @param  {string} content The document's content.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.saveDocument = function(path, content, option, specificstorage) {
        option            = option            || {};
        option.onResponse = option.onResponse || function(){};
        option.onDone     = option.onDone     || function(){};
        option.onFail     = option.onFail     || function(){};
        option.max_retry  = option.max_retry  || 0;
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:saveDocument(
                     {path:path,content:content,option:option})}));
    };

    /**
     * Load a document.
     * @method loadDocument
     * @param  {string} path The document path name.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata.
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.loadDocument = function(path, option, specificstorage) {
        option               = option               || {};
        option.onResponse    = option.onResponse    || function(){};
        option.onDone        = option.onDone        || function(){};
        option.onFail        = option.onFail        || function(){};
        option.max_retry     = option.max_retry     || 0;
        option.metadata_only = (option.metadata_only !== undefined?
                                option.metadata_only:false);
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:loadDocument(
                     {path:path,option:option})}));
    };

    /**
     * Remove a document.
     * @method removeDocument
     * @param  {string} path The document path name.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.removeDocument = function(path, option, specificstorage) {
        option            = option            || {};
        option.onResponse = option.onResponse || function(){};
        option.onDone     = option.onDone     || function(){};
        option.onFail     = option.onFail     || function(){};
        option.max_retry  = option.max_retry  || 0;
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:removeDocument(
                     {path:path,option:option})}));
    };

    /**
     * Get a document list from a folder.
     * @method getDocumentList
     * @param  {string} path The folder path.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.getDocumentList = function(path, option, specificstorage) {
        option               = option               || {};
        option.onResponse    = option.onResponse    || function(){};
        option.onDone        = option.onDone        || function(){};
        option.onFail        = option.onFail        || function(){};
        option.max_retry     = option.max_retry     || 0;
        option.metadata_only = (option.metadata_only !== undefined?
                                option.metadata_only:true);
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:getDocumentList(
                     {path:path,option:option})}));
    };

    return that;
};                              // End Class jio
