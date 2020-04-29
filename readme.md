# USCIS Case Status Checker

I'm waiting to get work authorization from US Citizenship and Immigration Services (USCIS). When one application is received by the USCIS, they issue a receipt number. Using this receipt number to check one’s progress (at https://egov.uscis.gov/casestatus/mycasestatus.do) is highly unsatisfying. The application usually takes up to 3 - 5 months to process. Until the work authorization is approved, people ususally get these types of responses: 

On November 16, 2017, we received your Form I-765, Application for Employment Authorization , Receipt Number YSC1890044628, and sent you the receipt notice that describes how we will process your case. Please follow the instructions in the notice. If you do not receive your receipt notice by December 16, 2017, please call Customer Service at 1-800-375-5283. If you move, go to www.uscis.gov/addresschange to give us your new mailing address.


And nothing more. No estimate time. No queue information. No current status. USCIS does a really bad job of keeping one updated on the progress of a case.


## Predicting decision time 

The impact of coronavirus significantly slowed down the process. Fortunately, USCIS issues receipt numbers in chronological order, and they process their cases in a first-come-first serve order. That means if we check other people's case status, we will be able to get an estimate time of case decision:

- If a huge proportion of people before (and possibly after) me have their work authorization approved, I should have mine processed soon.

- However, if the people who submitted around my date are stil waiting for their approval, I can expect to wait a long time.

However, doing so manually at https://egov.uscis.gov/casestatus/mycasestatus.do is a slow and tiring process. Instead, I can write a script to check the website for the 10,000 or so cases before and after my own number.