
define ('jiotestsloader',[
    'LocalOrCookieStorage','JIO','Base64',
    'jQuery','JIODummyStorages','JIOStorages'],
function (LocalOrCookieStorage,JIO,Base64,jQuery) {
    return {
        LocalOrCookieStorage: LocalOrCookieStorage,
        JIO: JIO,
        Base64: Base64,
        jQuery: jQuery
    };
});
