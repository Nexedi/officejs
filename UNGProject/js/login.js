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
 
 
 
/**
 * create a new storage
 */
function initStorage(wallet) {
    if(wallet.provider) {//DAV storage
        // load JIO file from a DAV and create the JIO object
        initializeFromDav(wallet.userName, wallet.storageLocation, {"ID":"www.ungproject.com", "password":wallet.applicationPassword});
    } else {
        Storage.create('{"type":"local","userName":"'+wallet.userName+'"}');
    }
}
 
/**
 * try to log an user just after having logged in their Dav account
 * if the user is logged, it means that getApplicationPasswordFromURL has a result
 */
function tryLog() {
    var wallet = getWallet();
    var applicationPassword = getApplicationPasswordFromURL();
    if(applicationPassword) {
        wallet.applicationPassword = applicationPassword;
        setWallet(wallet);//to delete for new registration each time
        initStorage(wallet);
        //go to ung when the storage is ready
        waitBeforeSucceed(function() {return getCurrentStorage().getUser();},function(){window.location.href = "ung.html";});
    }
}
 
/**
 * Log an user after they fill their Name and storage provider
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
    //go to ung when the storage is ready
    waitBeforeSucceed(function() {return getCurrentStorage().getUser();},function(){window.location.href = "ung.html";});
}
 
 
/***************************************************************************
 **********************   Unhosted functions   *****************************
 * these function are only required to respect the unhosted architecture  */
 
// load JIO file from a DAV and create the JIO object
function initializeFromDav(userName, location, applicant) {
    //get the user personal JIO file
    $.ajax({
        url: location+"/dav/"+userName+"/"+applicant.ID+"/"+"jio.json",//we could use userAdress instead...
        type: "GET",
        async: false,
        dataType: "text",
        headers: {Authorization: "Basic "+Base64.encode(userName+":"+applicant.password)},
        fields: {withCredentials: "true"},
        success: function(jioContent){
                        Storage.create(jioContent);
                    },
        error: function(type) {alert("Error "+type.status+" : fail while trying to load jio.json");}
    });
    return JIO;
}
function getStorageLocation(provider) {
    //TODO : use webFinger
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
//redirects the application to the storage of the user to log the application in and get the password for the application
function logIntoDav(wallet) {
    var recall = window.location;
    window.location.href = wallet.storageLocation+"#"+recall;
}
 
 
 
 
 
 
 
 
/**********************************************************************
 * functions from UNG Docs 1.0 and not currently used
 */
 
 
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
