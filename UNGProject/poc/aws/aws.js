// Small library to connect within a browser to an amazon S3 storage

var AWSAccessKeyId= "PUT_IT_HERE"
var YourSecretAccessKeyID= "PUT_IT_HERE"
var now = new Date();
var formatted_date = now.toUTCString()
var StringToSign = "GET\n\n\n" +formatted_date +"\n/jio_file.txt"
remote_url = 'http://XXXXXXXXXXXXX.amazonaws.com/XXXX.txt'



function getAuthorization(AWSAccessKeyId, YourSecretAccessKeyID, StringToSign){
  /* Create a Amazon S3 signature based on provided keys */
  StringToSign=Utf8.encode(StringToSign) 
  YourSecretAccessKeyID = Utf8.encode(YourSecretAccessKeyID);
  signature = $.base64.encode(str_hmac_sha1(YourSecretAccessKeyID, StringToSign));
  authorization = "AWS" + " " + AWSAccessKeyId + ":" + signature
  return authorization;
}


function test(){
//   disable browser security firefox
//   try {  
//       netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");  
//   } catch (e) {  
//       alert("UniversalBrowserRead failed");  
//   }
  authorization = getAuthorization(AWSAccessKeyId, YourSecretAccessKeyID, StringToSign)

  $.ajax({
    url:remote_url,
    type: 'get',
    cache: true,
    //headers: {"Authorization":authorization},
    success: function(data, status) {console.log(data);
                                     console.log(status);},
    error: function(xhr, desc, err) {
        console.log(xhr);
        console.log("Desc: " + desc + "\nErr:" + err);
        }
    });
}

