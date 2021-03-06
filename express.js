var express = require('express');
var mysql = require('mysql');
var favicon = require('serve-favicon');
var path = require('path');
var config = require('./config');   // MySQL database configuration file
var PythonShell = require('python-shell');
var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));  // Use favicon.ico
app.use(express.static(path.join(__dirname, '/')));   // Use this directory (C://ACRONYM/)
app.use(express.static(path.join(__dirname, 'public')));  // Use the /public folder

var server = app.listen(5000, function () {
    console.log('Node server is running on http://localhost:5000... (10.91.160.56:5000)');
});

// Establish connection to acronym_import database
var db = config.database;
var con = mysql.createConnection({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database
});

// Connect to database
con.connect(function(err) {
    if (err) throw err;
    console.log("Successfully connected to acronym database.");
});

// Routes defined here...

/* Homepage */
app.get('/', function (req, res)
{
  return res.sendFile('C://ACRONYM/index.html');
});

/* Route for when user clicks on a search result */
app.post('/increment/:acronym/:definition', function(req, res)
{
  // Increment clicks of this acronym in database
  var acronym = decodeURIComponent(req.params.acronym);
  var sql = "UPDATE acronym_table SET clicks = clicks + 1 WHERE acronym = '" + acronym + "'";
  con.query(sql, function(err, result, fields)
  {
    if (err) throw err;
  });

  // Get the info about this acronym from wikipedia page
  var options = {
    mode: 'text',
    args: [req.params.definition]
  };

  var jsDescripObj = {   // javascript object containing this acronym's description and url from wikipedia page
    description: "",
    page_url: "",
    businesses: ""
  };

  // use PythonShell to run wikiscrape.py to scrape info from wiki page
  PythonShell.run('wikiscrape.py', options, function (err, results)
  {
    if (err)
    {
      jsDescripObj.description = "No description available";
      jsDescripObj.page_url = "No page found";
      jsDescripObj.businesses = "No group specified";
      return res.json(-1);
    }
    else
    {
      var description = JSON.parse(results).description;
      var page_url = JSON.parse(results).page_url;
      var businesses = JSON.parse(results).businesses;

      if (description == "No description available")
          return res.json(-1);

      jsDescripObj.description = description;
      jsDescripObj.page_url = page_url;
      jsDescripObj.businesses = businesses;
      return res.json(jsDescripObj);
    }
  });
});

/* Route for when user adds an acronym to database */
app.post('/add/:acronym/:def/:comment/:business/:classification/:contextLink', function(req, res)
{
  var acronym = decodeURIComponent(req.params.acronym);
  var def = decodeURIComponent(req.params.def);
  var comment = decodeURIComponent(req.params.comment);
  var business = decodeURIComponent(req.params.business);
  var classification = decodeURIComponent(req.params.classification);
  var contextLink = decodeURIComponent(req.params.contextLink);   // parse context url back to original format
  var sql = "INSERT INTO acronym_table (acronym, definition, comment, clicks, business, classification, context) VALUES ('" +acronym+ "', '" +def+ "', '" +comment+ "', '0', '" +business+ "', '" +classification+ "', '" +contextLink+ "')";
  con.query(sql, function(err, result, fields)
  {
    if (err) throw err;
    res.end();
  });
});

/* Route for when user searches for an acronym */
app.post('/query/:string/:filter', function(req, res)
{
  var filter = req.params.filter + "%";   // the classification (e.g., "All", "Technology"...)
  var string = decodeURIComponent(req.params.string) + "%";   // Need to append '%' sign to generate all possible results
  var sql = "";
  if (filter == "Filter by%" || filter == "All%")   // if no filter selected (or 'All' is selected), perform normal query without classification
  {
    sql = "SELECT * FROM acronym_table WHERE (acronym LIKE '" +string+ "') OR (definition LIKE '" +string+ "') ORDER BY clicks DESC, acronym";
  }
  else if (filter == "Technology%")
  {
    sql = "SELECT * FROM acronym_table WHERE (classification LIKE 'Technology' OR classification LIKE 'Analytics and Cloud' OR classification LIKE 'Asset Management' OR classification LIKE 'Business Systems' OR classification LIKE 'Internet Infastructure and Communications' OR classification LIKE 'Layered Architecture' OR classification LIKE 'Open Standards' OR classification LIKE 'Process Control' OR classification LIKE 'Security' OR classification LIKE 'Web Site Development' OR classification LIKE 'Computer Hardware' OR classification LIKE 'Computer Networks' OR classification LIKE 'Computer Software') AND (acronym LIKE '" +string+ "' OR definition LIKE '" +string+ "') ORDER BY clicks DESC, acronym";
  }
  else
  {
    sql = "SELECT * FROM acronym_table WHERE (classification LIKE '" +filter+ "') AND (acronym LIKE '" +string+ "' OR definition LIKE '" +string+ "') ORDER BY clicks DESC, acronym";
  }

  var jsObj = {   // javascript object that will be converted to JSON text when response is sent
    acronym: [],
    definition: [],
    comment: [],
    clicks: [],
    business: [],
    classification: [],
    context: []
  };

  con.query(sql, function(err, result, fields)
  {
    if (err) throw err;
    if (result.length == 0)   // if no results, return -1
    {
      res.json(-1);
    }
    else
    {
      for (var i = 0; i < result.length; i++)
      {
        var acronymToAdd = result[i].acronym;
        var defToAdd = result[i].definition;
        var commentToAdd = result[i].comment;
        var clicksToAdd = result[i].clicks;
        var businessToAdd = result[i].business;
        var classToAdd = result[i].classification;
        var contextToAdd = result[i].context;
        jsObj.acronym.push(acronymToAdd);
        jsObj.definition.push(defToAdd);
        jsObj.comment.push(commentToAdd);
        jsObj.clicks.push(clicksToAdd);
        jsObj.business.push(businessToAdd);
        jsObj.classification.push(classToAdd);
        jsObj.context.push(contextToAdd);
      }
      res.json(jsObj);  // converts the javascript object to a JSON string and send it as response
    }
  });
});
