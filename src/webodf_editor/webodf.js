// Input 0
var webodf_version="0.4.2-2378-g46422b1";
// Input 1
function Runtime(){}Runtime.prototype.getVariable=function(f){};Runtime.prototype.toJson=function(f){};Runtime.prototype.fromJson=function(f){};Runtime.prototype.byteArrayFromString=function(f,g){};Runtime.prototype.byteArrayToString=function(f,g){};Runtime.prototype.read=function(f,g,b,c){};Runtime.prototype.readFile=function(f,g,b){};Runtime.prototype.readFileSync=function(f,g){};Runtime.prototype.loadXML=function(f,g){};Runtime.prototype.writeFile=function(f,g,b){};
Runtime.prototype.isFile=function(f,g){};Runtime.prototype.getFileSize=function(f,g){};Runtime.prototype.deleteFile=function(f,g){};Runtime.prototype.log=function(f,g){};Runtime.prototype.setTimeout=function(f,g){};Runtime.prototype.clearTimeout=function(f){};Runtime.prototype.libraryPaths=function(){};Runtime.prototype.currentDirectory=function(){};Runtime.prototype.setCurrentDirectory=function(f){};Runtime.prototype.type=function(){};Runtime.prototype.getDOMImplementation=function(){};
Runtime.prototype.parseXML=function(f){};Runtime.prototype.exit=function(f){};Runtime.prototype.getWindow=function(){};Runtime.prototype.requestAnimationFrame=function(f){};Runtime.prototype.cancelAnimationFrame=function(f){};Runtime.prototype.assert=function(f,g,b){};var IS_COMPILED_CODE=!0;
Runtime.byteArrayToString=function(f,g){function b(b){var c="",e,g=b.length;for(e=0;e<g;e+=1)c+=String.fromCharCode(b[e]&255);return c}function c(b){var c="",e,g=b.length,f=[],r,d,a,n;for(e=0;e<g;e+=1)r=b[e],128>r?f.push(r):(e+=1,d=b[e],194<=r&&224>r?f.push((r&31)<<6|d&63):(e+=1,a=b[e],224<=r&&240>r?f.push((r&15)<<12|(d&63)<<6|a&63):(e+=1,n=b[e],240<=r&&245>r&&(r=(r&7)<<18|(d&63)<<12|(a&63)<<6|n&63,r-=65536,f.push((r>>10)+55296,(r&1023)+56320))))),1E3<=f.length&&(c+=String.fromCharCode.apply(null,
f),f.length=0);return c+String.fromCharCode.apply(null,f)}var e;"utf8"===g?e=c(f):("binary"!==g&&this.log("Unsupported encoding: "+g),e=b(f));return e};Runtime.getVariable=function(f){try{return eval(f)}catch(g){}};Runtime.toJson=function(f){return JSON.stringify(f)};Runtime.fromJson=function(f){return JSON.parse(f)};Runtime.getFunctionName=function(f){return void 0===f.name?(f=/function\s+(\w+)/.exec(f))&&f[1]:f.name};
function BrowserRuntime(f){function g(b){var d=b.length,a,n,k=0;for(a=0;a<d;a+=1)n=b.charCodeAt(a),k+=1+(128<n)+(2048<n),55040<n&&57344>n&&(k+=1,a+=1);return k}function b(b,d,a){var n=b.length,k,c;d=new Uint8Array(new ArrayBuffer(d));a?(d[0]=239,d[1]=187,d[2]=191,c=3):c=0;for(a=0;a<n;a+=1)k=b.charCodeAt(a),128>k?(d[c]=k,c+=1):2048>k?(d[c]=192|k>>>6,d[c+1]=128|k&63,c+=2):55040>=k||57344<=k?(d[c]=224|k>>>12&15,d[c+1]=128|k>>>6&63,d[c+2]=128|k&63,c+=3):(a+=1,k=(k-55296<<10|b.charCodeAt(a)-56320)+65536,
d[c]=240|k>>>18&7,d[c+1]=128|k>>>12&63,d[c+2]=128|k>>>6&63,d[c+3]=128|k&63,c+=4);return d}function c(b){var d=b.length,a=new Uint8Array(new ArrayBuffer(d)),n;for(n=0;n<d;n+=1)a[n]=b.charCodeAt(n)&255;return a}function e(b,d){var a,n,k;void 0!==d?k=b:d=b;f?(n=f.ownerDocument,k&&(a=n.createElement("span"),a.className=k,a.appendChild(n.createTextNode(k)),f.appendChild(a),f.appendChild(n.createTextNode(" "))),a=n.createElement("span"),0<d.length&&"<"===d[0]?a.innerHTML=d:a.appendChild(n.createTextNode(d)),
f.appendChild(a),f.appendChild(n.createElement("br"))):console&&console.log(d);"alert"===k&&alert(d)}function l(r,d,a){if(0!==a.status||a.responseText)if(200===a.status||0===a.status){if(a.response&&"string"!==typeof a.response)"binary"===d?(a=a.response,a=new Uint8Array(a)):a=String(a.response);else if("binary"===d)if(null!==a.responseBody&&"undefined"!==String(typeof VBArray)){a=(new VBArray(a.responseBody)).toArray();var n=a.length,k=new Uint8Array(new ArrayBuffer(n));for(d=0;d<n;d+=1)k[d]=a[d];
a=k}else{(d=a.getResponseHeader("Content-Length"))&&(d=parseInt(d,10));if(d&&d!==a.responseText.length)a:{var n=a.responseText,k=!1,e=g(n);if("number"===typeof d){if(d!==e&&d!==e+3){n=void 0;break a}k=e+3===d;e=d}n=b(n,e,k)}void 0===n&&(n=c(a.responseText));a=n}else a=a.responseText;m[r]=a;r={err:null,data:a}}else r={err:a.responseText||a.statusText,data:null};else r={err:"File "+r+" is empty.",data:null};return r}function h(b,d,a){var n=new XMLHttpRequest;n.open("GET",b,a);n.overrideMimeType&&("binary"!==
d?n.overrideMimeType("text/plain; charset="+d):n.overrideMimeType("text/plain; charset=x-user-defined"));return n}function q(b,d,a){function n(){var n;4===k.readyState&&(n=l(b,d,k),a(n.err,n.data))}if(m.hasOwnProperty(b))a(null,m[b]);else{var k=h(b,d,!0);k.onreadystatechange=n;try{k.send(null)}catch(c){a(c.message,null)}}}var p=this,m={};this.byteArrayFromString=function(r,d){var a;"utf8"===d?a=b(r,g(r),!1):("binary"!==d&&p.log("unknown encoding: "+d),a=c(r));return a};this.byteArrayToString=Runtime.byteArrayToString;
this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=q;this.read=function(b,d,a,n){q(b,"binary",function(k,b){var c=null;if(b){if("string"===typeof b)throw"This should not happen.";c=b.subarray(d,d+a)}n(k,c)})};this.readFileSync=function(b,d){var a=h(b,d,!1),n;try{a.send(null);n=l(b,d,a);if(n.err)throw n.err;if(null===n.data)throw"No data read from "+b+".";}catch(k){throw k;}return n.data};this.writeFile=function(b,d,a){m[b]=d;var n=new XMLHttpRequest,
k;n.open("PUT",b,!0);n.onreadystatechange=function(){4===n.readyState&&(0!==n.status||n.responseText?200<=n.status&&300>n.status||0===n.status?a(null):a("Status "+String(n.status)+": "+n.responseText||n.statusText):a("File "+b+" is empty."))};k=d.buffer&&!n.sendAsBinary?d.buffer:p.byteArrayToString(d,"binary");try{n.sendAsBinary?n.sendAsBinary(k):n.send(k)}catch(c){p.log("HUH? "+c+" "+d),a(c.message)}};this.deleteFile=function(b,d){delete m[b];var a=new XMLHttpRequest;a.open("DELETE",b,!0);a.onreadystatechange=
function(){4===a.readyState&&(200>a.status&&300<=a.status?d(a.responseText):d(null))};a.send(null)};this.loadXML=function(b,d){var a=new XMLHttpRequest;a.open("GET",b,!0);a.overrideMimeType&&a.overrideMimeType("text/xml");a.onreadystatechange=function(){4===a.readyState&&(0!==a.status||a.responseText?200===a.status||0===a.status?d(null,a.responseXML):d(a.responseText,null):d("File "+b+" is empty.",null))};try{a.send(null)}catch(n){d(n.message,null)}};this.isFile=function(b,d){p.getFileSize(b,function(a){d(-1!==
a)})};this.getFileSize=function(b,d){if(m.hasOwnProperty(b)&&"string"!==typeof m[b])d(m[b].length);else{var a=new XMLHttpRequest;a.open("HEAD",b,!0);a.onreadystatechange=function(){if(4===a.readyState){var n=a.getResponseHeader("Content-Length");n?d(parseInt(n,10)):q(b,"binary",function(a,n){a?d(-1):d(n.length)})}};a.send(null)}};this.log=e;this.assert=function(b,d,a){if(!b)throw e("alert","ASSERTION FAILED:\n"+d),a&&a(),d;};this.setTimeout=function(b,d){return setTimeout(function(){b()},d)};this.clearTimeout=
function(b){clearTimeout(b)};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(){};this.currentDirectory=function(){return""};this.type=function(){return"BrowserRuntime"};this.getDOMImplementation=function(){return window.document.implementation};this.parseXML=function(b){return(new DOMParser).parseFromString(b,"text/xml")};this.exit=function(b){e("Calling exit with code "+String(b)+", but exit() is not implemented.")};this.getWindow=function(){return window};this.requestAnimationFrame=
function(b){var d=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame,a=0;if(d)d.bind(window),a=d(b);else return setTimeout(b,15);return a};this.cancelAnimationFrame=function(b){var d=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.msCancelAnimationFrame;d?(d.bind(window),d(b)):clearTimeout(b)}}
function NodeJSRuntime(){function f(b){var c=b.length,e,d=new Uint8Array(new ArrayBuffer(c));for(e=0;e<c;e+=1)d[e]=b[e];return d}function g(b,h,r){function d(a,d){if(a)return r(a,null);if(!d)return r("No data for "+b+".",null);if("string"===typeof d)return r(a,d);r(a,f(d))}b=e.resolve(l,b);"binary"!==h?c.readFile(b,h,d):c.readFile(b,null,d)}var b=this,c=require("fs"),e=require("path"),l="",h,q;this.byteArrayFromString=function(b,c){var e=new Buffer(b,c),d,a=e.length,n=new Uint8Array(new ArrayBuffer(a));
for(d=0;d<a;d+=1)n[d]=e[d];return n};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=g;this.loadXML=function(c,e){g(c,"utf-8",function(h,d){if(h)return e(h,null);if(!d)return e("No data for "+c+".",null);e(null,b.parseXML(d))})};this.writeFile=function(b,h,r){h=new Buffer(h);b=e.resolve(l,b);c.writeFile(b,h,"binary",function(d){r(d||null)})};this.deleteFile=function(b,h){b=e.resolve(l,b);
c.unlink(b,h)};this.read=function(b,h,r,d){b=e.resolve(l,b);c.open(b,"r+",666,function(a,n){if(a)d(a,null);else{var k=new Buffer(r);c.read(n,k,0,r,h,function(a){c.close(n);d(a,f(k))})}})};this.readFileSync=function(b,e){var h;h=c.readFileSync(b,"binary"===e?null:e);if(null===h)throw"File "+b+" could not be read.";"binary"===e&&(h=f(h));return h};this.isFile=function(b,h){b=e.resolve(l,b);c.stat(b,function(b,d){h(!b&&d.isFile())})};this.getFileSize=function(b,h){b=e.resolve(l,b);c.stat(b,function(b,
d){b?h(-1):h(d.size)})};this.log=function(b,c){var e;void 0!==c?e=b:c=b;"alert"===e&&process.stderr.write("\n!!!!! ALERT !!!!!\n");process.stderr.write(c+"\n");"alert"===e&&process.stderr.write("!!!!! ALERT !!!!!\n")};this.assert=function(b,c,e){b||(process.stderr.write("ASSERTION FAILED: "+c),e&&e())};this.setTimeout=function(b,c){return setTimeout(function(){b()},c)};this.clearTimeout=function(b){clearTimeout(b)};this.libraryPaths=function(){return[__dirname]};this.setCurrentDirectory=function(b){l=
b};this.currentDirectory=function(){return l};this.type=function(){return"NodeJSRuntime"};this.getDOMImplementation=function(){return q};this.parseXML=function(b){return h.parseFromString(b,"text/xml")};this.exit=process.exit;this.getWindow=function(){return null};this.requestAnimationFrame=function(b){return setTimeout(b,15)};this.cancelAnimationFrame=function(b){clearTimeout(b)};h=new (require("xmldom").DOMParser);q=b.parseXML("<a/>").implementation}
function RhinoRuntime(){function f(b,c){var e;void 0!==c?e=b:c=b;"alert"===e&&print("\n!!!!! ALERT !!!!!");print(c);"alert"===e&&print("!!!!! ALERT !!!!!")}var g=this,b={},c=b.javax.xml.parsers.DocumentBuilderFactory.newInstance(),e,l,h="";c.setValidating(!1);c.setNamespaceAware(!0);c.setExpandEntityReferences(!1);c.setSchema(null);l=b.org.xml.sax.EntityResolver({resolveEntity:function(c,e){var h=new b.java.io.FileReader(e);return new b.org.xml.sax.InputSource(h)}});e=c.newDocumentBuilder();e.setEntityResolver(l);
this.byteArrayFromString=function(b,c){var e,h=b.length,d=new Uint8Array(new ArrayBuffer(h));for(e=0;e<h;e+=1)d[e]=b.charCodeAt(e)&255;return d};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.loadXML=function(c,h){var g=new b.java.io.File(c),f=null;try{f=e.parse(g)}catch(d){return print(d),h(d,null)}h(null,f)};this.readFile=function(c,e,f){h&&(c=h+"/"+c);var r=new b.java.io.File(c),d="binary"===e?
"latin1":e;r.isFile()?((c=readFile(c,d))&&"binary"===e&&(c=g.byteArrayFromString(c,"binary")),f(null,c)):f(c+" is not a file.",null)};this.writeFile=function(c,e,g){h&&(c=h+"/"+c);c=new b.java.io.FileOutputStream(c);var f,d=e.length;for(f=0;f<d;f+=1)c.write(e[f]);c.close();g(null)};this.deleteFile=function(c,e){h&&(c=h+"/"+c);var f=new b.java.io.File(c),g=c+Math.random(),g=new b.java.io.File(g);f.rename(g)?(g.deleteOnExit(),e(null)):e("Could not delete "+c)};this.read=function(c,e,g,f){h&&(c=h+"/"+
c);var d;d=c;var a="binary";(new b.java.io.File(d)).isFile()?("binary"===a&&(a="latin1"),d=readFile(d,a)):d=null;d?f(null,this.byteArrayFromString(d.substring(e,e+g),"binary")):f("Cannot read "+c,null)};this.readFileSync=function(b,c){if(!c)return"";var e=readFile(b,c);if(null===e)throw"File could not be read.";return e};this.isFile=function(c,e){h&&(c=h+"/"+c);var g=new b.java.io.File(c);e(g.isFile())};this.getFileSize=function(c,e){h&&(c=h+"/"+c);var g=new b.java.io.File(c);e(g.length())};this.log=
f;this.assert=function(b,c,e){b||(f("alert","ASSERTION FAILED: "+c),e&&e())};this.setTimeout=function(b){b();return 0};this.clearTimeout=function(){};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(b){h=b};this.currentDirectory=function(){return h};this.type=function(){return"RhinoRuntime"};this.getDOMImplementation=function(){return e.getDOMImplementation()};this.parseXML=function(c){c=new b.java.io.StringReader(c);c=new b.org.xml.sax.InputSource(c);return e.parse(c)};
this.exit=quit;this.getWindow=function(){return null};this.requestAnimationFrame=function(b){b();return 0};this.cancelAnimationFrame=function(){}}Runtime.create=function(){return"undefined"!==String(typeof window)?new BrowserRuntime(window.document.getElementById("logoutput")):"undefined"!==String(typeof require)?new NodeJSRuntime:new RhinoRuntime};var runtime=Runtime.create(),core={},gui={},xmldom={},odf={},ops={},webodf={};
(function(){webodf.Version="undefined"!==String(typeof webodf_version)?webodf_version:"From Source"})();
(function(){function f(b,c,e){var h=b+"/manifest.json",d,a;runtime.log("Loading manifest: "+h);try{d=runtime.readFileSync(h,"utf-8")}catch(n){if(e)runtime.log("No loadable manifest found.");else throw console.log(String(n)),n;return}e=JSON.parse(d);for(a in e)e.hasOwnProperty(a)&&(c[a]={dir:b,deps:e[a]})}function g(b,c,e){function h(k){if(!n[k]&&!e(k)){if(a[k])throw"Circular dependency detected for "+k+".";a[k]=!0;if(!c[k])throw"Missing dependency information for class "+k+".";var b=c[k],g=b.deps,
f,l=g.length;for(f=0;f<l;f+=1)h(g[f]);a[k]=!1;n[k]=!0;d.push(b.dir+"/"+k.replace(".","/")+".js")}}var d=[],a={},n={};b.forEach(h);return d}function b(b,c){return c=c+("\n//# sourceURL="+b)+("\n//@ sourceURL="+b)}function c(c){var e,h;for(e=0;e<c.length;e+=1)h=runtime.readFileSync(c[e],"utf-8"),h=b(c[e],h),eval(h)}function e(b){b=b.split(".");var c,e=h,g=b.length;for(c=0;c<g;c+=1){if(!e.hasOwnProperty(b[c]))return!1;e=e[b[c]]}return!0}var l,h={core:core,gui:gui,xmldom:xmldom,odf:odf,ops:ops};runtime.loadClasses=
function(b,h){if(IS_COMPILED_CODE||0===b.length)return h&&h();var m;if(!(m=l)){m=[];var r=runtime.libraryPaths(),d;runtime.currentDirectory()&&-1===r.indexOf(runtime.currentDirectory())&&f(runtime.currentDirectory(),m,!0);for(d=0;d<r.length;d+=1)f(r[d],m)}l=m;b=g(b,l,e);if(0===b.length)return h&&h();if("BrowserRuntime"===runtime.type()&&h){m=b;r=document.currentScript||document.documentElement.lastChild;d=document.createDocumentFragment();var a,n;for(n=0;n<m.length;n+=1)a=document.createElement("script"),
a.type="text/javascript",a.charset="utf-8",a.async=!1,a.setAttribute("src",m[n]),d.appendChild(a);h&&(a.onload=h);r.parentNode.insertBefore(d,r)}else c(b),h&&h()};runtime.loadClass=function(b,c){runtime.loadClasses([b],c)}})();(function(){var f=function(g){return g};runtime.getTranslator=function(){return f};runtime.setTranslator=function(g){f=g};runtime.tr=function(g){var b=f(g);return b&&"string"===String(typeof b)?b:g}})();
(function(f){function g(b){if(b.length){var c=b[0];runtime.readFile(c,"utf8",function(e,g){function h(){var b;(b=eval(p))&&runtime.exit(b)}var f="",f=c.lastIndexOf("/"),p=g,f=-1!==f?c.substring(0,f):".";runtime.setCurrentDirectory(f);e?(runtime.log(e),runtime.exit(1)):null===p?(runtime.log("No code found for "+c),runtime.exit(1)):h.apply(null,b)})}}f=f?Array.prototype.slice.call(f):[];"NodeJSRuntime"===runtime.type()?g(process.argv.slice(2)):"RhinoRuntime"===runtime.type()?g(f):g(f.slice(1))})("undefined"!==
String(typeof arguments)&&arguments);
// Input 2
(function(){core.Async=function(){return{forEach:function(f,g,b){function c(c){h!==l&&(c?(h=l,b(c)):(h+=1,h===l&&b(null)))}var e,l=f.length,h=0;for(e=0;e<l;e+=1)g(f[e],c)},destroyAll:function(f,g){function b(c,e){if(e)g(e);else if(c<f.length)f[c](function(e){b(c+1,e)});else g()}b(0,void 0)}}}()})();
// Input 3
function makeBase64(){function f(a){var d,b=a.length,k=new Uint8Array(new ArrayBuffer(b));for(d=0;d<b;d+=1)k[d]=a.charCodeAt(d)&255;return k}function g(a){var d,b="",k,n=a.length-2;for(k=0;k<n;k+=3)d=a[k]<<16|a[k+1]<<8|a[k+2],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>18],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>12&63],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>6&63],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d&
63];k===n+1?(d=a[k]<<4,b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>6],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d&63],b+="=="):k===n&&(d=a[k]<<10|a[k+1]<<2,b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>12],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>6&63],b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d&63],b+="=");return b}function b(a){a=a.replace(/[^A-Za-z0-9+\/]+/g,
"");var d=a.length,b=new Uint8Array(new ArrayBuffer(3*d)),n=a.length%4,c=0,e,h;for(e=0;e<d;e+=4)h=(k[a.charAt(e)]||0)<<18|(k[a.charAt(e+1)]||0)<<12|(k[a.charAt(e+2)]||0)<<6|(k[a.charAt(e+3)]||0),b[c]=h>>16,b[c+1]=h>>8&255,b[c+2]=h&255,c+=3;d=3*d-[0,0,2,1][n];return b.subarray(0,d)}function c(a){var d,b,k=a.length,n=0,c=new Uint8Array(new ArrayBuffer(3*k));for(d=0;d<k;d+=1)b=a[d],128>b?c[n++]=b:(2048>b?c[n++]=192|b>>>6:(c[n++]=224|b>>>12&15,c[n++]=128|b>>>6&63),c[n++]=128|b&63);return c.subarray(0,
n)}function e(a){var d,b,k,n,c=a.length,e=new Uint8Array(new ArrayBuffer(c)),h=0;for(d=0;d<c;d+=1)b=a[d],128>b?e[h++]=b:(d+=1,k=a[d],224>b?e[h++]=(b&31)<<6|k&63:(d+=1,n=a[d],e[h++]=(b&15)<<12|(k&63)<<6|n&63));return e.subarray(0,h)}function l(a){return g(f(a))}function h(a){return String.fromCharCode.apply(String,b(a))}function q(a){return e(f(a))}function p(a){a=e(a);for(var d="",b=0;b<a.length;)d+=String.fromCharCode.apply(String,a.subarray(b,b+45E3)),b+=45E3;return d}function m(a,d,b){var k,n,
c,e="";for(c=d;c<b;c+=1)d=a.charCodeAt(c)&255,128>d?e+=String.fromCharCode(d):(c+=1,k=a.charCodeAt(c)&255,224>d?e+=String.fromCharCode((d&31)<<6|k&63):(c+=1,n=a.charCodeAt(c)&255,e+=String.fromCharCode((d&15)<<12|(k&63)<<6|n&63)));return e}function r(a,d){function b(){var c=n+1E5;c>a.length&&(c=a.length);k+=m(a,n,c);n=c;c=n===a.length;d(k,c)&&!c&&runtime.setTimeout(b,0)}var k="",n=0;1E5>a.length?d(m(a,0,a.length),!0):("string"!==typeof a&&(a=a.slice()),b())}function d(a){return c(f(a))}function a(a){return String.fromCharCode.apply(String,
c(a))}function n(a){return String.fromCharCode.apply(String,c(f(a)))}var k=function(a){var d={},b,k;b=0;for(k=a.length;b<k;b+=1)d[a.charAt(b)]=b;return d}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),s,y,u=runtime.getWindow(),z,x;u&&u.btoa?(z=u.btoa,s=function(a){return z(n(a))}):(z=l,s=function(a){return g(d(a))});u&&u.atob?(x=u.atob,y=function(a){a=x(a);return m(a,0,a.length)}):(x=h,y=function(a){return p(b(a))});core.Base64=function(){this.convertByteArrayToBase64=this.convertUTF8ArrayToBase64=
g;this.convertBase64ToByteArray=this.convertBase64ToUTF8Array=b;this.convertUTF16ArrayToByteArray=this.convertUTF16ArrayToUTF8Array=c;this.convertByteArrayToUTF16Array=this.convertUTF8ArrayToUTF16Array=e;this.convertUTF8StringToBase64=l;this.convertBase64ToUTF8String=h;this.convertUTF8StringToUTF16Array=q;this.convertByteArrayToUTF16String=this.convertUTF8ArrayToUTF16String=p;this.convertUTF8StringToUTF16String=r;this.convertUTF16StringToByteArray=this.convertUTF16StringToUTF8Array=d;this.convertUTF16ArrayToUTF8String=
a;this.convertUTF16StringToUTF8String=n;this.convertUTF16StringToBase64=s;this.convertBase64ToUTF16String=y;this.fromBase64=h;this.toBase64=l;this.atob=x;this.btoa=z;this.utob=n;this.btou=r;this.encode=s;this.encodeURI=function(a){return s(a).replace(/[+\/]/g,function(a){return"+"===a?"-":"_"}).replace(/\\=+$/,"")};this.decode=function(a){return y(a.replace(/[\-_]/g,function(a){return"-"===a?"+":"/"}))};return this};return core.Base64}core.Base64=makeBase64();
// Input 4
core.ByteArray=function(f){this.pos=0;this.data=f;this.readUInt32LE=function(){this.pos+=4;var f=this.data,b=this.pos;return f[--b]<<24|f[--b]<<16|f[--b]<<8|f[--b]};this.readUInt16LE=function(){this.pos+=2;var f=this.data,b=this.pos;return f[--b]<<8|f[--b]}};
// Input 5
core.ByteArrayWriter=function(f){function g(b){b>e-c&&(e=Math.max(2*e,c+b),b=new Uint8Array(new ArrayBuffer(e)),b.set(l),l=b)}var b=this,c=0,e=1024,l=new Uint8Array(new ArrayBuffer(e));this.appendByteArrayWriter=function(c){b.appendByteArray(c.getByteArray())};this.appendByteArray=function(b){var e=b.length;g(e);l.set(b,c);c+=e};this.appendArray=function(b){var e=b.length;g(e);l.set(b,c);c+=e};this.appendUInt16LE=function(c){b.appendArray([c&255,c>>8&255])};this.appendUInt32LE=function(c){b.appendArray([c&
255,c>>8&255,c>>16&255,c>>24&255])};this.appendString=function(c){b.appendByteArray(runtime.byteArrayFromString(c,f))};this.getLength=function(){return c};this.getByteArray=function(){var b=new Uint8Array(new ArrayBuffer(c));b.set(l.subarray(0,c));return b}};
// Input 6
core.CSSUnits=function(){var f=this,g={"in":1,cm:2.54,mm:25.4,pt:72,pc:12,px:96};this.convert=function(b,c,e){return b*g[e]/g[c]};this.convertMeasure=function(b,c){var e,g;b&&c&&(e=parseFloat(b),g=b.replace(e.toString(),""),e=f.convert(e,g,c));return e};this.getUnits=function(b){return b.substr(b.length-2,b.length)}};
// Input 7
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function f(){var c,e,f,h,g,p,m,r,d;void 0===b&&(e=(c=runtime.getWindow())&&c.document,p=e.documentElement,m=e.body,b={rangeBCRIgnoresElementBCR:!1,unscaledRangeClientRects:!1,elementBCRIgnoresBodyScroll:!1},e&&(h=e.createElement("div"),h.style.position="absolute",h.style.left="-99999px",h.style.transform="scale(2)",h.style["-webkit-transform"]="scale(2)",g=e.createElement("div"),h.appendChild(g),m.appendChild(h),c=e.createRange(),c.selectNode(g),b.rangeBCRIgnoresElementBCR=0===c.getClientRects().length,
g.appendChild(e.createTextNode("Rect transform test")),e=g.getBoundingClientRect(),f=c.getBoundingClientRect(),b.unscaledRangeClientRects=2<Math.abs(e.height-f.height),h.style.transform="",h.style["-webkit-transform"]="",e=p.style.overflow,f=m.style.overflow,r=m.style.height,d=m.scrollTop,p.style.overflow="visible",m.style.overflow="visible",m.style.height="200%",m.scrollTop=m.scrollHeight,b.elementBCRIgnoresBodyScroll=c.getBoundingClientRect().top!==g.getBoundingClientRect().top,m.scrollTop=d,m.style.height=
r,m.style.overflow=f,p.style.overflow=e,c.detach(),m.removeChild(h),c=Object.keys(b).map(function(a){return a+":"+String(b[a])}).join(", "),runtime.log("Detected browser quirks - "+c)));return b}function g(b,e,f){for(b=b?b.firstElementChild:null;b;){if(b.localName===f&&b.namespaceURI===e)return b;b=b.nextElementSibling}return null}var b;core.DomUtils=function(){function b(a,d){for(var k=0,c;a.parentNode!==d;)runtime.assert(null!==a.parentNode,"parent is null"),a=a.parentNode;for(c=d.firstChild;c!==
a;)k+=1,c=c.nextSibling;return k}function e(a,d){return 0>=a.compareBoundaryPoints(Range.START_TO_START,d)&&0<=a.compareBoundaryPoints(Range.END_TO_END,d)}function l(a,d){var b=null;a.nodeType===Node.TEXT_NODE&&(0===a.length?(a.parentNode.removeChild(a),d.nodeType===Node.TEXT_NODE&&(b=d)):(d.nodeType===Node.TEXT_NODE&&(a.appendData(d.data),d.parentNode.removeChild(d)),b=a));return b}function h(a){for(var d=a.parentNode;a.firstChild;)d.insertBefore(a.firstChild,a);d.removeChild(a);return d}function q(a,
d){for(var b=a.parentNode,c=a.firstChild,e;c;)e=c.nextSibling,q(c,d),c=e;b&&d(a)&&h(a);return b}function p(a,d){return a===d||Boolean(a.compareDocumentPosition(d)&Node.DOCUMENT_POSITION_CONTAINED_BY)}function m(a,d){return f().unscaledRangeClientRects?a:a/d}function r(a,d,b){Object.keys(d).forEach(function(c){var e=c.split(":"),h=e[1],f=b(e[0]),e=d[c],g=typeof e;"object"===g?Object.keys(e).length&&(c=f?a.getElementsByTagNameNS(f,h)[0]||a.ownerDocument.createElementNS(f,c):a.getElementsByTagName(h)[0]||
a.ownerDocument.createElement(c),a.appendChild(c),r(c,e,b)):f&&(runtime.assert("number"===g||"string"===g,"attempting to map unsupported type '"+g+"' (key: "+c+")"),a.setAttributeNS(f,c,String(e)))})}var d=null;this.splitBoundaries=function(a){var d,k=[],e,h,f;if(a.startContainer.nodeType===Node.TEXT_NODE||a.endContainer.nodeType===Node.TEXT_NODE){e=a.endContainer;h=a.endContainer.nodeType!==Node.TEXT_NODE?a.endOffset===a.endContainer.childNodes.length:!1;f=a.endOffset;d=a.endContainer;if(f<d.childNodes.length)for(d=
d.childNodes.item(f),f=0;d.firstChild;)d=d.firstChild;else for(;d.lastChild;)d=d.lastChild,f=d.nodeType===Node.TEXT_NODE?d.textContent.length:d.childNodes.length;d===e&&(e=null);a.setEnd(d,f);f=a.endContainer;0!==a.endOffset&&f.nodeType===Node.TEXT_NODE&&(d=f,a.endOffset!==d.length&&(k.push(d.splitText(a.endOffset)),k.push(d)));f=a.startContainer;0!==a.startOffset&&f.nodeType===Node.TEXT_NODE&&(d=f,a.startOffset!==d.length&&(f=d.splitText(a.startOffset),k.push(d),k.push(f),a.setStart(f,0)));if(null!==
e){for(f=a.endContainer;f.parentNode&&f.parentNode!==e;)f=f.parentNode;h=h?e.childNodes.length:b(f,e);a.setEnd(e,h)}}return k};this.containsRange=e;this.rangesIntersect=function(a,d){return 0>=a.compareBoundaryPoints(Range.END_TO_START,d)&&0<=a.compareBoundaryPoints(Range.START_TO_END,d)};this.getNodesInRange=function(a,d,b){var c=[],e=a.commonAncestorContainer,e=e.nodeType===Node.TEXT_NODE?e.parentNode:e;b=a.startContainer.ownerDocument.createTreeWalker(e,b,d,!1);var f,h;a.endContainer.childNodes[a.endOffset-
1]?(f=a.endContainer.childNodes[a.endOffset-1],h=Node.DOCUMENT_POSITION_PRECEDING|Node.DOCUMENT_POSITION_CONTAINED_BY):(f=a.endContainer,h=Node.DOCUMENT_POSITION_PRECEDING);a.startContainer.childNodes[a.startOffset]?(a=a.startContainer.childNodes[a.startOffset],b.currentNode=a):a.startOffset===(a.startContainer.nodeType===Node.TEXT_NODE?a.startContainer.length:a.startContainer.childNodes.length)?(a=a.startContainer,b.currentNode=a,b.lastChild(),a=b.nextNode()):(a=a.startContainer,b.currentNode=a);
if(a){a=b.currentNode;if(a!==e)for(a=a.parentNode;a&&a!==e;)d(a)===NodeFilter.FILTER_REJECT&&(b.currentNode=a),a=a.parentNode;a=b.currentNode;switch(d(a)){case NodeFilter.FILTER_REJECT:for(a=b.nextSibling();!a&&b.parentNode();)a=b.nextSibling();break;case NodeFilter.FILTER_SKIP:a=b.nextNode()}for(;a;){d=f.compareDocumentPosition(a);if(0!==d&&0===(d&h))break;c.push(a);a=b.nextNode()}}return c};this.normalizeTextNodes=function(a){a&&a.nextSibling&&(a=l(a,a.nextSibling));a&&a.previousSibling&&l(a.previousSibling,
a)};this.rangeContainsNode=function(a,d){var b=d.ownerDocument.createRange(),c=d.ownerDocument.createRange(),f;b.setStart(a.startContainer,a.startOffset);b.setEnd(a.endContainer,a.endOffset);c.selectNodeContents(d);f=e(b,c);b.detach();c.detach();return f};this.mergeIntoParent=h;this.removeUnwantedNodes=q;this.getElementsByTagNameNS=function(a,d,b){var c=[];a=a.getElementsByTagNameNS(d,b);c.length=b=a.length;for(d=0;d<b;d+=1)c[d]=a.item(d);return c};this.containsNode=function(a,d){return a===d||a.contains(d)};
this.comparePoints=function(a,d,k,e){if(a===k)return e-d;var f=a.compareDocumentPosition(k);2===f?f=-1:4===f?f=1:10===f?(d=b(a,k),f=d<e?1:-1):(e=b(k,a),f=e<d?-1:1);return f};this.adaptRangeDifferenceToZoomLevel=m;this.translateRect=function(a,d,b){return{top:m(a.top-d.top,b),left:m(a.left-d.left,b),bottom:m(a.bottom-d.top,b),right:m(a.right-d.left,b),width:m(a.width,b),height:m(a.height,b)}};this.getBoundingClientRect=function(a){var b=a.ownerDocument,k=f(),c=b.body;if((!1===k.unscaledRangeClientRects||
k.rangeBCRIgnoresElementBCR)&&a.nodeType===Node.ELEMENT_NODE)return a=a.getBoundingClientRect(),k.elementBCRIgnoresBodyScroll?{left:a.left+c.scrollLeft,right:a.right+c.scrollLeft,top:a.top+c.scrollTop,bottom:a.bottom+c.scrollTop,width:a.width,height:a.height}:a;var e;d?e=d:d=e=b.createRange();k=e;k.selectNode(a);return k.getBoundingClientRect()};this.mapKeyValObjOntoNode=function(a,d,b){Object.keys(d).forEach(function(c){var e=c.split(":"),f=e[1],e=b(e[0]),h=d[c];e?(f=a.getElementsByTagNameNS(e,f)[0],
f||(f=a.ownerDocument.createElementNS(e,c),a.appendChild(f)),f.textContent=h):runtime.log("Key ignored: "+c)})};this.removeKeyElementsFromNode=function(a,d,b){d.forEach(function(d){var c=d.split(":"),e=c[1];(c=b(c[0]))?(e=a.getElementsByTagNameNS(c,e)[0])?e.parentNode.removeChild(e):runtime.log("Element for "+d+" not found."):runtime.log("Property Name ignored: "+d)})};this.getKeyValRepresentationOfNode=function(a,d){for(var b={},c=a.firstElementChild,e;c;){if(e=d(c.namespaceURI))b[e+":"+c.localName]=
c.textContent;c=c.nextElementSibling}return b};this.mapObjOntoNode=r;this.getDirectChild=g;(function(a){var d,b;b=runtime.getWindow();null!==b&&(d=b.navigator.appVersion.toLowerCase(),b=-1===d.indexOf("chrome")&&(-1!==d.indexOf("applewebkit")||-1!==d.indexOf("safari")),d=d.indexOf("msie"),b||d)&&(a.containsNode=p)})(this)}})();
// Input 8
core.Cursor=function(f,g){function b(d){d.parentNode&&(q.push(d.previousSibling),q.push(d.nextSibling),d.parentNode.removeChild(d))}function c(d,a,b){if(a.nodeType===Node.TEXT_NODE){runtime.assert(Boolean(a),"putCursorIntoTextNode: invalid container");var c=a.parentNode;runtime.assert(Boolean(c),"putCursorIntoTextNode: container without parent");runtime.assert(0<=b&&b<=a.length,"putCursorIntoTextNode: offset is out of bounds");0===b?c.insertBefore(d,a):(b!==a.length&&a.splitText(b),c.insertBefore(d,
a.nextSibling))}else a.nodeType===Node.ELEMENT_NODE&&a.insertBefore(d,a.childNodes.item(b));q.push(d.previousSibling);q.push(d.nextSibling)}var e=f.createElementNS("urn:webodf:names:cursor","cursor"),l=f.createElementNS("urn:webodf:names:cursor","anchor"),h,q=[],p=f.createRange(),m,r=new core.DomUtils;this.getNode=function(){return e};this.getAnchorNode=function(){return l.parentNode?l:e};this.getSelectedRange=function(){m?(p.setStartBefore(e),p.collapse(!0)):(p.setStartAfter(h?l:e),p.setEndBefore(h?
e:l));return p};this.setSelectedRange=function(d,a){p&&p!==d&&p.detach();p=d;h=!1!==a;(m=d.collapsed)?(b(l),b(e),c(e,d.startContainer,d.startOffset)):(b(l),b(e),c(h?e:l,d.endContainer,d.endOffset),c(h?l:e,d.startContainer,d.startOffset));q.forEach(r.normalizeTextNodes);q.length=0};this.hasForwardSelection=function(){return h};this.remove=function(){b(e);q.forEach(r.normalizeTextNodes);q.length=0};e.setAttributeNS("urn:webodf:names:cursor","memberId",g);l.setAttributeNS("urn:webodf:names:cursor","memberId",
g)};
// Input 9
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
core.Destroyable=function(){};core.Destroyable.prototype.destroy=function(f){};
// Input 10
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
core.EventNotifier=function(f){var g={};this.emit=function(b,c){var e,f;runtime.assert(g.hasOwnProperty(b),'unknown event fired "'+b+'"');f=g[b];for(e=0;e<f.length;e+=1)f[e](c)};this.subscribe=function(b,c){runtime.assert(g.hasOwnProperty(b),'tried to subscribe to unknown event "'+b+'"');g[b].push(c)};this.unsubscribe=function(b,c){var e;runtime.assert(g.hasOwnProperty(b),'tried to unsubscribe from unknown event "'+b+'"');e=g[b].indexOf(c);runtime.assert(-1!==e,'tried to unsubscribe unknown callback from event "'+
b+'"');-1!==e&&g[b].splice(e,1)};(function(){var b,c;for(b=0;b<f.length;b+=1)c=f[b],runtime.assert(!g.hasOwnProperty(c),'Duplicated event ids: "'+c+'" registered more than once.'),g[c]=[]})()};
// Input 11
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
core.LoopWatchDog=function(f,g){var b=Date.now(),c=0;this.check=function(){var e;if(f&&(e=Date.now(),e-b>f))throw runtime.log("alert","watchdog timeout"),"timeout!";if(0<g&&(c+=1,c>g))throw runtime.log("alert","watchdog loop overflow"),"loop overflow";}};
// Input 12
core.PositionIterator=function(f,g,b,c){function e(){this.acceptNode=function(a){return!a||a.nodeType===n&&0===a.length?y:s}}function l(a){this.acceptNode=function(d){return!d||d.nodeType===n&&0===d.length?y:a.acceptNode(d)}}function h(){var a=r.currentNode,b=a.nodeType;d=b===n?a.length-1:b===k?1:0}function q(){if(null===r.previousSibling()){if(!r.parentNode()||r.currentNode===f)return r.firstChild(),!1;d=0}else h();return!0}function p(){var b=r.currentNode,c;c=a(b);if(b!==f)for(b=b.parentNode;b&&
b!==f;)a(b)===y&&(r.currentNode=b,c=y),b=b.parentNode;c===y?(d=1,b=m.nextPosition()):b=c===s?!0:m.nextPosition();b&&runtime.assert(a(r.currentNode)===s,"moveToAcceptedNode did not result in walker being on an accepted node");return b}var m=this,r,d,a,n=Node.TEXT_NODE,k=Node.ELEMENT_NODE,s=NodeFilter.FILTER_ACCEPT,y=NodeFilter.FILTER_REJECT;this.nextPosition=function(){var a=r.currentNode,b=a.nodeType;if(a===f)return!1;if(0===d&&b===k)null===r.firstChild()&&(d=1);else if(b===n&&d+1<a.length)d+=1;else if(null!==
r.nextSibling())d=0;else if(r.parentNode())d=1;else return!1;return!0};this.previousPosition=function(){var a=!0,b=r.currentNode;0===d?a=q():b.nodeType===n?d-=1:null!==r.lastChild()?h():b===f?a=!1:d=0;return a};this.previousNode=q;this.container=function(){var a=r.currentNode,b=a.nodeType;0===d&&b!==n&&(a=a.parentNode);return a};this.rightNode=function(){var b=r.currentNode,c=b.nodeType;if(c===n&&d===b.length)for(b=b.nextSibling;b&&a(b)!==s;)b=b.nextSibling;else c===k&&1===d&&(b=null);return b};this.leftNode=
function(){var b=r.currentNode;if(0===d)for(b=b.previousSibling;b&&a(b)!==s;)b=b.previousSibling;else if(b.nodeType===k)for(b=b.lastChild;b&&a(b)!==s;)b=b.previousSibling;return b};this.getCurrentNode=function(){return r.currentNode};this.unfilteredDomOffset=function(){if(r.currentNode.nodeType===n)return d;for(var a=0,b=r.currentNode,b=1===d?b.lastChild:b.previousSibling;b;)a+=1,b=b.previousSibling;return a};this.getPreviousSibling=function(){var a=r.currentNode,d=r.previousSibling();r.currentNode=
a;return d};this.getNextSibling=function(){var a=r.currentNode,d=r.nextSibling();r.currentNode=a;return d};this.setPositionBeforeElement=function(a){runtime.assert(Boolean(a),"setPositionBeforeElement called without element");r.currentNode=a;d=0;return p()};this.setUnfilteredPosition=function(a,b){runtime.assert(Boolean(a),"PositionIterator.setUnfilteredPosition called without container");r.currentNode=a;if(a.nodeType===n)return d=b,runtime.assert(b<=a.length,"Error in setPosition: "+b+" > "+a.length),
runtime.assert(0<=b,"Error in setPosition: "+b+" < 0"),b===a.length&&(r.nextSibling()?d=0:r.parentNode()?d=1:runtime.assert(!1,"Error in setUnfilteredPosition: position not valid.")),!0;b<a.childNodes.length?(r.currentNode=a.childNodes.item(b),d=0):d=1;return p()};this.moveToEnd=function(){r.currentNode=f;d=1};this.moveToEndOfNode=function(a){a.nodeType===n?m.setUnfilteredPosition(a,a.length):(r.currentNode=a,d=1)};this.isBeforeNode=function(){return 0===d};this.getNodeFilter=function(){return a};
a=(b?new l(b):new e).acceptNode;a.acceptNode=a;g=g||NodeFilter.SHOW_ALL;runtime.assert(f.nodeType!==Node.TEXT_NODE,"Internet Explorer doesn't allow tree walker roots to be text nodes");r=f.ownerDocument.createTreeWalker(f,g,a,c);d=0;null===r.firstChild()&&(d=1)};
// Input 13
core.PositionFilter=function(){};core.PositionFilter.FilterResult={FILTER_ACCEPT:1,FILTER_REJECT:2,FILTER_SKIP:3};core.PositionFilter.prototype.acceptPosition=function(f){};
// Input 14
core.PositionFilterChain=function(){var f=[],g=core.PositionFilter.FilterResult.FILTER_ACCEPT,b=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(c){var e;for(e=0;e<f.length;e+=1)if(f[e].acceptPosition(c)===b)return b;return g};this.addFilter=function(b){f.push(b)}};
// Input 15
core.zip_HuftNode=function(){this.n=this.b=this.e=0;this.t=null};core.zip_HuftList=function(){this.list=this.next=null};
core.RawInflate=function(){function f(a,d,b,c,k,e){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;var n=Array(this.BMAX+1),f,h,g,r,l,s,m,L=Array(this.BMAX+1),q,G,C,p=new core.zip_HuftNode,B=Array(this.BMAX);r=Array(this.N_MAX);var P,S=Array(this.BMAX+1),y,t,x;x=this.root=null;for(l=0;l<n.length;l++)n[l]=0;for(l=0;l<L.length;l++)L[l]=0;for(l=0;l<B.length;l++)B[l]=null;for(l=0;l<r.length;l++)r[l]=0;for(l=0;l<S.length;l++)S[l]=0;f=256<d?a[256]:this.BMAX;q=a;G=0;l=d;do n[q[G]]++,G++;
while(0<--l);if(n[0]===d)this.root=null,this.status=this.m=0;else{for(s=1;s<=this.BMAX&&0===n[s];s++);m=s;e<s&&(e=s);for(l=this.BMAX;0!==l&&0===n[l];l--);g=l;e>l&&(e=l);for(y=1<<s;s<l;s++,y<<=1)if(y-=n[s],0>y){this.status=2;this.m=e;return}y-=n[l];if(0>y)this.status=2,this.m=e;else{n[l]+=y;S[1]=s=0;q=n;G=1;for(C=2;0<--l;)s+=q[G++],S[C++]=s;q=a;l=G=0;do s=q[G++],0!==s&&(r[S[s]++]=l);while(++l<d);d=S[g];S[0]=l=0;q=r;G=0;r=-1;P=L[0]=0;C=null;t=0;for(m=m-1+1;m<=g;m++)for(a=n[m];0<a--;){for(;m>P+L[1+r];){P+=
L[1+r];r++;t=g-P;t=t>e?e:t;s=m-P;h=1<<s;if(h>a+1)for(h-=a+1,C=m;++s<t;){h<<=1;if(h<=n[++C])break;h-=n[C]}P+s>f&&P<f&&(s=f-P);t=1<<s;L[1+r]=s;C=Array(t);for(h=0;h<t;h++)C[h]=new core.zip_HuftNode;x=null===x?this.root=new core.zip_HuftList:x.next=new core.zip_HuftList;x.next=null;x.list=C;B[r]=C;0<r&&(S[r]=l,p.b=L[r],p.e=16+s,p.t=C,s=(l&(1<<P)-1)>>P-L[r],B[r-1][s].e=p.e,B[r-1][s].b=p.b,B[r-1][s].n=p.n,B[r-1][s].t=p.t)}p.b=m-P;G>=d?p.e=99:q[G]<b?(p.e=256>q[G]?16:15,p.n=q[G++]):(p.e=k[q[G]-b],p.n=c[q[G++]-
b]);h=1<<m-P;for(s=l>>P;s<t;s+=h)C[s].e=p.e,C[s].b=p.b,C[s].n=p.n,C[s].t=p.t;for(s=1<<m-1;0!==(l&s);s>>=1)l^=s;for(l^=s;(l&(1<<P)-1)!==S[r];)P-=L[r],r--}this.m=L[1];this.status=0!==y&&1!==g?1:0}}}function g(b){for(;a<b;){var c=d,k;k=t.length===D?-1:t[D++];d=c|k<<a;a+=8}}function b(a){return d&B[a]}function c(b){d>>=b;a-=b}function e(a,d,k){var e,f,l;if(0===k)return 0;for(l=0;;){g(x);f=u.list[b(x)];for(e=f.e;16<e;){if(99===e)return-1;c(f.b);e-=16;g(e);f=f.t[b(e)];e=f.e}c(f.b);if(16===e)q&=32767,a[d+
l++]=h[q++]=f.n;else{if(15===e)break;g(e);s=f.n+b(e);c(e);g(w);f=z.list[b(w)];for(e=f.e;16<e;){if(99===e)return-1;c(f.b);e-=16;g(e);f=f.t[b(e)];e=f.e}c(f.b);g(e);y=q-f.n-b(e);for(c(e);0<s&&l<k;)s--,y&=32767,q&=32767,a[d+l++]=h[q++]=h[y++]}if(l===k)return k}n=-1;return l}function l(a,d,k){var n,h,l,r,s,m,q,p=Array(316);for(n=0;n<p.length;n++)p[n]=0;g(5);m=257+b(5);c(5);g(5);q=1+b(5);c(5);g(4);n=4+b(4);c(4);if(286<m||30<q)return-1;for(h=0;h<n;h++)g(3),p[P[h]]=b(3),c(3);for(h=n;19>h;h++)p[P[h]]=0;x=
7;h=new f(p,19,19,null,null,x);if(0!==h.status)return-1;u=h.root;x=h.m;r=m+q;for(n=l=0;n<r;)if(g(x),s=u.list[b(x)],h=s.b,c(h),h=s.n,16>h)p[n++]=l=h;else if(16===h){g(2);h=3+b(2);c(2);if(n+h>r)return-1;for(;0<h--;)p[n++]=l}else{17===h?(g(3),h=3+b(3),c(3)):(g(7),h=11+b(7),c(7));if(n+h>r)return-1;for(;0<h--;)p[n++]=0;l=0}x=9;h=new f(p,m,257,G,L,x);0===x&&(h.status=1);if(0!==h.status)return-1;u=h.root;x=h.m;for(n=0;n<q;n++)p[n]=p[n+m];w=6;h=new f(p,q,0,C,S,w);z=h.root;w=h.m;return 0===w&&257<m||0!==h.status?
-1:e(a,d,k)}var h=[],q,p=null,m,r,d,a,n,k,s,y,u,z,x,w,t,D,B=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],G=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],L=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99],C=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],S=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],P=[16,17,18,0,8,7,9,6,
10,5,11,4,12,3,13,2,14,1,15],W;this.inflate=function(P,B){h.length=65536;a=d=q=0;n=-1;k=!1;s=y=0;u=null;t=P;D=0;var O=new Uint8Array(new ArrayBuffer(B));a:for(var J=0,U;J<B&&(!k||-1!==n);){if(0<s){if(0!==n)for(;0<s&&J<B;)s--,y&=32767,q&=32767,O[0+J]=h[q]=h[y],J+=1,q+=1,y+=1;else{for(;0<s&&J<B;)s-=1,q&=32767,g(8),O[0+J]=h[q]=b(8),J+=1,q+=1,c(8);0===s&&(n=-1)}if(J===B)break}if(-1===n){if(k)break;g(1);0!==b(1)&&(k=!0);c(1);g(2);n=b(2);c(2);u=null;s=0}switch(n){case 0:U=O;var ca=0+J,ba=B-J,Y=void 0,Y=
a&7;c(Y);g(16);Y=b(16);c(16);g(16);if(Y!==(~d&65535))U=-1;else{c(16);s=Y;for(Y=0;0<s&&Y<ba;)s--,q&=32767,g(8),U[ca+Y++]=h[q++]=b(8),c(8);0===s&&(n=-1);U=Y}break;case 1:if(null!==u)U=e(O,0+J,B-J);else b:{U=O;ca=0+J;ba=B-J;if(null===p){for(var v=void 0,Y=Array(288),v=void 0,v=0;144>v;v++)Y[v]=8;for(v=144;256>v;v++)Y[v]=9;for(v=256;280>v;v++)Y[v]=7;for(v=280;288>v;v++)Y[v]=8;r=7;v=new f(Y,288,257,G,L,r);if(0!==v.status){alert("HufBuild error: "+v.status);U=-1;break b}p=v.root;r=v.m;for(v=0;30>v;v++)Y[v]=
5;W=5;v=new f(Y,30,0,C,S,W);if(1<v.status){p=null;alert("HufBuild error: "+v.status);U=-1;break b}m=v.root;W=v.m}u=p;z=m;x=r;w=W;U=e(U,ca,ba)}break;case 2:U=null!==u?e(O,0+J,B-J):l(O,0+J,B-J);break;default:U=-1}if(-1===U)break a;J+=U}t=new Uint8Array(new ArrayBuffer(0));return O}};
// Input 16
core.ScheduledTask=function(f,g,b){function c(){h&&(b(l),h=!1)}function e(){c();f.apply(void 0,q);q=null}var l,h=!1,q=[];this.trigger=function(){q=Array.prototype.slice.call(arguments);h||(h=!0,l=g(e))};this.triggerImmediate=function(){q=Array.prototype.slice.call(arguments);e()};this.processRequests=function(){h&&e()};this.cancel=c;this.destroy=function(b){c();b()}};
// Input 17
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
core.StepIterator=function(f,g){function b(){r=null;a=d=void 0}function c(){void 0===a&&(a=f.acceptPosition(g)===m);return a}function e(a,d){b();return g.setUnfilteredPosition(a,d)}function l(){r||(r=g.container());return r}function h(){void 0===d&&(d=g.unfilteredDomOffset());return d}function q(){for(b();g.nextPosition();)if(b(),c())return!0;return!1}function p(){for(b();g.previousPosition();)if(b(),c())return!0;return!1}var m=core.PositionFilter.FilterResult.FILTER_ACCEPT,r,d,a;this.isStep=c;this.setPosition=
e;this.container=l;this.offset=h;this.nextStep=q;this.previousStep=p;this.roundToClosestStep=function(){var a=l(),d=h(),b=c();b||(b=p(),b||(e(a,d),b=q()));return b};this.roundToPreviousStep=function(){var a=c();a||(a=p());return a};this.roundToNextStep=function(){var a=c();a||(a=q());return a};this.leftNode=function(){return g.leftNode()}};
// Input 18
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var f;core.Task={};core.Task.SUPPRESS_MANUAL_PROCESSING=!1;core.Task.processTasks=function(){core.Task.SUPPRESS_MANUAL_PROCESSING||f.performRedraw()};core.Task.createRedrawTask=function(g){return new core.ScheduledTask(g,f.requestRedrawTask,f.cancelRedrawTask)};core.Task.createTimeoutTask=function(f,b){return new core.ScheduledTask(f,function(c){return runtime.setTimeout(c,b)},runtime.clearTimeout)};f=new function(){var f={};this.requestRedrawTask=function(b){var c=runtime.requestAnimationFrame(function(){b();
delete f[c]});f[c]=b;return c};this.performRedraw=function(){Object.keys(f).forEach(function(b){f[b]();runtime.cancelAnimationFrame(parseInt(b,10))});f={}};this.cancelRedrawTask=function(b){runtime.cancelAnimationFrame(b);delete f[b]}}})();
// Input 19
core.UnitTest=function(){};core.UnitTest.prototype.setUp=function(){};core.UnitTest.prototype.tearDown=function(){};core.UnitTest.prototype.description=function(){};core.UnitTest.prototype.tests=function(){};core.UnitTest.prototype.asyncTests=function(){};
core.UnitTest.provideTestAreaDiv=function(){var f=runtime.getWindow().document,g=f.getElementById("testarea");runtime.assert(!g,'Unclean test environment, found a div with id "testarea".');g=f.createElement("div");g.setAttribute("id","testarea");f.body.appendChild(g);return g};
core.UnitTest.cleanupTestAreaDiv=function(){var f=runtime.getWindow().document,g=f.getElementById("testarea");runtime.assert(!!g&&g.parentNode===f.body,'Test environment broken, found no div with id "testarea" below body.');f.body.removeChild(g)};core.UnitTest.createXmlDocument=function(f,g,b){var c="<?xml version='1.0' encoding='UTF-8'?>",c=c+("<"+f);Object.keys(b).forEach(function(e){c+=" xmlns:"+e+'="'+b[e]+'"'});c+=">";c+=g;c+="</"+f+">";return runtime.parseXML(c)};
core.UnitTest.createOdtDocument=function(f,g){return core.UnitTest.createXmlDocument("office:document",f,g)};
core.UnitTestLogger=function(){var f=[],g=0,b=0,c="",e="";this.startTest=function(l,h){f=[];g=0;c=l;e=h;b=Date.now()};this.endTest=function(){var l=Date.now();return{description:e,suite:[c,e],success:0===g,log:f,time:l-b}};this.debug=function(b){f.push({category:"debug",message:b})};this.fail=function(b){g+=1;f.push({category:"fail",message:b})};this.pass=function(b){f.push({category:"pass",message:b})}};
core.UnitTestRunner=function(f,g){function b(a){p+=1;d?g.debug(a):g.fail(a)}function c(a,d){var c;try{if(a.length!==d.length)return b("array of length "+a.length+" should be "+d.length+" long"),!1;for(c=0;c<a.length;c+=1)if(a[c]!==d[c])return b(a[c]+" should be "+d[c]+" at array index "+c),!1}catch(e){return!1}return!0}function e(a,d,c){var f=a.attributes,h=f.length,g,l,r;for(g=0;g<h;g+=1)if(l=f.item(g),"xmlns"!==l.prefix&&"urn:webodf:names:steps"!==l.namespaceURI){r=d.getAttributeNS(l.namespaceURI,
l.localName);if(!d.hasAttributeNS(l.namespaceURI,l.localName))return b("Attribute "+l.localName+" with value "+l.value+" was not present"),!1;if(r!==l.value)return b("Attribute "+l.localName+" was "+r+" should be "+l.value),!1}return c?!0:e(d,a,!0)}function l(a,d){var c,f;c=a.nodeType;f=d.nodeType;if(c!==f)return b("Nodetype '"+c+"' should be '"+f+"'"),!1;if(c===Node.TEXT_NODE){if(a.data===d.data)return!0;b("Textnode data '"+a.data+"' should be '"+d.data+"'");return!1}runtime.assert(c===Node.ELEMENT_NODE,
"Only textnodes and elements supported.");if(a.namespaceURI!==d.namespaceURI)return b("namespace '"+a.namespaceURI+"' should be '"+d.namespaceURI+"'"),!1;if(a.localName!==d.localName)return b("localName '"+a.localName+"' should be '"+d.localName+"'"),!1;if(!e(a,d,!1))return!1;c=a.firstChild;for(f=d.firstChild;c;){if(!f)return b("Nodetype '"+c.nodeType+"' is unexpected here."),!1;if(!l(c,f))return!1;c=c.nextSibling;f=f.nextSibling}return f?(b("Nodetype '"+f.nodeType+"' is missing here."),!1):!0}function h(a,
d,b){if(0===d)return a===d&&1/a===1/d;if(a===d)return!0;if(null===a||null===d)return!1;if("number"===typeof d&&isNaN(d))return"number"===typeof a&&isNaN(a);if("number"===typeof d&&"number"===typeof a){if(a===d)return!0;void 0===b&&(b=1E-4);runtime.assert("number"===typeof b,"Absolute tolerance not given as number.");runtime.assert(0<=b,"Absolute tolerance should be given as positive number, was "+b);a=Math.abs(a-d);return a<=b}return Object.prototype.toString.call(d)===Object.prototype.toString.call([])?
c(a,d):"object"===typeof d&&"object"===typeof a?d.constructor===Element||d.constructor===Node?l(a,d):r(a,d):!1}function q(a,d,c,e){"string"===typeof d&&"string"===typeof c||g.debug("WARN: shouldBe() expects string arguments");var f,l;try{l=eval(d)}catch(r){f=r}a=eval(c);f?b(d+" should be "+a+". Threw exception "+f):h(l,a,e)?g.pass(d+" is "+c):String(typeof l)===String(typeof a)?(c=0===l&&0>1/l?"-0":String(l),b(d+" should be "+a+". Was "+c+".")):b(d+" should be "+a+" (of type "+typeof a+"). Was "+
l+" (of type "+typeof l+").")}var p=0,m,r,d=!1;this.resourcePrefix=function(){return f};this.beginExpectFail=function(){m=p;d=!0};this.endExpectFail=function(){var a=m===p;d=!1;p=m;a&&(p+=1,g.fail("Expected at least one failed test, but none registered."))};r=function(a,d){var e=Object.keys(a),f=Object.keys(d);e.sort();f.sort();return c(e,f)&&Object.keys(a).every(function(c){var e=a[c],k=d[c];return h(e,k)?!0:(b(e+" should be "+k+" for key "+c),!1)})};this.areNodesEqual=l;this.shouldBeNull=function(a,
d){q(a,d,"null")};this.shouldBeNonNull=function(a,d){var c,e;try{e=eval(d)}catch(f){c=f}c?b(d+" should be non-null. Threw exception "+c):null!==e?g.pass(d+" is non-null."):b(d+" should be non-null. Was "+e)};this.shouldBe=q;this.testFailed=b;this.countFailedTests=function(){return p};this.name=function(a){var d,b,c=[],e=a.length;c.length=e;for(d=0;d<e;d+=1){b=Runtime.getFunctionName(a[d])||"";if(""===b)throw"Found a function without a name.";c[d]={f:a[d],name:b}}return c}};
core.UnitTester=function(){function f(b,c){return"<span style='color:blue;cursor:pointer' onclick='"+c+"'>"+b+"</span>"}function g(c){b.reporter&&b.reporter(c)}var b=this,c=0,e=new core.UnitTestLogger,l={},h="BrowserRuntime"===runtime.type();this.resourcePrefix="";this.reporter=function(b){var c,e;h?runtime.log("<span>Running "+f(b.description,'runTest("'+b.suite[0]+'","'+b.description+'")')+"</span>"):runtime.log("Running "+b.description);if(!b.success)for(c=0;c<b.log.length;c+=1)e=b.log[c],runtime.log(e.category,
e.message)};this.runTests=function(q,p,m){function r(b){function f(){s&&a.endExpectFail();g(e.endTest());n.tearDown();k[h]=x===a.countFailedTests();r(b.slice(1))}var h,s;if(0===b.length)l[d]=k,c+=a.countFailedTests(),p();else if(y=b[0].f,h=b[0].name,s=!0===b[0].expectFail,x=a.countFailedTests(),m.length&&-1===m.indexOf(h))r(b.slice(1));else{n.setUp();e.startTest(d,h);s&&a.beginExpectFail();try{y(f)}catch(L){a.testFailed("Unexpected exception encountered: "+L.toString()+"\n"+L.stack),f()}}}var d=Runtime.getFunctionName(q)||
"",a=new core.UnitTestRunner(b.resourcePrefix,e),n=new q(a),k={},s,y,u,z,x;if(l.hasOwnProperty(d))runtime.log("Test "+d+" has already run.");else{h?runtime.log("<span>Running "+f(d,'runSuite("'+d+'");')+": "+n.description()+"</span>"):runtime.log("Running "+d+": "+n.description);u=n.tests();for(s=0;s<u.length;s+=1)if(y=u[s].f,q=u[s].name,z=!0===u[s].expectFail,!m.length||-1!==m.indexOf(q)){x=a.countFailedTests();n.setUp();e.startTest(d,q);z&&a.beginExpectFail();try{y()}catch(w){a.testFailed("Unexpected exception encountered: "+
w.toString()+"\n"+w.stack)}z&&a.endExpectFail();g(e.endTest());n.tearDown();k[q]=x===a.countFailedTests()}r(n.asyncTests())}};this.countFailedTests=function(){return c};this.results=function(){return l}};
// Input 20
core.Utils=function(){function f(g,b){if(b&&Array.isArray(b)){g=g||[];if(!Array.isArray(g))throw"Destination is not an array.";g=g.concat(b.map(function(b){return f(null,b)}))}else if(b&&"object"===typeof b){g=g||{};if("object"!==typeof g)throw"Destination is not an object.";Object.keys(b).forEach(function(c){g[c]=f(g[c],b[c])})}else g=b;return g}this.hashString=function(f){var b=0,c,e;c=0;for(e=f.length;c<e;c+=1)b=(b<<5)-b+f.charCodeAt(c),b|=0;return b};this.mergeObjects=function(g,b){Object.keys(b).forEach(function(c){g[c]=
f(g[c],b[c])});return g}};
// Input 21
/*

 WebODF
 Copyright (c) 2010 Jos van den Oever
 Licensed under the ... License:

 Project home: http://www.webodf.org/
*/
core.Zip=function(f,g){function b(a){var d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,
853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,
4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,
225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,
2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,
2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],b,c,e=a.length,k=0,k=0;b=-1;for(c=0;c<e;c+=1)k=(b^a[c])&255,k=d[k],b=b>>>8^k;return b^-1}function c(a){return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&15,a>>5&63,(a&31)<<1)}function e(a){var d=a.getFullYear();return 1980>d?0:d-1980<<
25|a.getMonth()+1<<21|a.getDate()<<16|a.getHours()<<11|a.getMinutes()<<5|a.getSeconds()>>1}function l(a,d){var b,e,f,h,n,g,l,r=this;this.load=function(d){if(null!==r.data)d(null,r.data);else{var b=n+34+e+f+256;b+l>k&&(b=k-l);runtime.read(a,l,b,function(b,c){if(b||null===c)d(b,c);else a:{var e=c,k=new core.ByteArray(e),f=k.readUInt32LE(),l;if(67324752!==f)d("File entry signature is wrong."+f.toString()+" "+e.length.toString(),null);else{k.pos+=22;f=k.readUInt16LE();l=k.readUInt16LE();k.pos+=f+l;if(h){e=
e.subarray(k.pos,k.pos+n);if(n!==e.length){d("The amount of compressed bytes read was "+e.length.toString()+" instead of "+n.toString()+" for "+r.filename+" in "+a+".",null);break a}e=y(e,g)}else e=e.subarray(k.pos,k.pos+g);g!==e.length?d("The amount of bytes read was "+e.length.toString()+" instead of "+g.toString()+" for "+r.filename+" in "+a+".",null):(r.data=e,d(null,e))}}})}};this.set=function(a,d,b,c){r.filename=a;r.data=d;r.compressed=b;r.date=c};this.error=null;d&&(b=d.readUInt32LE(),33639248!==
b?this.error="Central directory entry has wrong signature at position "+(d.pos-4).toString()+' for file "'+a+'": '+d.data.length.toString():(d.pos+=6,h=d.readUInt16LE(),this.date=c(d.readUInt32LE()),d.readUInt32LE(),n=d.readUInt32LE(),g=d.readUInt32LE(),e=d.readUInt16LE(),f=d.readUInt16LE(),b=d.readUInt16LE(),d.pos+=8,l=d.readUInt32LE(),this.filename=runtime.byteArrayToString(d.data.subarray(d.pos,d.pos+e),"utf8"),this.data=null,d.pos+=e+f+b))}function h(a,d){if(22!==a.length)d("Central directory length should be 22.",
u);else{var b=new core.ByteArray(a),c;c=b.readUInt32LE();101010256!==c?d("Central directory signature is wrong: "+c.toString(),u):(c=b.readUInt16LE(),0!==c?d("Zip files with non-zero disk numbers are not supported.",u):(c=b.readUInt16LE(),0!==c?d("Zip files with non-zero disk numbers are not supported.",u):(c=b.readUInt16LE(),s=b.readUInt16LE(),c!==s?d("Number of entries is inconsistent.",u):(c=b.readUInt32LE(),b=b.readUInt16LE(),b=k-22-c,runtime.read(f,b,k-b,function(a,b){if(a||null===b)d(a,u);else a:{var c=
new core.ByteArray(b),e,k;n=[];for(e=0;e<s;e+=1){k=new l(f,c);if(k.error){d(k.error,u);break a}n[n.length]=k}d(null,u)}})))))}}function q(a,d){var b=null,c,e;for(e=0;e<n.length;e+=1)if(c=n[e],c.filename===a){b=c;break}b?b.data?d(null,b.data):b.load(d):d(a+" not found.",null)}function p(a){var d=new core.ByteArrayWriter("utf8"),c=0;d.appendArray([80,75,3,4,20,0,0,0,0,0]);a.data&&(c=a.data.length);d.appendUInt32LE(e(a.date));d.appendUInt32LE(a.data?b(a.data):0);d.appendUInt32LE(c);d.appendUInt32LE(c);
d.appendUInt16LE(a.filename.length);d.appendUInt16LE(0);d.appendString(a.filename);a.data&&d.appendByteArray(a.data);return d}function m(a,d){var c=new core.ByteArrayWriter("utf8"),k=0;c.appendArray([80,75,1,2,20,0,20,0,0,0,0,0]);a.data&&(k=a.data.length);c.appendUInt32LE(e(a.date));c.appendUInt32LE(a.data?b(a.data):0);c.appendUInt32LE(k);c.appendUInt32LE(k);c.appendUInt16LE(a.filename.length);c.appendArray([0,0,0,0,0,0,0,0,0,0,0,0]);c.appendUInt32LE(d);c.appendString(a.filename);return c}function r(a,
d){if(a===n.length)d(null);else{var b=n[a];null!==b.data?r(a+1,d):b.load(function(b){b?d(b):r(a+1,d)})}}function d(a,d){r(0,function(b){if(b)d(b);else{var c,e,k=new core.ByteArrayWriter("utf8"),f=[0];for(c=0;c<n.length;c+=1)k.appendByteArrayWriter(p(n[c])),f.push(k.getLength());b=k.getLength();for(c=0;c<n.length;c+=1)e=n[c],k.appendByteArrayWriter(m(e,f[c]));c=k.getLength()-b;k.appendArray([80,75,5,6,0,0,0,0]);k.appendUInt16LE(n.length);k.appendUInt16LE(n.length);k.appendUInt32LE(c);k.appendUInt32LE(b);
k.appendArray([0,0]);a(k.getByteArray())}})}function a(a,b){d(function(d){runtime.writeFile(a,d,b)},b)}var n,k,s,y=(new core.RawInflate).inflate,u=this,z=new core.Base64;this.load=q;this.save=function(a,d,b,c){var e,k;for(e=0;e<n.length;e+=1)if(k=n[e],k.filename===a){k.set(a,d,b,c);return}k=new l(f);k.set(a,d,b,c);n.push(k)};this.remove=function(a){var d,b;for(d=0;d<n.length;d+=1)if(b=n[d],b.filename===a)return n.splice(d,1),!0;return!1};this.write=function(d){a(f,d)};this.writeAs=a;this.createByteArray=
d;this.loadContentXmlAsFragments=function(a,d){u.loadAsString(a,function(a,b){if(a)return d.rootElementReady(a);d.rootElementReady(null,b,!0)})};this.loadAsString=function(a,d){q(a,function(a,b){if(a||null===b)return d(a,null);var c=runtime.byteArrayToString(b,"utf8");d(null,c)})};this.loadAsDOM=function(a,d){u.loadAsString(a,function(a,b){if(a||null===b)d(a,null);else{var c=(new DOMParser).parseFromString(b,"text/xml");d(null,c)}})};this.loadAsDataURL=function(a,d,b){q(a,function(a,c){if(a||!c)return b(a,
null);var e=0,k;d||(d=80===c[1]&&78===c[2]&&71===c[3]?"image/png":255===c[0]&&216===c[1]&&255===c[2]?"image/jpeg":71===c[0]&&73===c[1]&&70===c[2]?"image/gif":"");for(k="data:"+d+";base64,";e<c.length;)k+=z.convertUTF8ArrayToBase64(c.subarray(e,Math.min(e+45E3,c.length))),e+=45E3;b(null,k)})};this.getEntries=function(){return n.slice()};k=-1;null===g?n=[]:runtime.getFileSize(f,function(a){k=a;0>k?g("File '"+f+"' cannot be read.",u):runtime.read(f,k-22,22,function(a,d){a||null===g||null===d?g(a,u):
h(d,g)})})};
// Input 22
xmldom.LSSerializerFilter=function(){};xmldom.LSSerializerFilter.prototype.acceptNode=function(f){};
// Input 23
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.OdfNodeFilter=function(){this.acceptNode=function(f){return"http://www.w3.org/1999/xhtml"===f.namespaceURI?NodeFilter.FILTER_SKIP:f.namespaceURI&&f.namespaceURI.match(/^urn:webodf:/)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}};
// Input 24
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.Namespaces={namespaceMap:{db:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",dc:"http://purl.org/dc/elements/1.1/",dr3d:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",draw:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",chart:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",fo:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",form:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",meta:"urn:oasis:names:tc:opendocument:xmlns:meta:1.0",number:"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",
office:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",presentation:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",style:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",svg:"urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",table:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",text:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},prefixMap:{},dbns:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",
dcns:"http://purl.org/dc/elements/1.1/",dr3dns:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",drawns:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",chartns:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",fons:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",formns:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",metans:"urn:oasis:names:tc:opendocument:xmlns:meta:1.0",numberns:"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",officens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
presentationns:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",stylens:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",svgns:"urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",tablens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",textns:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",xlinkns:"http://www.w3.org/1999/xlink",xmlns:"http://www.w3.org/XML/1998/namespace"};
(function(){var f=odf.Namespaces.namespaceMap,g=odf.Namespaces.prefixMap,b;for(b in f)f.hasOwnProperty(b)&&(g[f[b]]=b)})();odf.Namespaces.forEachPrefix=function(f){var g=odf.Namespaces.namespaceMap,b;for(b in g)g.hasOwnProperty(b)&&f(b,g[b])};odf.Namespaces.lookupNamespaceURI=function(f){var g=null;odf.Namespaces.namespaceMap.hasOwnProperty(f)&&(g=odf.Namespaces.namespaceMap[f]);return g};odf.Namespaces.lookupPrefix=function(f){var g=odf.Namespaces.prefixMap;return g.hasOwnProperty(f)?g[f]:null};
odf.Namespaces.lookupNamespaceURI.lookupNamespaceURI=odf.Namespaces.lookupNamespaceURI;
// Input 25
xmldom.XPathIterator=function(){};xmldom.XPathIterator.prototype.next=function(){};xmldom.XPathIterator.prototype.reset=function(){};
function createXPathSingleton(){function f(b,d,a){return-1!==b&&(b<d||-1===d)&&(b<a||-1===a)}function g(b){for(var d=[],a=0,c=b.length,e;a<c;){var h=b,g=c,l=d,q="",p=[],w=h.indexOf("[",a),t=h.indexOf("/",a),D=h.indexOf("=",a);f(t,w,D)?(q=h.substring(a,t),a=t+1):f(w,t,D)?(q=h.substring(a,w),a=m(h,w,p)):f(D,t,w)?(q=h.substring(a,D),a=D):(q=h.substring(a,g),a=g);l.push({location:q,predicates:p});if(a<c&&"="===b[a]){e=b.substring(a+1,c);if(2<e.length&&("'"===e[0]||'"'===e[0]))e=e.slice(1,e.length-1);
else try{e=parseInt(e,10)}catch(B){}a=c}}return{steps:d,value:e}}function b(){var b=null,d=!1;this.setNode=function(a){b=a};this.reset=function(){d=!1};this.next=function(){var a=d?null:b;d=!0;return a}}function c(b,d,a){this.reset=function(){b.reset()};this.next=function(){for(var c=b.next();c;){c.nodeType===Node.ELEMENT_NODE&&(c=c.getAttributeNodeNS(d,a));if(c)break;c=b.next()}return c}}function e(b,d){var a=b.next(),c=null;this.reset=function(){b.reset();a=b.next();c=null};this.next=function(){for(;a;){if(c)if(d&&
c.firstChild)c=c.firstChild;else{for(;!c.nextSibling&&c!==a;)c=c.parentNode;c===a?a=b.next():c=c.nextSibling}else{do(c=a.firstChild)||(a=b.next());while(a&&!c)}if(c&&c.nodeType===Node.ELEMENT_NODE)return c}return null}}function l(b,d){this.reset=function(){b.reset()};this.next=function(){for(var a=b.next();a&&!d(a);)a=b.next();return a}}function h(b,d,a){d=d.split(":",2);var c=a(d[0]),e=d[1];return new l(b,function(a){return a.localName===e&&a.namespaceURI===c})}function q(c,d,a){var e=new b,k=p(e,
d,a),f=d.value;return void 0===f?new l(c,function(a){e.setNode(a);k.reset();return null!==k.next()}):new l(c,function(a){e.setNode(a);k.reset();return(a=k.next())?a.nodeValue===f:!1})}var p,m;m=function(b,d,a){for(var c=d,e=b.length,f=0;c<e;)"]"===b[c]?(f-=1,0>=f&&a.push(g(b.substring(d,c)))):"["===b[c]&&(0>=f&&(d=c+1),f+=1),c+=1;return c};p=function(b,d,a){var f,k,g,l;for(f=0;f<d.steps.length;f+=1){g=d.steps[f];k=g.location;if(""===k)b=new e(b,!1);else if("@"===k[0]){k=k.substr(1).split(":",2);l=
a(k[0]);if(!l)throw"No namespace associated with the prefix "+k[0];b=new c(b,l,k[1])}else"."!==k&&(b=new e(b,!1),-1!==k.indexOf(":")&&(b=h(b,k,a)));for(k=0;k<g.predicates.length;k+=1)l=g.predicates[k],b=q(b,l,a)}return b};return{getODFElementsWithXPath:function(c,d,a){var e=c.ownerDocument,k=[],f=null;if(e&&"function"===typeof e.evaluate)for(a=e.evaluate(d,c,a,XPathResult.UNORDERED_NODE_ITERATOR_TYPE,null),f=a.iterateNext();null!==f;)f.nodeType===Node.ELEMENT_NODE&&k.push(f),f=a.iterateNext();else{k=
new b;k.setNode(c);c=g(d);k=p(k,c,a);c=[];for(a=k.next();a;)c.push(a),a=k.next();k=c}return k}}}xmldom.XPath=createXPathSingleton();
// Input 26
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.StyleInfo=function(){function f(a,d){var b,c,e,k,h,g=0;if(b=G[a.localName])if(e=b[a.namespaceURI])g=e.length;for(b=0;b<g;b+=1)c=e[b],k=c.ns,h=c.localname,(c=a.getAttributeNS(k,h))&&a.setAttributeNS(k,D[k]+h,d+c);for(e=a.firstElementChild;e;)f(e,d),e=e.nextElementSibling}function g(a,d){var b,c,e,k,f,h=0;if(b=G[a.localName])if(e=b[a.namespaceURI])h=e.length;for(b=0;b<h;b+=1)if(c=e[b],k=c.ns,f=c.localname,c=a.getAttributeNS(k,f))c=c.replace(d,""),a.setAttributeNS(k,D[k]+f,c);for(e=a.firstElementChild;e;)g(e,
d),e=e.nextElementSibling}function b(a,d){var b,c,e,k,f,h=0;if(b=G[a.localName])if(e=b[a.namespaceURI])h=e.length;for(b=0;b<h;b+=1)if(k=e[b],c=k.ns,f=k.localname,c=a.getAttributeNS(c,f))d=d||{},k=k.keyname,d.hasOwnProperty(k)?d[k][c]=1:(f={},f[c]=1,d[k]=f);return d}function c(a,d){var e,k;b(a,d);for(e=a.firstChild;e;)e.nodeType===Node.ELEMENT_NODE&&(k=e,c(k,d)),e=e.nextSibling}function e(a,d,b){this.key=a;this.name=d;this.family=b;this.requires={}}function l(a,d,b){var c=a+'"'+d,k=b[c];k||(k=b[c]=
new e(c,a,d));return k}function h(a,d,b){var c,e,k,f,g,n=0;c=a.getAttributeNS(x,"name");f=a.getAttributeNS(x,"family");c&&f&&(d=l(c,f,b));if(d){if(c=G[a.localName])if(k=c[a.namespaceURI])n=k.length;for(c=0;c<n;c+=1)if(f=k[c],e=f.ns,g=f.localname,e=a.getAttributeNS(e,g))f=f.keyname,f=l(e,f,b),d.requires[f.key]=f}for(a=a.firstElementChild;a;)h(a,d,b),a=a.nextElementSibling;return b}function q(a,d){var b=d[a.family];b||(b=d[a.family]={});b[a.name]=1;Object.keys(a.requires).forEach(function(b){q(a.requires[b],
d)})}function p(a,d){var b=h(a,null,{});Object.keys(b).forEach(function(a){a=b[a];var c=d[a.family];c&&c.hasOwnProperty(a.name)&&q(a,d)})}function m(a,d){function b(d){(d=k.getAttributeNS(x,d))&&(a[d]=!0)}var c=["font-name","font-name-asian","font-name-complex"],e,k;for(e=d&&d.firstElementChild;e;)k=e,c.forEach(b),m(a,k),e=e.nextElementSibling}function r(a,d){function b(a){var c=k.getAttributeNS(x,a);c&&d.hasOwnProperty(c)&&k.setAttributeNS(x,"style:"+a,d[c])}var c=["font-name","font-name-asian",
"font-name-complex"],e,k;for(e=a&&a.firstElementChild;e;)k=e,c.forEach(b),r(k,d),e=e.nextElementSibling}var d=odf.Namespaces.chartns,a=odf.Namespaces.dbns,n=odf.Namespaces.dr3dns,k=odf.Namespaces.drawns,s=odf.Namespaces.formns,y=odf.Namespaces.numberns,u=odf.Namespaces.officens,z=odf.Namespaces.presentationns,x=odf.Namespaces.stylens,w=odf.Namespaces.tablens,t=odf.Namespaces.textns,D={"urn:oasis:names:tc:opendocument:xmlns:chart:1.0":"chart:","urn:oasis:names:tc:opendocument:xmlns:database:1.0":"db:",
"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0":"dr3d:","urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":"draw:","urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0":"fo:","urn:oasis:names:tc:opendocument:xmlns:form:1.0":"form:","urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0":"number:","urn:oasis:names:tc:opendocument:xmlns:office:1.0":"office:","urn:oasis:names:tc:opendocument:xmlns:presentation:1.0":"presentation:","urn:oasis:names:tc:opendocument:xmlns:style:1.0":"style:","urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0":"svg:",
"urn:oasis:names:tc:opendocument:xmlns:table:1.0":"table:","urn:oasis:names:tc:opendocument:xmlns:text:1.0":"chart:","http://www.w3.org/XML/1998/namespace":"xml:"},B={text:[{ens:x,en:"tab-stop",ans:x,a:"leader-text-style"},{ens:x,en:"drop-cap",ans:x,a:"style-name"},{ens:t,en:"notes-configuration",ans:t,a:"citation-body-style-name"},{ens:t,en:"notes-configuration",ans:t,a:"citation-style-name"},{ens:t,en:"a",ans:t,a:"style-name"},{ens:t,en:"alphabetical-index",ans:t,a:"style-name"},{ens:t,en:"linenumbering-configuration",
ans:t,a:"style-name"},{ens:t,en:"list-level-style-number",ans:t,a:"style-name"},{ens:t,en:"ruby-text",ans:t,a:"style-name"},{ens:t,en:"span",ans:t,a:"style-name"},{ens:t,en:"a",ans:t,a:"visited-style-name"},{ens:x,en:"text-properties",ans:x,a:"text-line-through-text-style"},{ens:t,en:"alphabetical-index-source",ans:t,a:"main-entry-style-name"},{ens:t,en:"index-entry-bibliography",ans:t,a:"style-name"},{ens:t,en:"index-entry-chapter",ans:t,a:"style-name"},{ens:t,en:"index-entry-link-end",ans:t,a:"style-name"},
{ens:t,en:"index-entry-link-start",ans:t,a:"style-name"},{ens:t,en:"index-entry-page-number",ans:t,a:"style-name"},{ens:t,en:"index-entry-span",ans:t,a:"style-name"},{ens:t,en:"index-entry-tab-stop",ans:t,a:"style-name"},{ens:t,en:"index-entry-text",ans:t,a:"style-name"},{ens:t,en:"index-title-template",ans:t,a:"style-name"},{ens:t,en:"list-level-style-bullet",ans:t,a:"style-name"},{ens:t,en:"outline-level-style",ans:t,a:"style-name"}],paragraph:[{ens:k,en:"caption",ans:k,a:"text-style-name"},{ens:k,
en:"circle",ans:k,a:"text-style-name"},{ens:k,en:"connector",ans:k,a:"text-style-name"},{ens:k,en:"control",ans:k,a:"text-style-name"},{ens:k,en:"custom-shape",ans:k,a:"text-style-name"},{ens:k,en:"ellipse",ans:k,a:"text-style-name"},{ens:k,en:"frame",ans:k,a:"text-style-name"},{ens:k,en:"line",ans:k,a:"text-style-name"},{ens:k,en:"measure",ans:k,a:"text-style-name"},{ens:k,en:"path",ans:k,a:"text-style-name"},{ens:k,en:"polygon",ans:k,a:"text-style-name"},{ens:k,en:"polyline",ans:k,a:"text-style-name"},
{ens:k,en:"rect",ans:k,a:"text-style-name"},{ens:k,en:"regular-polygon",ans:k,a:"text-style-name"},{ens:u,en:"annotation",ans:k,a:"text-style-name"},{ens:s,en:"column",ans:s,a:"text-style-name"},{ens:x,en:"style",ans:x,a:"next-style-name"},{ens:w,en:"body",ans:w,a:"paragraph-style-name"},{ens:w,en:"even-columns",ans:w,a:"paragraph-style-name"},{ens:w,en:"even-rows",ans:w,a:"paragraph-style-name"},{ens:w,en:"first-column",ans:w,a:"paragraph-style-name"},{ens:w,en:"first-row",ans:w,a:"paragraph-style-name"},
{ens:w,en:"last-column",ans:w,a:"paragraph-style-name"},{ens:w,en:"last-row",ans:w,a:"paragraph-style-name"},{ens:w,en:"odd-columns",ans:w,a:"paragraph-style-name"},{ens:w,en:"odd-rows",ans:w,a:"paragraph-style-name"},{ens:t,en:"notes-configuration",ans:t,a:"default-style-name"},{ens:t,en:"alphabetical-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"bibliography-entry-template",ans:t,a:"style-name"},{ens:t,en:"h",ans:t,a:"style-name"},{ens:t,en:"illustration-index-entry-template",ans:t,a:"style-name"},
{ens:t,en:"index-source-style",ans:t,a:"style-name"},{ens:t,en:"object-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"p",ans:t,a:"style-name"},{ens:t,en:"table-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"table-of-content-entry-template",ans:t,a:"style-name"},{ens:t,en:"table-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"user-index-entry-template",ans:t,a:"style-name"},{ens:x,en:"page-layout-properties",ans:x,a:"register-truth-ref-style-name"}],chart:[{ens:d,en:"axis",ans:d,
a:"style-name"},{ens:d,en:"chart",ans:d,a:"style-name"},{ens:d,en:"data-label",ans:d,a:"style-name"},{ens:d,en:"data-point",ans:d,a:"style-name"},{ens:d,en:"equation",ans:d,a:"style-name"},{ens:d,en:"error-indicator",ans:d,a:"style-name"},{ens:d,en:"floor",ans:d,a:"style-name"},{ens:d,en:"footer",ans:d,a:"style-name"},{ens:d,en:"grid",ans:d,a:"style-name"},{ens:d,en:"legend",ans:d,a:"style-name"},{ens:d,en:"mean-value",ans:d,a:"style-name"},{ens:d,en:"plot-area",ans:d,a:"style-name"},{ens:d,en:"regression-curve",
ans:d,a:"style-name"},{ens:d,en:"series",ans:d,a:"style-name"},{ens:d,en:"stock-gain-marker",ans:d,a:"style-name"},{ens:d,en:"stock-loss-marker",ans:d,a:"style-name"},{ens:d,en:"stock-range-line",ans:d,a:"style-name"},{ens:d,en:"subtitle",ans:d,a:"style-name"},{ens:d,en:"title",ans:d,a:"style-name"},{ens:d,en:"wall",ans:d,a:"style-name"}],section:[{ens:t,en:"alphabetical-index",ans:t,a:"style-name"},{ens:t,en:"bibliography",ans:t,a:"style-name"},{ens:t,en:"illustration-index",ans:t,a:"style-name"},
{ens:t,en:"index-title",ans:t,a:"style-name"},{ens:t,en:"object-index",ans:t,a:"style-name"},{ens:t,en:"section",ans:t,a:"style-name"},{ens:t,en:"table-of-content",ans:t,a:"style-name"},{ens:t,en:"table-index",ans:t,a:"style-name"},{ens:t,en:"user-index",ans:t,a:"style-name"}],ruby:[{ens:t,en:"ruby",ans:t,a:"style-name"}],table:[{ens:a,en:"query",ans:a,a:"style-name"},{ens:a,en:"table-representation",ans:a,a:"style-name"},{ens:w,en:"background",ans:w,a:"style-name"},{ens:w,en:"table",ans:w,a:"style-name"}],
"table-column":[{ens:a,en:"column",ans:a,a:"style-name"},{ens:w,en:"table-column",ans:w,a:"style-name"}],"table-row":[{ens:a,en:"query",ans:a,a:"default-row-style-name"},{ens:a,en:"table-representation",ans:a,a:"default-row-style-name"},{ens:w,en:"table-row",ans:w,a:"style-name"}],"table-cell":[{ens:a,en:"column",ans:a,a:"default-cell-style-name"},{ens:w,en:"table-column",ans:w,a:"default-cell-style-name"},{ens:w,en:"table-row",ans:w,a:"default-cell-style-name"},{ens:w,en:"body",ans:w,a:"style-name"},
{ens:w,en:"covered-table-cell",ans:w,a:"style-name"},{ens:w,en:"even-columns",ans:w,a:"style-name"},{ens:w,en:"covered-table-cell",ans:w,a:"style-name"},{ens:w,en:"even-columns",ans:w,a:"style-name"},{ens:w,en:"even-rows",ans:w,a:"style-name"},{ens:w,en:"first-column",ans:w,a:"style-name"},{ens:w,en:"first-row",ans:w,a:"style-name"},{ens:w,en:"last-column",ans:w,a:"style-name"},{ens:w,en:"last-row",ans:w,a:"style-name"},{ens:w,en:"odd-columns",ans:w,a:"style-name"},{ens:w,en:"odd-rows",ans:w,a:"style-name"},
{ens:w,en:"table-cell",ans:w,a:"style-name"}],graphic:[{ens:n,en:"cube",ans:k,a:"style-name"},{ens:n,en:"extrude",ans:k,a:"style-name"},{ens:n,en:"rotate",ans:k,a:"style-name"},{ens:n,en:"scene",ans:k,a:"style-name"},{ens:n,en:"sphere",ans:k,a:"style-name"},{ens:k,en:"caption",ans:k,a:"style-name"},{ens:k,en:"circle",ans:k,a:"style-name"},{ens:k,en:"connector",ans:k,a:"style-name"},{ens:k,en:"control",ans:k,a:"style-name"},{ens:k,en:"custom-shape",ans:k,a:"style-name"},{ens:k,en:"ellipse",ans:k,a:"style-name"},
{ens:k,en:"frame",ans:k,a:"style-name"},{ens:k,en:"g",ans:k,a:"style-name"},{ens:k,en:"line",ans:k,a:"style-name"},{ens:k,en:"measure",ans:k,a:"style-name"},{ens:k,en:"page-thumbnail",ans:k,a:"style-name"},{ens:k,en:"path",ans:k,a:"style-name"},{ens:k,en:"polygon",ans:k,a:"style-name"},{ens:k,en:"polyline",ans:k,a:"style-name"},{ens:k,en:"rect",ans:k,a:"style-name"},{ens:k,en:"regular-polygon",ans:k,a:"style-name"},{ens:u,en:"annotation",ans:k,a:"style-name"}],presentation:[{ens:n,en:"cube",ans:z,
a:"style-name"},{ens:n,en:"extrude",ans:z,a:"style-name"},{ens:n,en:"rotate",ans:z,a:"style-name"},{ens:n,en:"scene",ans:z,a:"style-name"},{ens:n,en:"sphere",ans:z,a:"style-name"},{ens:k,en:"caption",ans:z,a:"style-name"},{ens:k,en:"circle",ans:z,a:"style-name"},{ens:k,en:"connector",ans:z,a:"style-name"},{ens:k,en:"control",ans:z,a:"style-name"},{ens:k,en:"custom-shape",ans:z,a:"style-name"},{ens:k,en:"ellipse",ans:z,a:"style-name"},{ens:k,en:"frame",ans:z,a:"style-name"},{ens:k,en:"g",ans:z,a:"style-name"},
{ens:k,en:"line",ans:z,a:"style-name"},{ens:k,en:"measure",ans:z,a:"style-name"},{ens:k,en:"page-thumbnail",ans:z,a:"style-name"},{ens:k,en:"path",ans:z,a:"style-name"},{ens:k,en:"polygon",ans:z,a:"style-name"},{ens:k,en:"polyline",ans:z,a:"style-name"},{ens:k,en:"rect",ans:z,a:"style-name"},{ens:k,en:"regular-polygon",ans:z,a:"style-name"},{ens:u,en:"annotation",ans:z,a:"style-name"}],"drawing-page":[{ens:k,en:"page",ans:k,a:"style-name"},{ens:z,en:"notes",ans:k,a:"style-name"},{ens:x,en:"handout-master",
ans:k,a:"style-name"},{ens:x,en:"master-page",ans:k,a:"style-name"}],"list-style":[{ens:t,en:"list",ans:t,a:"style-name"},{ens:t,en:"numbered-paragraph",ans:t,a:"style-name"},{ens:t,en:"list-item",ans:t,a:"style-override"},{ens:x,en:"style",ans:x,a:"list-style-name"}],data:[{ens:x,en:"style",ans:x,a:"data-style-name"},{ens:x,en:"style",ans:x,a:"percentage-data-style-name"},{ens:z,en:"date-time-decl",ans:x,a:"data-style-name"},{ens:t,en:"creation-date",ans:x,a:"data-style-name"},{ens:t,en:"creation-time",
ans:x,a:"data-style-name"},{ens:t,en:"database-display",ans:x,a:"data-style-name"},{ens:t,en:"date",ans:x,a:"data-style-name"},{ens:t,en:"editing-duration",ans:x,a:"data-style-name"},{ens:t,en:"expression",ans:x,a:"data-style-name"},{ens:t,en:"meta-field",ans:x,a:"data-style-name"},{ens:t,en:"modification-date",ans:x,a:"data-style-name"},{ens:t,en:"modification-time",ans:x,a:"data-style-name"},{ens:t,en:"print-date",ans:x,a:"data-style-name"},{ens:t,en:"print-time",ans:x,a:"data-style-name"},{ens:t,
en:"table-formula",ans:x,a:"data-style-name"},{ens:t,en:"time",ans:x,a:"data-style-name"},{ens:t,en:"user-defined",ans:x,a:"data-style-name"},{ens:t,en:"user-field-get",ans:x,a:"data-style-name"},{ens:t,en:"user-field-input",ans:x,a:"data-style-name"},{ens:t,en:"variable-get",ans:x,a:"data-style-name"},{ens:t,en:"variable-input",ans:x,a:"data-style-name"},{ens:t,en:"variable-set",ans:x,a:"data-style-name"}],"page-layout":[{ens:z,en:"notes",ans:x,a:"page-layout-name"},{ens:x,en:"handout-master",ans:x,
a:"page-layout-name"},{ens:x,en:"master-page",ans:x,a:"page-layout-name"}]},G,L=xmldom.XPath;this.collectUsedFontFaces=m;this.changeFontFaceNames=r;this.UsedStyleList=function(a,d){var b={};this.uses=function(a){var d=a.localName,c=a.getAttributeNS(k,"name")||a.getAttributeNS(x,"name");a="style"===d?a.getAttributeNS(x,"family"):a.namespaceURI===y?"data":d;return(a=b[a])?0<a[c]:!1};c(a,b);d&&p(d,b)};this.getStyleName=function(a,d){var b,c,e=G[d.localName];if(e&&(e=e[d.namespaceURI]))for(c=0;c<e.length;c+=
1)if(e[c].keyname===a&&(e=e[c],d.hasAttributeNS(e.ns,e.localname))){b=d.getAttributeNS(e.ns,e.localname);break}return b};this.hasDerivedStyles=function(a,d,b){var c=b.getAttributeNS(x,"name");b=b.getAttributeNS(x,"family");return L.getODFElementsWithXPath(a,"//style:*[@style:parent-style-name='"+c+"'][@style:family='"+b+"']",d).length?!0:!1};this.prefixStyleNames=function(a,d,b){var c;if(a){for(c=a.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE){var e=c,h=d,g=e.getAttributeNS(k,"name"),l=void 0;
g?l=k:(g=e.getAttributeNS(x,"name"))&&(l=x);l&&e.setAttributeNS(l,D[l]+"name",h+g)}c=c.nextSibling}f(a,d);b&&f(b,d)}};this.removePrefixFromStyleNames=function(a,d,b){var c=RegExp("^"+d);if(a){for(d=a.firstChild;d;){if(d.nodeType===Node.ELEMENT_NODE){var e=d,f=c,h=e.getAttributeNS(k,"name"),l=void 0;h?l=k:(h=e.getAttributeNS(x,"name"))&&(l=x);l&&(h=h.replace(f,""),e.setAttributeNS(l,D[l]+"name",h))}d=d.nextSibling}g(a,c);b&&g(b,c)}};this.determineStylesForNode=b;G=function(){var a,d,b,c,e,k={},f,h,
g,l;for(b in B)if(B.hasOwnProperty(b))for(c=B[b],d=c.length,a=0;a<d;a+=1)e=c[a],g=e.en,l=e.ens,k.hasOwnProperty(g)?f=k[g]:k[g]=f={},f.hasOwnProperty(l)?h=f[l]:f[l]=h=[],h.push({ns:e.ans,localname:e.a,keyname:b});return k}()};
// Input 27
"function"!==typeof Object.create&&(Object.create=function(f){var g=function(){};g.prototype=f;return new g});
xmldom.LSSerializer=function(){function f(b){var c=b||{},f=function(b){var d={},a;for(a in b)b.hasOwnProperty(a)&&(d[b[a]]=a);return d}(b),g=[c],p=[f],m=0;this.push=function(){m+=1;c=g[m]=Object.create(c);f=p[m]=Object.create(f)};this.pop=function(){g.pop();p.pop();m-=1;c=g[m];f=p[m]};this.getLocalNamespaceDefinitions=function(){return f};this.getQName=function(b){var d=b.namespaceURI,a=0,e;if(!d)return b.localName;if(e=f[d])return e+":"+b.localName;do{e||!b.prefix?(e="ns"+a,a+=1):e=b.prefix;if(c[e]===
d)break;if(!c[e]){c[e]=d;f[d]=e;break}e=null}while(null===e);return e+":"+b.localName}}function g(b){return b.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&apos;").replace(/"/g,"&quot;")}function b(e,f){var h="",q=c.filter?c.filter.acceptNode(f):NodeFilter.FILTER_ACCEPT,p;if(q===NodeFilter.FILTER_ACCEPT&&f.nodeType===Node.ELEMENT_NODE){e.push();p=e.getQName(f);var m,r=f.attributes,d,a,n,k="",s;m="<"+p;d=r.length;for(a=0;a<d;a+=1)n=r.item(a),"http://www.w3.org/2000/xmlns/"!==
n.namespaceURI&&(s=c.filter?c.filter.acceptNode(n):NodeFilter.FILTER_ACCEPT,s===NodeFilter.FILTER_ACCEPT&&(s=e.getQName(n),n="string"===typeof n.value?g(n.value):n.value,k+=" "+(s+'="'+n+'"')));d=e.getLocalNamespaceDefinitions();for(a in d)d.hasOwnProperty(a)&&((r=d[a])?"xmlns"!==r&&(m+=" xmlns:"+d[a]+'="'+a+'"'):m+=' xmlns="'+a+'"');h+=m+(k+">")}if(q===NodeFilter.FILTER_ACCEPT||q===NodeFilter.FILTER_SKIP){for(q=f.firstChild;q;)h+=b(e,q),q=q.nextSibling;f.nodeValue&&(h+=g(f.nodeValue))}p&&(h+="</"+
p+">",e.pop());return h}var c=this;this.filter=null;this.writeToString=function(c,g){if(!c)return"";var h=new f(g);return b(h,c)}};
// Input 28
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function f(b){var d,a=q.length;for(d=0;d<a;d+=1)if("urn:oasis:names:tc:opendocument:xmlns:office:1.0"===b.namespaceURI&&b.localName===q[d])return d;return-1}function g(b,d){var a=new e.UsedStyleList(b,d),c=new odf.OdfNodeFilter;this.acceptNode=function(b){var e=c.acceptNode(b);e===NodeFilter.FILTER_ACCEPT&&b.parentNode===d&&b.nodeType===Node.ELEMENT_NODE&&(e=a.uses(b)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT);return e}}function b(b,d){var a=new g(b,d);this.acceptNode=function(d){var b=
a.acceptNode(d);b!==NodeFilter.FILTER_ACCEPT||!d.parentNode||d.parentNode.namespaceURI!==odf.Namespaces.textns||"s"!==d.parentNode.localName&&"tab"!==d.parentNode.localName||(b=NodeFilter.FILTER_REJECT);return b}}function c(b,d){if(d){var a=f(d),c,e=b.firstChild;if(-1!==a){for(;e;){c=f(e);if(-1!==c&&c>a)break;e=e.nextSibling}b.insertBefore(d,e)}}}var e=new odf.StyleInfo,l=new core.DomUtils,h=odf.Namespaces.stylens,q="meta settings scripts font-face-decls styles automatic-styles master-styles body".split(" "),
p=Date.now()+"_webodf_",m=new core.Base64;odf.ODFElement=function(){};odf.ODFDocumentElement=function(){};odf.ODFDocumentElement.prototype=new odf.ODFElement;odf.ODFDocumentElement.prototype.constructor=odf.ODFDocumentElement;odf.ODFDocumentElement.prototype.fontFaceDecls=null;odf.ODFDocumentElement.prototype.manifest=null;odf.ODFDocumentElement.prototype.settings=null;odf.ODFDocumentElement.namespaceURI="urn:oasis:names:tc:opendocument:xmlns:office:1.0";odf.ODFDocumentElement.localName="document";
odf.AnnotationElement=function(){};odf.OdfPart=function(b,d,a,c){var e=this;this.size=0;this.type=null;this.name=b;this.container=a;this.url=null;this.mimetype=d;this.onstatereadychange=this.document=null;this.EMPTY=0;this.LOADING=1;this.DONE=2;this.state=this.EMPTY;this.data="";this.load=function(){null!==c&&(this.mimetype=d,c.loadAsDataURL(b,d,function(a,d){a&&runtime.log(a);e.url=d;if(e.onchange)e.onchange(e);if(e.onstatereadychange)e.onstatereadychange(e)}))}};odf.OdfPart.prototype.load=function(){};
odf.OdfPart.prototype.getUrl=function(){return this.data?"data:;base64,"+m.toBase64(this.data):null};odf.OdfContainer=function d(a,f){function k(a){for(var d=a.firstChild,b;d;)b=d.nextSibling,d.nodeType===Node.ELEMENT_NODE?k(d):d.nodeType===Node.PROCESSING_INSTRUCTION_NODE&&a.removeChild(d),d=b}function s(a){var d={},b,c,e=a.ownerDocument.createNodeIterator(a,NodeFilter.SHOW_ELEMENT,null,!1);for(a=e.nextNode();a;)"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&("annotation"===
a.localName?(b=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","name"))&&(d.hasOwnProperty(b)?runtime.log("Warning: annotation name used more than once with <office:annotation/>: '"+b+"'"):d[b]=a):"annotation-end"===a.localName&&((b=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","name"))?d.hasOwnProperty(b)?(c=d[b],c.annotationEndElement?runtime.log("Warning: annotation name used more than once with <office:annotation-end/>: '"+b+"'"):c.annotationEndElement=
a):runtime.log("Warning: annotation end without an annotation start, name: '"+b+"'"):runtime.log("Warning: annotation end without a name found"))),a=e.nextNode()}function q(a,d){for(var b=a&&a.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&b.setAttributeNS("urn:webodf:names:scope","scope",d),b=b.nextSibling}function u(a,d){for(var b=H.rootElement.meta,b=b&&b.firstChild;b&&(b.namespaceURI!==a||b.localName!==d);)b=b.nextSibling;for(b=b&&b.firstChild;b&&b.nodeType!==Node.TEXT_NODE;)b=b.nextSibling;return b?
b.data:null}function z(a){var b={},d;for(a=a.firstChild;a;)a.nodeType===Node.ELEMENT_NODE&&a.namespaceURI===h&&"font-face"===a.localName&&(d=a.getAttributeNS(h,"name"),b[d]=a),a=a.nextSibling;return b}function x(a,b){var d=null,c,e,k;if(a)for(d=a.cloneNode(!0),c=d.firstElementChild;c;)e=c.nextElementSibling,(k=c.getAttributeNS("urn:webodf:names:scope","scope"))&&k!==b&&d.removeChild(c),c=e;return d}function w(a,d){var b,c,k,f=null,g={};if(a)for(d.forEach(function(a){e.collectUsedFontFaces(g,a)}),
f=a.cloneNode(!0),b=f.firstElementChild;b;)c=b.nextElementSibling,k=b.getAttributeNS(h,"name"),g[k]||f.removeChild(b),b=c;return f}function t(a){var b=H.rootElement.ownerDocument,d;if(a){k(a.documentElement);try{d=b.importNode(a.documentElement,!0)}catch(c){}}return d}function D(a){H.state=a;if(H.onchange)H.onchange(H);if(H.onstatereadychange)H.onstatereadychange(H)}function B(a){R=null;H.rootElement=a;a.fontFaceDecls=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls");
a.styles=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles");a.automaticStyles=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles");a.masterStyles=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles");a.body=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","body");a.meta=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta");a.settings=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"settings");a.scripts=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","scripts");s(a)}function G(a){var b=t(a),k=H.rootElement,f;b&&"document-styles"===b.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===b.namespaceURI?(k.fontFaceDecls=l.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls"),c(k,k.fontFaceDecls),f=l.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles"),k.styles=f||a.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"styles"),c(k,k.styles),f=l.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles"),k.automaticStyles=f||a.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles"),q(k.automaticStyles,"document-styles"),c(k,k.automaticStyles),b=l.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles"),k.masterStyles=b||a.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles"),c(k,k.masterStyles),
e.prefixStyleNames(k.automaticStyles,p,k.masterStyles)):D(d.INVALID)}function L(a){a=t(a);var b,k,f,g;if(a&&"document-content"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI){b=H.rootElement;f=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls");if(b.fontFaceDecls&&f){g=b.fontFaceDecls;var n,m,s,L,ca={};k=z(g);L=z(f);for(f=f.firstElementChild;f;){n=f.nextElementSibling;if(f.namespaceURI===h&&"font-face"===f.localName)if(m=f.getAttributeNS(h,
"name"),k.hasOwnProperty(m)){if(!f.isEqualNode(k[m])){s=m;for(var p=k,G=L,B=0,C=void 0,C=s=s.replace(/\d+$/,"");p.hasOwnProperty(C)||G.hasOwnProperty(C);)B+=1,C=s+B;s=C;f.setAttributeNS(h,"style:name",s);g.appendChild(f);k[s]=f;delete L[m];ca[m]=s}}else g.appendChild(f),k[m]=f,delete L[m];f=n}g=ca}else f&&(b.fontFaceDecls=f,c(b,f));k=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles");q(k,"document-content");g&&e.changeFontFaceNames(k,g);if(b.automaticStyles&&
k)for(g=k.firstChild;g;)b.automaticStyles.appendChild(g),g=k.firstChild;else k&&(b.automaticStyles=k,c(b,k));a=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","body");if(null===a)throw"<office:body/> tag is mising.";b.body=a;c(b,b.body)}else D(d.INVALID)}function C(a){a=t(a);var b;a&&"document-meta"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&(b=H.rootElement,b.meta=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"meta"),c(b,b.meta))}function S(a){a=t(a);var b;a&&"document-settings"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&(b=H.rootElement,b.settings=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","settings"),c(b,b.settings))}function P(a){a=t(a);var b;if(a&&"manifest"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"===a.namespaceURI)for(b=H.rootElement,b.manifest=a,a=b.manifest.firstElementChild;a;)"file-entry"===a.localName&&
"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"===a.namespaceURI&&(T[a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","full-path")]=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","media-type")),a=a.nextElementSibling}function W(a){var b=a.shift();b?E.loadAsDOM(b.path,function(c,e){b.handler(e);H.state===d.INVALID?c?runtime.log("ERROR: Unable to load "+b.path+" - "+c):runtime.log("ERROR: Unable to load "+b.path):(c&&runtime.log("DEBUG: Unable to load "+
b.path+" - "+c),W(a))}):(s(H.rootElement),D(d.DONE))}function I(a){var b="";odf.Namespaces.forEachPrefix(function(a,d){b+=" xmlns:"+a+'="'+d+'"'});return'<?xml version="1.0" encoding="UTF-8"?><office:'+a+" "+b+' office:version="1.2">'}function da(){var a=new xmldom.LSSerializer,b=I("document-meta");a.filter=new odf.OdfNodeFilter;b+=a.writeToString(H.rootElement.meta,odf.Namespaces.namespaceMap);return b+"</office:document-meta>"}function O(a,b){var d=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
"manifest:file-entry");d.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:full-path",a);d.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:media-type",b);return d}function J(){var a=runtime.parseXML('<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"></manifest:manifest>'),b=a.documentElement,d=new xmldom.LSSerializer,c;for(c in T)T.hasOwnProperty(c)&&b.appendChild(O(c,T[c]));d.filter=
new odf.OdfNodeFilter;return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+d.writeToString(a,odf.Namespaces.namespaceMap)}function U(){var a,b,d,c=odf.Namespaces.namespaceMap,k=new xmldom.LSSerializer,f=I("document-styles");b=x(H.rootElement.automaticStyles,"document-styles");d=H.rootElement.masterStyles.cloneNode(!0);a=w(H.rootElement.fontFaceDecls,[d,H.rootElement.styles,b]);e.removePrefixFromStyleNames(b,p,d);k.filter=new g(d,b);f+=k.writeToString(a,c);f+=k.writeToString(H.rootElement.styles,
c);f+=k.writeToString(b,c);f+=k.writeToString(d,c);return f+"</office:document-styles>"}function ca(){var a,d,c=odf.Namespaces.namespaceMap,e=new xmldom.LSSerializer,k=I("document-content");d=x(H.rootElement.automaticStyles,"document-content");a=w(H.rootElement.fontFaceDecls,[d]);e.filter=new b(H.rootElement.body,d);k+=e.writeToString(a,c);k+=e.writeToString(d,c);k+=e.writeToString(H.rootElement.body,c);return k+"</office:document-content>"}function ba(a,b){runtime.loadXML(a,function(a,c){if(a)b(a);
else{var e=t(c);e&&"document"===e.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===e.namespaceURI?(B(e),D(d.DONE)):D(d.INVALID)}})}function Y(a,b){var d;d=H.rootElement;var e=d.meta;e||(d.meta=e=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta"),c(d,e));d=e;a&&l.mapKeyValObjOntoNode(d,a,odf.Namespaces.lookupNamespaceURI);b&&l.removeKeyElementsFromNode(d,b,odf.Namespaces.lookupNamespaceURI)}function v(a){function b(a,d){var c;d||(d=a);c=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",
d);k[a]=c;k.appendChild(c)}var c=new core.Zip("",null),e=runtime.byteArrayFromString("application/vnd.oasis.opendocument."+a,"utf8"),k=H.rootElement,f=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",a);c.save("mimetype",e,!1,new Date);b("meta");b("settings");b("scripts");b("fontFaceDecls","font-face-decls");b("styles");b("automaticStyles","automatic-styles");b("masterStyles","master-styles");b("body");k.body.appendChild(f);T["/"]="application/vnd.oasis.opendocument."+a;
T["settings.xml"]="text/xml";T["meta.xml"]="text/xml";T["styles.xml"]="text/xml";T["content.xml"]="text/xml";D(d.DONE);return c}function K(){var a,b=new Date,d="";H.rootElement.settings&&H.rootElement.settings.firstElementChild&&(a=new xmldom.LSSerializer,d=I("document-settings"),a.filter=new odf.OdfNodeFilter,d+=a.writeToString(H.rootElement.settings,odf.Namespaces.namespaceMap),d+="</office:document-settings>");(a=d)?(a=runtime.byteArrayFromString(a,"utf8"),E.save("settings.xml",a,!0,b)):E.remove("settings.xml");
d=runtime.getWindow();a="WebODF/"+webodf.Version;d&&(a=a+" "+d.navigator.userAgent);Y({"meta:generator":a},null);a=runtime.byteArrayFromString(da(),"utf8");E.save("meta.xml",a,!0,b);a=runtime.byteArrayFromString(U(),"utf8");E.save("styles.xml",a,!0,b);a=runtime.byteArrayFromString(ca(),"utf8");E.save("content.xml",a,!0,b);a=runtime.byteArrayFromString(J(),"utf8");E.save("META-INF/manifest.xml",a,!0,b)}function N(a,b){K();E.writeAs(a,function(a){b(a)})}var H=this,E,T={},R,V="";this.onstatereadychange=
f;this.state=this.onchange=null;this.getMetadata=u;this.setRootElement=B;this.getContentElement=function(){var a;R||(a=H.rootElement.body,R=l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","text")||l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","presentation")||l.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","spreadsheet"));if(!R)throw"Could not find content element in <office:body/>.";return R};this.getDocumentType=function(){var a=
H.getContentElement();return a&&a.localName};this.getPart=function(a){return new odf.OdfPart(a,T[a],H,E)};this.getPartData=function(a,b){E.load(a,b)};this.setMetadata=Y;this.incrementEditingCycles=function(){var a=u(odf.Namespaces.metans,"editing-cycles"),a=a?parseInt(a,10):0;isNaN(a)&&(a=0);Y({"meta:editing-cycles":a+1},null);return a+1};this.createByteArray=function(a,b){K();E.createByteArray(a,b)};this.saveAs=N;this.save=function(a){N(V,a)};this.getUrl=function(){return V};this.setBlob=function(a,
b,d){d=m.convertBase64ToByteArray(d);E.save(a,d,!1,new Date);T.hasOwnProperty(a)&&runtime.log(a+" has been overwritten.");T[a]=b};this.removeBlob=function(a){var b=E.remove(a);runtime.assert(b,"file is not found: "+a);delete T[a]};this.state=d.LOADING;this.rootElement=function(a){var b=document.createElementNS(a.namespaceURI,a.localName),d;a=new a.Type;for(d in a)a.hasOwnProperty(d)&&(b[d]=a[d]);return b}({Type:odf.ODFDocumentElement,namespaceURI:odf.ODFDocumentElement.namespaceURI,localName:odf.ODFDocumentElement.localName});
a===odf.OdfContainer.DocumentType.TEXT?E=v("text"):a===odf.OdfContainer.DocumentType.PRESENTATION?E=v("presentation"):a===odf.OdfContainer.DocumentType.SPREADSHEET?E=v("spreadsheet"):(V=a,E=new core.Zip(V,function(a,b){E=b;a?ba(V,function(b){a&&(E.error=a+"\n"+b,D(d.INVALID))}):W([{path:"styles.xml",handler:G},{path:"content.xml",handler:L},{path:"meta.xml",handler:C},{path:"settings.xml",handler:S},{path:"META-INF/manifest.xml",handler:P}])}))};odf.OdfContainer.EMPTY=0;odf.OdfContainer.LOADING=1;
odf.OdfContainer.DONE=2;odf.OdfContainer.INVALID=3;odf.OdfContainer.SAVING=4;odf.OdfContainer.MODIFIED=5;odf.OdfContainer.getContainer=function(b){return new odf.OdfContainer(b,null)}})();odf.OdfContainer.DocumentType={TEXT:1,PRESENTATION:2,SPREADSHEET:3};
// Input 29
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.OdfUtils=function(){function f(a){return"image"===(a&&a.localName)&&a.namespaceURI===I}function g(a){return null!==a&&a.nodeType===Node.ELEMENT_NODE&&"frame"===a.localName&&a.namespaceURI===I&&"as-char"===a.getAttributeNS(W,"anchor-type")}function b(a){var b;(b="annotation"===(a&&a.localName)&&a.namespaceURI===odf.Namespaces.officens)||(b="div"===(a&&a.localName)&&"annotationWrapper"===a.className);return b}function c(a){return"a"===(a&&a.localName)&&a.namespaceURI===W}function e(a){var b=a&&
a.localName;return("p"===b||"h"===b)&&a.namespaceURI===W}function l(a){for(;a&&!e(a);)a=a.parentNode;return a}function h(a){return/^[ \t\r\n]+$/.test(a)}function q(a){if(null===a||a.nodeType!==Node.ELEMENT_NODE)return!1;var b=a.localName;return/^(span|p|h|a|meta)$/.test(b)&&a.namespaceURI===W||"span"===b&&"webodf-annotationHighlight"===a.className}function p(a){var b=a&&a.localName,d=!1;b&&(a=a.namespaceURI,a===W&&(d="s"===b||"tab"===b||"line-break"===b));return d}function m(a){return p(a)||g(a)||
b(a)}function r(a){var b=a&&a.localName,d=!1;b&&(a=a.namespaceURI,a===W&&(d="s"===b));return d}function d(a){return-1!==U.indexOf(a.namespaceURI)}function a(b){if(p(b))return!1;if(d(b.parentNode)&&b.nodeType===Node.TEXT_NODE)return 0===b.textContent.length;for(b=b.firstChild;b;){if(d(b)||!a(b))return!1;b=b.nextSibling}return!0}function n(a){for(;null!==a.firstChild&&q(a);)a=a.firstChild;return a}function k(a){for(;null!==a.lastChild&&q(a);)a=a.lastChild;return a}function s(a){for(;!e(a)&&null===a.previousSibling;)a=
a.parentNode;return e(a)?null:k(a.previousSibling)}function y(a){for(;!e(a)&&null===a.nextSibling;)a=a.parentNode;return e(a)?null:n(a.nextSibling)}function u(a){for(var b=!1;a;)if(a.nodeType===Node.TEXT_NODE)if(0===a.length)a=s(a);else return!h(a.data.substr(a.length-1,1));else m(a)?(b=!1===r(a),a=null):a=s(a);return b}function z(a){var b=!1,d;for(a=a&&n(a);a;){d=a.nodeType===Node.TEXT_NODE?a.length:0;if(0<d&&!h(a.data)){b=!0;break}if(m(a)){b=!0;break}a=y(a)}return b}function x(a,b){return h(a.data.substr(b))?
!z(y(a)):!1}function w(a,b){var d=a.data,c;if(!h(d[b])||m(a.parentNode))return!1;0<b?h(d[b-1])||(c=!0):u(s(a))&&(c=!0);return!0===c?x(a,b)?!1:!0:!1}function t(a){return(a=/(-?[0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc)|(px)|(%))/.exec(a))?{value:parseFloat(a[1]),unit:a[3]}:null}function D(a){return(a=t(a))&&(0>a.value||"%"===a.unit)?null:a}function B(a){return(a=t(a))&&"%"!==a.unit?null:a}function G(a){switch(a.namespaceURI){case odf.Namespaces.drawns:case odf.Namespaces.svgns:case odf.Namespaces.dr3dns:return!1;
case odf.Namespaces.textns:switch(a.localName){case "note-body":case "ruby-text":return!1}break;case odf.Namespaces.officens:switch(a.localName){case "annotation":case "binary-data":case "event-listeners":return!1}break;default:switch(a.localName){case "cursor":case "editinfo":return!1}}return!0}function L(a,b){for(;0<b.length&&!J.rangeContainsNode(a,b[0]);)b.shift();for(;0<b.length&&!J.rangeContainsNode(a,b[b.length-1]);)b.pop()}function C(a,d,c){var e;e=J.getNodesInRange(a,function(a){var d=NodeFilter.FILTER_REJECT;
if(p(a.parentNode)||b(a))d=NodeFilter.FILTER_REJECT;else if(a.nodeType===Node.TEXT_NODE){if(c||Boolean(l(a)&&(!h(a.textContent)||w(a,0))))d=NodeFilter.FILTER_ACCEPT}else if(m(a))d=NodeFilter.FILTER_ACCEPT;else if(G(a)||q(a))d=NodeFilter.FILTER_SKIP;return d},NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);d||L(a,e);return e}function S(a,d,c){for(;a;){if(c(a)){d[0]!==a&&d.unshift(a);break}if(b(a))break;a=a.parentNode}}function P(a,b){var d=a;if(b<d.childNodes.length-1)d=d.childNodes[b+1];else{for(;!d.nextSibling;)d=
d.parentNode;d=d.nextSibling}for(;d.firstChild;)d=d.firstChild;return d}var W=odf.Namespaces.textns,I=odf.Namespaces.drawns,da=odf.Namespaces.xlinkns,O=/^\s*$/,J=new core.DomUtils,U=[odf.Namespaces.dbns,odf.Namespaces.dcns,odf.Namespaces.dr3dns,odf.Namespaces.drawns,odf.Namespaces.chartns,odf.Namespaces.formns,odf.Namespaces.numberns,odf.Namespaces.officens,odf.Namespaces.presentationns,odf.Namespaces.stylens,odf.Namespaces.svgns,odf.Namespaces.tablens,odf.Namespaces.textns];this.isImage=f;this.isCharacterFrame=
g;this.isInlineRoot=b;this.isTextSpan=function(a){return"span"===(a&&a.localName)&&a.namespaceURI===W};this.isHyperlink=c;this.getHyperlinkTarget=function(a){return a.getAttributeNS(da,"href")||""};this.isParagraph=e;this.getParagraphElement=l;this.isWithinTrackedChanges=function(a,b){for(;a&&a!==b;){if(a.namespaceURI===W&&"tracked-changes"===a.localName)return!0;a=a.parentNode}return!1};this.isListItem=function(a){return"list-item"===(a&&a.localName)&&a.namespaceURI===W};this.isLineBreak=function(a){return"line-break"===
(a&&a.localName)&&a.namespaceURI===W};this.isODFWhitespace=h;this.isGroupingElement=q;this.isCharacterElement=p;this.isAnchoredAsCharacterElement=m;this.isSpaceElement=r;this.isODFNode=d;this.hasNoODFContent=a;this.firstChild=n;this.lastChild=k;this.previousNode=s;this.nextNode=y;this.scanLeftForNonSpace=u;this.lookLeftForCharacter=function(a){var b,d=b=0;a.nodeType===Node.TEXT_NODE&&(d=a.length);0<d?(b=a.data,b=h(b.substr(d-1,1))?1===d?u(s(a))?2:0:h(b.substr(d-2,1))?0:2:1):m(a)&&(b=1);return b};
this.lookRightForCharacter=function(a){var b=!1,d=0;a&&a.nodeType===Node.TEXT_NODE&&(d=a.length);0<d?b=!h(a.data.substr(0,1)):m(a)&&(b=!0);return b};this.scanLeftForAnyCharacter=function(a){var b=!1,d;for(a=a&&k(a);a;){d=a.nodeType===Node.TEXT_NODE?a.length:0;if(0<d&&!h(a.data)){b=!0;break}if(m(a)){b=!0;break}a=s(a)}return b};this.scanRightForAnyCharacter=z;this.isTrailingWhitespace=x;this.isSignificantWhitespace=w;this.isDowngradableSpaceElement=function(a){return r(a)?u(s(a))&&z(y(a)):!1};this.getFirstNonWhitespaceChild=
function(a){for(a=a&&a.firstChild;a&&a.nodeType===Node.TEXT_NODE&&O.test(a.nodeValue);)a=a.nextSibling;return a};this.parseLength=t;this.parseNonNegativeLength=D;this.parseFoFontSize=function(a){var b;b=(b=t(a))&&(0>=b.value||"%"===b.unit)?null:b;return b||B(a)};this.parseFoLineHeight=function(a){return D(a)||B(a)};this.isTextContentContainingNode=G;this.getTextNodes=function(a,b){var d;d=J.getNodesInRange(a,function(a){var b=NodeFilter.FILTER_REJECT;a.nodeType===Node.TEXT_NODE?Boolean(l(a)&&(!h(a.textContent)||
w(a,0)))&&(b=NodeFilter.FILTER_ACCEPT):G(a)&&(b=NodeFilter.FILTER_SKIP);return b},NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);b||L(a,d);return d};this.getTextElements=C;this.getParagraphElements=function(a){var b;b=J.getNodesInRange(a,function(a){var b=NodeFilter.FILTER_REJECT;if(e(a))b=NodeFilter.FILTER_ACCEPT;else if(G(a)||q(a))b=NodeFilter.FILTER_SKIP;return b},NodeFilter.SHOW_ELEMENT);S(a.startContainer,b,e);return b};this.getImageElements=function(a){var b;b=J.getNodesInRange(a,function(a){var b=
NodeFilter.FILTER_SKIP;f(a)&&(b=NodeFilter.FILTER_ACCEPT);return b},NodeFilter.SHOW_ELEMENT);S(a.startContainer,b,f);return b};this.getHyperlinkElements=function(a){var b=[],d=a.cloneRange();a.collapsed&&a.endContainer.nodeType===Node.ELEMENT_NODE&&(a=P(a.endContainer,a.endOffset),a.nodeType===Node.TEXT_NODE&&d.setEnd(a,1));C(d,!0,!1).forEach(function(a){for(a=a.parentNode;!e(a);){if(c(a)&&-1===b.indexOf(a)){b.push(a);break}a=a.parentNode}});d.detach();return b};this.getNormalizedFontFamilyName=function(a){/^(["'])(?:.|[\n\r])*?\1$/.test(a)||
(a=a.replace(/^[ \t\r\n\f]*((?:.|[\n\r])*?)[ \t\r\n\f]*$/,"$1"),/[ \t\r\n\f]/.test(a)&&(a="'"+a.replace(/[ \t\r\n\f]+/g," ")+"'"));return a}};
// Input 30
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.AnnotatableCanvas=function(){};gui.AnnotatableCanvas.prototype.refreshSize=function(){};gui.AnnotatableCanvas.prototype.getZoomLevel=function(){};gui.AnnotatableCanvas.prototype.getSizer=function(){};
gui.AnnotationViewManager=function(f,g,b,c){function e(a){var b=a.annotationEndElement,d=m.createRange(),c=a.getAttributeNS(odf.Namespaces.officens,"name");b&&(d.setStart(a,a.childNodes.length),d.setEnd(b,0),a=r.getTextNodes(d,!1),a.forEach(function(a){var b=m.createElement("span");b.className="webodf-annotationHighlight";b.setAttribute("annotation",c);a.parentNode.insertBefore(b,a);b.appendChild(a)}));d.detach()}function l(a){var c=f.getSizer();a?(b.style.display="inline-block",c.style.paddingRight=
d.getComputedStyle(b).width):(b.style.display="none",c.style.paddingRight=0);f.refreshSize()}function h(){p.sort(function(a,b){return 0!==(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)?-1:1})}function q(){var a;for(a=0;a<p.length;a+=1){var d=p[a],c=d.parentNode,e=c.nextElementSibling,h=e.nextElementSibling,g=c.parentNode,l=0,l=p[p.indexOf(d)-1],r=void 0,d=f.getZoomLevel();c.style.left=(b.getBoundingClientRect().left-g.getBoundingClientRect().left)/d+"px";c.style.width=b.getBoundingClientRect().width/
d+"px";e.style.width=parseFloat(c.style.left)-30+"px";l&&(r=l.parentNode.getBoundingClientRect(),20>=(g.getBoundingClientRect().top-r.bottom)/d?c.style.top=Math.abs(g.getBoundingClientRect().top-r.bottom)/d+20+"px":c.style.top="0px");h.style.left=e.getBoundingClientRect().width/d+"px";var e=h.style,g=h.getBoundingClientRect().left/d,l=h.getBoundingClientRect().top/d,r=c.getBoundingClientRect().left/d,m=c.getBoundingClientRect().top/d,q=0,D=0,q=r-g,q=q*q,D=m-l,D=D*D,g=Math.sqrt(q+D);e.width=g+"px";
l=Math.asin((c.getBoundingClientRect().top-h.getBoundingClientRect().top)/(d*parseFloat(h.style.width)));h.style.transform="rotate("+l+"rad)";h.style.MozTransform="rotate("+l+"rad)";h.style.WebkitTransform="rotate("+l+"rad)";h.style.msTransform="rotate("+l+"rad)"}}var p=[],m=g.ownerDocument,r=new odf.OdfUtils,d=runtime.getWindow();runtime.assert(Boolean(d),"Expected to be run in an environment which has a global window, like a browser.");this.rerenderAnnotations=q;this.getMinimumHeightForAnnotationPane=
function(){return"none"!==b.style.display&&0<p.length?(p[p.length-1].parentNode.getBoundingClientRect().bottom-b.getBoundingClientRect().top)/f.getZoomLevel()+"px":null};this.addAnnotation=function(a){l(!0);p.push(a);h();var b=m.createElement("div"),d=m.createElement("div"),f=m.createElement("div"),g=m.createElement("div"),r;b.className="annotationWrapper";a.parentNode.insertBefore(b,a);d.className="annotationNote";d.appendChild(a);c&&(r=m.createElement("div"),r.className="annotationRemoveButton",
d.appendChild(r));f.className="annotationConnector horizontal";g.className="annotationConnector angular";b.appendChild(d);b.appendChild(f);b.appendChild(g);a.annotationEndElement&&e(a);q()};this.forgetAnnotations=function(){for(;p.length;){var a=p[0],b=p.indexOf(a),d=a.parentNode.parentNode;"div"===d.localName&&(d.parentNode.insertBefore(a,d),d.parentNode.removeChild(d));for(var a=a.getAttributeNS(odf.Namespaces.officens,"name"),a=m.querySelectorAll('span.webodf-annotationHighlight[annotation="'+
a+'"]'),c=d=void 0,d=0;d<a.length;d+=1){for(c=a.item(d);c.firstChild;)c.parentNode.insertBefore(c.firstChild,c);c.parentNode.removeChild(c)}-1!==b&&p.splice(b,1);0===p.length&&l(!1)}}};
// Input 31
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function f(b,g,h,q,p){var m,r=0,d;for(d in b)if(b.hasOwnProperty(d)){if(r===h){m=d;break}r+=1}m?g.getPartData(b[m].href,function(a,d){if(a)runtime.log(a);else if(d){var k="@font-face { font-family: "+(b[m].family||m)+"; src: url(data:application/x-font-ttf;charset=binary;base64,"+c.convertUTF8ArrayToBase64(d)+') format("truetype"); }';try{q.insertRule(k,q.cssRules.length)}catch(r){runtime.log("Problem inserting rule in CSS: "+runtime.toJson(r)+"\nRule: "+k)}}else runtime.log("missing font data for "+
b[m].href);f(b,g,h+1,q,p)}):p&&p()}var g=xmldom.XPath,b=new odf.OdfUtils,c=new core.Base64;odf.FontLoader=function(){this.loadFonts=function(c,l){for(var h=c.rootElement.fontFaceDecls;l.cssRules.length;)l.deleteRule(l.cssRules.length-1);if(h){var q={},p,m,r,d;if(h)for(h=g.getODFElementsWithXPath(h,"style:font-face[svg:font-face-src]",odf.Namespaces.lookupNamespaceURI),p=0;p<h.length;p+=1)m=h[p],r=m.getAttributeNS(odf.Namespaces.stylens,"name"),d=b.getNormalizedFontFamilyName(m.getAttributeNS(odf.Namespaces.svgns,
"font-family")),m=g.getODFElementsWithXPath(m,"svg:font-face-src/svg:font-face-uri",odf.Namespaces.lookupNamespaceURI),0<m.length&&(m=m[0].getAttributeNS(odf.Namespaces.xlinkns,"href"),q[r]={href:m,family:d});f(q,c,0,l)}}}})();
// Input 32
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.Formatting=function(){function f(a){return(a=D[a])?w.mergeObjects({},a):{}}function g(){for(var a=d.rootElement.fontFaceDecls,b={},c,e,a=a&&a.firstElementChild;a;){if(c=a.getAttributeNS(k,"name"))if((e=a.getAttributeNS(n,"font-family"))||0<a.getElementsByTagNameNS(n,"font-face-uri").length)b[c]=e;a=a.nextElementSibling}return b}function b(a){for(var b=d.rootElement.styles.firstElementChild;b;){if(b.namespaceURI===k&&"default-style"===b.localName&&b.getAttributeNS(k,"family")===a)return b;b=b.nextElementSibling}return null}
function c(a,b,c){var e,f,h;c=c||[d.rootElement.automaticStyles,d.rootElement.styles];for(h=0;h<c.length;h+=1)for(e=c[h],e=e.firstElementChild;e;){f=e.getAttributeNS(k,"name");if(e.namespaceURI===k&&"style"===e.localName&&e.getAttributeNS(k,"family")===b&&f===a||"list-style"===b&&e.namespaceURI===s&&"list-style"===e.localName&&f===a||"data"===b&&e.namespaceURI===y&&f===a)return e;e=e.nextElementSibling}return null}function e(a){for(var b,d,c,e,f={},h=a.firstElementChild;h;){if(h.namespaceURI===k)for(c=
f[h.nodeName]={},d=h.attributes,b=0;b<d.length;b+=1)e=d.item(b),c[e.name]=e.value;h=h.nextElementSibling}d=a.attributes;for(b=0;b<d.length;b+=1)e=d.item(b),f[e.name]=e.value;return f}function l(a,h){for(var g=d.rootElement.styles,l,n={},r=a.getAttributeNS(k,"family"),m=a;m;)l=e(m),n=w.mergeObjects(l,n),m=(l=m.getAttributeNS(k,"parent-style-name"))?c(l,r,[g]):null;if(m=b(r))l=e(m),n=w.mergeObjects(l,n);!1!==h&&(l=f(r),n=w.mergeObjects(l,n));return n}function h(b,d){function c(a){Object.keys(a).forEach(function(b){Object.keys(a[b]).forEach(function(a){h+=
"|"+b+":"+a+"|"})})}for(var e=b.nodeType===Node.TEXT_NODE?b.parentNode:b,f,k=[],h="",g=!1;e;)!g&&z.isGroupingElement(e)&&(g=!0),(f=a.determineStylesForNode(e))&&k.push(f),e=e.parentNode;g&&(k.forEach(c),d&&(d[h]=k));return g?k:void 0}function q(a){var b={orderedStyles:[]};a.forEach(function(a){Object.keys(a).forEach(function(e){var f=Object.keys(a[e])[0],h={name:f,family:e,displayName:void 0,isCommonStyle:!1},g;(g=c(f,e))?(e=l(g),b=w.mergeObjects(e,b),h.displayName=g.getAttributeNS(k,"display-name")||
void 0,h.isCommonStyle=g.parentNode===d.rootElement.styles):runtime.log("No style element found for '"+f+"' of family '"+e+"'");b.orderedStyles.push(h)})});return b}function p(a,b){var d={},c=[];b||(b={});a.forEach(function(a){h(a,d)});Object.keys(d).forEach(function(a){b[a]||(b[a]=q(d[a]));c.push(b[a])});return c}function m(a){for(var b=d.rootElement.masterStyles.firstElementChild;b&&(b.namespaceURI!==k||"master-page"!==b.localName||b.getAttributeNS(k,"name")!==a);)b=b.nextElementSibling;return b}
function r(a,b){var d;a&&(d=t.convertMeasure(a,"px"));void 0===d&&b&&(d=t.convertMeasure(b,"px"));return d}var d,a=new odf.StyleInfo,n=odf.Namespaces.svgns,k=odf.Namespaces.stylens,s=odf.Namespaces.textns,y=odf.Namespaces.numberns,u=odf.Namespaces.fons,z=new odf.OdfUtils,x=new core.DomUtils,w=new core.Utils,t=new core.CSSUnits,D={paragraph:{"style:paragraph-properties":{"fo:text-align":"left"}}};this.getSystemDefaultStyleAttributes=f;this.setOdfContainer=function(a){d=a};this.getFontMap=g;this.getAvailableParagraphStyles=
function(){for(var a=d.rootElement.styles,b,c,e=[],a=a&&a.firstElementChild;a;)"style"===a.localName&&a.namespaceURI===k&&(b=a.getAttributeNS(k,"family"),"paragraph"===b&&(b=a.getAttributeNS(k,"name"),c=a.getAttributeNS(k,"display-name")||b,b&&c&&e.push({name:b,displayName:c}))),a=a.nextElementSibling;return e};this.isStyleUsed=function(b){var c,e=d.rootElement;c=a.hasDerivedStyles(e,odf.Namespaces.lookupNamespaceURI,b);b=(new a.UsedStyleList(e.styles)).uses(b)||(new a.UsedStyleList(e.automaticStyles)).uses(b)||
(new a.UsedStyleList(e.body)).uses(b);return c||b};this.getDefaultStyleElement=b;this.getStyleElement=c;this.getStyleAttributes=e;this.getInheritedStyleAttributes=l;this.getFirstCommonParentStyleNameOrSelf=function(a){var b=d.rootElement.styles,e;if(e=c(a,"paragraph",[d.rootElement.automaticStyles]))if(a=e.getAttributeNS(k,"parent-style-name"),!a)return null;return(e=c(a,"paragraph",[b]))?a:null};this.hasParagraphStyle=function(a){return Boolean(c(a,"paragraph"))};this.getAppliedStyles=p;this.getAppliedStylesForElement=
function(a,b){return p([a],b)[0]};this.updateStyle=function(a,b){var c,e;x.mapObjOntoNode(a,b,odf.Namespaces.lookupNamespaceURI);(c=b["style:text-properties"]&&b["style:text-properties"]["style:font-name"])&&!g().hasOwnProperty(c)&&(e=a.ownerDocument.createElementNS(k,"style:font-face"),e.setAttributeNS(k,"style:name",c),e.setAttributeNS(n,"svg:font-family",c),d.rootElement.fontFaceDecls.appendChild(e))};this.createDerivedStyleObject=function(a,b,f){var k=c(a,b);runtime.assert(Boolean(k),"No style element found for '"+
a+"' of family '"+b+"'");a=k.parentNode===d.rootElement.styles?{"style:parent-style-name":a}:e(k);a["style:family"]=b;w.mergeObjects(a,f);return a};this.getDefaultTabStopDistance=function(){for(var a=b("paragraph"),a=a&&a.firstElementChild,d;a;)a.namespaceURI===k&&"paragraph-properties"===a.localName&&(d=a.getAttributeNS(k,"tab-stop-distance")),a=a.nextElementSibling;d||(d="1.25cm");return z.parseNonNegativeLength(d)};this.getMasterPageElement=m;this.getContentSize=function(a,b){var e,f,h,g,l,n,q,
s,p,y;a:{f=c(a,b);runtime.assert("paragraph"===b||"table"===b,"styleFamily must be either paragraph or table");if(f){if(f=f.getAttributeNS(k,"master-page-name"))(e=m(f))||runtime.log("WARN: No master page definition found for "+f);e||(e=m("Standard"));e||(e=d.rootElement.masterStyles.getElementsByTagNameNS(k,"master-page")[0])||runtime.log("WARN: Document has no master pages defined");if(e)for(f=e.getAttributeNS(k,"page-layout-name"),h=x.getElementsByTagNameNS(d.rootElement.automaticStyles,k,"page-layout"),
g=0;g<h.length;g+=1)if(e=h[g],e.getAttributeNS(k,"name")===f)break a}e=null}e||(e=x.getDirectChild(d.rootElement.styles,k,"default-page-layout"));(e=x.getDirectChild(e,k,"page-layout-properties"))?("landscape"===e.getAttributeNS(k,"print-orientation")?(f="29.7cm",h="21.001cm"):(f="21.001cm",h="29.7cm"),f=r(e.getAttributeNS(u,"page-width"),f),h=r(e.getAttributeNS(u,"page-height"),h),g=r(e.getAttributeNS(u,"margin")),void 0===g?(g=r(e.getAttributeNS(u,"margin-left"),"2cm"),l=r(e.getAttributeNS(u,"margin-right"),
"2cm"),n=r(e.getAttributeNS(u,"margin-top"),"2cm"),q=r(e.getAttributeNS(u,"margin-bottom"),"2cm")):g=l=n=q=g,s=r(e.getAttributeNS(u,"padding")),void 0===s?(s=r(e.getAttributeNS(u,"padding-left"),"0cm"),p=r(e.getAttributeNS(u,"padding-right"),"0cm"),y=r(e.getAttributeNS(u,"padding-top"),"0cm"),e=r(e.getAttributeNS(u,"padding-bottom"),"0cm")):s=p=y=e=s):(f=r("21.001cm"),h=r("29.7cm"),g=l=n=q=g=r("2cm"),s=p=y=e=s=r("0cm"));return{width:f-g-l-s-p,height:h-n-q-y-e}}};
// Input 33
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var f=odf.Namespaces.stylens,g=odf.Namespaces.textns,b={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"};odf.StyleTreeNode=function(b){this.derivedStyles={};this.element=b};odf.StyleTree=function(c,e){function l(b){var d,a,c,e={};if(!b)return e;for(b=b.firstElementChild;b;){if(a=b.namespaceURI!==f||"style"!==b.localName&&
"default-style"!==b.localName?b.namespaceURI===g&&"list-style"===b.localName?"list":b.namespaceURI!==f||"page-layout"!==b.localName&&"default-page-layout"!==b.localName?void 0:"page":b.getAttributeNS(f,"family"))(d=b.getAttributeNS(f,"name"))||(d=""),e.hasOwnProperty(a)?c=e[a]:e[a]=c={},c[d]=b;b=b.nextElementSibling}return e}function h(b,d){if(b.hasOwnProperty(d))return b[d];var a=null,c=Object.keys(b),e;for(e=0;e<c.length&&!(a=h(b[c[e]].derivedStyles,d));e+=1);return a}function q(b,d,a){var c,e,
g;if(!d.hasOwnProperty(b))return null;c=new odf.StyleTreeNode(d[b]);e=c.element.getAttributeNS(f,"parent-style-name");g=null;e&&(g=h(a,e)||q(e,d,a));g?g.derivedStyles[b]=c:a[b]=c;delete d[b];return c}function p(b,d){b&&Object.keys(b).forEach(function(a){q(a,b,d)})}var m={};this.getStyleTree=function(){return m};(function(){var f,d,a;d=l(c);a=l(e);Object.keys(b).forEach(function(b){f=m[b]={};p(d[b],f);p(a[b],f)})})()}})();
// Input 34
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var f=odf.Namespaces.fons,g=odf.Namespaces.stylens,b=odf.Namespaces.textns,c={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"};odf.ListStyleToCss=function(){function e(b){var d=m.parseLength(b);return d?p.convert(d.value,d.unit,"px"):(runtime.log("Could not parse value '"+b+"'."),0)}function l(b,d){try{b.insertRule(d,b.cssRules.length)}catch(a){runtime.log("cannot load rule: "+d+" - "+a)}}function h(b){return b.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function q(c,
d,a,h){d='text|list[text|style-name="'+d+'"]';var k=a.getAttributeNS(b,"level"),m;m=a.getElementsByTagNameNS(g,"list-level-properties")[0];a=m.getAttributeNS(b,"list-level-position-and-space-mode");for(var q=m.getElementsByTagNameNS(g,"list-level-label-alignment")[0],p,z,x,w,t,k=k&&parseInt(k,10);1<k;)d+=" > text|list-item > text|list",k-=1;k=m.getAttributeNS(f,"text-align")||"left";switch(k){case "end":k="right";break;case "start":k="left"}"label-alignment"===a?(p=q.getAttributeNS(f,"margin-left")||
"0px",w=q.getAttributeNS(f,"text-indent")||"0px",t=q.getAttributeNS(b,"label-followed-by"),q=e(p)):(p=m.getAttributeNS(b,"space-before")||"0px",z=m.getAttributeNS(b,"min-label-width")||"0px",x=m.getAttributeNS(b,"min-label-distance")||"0px",q=e(p)+e(z));m=d+" > text|list-item{";m+="margin-left: "+q+"px;";m+="}";l(c,m);m=d+" > text|list-item > text|list{";m+="margin-left: "+-q+"px;";m+="}";l(c,m);m=d+" > text|list-item > *:not(text|list):first-child:before{";m+="text-align: "+k+";";m+="counter-increment:list;";
m+="display: inline-block;";"label-alignment"===a?(m+="margin-left: "+w+";","space"===t?h+=" '\\a0'":"listtab"===t&&(m+="padding-right: 0.2cm;")):(m+="min-width: "+z+";",m+="margin-left: -"+z+";",m+="padding-right: "+x+";");m+="\n"+h+";\n";m+="}";l(c,m)}var p=new core.CSSUnits,m=new odf.OdfUtils;this.applyListStyles=function(e,d){var a,f;(a=d.list)&&Object.keys(a).forEach(function(d){f=a[d];for(var l=f.element.firstChild,m,p;l;){if(l.namespaceURI===b)if(m=l,"list-level-style-number"===l.localName){var z=
m;p=z.getAttributeNS(g,"num-format");var x=z.getAttributeNS(g,"num-suffix")||"",z=z.getAttributeNS(g,"num-prefix")||"",w="";z&&(w+='"'+h(z)+'"\n');w=c.hasOwnProperty(p)?w+(" counter(list, "+c[p]+")"):p?w+(' "'+p+'"'):w+' ""';p="content:"+w+' "'+h(x)+'"';q(e,d,m,p)}else"list-level-style-image"===l.localName?(p="content: none",q(e,d,m,p)):"list-level-style-bullet"===l.localName&&(p=m.getAttributeNS(b,"bullet-char"),p='content: "'+h(p)+'"',q(e,d,m,p));l=l.nextSibling}})}}})();
// Input 35
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.Style2CSS=function(){function f(a,b,d){var c=[];d=d.derivedStyles;var e;var h=k[a],g;void 0===h?b=null:(g=b?"["+h+'|style-name="'+b+'"]':"","presentation"===h&&(h="draw",g=b?'[presentation|style-name="'+b+'"]':""),b=h+"|"+s[a].join(g+","+h+"|")+g);null!==b&&c.push(b);for(e in d)d.hasOwnProperty(e)&&(b=f(a,e,d[e]),c=c.concat(b));return c}function g(a,b){var d="",c,e,f;for(c=0;c<b.length;c+=1)if(e=b[c],f=a.getAttributeNS(e[0],e[1])){f=f.trim();if(C.hasOwnProperty(e[1])){var k=f.indexOf(" "),h=void 0,
g=void 0;-1!==k?(h=f.substring(0,k),g=f.substring(k)):(h=f,g="");(h=P.parseLength(h))&&"pt"===h.unit&&0.75>h.value&&(f="0.75pt"+g)}e[2]&&(d+=e[2]+":"+f+";")}return d}function b(a){return(a=n.getDirectChild(a,p,"text-properties"))?P.parseFoFontSize(a.getAttributeNS(h,"font-size")):null}function c(a,b,d,c){return b+b+d+d+c+c}function e(k,m,s,C){if("page"===m){var v=C.element;s="";var K,N;N=K="";var H=n.getDirectChild(v,p,"page-layout-properties"),E;if(H)if(E=v.getAttributeNS(p,"name"),s+=g(H,G),(K=
n.getDirectChild(H,p,"background-image"))&&(N=K.getAttributeNS(d,"href"))&&(s=s+("background-image: url('odfkit:"+N+"');")+g(K,u)),"presentation"===W)for(v=(v=n.getDirectChild(v.parentNode.parentNode,q,"master-styles"))&&v.firstElementChild;v;)v.namespaceURI===p&&"master-page"===v.localName&&v.getAttributeNS(p,"page-layout-name")===E&&(N=v.getAttributeNS(p,"name"),K="draw|page[draw|master-page-name="+N+"] {"+s+"}",N="office|body, draw|page[draw|master-page-name="+N+"] {"+g(H,L)+" }",k.insertRule(K,
k.cssRules.length),k.insertRule(N,k.cssRules.length)),v=v.nextElementSibling;else"text"===W&&(K="office|text {"+s+"}",N="office|body {width: "+H.getAttributeNS(h,"page-width")+";}",k.insertRule(K,k.cssRules.length),k.insertRule(N,k.cssRules.length))}else{s=f(m,s,C).join(",");H="";if(E=n.getDirectChild(C.element,p,"text-properties")){N=E;var T,R,v=T="";K=1;E=""+g(N,y);R=N.getAttributeNS(p,"text-underline-style");"solid"===R&&(T+=" underline");R=N.getAttributeNS(p,"text-line-through-style");"solid"===
R&&(T+=" line-through");T.length&&(E+="text-decoration:"+T+";");if(T=N.getAttributeNS(p,"font-name")||N.getAttributeNS(h,"font-family"))R=S[T],E+="font-family: "+(R||T)+";";R=N.parentNode;if(N=b(R)){for(;R;){if(N=b(R)){if("%"!==N.unit){v="font-size: "+N.value*K+N.unit+";";break}K*=N.value/100}N=R;T=R="";R=null;"default-style"===N.localName?R=null:(R=N.getAttributeNS(p,"parent-style-name"),T=N.getAttributeNS(p,"family"),R=O.getODFElementsWithXPath(I,R?"//style:*[@style:name='"+R+"'][@style:family='"+
T+"']":"//style:default-style[@style:family='"+T+"']",odf.Namespaces.lookupNamespaceURI)[0])}v||(v="font-size: "+parseFloat(da)*K+J.getUnits(da)+";");E+=v}H+=E}if(E=n.getDirectChild(C.element,p,"paragraph-properties"))v=E,E=""+g(v,z),(K=n.getDirectChild(v,p,"background-image"))&&(N=K.getAttributeNS(d,"href"))&&(E=E+("background-image: url('odfkit:"+N+"');")+g(K,u)),(v=v.getAttributeNS(h,"line-height"))&&"normal"!==v&&(v=P.parseFoLineHeight(v),E="%"!==v.unit?E+("line-height: "+v.value+v.unit+";"):
E+("line-height: "+v.value/100+";")),H+=E;if(E=n.getDirectChild(C.element,p,"graphic-properties"))N=E,E=""+g(N,x),v=N.getAttributeNS(l,"opacity"),K=N.getAttributeNS(l,"fill"),N=N.getAttributeNS(l,"fill-color"),"solid"===K||"hatch"===K?N&&"none"!==N?(v=isNaN(parseFloat(v))?1:parseFloat(v)/100,K=N.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,c),(N=(K=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(K))?{r:parseInt(K[1],16),g:parseInt(K[2],16),b:parseInt(K[3],16)}:null)&&(E+="background-color: rgba("+
N.r+","+N.g+","+N.b+","+v+");")):E+="background: none;":"none"===K&&(E+="background: none;"),H+=E;if(E=n.getDirectChild(C.element,p,"drawing-page-properties"))v=""+g(E,x),"true"===E.getAttributeNS(a,"background-visible")&&(v+="background: none;"),H+=v;if(E=n.getDirectChild(C.element,p,"table-cell-properties"))E=""+g(E,w),H+=E;if(E=n.getDirectChild(C.element,p,"table-row-properties"))E=""+g(E,D),H+=E;if(E=n.getDirectChild(C.element,p,"table-column-properties"))E=""+g(E,t),H+=E;if(E=n.getDirectChild(C.element,
p,"table-properties"))v=E,E=""+g(v,B),v=v.getAttributeNS(r,"border-model"),"collapsing"===v?E+="border-collapse:collapse;":"separating"===v&&(E+="border-collapse:separate;"),H+=E;0!==H.length&&k.insertRule(s+"{"+H+"}",k.cssRules.length)}for(var V in C.derivedStyles)C.derivedStyles.hasOwnProperty(V)&&e(k,m,V,C.derivedStyles[V])}var l=odf.Namespaces.drawns,h=odf.Namespaces.fons,q=odf.Namespaces.officens,p=odf.Namespaces.stylens,m=odf.Namespaces.svgns,r=odf.Namespaces.tablens,d=odf.Namespaces.xlinkns,
a=odf.Namespaces.presentationns,n=new core.DomUtils,k={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"},s={graphic:"circle connected control custom-shape ellipse frame g line measure page page-thumbnail path polygon polyline rect regular-polygon".split(" "),paragraph:"alphabetical-index-entry-template h illustration-index-entry-template index-source-style object-index-entry-template p table-index-entry-template table-of-content-entry-template user-index-entry-template".split(" "),
presentation:"caption circle connector control custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),"drawing-page":"caption circle connector control page custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),ruby:["ruby","ruby-text"],section:"alphabetical-index bibliography illustration-index index-title object-index section table-of-content table-index user-index".split(" "),table:["background",
"table"],"table-cell":"body covered-table-cell even-columns even-rows first-column first-row last-column last-row odd-columns odd-rows table-cell".split(" "),"table-column":["table-column"],"table-row":["table-row"],text:"a index-entry-chapter index-entry-link-end index-entry-link-start index-entry-page-number index-entry-span index-entry-tab-stop index-entry-text index-title-template linenumbering-configuration list-level-style-number list-level-style-bullet outline-level-style span".split(" "),
list:["list-item"]},y=[[h,"color","color"],[h,"background-color","background-color"],[h,"font-weight","font-weight"],[h,"font-style","font-style"]],u=[[p,"repeat","background-repeat"]],z=[[h,"background-color","background-color"],[h,"text-align","text-align"],[h,"text-indent","text-indent"],[h,"padding","padding"],[h,"padding-left","padding-left"],[h,"padding-right","padding-right"],[h,"padding-top","padding-top"],[h,"padding-bottom","padding-bottom"],[h,"border-left","border-left"],[h,"border-right",
"border-right"],[h,"border-top","border-top"],[h,"border-bottom","border-bottom"],[h,"margin","margin"],[h,"margin-left","margin-left"],[h,"margin-right","margin-right"],[h,"margin-top","margin-top"],[h,"margin-bottom","margin-bottom"],[h,"border","border"]],x=[[h,"background-color","background-color"],[h,"min-height","min-height"],[l,"stroke","border"],[m,"stroke-color","border-color"],[m,"stroke-width","border-width"],[h,"border","border"],[h,"border-left","border-left"],[h,"border-right","border-right"],
[h,"border-top","border-top"],[h,"border-bottom","border-bottom"]],w=[[h,"background-color","background-color"],[h,"border-left","border-left"],[h,"border-right","border-right"],[h,"border-top","border-top"],[h,"border-bottom","border-bottom"],[h,"border","border"]],t=[[p,"column-width","width"]],D=[[p,"row-height","height"],[h,"keep-together",null]],B=[[p,"width","width"],[h,"margin-left","margin-left"],[h,"margin-right","margin-right"],[h,"margin-top","margin-top"],[h,"margin-bottom","margin-bottom"]],
G=[[h,"background-color","background-color"],[h,"padding","padding"],[h,"padding-left","padding-left"],[h,"padding-right","padding-right"],[h,"padding-top","padding-top"],[h,"padding-bottom","padding-bottom"],[h,"border","border"],[h,"border-left","border-left"],[h,"border-right","border-right"],[h,"border-top","border-top"],[h,"border-bottom","border-bottom"],[h,"margin","margin"],[h,"margin-left","margin-left"],[h,"margin-right","margin-right"],[h,"margin-top","margin-top"],[h,"margin-bottom","margin-bottom"]],
L=[[h,"page-width","width"],[h,"page-height","height"]],C={border:!0,"border-left":!0,"border-right":!0,"border-top":!0,"border-bottom":!0,"stroke-width":!0},S={},P=new odf.OdfUtils,W,I,da,O=xmldom.XPath,J=new core.CSSUnits;this.style2css=function(a,b,d,c,f){var h,g,l;for(I=b;d.cssRules.length;)d.deleteRule(d.cssRules.length-1);odf.Namespaces.forEachPrefix(function(a,b){h="@namespace "+a+" url("+b+");";try{d.insertRule(h,d.cssRules.length)}catch(c){}});S=c;W=a;da=runtime.getWindow().getComputedStyle(document.body,
null).getPropertyValue("font-size")||"12pt";for(l in k)if(k.hasOwnProperty(l))for(g in a=f[l],a)a.hasOwnProperty(g)&&e(d,l,g,a[g])}};
// Input 36
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function f(g,b){var c=this;this.getDistance=function(b){var f=c.x-b.x;b=c.y-b.y;return Math.sqrt(f*f+b*b)};this.getCenter=function(b){return new f((c.x+b.x)/2,(c.y+b.y)/2)};c.x=g;c.y=b}gui.ZoomHelper=function(){function g(b,d,c,e){b=e?"translate3d("+b+"px, "+d+"px, 0) scale3d("+c+", "+c+", 1)":"translate("+b+"px, "+d+"px) scale("+c+")";a.style.WebkitTransform=b;a.style.MozTransform=b;a.style.msTransform=b;a.style.OTransform=b;a.style.transform=b}function b(a){a?g(-n.x,-n.y,y,!0):(g(0,
0,y,!0),g(0,0,y,!1))}function c(a){if(x&&G){var b=x.style.overflow,d=x.classList.contains("webodf-customScrollbars");a&&d||!a&&!d||(a?(x.classList.add("webodf-customScrollbars"),x.style.overflow="hidden",runtime.requestAnimationFrame(function(){x.style.overflow=b})):x.classList.remove("webodf-customScrollbars"))}}function e(){g(-n.x,-n.y,y,!0);x.scrollLeft=0;x.scrollTop=0;L=w.style.overflow;w.style.overflow="visible";c(!1)}function l(){g(0,0,y,!0);x.scrollLeft=n.x;x.scrollTop=n.y;w.style.overflow=
L||"";c(!0)}function h(b){return new f(b.pageX-a.offsetLeft,b.pageY-a.offsetTop)}function q(b){k&&(n.x-=b.x-k.x,n.y-=b.y-k.y,n=new f(Math.min(Math.max(n.x,a.offsetLeft),(a.offsetLeft+a.offsetWidth)*y-x.clientWidth),Math.min(Math.max(n.y,a.offsetTop),(a.offsetTop+a.offsetHeight)*y-x.clientHeight)));k=b}function p(a){var b=a.touches.length,d=0<b?h(a.touches[0]):null;a=1<b?h(a.touches[1]):null;d&&a?(s=d.getDistance(a),u=y,k=d.getCenter(a),e(),B=D.PINCH):d&&(k=d,B=D.SCROLL)}function m(d){var c=d.touches.length,
f=0<c?h(d.touches[0]):null,c=1<c?h(d.touches[1]):null;if(f&&c)if(d.preventDefault(),B===D.SCROLL)B=D.PINCH,e(),s=f.getDistance(c);else{d=f.getCenter(c);f=f.getDistance(c)/s;q(d);var c=y,k=Math.min(z,a.offsetParent.clientWidth/a.offsetWidth);y=u*f;y=Math.min(Math.max(y,k),z);f=y/c;n.x+=(f-1)*(d.x+n.x);n.y+=(f-1)*(d.y+n.y);b(!0)}else f&&(B===D.PINCH?(B=D.SCROLL,l()):q(f))}function r(){B===D.PINCH&&(t.emit(gui.ZoomHelper.signalZoomChanged,y),l(),b(!1));B=D.NONE}function d(){x&&(x.removeEventListener("touchstart",
p,!1),x.removeEventListener("touchmove",m,!1),x.removeEventListener("touchend",r,!1))}var a,n,k,s,y,u,z=4,x,w,t=new core.EventNotifier([gui.ZoomHelper.signalZoomChanged]),D={NONE:0,SCROLL:1,PINCH:2},B=D.NONE,G=runtime.getWindow().hasOwnProperty("ontouchstart"),L="";this.subscribe=function(a,b){t.subscribe(a,b)};this.unsubscribe=function(a,b){t.unsubscribe(a,b)};this.getZoomLevel=function(){return y};this.setZoomLevel=function(d){a&&(y=d,b(!1),t.emit(gui.ZoomHelper.signalZoomChanged,y))};this.destroy=
function(a){d();c(!1);a()};this.setZoomableElement=function(e){d();a=e;x=a.offsetParent;w=a.parentElement;b(!1);x&&(x.addEventListener("touchstart",p,!1),x.addEventListener("touchmove",m,!1),x.addEventListener("touchend",r,!1));c(!0)};u=y=1;n=new f(0,0)};gui.ZoomHelper.signalZoomChanged="zoomChanged"})();
// Input 37
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Canvas=function(){};ops.Canvas.prototype.getZoomLevel=function(){};ops.Canvas.prototype.getElement=function(){};ops.Canvas.prototype.getSizer=function(){};ops.Canvas.prototype.getZoomHelper=function(){};
// Input 38
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function f(){function a(c){d=!0;runtime.setTimeout(function(){try{c()}catch(e){runtime.log(String(e))}d=!1;0<b.length&&a(b.pop())},10)}var b=[],d=!1;this.clearQueue=function(){b.length=0};this.addToQueue=function(c){if(0===b.length&&!d)return a(c);b.push(c)}}function g(a){function b(){for(;0<d.cssRules.length;)d.deleteRule(0);d.insertRule("#shadowContent draw|page {display:none;}",0);d.insertRule("office|presentation draw|page {display:none;}",1);d.insertRule("#shadowContent draw|page:nth-of-type("+
c+") {display:block;}",2);d.insertRule("office|presentation draw|page:nth-of-type("+c+") {display:block;}",3)}var d=a.sheet,c=1;this.showFirstPage=function(){c=1;b()};this.showNextPage=function(){c+=1;b()};this.showPreviousPage=function(){1<c&&(c-=1,b())};this.showPage=function(a){0<a&&(c=a,b())};this.css=a;this.destroy=function(b){a.parentNode.removeChild(a);b()}}function b(a){for(;a.firstChild;)a.removeChild(a.firstChild)}function c(a){a=a.sheet;for(var b=a.cssRules;b.length;)a.deleteRule(b.length-
1)}function e(a,b,d){var c=new odf.Style2CSS,e=new odf.ListStyleToCss;d=d.sheet;var f=(new odf.StyleTree(a.rootElement.styles,a.rootElement.automaticStyles)).getStyleTree();c.style2css(a.getDocumentType(),a.rootElement,d,b.getFontMap(),f);e.applyListStyles(d,f)}function l(a,b,d){var c=null;a=a.rootElement.body.getElementsByTagNameNS(P,d+"-decl");d=b.getAttributeNS(P,"use-"+d+"-name");var e;if(d&&0<a.length)for(b=0;b<a.length;b+=1)if(e=a[b],e.getAttributeNS(P,"name")===d){c=e.textContent;break}return c}
function h(a,d,c,e){var f=a.ownerDocument;d=a.getElementsByTagNameNS(d,c);for(a=0;a<d.length;a+=1)b(d[a]),e&&(c=d[a],c.appendChild(f.createTextNode(e)))}function q(a,b,d){b.setAttributeNS("urn:webodf:names:helper","styleid",a);var c,e=b.getAttributeNS(L,"anchor-type"),f=b.getAttributeNS(B,"x"),k=b.getAttributeNS(B,"y"),h=b.getAttributeNS(B,"width"),g=b.getAttributeNS(B,"height"),l=b.getAttributeNS(w,"min-height"),m=b.getAttributeNS(w,"min-width");if("as-char"===e)c="display: inline-block;";else if(e||
f||k)c="position: absolute;";else if(h||g||l||m)c="display: block;";f&&(c+="left: "+f+";");k&&(c+="top: "+k+";");h&&(c+="width: "+h+";");g&&(c+="height: "+g+";");l&&(c+="min-height: "+l+";");m&&(c+="min-width: "+m+";");c&&(c="draw|"+b.localName+'[webodfhelper|styleid="'+a+'"] {'+c+"}",d.insertRule(c,d.cssRules.length))}function p(a){for(a=a.firstChild;a;){if(a.namespaceURI===t&&"binary-data"===a.localName)return"data:image/png;base64,"+a.textContent.replace(/[\r\n\s]/g,"");a=a.nextSibling}return""}
function m(a,b,d,c){function e(b){b&&(b='draw|image[webodfhelper|styleid="'+a+'"] {'+("background-image: url("+b+");")+"}",c.insertRule(b,c.cssRules.length))}function f(a){e(a.url)}d.setAttributeNS("urn:webodf:names:helper","styleid",a);var k=d.getAttributeNS(C,"href"),h;if(k)try{h=b.getPart(k),h.onchange=f,h.load()}catch(g){runtime.log("slight problem: "+String(g))}else k=p(d),e(k)}function r(a){var b=a.ownerDocument;O.getElementsByTagNameNS(a,L,"line-break").forEach(function(a){a.hasChildNodes()||
a.appendChild(b.createElement("br"))})}function d(a){var b=a.ownerDocument;O.getElementsByTagNameNS(a,L,"s").forEach(function(a){for(var d,c;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(b.createTextNode(" "));c=parseInt(a.getAttributeNS(L,"c"),10);if(1<c)for(a.removeAttributeNS(L,"c"),d=1;d<c;d+=1)a.parentNode.insertBefore(a.cloneNode(!0),a)})}function a(a){O.getElementsByTagNameNS(a,L,"tab").forEach(function(a){a.textContent="\t"})}function n(a,b){function d(a,c){var k=h.documentElement.namespaceURI;
"video/"===c.substr(0,6)?(e=h.createElementNS(k,"video"),e.setAttribute("controls","controls"),f=h.createElementNS(k,"source"),a&&f.setAttribute("src",a),f.setAttribute("type",c),e.appendChild(f),b.parentNode.appendChild(e)):b.innerHtml="Unrecognised Plugin"}function c(a){d(a.url,a.mimetype)}var e,f,k,h=b.ownerDocument,g;if(k=b.getAttributeNS(C,"href"))try{g=a.getPart(k),g.onchange=c,g.load()}catch(l){runtime.log("slight problem: "+String(l))}else runtime.log("using MP4 data fallback"),k=p(b),d(k,
"video/mp4")}function k(a,b){try{a.insertRule(b,a.cssRules.length)}catch(d){runtime.log("cannot load rule: "+b+" - "+d)}}function s(a){return a.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function y(a){var b=a.getElementsByTagName("head")[0],d,c;d=a.styleSheets.length;for(c=b.firstElementChild;c&&("style"!==c.localName||!c.hasAttribute("webodfcss"));)c=c.nextElementSibling;if(c)return d=parseInt(c.getAttribute("webodfcss"),10),c.setAttribute("webodfcss",d+1),c;"string"===String(typeof webodf_css)?d=
webodf_css:(c="webodf.css",runtime.currentDirectory&&(c=runtime.currentDirectory(),0<c.length&&"/"!==c.substr(-1)&&(c+="/"),c+="../webodf.css"),d=runtime.readFileSync(c,"utf-8"));c=a.createElementNS(b.namespaceURI,"style");c.setAttribute("media","screen, print, handheld, projection");c.setAttribute("type","text/css");c.setAttribute("webodfcss","1");c.appendChild(a.createTextNode(d));b.appendChild(c);return c}function u(a){var b=parseInt(a.getAttribute("webodfcss"),10);1===b?a.parentNode.removeChild(a):
a.setAttribute("count",b-1)}function z(a){var b=a.getElementsByTagName("head")[0],d=a.createElementNS(b.namespaceURI,"style"),c="";d.setAttribute("type","text/css");d.setAttribute("media","screen, print, handheld, projection");odf.Namespaces.forEachPrefix(function(a,b){c+="@namespace "+a+" url("+b+");\n"});c+="@namespace webodfhelper url(urn:webodf:names:helper);\n";d.appendChild(a.createTextNode(c));b.appendChild(d);return d}var x=odf.Namespaces.drawns,w=odf.Namespaces.fons,t=odf.Namespaces.officens,
D=odf.Namespaces.stylens,B=odf.Namespaces.svgns,G=odf.Namespaces.tablens,L=odf.Namespaces.textns,C=odf.Namespaces.xlinkns,S=odf.Namespaces.xmlns,P=odf.Namespaces.presentationns,W=runtime.getWindow(),I=xmldom.XPath,da=new odf.OdfUtils,O=new core.DomUtils;odf.OdfCanvas=function(p){function B(a,b,d){function c(a,b,d,e){la.addToQueue(function(){m(a,b,d,e)})}var e,f;e=b.getElementsByTagNameNS(x,"image");for(b=0;b<e.length;b+=1)f=e.item(b),c("image"+String(b),a,f,d)}function C(a,b){function d(a,b){la.addToQueue(function(){n(a,
b)})}var c,e,f;e=b.getElementsByTagNameNS(x,"plugin");for(c=0;c<e.length;c+=1)f=e.item(c),d(a,f)}function w(){var a;a=V.firstChild;var b=ga.getZoomLevel();a&&(V.style.WebkitTransformOrigin="0% 0%",V.style.MozTransformOrigin="0% 0%",V.style.msTransformOrigin="0% 0%",V.style.OTransformOrigin="0% 0%",V.style.transformOrigin="0% 0%",$&&((a=$.getMinimumHeightForAnnotationPane())?V.style.minHeight=a:V.style.removeProperty("min-height")),p.style.width=Math.round(b*V.offsetWidth)+"px",p.style.height=Math.round(b*
V.offsetHeight)+"px",p.style.display="inline-block")}function Y(a){M?(Z.parentNode||V.appendChild(Z),$&&$.forgetAnnotations(),$=new gui.AnnotationViewManager(N,a.body,Z,ma),O.getElementsByTagNameNS(a.body,t,"annotation").forEach($.addAnnotation),$.rerenderAnnotations(),w()):Z.parentNode&&(V.removeChild(Z),$.forgetAnnotations(),w())}function v(f){function g(){c(ea);c(pa);c(ia);b(p);p.style.display="inline-block";var m=E.rootElement;p.ownerDocument.importNode(m,!0);T.setOdfContainer(E);var n=E,y=ea;
(new odf.FontLoader).loadFonts(n,y.sheet);e(E,T,pa);y=E;n=ia.sheet;b(p);V=H.createElementNS(p.namespaceURI,"div");V.style.display="inline-block";V.style.background="white";V.style.setProperty("float","left","important");V.appendChild(m);p.appendChild(V);Z=H.createElementNS(p.namespaceURI,"div");Z.id="annotationsPane";fa=H.createElementNS(p.namespaceURI,"div");fa.id="shadowContent";fa.style.position="absolute";fa.style.top=0;fa.style.left=0;y.getContentElement().appendChild(fa);var u=m.body,v,w=[],
z;for(v=u.firstElementChild;v&&v!==u;)if(v.namespaceURI===x&&(w[w.length]=v),v.firstElementChild)v=v.firstElementChild;else{for(;v&&v!==u&&!v.nextElementSibling;)v=v.parentNode;v&&v.nextElementSibling&&(v=v.nextElementSibling)}for(z=0;z<w.length;z+=1)v=w[z],q("frame"+String(z),v,n);w=I.getODFElementsWithXPath(u,".//*[*[@text:anchor-type='paragraph']]",odf.Namespaces.lookupNamespaceURI);for(v=0;v<w.length;v+=1)u=w[v],u.setAttributeNS&&u.setAttributeNS("urn:webodf:names:helper","containsparagraphanchor",
!0);u=T;v=fa;var A,ba,O,K;K=0;var N,M;z=y.rootElement.ownerDocument;if((w=m.body.firstElementChild)&&w.namespaceURI===t&&("presentation"===w.localName||"drawing"===w.localName))for(w=w.firstElementChild;w;){if(A=(A=w.getAttributeNS(x,"master-page-name"))?u.getMasterPageElement(A):null){ba=w.getAttributeNS("urn:webodf:names:helper","styleid");O=z.createElementNS(x,"draw:page");M=A.firstElementChild;for(N=0;M;)"true"!==M.getAttributeNS(P,"placeholder")&&(K=M.cloneNode(!0),O.appendChild(K),q(ba+"_"+
N,K,n)),M=M.nextElementSibling,N+=1;M=N=K=void 0;var R=O.getElementsByTagNameNS(x,"frame");for(K=0;K<R.length;K+=1)N=R[K],(M=N.getAttributeNS(P,"class"))&&!/^(date-time|footer|header|page-number)$/.test(M)&&N.parentNode.removeChild(N);v.appendChild(O);K=String(v.getElementsByTagNameNS(x,"page").length);h(O,L,"page-number",K);h(O,P,"header",l(y,w,"header"));h(O,P,"footer",l(y,w,"footer"));q(ba,O,n);O.setAttributeNS(x,"draw:master-page-name",A.getAttributeNS(D,"name"))}w=w.nextElementSibling}u=p.namespaceURI;
w=m.body.getElementsByTagNameNS(G,"table-cell");for(v=0;v<w.length;v+=1)z=w.item(v),z.hasAttributeNS(G,"number-columns-spanned")&&z.setAttributeNS(u,"colspan",z.getAttributeNS(G,"number-columns-spanned")),z.hasAttributeNS(G,"number-rows-spanned")&&z.setAttributeNS(u,"rowspan",z.getAttributeNS(G,"number-rows-spanned"));r(m.body);d(m.body);a(m.body);B(y,m.body,n);C(y,m.body);z=m.body;y=p.namespaceURI;v={};var w={},X;A=W.document.getElementsByTagNameNS(L,"list-style");for(u=0;u<A.length;u+=1)K=A.item(u),
(N=K.getAttributeNS(D,"name"))&&(w[N]=K);z=z.getElementsByTagNameNS(L,"list");for(u=0;u<z.length;u+=1)if(K=z.item(u),A=K.getAttributeNS(S,"id")){ba=K.getAttributeNS(L,"continue-list");K.setAttributeNS(y,"id",A);O="text|list#"+A+" > text|list-item > *:first-child:before {";if(N=K.getAttributeNS(L,"style-name"))K=w[N],X=da.getFirstNonWhitespaceChild(K),K=void 0,X&&("list-level-style-number"===X.localName?(N=X,X=N.getAttributeNS(D,"num-format"),K=N.getAttributeNS(D,"num-suffix")||"",N=N.getAttributeNS(D,
"num-prefix")||"",M="",M={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},R=void 0,N&&(R='"'+s(N)+'"\n'),R=M.hasOwnProperty(X)?R+(" counter(list, "+M[X]+")"):X?R+("'"+X+"';"):R+' ""',K&&(R+=' "'+s(K)+'"'),K=M="content:"+R+";"):"list-level-style-image"===X.localName?K="content: none;":"list-level-style-bullet"===X.localName&&(X=X.getAttributeNS(L,"bullet-char"),K='content: "'+s(X)+'"\n;')),X=K,X="\n"+X+"\n";if(ba){for(K=v[ba];K;)K=v[K];O+="counter-increment:"+ba+";";X?
(X=X.replace("list",ba),O+=X):O+="content:counter("+ba+");"}else ba="",X?(X=X.replace("list",A),O+=X):O+="content: counter("+A+");",O+="counter-increment:"+A+";",k(n,"text|list#"+A+" {counter-reset:"+A+"}");O+="}";v[A]=ba;O&&k(n,O)}V.insertBefore(fa,V.firstChild);ga.setZoomableElement(V);Y(m);if(!f&&(m=[E],ja.hasOwnProperty("statereadychange")))for(n=ja.statereadychange,X=0;X<n.length;X+=1)n[X].apply(null,m)}E.state===odf.OdfContainer.DONE?g():(runtime.log("WARNING: refreshOdf called but ODF was not DONE."),
na=runtime.setTimeout(function qa(){E.state===odf.OdfContainer.DONE?g():(runtime.log("will be back later..."),na=runtime.setTimeout(qa,500))},100))}function K(a){la.clearQueue();p.innerHTML=runtime.tr("Loading")+" "+a+"...";p.removeAttribute("style");E=new odf.OdfContainer(a,function(a){E=a;v(!1)})}runtime.assert(null!==p&&void 0!==p,"odf.OdfCanvas constructor needs DOM element");runtime.assert(null!==p.ownerDocument&&void 0!==p.ownerDocument,"odf.OdfCanvas constructor needs DOM");var N=this,H=p.ownerDocument,
E,T=new odf.Formatting,R,V=null,Z=null,M=!1,ma=!1,$=null,aa,ea,pa,ia,fa,ja={},na,oa,ha=!1,ka=!1,la=new f,ga=new gui.ZoomHelper;this.refreshCSS=function(){ha=!0;oa.trigger()};this.refreshSize=function(){oa.trigger()};this.odfContainer=function(){return E};this.setOdfContainer=function(a,b){E=a;v(!0===b)};this.load=this.load=K;this.save=function(a){E.save(a)};this.addListener=function(a,b){switch(a){case "click":var d=p,c=a;d.addEventListener?d.addEventListener(c,b,!1):d.attachEvent?d.attachEvent("on"+
c,b):d["on"+c]=b;break;default:d=ja.hasOwnProperty(a)?ja[a]:ja[a]=[],b&&-1===d.indexOf(b)&&d.push(b)}};this.getFormatting=function(){return T};this.getAnnotationViewManager=function(){return $};this.refreshAnnotations=function(){Y(E.rootElement)};this.rerenderAnnotations=function(){$&&(ka=!0,oa.trigger())};this.getSizer=function(){return V};this.enableAnnotations=function(a,b){a!==M&&(M=a,ma=b,E&&Y(E.rootElement))};this.addAnnotation=function(a){$&&($.addAnnotation(a),w())};this.forgetAnnotations=
function(){$&&($.forgetAnnotations(),w())};this.getZoomHelper=function(){return ga};this.setZoomLevel=function(a){ga.setZoomLevel(a)};this.getZoomLevel=function(){return ga.getZoomLevel()};this.fitToContainingElement=function(a,b){var d=ga.getZoomLevel(),c=p.offsetHeight/d,d=a/(p.offsetWidth/d);b/c<d&&(d=b/c);ga.setZoomLevel(d)};this.fitToWidth=function(a){var b=p.offsetWidth/ga.getZoomLevel();ga.setZoomLevel(a/b)};this.fitSmart=function(a,b){var d,c;c=ga.getZoomLevel();d=p.offsetWidth/c;c=p.offsetHeight/
c;d=a/d;void 0!==b&&b/c<d&&(d=b/c);ga.setZoomLevel(Math.min(1,d))};this.fitToHeight=function(a){var b=p.offsetHeight/ga.getZoomLevel();ga.setZoomLevel(a/b)};this.showFirstPage=function(){R.showFirstPage()};this.showNextPage=function(){R.showNextPage()};this.showPreviousPage=function(){R.showPreviousPage()};this.showPage=function(a){R.showPage(a);w()};this.getElement=function(){return p};this.addCssForFrameWithImage=function(a){var b=a.getAttributeNS(x,"name"),d=a.firstElementChild;q(b,a,ia.sheet);
d&&m(b+"img",E,d,ia.sheet)};this.destroy=function(a){var b=H.getElementsByTagName("head")[0],d=[R.destroy,oa.destroy];runtime.clearTimeout(na);Z&&Z.parentNode&&Z.parentNode.removeChild(Z);ga.destroy(function(){V&&(p.removeChild(V),V=null)});u(aa);b.removeChild(ea);b.removeChild(pa);b.removeChild(ia);core.Async.destroyAll(d,a)};aa=y(H);R=new g(z(H));ea=z(H);pa=z(H);ia=z(H);oa=core.Task.createRedrawTask(function(){ha&&(e(E,T,pa),ha=!1);ka&&($&&$.rerenderAnnotations(),ka=!1);w()});ga.subscribe(gui.ZoomHelper.signalZoomChanged,
w)}})();
// Input 39
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.StepUtils=function(){this.getContentBounds=function(f){var g=f.container(),b,c;runtime.assert(f.isStep(),"Step iterator must be on a step");g.nodeType===Node.TEXT_NODE&&0<f.offset()?b=f.offset():(g=f.leftNode())&&g.nodeType===Node.TEXT_NODE&&(b=g.length);g&&(g.nodeType===Node.TEXT_NODE?(runtime.assert(0<b,"Empty text node found"),c={container:g,startOffset:b-1,endOffset:b}):c={container:g,startOffset:0,endOffset:g.childNodes.length});return c}};
// Input 40
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.MemberProperties=function(){};
ops.Member=function(f,g){var b=new ops.MemberProperties;this.getMemberId=function(){return f};this.getProperties=function(){return b};this.setProperties=function(c){Object.keys(c).forEach(function(e){b[e]=c[e]})};this.removeProperties=function(c){Object.keys(c).forEach(function(c){"fullName"!==c&&"color"!==c&&"imageUrl"!==c&&b.hasOwnProperty(c)&&delete b[c]})};runtime.assert(Boolean(f),"No memberId was supplied!");g.fullName||(g.fullName=runtime.tr("Unknown Author"));g.color||(g.color="black");g.imageUrl||
(g.imageUrl="avatar-joe.png");b=g};
// Input 41
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.SelectionMover=function(f,g){function b(){r.setUnfilteredPosition(f.getNode(),0);return r}function c(a,b){var d,c=null;a&&0<a.length&&(d=b?a.item(a.length-1):a.item(0));d&&(c={top:d.top,left:b?d.right:d.left,bottom:d.bottom});return c}function e(a,b,d,f){var h=a.nodeType;d.setStart(a,b);d.collapse(!f);f=c(d.getClientRects(),!0===f);!f&&0<b&&(d.setStart(a,b-1),d.setEnd(a,b),f=c(d.getClientRects(),!0));f||(h===Node.ELEMENT_NODE&&0<b&&a.childNodes.length>=b?f=e(a,b-1,d,!0):a.nodeType===Node.TEXT_NODE&&
0<b?f=e(a,b-1,d,!0):a.previousSibling?f=e(a.previousSibling,a.previousSibling.nodeType===Node.TEXT_NODE?a.previousSibling.textContent.length:a.previousSibling.childNodes.length,d,!0):a.parentNode&&a.parentNode!==g?f=e(a.parentNode,0,d,!1):(d.selectNode(g),f=c(d.getClientRects(),!1)));runtime.assert(Boolean(f),"No visible rectangle found");return f}function l(a,c,e){for(var f=b(),h=new core.LoopWatchDog(1E4),g=0,l=0;0<a&&f.nextPosition();)h.check(),e.acceptPosition(f)===d&&(g+=1,c.acceptPosition(f)===
d&&(l+=g,g=0,a-=1));return l}function h(a,c,e){for(var f=b(),h=new core.LoopWatchDog(1E4),g=0,l=0;0<a&&f.previousPosition();)h.check(),e.acceptPosition(f)===d&&(g+=1,c.acceptPosition(f)===d&&(l+=g,g=0,a-=1));return l}function q(a,c){var f=b(),h=0,l=0,m=0>a?-1:1;for(a=Math.abs(a);0<a;){for(var r=c,q=m,p=f,t=p.container(),D=0,B=null,G=void 0,L=10,C=void 0,S=0,P=void 0,W=void 0,I=void 0,C=void 0,da=g.ownerDocument.createRange(),O=new core.LoopWatchDog(1E4),C=e(t,p.unfilteredDomOffset(),da),P=C.top,W=
C.left,I=P;!0===(0>q?p.previousPosition():p.nextPosition());)if(O.check(),r.acceptPosition(p)===d&&(D+=1,t=p.container(),C=e(t,p.unfilteredDomOffset(),da),C.top!==P)){if(C.top!==I&&I!==P)break;I=C.top;C=Math.abs(W-C.left);if(null===B||C<L)B=t,G=p.unfilteredDomOffset(),L=C,S=D}null!==B?(p.setUnfilteredPosition(B,G),D=S):D=0;da.detach();h+=D;if(0===h)break;l+=h;a-=1}return l*m}function p(a,c){var f,h,l,p,r=b(),q=m.getParagraphElement(r.getCurrentNode()),w=0,t=g.ownerDocument.createRange();0>a?(f=r.previousPosition,
h=-1):(f=r.nextPosition,h=1);for(l=e(r.container(),r.unfilteredDomOffset(),t);f.call(r);)if(c.acceptPosition(r)===d){if(m.getParagraphElement(r.getCurrentNode())!==q)break;p=e(r.container(),r.unfilteredDomOffset(),t);if(p.bottom!==l.bottom&&(l=p.top>=l.top&&p.bottom<l.bottom||p.top<=l.top&&p.bottom>l.bottom,!l))break;w+=h;l=p}t.detach();return w}var m=new odf.OdfUtils,r,d=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.getStepCounter=function(){return{convertForwardStepsBetweenFilters:l,convertBackwardStepsBetweenFilters:h,
countLinesSteps:q,countStepsToLineBoundary:p}};(function(){r=gui.SelectionMover.createPositionIterator(g);var a=g.ownerDocument.createRange();a.setStart(r.container(),r.unfilteredDomOffset());a.collapse(!0);f.setSelectedRange(a)})()};
gui.SelectionMover.createPositionIterator=function(f){var g=new function(){this.acceptNode=function(b){return b&&"urn:webodf:names:cursor"!==b.namespaceURI&&"urn:webodf:names:editinfo"!==b.namespaceURI?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}};return new core.PositionIterator(f,5,g,!1)};
// Input 42
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Document=function(){};ops.Document.prototype.getMemberIds=function(){};ops.Document.prototype.removeCursor=function(f){};ops.Document.prototype.getDocumentElement=function(){};ops.Document.prototype.getRootNode=function(){};ops.Document.prototype.getDOMDocument=function(){};ops.Document.prototype.cloneDocumentElement=function(){};ops.Document.prototype.setDocumentElement=function(f){};ops.Document.prototype.subscribe=function(f,g){};ops.Document.prototype.unsubscribe=function(f,g){};
ops.Document.prototype.getCanvas=function(){};ops.Document.prototype.createRootFilter=function(f){};ops.Document.signalCursorAdded="cursor/added";ops.Document.signalCursorRemoved="cursor/removed";ops.Document.signalCursorMoved="cursor/moved";ops.Document.signalMemberAdded="member/added";ops.Document.signalMemberUpdated="member/updated";ops.Document.signalMemberRemoved="member/removed";
// Input 43
ops.OdtCursor=function(f,g){var b=this,c={},e,l,h,q=new core.EventNotifier([ops.OdtCursor.signalCursorUpdated]);this.removeFromDocument=function(){h.remove()};this.subscribe=function(b,c){q.subscribe(b,c)};this.unsubscribe=function(b,c){q.unsubscribe(b,c)};this.getStepCounter=function(){return l.getStepCounter()};this.getMemberId=function(){return f};this.getNode=function(){return h.getNode()};this.getAnchorNode=function(){return h.getAnchorNode()};this.getSelectedRange=function(){return h.getSelectedRange()};
this.setSelectedRange=function(c,e){h.setSelectedRange(c,e);q.emit(ops.OdtCursor.signalCursorUpdated,b)};this.hasForwardSelection=function(){return h.hasForwardSelection()};this.getDocument=function(){return g};this.getSelectionType=function(){return e};this.setSelectionType=function(b){c.hasOwnProperty(b)?e=b:runtime.log("Invalid selection type: "+b)};this.resetSelectionType=function(){b.setSelectionType(ops.OdtCursor.RangeSelection)};h=new core.Cursor(g.getDOMDocument(),f);l=new gui.SelectionMover(h,
g.getRootNode());c[ops.OdtCursor.RangeSelection]=!0;c[ops.OdtCursor.RegionSelection]=!0;b.resetSelectionType()};ops.OdtCursor.RangeSelection="Range";ops.OdtCursor.RegionSelection="Region";ops.OdtCursor.signalCursorUpdated="cursorUpdated";
// Input 44
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var f=0;ops.StepsCache=function(g,b,c){function e(a,b){var d=this;this.nodeId=a;this.steps=-1;this.node=b;this.previousBookmark=this.nextBookmark=null;this.setIteratorPosition=function(a){a.setPositionBeforeElement(b);c(d.steps,a)}}function l(a,b,d){var e=this;this.nodeId=a;this.steps=b;this.node=d;this.previousBookmark=this.nextBookmark=null;this.setIteratorPosition=function(a){a.setUnfilteredPosition(d,0);c(e.steps,a)}}function h(a,b){var d="["+a.nodeId;b&&(d+=" => "+b.nodeId);return d+
"]"}function q(){for(var a=u,b,d,c,e=new core.LoopWatchDog(0,1E5),f={};a;){e.check();(b=a.previousBookmark)?runtime.assert(b.nextBookmark===a,"Broken bookmark link to previous @"+h(b,a)):(runtime.assert(a===u,"Broken bookmark link @"+h(a)),runtime.assert(void 0===z||u===u||u.steps<=z,"Base point is damaged @"+h(a)));(d=a.nextBookmark)&&runtime.assert(d.previousBookmark===a,"Broken bookmark link to next @"+h(a,d));if(void 0===z||a===u||a.steps<=z)runtime.assert(y.containsNode(g,a.node),"Disconnected node is being reported as undamaged @"+
h(a)),b&&(c=a.node.compareDocumentPosition(b.node),runtime.assert(0===c||0!==(c&w),"Bookmark order with previous does not reflect DOM order @"+h(b,a))),d&&y.containsNode(g,d.node)&&(c=a.node.compareDocumentPosition(d.node),runtime.assert(0===c||0!==(c&x),"Bookmark order with next does not reflect DOM order @"+h(a,d)));a=a.nextBookmark}Object.keys(k).forEach(function(a){var b=k[a];(void 0===z||a<=z)&&runtime.assert(b.steps<=a,"Bookmark step of "+b.steps+" exceeds cached step lookup for "+a+" @"+h(b));
runtime.assert(!1===f.hasOwnProperty(b.nodeId),"Bookmark "+h(b)+" appears twice in cached step lookup at steps "+f[b.nodeId]+" and "+a);f[b.nodeId]=a})}function p(a){var b="";a.nodeType===Node.ELEMENT_NODE&&(b=a.getAttributeNS(n,"nodeId")||"");return b}function m(a){var b=f.toString();a.setAttributeNS(n,"nodeId",b);f+=1;return b}function r(a){var d,c,e=new core.LoopWatchDog(0,1E4);void 0!==z&&a>z&&(a=z);for(d=Math.floor(a/b)*b;!c&&0<=d;)c=k[d],d-=b;for(c=c||u;c.nextBookmark&&c.nextBookmark.steps<=
a;)e.check(),c=c.nextBookmark;runtime.assert(-1===a||c.steps<=a,"Bookmark @"+h(c)+" at step "+c.steps+" exceeds requested step of "+a);return c}function d(a){a.previousBookmark&&(a.previousBookmark.nextBookmark=a.nextBookmark);a.nextBookmark&&(a.nextBookmark.previousBookmark=a.previousBookmark)}function a(a){for(var b,d=null;!d&&a&&a!==g;)(b=p(a))&&(d=s[b])&&d.node!==a&&(runtime.log("Cloned node detected. Creating new bookmark"),d=null,a.removeAttributeNS(n,"nodeId")),a=a.parentNode;return d}var n=
"urn:webodf:names:steps",k={},s={},y=new core.DomUtils,u,z,x=Node.DOCUMENT_POSITION_FOLLOWING,w=Node.DOCUMENT_POSITION_PRECEDING,t;this.updateBookmark=function(a,c){var f,h=Math.ceil(a/b)*b,l,n,q;if(void 0!==z&&z<a){l=r(z);for(n=l.nextBookmark;n&&n.steps<=a;)f=n.nextBookmark,q=Math.ceil(n.steps/b)*b,k[q]===n&&delete k[q],y.containsNode(g,n.node)?n.steps=a+1:(d(n),delete s[n.nodeId]),n=f;z=a}else l=r(a);n=p(c)||m(c);f=s[n];f?f.node!==c&&(runtime.log("Cloned node detected. Creating new bookmark"),n=
m(c),f=s[n]=new e(n,c)):f=s[n]=new e(n,c);n=f;n.steps!==a&&(f=Math.ceil(n.steps/b)*b,f!==h&&k[f]===n&&delete k[f],n.steps=a);if(l!==n&&l.nextBookmark!==n){if(l.steps===n.steps)for(;0!==(n.node.compareDocumentPosition(l.node)&x)&&l!==u;)l=l.previousBookmark;l!==n&&l.nextBookmark!==n&&(d(n),f=l.nextBookmark,n.nextBookmark=l.nextBookmark,n.previousBookmark=l,l.nextBookmark=n,f&&(f.previousBookmark=n))}l=k[h];if(!l||n.steps>l.steps)k[h]=n;t()};this.setToClosestStep=function(a,b){var d;t();d=r(a);d.setIteratorPosition(b);
return d.steps};this.setToClosestDomPoint=function(b,d,c){var e,f;t();if(b===g&&0===d)e=u;else if(b===g&&d===g.childNodes.length)for(f in e=u,k)k.hasOwnProperty(f)&&(b=k[f],b.steps>e.steps&&(e=b));else if(e=a(b.childNodes.item(d)||b),!e)for(c.setUnfilteredPosition(b,d);!e&&c.previousNode();)e=a(c.getCurrentNode());e=e||u;void 0!==z&&e.steps>z&&(e=r(z));e.setIteratorPosition(c);return e.steps};this.damageCacheAfterStep=function(a){0>a&&(a=-1);void 0===z?z=a:a<z&&(z=a);t()};(function(){var a=p(g)||
m(g);u=new l(a,0,g);t=ops.StepsCache.ENABLE_CACHE_VERIFICATION?q:function(){}})()};ops.StepsCache.ENABLE_CACHE_VERIFICATION=!1;ops.StepsCache.Bookmark=function(){};ops.StepsCache.Bookmark.prototype.setIteratorPosition=function(f){}})();
// Input 45
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){ops.OdtStepsTranslator=function(f,g,b,c){function e(a,b,d){var c=b.getCurrentNode();b.isBeforeNode()&&r.isParagraph(c)&&(d||(a+=1),m.updateBookmark(a,c))}function l(a,d){do{if(b.acceptPosition(d)===n){e(a,d,!0);break}e(a-1,d,!1)}while(d.nextPosition())}function h(){var b=f();b!==p&&(p&&runtime.log("Undo detected. Resetting steps cache"),p=b,m=new ops.StepsCache(p,c,l),a=g(p))}function q(a,d){if(!d||b.acceptPosition(a)===n)return!0;for(;a.previousPosition();)if(b.acceptPosition(a)===n){if(d(0,
a.container(),a.unfilteredDomOffset()))return!0;break}for(;a.nextPosition();)if(b.acceptPosition(a)===n){if(d(1,a.container(),a.unfilteredDomOffset()))return!0;break}return!1}var p,m,r=new odf.OdfUtils,d=new core.DomUtils,a,n=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.convertStepsToDomPoint=function(d){var c,f;if(isNaN(d))throw new TypeError("Requested steps is not numeric ("+d+")");if(0>d)throw new RangeError("Requested steps is negative ("+d+")");h();for(c=m.setToClosestStep(d,a);c<d&&
a.nextPosition();)(f=b.acceptPosition(a)===n)&&(c+=1),e(c,a,f);if(c!==d)throw new RangeError("Requested steps ("+d+") exceeds available steps ("+c+")");return{node:a.container(),offset:a.unfilteredDomOffset()}};this.convertDomPointToSteps=function(c,f,g){var l;h();d.containsNode(p,c)||(f=0>d.comparePoints(p,0,c,f),c=p,f=f?0:p.childNodes.length);a.setUnfilteredPosition(c,f);q(a,g)||a.setUnfilteredPosition(c,f);g=a.container();f=a.unfilteredDomOffset();c=m.setToClosestDomPoint(g,f,a);if(0>d.comparePoints(a.container(),
a.unfilteredDomOffset(),g,f))return 0<c?c-1:c;for(;(a.container()!==g||a.unfilteredDomOffset()!==f)&&a.nextPosition();)(l=b.acceptPosition(a)===n)&&(c+=1),e(c,a,l);return c+0};this.prime=function(){var d,c;h();for(d=m.setToClosestStep(0,a);a.nextPosition();)(c=b.acceptPosition(a)===n)&&(d+=1),e(d,a,c)};this.handleStepsInserted=function(a){h();m.damageCacheAfterStep(a.position)};this.handleStepsRemoved=function(a){h();m.damageCacheAfterStep(a.position-1)};h()};ops.OdtStepsTranslator.PREVIOUS_STEP=
0;ops.OdtStepsTranslator.NEXT_STEP=1})();
// Input 46
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Operation=function(){};ops.Operation.prototype.init=function(f){};ops.Operation.prototype.execute=function(f){};ops.Operation.prototype.spec=function(){};
// Input 47
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.TextPositionFilter=function(f){function g(c,e,f){var g,d;if(e){if(b.isInlineRoot(e)&&b.isGroupingElement(f))return h;g=b.lookLeftForCharacter(e);if(1===g||2===g&&(b.scanRightForAnyCharacter(f)||b.scanRightForAnyCharacter(b.nextNode(c))))return l}else if(b.isInlineRoot(c.previousSibling)&&b.isGroupingElement(c))return l;g=null===e&&b.isParagraph(c);d=b.lookRightForCharacter(f);if(g)return d?l:b.scanRightForAnyCharacter(f)?h:l;if(!d)return h;e=e||b.previousNode(c);return b.scanLeftForAnyCharacter(e)?
h:l}var b=new odf.OdfUtils,c=Node.ELEMENT_NODE,e=Node.TEXT_NODE,l=core.PositionFilter.FilterResult.FILTER_ACCEPT,h=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(q){var p=q.container(),m=p.nodeType,r,d,a;if(m!==c&&m!==e)return h;if(m===e){if(!b.isGroupingElement(p.parentNode)||b.isWithinTrackedChanges(p.parentNode,f()))return h;m=q.unfilteredDomOffset();r=p.data;runtime.assert(m!==r.length,"Unexpected offset.");if(0<m){q=r[m-1];if(!b.isODFWhitespace(q))return l;if(1<m)if(q=
r[m-2],!b.isODFWhitespace(q))d=l;else{if(!b.isODFWhitespace(r.substr(0,m)))return h}else a=b.previousNode(p),b.scanLeftForNonSpace(a)&&(d=l);if(d===l)return b.isTrailingWhitespace(p,m)?h:l;d=r[m];return b.isODFWhitespace(d)?h:b.scanLeftForAnyCharacter(b.previousNode(p))?h:l}a=q.leftNode();d=p;p=p.parentNode;d=g(p,a,d)}else!b.isGroupingElement(p)||b.isWithinTrackedChanges(p,f())?d=h:(a=q.leftNode(),d=q.rightNode(),d=g(p,a,d));return d}};
// Input 48
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OdtDocument=function(f){function g(){var a=f.odfContainer().getContentElement(),b=a&&a.localName;runtime.assert("text"===b,"Unsupported content element type '"+b+"' for OdtDocument");return a}function b(){return d.getDocumentElement().ownerDocument}function c(a){for(;a&&!(a.namespaceURI===odf.Namespaces.officens&&"text"===a.localName||a.namespaceURI===odf.Namespaces.officens&&"annotation"===a.localName);)a=a.parentNode;return a}function e(a){this.acceptPosition=function(b){b=b.container();var d;
d="string"===typeof a?s[a].getNode():a;return c(b)===c(d)?z:x}}function l(a,b,d,c){c=gui.SelectionMover.createPositionIterator(c);var e;1===d.length?e=d[0]:(e=new core.PositionFilterChain,d.forEach(e.addFilter));d=new core.StepIterator(e,c);d.setPosition(a,b);return d}function h(a){var b=gui.SelectionMover.createPositionIterator(g());a=t.convertStepsToDomPoint(a);b.setUnfilteredPosition(a.node,a.offset);return b}function q(a){return n.getParagraphElement(a)}function p(a,b){return f.getFormatting().getStyleElement(a,
b)}function m(a){return p(a,"paragraph")}function r(a,b,d){a=a.childNodes.item(b)||a;return(a=q(a))&&k.containsNode(d,a)?a:d}var d=this,a,n,k,s={},y={},u=new core.EventNotifier([ops.Document.signalMemberAdded,ops.Document.signalMemberUpdated,ops.Document.signalMemberRemoved,ops.Document.signalCursorAdded,ops.Document.signalCursorRemoved,ops.Document.signalCursorMoved,ops.OdtDocument.signalParagraphChanged,ops.OdtDocument.signalParagraphStyleModified,ops.OdtDocument.signalCommonStyleCreated,ops.OdtDocument.signalCommonStyleDeleted,
ops.OdtDocument.signalTableAdded,ops.OdtDocument.signalOperationStart,ops.OdtDocument.signalOperationEnd,ops.OdtDocument.signalProcessingBatchStart,ops.OdtDocument.signalProcessingBatchEnd,ops.OdtDocument.signalUndoStackChanged,ops.OdtDocument.signalStepsInserted,ops.OdtDocument.signalStepsRemoved,ops.OdtDocument.signalMetadataUpdated]),z=core.PositionFilter.FilterResult.FILTER_ACCEPT,x=core.PositionFilter.FilterResult.FILTER_REJECT,w,t,D;this.getDocumentElement=function(){return f.odfContainer().rootElement};
this.getDOMDocument=function(){return this.getDocumentElement().ownerDocument};this.cloneDocumentElement=function(){var a=d.getDocumentElement(),b=f.getAnnotationViewManager();b&&b.forgetAnnotations();a=a.cloneNode(!0);f.refreshAnnotations();return a};this.setDocumentElement=function(a){var b=f.odfContainer();b.setRootElement(a);f.setOdfContainer(b,!0);f.refreshCSS()};this.getDOMDocument=b;this.getRootElement=c;this.createStepIterator=l;this.getIteratorAtPosition=h;this.convertDomPointToCursorStep=
function(a,b,d){return t.convertDomPointToSteps(a,b,d)};this.convertDomToCursorRange=function(a){var b;b=t.convertDomPointToSteps(a.anchorNode,a.anchorOffset);a=a.anchorNode===a.focusNode&&a.anchorOffset===a.focusOffset?b:t.convertDomPointToSteps(a.focusNode,a.focusOffset);return{position:b,length:a-b}};this.convertCursorToDomRange=function(a,d){var c=b().createRange(),e,f;e=t.convertStepsToDomPoint(a);d?(f=t.convertStepsToDomPoint(a+d),0<d?(c.setStart(e.node,e.offset),c.setEnd(f.node,f.offset)):
(c.setStart(f.node,f.offset),c.setEnd(e.node,e.offset))):c.setStart(e.node,e.offset);return c};this.getStyleElement=p;this.upgradeWhitespacesAtPosition=function(b){var d=h(b),d=new core.StepIterator(w,d),c,e=2;runtime.assert(d.isStep(),"positionIterator is not at a step (requested step: "+b+")");do{if(c=a.getContentBounds(d))if(b=c.container,c=c.startOffset,b.nodeType===Node.TEXT_NODE&&n.isSignificantWhitespace(b,c)){runtime.assert(" "===b.data[c],"upgradeWhitespaceToElement: textNode.data[offset] should be a literal space");
var f=b.ownerDocument.createElementNS(odf.Namespaces.textns,"text:s"),k=b.parentNode,g=b;f.appendChild(b.ownerDocument.createTextNode(" "));1===b.length?k.replaceChild(f,b):(b.deleteData(c,1),0<c&&(c<b.length&&b.splitText(c),g=b.nextSibling),k.insertBefore(f,g));b=f;d.setPosition(b,b.childNodes.length);d.roundToPreviousStep()}e-=1}while(0<e&&d.nextStep())};this.downgradeWhitespacesAtPosition=function(b){var d=h(b),d=new core.StepIterator(w,d),c=[],e,f=2;runtime.assert(d.isStep(),"positionIterator is not at a step (requested step: "+
b+")");do{if(b=a.getContentBounds(d))if(b=b.container,n.isDowngradableSpaceElement(b)){for(e=b.lastChild;b.firstChild;)c.push(b.firstChild),b.parentNode.insertBefore(b.firstChild,b);b.parentNode.removeChild(b);d.setPosition(e,e.nodeType===Node.TEXT_NODE?e.length:e.childNodes.length);d.roundToPreviousStep()}f-=1}while(0<f&&d.nextStep());c.forEach(k.normalizeTextNodes)};this.getParagraphStyleElement=m;this.getParagraphElement=q;this.getParagraphStyleAttributes=function(a){return(a=m(a))?f.getFormatting().getInheritedStyleAttributes(a,
!1):null};this.getTextNodeAtStep=function(a,c){var e=h(a),f=e.container(),k,g=0,l=null;f.nodeType===Node.TEXT_NODE?(k=f,g=e.unfilteredDomOffset(),0<k.length&&(0<g&&(k=k.splitText(g)),k.parentNode.insertBefore(b().createTextNode(""),k),k=k.previousSibling,g=0)):(k=b().createTextNode(""),g=0,f.insertBefore(k,e.rightNode()));if(c){if(s[c]&&d.getCursorPosition(c)===a){for(l=s[c].getNode();l.nextSibling&&"cursor"===l.nextSibling.localName;)l.parentNode.insertBefore(l.nextSibling,l);0<k.length&&k.nextSibling!==
l&&(k=b().createTextNode(""),g=0);l.parentNode.insertBefore(k,l)}}else for(;k.nextSibling&&"cursor"===k.nextSibling.localName;)k.parentNode.insertBefore(k.nextSibling,k);for(;k.previousSibling&&k.previousSibling.nodeType===Node.TEXT_NODE;)e=k.previousSibling,e.appendData(k.data),g=e.length,k=e,k.parentNode.removeChild(k.nextSibling);for(;k.nextSibling&&k.nextSibling.nodeType===Node.TEXT_NODE;)e=k.nextSibling,k.appendData(e.data),k.parentNode.removeChild(e);return{textNode:k,offset:g}};this.fixCursorPositions=
function(){Object.keys(s).forEach(function(a){var b=s[a],e=c(b.getNode()),f=d.createRootFilter(e),h,k,g,n=!1;g=b.getSelectedRange();h=r(g.startContainer,g.startOffset,e);k=l(g.startContainer,g.startOffset,[w,f],h);g.collapsed?e=k:(h=r(g.endContainer,g.endOffset,e),e=l(g.endContainer,g.endOffset,[w,f],h));k.isStep()&&e.isStep()?k.container()!==e.container()||k.offset()!==e.offset()||g.collapsed&&b.getAnchorNode()===b.getNode()||(n=!0,g.setStart(k.container(),k.offset()),g.collapse(!0)):(n=!0,runtime.assert(k.roundToClosestStep(),
"No walkable step found for cursor owned by "+a),g.setStart(k.container(),k.offset()),runtime.assert(e.roundToClosestStep(),"No walkable step found for cursor owned by "+a),g.setEnd(e.container(),e.offset()));n&&(b.setSelectedRange(g,b.hasForwardSelection()),d.emit(ops.Document.signalCursorMoved,b))})};this.getCursorPosition=function(a){return(a=s[a])?t.convertDomPointToSteps(a.getNode(),0):0};this.getCursorSelection=function(a){a=s[a];var b=0,d=0;a&&(b=t.convertDomPointToSteps(a.getNode(),0),d=t.convertDomPointToSteps(a.getAnchorNode(),
0));return{position:d,length:b-d}};this.getPositionFilter=function(){return w};this.getOdfCanvas=function(){return f};this.getCanvas=function(){return f};this.getRootNode=g;this.addMember=function(a){runtime.assert(void 0===y[a.getMemberId()],"This member already exists");y[a.getMemberId()]=a};this.getMember=function(a){return y.hasOwnProperty(a)?y[a]:null};this.removeMember=function(a){delete y[a]};this.getCursor=function(a){return s[a]};this.getMemberIds=function(){var a=[],b;for(b in s)s.hasOwnProperty(b)&&
a.push(s[b].getMemberId());return a};this.addCursor=function(a){runtime.assert(Boolean(a),"OdtDocument::addCursor without cursor");var b=a.getMemberId(),c=d.convertCursorToDomRange(0,0);runtime.assert("string"===typeof b,"OdtDocument::addCursor has cursor without memberid");runtime.assert(!s[b],"OdtDocument::addCursor is adding a duplicate cursor with memberid "+b);a.setSelectedRange(c,!0);s[b]=a};this.removeCursor=function(a){var b=s[a];return b?(b.removeFromDocument(),delete s[a],d.emit(ops.Document.signalCursorRemoved,
a),!0):!1};this.moveCursor=function(a,b,c,e){a=s[a];b=d.convertCursorToDomRange(b,c);a&&(a.setSelectedRange(b,0<=c),a.setSelectionType(e||ops.OdtCursor.RangeSelection))};this.getFormatting=function(){return f.getFormatting()};this.emit=function(a,b){u.emit(a,b)};this.subscribe=function(a,b){u.subscribe(a,b)};this.unsubscribe=function(a,b){u.unsubscribe(a,b)};this.createRootFilter=function(a){return new e(a)};this.close=function(a){a()};this.destroy=function(a){a()};w=new ops.TextPositionFilter(g);
n=new odf.OdfUtils;k=new core.DomUtils;a=new odf.StepUtils;t=new ops.OdtStepsTranslator(g,gui.SelectionMover.createPositionIterator,w,500);u.subscribe(ops.OdtDocument.signalStepsInserted,t.handleStepsInserted);u.subscribe(ops.OdtDocument.signalStepsRemoved,t.handleStepsRemoved);u.subscribe(ops.OdtDocument.signalOperationEnd,function(a){var b=a.spec(),c=b.memberid,e=(new Date(b.timestamp)).toISOString(),h=f.odfContainer(),k={setProperties:{},removedProperties:[]};a.isEdit&&("UpdateMetadata"===a.spec().optype&&
(b=JSON.parse(JSON.stringify(a.spec())),k.setProperties=b.setProperties,b.removedProperties&&(k.removedProperties=b.removedProperties)),b=d.getMember(c).getProperties().fullName,h.setMetadata({"dc:creator":b,"dc:date":e},null),k.setProperties["dc:creator"]=b,k.setProperties["dc:date"]=e,D||(k.setProperties["meta:editing-cycles"]=h.incrementEditingCycles(),h.setMetadata(null,["meta:editing-duration","meta:document-statistic"])),D=a,d.emit(ops.OdtDocument.signalMetadataUpdated,k))});u.subscribe(ops.OdtDocument.signalProcessingBatchEnd,
core.Task.processTasks)};ops.OdtDocument.signalParagraphChanged="paragraph/changed";ops.OdtDocument.signalTableAdded="table/added";ops.OdtDocument.signalCommonStyleCreated="style/created";ops.OdtDocument.signalCommonStyleDeleted="style/deleted";ops.OdtDocument.signalParagraphStyleModified="paragraphstyle/modified";ops.OdtDocument.signalOperationStart="operation/start";ops.OdtDocument.signalOperationEnd="operation/end";ops.OdtDocument.signalProcessingBatchStart="router/batchstart";
ops.OdtDocument.signalProcessingBatchEnd="router/batchend";ops.OdtDocument.signalUndoStackChanged="undo/changed";ops.OdtDocument.signalStepsInserted="steps/inserted";ops.OdtDocument.signalStepsRemoved="steps/removed";ops.OdtDocument.signalMetadataUpdated="metadata/updated";
// Input 49
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddAnnotation=function(){function f(b,c,e){var f=b.getTextNodeAtStep(e,g);f&&(b=f.textNode,e=b.parentNode,f.offset!==b.length&&b.splitText(f.offset),e.insertBefore(c,b.nextSibling),0===b.length&&e.removeChild(b))}var g,b,c,e,l,h;this.init=function(f){g=f.memberid;b=parseInt(f.timestamp,10);c=parseInt(f.position,10);e=parseInt(f.length,10)||0;l=f.name};this.isEdit=!0;this.group=void 0;this.execute=function(q){var p=q.getCursor(g),m,r;r=new core.DomUtils;h=q.getDOMDocument();var d=new Date(b),
a,n,k,s;a=h.createElementNS(odf.Namespaces.officens,"office:annotation");a.setAttributeNS(odf.Namespaces.officens,"office:name",l);m=h.createElementNS(odf.Namespaces.dcns,"dc:creator");m.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g);m.textContent=q.getMember(g).getProperties().fullName;n=h.createElementNS(odf.Namespaces.dcns,"dc:date");n.appendChild(h.createTextNode(d.toISOString()));d=h.createElementNS(odf.Namespaces.textns,"text:list");k=h.createElementNS(odf.Namespaces.textns,
"text:list-item");s=h.createElementNS(odf.Namespaces.textns,"text:p");k.appendChild(s);d.appendChild(k);a.appendChild(m);a.appendChild(n);a.appendChild(d);e&&(m=h.createElementNS(odf.Namespaces.officens,"office:annotation-end"),m.setAttributeNS(odf.Namespaces.officens,"office:name",l),a.annotationEndElement=m,f(q,m,c+e));f(q,a,c);q.emit(ops.OdtDocument.signalStepsInserted,{position:c});p&&(m=h.createRange(),r=r.getElementsByTagNameNS(a,odf.Namespaces.textns,"p")[0],m.selectNodeContents(r),p.setSelectedRange(m,
!1),q.emit(ops.Document.signalCursorMoved,p));q.getOdfCanvas().addAnnotation(a);q.fixCursorPositions();return!0};this.spec=function(){return{optype:"AddAnnotation",memberid:g,timestamp:b,position:c,length:e,name:l}}};
// Input 50
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddCursor=function(){var f,g;this.init=function(b){f=b.memberid;g=b.timestamp};this.isEdit=!1;this.group=void 0;this.execute=function(b){var c=b.getCursor(f);if(c)return!1;c=new ops.OdtCursor(f,b);b.addCursor(c);b.emit(ops.Document.signalCursorAdded,c);return!0};this.spec=function(){return{optype:"AddCursor",memberid:f,timestamp:g}}};
// Input 51
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddMember=function(){var f,g,b;this.init=function(c){f=c.memberid;g=parseInt(c.timestamp,10);b=c.setProperties};this.isEdit=!1;this.group=void 0;this.execute=function(c){var e;if(c.getMember(f))return!1;e=new ops.Member(f,b);c.addMember(e);c.emit(ops.Document.signalMemberAdded,e);return!0};this.spec=function(){return{optype:"AddMember",memberid:f,timestamp:g,setProperties:b}}};
// Input 52
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddStyle=function(){var f,g,b,c,e,l,h=odf.Namespaces.stylens;this.init=function(h){f=h.memberid;g=h.timestamp;b=h.styleName;c=h.styleFamily;e="true"===h.isAutomaticStyle||!0===h.isAutomaticStyle;l=h.setProperties};this.isEdit=!0;this.group=void 0;this.execute=function(f){var g=f.getOdfCanvas().odfContainer(),m=f.getFormatting(),r=f.getDOMDocument().createElementNS(h,"style:style");if(!r)return!1;l&&m.updateStyle(r,l);r.setAttributeNS(h,"style:family",c);r.setAttributeNS(h,"style:name",b);e?
g.rootElement.automaticStyles.appendChild(r):g.rootElement.styles.appendChild(r);f.getOdfCanvas().refreshCSS();e||f.emit(ops.OdtDocument.signalCommonStyleCreated,{name:b,family:c});return!0};this.spec=function(){return{optype:"AddStyle",memberid:f,timestamp:g,styleName:b,styleFamily:c,isAutomaticStyle:e,setProperties:l}}};
// Input 53
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.ObjectNameGenerator=function(f,g){function b(a,b){var d={};this.generateName=function(){var c=b(),e=0,f;do f=a+e,e+=1;while(d[f]||c[f]);d[f]=!0;return f}}function c(){var a={};[f.rootElement.automaticStyles,f.rootElement.styles].forEach(function(b){for(b=b.firstElementChild;b;)b.namespaceURI===e&&"style"===b.localName&&(a[b.getAttributeNS(e,"name")]=!0),b=b.nextElementSibling});return a}var e=odf.Namespaces.stylens,l=odf.Namespaces.drawns,h=odf.Namespaces.xlinkns,q=new core.DomUtils,p=(new core.Utils).hashString(g),
m=null,r=null,d=null,a={},n={};this.generateStyleName=function(){null===m&&(m=new b("auto"+p+"_",function(){return c()}));return m.generateName()};this.generateFrameName=function(){null===r&&(q.getElementsByTagNameNS(f.rootElement.body,l,"frame").forEach(function(b){a[b.getAttributeNS(l,"name")]=!0}),r=new b("fr"+p+"_",function(){return a}));return r.generateName()};this.generateImageName=function(){null===d&&(q.getElementsByTagNameNS(f.rootElement.body,l,"image").forEach(function(a){a=a.getAttributeNS(h,
"href");a=a.substring(9,a.lastIndexOf("."));n[a]=!0}),d=new b("img"+p+"_",function(){return n}));return d.generateName()}};
// Input 54
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.TextStyleApplicator=function(f,g,b){function c(b){function c(a,b){return"object"===typeof a&&"object"===typeof b?Object.keys(a).every(function(d){return c(a[d],b[d])}):a===b}var d={};this.isStyleApplied=function(a){a=g.getAppliedStylesForElement(a,d);return c(b,a)}}function e(c){var e={};this.applyStyleToContainer=function(d){var a;a=d.getAttributeNS(q,"style-name");var h=d.ownerDocument;a=a||"";if(!e.hasOwnProperty(a)){var k=a,l;l=a?g.createDerivedStyleObject(a,"text",c):c;h=h.createElementNS(p,
"style:style");g.updateStyle(h,l);h.setAttributeNS(p,"style:name",f.generateStyleName());h.setAttributeNS(p,"style:family","text");h.setAttributeNS("urn:webodf:names:scope","scope","document-content");b.appendChild(h);e[k]=h}a=e[a].getAttributeNS(p,"name");d.setAttributeNS(q,"text:style-name",a)}}function l(b,c){var d=b.ownerDocument,a=b.parentNode,e,f,g,l=new core.LoopWatchDog(1E4);f=[];f.push(b);for(g=b.nextSibling;g&&h.rangeContainsNode(c,g);)l.check(),f.push(g),g=g.nextSibling;"span"!==a.localName||
a.namespaceURI!==q?(e=d.createElementNS(q,"text:span"),a.insertBefore(e,b),d=!1):(b.previousSibling&&!h.rangeContainsNode(c,a.firstChild)?(e=a.cloneNode(!1),a.parentNode.insertBefore(e,a.nextSibling)):e=a,d=!0);f.forEach(function(a){a.parentNode!==e&&e.appendChild(a)});if(g&&d)for(f=e.cloneNode(!1),e.parentNode.insertBefore(f,e.nextSibling);g;)l.check(),d=g.nextSibling,f.appendChild(g),g=d;return e}var h=new core.DomUtils,q=odf.Namespaces.textns,p=odf.Namespaces.stylens;this.applyStyle=function(b,
f,d){var a={},h,k,g,p;runtime.assert(d&&d.hasOwnProperty("style:text-properties"),"applyStyle without any text properties");a["style:text-properties"]=d["style:text-properties"];g=new e(a);p=new c(a);b.forEach(function(a){h=p.isStyleApplied(a);!1===h&&(k=l(a,f),g.applyStyleToContainer(k))})}};
// Input 55
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpApplyDirectStyling=function(){function f(b,c,e){var d=b.getOdfCanvas().odfContainer(),a=q.splitBoundaries(c),f=h.getTextNodes(c,!1);(new odf.TextStyleApplicator(new odf.ObjectNameGenerator(d,g),b.getFormatting(),d.rootElement.automaticStyles)).applyStyle(f,c,e);a.forEach(q.normalizeTextNodes)}var g,b,c,e,l,h=new odf.OdfUtils,q=new core.DomUtils;this.init=function(f){g=f.memberid;b=f.timestamp;c=parseInt(f.position,10);e=parseInt(f.length,10);l=f.setProperties};this.isEdit=!0;this.group=void 0;
this.execute=function(p){var m=p.convertCursorToDomRange(c,e),r=h.getParagraphElements(m);f(p,m,l);m.detach();p.getOdfCanvas().refreshCSS();p.fixCursorPositions();r.forEach(function(d){p.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:d,memberId:g,timeStamp:b})});p.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"ApplyDirectStyling",memberid:g,timestamp:b,position:c,length:e,setProperties:l}}};
// Input 56
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpApplyHyperlink=function(){function f(b){for(;b;){if(q.isHyperlink(b))return!0;b=b.parentNode}return!1}var g,b,c,e,l,h=new core.DomUtils,q=new odf.OdfUtils;this.init=function(f){g=f.memberid;b=f.timestamp;c=f.position;e=f.length;l=f.hyperlink};this.isEdit=!0;this.group=void 0;this.execute=function(p){var m=p.getDOMDocument(),r=p.convertCursorToDomRange(c,e),d=h.splitBoundaries(r),a=[],n=q.getTextNodes(r,!1);if(0===n.length)return!1;n.forEach(function(b){var d=q.getParagraphElement(b);runtime.assert(!1===
f(b),"The given range should not contain any link.");var c=l,e=m.createElementNS(odf.Namespaces.textns,"text:a");e.setAttributeNS(odf.Namespaces.xlinkns,"xlink:type","simple");e.setAttributeNS(odf.Namespaces.xlinkns,"xlink:href",c);b.parentNode.insertBefore(e,b);e.appendChild(b);-1===a.indexOf(d)&&a.push(d)});d.forEach(h.normalizeTextNodes);r.detach();p.getOdfCanvas().refreshSize();p.getOdfCanvas().rerenderAnnotations();a.forEach(function(a){p.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,
memberId:g,timeStamp:b})});return!0};this.spec=function(){return{optype:"ApplyHyperlink",memberid:g,timestamp:b,position:c,length:e,hyperlink:l}}};
// Input 57
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpInsertImage=function(){var f,g,b,c,e,l,h,q,p=odf.Namespaces.drawns,m=odf.Namespaces.svgns,r=odf.Namespaces.textns,d=odf.Namespaces.xlinkns;this.init=function(a){f=a.memberid;g=a.timestamp;b=a.position;c=a.filename;e=a.frameWidth;l=a.frameHeight;h=a.frameStyleName;q=a.frameName};this.isEdit=!0;this.group=void 0;this.execute=function(a){var n=a.getOdfCanvas(),k=a.getTextNodeAtStep(b,f),s,y;if(!k)return!1;s=k.textNode;y=a.getParagraphElement(s);var k=k.offset!==s.length?s.splitText(k.offset):s.nextSibling,
u=a.getDOMDocument(),z=u.createElementNS(p,"draw:image"),u=u.createElementNS(p,"draw:frame");z.setAttributeNS(d,"xlink:href",c);z.setAttributeNS(d,"xlink:type","simple");z.setAttributeNS(d,"xlink:show","embed");z.setAttributeNS(d,"xlink:actuate","onLoad");u.setAttributeNS(p,"draw:style-name",h);u.setAttributeNS(p,"draw:name",q);u.setAttributeNS(r,"text:anchor-type","as-char");u.setAttributeNS(m,"svg:width",e);u.setAttributeNS(m,"svg:height",l);u.appendChild(z);s.parentNode.insertBefore(u,k);a.emit(ops.OdtDocument.signalStepsInserted,
{position:b});0===s.length&&s.parentNode.removeChild(s);n.addCssForFrameWithImage(u);n.refreshCSS();a.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:y,memberId:f,timeStamp:g});n.rerenderAnnotations();return!0};this.spec=function(){return{optype:"InsertImage",memberid:f,timestamp:g,filename:c,position:b,frameWidth:e,frameHeight:l,frameStyleName:h,frameName:q}}};
// Input 58
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpInsertTable=function(){function f(b,d){var a;if(1===m.length)a=m[0];else if(3===m.length)switch(b){case 0:a=m[0];break;case c-1:a=m[2];break;default:a=m[1]}else a=m[b];if(1===a.length)return a[0];if(3===a.length)switch(d){case 0:return a[0];case e-1:return a[2];default:return a[1]}return a[d]}var g,b,c,e,l,h,q,p,m;this.init=function(f){g=f.memberid;b=f.timestamp;l=f.position;c=f.initialRows;e=f.initialColumns;h=f.tableName;q=f.tableStyleName;p=f.tableColumnStyleName;m=f.tableCellStyleMatrix};
this.isEdit=!0;this.group=void 0;this.execute=function(m){var d=m.getTextNodeAtStep(l),a=m.getRootNode();if(d){var n=m.getDOMDocument(),k=n.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table"),s=n.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-column"),y,u,z,x;q&&k.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",q);h&&k.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:name",h);s.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0",
"table:number-columns-repeated",e);p&&s.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",p);k.appendChild(s);for(z=0;z<c;z+=1){s=n.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-row");for(x=0;x<e;x+=1)y=n.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-cell"),(u=f(z,x))&&y.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",u),u=n.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0",
"text:p"),y.appendChild(u),s.appendChild(y);k.appendChild(s)}d=m.getParagraphElement(d.textNode);a.insertBefore(k,d.nextSibling);m.emit(ops.OdtDocument.signalStepsInserted,{position:l});m.getOdfCanvas().refreshSize();m.emit(ops.OdtDocument.signalTableAdded,{tableElement:k,memberId:g,timeStamp:b});m.getOdfCanvas().rerenderAnnotations();return!0}return!1};this.spec=function(){return{optype:"InsertTable",memberid:g,timestamp:b,position:l,initialRows:c,initialColumns:e,tableName:h,tableStyleName:q,tableColumnStyleName:p,
tableCellStyleMatrix:m}}};
// Input 59
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpInsertText=function(){var f,g,b,c,e,l=new odf.OdfUtils;this.init=function(h){f=h.memberid;g=h.timestamp;b=h.position;e=h.text;c="true"===h.moveCursor||!0===h.moveCursor};this.isEdit=!0;this.group=void 0;this.execute=function(h){var q,p,m,r=null,d=h.getDOMDocument(),a,n=0,k,s=h.getCursor(f),y;h.upgradeWhitespacesAtPosition(b);if(q=h.getTextNodeAtStep(b)){p=q.textNode;r=p.nextSibling;m=p.parentNode;a=h.getParagraphElement(p);for(y=0;y<e.length;y+=1)if("\t"===e[y]||"\t"!==e[y]&&l.isODFWhitespace(e[y])&&
(0===y||y===e.length-1||"\t"!==e[y-1]&&l.isODFWhitespace(e[y-1])))0===n?(q.offset!==p.length&&(r=p.splitText(q.offset)),0<y&&p.appendData(e.substring(0,y))):n<y&&(n=e.substring(n,y),m.insertBefore(d.createTextNode(n),r)),n=y+1,"\t"===e[y]?(k=d.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:tab"),k.appendChild(d.createTextNode("\t"))):(" "!==e[y]&&runtime.log("WARN: InsertText operation contains non-tab, non-space whitespace character (character code "+e.charCodeAt(y)+")"),
k=d.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:s"),k.appendChild(d.createTextNode(" "))),m.insertBefore(k,r);0===n?p.insertData(q.offset,e):n<e.length&&(q=e.substring(n),m.insertBefore(d.createTextNode(q),r));m=p.parentNode;r=p.nextSibling;m.removeChild(p);m.insertBefore(p,r);0===p.length&&p.parentNode.removeChild(p);h.emit(ops.OdtDocument.signalStepsInserted,{position:b});s&&c&&(h.moveCursor(f,b+e.length,0),h.emit(ops.Document.signalCursorMoved,s));h.downgradeWhitespacesAtPosition(b);
h.downgradeWhitespacesAtPosition(b+e.length);h.getOdfCanvas().refreshSize();h.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:f,timeStamp:g});h.getOdfCanvas().rerenderAnnotations();return!0}return!1};this.spec=function(){return{optype:"InsertText",memberid:f,timestamp:g,position:b,text:e,moveCursor:c}}};
// Input 60
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpMoveCursor=function(){var f,g,b,c,e;this.init=function(l){f=l.memberid;g=l.timestamp;b=l.position;c=l.length||0;e=l.selectionType||ops.OdtCursor.RangeSelection};this.isEdit=!1;this.group=void 0;this.execute=function(g){var h=g.getCursor(f),q;if(!h)return!1;q=g.convertCursorToDomRange(b,c);h.setSelectedRange(q,0<=c);h.setSelectionType(e);g.emit(ops.Document.signalCursorMoved,h);return!0};this.spec=function(){return{optype:"MoveCursor",memberid:f,timestamp:g,position:b,length:c,selectionType:e}}};
// Input 61
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveAnnotation=function(){var f,g,b,c,e;this.init=function(l){f=l.memberid;g=l.timestamp;b=parseInt(l.position,10);c=parseInt(l.length,10);e=new core.DomUtils};this.isEdit=!0;this.group=void 0;this.execute=function(c){function f(b){p.parentNode.insertBefore(b,p)}for(var g=c.getIteratorAtPosition(b).container(),p;g.namespaceURI!==odf.Namespaces.officens||"annotation"!==g.localName;)g=g.parentNode;if(null===g)return!1;p=g;g=p.annotationEndElement;c.getOdfCanvas().forgetAnnotations();e.getElementsByTagNameNS(p,
"urn:webodf:names:cursor","cursor").forEach(f);e.getElementsByTagNameNS(p,"urn:webodf:names:cursor","anchor").forEach(f);p.parentNode.removeChild(p);g&&g.parentNode.removeChild(g);c.emit(ops.OdtDocument.signalStepsRemoved,{position:0<b?b-1:b});c.fixCursorPositions();c.getOdfCanvas().refreshAnnotations();return!0};this.spec=function(){return{optype:"RemoveAnnotation",memberid:f,timestamp:g,position:b,length:c}}};
// Input 62
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveBlob=function(){var f,g,b;this.init=function(c){f=c.memberid;g=c.timestamp;b=c.filename};this.isEdit=!0;this.group=void 0;this.execute=function(c){c.getOdfCanvas().odfContainer().removeBlob(b);return!0};this.spec=function(){return{optype:"RemoveBlob",memberid:f,timestamp:g,filename:b}}};
// Input 63
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveCursor=function(){var f,g;this.init=function(b){f=b.memberid;g=b.timestamp};this.isEdit=!1;this.group=void 0;this.execute=function(b){return b.removeCursor(f)?!0:!1};this.spec=function(){return{optype:"RemoveCursor",memberid:f,timestamp:g}}};
// Input 64
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveHyperlink=function(){var f,g,b,c,e=new core.DomUtils,l=new odf.OdfUtils;this.init=function(e){f=e.memberid;g=e.timestamp;b=e.position;c=e.length};this.isEdit=!0;this.group=void 0;this.execute=function(h){var q=h.convertCursorToDomRange(b,c),p=l.getHyperlinkElements(q);runtime.assert(1===p.length,"The given range should only contain a single link.");p=e.mergeIntoParent(p[0]);q.detach();h.getOdfCanvas().refreshSize();h.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:l.getParagraphElement(p),
memberId:f,timeStamp:g});h.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"RemoveHyperlink",memberid:f,timestamp:g,position:b,length:c}}};
// Input 65
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveMember=function(){var f,g;this.init=function(b){f=b.memberid;g=parseInt(b.timestamp,10)};this.isEdit=!1;this.group=void 0;this.execute=function(b){if(!b.getMember(f))return!1;b.removeMember(f);b.emit(ops.Document.signalMemberRemoved,f);return!0};this.spec=function(){return{optype:"RemoveMember",memberid:f,timestamp:g}}};
// Input 66
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveStyle=function(){var f,g,b,c;this.init=function(e){f=e.memberid;g=e.timestamp;b=e.styleName;c=e.styleFamily};this.isEdit=!0;this.group=void 0;this.execute=function(e){var f=e.getStyleElement(b,c);if(!f)return!1;f.parentNode.removeChild(f);e.getOdfCanvas().refreshCSS();e.emit(ops.OdtDocument.signalCommonStyleDeleted,{name:b,family:c});return!0};this.spec=function(){return{optype:"RemoveStyle",memberid:f,timestamp:g,styleName:b,styleFamily:c}}};
// Input 67
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveText=function(){function f(b){function c(b){return l.isODFNode(b)||"br"===b.localName&&l.isLineBreak(b.parentNode)||b.nodeType===Node.TEXT_NODE&&l.isODFNode(b.parentNode)}function e(f){var d;f.nodeType===Node.TEXT_NODE?(d=f.parentNode,d.removeChild(f)):d=h.removeUnwantedNodes(f,c);return d&&!l.isParagraph(d)&&d!==b&&l.hasNoODFContent(d)?e(d):d}this.mergeChildrenIntoParent=e}var g,b,c,e,l,h;this.init=function(f){runtime.assert(0<=f.length,"OpRemoveText only supports positive lengths");
g=f.memberid;b=f.timestamp;c=parseInt(f.position,10);e=parseInt(f.length,10);l=new odf.OdfUtils;h=new core.DomUtils};this.isEdit=!0;this.group=void 0;this.execute=function(q){var p,m,r,d,a=q.getCursor(g),n=new f(q.getRootNode());q.upgradeWhitespacesAtPosition(c);q.upgradeWhitespacesAtPosition(c+e);m=q.convertCursorToDomRange(c,e);h.splitBoundaries(m);p=q.getParagraphElement(m.startContainer);r=l.getTextElements(m,!1,!0);d=l.getParagraphElements(m);m.detach();r.forEach(function(a){a.parentNode?n.mergeChildrenIntoParent(a):
runtime.log("WARN: text element has already been removed from it's container")});m=d.reduce(function(a,b){for(var d;b.firstChild;)d=b.firstChild,b.removeChild(d),"editinfo"!==d.localName&&a.appendChild(d);n.mergeChildrenIntoParent(b);return a});q.emit(ops.OdtDocument.signalStepsRemoved,{position:c});q.downgradeWhitespacesAtPosition(c);q.fixCursorPositions();q.getOdfCanvas().refreshSize();q.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:m||p,memberId:g,timeStamp:b});a&&(a.resetSelectionType(),
q.emit(ops.Document.signalCursorMoved,a));q.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"RemoveText",memberid:g,timestamp:b,position:c,length:e}}};
// Input 68
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpSetBlob=function(){var f,g,b,c,e;this.init=function(l){f=l.memberid;g=l.timestamp;b=l.filename;c=l.mimetype;e=l.content};this.isEdit=!0;this.group=void 0;this.execute=function(f){f.getOdfCanvas().odfContainer().setBlob(b,c,e);return!0};this.spec=function(){return{optype:"SetBlob",memberid:f,timestamp:g,filename:b,mimetype:c,content:e}}};
// Input 69
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpSetParagraphStyle=function(){var f,g,b,c;this.init=function(e){f=e.memberid;g=e.timestamp;b=e.position;c=e.styleName};this.isEdit=!0;this.group=void 0;this.execute=function(e){var l;l=e.getIteratorAtPosition(b);return(l=e.getParagraphElement(l.container()))?(""!==c?l.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:style-name",c):l.removeAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","style-name"),e.getOdfCanvas().refreshSize(),e.emit(ops.OdtDocument.signalParagraphChanged,
{paragraphElement:l,timeStamp:g,memberId:f}),e.getOdfCanvas().rerenderAnnotations(),!0):!1};this.spec=function(){return{optype:"SetParagraphStyle",memberid:f,timestamp:g,position:b,styleName:c}}};
// Input 70
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpSplitParagraph=function(){var f,g,b,c,e;this.init=function(l){f=l.memberid;g=l.timestamp;b=l.position;c="true"===l.moveCursor||!0===l.moveCursor;e=new odf.OdfUtils};this.isEdit=!0;this.group=void 0;this.execute=function(l){var h,q,p,m,r,d,a,n=l.getCursor(f);l.upgradeWhitespacesAtPosition(b);h=l.getTextNodeAtStep(b);if(!h)return!1;q=l.getParagraphElement(h.textNode);if(!q)return!1;p=e.isListItem(q.parentNode)?q.parentNode:q;0===h.offset?(a=h.textNode.previousSibling,d=null):(a=h.textNode,d=h.offset>=
h.textNode.length?null:h.textNode.splitText(h.offset));for(m=h.textNode;m!==p;){m=m.parentNode;r=m.cloneNode(!1);d&&r.appendChild(d);if(a)for(;a&&a.nextSibling;)r.appendChild(a.nextSibling);else for(;m.firstChild;)r.appendChild(m.firstChild);m.parentNode.insertBefore(r,m.nextSibling);a=m;d=r}e.isListItem(d)&&(d=d.childNodes.item(0));0===h.textNode.length&&h.textNode.parentNode.removeChild(h.textNode);l.emit(ops.OdtDocument.signalStepsInserted,{position:b});n&&c&&(l.moveCursor(f,b+1,0),l.emit(ops.Document.signalCursorMoved,
n));l.fixCursorPositions();l.getOdfCanvas().refreshSize();l.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:q,memberId:f,timeStamp:g});l.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:d,memberId:f,timeStamp:g});l.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"SplitParagraph",memberid:f,timestamp:g,position:b,moveCursor:c}}};
// Input 71
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpUpdateMember=function(){function f(b){var e="//dc:creator[@editinfo:memberid='"+g+"']";b=xmldom.XPath.getODFElementsWithXPath(b.getRootNode(),e,function(b){return"editinfo"===b?"urn:webodf:names:editinfo":odf.Namespaces.lookupNamespaceURI(b)});for(e=0;e<b.length;e+=1)b[e].textContent=c.fullName}var g,b,c,e;this.init=function(f){g=f.memberid;b=parseInt(f.timestamp,10);c=f.setProperties;e=f.removedProperties};this.isEdit=!1;this.group=void 0;this.execute=function(b){var h=b.getMember(g);if(!h)return!1;
e&&h.removeProperties(e);c&&(h.setProperties(c),c.fullName&&f(b));b.emit(ops.Document.signalMemberUpdated,h);return!0};this.spec=function(){return{optype:"UpdateMember",memberid:g,timestamp:b,setProperties:c,removedProperties:e}}};
// Input 72
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpUpdateMetadata=function(){var f,g,b,c;this.init=function(e){f=e.memberid;g=parseInt(e.timestamp,10);b=e.setProperties;c=e.removedProperties};this.isEdit=!0;this.group=void 0;this.execute=function(e){e=e.getOdfCanvas().odfContainer();var f=[];c&&(f=c.attributes.split(","));e.setMetadata(b,f);return!0};this.spec=function(){return{optype:"UpdateMetadata",memberid:f,timestamp:g,setProperties:b,removedProperties:c}}};
// Input 73
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpUpdateParagraphStyle=function(){function f(b,c){var e,f,d=c?c.split(","):[];for(e=0;e<d.length;e+=1)f=d[e].split(":"),b.removeAttributeNS(odf.Namespaces.lookupNamespaceURI(f[0]),f[1])}var g,b,c,e,l,h=odf.Namespaces.stylens;this.init=function(f){g=f.memberid;b=f.timestamp;c=f.styleName;e=f.setProperties;l=f.removedProperties};this.isEdit=!0;this.group=void 0;this.execute=function(b){var g=b.getFormatting(),m,r,d;return(m=""!==c?b.getParagraphStyleElement(c):g.getDefaultStyleElement("paragraph"))?
(r=m.getElementsByTagNameNS(h,"paragraph-properties").item(0),d=m.getElementsByTagNameNS(h,"text-properties").item(0),e&&g.updateStyle(m,e),l&&(g=l["style:paragraph-properties"],r&&g&&(f(r,g.attributes),0===r.attributes.length&&m.removeChild(r)),g=l["style:text-properties"],d&&g&&(f(d,g.attributes),0===d.attributes.length&&m.removeChild(d)),f(m,l.attributes)),b.getOdfCanvas().refreshCSS(),b.emit(ops.OdtDocument.signalParagraphStyleModified,c),b.getOdfCanvas().rerenderAnnotations(),!0):!1};this.spec=
function(){return{optype:"UpdateParagraphStyle",memberid:g,timestamp:b,styleName:c,setProperties:e,removedProperties:l}}};
// Input 74
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationFactory=function(){function f(b){return function(c){return new b}}var g;this.register=function(b,c){g[b]=c};this.create=function(b){var c=null,e=g[b.optype];e&&(c=e(b),c.init(b));return c};g={AddMember:f(ops.OpAddMember),UpdateMember:f(ops.OpUpdateMember),RemoveMember:f(ops.OpRemoveMember),AddCursor:f(ops.OpAddCursor),ApplyDirectStyling:f(ops.OpApplyDirectStyling),SetBlob:f(ops.OpSetBlob),RemoveBlob:f(ops.OpRemoveBlob),InsertImage:f(ops.OpInsertImage),InsertTable:f(ops.OpInsertTable),
InsertText:f(ops.OpInsertText),RemoveText:f(ops.OpRemoveText),SplitParagraph:f(ops.OpSplitParagraph),SetParagraphStyle:f(ops.OpSetParagraphStyle),UpdateParagraphStyle:f(ops.OpUpdateParagraphStyle),AddStyle:f(ops.OpAddStyle),RemoveStyle:f(ops.OpRemoveStyle),MoveCursor:f(ops.OpMoveCursor),RemoveCursor:f(ops.OpRemoveCursor),AddAnnotation:f(ops.OpAddAnnotation),RemoveAnnotation:f(ops.OpRemoveAnnotation),UpdateMetadata:f(ops.OpUpdateMetadata),ApplyHyperlink:f(ops.OpApplyHyperlink),RemoveHyperlink:f(ops.OpRemoveHyperlink)}};
// Input 75
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationRouter=function(){};ops.OperationRouter.prototype.setOperationFactory=function(f){};ops.OperationRouter.prototype.setPlaybackFunction=function(f){};ops.OperationRouter.prototype.push=function(f){};ops.OperationRouter.prototype.close=function(f){};ops.OperationRouter.prototype.subscribe=function(f,g){};ops.OperationRouter.prototype.unsubscribe=function(f,g){};ops.OperationRouter.prototype.hasLocalUnsyncedOps=function(){};ops.OperationRouter.prototype.hasSessionHostConnection=function(){};
ops.OperationRouter.signalProcessingBatchStart="router/batchstart";ops.OperationRouter.signalProcessingBatchEnd="router/batchend";
// Input 76
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.TrivialOperationRouter=function(){var f=new core.EventNotifier([ops.OperationRouter.signalProcessingBatchStart,ops.OperationRouter.signalProcessingBatchEnd]),g,b,c=0;this.setOperationFactory=function(b){g=b};this.setPlaybackFunction=function(c){b=c};this.push=function(e){c+=1;f.emit(ops.OperationRouter.signalProcessingBatchStart,{});e.forEach(function(e){e=e.spec();e.timestamp=Date.now();e=g.create(e);e.group="g"+c;b(e)});f.emit(ops.OperationRouter.signalProcessingBatchEnd,{})};this.close=function(b){b()};
this.subscribe=function(b,c){f.subscribe(b,c)};this.unsubscribe=function(b,c){f.unsubscribe(b,c)};this.hasLocalUnsyncedOps=function(){return!1};this.hasSessionHostConnection=function(){return!0}};
// Input 77
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Session=function(f){function g(b){e.emit(ops.OdtDocument.signalProcessingBatchStart,b)}function b(b){e.emit(ops.OdtDocument.signalProcessingBatchEnd,b)}var c=new ops.OperationFactory,e=new ops.OdtDocument(f),l=null;this.setOperationFactory=function(b){c=b;l&&l.setOperationFactory(c)};this.setOperationRouter=function(f){l&&(l.unsubscribe(ops.OperationRouter.signalProcessingBatchStart,g),l.unsubscribe(ops.OperationRouter.signalProcessingBatchEnd,b));l=f;l.subscribe(ops.OperationRouter.signalProcessingBatchStart,
g);l.subscribe(ops.OperationRouter.signalProcessingBatchEnd,b);f.setPlaybackFunction(function(b){e.emit(ops.OdtDocument.signalOperationStart,b);return b.execute(e)?(e.emit(ops.OdtDocument.signalOperationEnd,b),!0):!1});f.setOperationFactory(c)};this.getOperationFactory=function(){return c};this.getOdtDocument=function(){return e};this.enqueue=function(b){l.push(b)};this.close=function(b){l.close(function(c){c?b(c):e.close(b)})};this.destroy=function(b){e.destroy(b)};this.setOperationRouter(new ops.TrivialOperationRouter)};
// Input 78
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.AnnotationController=function(f,g){function b(){var b=h.getCursor(g),b=b&&b.getNode(),d=!1;if(b){a:{for(d=h.getRootNode();b&&b!==d;){if(b.namespaceURI===m&&"annotation"===b.localName){b=!0;break a}b=b.parentNode}b=!1}d=!b}d!==q&&(q=d,p.emit(gui.AnnotationController.annotatableChanged,q))}function c(c){c.getMemberId()===g&&b()}function e(c){c===g&&b()}function l(c){c.getMemberId()===g&&b()}var h=f.getOdtDocument(),q=!1,p=new core.EventNotifier([gui.AnnotationController.annotatableChanged]),m=odf.Namespaces.officens;
this.isAnnotatable=function(){return q};this.addAnnotation=function(){var b=new ops.OpAddAnnotation,d=h.getCursorSelection(g),a=d.length,d=d.position;q&&(d=0<=a?d:d+a,a=Math.abs(a),b.init({memberid:g,position:d,length:a,name:g+Date.now()}),f.enqueue([b]))};this.removeAnnotation=function(b){var d,a;d=h.convertDomPointToCursorStep(b,0)+1;a=h.convertDomPointToCursorStep(b,b.childNodes.length);b=new ops.OpRemoveAnnotation;b.init({memberid:g,position:d,length:a-d});a=new ops.OpMoveCursor;a.init({memberid:g,
position:0<d?d-1:d,length:0});f.enqueue([b,a])};this.subscribe=function(b,d){p.subscribe(b,d)};this.unsubscribe=function(b,d){p.unsubscribe(b,d)};this.destroy=function(b){h.unsubscribe(ops.Document.signalCursorAdded,c);h.unsubscribe(ops.Document.signalCursorRemoved,e);h.unsubscribe(ops.Document.signalCursorMoved,l);b()};h.subscribe(ops.Document.signalCursorAdded,c);h.subscribe(ops.Document.signalCursorRemoved,e);h.subscribe(ops.Document.signalCursorMoved,l);b()};
gui.AnnotationController.annotatableChanged="annotatable/changed";
// Input 79
gui.Avatar=function(f,g){var b=this,c,e,l;this.setColor=function(b){e.style.borderColor=b};this.setImageUrl=function(c){b.isVisible()?e.src=c:l=c};this.isVisible=function(){return"block"===c.style.display};this.show=function(){l&&(e.src=l,l=void 0);c.style.display="block"};this.hide=function(){c.style.display="none"};this.markAsFocussed=function(b){b?c.classList.add("active"):c.classList.remove("active")};this.destroy=function(b){f.removeChild(c);b()};(function(){var b=f.ownerDocument,l=b.documentElement.namespaceURI;
c=b.createElementNS(l,"div");e=b.createElementNS(l,"img");e.width=64;e.height=64;c.appendChild(e);c.style.width="64px";c.style.height="70px";c.style.position="absolute";c.style.top="-80px";c.style.left="-34px";c.style.display=g?"block":"none";c.className="handle";f.appendChild(c)})()};
// Input 80
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.GuiStepUtils=function(){var f=new odf.OdfUtils,g=new odf.StepUtils,b=new core.DomUtils;this.getContentRect=function(c){c=g.getContentBounds(c);var e,l=null;if(c)if(c.container.nodeType===Node.TEXT_NODE)e=c.container.ownerDocument.createRange(),e.setStart(c.container,c.startOffset),e.setEnd(c.container,c.endOffset),(l=0<e.getClientRects().length?e.getBoundingClientRect():null)&&" "===c.container.data.substring(c.startOffset,c.endOffset)&&1>=l.width&&(l=null),e.detach();else if(f.isCharacterElement(c.container)||
f.isCharacterFrame(c.container))l=b.getBoundingClientRect(c.container);return l}};
// Input 81
gui.Caret=function(f,g,b){function c(){m.style.opacity="0"===m.style.opacity?"1":"0";x.trigger()}function e(){n.selectNodeContents(a);return n.getBoundingClientRect()}function l(){Object.keys(B).forEach(function(a){G[a]=B[a]})}function h(){var a,c,g,h;if(!1===B.isShown||f.getSelectionType()!==ops.OdtCursor.RangeSelection||!b&&!f.getSelectedRange().collapsed)B.visibility="hidden",m.style.visibility="hidden",x.cancel();else{B.visibility="visible";m.style.visibility="visible";if(!1===B.isFocused)m.style.opacity=
"1",x.cancel();else{if(w||G.visibility!==B.visibility)m.style.opacity="1",x.cancel();x.trigger()}if(D||t||G.visibility!==B.visibility){a=f.getNode();var n;g=s.getBoundingClientRect(k.getSizer());h=!1;if(0<a.getClientRects().length)n=e(),h=!0;else if(u.setPosition(a,0),n=y.getContentRect(u),!n&&u.nextStep()&&(c=y.getContentRect(u))&&(n=c,h=!0),n||(a.setAttributeNS("urn:webodf:names:cursor","caret-sizer-active","true"),n=e(),h=!0),!n)for(runtime.log("WARN: No suitable client rectangle found for visual caret for "+
f.getMemberId());a;){if(0<a.getClientRects().length){n=s.getBoundingClientRect(a);h=!0;break}a=a.parentNode}n=s.translateRect(n,g,k.getZoomLevel());a={top:n.top,height:n.height,right:h?n.left:n.right};8>a.height&&(a={top:a.top-(8-a.height)/2,height:8,right:a.right});p.style.height=a.height+"px";p.style.top=a.top+"px";p.style.left=a.right+"px";d&&(a=runtime.getWindow().getComputedStyle(m,null),a.font?d.style.font=a.font:(d.style.fontStyle=a.fontStyle,d.style.fontVariant=a.fontVariant,d.style.fontWeight=
a.fontWeight,d.style.fontSize=a.fontSize,d.style.lineHeight=a.lineHeight,d.style.fontFamily=a.fontFamily))}if(t){n=f.getDocument().getCanvas().getElement().parentNode;var q;g=n.offsetWidth-n.clientWidth+5;h=n.offsetHeight-n.clientHeight+5;q=m.getBoundingClientRect();a=q.left-g;c=q.top-h;g=q.right+g;h=q.bottom+h;q=n.getBoundingClientRect();c<q.top?n.scrollTop-=q.top-c:h>q.bottom&&(n.scrollTop+=h-q.bottom);a<q.left?n.scrollLeft-=q.left-a:g>q.right&&(n.scrollLeft+=g-q.right)}}G.isFocused!==B.isFocused&&
r.markAsFocussed(B.isFocused);l();D=t=w=!1}function q(b){p.parentNode.removeChild(p);a.parentNode.removeChild(a);b()}var p,m,r,d,a,n,k=f.getDocument().getCanvas(),s=new core.DomUtils,y=new gui.GuiStepUtils,u,z,x,w=!1,t=!1,D=!1,B={isFocused:!1,isShown:!0,visibility:"hidden"},G={isFocused:!B.isFocused,isShown:!B.isShown,visibility:"hidden"};this.handleUpdate=function(){D=!0;"hidden"!==B.visibility&&(B.visibility="hidden",m.style.visibility="hidden",f.getNode().removeAttributeNS("urn:webodf:names:cursor",
"caret-sizer-active"));z.trigger()};this.refreshCursorBlinking=function(){w=!0;z.trigger()};this.setFocus=function(){B.isFocused=!0;z.trigger()};this.removeFocus=function(){B.isFocused=!1;z.trigger()};this.show=function(){B.isShown=!0;z.trigger()};this.hide=function(){B.isShown=!1;z.trigger()};this.setAvatarImageUrl=function(a){r.setImageUrl(a)};this.setColor=function(a){m.style.borderColor=a;r.setColor(a)};this.getCursor=function(){return f};this.getFocusElement=function(){return m};this.toggleHandleVisibility=
function(){r.isVisible()?r.hide():r.show()};this.showHandle=function(){r.show()};this.hideHandle=function(){r.hide()};this.setOverlayElement=function(a){d=a;p.appendChild(a);D=!0;z.trigger()};this.ensureVisible=function(){t=!0;z.trigger()};this.destroy=function(a){core.Async.destroyAll([z.destroy,x.destroy,r.destroy,q],a)};(function(){var b=f.getDocument(),d=[b.createRootFilter(f.getMemberId()),b.getPositionFilter()],e=b.getDOMDocument();n=e.createRange();a=e.createElement("span");a.className="webodf-caretSizer";
a.textContent="|";f.getNode().appendChild(a);p=e.createElement("div");p.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",f.getMemberId());p.className="webodf-caretOverlay";m=e.createElement("div");m.className="caret";p.appendChild(m);r=new gui.Avatar(p,g);k.getSizer().appendChild(p);u=b.createStepIterator(f.getNode(),0,d,b.getRootNode());z=core.Task.createRedrawTask(h);x=core.Task.createTimeoutTask(c,500);z.triggerImmediate()})()};
// Input 82
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.TextSerializer=function(){function f(c){var e="",l=g.filter?g.filter.acceptNode(c):NodeFilter.FILTER_ACCEPT,h=c.nodeType,q;if((l===NodeFilter.FILTER_ACCEPT||l===NodeFilter.FILTER_SKIP)&&b.isTextContentContainingNode(c))for(q=c.firstChild;q;)e+=f(q),q=q.nextSibling;l===NodeFilter.FILTER_ACCEPT&&(h===Node.ELEMENT_NODE&&b.isParagraph(c)?e+="\n":h===Node.TEXT_NODE&&c.textContent&&(e+=c.textContent));return e}var g=this,b=new odf.OdfUtils;this.filter=null;this.writeToString=function(b){if(!b)return"";
b=f(b);"\n"===b[b.length-1]&&(b=b.substr(0,b.length-1));return b}};
// Input 83
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.MimeDataExporter=function(){var f,g;this.exportRangeToDataTransfer=function(b,c){var e;e=c.startContainer.ownerDocument.createElement("span");e.appendChild(c.cloneContents());e=f.writeToString(e);try{b.setData("text/plain",e)}catch(g){b.setData("Text",e)}};f=new odf.TextSerializer;g=new odf.OdfNodeFilter;f.filter=g};
// Input 84
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.Clipboard=function(f){this.setDataFromRange=function(g,b){var c,e=g.clipboardData;c=runtime.getWindow();!e&&c&&(e=c.clipboardData);e?(c=!0,f.exportRangeToDataTransfer(e,b),g.preventDefault()):c=!1;return c}};
// Input 85
/*

 Copyright (C) 2012-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.StyleSummary=function(f){function g(b,c){var g=b+"|"+c,p;e.hasOwnProperty(g)||(p=[],f.forEach(function(e){e=(e=e[b])&&e[c];-1===p.indexOf(e)&&p.push(e)}),e[g]=p);return e[g]}function b(b,c,e){return function(){var f=g(b,c);return e.length>=f.length&&f.every(function(b){return-1!==e.indexOf(b)})}}function c(b,c){var e=g(b,c);return 1===e.length?e[0]:void 0}var e={};this.getPropertyValues=g;this.getCommonValue=c;this.isBold=b("style:text-properties","fo:font-weight",["bold"]);this.isItalic=b("style:text-properties",
"fo:font-style",["italic"]);this.hasUnderline=b("style:text-properties","style:text-underline-style",["solid"]);this.hasStrikeThrough=b("style:text-properties","style:text-line-through-style",["solid"]);this.fontSize=function(){var b=c("style:text-properties","fo:font-size");return b&&parseFloat(b)};this.fontName=function(){return c("style:text-properties","style:font-name")};this.isAlignedLeft=b("style:paragraph-properties","fo:text-align",["left","start"]);this.isAlignedCenter=b("style:paragraph-properties",
"fo:text-align",["center"]);this.isAlignedRight=b("style:paragraph-properties","fo:text-align",["right","end"]);this.isAlignedJustified=b("style:paragraph-properties","fo:text-align",["justify"]);this.text={isBold:this.isBold,isItalic:this.isItalic,hasUnderline:this.hasUnderline,hasStrikeThrough:this.hasStrikeThrough,fontSize:this.fontSize,fontName:this.fontName};this.paragraph={isAlignedLeft:this.isAlignedLeft,isAlignedCenter:this.isAlignedCenter,isAlignedRight:this.isAlignedRight,isAlignedJustified:this.isAlignedJustified}};
// Input 86
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.DirectFormattingController=function(f,g,b,c){function e(a){var b;a.collapsed?(b=a.startContainer,b.hasChildNodes()&&a.startOffset<b.childNodes.length&&(b=b.childNodes.item(a.startOffset)),a=[b]):a=P.getTextNodes(a,!0);return a}function l(a,b){var d={};Object.keys(a).forEach(function(c){var e=a[c](),f=b[c]();e!==f&&(d[c]=f)});return d}function h(){var a,b,d;a=(a=(a=C.getCursor(g))&&a.getSelectedRange())?e(a):[];a=C.getFormatting().getAppliedStyles(a);a[0]&&O&&(a[0]=S.mergeObjects(a[0],O));J=a;
d=new gui.StyleSummary(J);a=l(U.text,d.text);b=l(U.paragraph,d.paragraph);U=d;0<Object.keys(a).length&&W.emit(gui.DirectFormattingController.textStylingChanged,a);0<Object.keys(b).length&&W.emit(gui.DirectFormattingController.paragraphStylingChanged,b)}function q(a){("string"===typeof a?a:a.getMemberId())===g&&h()}function p(){h()}function m(a){var b=C.getCursor(g);a=a.paragraphElement;b&&C.getParagraphElement(b.getNode())===a&&h()}function r(a,b){b(!a());return!0}function d(a){var b=C.getCursorSelection(g),
d={"style:text-properties":a};0!==b.length?(a=new ops.OpApplyDirectStyling,a.init({memberid:g,position:b.position,length:b.length,setProperties:d}),f.enqueue([a])):(O=S.mergeObjects(O||{},d),h())}function a(a,b){var c={};c[a]=b;d(c)}function n(a){a=a.spec();O&&a.memberid===g&&"SplitParagraph"!==a.optype&&(O=null,h())}function k(b){a("fo:font-weight",b?"bold":"normal")}function s(b){a("fo:font-style",b?"italic":"normal")}function y(b){a("style:text-underline-style",b?"solid":"none")}function u(b){a("style:text-line-through-style",
b?"solid":"none")}function z(a){return a===ops.OdtStepsTranslator.NEXT_STEP}function x(a){var d=C.getCursor(g).getSelectedRange(),d=P.getParagraphElements(d),c=C.getFormatting(),e=[],h={},k;d.forEach(function(d){var f=C.convertDomPointToCursorStep(d,0,z),l=d.getAttributeNS(odf.Namespaces.textns,"style-name"),n;d=l?h.hasOwnProperty(l)?h[l]:void 0:k;d||(d=b.generateStyleName(),l?(h[l]=d,n=c.createDerivedStyleObject(l,"paragraph",{})):(k=d,n={}),n=a(n),l=new ops.OpAddStyle,l.init({memberid:g,styleName:d.toString(),
styleFamily:"paragraph",isAutomaticStyle:!0,setProperties:n}),e.push(l));l=new ops.OpSetParagraphStyle;l.init({memberid:g,styleName:d.toString(),position:f});e.push(l)});f.enqueue(e)}function w(a){x(function(b){return S.mergeObjects(b,a)})}function t(a){w({"style:paragraph-properties":{"fo:text-align":a}})}function D(a,b){var d=C.getFormatting().getDefaultTabStopDistance(),c=b["style:paragraph-properties"],e;c&&(c=c["fo:margin-left"],e=P.parseLength(c));return S.mergeObjects(b,{"style:paragraph-properties":{"fo:margin-left":e&&
e.unit===d.unit?e.value+a*d.value+e.unit:a*d.value+d.unit}})}function B(a,b){var d=e(a),c=C.getFormatting().getAppliedStyles(d)[0],f=C.getFormatting().getAppliedStylesForElement(b);if(!c||"text"!==c["style:family"]||!c["style:text-properties"])return!1;if(!f||!f["style:text-properties"])return!0;c=c["style:text-properties"];f=f["style:text-properties"];return!Object.keys(c).every(function(a){return c[a]===f[a]})}function G(){}var L=this,C=f.getOdtDocument(),S=new core.Utils,P=new odf.OdfUtils,W=new core.EventNotifier([gui.DirectFormattingController.textStylingChanged,
gui.DirectFormattingController.paragraphStylingChanged]),I=odf.Namespaces.textns,da=core.PositionFilter.FilterResult.FILTER_ACCEPT,O,J=[],U=new gui.StyleSummary(J);this.formatTextSelection=d;this.createCursorStyleOp=function(a,b,d){var c=null;(d=d?J[0]:O)&&d["style:text-properties"]&&(c=new ops.OpApplyDirectStyling,c.init({memberid:g,position:a,length:b,setProperties:{"style:text-properties":d["style:text-properties"]}}),O=null,h());return c};this.setBold=k;this.setItalic=s;this.setHasUnderline=y;
this.setHasStrikethrough=u;this.setFontSize=function(b){a("fo:font-size",b+"pt")};this.setFontName=function(b){a("style:font-name",b)};this.getAppliedStyles=function(){return J};this.toggleBold=r.bind(L,function(){return U.isBold()},k);this.toggleItalic=r.bind(L,function(){return U.isItalic()},s);this.toggleUnderline=r.bind(L,function(){return U.hasUnderline()},y);this.toggleStrikethrough=r.bind(L,function(){return U.hasStrikeThrough()},u);this.isBold=function(){return U.isBold()};this.isItalic=function(){return U.isItalic()};
this.hasUnderline=function(){return U.hasUnderline()};this.hasStrikeThrough=function(){return U.hasStrikeThrough()};this.fontSize=function(){return U.fontSize()};this.fontName=function(){return U.fontName()};this.isAlignedLeft=function(){return U.isAlignedLeft()};this.isAlignedCenter=function(){return U.isAlignedCenter()};this.isAlignedRight=function(){return U.isAlignedRight()};this.isAlignedJustified=function(){return U.isAlignedJustified()};this.alignParagraphLeft=function(){t("left");return!0};
this.alignParagraphCenter=function(){t("center");return!0};this.alignParagraphRight=function(){t("right");return!0};this.alignParagraphJustified=function(){t("justify");return!0};this.indent=function(){x(D.bind(null,1));return!0};this.outdent=function(){x(D.bind(null,-1));return!0};this.createParagraphStyleOps=function(a){var d=C.getCursor(g),c=d.getSelectedRange(),e=[],f,h;d.hasForwardSelection()?(f=d.getAnchorNode(),h=d.getNode()):(f=d.getNode(),h=d.getAnchorNode());d=C.getParagraphElement(h);runtime.assert(Boolean(d),
"DirectFormattingController: Cursor outside paragraph");var k;a:{k=d;var l=gui.SelectionMover.createPositionIterator(k),n=new core.PositionFilterChain;n.addFilter(C.getPositionFilter());n.addFilter(C.createRootFilter(g));for(l.setUnfilteredPosition(c.endContainer,c.endOffset);l.nextPosition();)if(n.acceptPosition(l)===da){k=C.getParagraphElement(l.getCurrentNode())!==k;break a}k=!0}if(!k)return e;h!==f&&(d=C.getParagraphElement(f));if(!O&&!B(c,d))return e;c=J[0];if(!c)return e;if(f=d.getAttributeNS(I,
"style-name"))c={"style:text-properties":c["style:text-properties"]},c=C.getFormatting().createDerivedStyleObject(f,"paragraph",c);d=b.generateStyleName();f=new ops.OpAddStyle;f.init({memberid:g,styleName:d,styleFamily:"paragraph",isAutomaticStyle:!0,setProperties:c});e.push(f);f=new ops.OpSetParagraphStyle;f.init({memberid:g,styleName:d,position:a});e.push(f);return e};this.subscribe=function(a,b){W.subscribe(a,b)};this.unsubscribe=function(a,b){W.unsubscribe(a,b)};this.destroy=function(a){C.unsubscribe(ops.Document.signalCursorAdded,
q);C.unsubscribe(ops.Document.signalCursorRemoved,q);C.unsubscribe(ops.Document.signalCursorMoved,q);C.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,p);C.unsubscribe(ops.OdtDocument.signalParagraphChanged,m);C.unsubscribe(ops.OdtDocument.signalOperationEnd,n);a()};(function(){C.subscribe(ops.Document.signalCursorAdded,q);C.subscribe(ops.Document.signalCursorRemoved,q);C.subscribe(ops.Document.signalCursorMoved,q);C.subscribe(ops.OdtDocument.signalParagraphStyleModified,p);C.subscribe(ops.OdtDocument.signalParagraphChanged,
m);C.subscribe(ops.OdtDocument.signalOperationEnd,n);h();c||(L.alignParagraphCenter=G,L.alignParagraphJustified=G,L.alignParagraphLeft=G,L.alignParagraphRight=G,L.createParagraphStyleOps=function(){return[]},L.indent=G,L.outdent=G)})()};gui.DirectFormattingController.textStylingChanged="textStyling/changed";gui.DirectFormattingController.paragraphStylingChanged="paragraphStyling/changed";
// Input 87
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.KeyboardHandler=function(){function f(b,c){c||(c=g.None);switch(b){case gui.KeyboardHandler.KeyCode.LeftMeta:case gui.KeyboardHandler.KeyCode.RightMeta:case gui.KeyboardHandler.KeyCode.MetaInMozilla:c|=g.Meta;break;case gui.KeyboardHandler.KeyCode.Ctrl:c|=g.Ctrl;break;case gui.KeyboardHandler.KeyCode.Alt:c|=g.Alt;break;case gui.KeyboardHandler.KeyCode.Shift:c|=g.Shift}return b+":"+c}var g=gui.KeyboardHandler.Modifier,b=null,c={};this.setDefault=function(c){b=c};this.bind=function(b,g,h,q){b=f(b,
g);runtime.assert(q||!1===c.hasOwnProperty(b),"tried to overwrite the callback handler of key combo: "+b);c[b]=h};this.unbind=function(b,g){var h=f(b,g);delete c[h]};this.reset=function(){b=null;c={}};this.handleEvent=function(e){var l=e.keyCode,h=g.None;e.metaKey&&(h|=g.Meta);e.ctrlKey&&(h|=g.Ctrl);e.altKey&&(h|=g.Alt);e.shiftKey&&(h|=g.Shift);l=f(l,h);l=c[l];h=!1;l?h=l():null!==b&&(h=b(e));h&&(e.preventDefault?e.preventDefault():e.returnValue=!1)}};
gui.KeyboardHandler.Modifier={None:0,Meta:1,Ctrl:2,Alt:4,CtrlAlt:6,Shift:8,MetaShift:9,CtrlShift:10,AltShift:12};gui.KeyboardHandler.KeyCode={Backspace:8,Tab:9,Clear:12,Enter:13,Shift:16,Ctrl:17,Alt:18,End:35,Home:36,Left:37,Up:38,Right:39,Down:40,Delete:46,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,LeftMeta:91,RightMeta:93,MetaInMozilla:224};
// Input 88
gui.HyperlinkClickHandler=function(f,g,b){function c(){var a=f();runtime.assert(Boolean(a.classList),"Document container has no classList element");a.classList.remove("webodf-inactiveLinks")}function e(){var a=f();runtime.assert(Boolean(a.classList),"Document container has no classList element");a.classList.add("webodf-inactiveLinks")}function l(){d.removeEventListener("focus",e,!1);n.forEach(function(a){g.unbind(a.keyCode,a.modifier);b.unbind(a.keyCode,a.modifier)});n.length=0}function h(a){l();
if(a!==q.None){d.addEventListener("focus",e,!1);switch(a){case q.Ctrl:n.push({keyCode:p.Ctrl,modifier:q.None});break;case q.Meta:n.push({keyCode:p.LeftMeta,modifier:q.None}),n.push({keyCode:p.RightMeta,modifier:q.None}),n.push({keyCode:p.MetaInMozilla,modifier:q.None})}n.forEach(function(a){g.bind(a.keyCode,a.modifier,c);b.bind(a.keyCode,a.modifier,e)})}}var q=gui.KeyboardHandler.Modifier,p=gui.KeyboardHandler.KeyCode,m=xmldom.XPath,r=new odf.OdfUtils,d=runtime.getWindow(),a=q.None,n=[];runtime.assert(null!==
d,"Expected to be run in an environment which has a global window, like a browser.");this.handleClick=function(b){var c=b.target||b.srcElement,e,g;b.ctrlKey?e=q.Ctrl:b.metaKey&&(e=q.Meta);if(a===q.None||a===e){a:{for(;null!==c;){if(r.isHyperlink(c))break a;if(r.isParagraph(c))break;c=c.parentNode}c=null}c&&(c=r.getHyperlinkTarget(c),""!==c&&("#"===c[0]?(c=c.substring(1),e=f(),g=m.getODFElementsWithXPath(e,"//text:bookmark-start[@text:name='"+c+"']",odf.Namespaces.lookupNamespaceURI),0===g.length&&
(g=m.getODFElementsWithXPath(e,"//text:bookmark[@text:name='"+c+"']",odf.Namespaces.lookupNamespaceURI)),0<g.length&&g[0].scrollIntoView(!0)):d.open(c),b.preventDefault?b.preventDefault():b.returnValue=!1))}};this.setModifier=function(b){a!==b&&(runtime.assert(b===q.None||b===q.Ctrl||b===q.Meta,"Unsupported KeyboardHandler.Modifier value: "+b),a=b,a!==q.None?e():c(),h(a))};this.getModifier=function(){return a};this.destroy=function(a){e();l();a()}};
// Input 89
gui.HyperlinkController=function(f,g){var b=new odf.OdfUtils,c=f.getOdtDocument();this.addHyperlink=function(b,l){var h=c.getCursorSelection(g),q=new ops.OpApplyHyperlink,p=[];if(0===h.length||l)l=l||b,q=new ops.OpInsertText,q.init({memberid:g,position:h.position,text:l}),h.length=l.length,p.push(q);q=new ops.OpApplyHyperlink;q.init({memberid:g,position:h.position,length:h.length,hyperlink:b});p.push(q);f.enqueue(p)};this.removeHyperlinks=function(){var e=gui.SelectionMover.createPositionIterator(c.getRootNode()),
l=c.getCursor(g).getSelectedRange(),h=b.getHyperlinkElements(l),q=l.collapsed&&1===h.length,p=c.getDOMDocument().createRange(),m=[],r,d;0!==h.length&&(h.forEach(function(a){p.selectNodeContents(a);r=c.convertDomToCursorRange({anchorNode:p.startContainer,anchorOffset:p.startOffset,focusNode:p.endContainer,focusOffset:p.endOffset});d=new ops.OpRemoveHyperlink;d.init({memberid:g,position:r.position,length:r.length});m.push(d)}),q||(q=h[0],-1===l.comparePoint(q,0)&&(p.setStart(q,0),p.setEnd(l.startContainer,
l.startOffset),r=c.convertDomToCursorRange({anchorNode:p.startContainer,anchorOffset:p.startOffset,focusNode:p.endContainer,focusOffset:p.endOffset}),0<r.length&&(d=new ops.OpApplyHyperlink,d.init({memberid:g,position:r.position,length:r.length,hyperlink:b.getHyperlinkTarget(q)}),m.push(d))),h=h[h.length-1],e.moveToEndOfNode(h),e=e.unfilteredDomOffset(),1===l.comparePoint(h,e)&&(p.setStart(l.endContainer,l.endOffset),p.setEnd(h,e),r=c.convertDomToCursorRange({anchorNode:p.startContainer,anchorOffset:p.startOffset,
focusNode:p.endContainer,focusOffset:p.endOffset}),0<r.length&&(d=new ops.OpApplyHyperlink,d.init({memberid:g,position:r.position,length:r.length,hyperlink:b.getHyperlinkTarget(h)}),m.push(d)))),f.enqueue(m),p.detach())}};
// Input 90
gui.EventManager=function(f){function g(a){function b(a,d,c){var e,f=!1;e="on"+d;a.attachEvent&&(a.attachEvent(e,c),f=!0);!f&&a.addEventListener&&(a.addEventListener(d,c,!1),f=!0);f&&!w[d]||!a.hasOwnProperty(e)||(a[e]=c)}function d(a,b,c){var e="on"+b;a.detachEvent&&a.detachEvent(e,c);a.removeEventListener&&a.removeEventListener(b,c,!1);a[e]===c&&(a[e]=null)}function c(b){-1===f.indexOf(b)&&(f.push(b),e.filters.every(function(a){return a(b)})&&g.emit(a,b),runtime.setTimeout(function(){f.splice(f.indexOf(b),
1)},0))}var e=this,f=[],g=new core.EventNotifier([a]);this.filters=[];this.subscribe=function(b){g.subscribe(a,b)};this.unsubscribe=function(b){g.unsubscribe(a,b)};this.destroy=function(){d(x,a,c);d(G,a,c);d(L,a,c)};t[a]&&b(x,a,c);b(G,a,c);b(L,a,c)}function b(a,b,d){function c(b){d(b,e,function(b){b.type=a;f.emit(a,b)})}var e={},f=new core.EventNotifier([a]);this.subscribe=function(b){f.subscribe(a,b)};this.unsubscribe=function(b){f.unsubscribe(a,b)};this.destroy=function(){b.forEach(function(a){C.unsubscribe(a,
c)})};(function(){b.forEach(function(a){C.subscribe(a,c)})})()}function c(a){runtime.clearTimeout(a);delete S[a]}function e(a,b){var d=runtime.setTimeout(function(){a();c(d)},b);S[d]=!0;return d}function l(a,b,d){var f=a.touches.length,g=a.touches[0],h=b.timer;"touchmove"===a.type||"touchend"===a.type?h&&c(h):"touchstart"===a.type&&(1!==f?runtime.clearTimeout(h):h=e(function(){d({clientX:g.clientX,clientY:g.clientY,pageX:g.pageX,pageY:g.pageY,target:a.target||a.srcElement||null,detail:1})},400));
b.timer=h}function h(a,b,d){var c=a.touches[0],e=a.target||a.srcElement||null,f=b.target;1!==a.touches.length||"touchend"===a.type?f=null:"touchstart"===a.type&&"webodf-draggable"===e.getAttribute("class")?f=e:"touchmove"===a.type&&f&&(a.preventDefault(),a.stopPropagation(),d({clientX:c.clientX,clientY:c.clientY,pageX:c.pageX,pageY:c.pageY,target:f,detail:1}));b.target=f}function q(a,b,d){var c=a.target||a.srcElement||null,e=b.dragging;"drag"===a.type?e=!0:"touchend"===a.type&&e&&(e=!1,a=a.changedTouches[0],
d({clientX:a.clientX,clientY:a.clientY,pageX:a.pageX,pageY:a.pageY,target:c,detail:1}));b.dragging=e}function p(){L.classList.add("webodf-touchEnabled");C.unsubscribe("touchstart",p)}function m(a){var b=a.scrollX,d=a.scrollY;this.restore=function(){a.scrollX===b&&a.scrollY===d||a.scrollTo(b,d)}}function r(a){var b=a.scrollTop,d=a.scrollLeft;this.restore=function(){if(a.scrollTop!==b||a.scrollLeft!==d)a.scrollTop=b,a.scrollLeft=d}}function d(a,b){var d=B[a]||D[a]||null;!d&&b&&(d=B[a]=new g(a));return d}
function a(a,b){d(a,!0).subscribe(b)}function n(a,b){var c=d(a,!1);c&&c.unsubscribe(b)}function k(){return f.getDOMDocument().activeElement===G}function s(){k()&&G.blur();G.setAttribute("disabled","true")}function y(){G.removeAttribute("disabled")}function u(a){for(var b=[];a;)(a.scrollWidth>a.clientWidth||a.scrollHeight>a.clientHeight)&&b.push(new r(a)),a=a.parentNode;b.push(new m(x));return b}function z(){var a;k()||(a=u(G),y(),G.focus(),a.forEach(function(a){a.restore()}))}var x=runtime.getWindow(),
w={beforecut:!0,beforepaste:!0,longpress:!0,drag:!0,dragstop:!0},t={mousedown:!0,mouseup:!0,focus:!0},D={},B={},G,L=f.getCanvas().getElement(),C=this,S={};this.addFilter=function(a,b){d(a,!0).filters.push(b)};this.removeFilter=function(a,b){var c=d(a,!0),e=c.filters.indexOf(b);-1!==e&&c.filters.splice(e,1)};this.subscribe=a;this.unsubscribe=n;this.hasFocus=k;this.focus=z;this.getEventTrap=function(){return G};this.setEditing=function(a){var b=k();b&&G.blur();a?G.removeAttribute("readOnly"):G.setAttribute("readOnly",
"true");b&&z()};this.destroy=function(a){n("touchstart",p);Object.keys(S).forEach(function(a){c(parseInt(a,10))});S.length=0;Object.keys(D).forEach(function(a){D[a].destroy()});D={};n("mousedown",s);n("mouseup",y);n("contextmenu",y);Object.keys(B).forEach(function(a){B[a].destroy()});B={};G.parentNode.removeChild(G);a()};(function(){var d=f.getOdfCanvas().getSizer(),c=d.ownerDocument;runtime.assert(Boolean(x),"EventManager requires a window object to operate correctly");G=c.createElement("input");
G.id="eventTrap";G.setAttribute("tabindex","-1");G.setAttribute("readOnly","true");d.appendChild(G);a("mousedown",s);a("mouseup",y);a("contextmenu",y);D.longpress=new b("longpress",["touchstart","touchmove","touchend"],l);D.drag=new b("drag",["touchstart","touchmove","touchend"],h);D.dragstop=new b("dragstop",["drag","touchend"],q);a("touchstart",p)})()};
// Input 91
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.IOSSafariSupport=function(f){function g(){b.innerHeight!==b.outerHeight&&(c.style.display="none",runtime.requestAnimationFrame(function(){c.style.display="block"}))}var b=runtime.getWindow(),c=f.getEventTrap();this.destroy=function(b){f.unsubscribe("focus",g);c.removeAttribute("autocapitalize");c.style.WebkitTransform="";b()};f.subscribe("focus",g);c.setAttribute("autocapitalize","off");c.style.WebkitTransform="translateX(-10000px)"};
// Input 92
gui.ImageController=function(f,g,b){var c={"image/gif":".gif","image/jpeg":".jpg","image/png":".png"},e=odf.Namespaces.textns,l=f.getOdtDocument(),h=l.getFormatting();this.insertImage=function(q,p,m,r){runtime.assert(0<m&&0<r,"Both width and height of the image should be greater than 0px.");r={width:m,height:r};if(m=l.getParagraphElement(l.getCursor(g).getNode()).getAttributeNS(e,"style-name")){m=h.getContentSize(m,"paragraph");var d=1,a=1;r.width>m.width&&(d=m.width/r.width);r.height>m.height&&(a=
m.height/r.height);m=Math.min(d,a);r={width:r.width*m,height:r.height*m}}m=r.width+"px";r=r.height+"px";var n=l.getOdfCanvas().odfContainer().rootElement.styles,d=q.toLowerCase(),a=c.hasOwnProperty(d)?c[d]:null,k,d=[];runtime.assert(null!==a,"Image type is not supported: "+q);a="Pictures/"+b.generateImageName()+a;k=new ops.OpSetBlob;k.init({memberid:g,filename:a,mimetype:q,content:p});d.push(k);h.getStyleElement("Graphics","graphic",[n])||(q=new ops.OpAddStyle,q.init({memberid:g,styleName:"Graphics",
styleFamily:"graphic",isAutomaticStyle:!1,setProperties:{"style:graphic-properties":{"text:anchor-type":"paragraph","svg:x":"0cm","svg:y":"0cm","style:wrap":"dynamic","style:number-wrapped-paragraphs":"no-limit","style:wrap-contour":"false","style:vertical-pos":"top","style:vertical-rel":"paragraph","style:horizontal-pos":"center","style:horizontal-rel":"paragraph"}}}),d.push(q));q=b.generateStyleName();p=new ops.OpAddStyle;p.init({memberid:g,styleName:q,styleFamily:"graphic",isAutomaticStyle:!0,
setProperties:{"style:parent-style-name":"Graphics","style:graphic-properties":{"style:vertical-pos":"top","style:vertical-rel":"baseline","style:horizontal-pos":"center","style:horizontal-rel":"paragraph","fo:background-color":"transparent","style:background-transparency":"100%","style:shadow":"none","style:mirror":"none","fo:clip":"rect(0cm, 0cm, 0cm, 0cm)","draw:luminance":"0%","draw:contrast":"0%","draw:red":"0%","draw:green":"0%","draw:blue":"0%","draw:gamma":"100%","draw:color-inversion":"false",
"draw:image-opacity":"100%","draw:color-mode":"standard"}}});d.push(p);k=new ops.OpInsertImage;k.init({memberid:g,position:l.getCursorPosition(g),filename:a,frameWidth:m,frameHeight:r,frameStyleName:q,frameName:b.generateFrameName()});d.push(k);f.enqueue(d)}};
// Input 93
gui.ImageSelector=function(f){function g(){var b=f.getSizer(),g=e.createElement("div");g.id="imageSelector";g.style.borderWidth="1px";b.appendChild(g);c.forEach(function(b){var c=e.createElement("div");c.className=b;g.appendChild(c)});return g}var b=odf.Namespaces.svgns,c="topLeft topRight bottomRight bottomLeft topMiddle rightMiddle bottomMiddle leftMiddle".split(" "),e=f.getElement().ownerDocument,l=!1;this.select=function(c){var q,p,m=e.getElementById("imageSelector");m||(m=g());l=!0;q=m.parentNode;
p=c.getBoundingClientRect();var r=q.getBoundingClientRect(),d=f.getZoomLevel();q=(p.left-r.left)/d-1;p=(p.top-r.top)/d-1;m.style.display="block";m.style.left=q+"px";m.style.top=p+"px";m.style.width=c.getAttributeNS(b,"width");m.style.height=c.getAttributeNS(b,"height")};this.clearSelection=function(){var b;l&&(b=e.getElementById("imageSelector"))&&(b.style.display="none");l=!1};this.isSelectorElement=function(b){var c=e.getElementById("imageSelector");return c?b===c||b.parentNode===c:!1}};
// Input 94
(function(){function f(f){function b(b){h=b.which&&String.fromCharCode(b.which)===l;l=void 0;return!1===h}function c(){h=!1}function e(b){l=b.data;h=!1}var l,h=!1;this.destroy=function(h){f.unsubscribe("textInput",c);f.unsubscribe("compositionend",e);f.removeFilter("keypress",b);h()};f.subscribe("textInput",c);f.subscribe("compositionend",e);f.addFilter("keypress",b)}gui.InputMethodEditor=function(g,b){function c(b){a&&(b?a.getNode().setAttributeNS(d,"composing","true"):(a.getNode().removeAttributeNS(d,
"composing"),s.textContent=""))}function e(){z&&(z=!1,c(!1),w.emit(gui.InputMethodEditor.signalCompositionEnd,{data:x}),x="")}function l(){e();a&&a.getSelectedRange().collapsed?n.value="":n.value=y;n.setSelectionRange(0,n.value.length)}function h(){b.hasFocus()&&u.trigger()}function q(){t=void 0;u.cancel();c(!0);z||w.emit(gui.InputMethodEditor.signalCompositionStart,{data:""})}function p(a){a=t=a.data;z=!0;x+=a;u.trigger()}function m(a){a.data!==t&&(a=a.data,z=!0,x+=a,u.trigger());t=void 0}function r(){s.textContent=
n.value}var d="urn:webodf:names:cursor",a=null,n=b.getEventTrap(),k=n.ownerDocument,s,y="b",u,z=!1,x="",w=new core.EventNotifier([gui.InputMethodEditor.signalCompositionStart,gui.InputMethodEditor.signalCompositionEnd]),t,D=[],B;this.subscribe=w.subscribe;this.unsubscribe=w.unsubscribe;this.registerCursor=function(d){d.getMemberId()===g&&(a=d,a.getNode().appendChild(s),d.subscribe(ops.OdtCursor.signalCursorUpdated,h),b.subscribe("input",r),b.subscribe("compositionupdate",r))};this.removeCursor=function(d){a&&
d===g&&(a.getNode().removeChild(s),a.unsubscribe(ops.OdtCursor.signalCursorUpdated,h),b.unsubscribe("input",r),b.unsubscribe("compositionupdate",r),a=null)};this.destroy=function(a){b.unsubscribe("compositionstart",q);b.unsubscribe("compositionend",p);b.unsubscribe("textInput",m);b.unsubscribe("keypress",e);b.unsubscribe("focus",l);core.Async.destroyAll(B,a)};(function(){b.subscribe("compositionstart",q);b.subscribe("compositionend",p);b.subscribe("textInput",m);b.subscribe("keypress",e);b.subscribe("focus",
l);D.push(new f(b));B=D.map(function(a){return a.destroy});s=k.createElement("span");s.setAttribute("id","composer");u=core.Task.createTimeoutTask(l,1);B.push(u.destroy)})()};gui.InputMethodEditor.signalCompositionStart="input/compositionstart";gui.InputMethodEditor.signalCompositionEnd="input/compositionend"})();
// Input 95
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.PlainTextPasteboard=function(f,g){function b(b,e){b.init(e);return b}this.createPasteOps=function(c){var e=f.getCursorPosition(g),l=[];c.replace(/\r/g,"").split("\n").forEach(function(c){l.push(b(new ops.OpInsertText,{memberid:g,position:e,text:c,moveCursor:!0}));e+=c.length;l.push(b(new ops.OpSplitParagraph,{memberid:g,position:e,moveCursor:!0}));e+=1});l.pop();return l}};
// Input 96
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.WordBoundaryFilter=function(f,g){function b(a,b,d){for(var c=null,e=f.getRootNode(),g;a!==e&&null!==a&&null===c;)g=0>b?a.previousSibling:a.nextSibling,d(g)===NodeFilter.FILTER_ACCEPT&&(c=g),a=a.parentNode;return c}function c(a,b){var d;return null===a?n.NO_NEIGHBOUR:h.isCharacterElement(a)?n.SPACE_CHAR:a.nodeType===e||h.isTextSpan(a)||h.isHyperlink(a)?(d=a.textContent.charAt(b()),p.test(d)?n.SPACE_CHAR:q.test(d)?n.PUNCTUATION_CHAR:n.WORD_CHAR):n.OTHER}var e=Node.TEXT_NODE,l=Node.ELEMENT_NODE,
h=new odf.OdfUtils,q=/[!-#%-*,-\/:-;?-@\[-\]_{}\u00a1\u00ab\u00b7\u00bb\u00bf;\u00b7\u055a-\u055f\u0589-\u058a\u05be\u05c0\u05c3\u05c6\u05f3-\u05f4\u0609-\u060a\u060c-\u060d\u061b\u061e-\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0964-\u0965\u0970\u0df4\u0e4f\u0e5a-\u0e5b\u0f04-\u0f12\u0f3a-\u0f3d\u0f85\u0fd0-\u0fd4\u104a-\u104f\u10fb\u1361-\u1368\u166d-\u166e\u169b-\u169c\u16eb-\u16ed\u1735-\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u180a\u1944-\u1945\u19de-\u19df\u1a1e-\u1a1f\u1b5a-\u1b60\u1c3b-\u1c3f\u1c7e-\u1c7f\u2000-\u206e\u207d-\u207e\u208d-\u208e\u3008-\u3009\u2768-\u2775\u27c5-\u27c6\u27e6-\u27ef\u2983-\u2998\u29d8-\u29db\u29fc-\u29fd\u2cf9-\u2cfc\u2cfe-\u2cff\u2e00-\u2e7e\u3000-\u303f\u30a0\u30fb\ua60d-\ua60f\ua673\ua67e\ua874-\ua877\ua8ce-\ua8cf\ua92e-\ua92f\ua95f\uaa5c-\uaa5f\ufd3e-\ufd3f\ufe10-\ufe19\ufe30-\ufe52\ufe54-\ufe61\ufe63\ufe68\ufe6a-\ufe6b\uff01-\uff03\uff05-\uff0a\uff0c-\uff0f\uff1a-\uff1b\uff1f-\uff20\uff3b-\uff3d\uff3f\uff5b\uff5d\uff5f-\uff65]|\ud800[\udd00-\udd01\udf9f\udfd0]|\ud802[\udd1f\udd3f\ude50-\ude58]|\ud809[\udc00-\udc7e]/,
p=/\s/,m=core.PositionFilter.FilterResult.FILTER_ACCEPT,r=core.PositionFilter.FilterResult.FILTER_REJECT,d=odf.WordBoundaryFilter.IncludeWhitespace.TRAILING,a=odf.WordBoundaryFilter.IncludeWhitespace.LEADING,n={NO_NEIGHBOUR:0,SPACE_CHAR:1,PUNCTUATION_CHAR:2,WORD_CHAR:3,OTHER:4};this.acceptPosition=function(e){var f=e.container(),h=e.leftNode(),p=e.rightNode(),q=e.unfilteredDomOffset,x=function(){return e.unfilteredDomOffset()-1};f.nodeType===l&&(null===p&&(p=b(f,1,e.getNodeFilter())),null===h&&(h=
b(f,-1,e.getNodeFilter())));f!==p&&(q=function(){return 0});f!==h&&null!==h&&(x=function(){return h.textContent.length-1});f=c(h,x);p=c(p,q);return f===n.WORD_CHAR&&p===n.WORD_CHAR||f===n.PUNCTUATION_CHAR&&p===n.PUNCTUATION_CHAR||g===d&&f!==n.NO_NEIGHBOUR&&p===n.SPACE_CHAR||g===a&&f===n.SPACE_CHAR&&p!==n.NO_NEIGHBOUR?r:m}};odf.WordBoundaryFilter.IncludeWhitespace={None:0,TRAILING:1,LEADING:2};
// Input 97
gui.SelectionController=function(f,g){function b(){var a=u.getCursor(g).getNode();return u.createStepIterator(a,0,[w,D],u.getRootElement(a))}function c(a,b,d){d=new odf.WordBoundaryFilter(u,d);var c=u.getRootElement(a),e=u.createRootFilter(c);return u.createStepIterator(a,b,[w,e,d],c)}function e(a,b){return b?{anchorNode:a.startContainer,anchorOffset:a.startOffset,focusNode:a.endContainer,focusOffset:a.endOffset}:{anchorNode:a.endContainer,anchorOffset:a.endOffset,focusNode:a.startContainer,focusOffset:a.startOffset}}
function l(a,b,d){var c=new ops.OpMoveCursor;c.init({memberid:g,position:a,length:b||0,selectionType:d});return c}function h(a){var b;b=c(a.startContainer,a.startOffset,B);b.roundToPreviousStep()&&a.setStart(b.container(),b.offset());b=c(a.endContainer,a.endOffset,G);b.roundToNextStep()&&a.setEnd(b.container(),b.offset())}function q(a){var b=x.getParagraphElements(a),d=b[0],b=b[b.length-1];d&&a.setStart(d,0);b&&(x.isParagraph(a.endContainer)&&0===a.endOffset?a.setEndBefore(b):a.setEnd(b,b.childNodes.length))}
function p(a,b,d,c){var e,f;c?(e=d.startContainer,f=d.startOffset):(e=d.endContainer,f=d.endOffset);z.containsNode(a,e)||(f=0>z.comparePoints(a,0,e,f)?0:a.childNodes.length,e=a);a=u.createStepIterator(e,f,b,x.getParagraphElement(e)||a);a.roundToClosestStep()||runtime.assert(!1,"No step found in requested range");c?d.setStart(a.container(),a.offset()):d.setEnd(a.container(),a.offset())}function m(a){var b=u.getCursorSelection(g),d=u.getCursor(g).getStepCounter();0!==a&&(a=0<a?d.convertForwardStepsBetweenFilters(a,
t,w):-d.convertBackwardStepsBetweenFilters(-a,t,w),a=b.length+a,f.enqueue([l(b.position,a)]))}function r(a){var d=b(),c=u.getCursor(g).getAnchorNode();a(d)&&(a=u.convertDomToCursorRange({anchorNode:c,anchorOffset:0,focusNode:d.container(),focusOffset:d.offset()}),f.enqueue([l(a.position,a.length)]))}function d(a){var b=u.getCursorPosition(g),d=u.getCursor(g).getStepCounter();0!==a&&(a=0<a?d.convertForwardStepsBetweenFilters(a,t,w):-d.convertBackwardStepsBetweenFilters(-a,t,w),f.enqueue([l(b+a,0)]))}
function a(a){var d=b();a(d)&&(a=u.convertDomPointToCursorStep(d.container(),d.offset()),f.enqueue([l(a,0)]))}function n(a,b){var c=u.getParagraphElement(u.getCursor(g).getNode());runtime.assert(Boolean(c),"SelectionController: Cursor outside paragraph");c=u.getCursor(g).getStepCounter().countLinesSteps(a,t);b?m(c):d(c)}function k(a,b){var c=u.getCursor(g).getStepCounter().countStepsToLineBoundary(a,t);b?m(c):d(c)}function s(a,b){var d=u.getCursor(g),d=e(d.getSelectedRange(),d.hasForwardSelection()),
h=c(d.focusNode,d.focusOffset,B);if(-1===a?h.previousStep():h.nextStep())d.focusNode=h.container(),d.focusOffset=h.offset(),b||(d.anchorNode=d.focusNode,d.anchorOffset=d.focusOffset),d=u.convertDomToCursorRange(d),f.enqueue([l(d.position,d.length)])}function y(a,b,d){var c=!1,h=u.getCursor(g),h=e(h.getSelectedRange(),h.hasForwardSelection()),k=u.getRootElement(h.focusNode);runtime.assert(Boolean(k),"SelectionController: Cursor outside root");k=u.createStepIterator(h.focusNode,h.focusOffset,[w,D],
k);k.roundToClosestStep();-1===a?k.previousStep()&&(a=d(k.container()))&&(k.setPosition(a,0),c=k.roundToNextStep()):k.nextStep()&&(a=d(k.container()))&&(k.setPosition(a,a.childNodes.length),c=k.roundToPreviousStep());c&&(h.focusNode=k.container(),h.focusOffset=k.offset(),b||(h.anchorNode=h.focusNode,h.anchorOffset=h.focusOffset),b=u.convertDomToCursorRange(h),f.enqueue([l(b.position,b.length)]))}var u=f.getOdtDocument(),z=new core.DomUtils,x=new odf.OdfUtils,w=u.getPositionFilter(),t=new core.PositionFilterChain,
D=u.createRootFilter(g),B=odf.WordBoundaryFilter.IncludeWhitespace.TRAILING,G=odf.WordBoundaryFilter.IncludeWhitespace.LEADING;this.selectionToRange=function(a){var b=0<=z.comparePoints(a.anchorNode,a.anchorOffset,a.focusNode,a.focusOffset),d=a.focusNode.ownerDocument.createRange();b?(d.setStart(a.anchorNode,a.anchorOffset),d.setEnd(a.focusNode,a.focusOffset)):(d.setStart(a.focusNode,a.focusOffset),d.setEnd(a.anchorNode,a.anchorOffset));return{range:d,hasForwardSelection:b}};this.rangeToSelection=
e;this.selectImage=function(a){var b=u.getRootElement(a),d=u.createRootFilter(b),b=u.createStepIterator(a,0,[d,u.getPositionFilter()],b),c;b.roundToPreviousStep()||runtime.assert(!1,"No walkable position before frame");d=b.container();c=b.offset();b.setPosition(a,a.childNodes.length);b.roundToNextStep()||runtime.assert(!1,"No walkable position after frame");a=u.convertDomToCursorRange({anchorNode:d,anchorOffset:c,focusNode:b.container(),focusOffset:b.offset()});a=l(a.position,a.length,ops.OdtCursor.RegionSelection);
f.enqueue([a])};this.expandToWordBoundaries=h;this.expandToParagraphBoundaries=q;this.selectRange=function(a,b,d){var c=u.getOdfCanvas().getElement(),k,n=[w];k=z.containsNode(c,a.startContainer);c=z.containsNode(c,a.endContainer);if(k||c)if(k&&c&&(2===d?h(a):3<=d&&q(a)),(d=b?u.getRootElement(a.startContainer):u.getRootElement(a.endContainer))||(d=u.getRootNode()),n.push(u.createRootFilter(d)),p(d,n,a,!0),p(d,n,a,!1),a=e(a,b),b=u.convertDomToCursorRange(a),a=u.getCursorSelection(g),b.position!==a.position||
b.length!==a.length)a=l(b.position,b.length,ops.OdtCursor.RangeSelection),f.enqueue([a])};this.moveCursorToLeft=function(){a(function(a){return a.previousStep()});return!0};this.moveCursorToRight=function(){a(function(a){return a.nextStep()});return!0};this.extendSelectionToLeft=function(){r(function(a){return a.previousStep()});return!0};this.extendSelectionToRight=function(){r(function(a){return a.nextStep()});return!0};this.moveCursorUp=function(){n(-1,!1);return!0};this.moveCursorDown=function(){n(1,
!1);return!0};this.extendSelectionUp=function(){n(-1,!0);return!0};this.extendSelectionDown=function(){n(1,!0);return!0};this.moveCursorBeforeWord=function(){s(-1,!1);return!0};this.moveCursorPastWord=function(){s(1,!1);return!0};this.extendSelectionBeforeWord=function(){s(-1,!0);return!0};this.extendSelectionPastWord=function(){s(1,!0);return!0};this.moveCursorToLineStart=function(){k(-1,!1);return!0};this.moveCursorToLineEnd=function(){k(1,!1);return!0};this.extendSelectionToLineStart=function(){k(-1,
!0);return!0};this.extendSelectionToLineEnd=function(){k(1,!0);return!0};this.extendSelectionToParagraphStart=function(){y(-1,!0,u.getParagraphElement);return!0};this.extendSelectionToParagraphEnd=function(){y(1,!0,u.getParagraphElement);return!0};this.moveCursorToParagraphStart=function(){y(-1,!1,u.getParagraphElement);return!0};this.moveCursorToParagraphEnd=function(){y(1,!1,u.getParagraphElement);return!0};this.moveCursorToDocumentStart=function(){y(-1,!1,u.getRootElement);return!0};this.moveCursorToDocumentEnd=
function(){y(1,!1,u.getRootElement);return!0};this.extendSelectionToDocumentStart=function(){y(-1,!0,u.getRootElement);return!0};this.extendSelectionToDocumentEnd=function(){y(1,!0,u.getRootElement);return!0};this.extendSelectionToEntireDocument=function(){var a=u.getCursor(g),a=u.getRootElement(a.getNode()),b,d,c;runtime.assert(Boolean(a),"SelectionController: Cursor outside root");c=u.createStepIterator(a,0,[w,D],a);c.roundToClosestStep();b=c.container();d=c.offset();c.setPosition(a,a.childNodes.length);
c.roundToClosestStep();a=u.convertDomToCursorRange({anchorNode:b,anchorOffset:d,focusNode:c.container(),focusOffset:c.offset()});f.enqueue([l(a.position,a.length)]);return!0};t.addFilter(w);t.addFilter(u.createRootFilter(g))};
// Input 98
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.TextController=function(f,g,b,c){function e(b,c){var d,a;d=new ops.OpRemoveText;var e=[d];d.init({memberid:g,position:c.position,length:c.length});d=q.getParagraphElement(b.startContainer);a=q.getParagraphElement(b.endContainer);d!==a&&(d=p.hasNoODFContent(d)?a.getAttributeNS(odf.Namespaces.textns,"style-name")||"":d.getAttributeNS(odf.Namespaces.textns,"style-name")||"",a=new ops.OpSetParagraphStyle,a.init({memberid:g,position:c.position,styleName:d}),e.push(a));return e}function l(b){0>b.length&&
(b.position+=b.length,b.length=-b.length);return b}function h(b){var c,d=q.getCursor(g).getSelectedRange().cloneRange(),a=l(q.getCursorSelection(g)),h;if(0===a.length){a=void 0;c=q.getCursor(g).getNode();h=q.getRootElement(c);var k=[q.getPositionFilter(),q.createRootFilter(h)];h=q.createStepIterator(c,0,k,h);h.roundToClosestStep()&&(b?h.nextStep():h.previousStep())&&(a=l(q.convertDomToCursorRange({anchorNode:c,anchorOffset:0,focusNode:h.container(),focusOffset:h.offset()})),b?(d.setStart(c,0),d.setEnd(h.container(),
h.offset())):(d.setStart(h.container(),h.offset()),d.setEnd(c,0)))}a&&f.enqueue(e(d,a));return void 0!==a}var q=f.getOdtDocument(),p=new odf.OdfUtils;this.enqueueParagraphSplittingOps=function(){var b=q.getCursor(g).getSelectedRange(),h=l(q.getCursorSelection(g)),d=[];0<h.length&&(d=d.concat(e(b,h)));b=new ops.OpSplitParagraph;b.init({memberid:g,position:h.position,moveCursor:!0});d.push(b);c&&(h=c(h.position+1),d=d.concat(h));f.enqueue(d);return!0};this.removeTextByBackspaceKey=function(){return h(!1)};
this.removeTextByDeleteKey=function(){return h(!0)};this.removeCurrentSelection=function(){var b=q.getCursor(g).getSelectedRange(),c=l(q.getCursorSelection(g));0!==c.length&&f.enqueue(e(b,c));return!0};this.insertText=function(c){var h=q.getCursor(g).getSelectedRange(),d=l(q.getCursorSelection(g)),a=[],n=!1;0<d.length&&(a=a.concat(e(h,d)),n=!0);h=new ops.OpInsertText;h.init({memberid:g,position:d.position,text:c,moveCursor:!0});a.push(h);b&&(c=b(d.position,c.length,n))&&a.push(c);f.enqueue(a)}};
// Input 99
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.UndoManager=function(){};gui.UndoManager.prototype.subscribe=function(f,g){};gui.UndoManager.prototype.unsubscribe=function(f,g){};gui.UndoManager.prototype.setDocument=function(f){};gui.UndoManager.prototype.setInitialState=function(){};gui.UndoManager.prototype.initialize=function(){};gui.UndoManager.prototype.purgeInitialState=function(){};gui.UndoManager.prototype.setPlaybackFunction=function(f){};gui.UndoManager.prototype.hasUndoStates=function(){};
gui.UndoManager.prototype.hasRedoStates=function(){};gui.UndoManager.prototype.moveForward=function(f){};gui.UndoManager.prototype.moveBackward=function(f){};gui.UndoManager.prototype.onOperationExecuted=function(f){};gui.UndoManager.signalUndoStackChanged="undoStackChanged";gui.UndoManager.signalUndoStateCreated="undoStateCreated";gui.UndoManager.signalUndoStateModified="undoStateModified";
// Input 100
gui.SessionControllerOptions=function(){this.annotationsEnabled=this.directParagraphStylingEnabled=!1};
(function(){var f=core.PositionFilter.FilterResult.FILTER_ACCEPT;gui.SessionController=function(g,b,c,e){function l(a){return a.target||a.srcElement||null}function h(a,b){var d=J.getDOMDocument(),c=null;d.caretRangeFromPoint?(d=d.caretRangeFromPoint(a,b),c={container:d.startContainer,offset:d.startOffset}):d.caretPositionFromPoint&&(d=d.caretPositionFromPoint(a,b))&&d.offsetNode&&(c={container:d.offsetNode,offset:d.offset});return c}function q(a){var d=J.getCursor(b).getSelectedRange();d.collapsed?
a.preventDefault():Y.setDataFromRange(a,d)?ea.removeCurrentSelection():runtime.log("Cut operation failed")}function p(){return!1!==J.getCursor(b).getSelectedRange().collapsed}function m(a){var d=J.getCursor(b).getSelectedRange();d.collapsed?a.preventDefault():Y.setDataFromRange(a,d)||runtime.log("Copy operation failed")}function r(a){var b;O.clipboardData&&O.clipboardData.getData?b=O.clipboardData.getData("Text"):a.clipboardData&&a.clipboardData.getData&&(b=a.clipboardData.getData("text/plain"));
b&&(ea.removeCurrentSelection(),g.enqueue(oa.createPasteOps(b)));a.preventDefault?a.preventDefault():a.returnValue=!1}function d(){return!1}function a(a){if(Z)Z.onOperationExecuted(a)}function n(a){J.emit(ops.OdtDocument.signalUndoStackChanged,a)}function k(){var a;return Z?(a=M.hasFocus(),Z.moveBackward(1),a&&M.focus(),!0):!1}function s(){var a;return Z?(a=M.hasFocus(),Z.moveForward(1),a&&M.focus(),!0):!1}function y(a){var d=J.getCursor(b).getSelectedRange(),e=l(a).getAttribute("end");d&&e&&(a=h(a.clientX,
a.clientY))&&(fa.setUnfilteredPosition(a.container,a.offset),R.acceptPosition(fa)===f&&(d=d.cloneRange(),"left"===e?d.setStart(fa.container(),fa.unfilteredDomOffset()):d.setEnd(fa.container(),fa.unfilteredDomOffset()),c.setSelectedRange(d,"right"===e),J.emit(ops.Document.signalCursorMoved,c)))}function u(){Q.selectRange(c.getSelectedRange(),c.hasForwardSelection(),1)}function z(){var a=O.getSelection(),b=0<a.rangeCount&&Q.selectionToRange(a);H&&b&&(T=!0,ia.clearSelection(),fa.setUnfilteredPosition(a.focusNode,
a.focusOffset),R.acceptPosition(fa)===f&&(2===ka?Q.expandToWordBoundaries(b.range):3<=ka&&Q.expandToParagraphBoundaries(b.range),c.setSelectedRange(b.range,b.hasForwardSelection),J.emit(ops.Document.signalCursorMoved,c)))}function x(a){var d=l(a),c=J.getCursor(b);if(H=null!==d&&U.containsNode(J.getOdfCanvas().getElement(),d))T=!1,R=J.createRootFilter(d),ka=0===a.button?a.detail:0,c&&a.shiftKey?O.getSelection().collapse(c.getAnchorNode(),0):(a=O.getSelection(),d=c.getSelectedRange(),a.extend?c.hasForwardSelection()?
(a.collapse(d.startContainer,d.startOffset),a.extend(d.endContainer,d.endOffset)):(a.collapse(d.endContainer,d.endOffset),a.extend(d.startContainer,d.startOffset)):(a.removeAllRanges(),a.addRange(d.cloneRange()))),1<ka&&z()}function w(a){var b=J.getRootElement(a),d=J.createRootFilter(b),b=J.createStepIterator(a,0,[d,J.getPositionFilter()],b);b.setPosition(a,a.childNodes.length);return b.roundToNextStep()?{container:b.container(),offset:b.offset()}:null}function t(a){var b;b=(b=O.getSelection())?{anchorNode:b.anchorNode,
anchorOffset:b.anchorOffset,focusNode:b.focusNode,focusOffset:b.focusOffset}:null;var d=O.getSelection().isCollapsed,c,e;b.anchorNode||b.focusNode||!(c=h(a.clientX,a.clientY))||(b.anchorNode=c.container,b.anchorOffset=c.offset,b.focusNode=b.anchorNode,b.focusOffset=b.anchorOffset);if(ca.isImage(b.focusNode)&&0===b.focusOffset&&ca.isCharacterFrame(b.focusNode.parentNode)){if(e=b.focusNode.parentNode,c=e.getBoundingClientRect(),a.clientX>c.left&&(c=w(e)))b.focusNode=c.container,b.focusOffset=c.offset,
d&&(b.anchorNode=b.focusNode,b.anchorOffset=b.focusOffset)}else ca.isImage(b.focusNode.firstChild)&&1===b.focusOffset&&ca.isCharacterFrame(b.focusNode)&&(c=w(b.focusNode))&&(b.anchorNode=b.focusNode=c.container,b.anchorOffset=b.focusOffset=c.offset);b.anchorNode&&b.focusNode&&(b=Q.selectionToRange(b),Q.selectRange(b.range,b.hasForwardSelection,0===a.button?a.detail:0));M.focus()}function D(a){var b;if(b=h(a.clientX,a.clientY))a=b.container,b=b.offset,a={anchorNode:a,anchorOffset:b,focusNode:a,focusOffset:b},
a=Q.selectionToRange(a),Q.selectRange(a.range,a.hasForwardSelection,2),M.focus()}function B(a){var b=l(a),d,e;ja.processRequests();H&&(ca.isImage(b)&&ca.isCharacterFrame(b.parentNode)&&O.getSelection().isCollapsed?(Q.selectImage(b.parentNode),M.focus()):ia.isSelectorElement(b)?M.focus():T?(b=c.getSelectedRange(),d=b.collapsed,ca.isImage(b.endContainer)&&0===b.endOffset&&ca.isCharacterFrame(b.endContainer.parentNode)&&(e=b.endContainer.parentNode,e=w(e))&&(b.setEnd(e.container,e.offset),d&&b.collapse(!1)),
Q.selectRange(b,c.hasForwardSelection(),0===a.button?a.detail:0),M.focus()):sa?t(a):V=runtime.setTimeout(function(){t(a)},0),ka=0,T=H=!1)}function G(a){var d=J.getCursor(b).getSelectedRange();d.collapsed||ba.exportRangeToDataTransfer(a.dataTransfer,d)}function L(){H&&M.focus();ka=0;T=H=!1}function C(a){B(a)}function S(a){var b=l(a),d=null;"annotationRemoveButton"===b.className?(runtime.assert(ma,"Remove buttons are displayed on annotations while annotation editing is disabled in the controller."),
d=U.getElementsByTagNameNS(b.parentNode,odf.Namespaces.officens,"annotation")[0],$.removeAnnotation(d),M.focus()):"webodf-draggable"!==b.getAttribute("class")&&B(a)}function P(a){(a=a.data)&&(-1===a.indexOf("\n")?ea.insertText(a):g.enqueue(oa.createPasteOps(a)))}function W(a){return function(){a();return!0}}function I(a){return function(d){return J.getCursor(b).getSelectionType()===ops.OdtCursor.RangeSelection?a(d):!0}}function da(b){M.unsubscribe("keydown",v.handleEvent);M.unsubscribe("keypress",
K.handleEvent);M.unsubscribe("keyup",N.handleEvent);M.unsubscribe("copy",m);M.unsubscribe("mousedown",x);M.unsubscribe("mousemove",ja.trigger);M.unsubscribe("mouseup",S);M.unsubscribe("contextmenu",C);M.unsubscribe("dragstart",G);M.unsubscribe("dragend",L);M.unsubscribe("click",la.handleClick);M.unsubscribe("longpress",D);M.unsubscribe("drag",y);M.unsubscribe("dragstop",u);J.unsubscribe(ops.OdtDocument.signalOperationEnd,na.trigger);J.unsubscribe(ops.Document.signalCursorAdded,ha.registerCursor);
J.unsubscribe(ops.Document.signalCursorRemoved,ha.removeCursor);J.unsubscribe(ops.OdtDocument.signalOperationEnd,a);b()}var O=runtime.getWindow(),J=g.getOdtDocument(),U=new core.DomUtils,ca=new odf.OdfUtils,ba=new gui.MimeDataExporter,Y=new gui.Clipboard(ba),v=new gui.KeyboardHandler,K=new gui.KeyboardHandler,N=new gui.KeyboardHandler,H=!1,E=new odf.ObjectNameGenerator(J.getOdfCanvas().odfContainer(),b),T=!1,R=null,V,Z=null,M=new gui.EventManager(J),ma=e.annotationsEnabled,$=new gui.AnnotationController(g,
b),aa=new gui.DirectFormattingController(g,b,E,e.directParagraphStylingEnabled),ea=new gui.TextController(g,b,aa.createCursorStyleOp,aa.createParagraphStyleOps),pa=new gui.ImageController(g,b,E),ia=new gui.ImageSelector(J.getOdfCanvas()),fa=gui.SelectionMover.createPositionIterator(J.getRootNode()),ja,na,oa=new gui.PlainTextPasteboard(J,b),ha=new gui.InputMethodEditor(b,M),ka=0,la=new gui.HyperlinkClickHandler(J.getOdfCanvas().getElement,v,N),ga=new gui.HyperlinkController(g,b),Q=new gui.SelectionController(g,
b),A=gui.KeyboardHandler.Modifier,F=gui.KeyboardHandler.KeyCode,qa=-1!==O.navigator.appVersion.toLowerCase().indexOf("mac"),sa=-1!==["iPad","iPod","iPhone"].indexOf(O.navigator.platform),ra;runtime.assert(null!==O,"Expected to be run in an environment which has a global window, like a browser.");this.undo=k;this.redo=s;this.insertLocalCursor=function(){runtime.assert(void 0===g.getOdtDocument().getCursor(b),"Inserting local cursor a second time.");var a=new ops.OpAddCursor;a.init({memberid:b});g.enqueue([a]);
M.focus()};this.removeLocalCursor=function(){runtime.assert(void 0!==g.getOdtDocument().getCursor(b),"Removing local cursor without inserting before.");var a=new ops.OpRemoveCursor;a.init({memberid:b});g.enqueue([a])};this.startEditing=function(){ha.subscribe(gui.InputMethodEditor.signalCompositionStart,ea.removeCurrentSelection);ha.subscribe(gui.InputMethodEditor.signalCompositionEnd,P);M.subscribe("beforecut",p);M.subscribe("cut",q);M.subscribe("beforepaste",d);M.subscribe("paste",r);Z&&Z.initialize();
M.setEditing(!0);la.setModifier(qa?A.Meta:A.Ctrl);v.bind(F.Backspace,A.None,W(ea.removeTextByBackspaceKey),!0);v.bind(F.Delete,A.None,ea.removeTextByDeleteKey);v.bind(F.Tab,A.None,I(function(){ea.insertText("\t");return!0}));qa?(v.bind(F.Clear,A.None,ea.removeCurrentSelection),v.bind(F.B,A.Meta,I(aa.toggleBold)),v.bind(F.I,A.Meta,I(aa.toggleItalic)),v.bind(F.U,A.Meta,I(aa.toggleUnderline)),v.bind(F.L,A.MetaShift,I(aa.alignParagraphLeft)),v.bind(F.E,A.MetaShift,I(aa.alignParagraphCenter)),v.bind(F.R,
A.MetaShift,I(aa.alignParagraphRight)),v.bind(F.J,A.MetaShift,I(aa.alignParagraphJustified)),ma&&v.bind(F.C,A.MetaShift,$.addAnnotation),v.bind(F.Z,A.Meta,k),v.bind(F.Z,A.MetaShift,s)):(v.bind(F.B,A.Ctrl,I(aa.toggleBold)),v.bind(F.I,A.Ctrl,I(aa.toggleItalic)),v.bind(F.U,A.Ctrl,I(aa.toggleUnderline)),v.bind(F.L,A.CtrlShift,I(aa.alignParagraphLeft)),v.bind(F.E,A.CtrlShift,I(aa.alignParagraphCenter)),v.bind(F.R,A.CtrlShift,I(aa.alignParagraphRight)),v.bind(F.J,A.CtrlShift,I(aa.alignParagraphJustified)),
ma&&v.bind(F.C,A.CtrlAlt,$.addAnnotation),v.bind(F.Z,A.Ctrl,k),v.bind(F.Z,A.CtrlShift,s));K.setDefault(I(function(a){var b;b=null===a.which||void 0===a.which?String.fromCharCode(a.keyCode):0!==a.which&&0!==a.charCode?String.fromCharCode(a.which):null;return!b||a.altKey||a.ctrlKey||a.metaKey?!1:(ea.insertText(b),!0)}));K.bind(F.Enter,A.None,I(ea.enqueueParagraphSplittingOps))};this.endEditing=function(){ha.unsubscribe(gui.InputMethodEditor.signalCompositionStart,ea.removeCurrentSelection);ha.unsubscribe(gui.InputMethodEditor.signalCompositionEnd,
P);M.unsubscribe("cut",q);M.unsubscribe("beforecut",p);M.unsubscribe("paste",r);M.unsubscribe("beforepaste",d);M.setEditing(!1);la.setModifier(A.None);v.bind(F.Backspace,A.None,function(){return!0},!0);v.unbind(F.Delete,A.None);v.unbind(F.Tab,A.None);qa?(v.unbind(F.Clear,A.None),v.unbind(F.B,A.Meta),v.unbind(F.I,A.Meta),v.unbind(F.U,A.Meta),v.unbind(F.L,A.MetaShift),v.unbind(F.E,A.MetaShift),v.unbind(F.R,A.MetaShift),v.unbind(F.J,A.MetaShift),ma&&v.unbind(F.C,A.MetaShift),v.unbind(F.Z,A.Meta),v.unbind(F.Z,
A.MetaShift)):(v.unbind(F.B,A.Ctrl),v.unbind(F.I,A.Ctrl),v.unbind(F.U,A.Ctrl),v.unbind(F.L,A.CtrlShift),v.unbind(F.E,A.CtrlShift),v.unbind(F.R,A.CtrlShift),v.unbind(F.J,A.CtrlShift),ma&&v.unbind(F.C,A.CtrlAlt),v.unbind(F.Z,A.Ctrl),v.unbind(F.Z,A.CtrlShift));K.setDefault(null);K.unbind(F.Enter,A.None)};this.getInputMemberId=function(){return b};this.getSession=function(){return g};this.setUndoManager=function(a){Z&&Z.unsubscribe(gui.UndoManager.signalUndoStackChanged,n);if(Z=a)Z.setDocument(J),Z.setPlaybackFunction(g.enqueue),
Z.subscribe(gui.UndoManager.signalUndoStackChanged,n)};this.getUndoManager=function(){return Z};this.getAnnotationController=function(){return $};this.getDirectFormattingController=function(){return aa};this.getHyperlinkClickHandler=function(){return la};this.getHyperlinkController=function(){return ga};this.getImageController=function(){return pa};this.getSelectionController=function(){return Q};this.getTextController=function(){return ea};this.getEventManager=function(){return M};this.getKeyboardHandlers=
function(){return{keydown:v,keypress:K}};this.destroy=function(a){var b=[ja.destroy,na.destroy,aa.destroy,ha.destroy,M.destroy,la.destroy,da];ra&&b.unshift(ra.destroy);runtime.clearTimeout(V);core.Async.destroyAll(b,a)};ja=core.Task.createRedrawTask(z);na=core.Task.createRedrawTask(function(){var a=J.getCursor(b);if(a&&a.getSelectionType()===ops.OdtCursor.RegionSelection&&(a=ca.getImageElements(a.getSelectedRange())[0])){ia.select(a.parentNode);return}ia.clearSelection()});v.bind(F.Left,A.None,I(Q.moveCursorToLeft));
v.bind(F.Right,A.None,I(Q.moveCursorToRight));v.bind(F.Up,A.None,I(Q.moveCursorUp));v.bind(F.Down,A.None,I(Q.moveCursorDown));v.bind(F.Left,A.Shift,I(Q.extendSelectionToLeft));v.bind(F.Right,A.Shift,I(Q.extendSelectionToRight));v.bind(F.Up,A.Shift,I(Q.extendSelectionUp));v.bind(F.Down,A.Shift,I(Q.extendSelectionDown));v.bind(F.Home,A.None,I(Q.moveCursorToLineStart));v.bind(F.End,A.None,I(Q.moveCursorToLineEnd));v.bind(F.Home,A.Ctrl,I(Q.moveCursorToDocumentStart));v.bind(F.End,A.Ctrl,I(Q.moveCursorToDocumentEnd));
v.bind(F.Home,A.Shift,I(Q.extendSelectionToLineStart));v.bind(F.End,A.Shift,I(Q.extendSelectionToLineEnd));v.bind(F.Up,A.CtrlShift,I(Q.extendSelectionToParagraphStart));v.bind(F.Down,A.CtrlShift,I(Q.extendSelectionToParagraphEnd));v.bind(F.Home,A.CtrlShift,I(Q.extendSelectionToDocumentStart));v.bind(F.End,A.CtrlShift,I(Q.extendSelectionToDocumentEnd));qa?(v.bind(F.Left,A.Alt,I(Q.moveCursorBeforeWord)),v.bind(F.Right,A.Alt,I(Q.moveCursorPastWord)),v.bind(F.Left,A.Meta,I(Q.moveCursorToLineStart)),v.bind(F.Right,
A.Meta,I(Q.moveCursorToLineEnd)),v.bind(F.Home,A.Meta,I(Q.moveCursorToDocumentStart)),v.bind(F.End,A.Meta,I(Q.moveCursorToDocumentEnd)),v.bind(F.Left,A.AltShift,I(Q.extendSelectionBeforeWord)),v.bind(F.Right,A.AltShift,I(Q.extendSelectionPastWord)),v.bind(F.Left,A.MetaShift,I(Q.extendSelectionToLineStart)),v.bind(F.Right,A.MetaShift,I(Q.extendSelectionToLineEnd)),v.bind(F.Up,A.AltShift,I(Q.extendSelectionToParagraphStart)),v.bind(F.Down,A.AltShift,I(Q.extendSelectionToParagraphEnd)),v.bind(F.Up,A.MetaShift,
I(Q.extendSelectionToDocumentStart)),v.bind(F.Down,A.MetaShift,I(Q.extendSelectionToDocumentEnd)),v.bind(F.A,A.Meta,I(Q.extendSelectionToEntireDocument))):(v.bind(F.Left,A.Ctrl,I(Q.moveCursorBeforeWord)),v.bind(F.Right,A.Ctrl,I(Q.moveCursorPastWord)),v.bind(F.Left,A.CtrlShift,I(Q.extendSelectionBeforeWord)),v.bind(F.Right,A.CtrlShift,I(Q.extendSelectionPastWord)),v.bind(F.A,A.Ctrl,I(Q.extendSelectionToEntireDocument)));sa&&(ra=new gui.IOSSafariSupport(M));M.subscribe("keydown",v.handleEvent);M.subscribe("keypress",
K.handleEvent);M.subscribe("keyup",N.handleEvent);M.subscribe("copy",m);M.subscribe("mousedown",x);M.subscribe("mousemove",ja.trigger);M.subscribe("mouseup",S);M.subscribe("contextmenu",C);M.subscribe("dragstart",G);M.subscribe("dragend",L);M.subscribe("click",la.handleClick);M.subscribe("longpress",D);M.subscribe("drag",y);M.subscribe("dragstop",u);J.subscribe(ops.OdtDocument.signalOperationEnd,na.trigger);J.subscribe(ops.Document.signalCursorAdded,ha.registerCursor);J.subscribe(ops.Document.signalCursorRemoved,
ha.removeCursor);J.subscribe(ops.OdtDocument.signalOperationEnd,a)}})();
// Input 101
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.CaretManager=function(f){function g(b){return a.hasOwnProperty(b)?a[b]:null}function b(){return Object.keys(a).map(function(b){return a[b]})}function c(b){var d=a[b];d&&(d.destroy(function(){}),b===f.getInputMemberId()&&f.getEventManager().unsubscribe("compositionupdate",d.handleUpdate),delete a[b])}function e(a){a=a.getMemberId();a===f.getInputMemberId()&&(a=g(a))&&a.refreshCursorBlinking()}function l(){var a=g(f.getInputMemberId());s=!1;a&&a.ensureVisible()}function h(){var a=g(f.getInputMemberId());
a&&(a.handleUpdate(),s||(s=!0,k=runtime.setTimeout(l,50)))}function q(a){a.memberId===f.getInputMemberId()&&h()}function p(){var a=g(f.getInputMemberId());a&&a.setFocus()}function m(){var a=g(f.getInputMemberId());a&&a.removeFocus()}function r(){var a=g(f.getInputMemberId());a&&a.show()}function d(){var a=g(f.getInputMemberId());a&&a.hide()}var a={},n=runtime.getWindow(),k,s=!1;this.registerCursor=function(b,d,c){var e=b.getMemberId();d=new gui.Caret(b,d,c);c=f.getEventManager();a[e]=d;e===f.getInputMemberId()?
(runtime.log("Starting to track input on new cursor of "+e),b.subscribe(ops.OdtCursor.signalCursorUpdated,h),c.subscribe("compositionupdate",d.handleUpdate),d.setOverlayElement(c.getEventTrap())):b.subscribe(ops.OdtCursor.signalCursorUpdated,d.handleUpdate);return d};this.getCaret=g;this.getCarets=b;this.destroy=function(h){var g=f.getSession().getOdtDocument(),l=f.getEventManager(),s=b().map(function(a){return a.destroy});runtime.clearTimeout(k);g.unsubscribe(ops.OdtDocument.signalParagraphChanged,
q);g.unsubscribe(ops.Document.signalCursorMoved,e);g.unsubscribe(ops.Document.signalCursorRemoved,c);l.unsubscribe("focus",p);l.unsubscribe("blur",m);n.removeEventListener("focus",r,!1);n.removeEventListener("blur",d,!1);a={};core.Async.destroyAll(s,h)};(function(){var a=f.getSession().getOdtDocument(),b=f.getEventManager();a.subscribe(ops.OdtDocument.signalParagraphChanged,q);a.subscribe(ops.Document.signalCursorMoved,e);a.subscribe(ops.Document.signalCursorRemoved,c);b.subscribe("focus",p);b.subscribe("blur",
m);n.addEventListener("focus",r,!1);n.addEventListener("blur",d,!1)})()};
// Input 102
gui.EditInfoHandle=function(f){var g=[],b,c=f.ownerDocument,e=c.documentElement.namespaceURI;this.setEdits=function(f){g=f;var h,q,p,m;b.innerHTML="";for(f=0;f<g.length;f+=1)h=c.createElementNS(e,"div"),h.className="editInfo",q=c.createElementNS(e,"span"),q.className="editInfoColor",q.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g[f].memberid),p=c.createElementNS(e,"span"),p.className="editInfoAuthor",p.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g[f].memberid),
m=c.createElementNS(e,"span"),m.className="editInfoTime",m.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g[f].memberid),m.innerHTML=g[f].time,h.appendChild(q),h.appendChild(p),h.appendChild(m),b.appendChild(h)};this.show=function(){b.style.display="block"};this.hide=function(){b.style.display="none"};this.destroy=function(c){f.removeChild(b);c()};b=c.createElementNS(e,"div");b.setAttribute("class","editInfoHandle");b.style.display="none";f.appendChild(b)};
// Input 103
/*

 Copyright (C) 2012 KO GmbH <aditya.bhatt@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.EditInfo=function(f,g){function b(){var b=[],c;for(c in e)e.hasOwnProperty(c)&&b.push({memberid:c,time:e[c].time});b.sort(function(b,c){return b.time-c.time});return b}var c,e={};this.getNode=function(){return c};this.getOdtDocument=function(){return g};this.getEdits=function(){return e};this.getSortedEdits=function(){return b()};this.addEdit=function(b,c){e[b]={time:c}};this.clearEdits=function(){e={}};this.destroy=function(b){f.parentNode&&f.removeChild(c);b()};c=g.getDOMDocument().createElementNS("urn:webodf:names:editinfo",
"editinfo");f.insertBefore(c,f.firstChild)};
// Input 104
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.EditInfoMarker=function(f,g){function b(b,d){return runtime.setTimeout(function(){h.style.opacity=b},d)}var c=this,e,l,h,q,p,m;this.addEdit=function(c,d){var a=Date.now()-d;f.addEdit(c,d);l.setEdits(f.getSortedEdits());h.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",c);runtime.clearTimeout(p);runtime.clearTimeout(m);1E4>a?(q=b(1,0),p=b(0.5,1E4-a),m=b(0.2,2E4-a)):1E4<=a&&2E4>a?(q=b(0.5,0),m=b(0.2,2E4-a)):q=b(0.2,0)};this.getEdits=function(){return f.getEdits()};this.clearEdits=
function(){f.clearEdits();l.setEdits([]);h.hasAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")&&h.removeAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")};this.getEditInfo=function(){return f};this.show=function(){h.style.display="block"};this.hide=function(){c.hideHandle();h.style.display="none"};this.showHandle=function(){l.show()};this.hideHandle=function(){l.hide()};this.destroy=function(b){runtime.clearTimeout(q);runtime.clearTimeout(p);runtime.clearTimeout(m);e.removeChild(h);
l.destroy(function(d){d?b(d):f.destroy(b)})};(function(){var b=f.getOdtDocument().getDOMDocument();h=b.createElementNS(b.documentElement.namespaceURI,"div");h.setAttribute("class","editInfoMarker");h.onmouseover=function(){c.showHandle()};h.onmouseout=function(){c.hideHandle()};e=f.getNode();e.appendChild(h);l=new gui.EditInfoHandle(e);g||c.hide()})()};
// Input 105
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.HyperlinkTooltipView=function(f,g){var b=new core.DomUtils,c=new odf.OdfUtils,e=runtime.getWindow(),l,h,q;runtime.assert(null!==e,"Expected to be run in an environment which has a global window, like a browser.");this.showTooltip=function(p){var m=p.target||p.srcElement,r=f.getSizer(),d=f.getZoomLevel(),a;a:{for(;m;){if(c.isHyperlink(m))break a;if(c.isParagraph(m)||c.isInlineRoot(m))break;m=m.parentNode}m=null}if(m){b.containsNode(r,q)||r.appendChild(q);a=h;var n;switch(g()){case gui.KeyboardHandler.Modifier.Ctrl:n=
runtime.tr("Ctrl-click to follow link");break;case gui.KeyboardHandler.Modifier.Meta:n=runtime.tr("\u2318-click to follow link");break;default:n=""}a.textContent=n;l.textContent=c.getHyperlinkTarget(m);q.style.display="block";a=e.innerWidth-q.offsetWidth-15;m=p.clientX>a?a:p.clientX+15;a=e.innerHeight-q.offsetHeight-10;p=p.clientY>a?a:p.clientY+10;r=r.getBoundingClientRect();m=(m-r.left)/d;p=(p-r.top)/d;q.style.left=m+"px";q.style.top=p+"px"}};this.hideTooltip=function(){q.style.display="none"};this.destroy=
function(b){q.parentNode&&q.parentNode.removeChild(q);b()};(function(){var b=f.getElement().ownerDocument;l=b.createElement("span");h=b.createElement("span");l.className="webodf-hyperlinkTooltipLink";h.className="webodf-hyperlinkTooltipText";q=b.createElement("div");q.className="webodf-hyperlinkTooltip";q.appendChild(l);q.appendChild(h);f.getElement().appendChild(q)})()};
// Input 106
gui.ShadowCursor=function(f){var g=f.getDOMDocument().createRange(),b=!0;this.removeFromDocument=function(){};this.getMemberId=function(){return gui.ShadowCursor.ShadowCursorMemberId};this.getSelectedRange=function(){return g};this.setSelectedRange=function(c,e){g=c;b=!1!==e};this.hasForwardSelection=function(){return b};this.getDocument=function(){return f};this.getSelectionType=function(){return ops.OdtCursor.RangeSelection};g.setStart(f.getRootNode(),0)};gui.ShadowCursor.ShadowCursorMemberId="";
// Input 107
gui.SelectionView=function(f){};gui.SelectionView.prototype.rerender=function(){};gui.SelectionView.prototype.show=function(){};gui.SelectionView.prototype.hide=function(){};gui.SelectionView.prototype.destroy=function(f){};
// Input 108
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.SelectionViewManager=function(f){function g(){return Object.keys(b).map(function(c){return b[c]})}var b={};this.getSelectionView=function(c){return b.hasOwnProperty(c)?b[c]:null};this.getSelectionViews=g;this.removeSelectionView=function(c){b.hasOwnProperty(c)&&(b[c].destroy(function(){}),delete b[c])};this.hideSelectionView=function(c){b.hasOwnProperty(c)&&b[c].hide()};this.showSelectionView=function(c){b.hasOwnProperty(c)&&b[c].show()};this.rerenderSelectionViews=function(){Object.keys(b).forEach(function(c){b[c].rerender()})};
this.registerCursor=function(c,e){var g=c.getMemberId(),h=new f(c);e?h.show():h.hide();return b[g]=h};this.destroy=function(b){function e(h,g){g?b(g):h<f.length?f[h].destroy(function(b){e(h+1,b)}):b()}var f=g();e(0,void 0)}};
// Input 109
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.SessionViewOptions=function(){this.caretBlinksOnRangeSelect=this.caretAvatarsInitiallyVisible=this.editInfoMarkersInitiallyVisible=!0};
(function(){gui.SessionView=function(f,g,b,c,e){function l(a,b,d){function c(b,d,e){d=b+'[editinfo|memberid="'+a+'"]'+e+d;a:{var f=n.firstChild;for(b=b+'[editinfo|memberid="'+a+'"]'+e+"{";f;){if(f.nodeType===Node.TEXT_NODE&&0===f.data.indexOf(b)){b=f;break a}f=f.nextSibling}b=null}b?b.data=d:n.appendChild(document.createTextNode(d))}c("div.editInfoMarker","{ background-color: "+d+"; }","");c("span.editInfoColor","{ background-color: "+d+"; }","");c("span.editInfoAuthor",'{ content: "'+b+'"; }',":before");
c("dc|creator","{ background-color: "+d+"; }","");c(".webodf-selectionOverlay","{ fill: "+d+"; stroke: "+d+";}","");a!==gui.ShadowCursor.ShadowCursorMemberId&&a!==g||c(".webodf-touchEnabled .webodf-selectionOverlay","{ display: block; }"," > .webodf-draggable")}function h(a){var b,d;for(d in s)s.hasOwnProperty(d)&&(b=s[d],a?b.show():b.hide())}function q(a){c.getCarets().forEach(function(b){a?b.showHandle():b.hideHandle()})}function p(a){var b=a.getMemberId();a=a.getProperties();l(b,a.fullName,a.color);
g===b&&l("","",a.color)}function m(a){var d=a.getMemberId(),f=b.getOdtDocument().getMember(d).getProperties();c.registerCursor(a,u,z);e.registerCursor(a,!0);if(a=c.getCaret(d))a.setAvatarImageUrl(f.imageUrl),a.setColor(f.color);runtime.log("+++ View here +++ eagerly created an Caret for '"+d+"'! +++")}function r(a){a=a.getMemberId();var b=e.getSelectionView(g),d=e.getSelectionView(gui.ShadowCursor.ShadowCursorMemberId),f=c.getCaret(g);a===g?(d.hide(),b&&b.show(),f&&f.show()):a===gui.ShadowCursor.ShadowCursorMemberId&&
(d.show(),b&&b.hide(),f&&f.hide())}function d(a){e.removeSelectionView(a)}function a(a){var d=a.paragraphElement,c=a.memberId;a=a.timeStamp;var e,f="",g=d.getElementsByTagNameNS(k,"editinfo").item(0);g?(f=g.getAttributeNS(k,"id"),e=s[f]):(f=Math.random().toString(),e=new ops.EditInfo(d,b.getOdtDocument()),e=new gui.EditInfoMarker(e,y),g=d.getElementsByTagNameNS(k,"editinfo").item(0),g.setAttributeNS(k,"id",f),s[f]=e);e.addEdit(c,new Date(a))}var n,k="urn:webodf:names:editinfo",s={},y=void 0!==f.editInfoMarkersInitiallyVisible?
Boolean(f.editInfoMarkersInitiallyVisible):!0,u=void 0!==f.caretAvatarsInitiallyVisible?Boolean(f.caretAvatarsInitiallyVisible):!0,z=void 0!==f.caretBlinksOnRangeSelect?Boolean(f.caretBlinksOnRangeSelect):!0;this.showEditInfoMarkers=function(){y||(y=!0,h(y))};this.hideEditInfoMarkers=function(){y&&(y=!1,h(y))};this.showCaretAvatars=function(){u||(u=!0,q(u))};this.hideCaretAvatars=function(){u&&(u=!1,q(u))};this.getSession=function(){return b};this.getCaret=function(a){return c.getCaret(a)};this.destroy=
function(c){var f=b.getOdtDocument(),g=Object.keys(s).map(function(a){return s[a]});f.unsubscribe(ops.Document.signalMemberAdded,p);f.unsubscribe(ops.Document.signalMemberUpdated,p);f.unsubscribe(ops.Document.signalCursorAdded,m);f.unsubscribe(ops.Document.signalCursorRemoved,d);f.unsubscribe(ops.OdtDocument.signalParagraphChanged,a);f.unsubscribe(ops.Document.signalCursorMoved,r);f.unsubscribe(ops.OdtDocument.signalParagraphChanged,e.rerenderSelectionViews);f.unsubscribe(ops.OdtDocument.signalTableAdded,
e.rerenderSelectionViews);f.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,e.rerenderSelectionViews);n.parentNode.removeChild(n);(function B(a,b){b?c(b):a<g.length?g[a].destroy(function(b){B(a+1,b)}):c()})(0,void 0)};(function(){var c=b.getOdtDocument(),f=document.getElementsByTagName("head").item(0);c.subscribe(ops.Document.signalMemberAdded,p);c.subscribe(ops.Document.signalMemberUpdated,p);c.subscribe(ops.Document.signalCursorAdded,m);c.subscribe(ops.Document.signalCursorRemoved,d);c.subscribe(ops.OdtDocument.signalParagraphChanged,
a);c.subscribe(ops.Document.signalCursorMoved,r);c.subscribe(ops.OdtDocument.signalParagraphChanged,e.rerenderSelectionViews);c.subscribe(ops.OdtDocument.signalTableAdded,e.rerenderSelectionViews);c.subscribe(ops.OdtDocument.signalParagraphStyleModified,e.rerenderSelectionViews);n=document.createElementNS(f.namespaceURI,"style");n.type="text/css";n.media="screen, print, handheld, projection";n.appendChild(document.createTextNode("@namespace editinfo url(urn:webodf:names:editinfo);"));n.appendChild(document.createTextNode("@namespace dc url(http://purl.org/dc/elements/1.1/);"));
f.appendChild(n)})()}})();
// Input 110
gui.SvgSelectionView=function(f){function g(){var b=a.getRootNode();n!==b&&(n=b,k=a.getCanvas().getSizer(),k.appendChild(y),y.setAttribute("class","webodf-selectionOverlay"),z.setAttribute("class","webodf-draggable"),x.setAttribute("class","webodf-draggable"),z.setAttribute("end","left"),x.setAttribute("end","right"),z.setAttribute("r",8),x.setAttribute("r",8),y.appendChild(u),y.appendChild(z),y.appendChild(x))}function b(a){a=a.getBoundingClientRect();return Boolean(a&&0!==a.height)}function c(a){var d=
w.getTextElements(a,!0,!1),c=a.cloneRange(),e=a.cloneRange();a=a.cloneRange();if(!d.length)return null;var f;a:{f=0;var g=d[f],h=c.startContainer===g?c.startOffset:0,k=h;c.setStart(g,h);for(c.setEnd(g,k);!b(c);){if(g.nodeType===Node.ELEMENT_NODE&&k<g.childNodes.length)k=g.childNodes.length;else if(g.nodeType===Node.TEXT_NODE&&k<g.length)k+=1;else if(d[f])g=d[f],f+=1,h=k=0;else{f=!1;break a}c.setStart(g,h);c.setEnd(g,k)}f=!0}if(!f)return null;a:{f=d.length-1;g=d[f];k=h=e.endContainer===g?e.endOffset:
g.nodeType===Node.TEXT_NODE?g.length:g.childNodes.length;e.setStart(g,h);for(e.setEnd(g,k);!b(e);){if(g.nodeType===Node.ELEMENT_NODE&&0<h)h=0;else if(g.nodeType===Node.TEXT_NODE&&0<h)h-=1;else if(d[f])g=d[f],f-=1,h=k=g.length||g.childNodes.length;else{d=!1;break a}e.setStart(g,h);e.setEnd(g,k)}d=!0}if(!d)return null;a.setStart(c.startContainer,c.startOffset);a.setEnd(e.endContainer,e.endOffset);return{firstRange:c,lastRange:e,fillerRange:a}}function e(a,b){var d={};d.top=Math.min(a.top,b.top);d.left=
Math.min(a.left,b.left);d.right=Math.max(a.right,b.right);d.bottom=Math.max(a.bottom,b.bottom);d.width=d.right-d.left;d.height=d.bottom-d.top;return d}function l(a,b){b&&0<b.width&&0<b.height&&(a=a?e(a,b):b);return a}function h(b){function d(a){G.setUnfilteredPosition(a,0);return y.acceptNode(a)===L&&u.acceptPosition(G)===L?L:C}function c(a){var b=null;d(a)===L&&(b=t.getBoundingClientRect(a));return b}var e=b.commonAncestorContainer,f=b.startContainer,g=b.endContainer,h=b.startOffset,k=b.endOffset,
n,m,p=null,q,r=s.createRange(),u,y=new odf.OdfNodeFilter,x;if(f===e||g===e)return r=b.cloneRange(),p=r.getBoundingClientRect(),r.detach(),p;for(b=f;b.parentNode!==e;)b=b.parentNode;for(m=g;m.parentNode!==e;)m=m.parentNode;u=a.createRootFilter(f);for(e=b.nextSibling;e&&e!==m;)q=c(e),p=l(p,q),e=e.nextSibling;if(w.isParagraph(b))p=l(p,t.getBoundingClientRect(b));else if(b.nodeType===Node.TEXT_NODE)e=b,r.setStart(e,h),r.setEnd(e,e===m?k:e.length),q=r.getBoundingClientRect(),p=l(p,q);else for(x=s.createTreeWalker(b,
NodeFilter.SHOW_TEXT,d,!1),e=x.currentNode=f;e&&e!==g;)r.setStart(e,h),r.setEnd(e,e.length),q=r.getBoundingClientRect(),p=l(p,q),n=e,h=0,e=x.nextNode();n||(n=f);if(w.isParagraph(m))p=l(p,t.getBoundingClientRect(m));else if(m.nodeType===Node.TEXT_NODE)e=m,r.setStart(e,e===b?h:0),r.setEnd(e,k),q=r.getBoundingClientRect(),p=l(p,q);else for(x=s.createTreeWalker(m,NodeFilter.SHOW_TEXT,d,!1),e=x.currentNode=g;e&&e!==n;)if(r.setStart(e,0),r.setEnd(e,k),q=r.getBoundingClientRect(),p=l(p,q),e=x.previousNode())k=
e.length;return p}function q(a,b){var d=a.getBoundingClientRect(),c={width:0};c.top=d.top;c.bottom=d.bottom;c.height=d.height;c.left=c.right=b?d.right:d.left;return c}function p(){var a=f.getSelectedRange(),b;if(b=B&&f.getSelectionType()===ops.OdtCursor.RangeSelection&&!a.collapsed){g();var d=t.getBoundingClientRect(k),l=D.getZoomLevel(),a=c(a),n,m,p,r,s,w;if(a){b=a.firstRange;n=a.lastRange;m=a.fillerRange;p=t.translateRect(q(b,!1),d,l);s=t.translateRect(q(n,!0),d,l);r=(r=h(m))?t.translateRect(r,
d,l):e(p,s);w=r.left;r=p.left+Math.max(0,r.width-(p.left-r.left));d=Math.min(p.top,s.top);l=s.top+s.height;w=[{x:p.left,y:d+p.height},{x:p.left,y:d},{x:r,y:d},{x:r,y:l-s.height},{x:s.right,y:l-s.height},{x:s.right,y:l},{x:w,y:l},{x:w,y:d+p.height},{x:p.left,y:d+p.height}];r="";var v;for(v=0;v<w.length;v+=1)r+=w[v].x+","+w[v].y+" ";u.setAttribute("points",r);z.setAttribute("cx",p.left);z.setAttribute("cy",d+p.height/2);x.setAttribute("cx",s.right);x.setAttribute("cy",l-s.height/2);b.detach();n.detach();
m.detach()}b=Boolean(a)}y.style.display=b?"block":"none"}function m(a){B&&a===f&&S.trigger()}function r(a){a=8/a;z.setAttribute("r",a);x.setAttribute("r",a)}function d(a){k.removeChild(y);k.classList.remove("webodf-virtualSelections");f.getDocument().unsubscribe(ops.Document.signalCursorMoved,m);D.unsubscribe(gui.ZoomHelper.signalZoomChanged,r);a()}var a=f.getDocument(),n,k,s=a.getDOMDocument(),y=s.createElementNS("http://www.w3.org/2000/svg","svg"),u=s.createElementNS("http://www.w3.org/2000/svg",
"polygon"),z=s.createElementNS("http://www.w3.org/2000/svg","circle"),x=s.createElementNS("http://www.w3.org/2000/svg","circle"),w=new odf.OdfUtils,t=new core.DomUtils,D=a.getCanvas().getZoomHelper(),B=!0,G=gui.SelectionMover.createPositionIterator(a.getRootNode()),L=NodeFilter.FILTER_ACCEPT,C=NodeFilter.FILTER_REJECT,S;this.rerender=function(){B&&S.trigger()};this.show=function(){B=!0;S.trigger()};this.hide=function(){B=!1;S.trigger()};this.destroy=function(a){core.Async.destroyAll([S.destroy,d],
a)};(function(){var a=f.getMemberId();S=core.Task.createRedrawTask(p);g();y.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",a);k.classList.add("webodf-virtualSelections");f.getDocument().subscribe(ops.Document.signalCursorMoved,m);D.subscribe(gui.ZoomHelper.signalZoomChanged,r);r(D.getZoomLevel())})()};
// Input 111
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.UndoStateRules=function(){function f(b,c){var f=b.length;this.previous=function(){for(f-=1;0<=f;f-=1)if(c(b[f]))return b[f];return null}}function g(b){b=b.spec();var c;b.hasOwnProperty("position")&&(c=b.position);return c}function b(b){return b.isEdit}function c(b,c,f){if(!f)return f=g(b)-g(c),0===f||1===Math.abs(f);b=g(b);c=g(c);f=g(f);return b-c===c-f}this.isEditOperation=b;this.isPartOfOperationSet=function(e,g){var h=void 0!==e.group,q;if(!e.isEdit||0===g.length)return!0;q=g[g.length-1];if(h&&
e.group===q.group)return!0;a:switch(e.spec().optype){case "RemoveText":case "InsertText":q=!0;break a;default:q=!1}if(q&&g.some(b)){if(h){var p;h=e.spec().optype;q=new f(g,b);var m=q.previous(),r=null,d,a;runtime.assert(Boolean(m),"No edit operations found in state");a=m.group;runtime.assert(void 0!==a,"Operation has no group");for(d=1;m&&m.group===a;){if(h===m.spec().optype){p=m;break}m=q.previous()}if(p){for(m=q.previous();m;){if(m.group!==a){if(2===d)break;a=m.group;d+=1}if(h===m.spec().optype){r=
m;break}m=q.previous()}p=c(e,p,r)}else p=!1;return p}p=e.spec().optype;h=new f(g,b);q=h.previous();runtime.assert(Boolean(q),"No edit operations found in state");p=p===q.spec().optype?c(e,q,h.previous()):!1;return p}return!1}};
// Input 112
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.TrivialUndoManager=function(f){function g(a){0<a.length&&(w=!0,n(a),w=!1)}function b(){z.emit(gui.UndoManager.signalUndoStackChanged,{undoAvailable:p.hasUndoStates(),redoAvailable:p.hasRedoStates()})}function c(){s!==a&&s!==y[y.length-1]&&y.push(s)}function e(a){var b=a.previousSibling||a.nextSibling;a.parentNode.removeChild(a);r.normalizeTextNodes(b)}function l(a){return Object.keys(a).map(function(b){return a[b]})}function h(a){function b(a){var g=a.spec();if(e[g.memberid])switch(g.optype){case "AddCursor":d[g.memberid]||
(d[g.memberid]=a,delete e[g.memberid],f-=1);break;case "MoveCursor":c[g.memberid]||(c[g.memberid]=a)}}var d={},c={},e={},f,g=a.pop();k.getMemberIds().forEach(function(a){e[a]=!0});for(f=Object.keys(e).length;g&&0<f;)g.reverse(),g.forEach(b),g=a.pop();return l(d).concat(l(c))}function q(){var f=d=k.cloneDocumentElement();r.getElementsByTagNameNS(f,m,"cursor").forEach(e);r.getElementsByTagNameNS(f,m,"anchor").forEach(e);c();s=a=h([a].concat(y));y.length=0;u.length=0;b()}var p=this,m="urn:webodf:names:cursor",
r=new core.DomUtils,d,a=[],n,k,s=[],y=[],u=[],z=new core.EventNotifier([gui.UndoManager.signalUndoStackChanged,gui.UndoManager.signalUndoStateCreated,gui.UndoManager.signalUndoStateModified,gui.TrivialUndoManager.signalDocumentRootReplaced]),x=f||new gui.UndoStateRules,w=!1;this.subscribe=function(a,b){z.subscribe(a,b)};this.unsubscribe=function(a,b){z.unsubscribe(a,b)};this.hasUndoStates=function(){return 0<y.length};this.hasRedoStates=function(){return 0<u.length};this.setDocument=function(a){k=
a};this.purgeInitialState=function(){y.length=0;u.length=0;a.length=0;s.length=0;d=null;b()};this.setInitialState=q;this.initialize=function(){d||q()};this.setPlaybackFunction=function(a){n=a};this.onOperationExecuted=function(d){w||(x.isEditOperation(d)&&(s===a||0<u.length)||!x.isPartOfOperationSet(d,s)?(u.length=0,c(),s=[d],y.push(s),z.emit(gui.UndoManager.signalUndoStateCreated,{operations:s}),b()):(s.push(d),z.emit(gui.UndoManager.signalUndoStateModified,{operations:s})))};this.moveForward=function(a){for(var d=
0,c;a&&u.length;)c=u.pop(),y.push(c),g(c),a-=1,d+=1;d&&(s=y[y.length-1],b());return d};this.moveBackward=function(c){for(var e=0;c&&y.length;)u.push(y.pop()),c-=1,e+=1;e&&(k.getMemberIds().forEach(function(a){k.removeCursor(a)}),k.setDocumentElement(d.cloneNode(!0)),z.emit(gui.TrivialUndoManager.signalDocumentRootReplaced,{}),g(a),y.forEach(g),s=y[y.length-1]||a,b());return e}};gui.TrivialUndoManager.signalDocumentRootReplaced="documentRootReplaced";
// Input 113
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.LazyStyleProperties=function(f,g){var b={};this.value=function(c){var e;b.hasOwnProperty(c)?e=b[c]:(e=g[c](),void 0===e&&f&&(e=f.value(c)),b[c]=e);return e};this.reset=function(c){f=c;b={}}};
odf.StyleParseUtils=function(){function f(b){var c,e;b=(b=/(-?[0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc)|(px))/.exec(b))?{value:parseFloat(b[1]),unit:b[3]}:null;e=b&&b.unit;"px"===e?c=b.value:"cm"===e?c=96*(b.value/2.54):"mm"===e?c=96*(b.value/25.4):"in"===e?c=96*b.value:"pt"===e?c=b.value/0.75:"pc"===e&&(c=16*b.value);return c}var g=odf.Namespaces.stylens;this.parseLength=f;this.parsePositiveLengthOrPercent=function(b,c,e){var g;b&&(g=parseFloat(b.substr(0,
b.indexOf("%"))),isNaN(g)&&(g=void 0));var h;void 0!==g?(e&&(h=e.value(c)),g=void 0===h?void 0:g*(h/100)):g=f(b);return g};this.getPropertiesElement=function(b,c,e){for(c=e?e.nextElementSibling:c.firstElementChild;null!==c&&(c.localName!==b||c.namespaceURI!==g);)c=c.nextElementSibling;return c}};
// Input 114
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.GraphicProperties=function(f,g,b){var c=this,e=odf.Namespaces.stylens,l=odf.Namespaces.svgns;this.verticalPos=function(){return c.data.value("verticalPos")};this.verticalRel=function(){return c.data.value("verticalRel")};this.horizontalPos=function(){return c.data.value("horizontalPos")};this.horizontalRel=function(){return c.data.value("horizontalRel")};this.strokeWidth=function(){return c.data.value("strokeWidth")};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{verticalPos:function(){var b=
f.getAttributeNS(e,"vertical-pos");return""===b?void 0:b},verticalRel:function(){var b=f.getAttributeNS(e,"vertical-rel");return""===b?void 0:b},horizontalPos:function(){var b=f.getAttributeNS(e,"horizontal-pos");return""===b?void 0:b},horizontalRel:function(){var b=f.getAttributeNS(e,"horizontal-rel");return""===b?void 0:b},strokeWidth:function(){var b=f.getAttributeNS(l,"stroke-width");return g.parseLength(b)}})};
odf.ComputedGraphicProperties=function(){var f;this.setGraphicProperties=function(g){f=g};this.verticalPos=function(){return f&&f.verticalPos()||"from-top"};this.verticalRel=function(){return f&&f.verticalRel()||"page"};this.horizontalPos=function(){return f&&f.horizontalPos()||"from-left"};this.horizontalRel=function(){return f&&f.horizontalRel()||"page"}};
// Input 115
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.PageLayoutProperties=function(f,g,b){var c=this,e=odf.Namespaces.fons;this.pageHeight=function(){return c.data.value("pageHeight")||1123};this.pageWidth=function(){return c.data.value("pageWidth")||794};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{pageHeight:function(){var b;f&&(b=f.getAttributeNS(e,"page-height"),b=g.parseLength(b));return b},pageWidth:function(){var b;f&&(b=f.getAttributeNS(e,"page-width"),b=g.parseLength(b));return b}})};
odf.PageLayout=function(f,g,b){var c=null;f&&(c=g.getPropertiesElement("page-layout-properties",f));this.pageLayout=new odf.PageLayoutProperties(c,g,b&&b.pageLayout)};odf.PageLayoutCache=function(){};odf.PageLayoutCache.prototype.getPageLayout=function(f){};odf.PageLayoutCache.prototype.getDefaultPageLayout=function(){};
// Input 116
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.ParagraphProperties=function(f,g,b){var c=this,e=odf.Namespaces.fons;this.marginTop=function(){return c.data.value("marginTop")};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{marginTop:function(){var c=f.getAttributeNS(e,"margin-top");return g.parsePositiveLengthOrPercent(c,"marginTop",b&&b.data)}})};
odf.ComputedParagraphProperties=function(){var f={},g=[];this.setStyleChain=function(b){g=b;f={}};this.marginTop=function(){var b,c;if(f.hasOwnProperty("marginTop"))b=f.marginTop;else{for(c=0;void 0===b&&c<g.length;c+=1)b=g[c].marginTop();f.marginTop=b}return b||0}};
// Input 117
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.TextProperties=function(f,g,b){var c=this,e=odf.Namespaces.fons;this.fontSize=function(){return c.data.value("fontSize")};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{fontSize:function(){var c=f.getAttributeNS(e,"font-size");return g.parsePositiveLengthOrPercent(c,"fontSize",b&&b.data)}})};
odf.ComputedTextProperties=function(){var f={},g=[];this.setStyleChain=function(b){g=b;f={}};this.fontSize=function(){var b,c;if(f.hasOwnProperty("fontSize"))b=f.fontSize;else{for(c=0;void 0===b&&c<g.length;c+=1)b=g[c].fontSize();f.fontSize=b}return b||12}};
// Input 118
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.MasterPage=function(f,g){var b;f?(b=f.getAttributeNS(odf.Namespaces.stylens,"page-layout-name"),this.pageLayout=g.getPageLayout(b)):this.pageLayout=g.getDefaultPageLayout()};odf.MasterPageCache=function(){};odf.MasterPageCache.prototype.getMasterPage=function(f){};
odf.StylePileEntry=function(f,g,b,c){this.masterPage=function(){var c=f.getAttributeNS(odf.Namespaces.stylens,"master-page-name"),g=null;c&&(g=b.getMasterPage(c));return g};(function(b){var l=f.getAttributeNS(odf.Namespaces.stylens,"family"),h=null;if("graphic"===l||"chart"===l)b.graphic=void 0===c?void 0:c.graphic,h=g.getPropertiesElement("graphic-properties",f,h),null!==h&&(b.graphic=new odf.GraphicProperties(h,g,b.graphic));if("paragraph"===l||"table-cell"===l||"graphic"===l||"presentation"===
l||"chart"===l)b.paragraph=void 0===c?void 0:c.paragraph,h=g.getPropertiesElement("paragraph-properties",f,h),null!==h&&(b.paragraph=new odf.ParagraphProperties(h,g,b.paragraph));if("text"===l||"paragraph"===l||"table-cell"===l||"graphic"===l||"presentation"===l||"chart"===l)b.text=void 0===c?void 0:c.text,h=g.getPropertiesElement("text-properties",f,h),null!==h&&(b.text=new odf.TextProperties(h,g,b.text))})(this)};
odf.StylePile=function(f,g){function b(b,d){var a,e;b.hasAttributeNS(c,"parent-style-name")&&(e=b.getAttributeNS(c,"parent-style-name"),-1===d.indexOf(e)&&(a=m(e,d)));return new odf.StylePileEntry(b,f,g,a)}var c=odf.Namespaces.stylens,e={},l={},h,q={},p={},m;m=function(c,d){var a=q[c],f;!a&&(f=e[c])&&(d.push(c),a=b(f,d),q[c]=a);return a};this.getStyle=function(c){var d=p[c]||q[c],a,f=[];d||(a=l[c],a||(a=e[c])&&f.push(c),a&&(d=b(a,f)));return d};this.addCommonStyle=function(b){var d;b.hasAttributeNS(c,
"name")&&(d=b.getAttributeNS(c,"name"),e.hasOwnProperty(d)||(e[d]=b))};this.addAutomaticStyle=function(b){var d;b.hasAttributeNS(c,"name")&&(d=b.getAttributeNS(c,"name"),l.hasOwnProperty(d)||(l[d]=b))};this.setDefaultStyle=function(c){void 0===h&&(h=b(c,[]))};this.getDefaultStyle=function(){return h}};odf.ComputedGraphicStyle=function(){this.text=new odf.ComputedTextProperties;this.paragraph=new odf.ComputedParagraphProperties;this.graphic=new odf.ComputedGraphicProperties};
odf.ComputedParagraphStyle=function(){this.text=new odf.ComputedTextProperties;this.paragraph=new odf.ComputedParagraphProperties};odf.ComputedTextStyle=function(){this.text=new odf.ComputedTextProperties};
odf.StyleCache=function(f){function g(a,b,d,c){b=d.getAttributeNS(b,"class-names");var e;if(b)for(b=b.split(" "),e=0;e<b.length;e+=1)if(d=b[e])c.push(a),c.push(d)}function b(a,b){var d=y.getStyleName("paragraph",a);void 0!==d&&(b.push("paragraph"),b.push(d));a.namespaceURI!==k||"h"!==a.localName&&"p"!==a.localName||g("paragraph",k,a,b);return b}function c(a,b,d){var c=[],e,f,g,h;for(e=0;e<a.length;e+=2)g=a[e],h=a[e+1],g=q[g],h=g.getStyle(h),void 0!==h&&(h=h[b],void 0!==h&&h!==f&&(c.push(h),f=h));
g=q[d];if(h=g.getDefaultStyle())h=h[b],void 0!==h&&h!==f&&c.push(h);return c}function e(a,d){var c=y.getStyleName("text",a),h=a.parentElement;void 0!==c&&(d.push("text"),d.push(c));"span"===a.localName&&a.namespaceURI===k&&g("text",k,a,d);if(!h||h===f)return d;h.namespaceURI!==k||"p"!==h.localName&&"h"!==h.localName?e(h,d):b(h,d);return d}function l(a){a=a.getAttributeNS(s,"family");return q[a]}var h=this,q,p,m,r,d,a,n,k=odf.Namespaces.textns,s=odf.Namespaces.stylens,y=new odf.StyleInfo,u=new odf.StyleParseUtils,
z,x,w,t,D,B;this.getComputedGraphicStyle=function(a){var b=[];a=y.getStyleName("graphic",a);void 0!==a&&(b.push("graphic"),b.push(a));a=b.join("/");var d=r[a];runtime.assert(0===b.length%2,"Invalid style chain.");void 0===d&&(d=new odf.ComputedGraphicStyle,d.graphic.setGraphicProperties(c(b,"graphic","graphic")[0]),d.text.setStyleChain(c(b,"text","graphic")),d.paragraph.setStyleChain(c(b,"paragraph","graphic")),r[a]=d);return d};this.getComputedParagraphStyle=function(a){a=b(a,[]);var d=a.join("/"),
e=m[d];runtime.assert(0===a.length%2,"Invalid style chain.");void 0===e&&(e=new odf.ComputedParagraphStyle,e.text.setStyleChain(c(a,"text","paragraph")),e.paragraph.setStyleChain(c(a,"paragraph","paragraph")),m[d]=e);return e};this.getComputedTextStyle=function(a){a=e(a,[]);var b=a.join("/"),d=p[b];runtime.assert(0===a.length%2,"Invalid style chain.");void 0===d&&(d=new odf.ComputedTextStyle,d.text.setStyleChain(c(a,"text","text")),p[b]=d);return d};this.getPageLayout=function(a){var b=B[a];b||((b=
D[a])?(b=new odf.PageLayout(b,u,t),B[a]=b):b=t);return b};this.getDefaultPageLayout=function(){return t};this.getMasterPage=function(a){var b=x[a];void 0===b&&((b=z[a])?(b=new odf.MasterPage(b,h),x[a]=b):b=null);return b};this.getDefaultMasterPage=function(){return w};this.update=function(){var b,c,e=null,g=null;p={};m={};r={};z={};x={};B={};D={};d=new odf.StylePile(u,h);a=new odf.StylePile(u,h);n=new odf.StylePile(u,h);q={text:d,paragraph:a,graphic:n};for(b=f.styles.firstElementChild;b;)b.namespaceURI===
s&&((c=l(b))?"style"===b.localName?c.addCommonStyle(b):"default-style"===b.localName&&c.setDefaultStyle(b):"default-page-layout"===b.localName&&(e=b)),b=b.nextElementSibling;t=new odf.PageLayout(e,u);for(b=f.automaticStyles.firstElementChild;b;)b.namespaceURI===s&&((c=l(b))&&"style"===b.localName?c.addAutomaticStyle(b):"page-layout"===b.localName&&(D[b.getAttributeNS(s,"name")]=b)),b=b.nextElementSibling;for(b=f.masterStyles.firstElementChild;b;)b.namespaceURI===s&&"master-page"===b.localName&&(g=
g||b,c=b,e=c.getAttributeNS(s,"name"),0<e.length&&!z.hasOwnProperty(e)&&(z[e]=c)),b=b.nextElementSibling;w=new odf.MasterPage(g,h)}};
// Input 119
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationTransformMatrix=function(){function f(b){b.position+=b.length;b.length*=-1}function g(b){var a=0>b.length;a&&f(b);return a}function b(b,a){function c(f){b[f]===a&&e.push(f)}var e=[];b&&["style:parent-style-name","style:next-style-name"].forEach(c);return e}function c(b,a){function c(e){b[e]===a&&delete b[e]}b&&["style:parent-style-name","style:next-style-name"].forEach(c)}function e(b){var a={};Object.keys(b).forEach(function(c){a[c]="object"===typeof b[c]?e(b[c]):b[c]});return a}function l(b,
a,c,e){var f,g=!1,h=!1,l,m=[];e&&e.attributes&&(m=e.attributes.split(","));b&&(c||0<m.length)&&Object.keys(b).forEach(function(a){var e=b[a],f;"object"!==typeof e&&(c&&(f=c[a]),void 0!==f?(delete b[a],h=!0,f===e&&(delete c[a],g=!0)):-1!==m.indexOf(a)&&(delete b[a],h=!0))});if(a&&a.attributes&&(c||0<m.length)){l=a.attributes.split(",");for(e=0;e<l.length;e+=1)if(f=l[e],c&&void 0!==c[f]||m&&-1!==m.indexOf(f))l.splice(e,1),e-=1,h=!0;0<l.length?a.attributes=l.join(","):delete a.attributes}return{majorChanged:g,
minorChanged:h}}function h(b){for(var a in b)if(b.hasOwnProperty(a))return!0;return!1}function q(b){for(var a in b)if(b.hasOwnProperty(a)&&("attributes"!==a||0<b.attributes.length))return!0;return!1}function p(b,a,c,e,f){var g=b?b[f]:null,m=a?a[f]:null,p=c?c[f]:null,r=e?e[f]:null,w;w=l(g,m,p,r);g&&!h(g)&&delete b[f];m&&!q(m)&&delete a[f];p&&!h(p)&&delete c[f];r&&!q(r)&&delete e[f];return w}function m(b,a){return{opSpecsA:[b],opSpecsB:[a]}}var r;r={AddCursor:{AddCursor:m,AddMember:m,AddStyle:m,ApplyDirectStyling:m,
InsertText:m,MoveCursor:m,RemoveCursor:m,RemoveMember:m,RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},AddMember:{AddStyle:m,InsertText:m,MoveCursor:m,RemoveCursor:m,RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMetadata:m,UpdateParagraphStyle:m},AddStyle:{AddStyle:m,ApplyDirectStyling:m,InsertText:m,MoveCursor:m,RemoveCursor:m,RemoveMember:m,RemoveStyle:function(d,a){var e,f=[d],g=[a];d.styleFamily===
a.styleFamily&&(e=b(d.setProperties,a.styleName),0<e.length&&(e={optype:"UpdateParagraphStyle",memberid:a.memberid,timestamp:a.timestamp,styleName:d.styleName,removedProperties:{attributes:e.join(",")}},g.unshift(e)),c(d.setProperties,a.styleName));return{opSpecsA:f,opSpecsB:g}},RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},ApplyDirectStyling:{ApplyDirectStyling:function(b,a,c){var f,g,l,m,q,r,w,t;m=[b];l=[a];if(!(b.position+b.length<=a.position||
b.position>=a.position+a.length)){f=c?b:a;g=c?a:b;if(b.position!==a.position||b.length!==a.length)r=e(f),w=e(g);a=p(g.setProperties,null,f.setProperties,null,"style:text-properties");if(a.majorChanged||a.minorChanged)l=[],b=[],m=f.position+f.length,q=g.position+g.length,g.position<f.position?a.minorChanged&&(t=e(w),t.length=f.position-g.position,b.push(t),g.position=f.position,g.length=q-g.position):f.position<g.position&&a.majorChanged&&(t=e(r),t.length=g.position-f.position,l.push(t),f.position=
g.position,f.length=m-f.position),q>m?a.minorChanged&&(r=w,r.position=m,r.length=q-m,b.push(r),g.length=m-g.position):m>q&&a.majorChanged&&(r.position=q,r.length=m-q,l.push(r),f.length=q-f.position),f.setProperties&&h(f.setProperties)&&l.push(f),g.setProperties&&h(g.setProperties)&&b.push(g),c?(m=l,l=b):m=b}return{opSpecsA:m,opSpecsB:l}},InsertText:function(b,a){a.position<=b.position?b.position+=a.text.length:a.position<=b.position+b.length&&(b.length+=a.text.length);return{opSpecsA:[b],opSpecsB:[a]}},
MoveCursor:m,RemoveCursor:m,RemoveStyle:m,RemoveText:function(b,a){var c=b.position+b.length,e=a.position+a.length,f=[b],g=[a];e<=b.position?b.position-=a.length:a.position<c&&(b.position<a.position?b.length=e<c?b.length-a.length:a.position-b.position:(b.position=a.position,e<c?b.length=c-e:f=[]));return{opSpecsA:f,opSpecsB:g}},SetParagraphStyle:m,SplitParagraph:function(b,a){a.position<b.position?b.position+=1:a.position<b.position+b.length&&(b.length+=1);return{opSpecsA:[b],opSpecsB:[a]}},UpdateMetadata:m,
UpdateParagraphStyle:m},InsertText:{InsertText:function(b,a,c){b.position<a.position?a.position+=b.text.length:b.position>a.position?b.position+=a.text.length:c?a.position+=b.text.length:b.position+=a.text.length;return{opSpecsA:[b],opSpecsB:[a]}},MoveCursor:function(b,a){var c=g(a);b.position<a.position?a.position+=b.text.length:b.position<a.position+a.length&&(a.length+=b.text.length);c&&f(a);return{opSpecsA:[b],opSpecsB:[a]}},RemoveCursor:m,RemoveMember:m,RemoveStyle:m,RemoveText:function(b,a){var c;
c=a.position+a.length;var e=[b],f=[a];c<=b.position?b.position-=a.length:b.position<=a.position?a.position+=b.text.length:(a.length=b.position-a.position,c={optype:"RemoveText",memberid:a.memberid,timestamp:a.timestamp,position:b.position+b.text.length,length:c-b.position},f.unshift(c),b.position=a.position);return{opSpecsA:e,opSpecsB:f}},SplitParagraph:function(b,a){b.position<=a.position?a.position+=b.text.length:b.position+=1;return{opSpecsA:[b],opSpecsB:[a]}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},
MoveCursor:{MoveCursor:m,RemoveCursor:function(b,a){return{opSpecsA:b.memberid===a.memberid?[]:[b],opSpecsB:[a]}},RemoveMember:m,RemoveStyle:m,RemoveText:function(b,a){var c=g(b),e=b.position+b.length,h=a.position+a.length;h<=b.position?b.position-=a.length:a.position<e&&(b.position<a.position?b.length=h<e?b.length-a.length:a.position-b.position:(b.position=a.position,b.length=h<e?e-h:0));c&&f(b);return{opSpecsA:[b],opSpecsB:[a]}},SetParagraphStyle:m,SplitParagraph:function(b,a){var c=g(b);a.position<
b.position?b.position+=1:a.position<b.position+b.length&&(b.length+=1);c&&f(b);return{opSpecsA:[b],opSpecsB:[a]}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},RemoveCursor:{RemoveCursor:function(b,a){var c=b.memberid===a.memberid;return{opSpecsA:c?[]:[b],opSpecsB:c?[]:[a]}},RemoveMember:m,RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},RemoveMember:{RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMetadata:m,
UpdateParagraphStyle:m},RemoveStyle:{RemoveStyle:function(b,a){var c=b.styleName===a.styleName&&b.styleFamily===a.styleFamily;return{opSpecsA:c?[]:[b],opSpecsB:c?[]:[a]}},RemoveText:m,SetParagraphStyle:function(b,a){var c,e=[b],f=[a];"paragraph"===b.styleFamily&&b.styleName===a.styleName&&(c={optype:"SetParagraphStyle",memberid:b.memberid,timestamp:b.timestamp,position:a.position,styleName:""},e.unshift(c),a.styleName="");return{opSpecsA:e,opSpecsB:f}},SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,
UpdateParagraphStyle:function(d,a){var e,f=[d],g=[a];"paragraph"===d.styleFamily&&(e=b(a.setProperties,d.styleName),0<e.length&&(e={optype:"UpdateParagraphStyle",memberid:d.memberid,timestamp:d.timestamp,styleName:a.styleName,removedProperties:{attributes:e.join(",")}},f.unshift(e)),d.styleName===a.styleName?g=[]:c(a.setProperties,d.styleName));return{opSpecsA:f,opSpecsB:g}}},RemoveText:{RemoveText:function(b,a){var c=b.position+b.length,e=a.position+a.length,f=[b],g=[a];e<=b.position?b.position-=
a.length:c<=a.position?a.position-=b.length:a.position<c&&(b.position<a.position?(b.length=e<c?b.length-a.length:a.position-b.position,c<e?(a.position=b.position,a.length=e-c):g=[]):(c<e?a.length-=b.length:a.position<b.position?a.length=b.position-a.position:g=[],e<c?(b.position=a.position,b.length=c-e):f=[]));return{opSpecsA:f,opSpecsB:g}},SplitParagraph:function(b,a){var c=b.position+b.length,e=[b],f=[a];a.position<=b.position?b.position+=1:a.position<c&&(b.length=a.position-b.position,c={optype:"RemoveText",
memberid:b.memberid,timestamp:b.timestamp,position:a.position+1,length:c-a.position},e.unshift(c));b.position+b.length<=a.position?a.position-=b.length:b.position<a.position&&(a.position=b.position);return{opSpecsA:e,opSpecsB:f}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},SetParagraphStyle:{UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},SplitParagraph:{SplitParagraph:function(b,a,c){b.position<a.position?a.position+=1:b.position>a.position?b.position+=1:b.position===a.position&&
(c?a.position+=1:b.position+=1);return{opSpecsA:[b],opSpecsB:[a]}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},UpdateMember:{UpdateMetadata:m,UpdateParagraphStyle:m},UpdateMetadata:{UpdateMetadata:function(b,a,c){var e,f=[b],g=[a];e=c?b:a;b=c?a:b;l(b.setProperties||null,b.removedProperties||null,e.setProperties||null,e.removedProperties||null);e.setProperties&&h(e.setProperties)||e.removedProperties&&q(e.removedProperties)||(c?f=[]:g=[]);b.setProperties&&h(b.setProperties)||b.removedProperties&&
q(b.removedProperties)||(c?g=[]:f=[]);return{opSpecsA:f,opSpecsB:g}},UpdateParagraphStyle:m},UpdateParagraphStyle:{UpdateParagraphStyle:function(b,a,c){var e,f=[b],g=[a];b.styleName===a.styleName&&(e=c?b:a,b=c?a:b,p(b.setProperties,b.removedProperties,e.setProperties,e.removedProperties,"style:paragraph-properties"),p(b.setProperties,b.removedProperties,e.setProperties,e.removedProperties,"style:text-properties"),l(b.setProperties||null,b.removedProperties||null,e.setProperties||null,e.removedProperties||
null),e.setProperties&&h(e.setProperties)||e.removedProperties&&q(e.removedProperties)||(c?f=[]:g=[]),b.setProperties&&h(b.setProperties)||b.removedProperties&&q(b.removedProperties)||(c?g=[]:f=[]));return{opSpecsA:f,opSpecsB:g}}}};this.passUnchanged=m;this.extendTransformations=function(b){Object.keys(b).forEach(function(a){var c=b[a],e,f=r.hasOwnProperty(a);runtime.log((f?"Extending":"Adding")+" map for optypeA: "+a);f||(r[a]={});e=r[a];Object.keys(c).forEach(function(b){var d=e.hasOwnProperty(b);
runtime.assert(a<=b,"Wrong order:"+a+", "+b);runtime.log("  "+(d?"Overwriting":"Adding")+" entry for optypeB: "+b);e[b]=c[b]})})};this.transformOpspecVsOpspec=function(b,a){var c=b.optype<=a.optype,e;runtime.log("Crosstransforming:");runtime.log(runtime.toJson(b));runtime.log(runtime.toJson(a));c||(e=b,b=a,a=e);(e=(e=r[b.optype])&&e[a.optype])?(e=e(b,a,!c),c||null===e||(e={opSpecsA:e.opSpecsB,opSpecsB:e.opSpecsA})):e=null;runtime.log("result:");e?(runtime.log(runtime.toJson(e.opSpecsA)),runtime.log(runtime.toJson(e.opSpecsB))):
runtime.log("null");return e}};
// Input 120
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationTransformer=function(){function f(b,c){for(var e,l,h=[],q=[];0<b.length&&c;){e=b.shift();e=g.transformOpspecVsOpspec(e,c);if(!e)return null;h=h.concat(e.opSpecsA);if(0===e.opSpecsB.length){h=h.concat(b);c=null;break}for(;1<e.opSpecsB.length;){l=f(b,e.opSpecsB.shift());if(!l)return null;q=q.concat(l.opSpecsB);b=l.opSpecsA}c=e.opSpecsB.pop()}c&&q.push(c);return{opSpecsA:h,opSpecsB:q}}var g=new ops.OperationTransformMatrix;this.getOperationTransformMatrix=function(){return g};this.transform=
function(b,c){for(var e,g=[];0<c.length;){e=f(b,c.shift());if(!e)return null;b=e.opSpecsA;g=g.concat(e.opSpecsB)}return{opSpecsA:b,opSpecsB:g}}};
// Input 121
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Server=function(){};ops.Server.prototype.connect=function(f,g){};ops.Server.prototype.networkStatus=function(){};ops.Server.prototype.login=function(f,g,b,c){};ops.Server.prototype.joinSession=function(f,g,b,c){};ops.Server.prototype.leaveSession=function(f,g,b,c){};ops.Server.prototype.getGenesisUrl=function(f){};
// Input 122
var webodf_css="@namespace draw url(urn:oasis:names:tc:opendocument:xmlns:drawing:1.0);\n@namespace fo url(urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0);\n@namespace office url(urn:oasis:names:tc:opendocument:xmlns:office:1.0);\n@namespace presentation url(urn:oasis:names:tc:opendocument:xmlns:presentation:1.0);\n@namespace style url(urn:oasis:names:tc:opendocument:xmlns:style:1.0);\n@namespace svg url(urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0);\n@namespace table url(urn:oasis:names:tc:opendocument:xmlns:table:1.0);\n@namespace text url(urn:oasis:names:tc:opendocument:xmlns:text:1.0);\n@namespace webodfhelper url(urn:webodf:names:helper);\n@namespace cursor url(urn:webodf:names:cursor);\n@namespace editinfo url(urn:webodf:names:editinfo);\n@namespace annotation url(urn:webodf:names:annotation);\n@namespace dc url(http://purl.org/dc/elements/1.1/);\n@namespace svgns url(http://www.w3.org/2000/svg);\n\noffice|document > *, office|document-content > * {\n  display: none;\n}\noffice|body, office|document {\n  display: inline-block;\n  position: relative;\n}\n\ntext|p, text|h {\n  display: block;\n  padding: 0;\n  margin: 0;\n  line-height: normal;\n  position: relative;\n  min-height: 1.3em; /* prevent empty paragraphs and headings from collapsing if they are empty */\n}\n*[webodfhelper|containsparagraphanchor] {\n  position: relative;\n}\ntext|s {\n    white-space: pre;\n}\ntext|tab {\n  display: inline;\n  white-space: pre;\n}\ntext|tracked-changes {\n  /*Consumers that do not support change tracking, should ignore changes.*/\n  display: none;\n}\noffice|binary-data {\n  display: none;\n}\noffice|text {\n  display: block;\n  text-align: left;\n  overflow: visible;\n  word-wrap: break-word;\n}\n\noffice|text::selection {\n  /** Let's not draw selection highlight that overflows into the office|text\n   * node when selecting content across several paragraphs\n   */\n  background: transparent;\n}\n\n.webodf-virtualSelections *::selection {\n  background: transparent;\n}\n.webodf-virtualSelections *::-moz-selection {\n  background: transparent;\n}\n\noffice|text * draw|text-box {\n/** only for text documents */\n    display: block;\n    border: 1px solid #d3d3d3;\n}\noffice|text draw|frame {\n  /** make sure frames are above the main text. */\n  z-index: 1;\n}\noffice|spreadsheet {\n  display: block;\n  border-collapse: collapse;\n  empty-cells: show;\n  font-family: sans-serif;\n  font-size: 10pt;\n  text-align: left;\n  page-break-inside: avoid;\n  overflow: hidden;\n}\noffice|presentation {\n  display: inline-block;\n  text-align: left;\n}\n#shadowContent {\n  display: inline-block;\n  text-align: left;\n}\ndraw|page {\n  display: block;\n  position: relative;\n  overflow: hidden;\n}\npresentation|notes, presentation|footer-decl, presentation|date-time-decl {\n    display: none;\n}\n@media print {\n  draw|page {\n    border: 1pt solid black;\n    page-break-inside: avoid;\n  }\n  presentation|notes {\n    /*TODO*/\n  }\n}\noffice|spreadsheet text|p {\n  border: 0px;\n  padding: 1px;\n  margin: 0px;\n}\noffice|spreadsheet table|table {\n  margin: 3px;\n}\noffice|spreadsheet table|table:after {\n  /* show sheet name the end of the sheet */\n  /*content: attr(table|name);*/ /* gives parsing error in opera */\n}\noffice|spreadsheet table|table-row {\n  counter-increment: row;\n}\noffice|spreadsheet table|table-row:before {\n  width: 3em;\n  background: #cccccc;\n  border: 1px solid black;\n  text-align: center;\n  content: counter(row);\n  display: table-cell;\n}\noffice|spreadsheet table|table-cell {\n  border: 1px solid #cccccc;\n}\ntable|table {\n  display: table;\n}\ndraw|frame table|table {\n  width: 100%;\n  height: 100%;\n  background: white;\n}\ntable|table-header-rows {\n  display: table-header-group;\n}\ntable|table-row {\n  display: table-row;\n}\ntable|table-column {\n  display: table-column;\n}\ntable|table-cell {\n  width: 0.889in;\n  display: table-cell;\n  word-break: break-all; /* prevent long words from extending out the table cell */\n}\ndraw|frame {\n  display: block;\n}\ndraw|image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  top: 0px;\n  left: 0px;\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  -moz-background-size: 100% 100%;\n}\n/* only show the first image in frame */\ndraw|frame > draw|image:nth-of-type(n+2) {\n  display: none;\n}\ntext|list:before {\n    display: none;\n    content:\"\";\n}\ntext|list {\n    display: block;\n    counter-reset: list;\n}\ntext|list-item {\n    display: block;\n}\ntext|number {\n    display:none;\n}\n\ntext|a {\n    color: blue;\n    text-decoration: underline;\n    cursor: pointer;\n}\n.webodf-inactiveLinks text|a {\n    cursor: text;\n}\ntext|note-citation {\n    vertical-align: super;\n    font-size: smaller;\n}\ntext|note-body {\n    display: none;\n}\ntext|note:hover text|note-citation {\n    background: #dddddd;\n}\ntext|note:hover text|note-body {\n    display: block;\n    left:1em;\n    max-width: 80%;\n    position: absolute;\n    background: #ffffaa;\n}\ntext|bibliography-source {\n  display: none;\n}\nsvg|title, svg|desc {\n    display: none;\n}\nvideo {\n    width: 100%;\n    height: 100%\n}\n\n/* below set up the cursor */\ncursor|anchor {\n    display: none;\n}\n\ncursor|cursor {\n    display: none;\n}\n\n.webodf-caretOverlay {\n    position: absolute;\n    top: 5%; /* push down the caret; 0px can do the job, 5% looks better, 10% is a bit over */\n    height: 1em;\n    margin-left: -1px;\n    z-index: 10;\n    pointer-events: none;\n}\n\n.webodf-caretOverlay .caret {\n    position: absolute;\n    border-left: 2px solid black;\n    top: 0;\n    bottom: 0;\n}\n\n.webodf-caretOverlay .handle {\n    margin-top: 5px;\n    padding-top: 3px;\n    margin-left: auto;\n    margin-right: auto;\n    width: 64px !important;\n    height: 68px !important;\n    border-radius: 5px;\n    opacity: 0.3;\n    text-align: center;\n    background-color: black !important;\n    box-shadow: 0px 0px 5px rgb(90, 90, 90);\n    border: 1px solid black;\n\n    top: -85px !important;\n    left: -32px !important;\n}\n\n.webodf-caretOverlay .handle > img {\n    box-shadow: 0px 0px 5px rgb(90, 90, 90) inset;\n    background-color: rgb(200, 200, 200);\n    border-radius: 5px;\n    border: 2px solid;\n    height: 60px !important;\n    width: 60px !important;\n    display: block;\n    margin: auto;\n}\n\n.webodf-caretOverlay .handle.active {\n    opacity: 0.8;\n}\n\n.webodf-caretOverlay .handle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 43%;\n}\n\n.webodf-caretSizer {\n    display: inline-block; /* inline-block is necessary so the width can be set to 0 */\n    width: 0; /* the caret sizer shouldn't take up any horizontal space */\n    visibility: hidden; /* \"hidden\" means the client rects are still calculated, but the node content is not shown */\n}\n\n/** Input Method Editor input pane & behaviours */\n/* not within a cursor */\n#eventTrap {\n    height: auto;\n    display: block;\n    position: absolute;\n    bottom: 0;\n    right: 0;\n    width: 1px;\n    outline: none;\n    opacity: 0;\n    color: rgba(255, 255, 255, 0); /* hide the blinking caret by setting the colour to fully transparent */\n    overflow: hidden; /* The overflow visibility is used to hide and show characters being entered */\n    pointer-events: none;\n}\n\n/* within a cursor */\ncursor|cursor > #composer {\n    text-decoration: underline;\n}\n\ncursor|cursor[cursor|caret-sizer-active=\"true\"],\ncursor|cursor[cursor|composing=\"true\"] {\n    display: inline;\n}\n\neditinfo|editinfo {\n    /* Empty or invisible display:inline elements respond very badly to mouse selection.\n       Inline blocks are much more reliably selectable in Chrome & friends */\n    display: inline-block;\n}\n\n.editInfoMarker {\n    position: absolute;\n    width: 10px;\n    height: 100%;\n    left: -20px;\n    opacity: 0.8;\n    top: 0;\n    border-radius: 5px;\n    background-color: transparent;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n}\n.editInfoMarker:hover {\n    box-shadow: 0px 0px 8px rgba(0, 0, 0, 1);\n}\n\n.editInfoHandle {\n    position: absolute;\n    background-color: black;\n    padding: 5px;\n    border-radius: 5px;\n    opacity: 0.8;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    bottom: 100%;\n    margin-bottom: 10px;\n    z-index: 3;\n    left: -25px;\n}\n.editInfoHandle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 5px;\n}\n.editInfo {\n    font-family: sans-serif;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    color: white;\n    width: 100%;\n    height: 12pt;\n}\n.editInfoColor {\n    float: left;\n    width: 10pt;\n    height: 10pt;\n    border: 1px solid white;\n}\n.editInfoAuthor {\n    float: left;\n    margin-left: 5pt;\n    font-size: 10pt;\n    text-align: left;\n    height: 12pt;\n    line-height: 12pt;\n}\n.editInfoTime {\n    float: right;\n    margin-left: 30pt;\n    font-size: 8pt;\n    font-style: italic;\n    color: yellow;\n    height: 12pt;\n    line-height: 12pt;\n}\n\n.annotationWrapper {\n    display: inline;\n    position: relative;\n}\n\n.annotationRemoveButton:before {\n    content: '\u00d7';\n    color: white;\n    padding: 5px;\n    line-height: 1em;\n}\n\n.annotationRemoveButton {\n    width: 20px;\n    height: 20px;\n    border-radius: 10px;\n    background-color: black;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    position: absolute;\n    top: -10px;\n    left: -10px;\n    z-index: 3;\n    text-align: center;\n    font-family: sans-serif;\n    font-style: normal;\n    font-weight: normal;\n    text-decoration: none;\n    font-size: 15px;\n}\n.annotationRemoveButton:hover {\n    cursor: pointer;\n    box-shadow: 0px 0px 5px rgba(0, 0, 0, 1);\n}\n\n.annotationNote {\n    width: 4cm;\n    position: absolute;\n    display: inline;\n    z-index: 10;\n    top: 0;\n}\n.annotationNote > office|annotation {\n    display: block;\n    text-align: left;\n}\n\n.annotationConnector {\n    position: absolute;\n    display: inline;\n    top: 0;\n    z-index: 2;\n    border-top: 1px dashed brown;\n}\n.annotationConnector.angular {\n    -moz-transform-origin: left top;\n    -webkit-transform-origin: left top;\n    -ms-transform-origin: left top;\n    transform-origin: left top;\n}\n.annotationConnector.horizontal {\n    left: 0;\n}\n.annotationConnector.horizontal:before {\n    content: '';\n    display: inline;\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: brown transparent transparent transparent;\n    top: -1px;\n    left: -5px;\n}\n\noffice|annotation {\n    width: 100%;\n    height: 100%;\n    display: none;\n    background: rgb(198, 238, 184);\n    background: -moz-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -webkit-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -o-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -ms-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: linear-gradient(180deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    box-shadow: 0 3px 4px -3px #ccc;\n}\n\noffice|annotation > dc|creator {\n    display: block;\n    font-size: 10pt;\n    font-weight: normal;\n    font-style: normal;\n    font-family: sans-serif;\n    color: white;\n    background-color: brown;\n    padding: 4px;\n}\noffice|annotation > dc|date {\n    display: block;\n    font-size: 10pt;\n    font-weight: normal;\n    font-style: normal;\n    font-family: sans-serif;\n    border: 4px solid transparent;\n    color: black;\n}\noffice|annotation > text|list {\n    display: block;\n    padding: 5px;\n}\n\n/* This is very temporary CSS. This must go once\n * we start bundling webodf-default ODF styles for annotations.\n */\noffice|annotation text|p {\n    font-size: 10pt;\n    color: black;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    font-family: sans-serif;\n}\n\n#annotationsPane {\n    background-color: #EAEAEA;\n    width: 4cm;\n    height: 100%;\n    display: none;\n    position: absolute;\n    outline: 1px solid #ccc;\n}\n\n.webodf-annotationHighlight {\n    background-color: yellow;\n    position: relative;\n}\n\n.webodf-selectionOverlay {\n    position: absolute;\n    pointer-events: none;\n    top: 0;\n    left: 0;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 15;\n}\n.webodf-selectionOverlay > polygon {\n    fill-opacity: 0.3;\n    stroke-opacity: 0.8;\n    stroke-width: 1;\n    fill-rule: evenodd;\n}\n\n.webodf-selectionOverlay > .webodf-draggable {\n    fill-opacity: 0.8;\n    stroke-opacity: 0;\n    stroke-width: 8;\n    pointer-events: all;\n    display: none;\n\n    -moz-transform-origin: center center;\n    -webkit-transform-origin: center center;\n    -ms-transform-origin: center center;\n    transform-origin: center center;\n}\n\n#imageSelector {\n    display: none;\n    position: absolute;\n    border-style: solid;\n    border-color: black;\n}\n\n#imageSelector > div {\n    width: 5px;\n    height: 5px;\n    display: block;\n    position: absolute;\n    border: 1px solid black;\n    background-color: #ffffff;\n}\n\n#imageSelector > .topLeft {\n    top: -4px;\n    left: -4px;\n}\n\n#imageSelector > .topRight {\n    top: -4px;\n    right: -4px;\n}\n\n#imageSelector > .bottomRight {\n    right: -4px;\n    bottom: -4px;\n}\n\n#imageSelector > .bottomLeft {\n    bottom: -4px;\n    left: -4px;\n}\n\n#imageSelector > .topMiddle {\n    top: -4px;\n    left: 50%;\n    margin-left: -2.5px; /* half of the width defined in #imageSelector > div */\n}\n\n#imageSelector > .rightMiddle {\n    top: 50%;\n    right: -4px;\n    margin-top: -2.5px; /* half of the height defined in #imageSelector > div */\n}\n\n#imageSelector > .bottomMiddle {\n    bottom: -4px;\n    left: 50%;\n    margin-left: -2.5px; /* half of the width defined in #imageSelector > div */\n}\n\n#imageSelector > .leftMiddle {\n    top: 50%;\n    left: -4px;\n    margin-top: -2.5px; /* half of the height defined in #imageSelector > div */\n}\n\ndiv.webodf-customScrollbars::-webkit-scrollbar\n{\n    width: 8px;\n    height: 8px;\n    background-color: transparent;\n}\n\ndiv.webodf-customScrollbars::-webkit-scrollbar-track\n{\n    background-color: transparent;\n}\n\ndiv.webodf-customScrollbars::-webkit-scrollbar-thumb\n{\n    background-color: #444;\n    border-radius: 4px;\n}\n\n.webodf-hyperlinkTooltip {\n    display: none;\n    color: white;\n    background-color: black;\n    border-radius: 5px;\n    box-shadow: 2px 2px 5px gray;\n    padding: 3px;\n    position: absolute;\n    max-width: 210px;\n    text-align: left;\n    word-break: break-all;\n    z-index: 16;\n}\n\n.webodf-hyperlinkTooltipText {\n    display: block;\n    font-weight: bold;\n}\n";
