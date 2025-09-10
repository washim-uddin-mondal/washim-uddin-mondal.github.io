function stickynav(){
    let headerY = document.getElementById("name").offsetHeight;
    
    if (window.scrollY > headerY) {
        navBar.classList.add("sticky");
        document.getElementById("content").style.paddingTop = '40px';
      } else {
        navBar.classList.remove("sticky");
        document.getElementById("content").style.paddingTop = '0px';
      }
}

function loadAchievements(){
    dataLocation = '../Data/achievementsData.json';
    columns = Array("Year", "Award");
    tableID = "achievementTable";

    loadData(dataLocation, columns, tableID);


    dataLocation = '../Data/teachingRecognition.json';
    columns = Array("Semester", "Teaching Recognition");
    tableID = "teachingRecognitionTable";

    loadData(dataLocation, columns, tableID);
}

function loadNews(){
    dataLocation = './Data/news.json';
    columns = Array("Date", "News");
    tableID = "newsTable";

    loadData(dataLocation, columns, tableID);
}

function loadCurrentMembers(){
    dataLocation = '../Data/currentMembers.json';
    columns = Array("Members", "Degree", "Research Area");
    tableID = "currentMembers";

    loadData(dataLocation, columns, tableID);
}

function loadProjectOpenings(){
    dataLocation = '../Data/projectOpenings.json';
    columns = Array("Position", "Deadline", "Sponsor", "Details");
    tableID = "projectOpenings";

    loadData(dataLocation, columns, tableID);
}

function loadJournalPublications(){
    dataLocation = '../Data/journalData.json';
    columns = Array("", "Journals");
    tableID = "journalTable";

    loadPublicationData(dataLocation, columns, tableID);
}

function loadConferencePublications(){
    dataLocation = '../Data/conferenceData.json';
    columns = Array("", "Conferences");
    tableID = "conferenceTable";

    loadPublicationData(dataLocation, columns, tableID);
}

function loadBookPublications(){
    dataLocation = '../Data/bookData.json';
    columns = Array("", "Books/Monographs");
    tableID = "bookTable";

    loadPublicationData(dataLocation, columns, tableID);
}

function loadSummaryPublications(){
    dataLocation = '../Data/journalData.json';
    columns = Array("Journal", "Count");
    tableID = "summaryTableJournal";

    loadSummaryData("Journal", dataLocation, columns, tableID);

    dataLocation = '../Data/conferenceData.json';
    columns = Array("Conference", "Count");
    tableID = "summaryTableConference";

    loadSummaryData("Conference", dataLocation, columns, tableID);

    dataLocation = '../Data/bookData.json';
    columns = Array("Books/Monographs", "Count");
    tableID = "summaryTableBook";

    loadSummaryData("Books/Monographs", dataLocation, columns, tableID);
}

function loadSummaryData(type, dataLocation, columns, tableID){
    var pageRequest = new XMLHttpRequest();
    pageRequest.open('GET', dataLocation);
    
    pageRequest.onload = function () {
        var jsonTempContent = JSON.parse(pageRequest.responseText);
        var jsonContent = [];

        for(i=0; i < jsonTempContent.length; i++){
            ifOld = false;
            for(j=0; j < jsonContent.length; j++){
                if(jsonContent[j][type] == jsonTempContent[i]["Journal/Conference"]){
                    jsonContent[j]["Count"] += 1;
                    ifOld = true;
                    break;
                }
            }

            if (ifOld == false){
                if (type == "Journal"){
                    jsonContent.push(
                        {
                        "Journal": jsonTempContent[i]["Journal/Conference"], 
                        "Count": 1
                        }
                    );
                }
                if (type == "Conference"){
                    jsonContent.push(
                        {
                        "Conference": jsonTempContent[i]["Journal/Conference"], 
                        "Count": 1
                        }
                    );
                }
                if (type == "Books/Monographs"){
                    jsonContent.push(
                        {
                        "Books/Monographs": jsonTempContent[i]["Journal/Conference"], 
                        "Count": 1
                        }
                    );
                }

            }
        }

        htmlContent = makeHTMLTable(jsonContent, columns, tableID);
        document.getElementById(tableID).innerHTML = htmlContent;
    }

    pageRequest.send();
}

function loadPublicationData(dataLocation, columns, tableID){
    var pageRequest = new XMLHttpRequest();
    pageRequest.open('GET', dataLocation);
    
    pageRequest.onload = function () {
        var jsonContent = JSON.parse(pageRequest.responseText);

        for(i=0; i < jsonContent.length; i++){
            jsonContent[i][columns[1]] = jsonContent[i]["Authors"] + ", \"<a href=" + jsonContent[i]["URL"] + " target=\"_blank\">" + jsonContent[i]["Title"] + "</a>\", <i>" + jsonContent[i]["Journal/Conference"] + "</i>, " + jsonContent[i]["Year"] + ".";
            jsonContent[i][""] = "["+ (i+1) + "]";
        }
        htmlContent = makeHTMLTable(jsonContent, columns, tableID);
        document.getElementById(tableID).innerHTML = htmlContent;
    }

    pageRequest.send();
}

function loadData(dataLocation, columns, tableID){
    var pageRequest = new XMLHttpRequest();
    pageRequest.open('GET', dataLocation);
    
    pageRequest.onload = function () {
        var jsonContent = JSON.parse(pageRequest.responseText);
        htmlContent = makeHTMLTable(jsonContent, columns, tableID);
        document.getElementById(tableID).innerHTML = htmlContent;
    }

    pageRequest.send();
}

function makeHTMLTable(jsonContent, columns, tableID){
    oddStyle = "style=\"background: #DDDDDD;\"";
    headStyle = "style=\"background: #DDDDDD;\""

    htmlTable = "<tr " + headStyle +  ">";
    for (j=0; j < columns.length; j++){
        htmlTable += "<th>" + columns[j] + "</th>";
    }  
    htmlTable += "</tr>";

    for (i=0; i < jsonContent.length; i++){
        if (i%2 == 0){
            htmlTable += "<tr>";
        } else {
            htmlTable += "<tr " + oddStyle + ">";
        }
 
        for (j=0; j < columns.length; j++){        
            if (tableID == "bookTable" && j==1) {
                frontCover = "<div class=\"rowJustifiedContainer\"> <img class=\"frontCover\" src=\"" + jsonContent[i]["FrontCover"] + "\" alt=\"Front Cover\"> </div> <br>";
                addContent = "<td>" + frontCover + jsonContent[i][columns[j]] + "</td>";
            } else {
                addContent = "<td>" + jsonContent[i][columns[j]] + "</td>";
            }
            htmlTable += addContent;
        }        
        htmlTable += "</tr>";   
    }

    return htmlTable;
}