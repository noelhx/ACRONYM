import json, wikipedia

# A&S, CAT, CVB, IS, ISPB
tech_words = ["rockwell", "application", "visualization", "protocol", "connected", "enterprise", "advanced", "technology", "processor", "development", "microsoft", "information", "software", "IT", "system", "architecture", "hardware", "program", "comput"]
# CP&S
cps_words = ["rockwell", "protocol", "control", "products", "solutions", "drive automation", "industrialization", "industry", "global", "original," "manufacturing", "equipment", "manufacturer"]
# CSM, HR
csm_words = ["rockwell", "consult", "recruit", "customer", "support", "maintenance", "human", "resources", "help", "aid", "payroll", "service", "consumer"]
# Finance
finance_words = ["rockwell", "consult", "finance", "money", "bank", "investment", "payment", "payroll"]
# GSM
gsm_words = ["rockwell", "global", "sales", "marketing", "advertising", "advertisment", "sale"]
# Kinetix
kinetix_words = ["rockwell", "motion movement kinetic kinetix auto motor connected enterprise"]
# Legal
legal_words = ["rockwell", "corporate", "affairs", "communication", "legal", "law", "permission", "copyright", "ownership", "authorization", "authorize", "permit", "allow", "litigat", "contract", "obligat"]
# Operations
operations_words = ["rockwell", "consult", "operate", "operations", "processes", "process", "corporate", "communication", "global"]
# Strategic Development
sd_words = ["rockwell", "consult", "global", "business", "development", "university", "relations", "partnership", "recruit"]
# Systems Solutions
ssb_words = ["rockwell", "systems", "solutions", "portfolio", "oil", "gas", "north", "america", "enterprise", "connected", "global", "region", "applications"]
# Sensing, Safety, and Connectivity
sscb_words = ["rockwell", "sensing", "safety", "connectivity", "hazard", "check", "identity", "theft", "measurement", "secure"]

# takes the given definition and returns an array of business groups that the definition may be associated with
def classify (definition):
    businesses = []
    summary = wikipedia.summary(definition)
    for word in tech_words:
        if word in summary or word in definition:
            businesses.append("A&S")
            businesses.append("CAT")
            businesses.append("CVB")
            businesses.append("IS")
            businesses.append("ISPB")
            break
    for word in cps_words:
        if word in summary or word in definition:
            businesses.append("CP&S")
            break
    for word in csm_words:
        if word in summary or word in definition:
            businesses.append("CSM")
            businesses.append("HR")
            break
    for word in finance_words:
        if word in summary or word in definition:
            businesses.append("Finance")
            break
    for word in gsm_words:
        if word in summary or word in definition:
            businesses.append("GSM")
            break
    for word in kinetix_words:
        if word in summary or word in definition:
            businesses.append("Kinetix")
            break
    for word in legal_words:
        if word in summary or word in definition:
            businesses.append("Legal")
            break
    for word in operations_words:
        if word in summary or word in definition:
            businesses.append("Operations")
            break
    for word in sd_words:
        if word in summary or word in definition:
            businesses.append("SD")
            break
    for word in ssb_words:
        if word in summary or word in definition:
            businesses.append("SSB")
            break
    for word in sscb_words:
        if word in summary or word in definition:
            businesses.append("SSCB")
            break

    return businesses   # return the list of business groups that fit this acronym's description
