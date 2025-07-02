
relPathToRootDir = document.currentScript.getAttribute("relPathToRootDir");

footerRequest = new XMLHttpRequest();
footerRequest.open('GET', relPathToRootDir + "/Pages/footer.html");

footerRequest.onload = function(){
    footerContent = footerRequest.responseText;
    footerContent = footerContent.replaceAll("relPathToRootDir", relPathToRootDir);
    document.getElementById("footer").innerHTML = footerContent;
}

footerRequest.send();
