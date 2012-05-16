
define ('OfficeJS',
        ['LocalOrCookieStorage',
         'jQuery',
         'JIO',
         'Base64',
         'JIOStorages'],
        function (LocalOrCookieStorage,
                  jQuery,
                  JIO,
                  Base64) {
            return {LocalOrCookieStorage: LocalOrCookieStorage,
                    jQuery: jQuery,
                    JIO: JIO,
                    Base64: Base64,
                    ich: window.ich};
        });
