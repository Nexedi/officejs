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
 * Log an user with it's Name and ID provider
 */
var logUser = function() {
    var name = $("input#name").attr("value");
    var IDProvider = $("input#id_provider").attr("value");
    if(name) {
        setCurrentStorage(IDProvider ? new JIOStorage(name,IDProvider) : new LocalStorage(name));
        window.location = "ung-mobile.html";
    }
}

/**
 * create an account (to use only if UNG is also an ID provider)
 */
var createNewUser = function() {
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
var formError = function(message) {
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

function setFocus() {
  login = document.getElementById('name');
  password = document.getElementById('password');
  if (login.value != '')
    password.focus();
  else
    login.focus();
}
