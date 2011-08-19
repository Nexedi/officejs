/**
 * change the display if the new account button is clicked
 */
var displayNewAccountForm = function(bool) {
    if(bool) {
        $("table#create-new-user").css("display","table");
        $("table#field_table").css("display","none");
        $("table#new-account-table").css("display","none");
    }
    else {
        $("table#create-new-user").css("display","none");
        $("table#field_table").css("display","table");
        $("table#new-account-table").css("display","table");
    }
}

function logIntoDav(wallet) {
    var recall = window.location;
    window.location.href = wallet.storageLocation+"#"+recall;
}

function initStorage(wallet) {
    if(!wallet.provider) {//local storage
        setCurrentStorage(new LocalStorage(wallet.userName));
    } else {
        setCurrentStorage(new JIOStorage(wallet));
    }
}


//unhosted functions
function getStorageLocation(provider) {
    //TODO : uses webFinger
    return "http://"+provider;
}
function getApplicationPasswordFromURL() {
    return window.location.href.split("appPwd:")[1]
}
function setWallet(newWallet) {
    localStorage.setItem("wallet",JSON.stringify(newWallet));
}
function getWallet() {
    return JSON.parse(localStorage.getItem("wallet"))||null;
}
var Wallet = function() {
    this.userName = $("input#name").attr("value");
    this.provider = $("input#storage_location").attr("value");
    this.storageLocation = getStorageLocation(this.provider);
}


/**
 * try to log an user after having logged in their Dav account
 */
function tryLog() {
    var wallet = getWallet();
    var applicationPassword = getApplicationPasswordFromURL();
    if(applicationPassword) {
        wallet.applicationPassword = applicationPassword;
        setWallet(wallet);//to delete for new registration each time
        initStorage(wallet);
        waitBeforeSucceed(function() {return getCurrentStorage().getUser();},function(){window.location.href = "ung.html";});
    }
}

/**
 * Log an user with it's Name and storage provider
 */
function logUser() {
    var wallet = new Wallet();
    setWallet(wallet);

    if(!wallet.userName) {return;}
    if(wallet.provider) {
            if(!wallet.storageLocation) {alert("unable to find your storage from your provider");return;}
            if(!wallet.applicationPassword) {logIntoDav(wallet);return;}
    }
    initStorage(wallet);
    waitBeforeSucceed(function() {return getCurrentStorage().getUser();},function(){window.location.href = "ung.html";});
}











/**
 * create an account (to use only if UNG is also a storage provider)
 */
function createNewUser() {
    var form = $("form#create-user")[0];

    /* check that the form is complete */
    for(var i = 0; i<form.length-1; i++) {
        if(!form[i].value) {formError("please fill each field");}
    }
    if(form[4].value!=form[5].value) {
        formError("please enter the same password twice");
        form[4].value="";
        form[5].value="";
    }
    if(!testEMail()) {formError("please enter a valid email");}
    
    /* create the new user */
    //JIO
}

/**
 * Report an error when filling the form
 */
function formError(message) {
    $("td#form-message").attr("value",message);
    $("td#form-message").css("display","table-cell");
}

/**
 * check if an email address is valid
 */
function testEMail(email) {
    var patern="^([a-zA-Z0-9]+(([\.\-\_]?[a-zA-Z0-9]+)+)?)\@(([a-zA-Z0-9]+[\.\-\_])+[a-zA-Z]{2,4})$";
    var regEx = new RegExp(patern);
    return regEx.test(email);
}

//TODO
function setFocus() {
  login = document.getElementById('name');
  password = document.getElementById('password');
  if (login.value != '')
    password.focus();
  else
    login.focus();
}