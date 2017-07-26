import sys, json, warnings, wikipedia
from keywords import classify

reload(sys)
sys.setdefaultencoding('utf8')

if (len(sys.argv) <= 1):
    print ("Error: No query keyword found in arg list")
    sys.exit()

keyword = ''
for x in range(1, len(sys.argv)):
    keyword += sys.argv[x] + " "

try:
    wikipedia.page(keyword)
except:
    descrip = json.dumps("No description available")
    page = json.dumps("No page found")
    businesses = json.dumps("No group specified")
    print '{ "description":' +descrip+ ', "page_url":' +page+ ', "businesses":' +businesses+ ' }'  # prints in JSON format
    sys.exit()

descrip = json.dumps(wikipedia.summary(keyword, sentences=2))
page = json.dumps((wikipedia.page(keyword)).url)  # the wikipedia page that is being scraped
businesses = json.dumps(classify(keyword))

print '{ "description":' +descrip+ ', "page_url":' +page+ ', "businesses":' +businesses+ ' }'  # prints in JSON format
