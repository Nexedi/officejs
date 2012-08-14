// Class jio
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    var jio_id_array_name = 'jio/id_array';
    priv.id = null;

    my.jobManager = jobManager;
    my.jobIdHandler = jobIdHandler;
    priv.storage_spec = spec;

    // initialize //
    priv.init = function() {
        // Initialize the jio id and add the new id to the list
        if (priv.id === null) {
            var i, jio_id_a =
                LocalOrCookieStorage.getItem (jio_id_array_name) || [];
            priv.id = 1;
            for (i = 0; i < jio_id_a.length; i+= 1) {
                if (jio_id_a[i] >= priv.id) {
                    priv.id = jio_id_a[i] + 1;
                }
            }
            jio_id_a.push(priv.id);
            LocalOrCookieStorage.setItem (jio_id_array_name,jio_id_a);
            activityUpdater.setId(priv.id);
            jobManager.setId(priv.id);
        }
    };

    // Methods //
    that.start = function() {
        priv.init();
        activityUpdater.start();
        jobManager.start();
    };
    that.stop = function() {
        jobManager.stop();
    };
    that.close = function() {
        activityUpdater.stop();
        jobManager.stop();
        priv.id = null;
    };
    that.start();

    /**
     * Returns the jio id.
     * @method getId
     * @return {number} The jio id.
     */
    that.getId = function() {
        return priv.id;
    };

    /**
     * Returns the jio job rules object used by the job manager.
     * @method getJobRules
     * @return {object} The job rules object
     */
    that.getJobRules = function() {
        return jobRules;
    };

    /**
     * Checks if the storage description is valid or not.
     * @method validateStorageDescription
     * @param  {object} description The description object.
     * @return {boolean} true if ok, else false.
     */
    that.validateStorageDescription = function(description) {
        return jioNamespace.storage(description, my).isValid();
    };

    that.getJobArray = function () {
        return jobManager.serialized();
    };

    priv.getParam = function (list,nodoc) {
        var param = {}, i = 0;
        if (!nodoc) {
            param.doc = list[i];
            i ++;
        }
        if (typeof list[i] === 'object') {
            param.options = list[i];
            i ++;
        } else {
            param.options = {};
        }
        param.callback = function (err,val){};
        param.success = function (val) {
            param.callback(undefined,val);
        };
        param.error = function (err) {
            param.callback(err,undefined);
        };
        if (typeof list[i] === 'function') {
            if (typeof list[i+1] === 'function') {
                param.success = list[i];
                param.error = list[i+1];
            } else {
                param.callback = list[i];
            }
        }
        return param;
    };

    priv.addJob = function (commandCreator,spec) {
        jobManager.addJob(
            job({storage:jioNamespace.storage(priv.storage_spec,my),
                 command:commandCreator(spec,my)},my));
    };

    // /**
    //  * Post a document.
    //  * @method post
    //  * @param  {object} doc The document {"content":}.
    //  * @param  {object} options (optional) Contains some options:
    //  * - {number} max_retry The number max of retries, 0 = infinity.
    //  * - {boolean} revs Include revision history of the document.
    //  * - {boolean} revs_info Retreive the revisions.
    //  * - {boolean} conflicts Retreive the conflict list.
    //  * @param  {function} callback (optional) The callback(err,response).
    //  * @param  {function} error (optional) The callback on error, if this
    //  *     callback is given in parameter, "callback" is changed as "success",
    //  *     called on success.
    //  */
    // that.post = function() {
    //     var param = priv.getParam(arguments);
    //     param.options.max_retry = param.options.max_retry || 0;
    //     priv.addJob(postCommand,{
    //         doc:param.doc,
    //         options:param.options,
    //         callbacks:{success:param.success,error:param.error}
    //     });
    // };

    /**
     * Put a document.
     * @method put
     * @param  {object} doc The document {"_id":,"_rev":,"content":}.
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Retreive the revisions.
     * - {boolean} conflicts Retreive the conflict list.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.put = function() {
        var param = priv.getParam(arguments);
        param.options.max_retry = param.options.max_retry || 0;
        priv.addJob(putCommand,{
            doc:param.doc,
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    /**
     * Get a document.
     * @method get
     * @param  {string} docid The document id (the path).
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata.
     * - {string} rev The revision we want to get.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Include list of revisions, and their availability.
     * - {boolean} conflicts Include a list of conflicts.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.get = function() {
        var param = priv.getParam(arguments);
        param.options.max_retry = param.options.max_retry || 3;
        param.options.metadata_only = (
            param.options.metadata_only !== undefined?
                param.options.metadata_only:false);
        priv.addJob(getCommand,{
            docid:param.doc,
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    /**
     * Remove a document.
     * @method remove
     * @param  {object} doc The document {"_id":,"_rev":}.
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Include list of revisions, and their availability.
     * - {boolean} conflicts Include a list of conflicts.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.remove = function() {
        var param = priv.getParam(arguments);
        param.options.max_retry = param.options.max_retry || 0;
        priv.addJob(removeCommand,{
            doc:param.doc,
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    /**
     * Get a list of documents.
     * @method allDocs
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata
     * - {boolean} descending Reverse the order of the output table.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Include revisions.
     * - {boolean} conflicts Include conflicts.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.allDocs = function() {
        var param = priv.getParam(arguments,'no doc');
        param.options.max_retry = param.options.max_retry || 3;
        param.options.metadata_only = (
            param.options.metadata_only !== undefined?
                param.options.metadata_only:true);
        priv.addJob(allDocsCommand,{
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    return that;
};                              // End Class jio
