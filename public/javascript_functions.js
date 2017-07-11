var app = angular.module("acronymApp", ["ngSanitize"]);

/* Executed when user clicks the "Add!" button on add acronym form */
app.controller("addAcronymCtrl", function($scope, $http)
{
  $scope.toggleElements = function toggleElements()
  {
    $scope.addAcronymElements = !($scope.addAcronymElements);
    // Clear the text boxes in the add form
    document.getElementById("abbrev").value = "";
    document.getElementById("def").value = "";
    document.getElementById("comment").value = "";
  };

  $scope.add = function add()
  {
    var abbrev = document.getElementById("abbrev");
    var def = document.getElementById("def");
    var comment = document.getElementById("comment");
    var business = document.getElementById("businessGroup");
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
    if (comment.value == "")
    {
      // if no comment, set value to null
      comment.value = "No comment";
    }
    if (business.value == "")
    {
      // if no business selected, set value to "None"
      business.value = "None";
    }
    var req = new XMLHttpRequest();
    req.open("POST","/add/"+abbrev.value+"/"+def.value+"/"+comment.value+"/"+business.value, true);
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
  /* User clicks on a search result */
  $scope.infoPage = function infoPage(index)
  {
    var acronym = $scope.jsObj.acronym[index];
    var def = $scope.jsObj.definition[index];
    var comment = $scope.jsObj.comment[index];
    var business = $scope.jsObj.business[index];
    // Update the scope with the information about the acronym, definition, and comment(s)
    $scope.acronym = acronym;
    $scope.definition = def;
    $scope.comment = comment;
    $scope.business = business;
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
    var req = new XMLHttpRequest();
    $scope.records = [];
    $scope.jsObj = {   // javascript object that keeps track of the resulting acronyms, definitions, and their comments when user searches
      acronym: [],
      definition: [],
      comment: [],
      clicks: [],
      business: []
    };
    if (str.length == 0 || str == '/' || str == '?' || str == "." || str == "=" || str == '\'') // Check that the search characters are valid to perform a query
    {
      $scope.setDisplay = false;
      $scope.text1 = false;
      $scope.text2 = false;
    }
    else
    {
      req.open("POST","/query/"+str, true);
      req.onreadystatechange = pollStateChange;   // when server response is ready, call the function
      function pollStateChange()
      {
        if (this.readyState == 4 && this.status == 200)
        {
          var jsonResults = JSON.parse(req.responseText); // parses the JSON text into javascript object
          if (jsonResults == -1)
          {
            $scope.records = ["No results"];
            results = "No results";
          }
          else
          {
            for (i in jsonResults.acronym)
            {
              $scope.records.push(jsonResults.acronym[i] + ": " + jsonResults.definition[i]);

              $scope.jsObj.acronym.push(jsonResults.acronym[i]);
              $scope.jsObj.definition.push(jsonResults.definition[i]);
              $scope.jsObj.comment.push(jsonResults.comment[i]);
              $scope.jsObj.clicks.push(jsonResults.clicks[i]);
              $scope.jsObj.business.push(jsonResults.business[i]);
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
