<?php

function filesList($dirname) {
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
echo filesList(".");

?>
