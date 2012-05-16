
require.config ({
    paths: {
        LocalOrCookieStorage: '../lib/jio/localorcookiestorage.min',
        jQueryAPI: '../lib/jquery/jquery',
        jQuery: '../lib/jio/jquery.requirejs_module',
        JIO: '../src/jio',
        Base64API: '../lib/base64/base64',
        Base64: '../lib/jio/base64.requirejs_module',
        JIOStorages: '../lib/jio/jio.storage.min',

        OfficeJS: '../script/officejs'
    }
});
require(['OfficeJS'],function (OJS) {
    var JIO = OJS.JIO,
    $ = OJS.jQuery,
    Base64 = OJS.Base64,
    ich = OJS.ich;

    $('#main').html(ich['test']({},true));
});
