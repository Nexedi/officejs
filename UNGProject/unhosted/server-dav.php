<?php

function getFileContents($fileName) {
    return trim(file_get_contents($fileName));
}
function hashTrim($method, $data) {
    return trim(hash($method,$data));
}

/* 1st degree functions : tools */
function getUserDavDir($userName) {
    return "dav/" . $userName ;
}

function getAppDavDir($userName,$applicationID) {
    return getUserDavDir($userName) . "/" . $applicationID ;
}

function userNameAvailable($name) {
    return !file_exists("jio/".$name);
}

function getFilesList($dirname) {
    $dir = opendir($dirname);
    $filesArray = array();

    while($file = readdir($dir)) {
        if($file != '.' && $file != '..' && !is_dir($dirname.$file))
        {
            $filesArray[] = $file;
        }
    }

    closedir($dir);
    $jsonList = json_encode($filesArray);
    return $jsonList;
}

/**
 * add an application in the user's repository
 * @param $userName String name of the user
 * @param $applicationID String ID of the application
 * @return boolean false if a probleme occured, true otherwise
 */
function addApplication($userName,$applicationID) {
    $applicationDir = getAppDavDir($userName,$applicationID);
    if(!file_exists($applicationDir)) {
        echo mkdir($applicationDir, 0700, TRUE);
    }
    echo file_put_contents($applicationDir.'/.htaccess',
            "AuthType Basic\n"
            ."AuthName \"your unhosted data\"\n"
            ."AuthUserFile ".$applicationDir."/.htpasswd\n"
            ."<LimitExcept OPTIONS HEAD>\n"
            ."  Require valid-user\n"
            ."</LimitExcept>\n"
            ."SetEnvIf Origin \"(.+)\" ORIGIN=\$1\n"
            ."Header always set Access-Control-Allow-Origin %{ORIGIN}e\n");
    return createApplicationPassword($userName, $applicationID);
}

/**
 * allow an application to access files of their repository.
 * @param $userName name of the user
 * @param $applicationID ID of the application
 * @param $sessionPassword password used by the user during their session
 * @return the applicationPassword to use to access data
 */
function createApplicationPassword($userName, $applicationID) {
    $applicationDir = getAppDavDir($userName,$applicationID);
    $applicationPassword = base64_encode(mt_rand());
    file_put_contents($applicationDir.'/.htpasswd', $userName .':'. crypt($applicationPassword, base64_encode($applicationPassword))."\n");
    return $applicationPassword;
}

/* 3rd degree functions : main */

/**
 * return the applicationPassword
 * @param $userName String name of the user
 * @param $applicationID String application domaine
 * @param $password String the password of the user
 * @return String the password allowing the application to access its data
 */
function logApplication($userName, $applicationID, $password) {
    $pwdFile = getUserDavDir($userName)."/.pwd";
    $appDir = getAppDavDir($userName, $applicationID);
    if(file_exists($pwdFile) && hash("sha256",$password)==file_get_contents($pwdFile)) {
        if(file_exists($appDir)) {
            return createApplicationPassword($userName, $applicationID);
        } else {
            return addApplication($userName, $applicationID);
        }
    } else {
        return FALSE;
    }
}

/**
 * register a new user
 * @param $userName String name of the user
 * @param $password String password defined while registering
 * @param $password2 String password confirmation
 * @return boolean true if end correctly
 */
function register($userName,$password,$password2) {
    $userDavDir = getUserDavDir($userName);
    if(userNameAvailable($userName) && $password==$password2) {
        mkdir($userDavDir, 0700, TRUE);
        return file_put_contents($userDavDir.'/.pwd', hashTrim("sha256",$password));
    } else {
        return FALSE;
    }
}

if($_SERVER['CONTENT_TYPE']=="GET") {
    switch($_GET['action']) {
        //case "getList" : echo getFilesList($_GET['repository']);break;
        case "checkUser" : echo userNameAvailable($_GET['userName']);break;
    }
} else {
    switch($_POST['action']) {
        case "logUser" : echo logUser($_POST['userName'], $_POST['password']);break;
        case "logApplication" : echo logApplication($_POST['userName'], $_POST['applicationID'], $_POST['password']);break;
        case "register" : echo register($_POST['userName'], $_POST['password'], $_POST['password2']);break;
    }
}

?>
