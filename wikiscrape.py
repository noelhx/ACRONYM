import sys, json, wikipedia
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
    page = "No page found"
    descrip = "No description available"
    print '{ "description":"' +descrip+ '", "page_url":"' +page+ '" }'  # prints in JSON format
    sys.exit()

page = json.dumps((wikipedia.page(keyword)).url)  # the wikipedia page that is being scraped
descrip = json.dumps(wikipedia.summary(keyword, sentences=1))


print '{ "description":' +descrip+ ', "page_url":' +page+ ' }'  # prints in JSON format
