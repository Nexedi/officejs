NoSSLStorage = function(user, location) {
    this.rsa = null;
    this.userName = user;
    this.storageLocation = location;
}
NoSSLStorage.prototype = {
    initIO: function() {
        this.rsa = new RSA();
    },
    maintenance: function() {//maintains the ssh key in life
        var ID = {user:this.userName, key:this.rsa.getPublicKey()}
        send(ID,this.storageLocation);
        setTimeout(maintenance(),3000);
    },
    loadDocument: function(applicationDomain, repository, file) {

    },
    saveDocument: function(applicationDomain, data, repository, file, overwrite) {

    },
    deleteDocument: function(applicationDomain, repository, file) {

    }
}

DAVStorage = function(user, location, passwdCrypto) {
    this.passwordCrypto = passwdCrypto;
    this.userName = user;
    this.storageLocation = location;
}
DAVStorage.prototype = {
    initIO: function() {
        //récupérer le password crypto
    },
    loadDocument: function(applicationDomain, repository, file, instruction, errorHandler) {
        $.ajax({
            url: repository+file,
            type: "GET",
            dataType: type,
            headers: { Authorization: "Basic "+btoa("smik:asdf")},
            fields: { withCredentials: "true" },
            success: instruction,
            error: errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to load "+address);}
        });
    },
    saveDocument: function(applicationDomain, newData, repository, file, overwrite, instruction, oldData) {
        var save = function() {
            $.ajax({
                url: repository+file,
                type: "PUT",
                dataType: "json",
                data: JSON.stringify(newData),
                headers: { Authorization: "Basic "+btoa("smik:asdf")},
                fields: { withCredentials: "true" },
                success: instruction,
                error: function(type) {
                  if(type.status==201 || type.status==204) {instruction();}//ajax thinks that 201 is an error...
                }
            });
        }

        var merge = function(serverData) {
            if(overwrite) {
                //if(diff(oldData,serverData)) {merge(newData, serverData);}
                save();
            }
        }

        //check if already exists and for diffs
        loadDocument(applicationDomain, repository, file,
            function(serverData) {
                merge(serverData);
            },
            function(type) {
                if(type.status==404) {
                    save();
                } else {
                    if(type.status==201 || type.status==204) {instruction();}
                }
            }
        );

    },
    deleteDocument: function(applicationDomain, repository, file) {
        $.ajax({
          url: address,
          type: "DELETE",
          headers: { Authorization: "Basic "+btoa("smik:asdf")},
          fields: { withCredentials: "true" },
          success: instruction,
          error: function(type) {
              alert(type.status);//ajax thinks that 201 is an error...
          }
      });
    }
}

login = function() {
    var user = $("#userName").value;
    var storageLocation = $("#storageLocation").value;

    currentStorage = new NoSSLStorage(user,storageLocation);
    var password = CryptoSym.encrypt({
        userName: user,
        publicKey:currentStorage.rsa.getPublicKey(),
        password:$("#password").value
    });
    $("#password").value = "";
    $("#code").value = password;
    $("#connection").action = "https://"+storageLocation;

    maintenance();
}

loadFile = function(address, type, instruction) {
    $.ajax({
        url: address,
        type: "GET",
        dataType: type,
	success: instruction,
        error: function(type) {alert("Error "+type.status+" : fail while trying to load "+address);}
    });
}

loadServerDescription = function(address) {
    loadFile(address+"/server.json", "JSON", function() {})
}

CryptoSym = {
    encrypt: function(obj, key) {return JSON.stringify(obj)+"key";},
    decrypt: function(obj, key) {return JSON.parse(obj.split("key")[0])}
}

RSA = function(publicKey) {
    if(publicKey) {
        this.publicKey = publicKey;
    } else {
        this.publicKey = null;
        this.privateKey = null;
        this.generate();
    }
}
RSA.prototype = {
    getPublicKey: function() {return this.publicKey;},
    getPrivateKey: function() {return this.privateKey;},
    generate: function() {
        this.privateKey = Date.now();
        this.publicKey = this.privateKey;
    },
    encrypt: function(text,key) {return text+key;},
    decrypt: function(text) {return text.split(this.privateKey)[0]}
}

