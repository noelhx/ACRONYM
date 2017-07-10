var express = require('express');
var mysql = require('mysql');
var favicon = require('serve-favicon');
var path = require('path');
var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));  // Use favicon.ico
app.use(express.static(path.join(__dirname, '/')));   // Use this directory (C://WebApp2/)
app.use(express.static(path.join(__dirname, 'public')));  // Use the /public folder

var server = app.listen(5000, function () {
    console.log('Node server is running on http://localhost:5000... (10.91.160.56:5000)');
});

// Establish connection to acronym_import database
var con = mysql.createConnection({
  host: "localhost",
  user: "Shannon",
  password: "YOLOmoney$$$444",
  database: "acronym_import"
});

// Connect to database
con.connect(function(err) {
    if (err) throw err;
    console.log("Successfully connected to acronym database.");
});

// Define routes here...

/* Homepage */
app.get('/', function (req, res)
{
  return res.sendFile('C://WebApp2/index.html');
});

/* About page */
app.get('/about', function (req, res)
{
  return res.sendFile('C://WebApp2/about.html');
});

/* Privacy policy page */
app.get('/privacypolicy', function (req, res)
{
  return res.sendFile('C://WebApp2/privacypolicy.html');
});

/* Contact page */
app.get('/contact', function (req, res)
{
  return res.sendFile('C://WebApp2/contact.html');
});

/* Route for when user clicks on search result and the acronym clicks needs to be incremented */
app.post('/increment/:acronym', function(req, res)
{
  var acronym = req.params.acronym;
  var sql = "UPDATE acronym_table SET clicks = clicks + 1 WHERE acronym = '" + acronym + "'";
  con.query(sql, function(err, result, fields)
  {
    if (err) throw err;
    res.end();
  });
});

/* Route for when user adds an acronym to database */
app.post('/add/:acronym/:def/:comment', function(req, res)
{
  var acronym = req.params.acronym;
  var def = req.params.def;
  var comment = req.params.comment;
  var sql = "INSERT INTO acronym_table (acronym, definition, cmt, clicks) VALUES ('" +acronym+ "', '" +def+ "', '" +comment+ "', '0')";
  con.query(sql, function(err, result, fields)
  {
    if (err) throw err;
    res.end();
  });
});

/* Route for when user searches for an acronym */
app.post('/query/:string', function(req, res)
{
  var string = req.params.string + "%";   // Need to append '%' sign to generate all possible results
  var sql = "SELECT * FROM acronym_table WHERE (acronym LIKE '" +string+ "') OR (definition LIKE '" +string+ "') ORDER BY clicks DESC, acronym";
  var jsObj = {   //javascript object that will be converted to JSON text when response is sent
    acronym: [],
    definition: [],
    comment: [],
    clicks: []
  };

  con.query(sql, function(err, result, fields)
  {
    if (err) throw err;
    if (result.length == 0)
    {
      res.json(-1);
    }
    else
    {
      for (var i = 0; i < result.length; i++)
      {
        var acronymToAdd = result[i].acronym;
        var defToAdd = result[i].definition;
        jsObj.acronym.push(acronymToAdd);
        jsObj.definition.push(defToAdd);
        var commentToAdd = result[i].cmt;
        if (commentToAdd == null)
          commentToAdd = "No comments";
        jsObj.comment.push(commentToAdd);
        var clicksToAdd = result[i].clicks;
        jsObj.clicks.push(clicksToAdd);
      }
      res.json(jsObj);  //.json method converts the javascript object to a JSON string and sends it as response
    }
  });
});
