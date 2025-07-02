
navButtonName = document.currentScript.getAttribute("navButtonName");
relPathToRootDir = document.currentScript.getAttribute("relPathToRootDir");

homeStyle = "";
aboutStyle = "";
awardStyle = "";
publicationStyle = "";
groupStyle = "";
style = "background: rgb(46, 46, 46);"

if (navButtonName === "Home"){ homeStyle = style; }
if (navButtonName === "About"){ aboutStyle = style; }
if (navButtonName === "Awards"){ awardStyle = style; } 
if (navButtonName === "Publications"){ publicationStyle = style; } 
if (navButtonName === "Group"){ groupStyle = style; }

headerRequest = new XMLHttpRequest();
headerRequest.open('GET', relPathToRootDir + '/Pages/header.html');

headerRequest.onload = function() {
    headerContent = headerRequest.responseText;
    
    headerContent = headerContent.replaceAll("relPathToRootDir", relPathToRootDir);
    headerContent = headerContent.replaceAll("id=\"homeStyle\"", "style=\"" + homeStyle + "\"");
    headerContent = headerContent.replaceAll("id=\"aboutStyle\"", "style=\"" + aboutStyle + "\"");
    headerContent = headerContent.replaceAll("id=\"awardStyle\"", "style=\"" + awardStyle + "\"");
    headerContent = headerContent.replaceAll("id=\"publicationStyle\"", "style=\"" + publicationStyle + "\"");
    headerContent = headerContent.replaceAll("id=\"groupStyle\"", "style=\"" + groupStyle + "\"");

    document.getElementById("header").innerHTML = headerContent;
} 

headerRequest.send();

