
define ('jiotestsloader',[
    'LocalOrCookieStorage','JIO','Base64',
    'JIODummyStorages','JIOStorages','jQuery'],
function (LocalOrCookieStorage,JIO,Base64) {
    return {
        LocalOrCookieStorage: LocalOrCookieStorage,
        JIO: JIO,
        Base64: Base64
    };
});
