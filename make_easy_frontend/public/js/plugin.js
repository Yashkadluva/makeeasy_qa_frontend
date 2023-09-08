var iframe = null;
window.addEventListener('message', function (event) {
    document.body.removeChild(iframe)
});
// version : v1.0
let pluginData = {};
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText)
        pluginData = data?.result;
    }
};

var companyId = 1;
var querystring = document.currentScript.src.substring(document.currentScript.src.indexOf("?"));
var urlParams = new URLSearchParams(querystring);
if (urlParams.getAll('id')) {
    companyId = urlParams.getAll('id');
}

xhttp.open("GET", "https://capitaldenapi.winayak.com/api/company/" + companyId, true);
xhttp.send();

 // http://localhost:3001/
 // http://www.saimobile2.com:96/
function loadPlugin() {
    if (pluginData?.logo && pluginData?.backgroungColor) {
        localStorage.setItem("themedata", JSON.stringify(pluginData))
        iframe = document.createElement("iframe");
        iframe.id = "plugin"
        iframe.src = "http://www.saimobile2.com:96/?logo=" + pluginData.logo + "&headerBackgroundColor=" + pluginData.headerBackgroundColor.replace("#", '') + "&buttonBackgroundColor=" + pluginData.buttonBackgroundColor.replace("#", '') + "&optionBackgroundColor=" + pluginData.optionBackgroundColor.replace("#", '')  + "&activeBackgroundColor=" + pluginData.activeBackgroundColor.replace("#", '') ;
        iframe.width = "100%";
        iframe.height = "100%"
        iframe.style.position = "fixed"
        iframe.style.top = 0
        iframe.style.left = 0
        iframe.style.zIndex = 10
        document.body.appendChild(iframe);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
};