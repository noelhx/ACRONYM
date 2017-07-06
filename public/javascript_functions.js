var app = angular.module("acronymApp", ["ngSanitize"]);

/* Executed when user clicks the "Add!" button on add acronym form */
app.controller("addAcronymCtrl", function($scope, $http)
{
  $scope.add = function add()
  {
    var abbrev = document.getElementById("abbrev");
    var def = document.getElementById("def");
    var comment = document.getElementById("comment");
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
      comment.value = null;
    }
    var req = new XMLHttpRequest();
    req.open("POST","/add/"+abbrev.value+"/"+def.value+"/"+comment.value, true);
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

/* Executed when user types into search box */
app.controller("searchCtrl", function($scope, $http)
{
  $scope.infoPage = function infoPage(index)
  {
    var req = new XMLHttpRequest();
    var jsObj = $scope.jsObj;
    console.log(jsObj);
    console.log(jsObj.acronym[index]);
    req.open("POST","/info/"+jsObj+"/"+index, true);
    req.send(null);
  };

  $scope.search = function search()
  {
    var str = document.getElementById("searchInput").value;
    var req = new XMLHttpRequest();
    $scope.records = [];
    $scope.jsObj = {   // javascript object that keeps track of the resulting acronyms, definitions, and their comments when user searches
      acronym: [],
      definition: [],
      comment: []
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
