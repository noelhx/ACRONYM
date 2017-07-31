# ACRONYM
A simple web application that allows users to search for acronyms that are commonly used at Rockwell Automation.

# Background
Every year, Rockwell Automation hosts the Innovation Challenge, a three month event where employees develop an idea that can improve Rockwell Automation. My team's idea was to create a web application that keeps track of the (thousands of) acronyms that employees use within Rockwell. My role was to develop the application prototype.

**express.js**

An Express app that runs a node.js server and listens on port 5000.

**index.html**

The main page of the acronym database. Main function is to display the search bar and allow users to type in the name of the acronym they are searching for.

**javascript_functions**

Includes all the JavaScript functions that this application uses.

**keywords.py**

Includes multiple lists of keywords that are used to identify what acronyms belong to what business groups. Basically, this file is used to provide classifications for the acronyms.

**wikiscrape.py**

Python script I use to gather basic summary information about an acronym from its related Wikipedia page. Uses the Wikipedia python library, which uses the Beautiful Soup python library (commonly used for web scraping).
