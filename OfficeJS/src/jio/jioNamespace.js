var jioNamespace = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var storage_type_o = {      // -> 'key':constructorFunction
        'base': storage,
        'handler': storageHandler
    };

    // Methods //

    /**
     * Returns a storage from a storage description.
     * @method storage
     * @param  {object} spec The specifications.
     * @param  {object} my The protected object.
     * @param  {string} forcetype Force storage type
     * @return {object} The storage object.
     */
    that.storage = function(spec, my, forcetype) {
        spec = spec || {};
        var type = forcetype || spec.type || 'base';
        if (!storage_type_o[type]) {
            throw invalidStorageType({type:type,
                                      message:'Storage does not exists.'});
        }
        return storage_type_o[type](spec, my);
    };

    /**
     * Creates a new jio instance.
     * @method newJio
     * @param  {object} spec The parameters:
     * - {object} spec.storage: A storage description
     *     - {string} spec.storage.type: The storage type
     *     - {string} spec.storage.username: The user name
     *     - {string} spec.storage.applicationname: The application name
     * @return {object} The new Jio instance.
     */
    that.newJio = function(spec) {
        var storage = spec;
        if (typeof storage === 'string') {
            storage = JSON.parse (storage);
        }
        storage = storage || {type:'base'};
        return jio(spec);
    };

    /**
     * Add a storage type to jio.
     * @method addStorageType
     * @param  {string} type The storage type
     * @param  {function} constructor The associated constructor
     */
    that.addStorageType = function(type, constructor) {
        constructor = constructor || function(){return null;};
        if (storage_type_o[type]) {
            throw invalidStorageType({type:type,message:'Already known.'});
        }
        storage_type_o[type] = constructor;
    };

    return that;
}());
