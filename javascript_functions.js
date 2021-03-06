var app = angular.module("acronymApp", ["ngSanitize"]);

app.controller("acronymCtrl", function($scope, $http, $location)
{

  $scope.examine = function examine(index)
  {
    var acronym = $scope.jsObj.acronym[index];
    var definition = $scope.jsObj.definition[index];
  };

  /* Clears the add acronym form in the case that user clicks on "Back" button */
  $scope.toggleElements = function toggleElements()
  {
    $scope.addAcronymElements = !($scope.addAcronymElements);
    // Clear the input boxes in the add form
    document.getElementById("abbrev").value = "";
    document.getElementById("def").value = "";
    document.getElementById("contextLink").value = "";
    document.getElementById("comment").value = "";
    document.getElementById("businessGroup").value = "No group specified";
    document.getElementById("classTag").value = "No classification specified";
  };

  /* Adds the acronym and its information to the database when user clicks on "Add!" button */
  $scope.add = function add()
  {
    var abbrev = encodeURIComponent(insertSlashes(document.getElementById("abbrev").value));
    var def = encodeURIComponent(insertSlashes(document.getElementById("def").value));
    var comment = encodeURIComponent(insertSlashes(document.getElementById("comment").value));
    var business = encodeURIComponent(document.getElementById("businessGroup").value);
    var classification = encodeURIComponent(document.getElementById("classTag").value);
    var contextLinkVal = encodeURIComponent(insertSlashes(document.getElementById("contextLink").value));
    // Check if abbreviation or definition fields are blank
    if (abbrev == "")
    {
      // Launch modal to alert user to add abbreviation
      $(document).ready(function()
      {
          $("#abbrevAlert").modal();
      });
      return;
    }
    if (def == "")
    {
      // Launch modal to alert user to add definition
      $(document).ready(function()
      {
          $("#defAlert").modal();
      });
      return;
    }
    if (contextLinkVal == "")
      contextLinkVal = "None";

    if (comment == "")
      comment = "No comment";

    var req = new XMLHttpRequest();
    req.open("POST","/add/"+abbrev+"/"+def+"/"+comment+"/"+business+"/"+classification+"/"+contextLinkVal, true);
    req.onreadystatechange = pollStateChange;   // when server response is ready, call the function
    function pollStateChange()
    {
      if (this.readyState == 4 && this.status == 200)
      {
        // Launch success modal to indicate acronym added
        $(document).ready(function()
        {
            $("#successModal").modal();
        });
      }
      else
      {
        console.log("Error", req.statusText);
      }
    }
    req.send(null);
  }

  /* Indicates what filter the user has selected and sets the filter value to that */
  $scope.filterSearch = function filterSearch(filterVal)
  {
    $scope.filter = filterVal;
  };

  /* Gathers the acronym information and displays info modal when user clicks on a search result */
  $scope.infoPage = function infoPage(index)
  {
    if ($scope.records[0] == "No results")
        return;
    var acronym = $scope.jsObj.acronym[index];
    var def = $scope.jsObj.definition[index];
    var comment = $scope.jsObj.comment[index];
    var classification = $scope.jsObj.classification[index];
    // Update the scope with the acronym's information
    $scope.acronym = acronym;
    $scope.definition = def;
    $scope.comment = comment;
    $scope.classification = classification;

    // Send request to MySQL acronym database to increment clicks and get data from wikipedia page
    var req = new XMLHttpRequest();
    acronym = encodeURIComponent(insertSlashes(acronym));
    req.open("POST","/increment/"+acronym+"/"+def, true);
    $("#loadingModal").modal();
    // when server response is ready, call the function
    req.onreadystatechange = function()
    {
      {
        if (this.readyState == 4 && this.status == 200)
        {
          var jsonResults = JSON.parse(req.responseText); // parse the JSON text into javascript object
          if (jsonResults == -1)
          {
            $scope.context = "";
            $scope.sourcetxt = "";
            $scope.description = "";
            $scope.clicks = $scope.jsObj.clicks[index]++;
            $scope.business = getGroupLink($scope.jsObj.business[index]);
          }
          else
          {
            $scope.description = jsonResults.description;
            $scope.sourcetxt = "Source: ";
            $scope.context = jsonResults.page_url;

            $scope.business = "";
            var businesses = jsonResults.businesses;
            for (x = 0; x < businesses.length; x++)
            {
              if (x == businesses.length - 1)
                  $scope.business += getGroupLink(businesses[x]);
              else
                  $scope.business += getGroupLink(businesses[x]) + ", ";
            }

            $scope.clicks = $scope.jsObj.clicks[index]++;
          }
          $scope.$apply();
          $("#loadingModal").modal('hide'); // Hide the loading screen modal
          $("#infoModal").modal();  // Launch the information modal
        }
      }
    };

    req.send(null);
  };

  /* Generates results when user types into search bar */
  $scope.search = function search()
  {
    var str = document.getElementById("searchInput").value;
    var filter = $scope.filter;
    var req = new XMLHttpRequest();
    $scope.records = [];
    // note for self: by saying $scope for the jsObj, i'm making the jsObj global so I can access it through other functions
    $scope.jsObj = {   // javascript object that keeps track of the resulting acronyms and their info when user searches
      acronym: [],
      definition: [],
      comment: [],
      clicks: [],
      business: [],
      classification: [],
      context: []
    };

    if (str.length == 0)
    {
      $scope.setDisplay = false;
      $scope.text1 = false;
      $scope.text2 = false;
    }
    else
    {
      if (str.includes("'") || str.includes("."))  // if string contains a single quote or period, insert backslashes before those characters to prevent server crash
          str = insertSlashes(str);

      str = encodeURIComponent(str);
      req.open("POST","/query/"+str+"/"+filter, true);
      // When server response is ready, call the function
      req.onreadystatechange = function()
      {
        {
          if (this.readyState == 4 && this.status == 200)
          {
            var jsonResults = JSON.parse(req.responseText); // parse the JSON text into javascript object
            if (jsonResults == -1)
            {
              $scope.records = ["No results"];
            }
            else
            {
              for (i in jsonResults.acronym)
              {
                $scope.records.push(jsonResults.acronym[i] + ": " + jsonResults.definition[i]); // only the acronym and its definition are displayed in search results box

                $scope.jsObj.acronym.push(jsonResults.acronym[i]);
                $scope.jsObj.definition.push(jsonResults.definition[i]);
                $scope.jsObj.comment.push(jsonResults.comment[i]);
                $scope.jsObj.clicks.push(jsonResults.clicks[i]);
                $scope.jsObj.business.push(jsonResults.business[i]);
                $scope.jsObj.classification.push(jsonResults.classification[i]);
                $scope.jsObj.context.push(jsonResults.context[i]);
              }
            }
            $scope.setDisplay = true;
            $scope.text1 = true;
            $scope.text2 = true;
            $scope.$apply();
          }
          else
          {
            console.log("Error", req.statusText);
          }
        }
      };
      req.send(null);
    }
  }
});

