var app = angular.module("acronymApp", ["ngSanitize"]);

/* Executed when user clicks the "Add!" button on add acronym form */
app.controller("addAcronymCtrl", function($scope, $http)
{
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

  $scope.add = function add()
  {
    var abbrev = document.getElementById("abbrev");
    var def = document.getElementById("def");
    var comment = document.getElementById("comment");
    var business = document.getElementById("businessGroup");
    var classification = document.getElementById("classTag");
    var contextLinkVal = document.getElementById("contextLink").value;
    // Check if abbreviation or definition fields are blank
    if (abbrev.value == "")
    {
      // Launch modal to alert user to add abbreviation
      $(document).ready(function()
      {
          $("#abbrevAlert").modal();
      });
      return;
    }
    if (def.value == "")
    {
      // Launch modal to alert user to add definition
      $(document).ready(function()
      {
          $("#defAlert").modal();
      });
      return;
    }
    if (contextLinkVal == "")
      contextLink.value = "None";

    if (comment.value == "")
      comment.value = "No comment";

    if (business.value == "")
      business.value = "No group specified";

    if (classification.value == "")
      classification.value = "No classification specified";

    contextLinkVal = encodeURIComponent(contextLinkVal);

    var req = new XMLHttpRequest();
    req.open("POST","/add/"+abbrev.value+"/"+def.value+"/"+comment.value+"/"+business.value+"/"+classification.value+"/"+contextLinkVal, true);
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
    req.send(null); // send request to searchDatabase.php file
  }
});

/* Search controller */
app.controller("searchCtrl", function($scope, $http, $location)
{
  $scope.filterSearch = function filterSearch(filterVal)
  {
    $scope.filter = filterVal;
  };

  /* User clicks on a search result */
  $scope.infoPage = function infoPage(index)
  {
    var acronym = $scope.jsObj.acronym[index];
    var def = $scope.jsObj.definition[index];
    var comment = $scope.jsObj.comment[index];
    var business = $scope.jsObj.business[index];
    var classification = $scope.jsObj.classification[index];
    var context = $scope.jsObj.context[index];

    // Update the scope with the acronym's information
    $scope.acronym = acronym;
    $scope.definition = def;
    $scope.comment = comment;
    $scope.classification = classification;
    if (context != "None")  // if context link provided for this acronym, display the link
    {
        $scope.context = context;
        $scope.contextElement = true;
    }
    else
    {
        $scope.contextElement = false;
    }
    if (business == "No group specified")
    {
        $scope.business = business;
    }
    else
    {
        console.log(business);
        $scope.business = getGroupLink(business);
    }

    // Send request to MySQL acronym database to increment clicks
    var req = new XMLHttpRequest();
    req.open("POST","/increment/"+acronym, true);
    req.send(null);
    var clicks = $scope.jsObj.clicks[index];
    $scope.clicks = clicks;

    // Launch the information modal
    $("#infoModal").modal();
  };

  /* User types into search bar */
  $scope.search = function search()
  {
    var str = document.getElementById("searchInput").value;
    var filter = $scope.filter;
    var req = new XMLHttpRequest();
    $scope.records = [];
    $scope.jsObj = {   // javascript object that keeps track of the resulting acronyms and their info when user searches
      acronym: [],
      definition: [],
      comment: [],
      clicks: [],
      business: [],
      classification: [],
      context: []
    };
    if (str.length == 0 || str == '/' || str == '?' || str == "." || str == "=" || str == '\'') // Check that the search characters are valid to perform a query
    {
      $scope.setDisplay = false;
      $scope.text1 = false;
      $scope.text2 = false;
    }
    else
    {
      req.open("POST","/query/"+str+"/"+filter, true);
      req.onreadystatechange = pollStateChange;   // when server response is ready, call the function
      function pollStateChange()
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
              $scope.records.push(jsonResults.acronym[i] + ": " + jsonResults.definition[i]); // only the acronym and its definition display in the search results

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
      req.send(null);
    }
  }
});

/* Takes the business group that the acronym belongs to and links that group with its respective information page */
function getGroupLink(business)
{
    console.log(business);
    if (business == "A&S - Architecture & Software")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/A&S.pdf'>" +business+ "</a>";
    if (business == "CAT - Common Architecture & Technology")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CAT/CAT.pdf'>" +business+ "</a>";
    if (business == "CP&S - Control Products & Solutions")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CP&S.pdf'>" +business+ "</a>";
    if (business == "CSM - Customer Support and Maintenance")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CSM/CSM.pdf'>" +business+ "</a>";
    if (business == "CVB - Control and Visualization Business")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/CVB/CVB.pdf'>" +business+ "</a>";
    if (business == "GSM - Global Sales & Marketing")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/GSM.pdf'>" +business+ "</a>";
    if (business == "HR - Human Resources")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/HR.pdf'>" +business+ "</a>";
    if (business == "IS - Information Software")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/ISPB/ISPB%20%E2%80%93%20Global%20IS%20Delivery.pdf'>" +business+ "</a>";
    if (business == "ISPB - Information Software and Process Business")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/ISPB/ISPB.pdf'>" +business+ "</a>";
    if (business == "SD - Strategic Development")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/SD.pdf'>" +business+ "</a>";
    if (business == "SSB - Systems and Solutions Business")
        return "<a href='https://rockwellautomation.sharepoint.com/teams/AS/CVB/CVBInfoSoftware/Analytics%20Private%20Library/Architecture/RA%20ORG/SSB/SSB.pdf'>" +business+ "</a>";

    return business;
}