/* Takes the business group that the acronym belongs to and links that group with its respective information page */
function getGroupLink(business)
{
    if (business == "A&S")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/A&S.pdf'>" +business+ "</a>";
    if (business == "CAT")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CAT/CAT.pdf'>" +business+ "</a>";
    if (business == "CP&S")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CP&S.pdf'>" +business+ "</a>";
    if (business == "CSM")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CSM/CSM.pdf'>" +business+ "</a>";
    if (business == "CVB")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CVB/CVB.pdf'>" +business+ "</a>";
    if (business == "GSM")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/GSM.pdf'>" +business+ "</a>";
    if (business == "HR")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/HR.pdf'>" +business+ "</a>";
    if (business == "IS")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/ISPB/ISPB%20%E2%80%93%20Global%20IS%20Delivery.pdf'>" +business+ "</a>";
    if (business == "ISPB")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/ISPB/ISPB.pdf'>" +business+ "</a>";
    if (business == "SD")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/SD.pdf'>" +business+ "</a>";
    if (business == "SSB")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/SSB/SSB.pdf'>" +business+ "</a>";
    return business;
}

/*
 *  Inserts a backslash before each single quote character in the given string str
 *  Uses the insertHelper function
 */
function insertSlashes(str)
{
  var length = str.length;
  for (i = 0; i < length; i++)
  {
    if (str.charAt(i) == "'" || str.charAt(i) == ".")
    {
      str = insertHelper(str, i);
      i++;
      length++;
    }
  }
  return str;
}

/*
 * Inserts a backslash character into the string BEFORE the specified index of that string
 */
function insertHelper (string, index)
{
  return string.substr(0, (index)) + "\\" + string.substr(index, string.length);
}

/* Enables dropdown menu in the filter option on search bar */
$(document).ready(function()
{
  $('.dropdown-submenu a.test').on("click", function(e)
  {
    $(this).next('ul').toggle();
    e.stopPropagation();
    e.preventDefault();
  });
});
