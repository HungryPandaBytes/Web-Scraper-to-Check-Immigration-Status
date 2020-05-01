const express = require('express')
const app = express()
const fetch = require('node-fetch');
const Bluebird = require('bluebird');
fetch.Promise = Bluebird;
var HTMLParser = require('node-html-parser');
const ObjectsToCsv = require('objects-to-csv')
const cron = require("node-cron");

const port = 3000


app.get('/', (req, res) => res.send('Hello World!'))

const myReceipt = "msc2090502816"

const EADreceipts = [];

// large laptop runs 2090460000 - 2090510000 (60K in total)

// check cases in batches based on receipt confirmation number. Each batch checks for 30K applications. 
function checkCasesInBatches(startingNum) {

  for (let i = 0; i < 30000; i++){
    const receiptPrefix = 'msc'
    const nextNum = "" + (parseInt(startingNum) + i)
    EADreceipts.push(receiptPrefix + nextNum)
  }

// fetch data from USCIS official website every 3 second
  EADreceipts.forEach((receipt,i) => {
      setTimeout(() => {
          fetch("https://egov.uscis.gov/casestatus/mycasestatus.do", {
              "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
              },
              "referrer": "https://egov.uscis.gov/casestatus/mycasestatus.do",
              "referrerPolicy": "no-referrer-when-downgrade",
              "body": `changeLocale=&completedActionsCurrentPage=0&upcomingActionsCurrentPage=0&appReceiptNum=${receipt}&caseStatusSearchBtn=CHECK+STATUS`,
              "method": "POST",
              "mode": "cors"
            }).then(res => res.text())
            .then(body => {
              //   console.log(body)
                const uscis = HTMLParser.parse(body)
                const caseStatus = uscis.querySelector('.rows').childNodes[1].rawText
                const caseDetails = uscis.querySelector('.rows').childNodes[3].rawText
              //   console.log({uscis},{caseStatus},{caseDetails} )
                const forms = ["Form I-485", "Form I-765","Form I-131","Form I-130", "Post Office delivered your new card"]
                const timeStamp = new Date();
                let formNumber;

                function parseFormNumber(caseDetails, forms){
                    forms.forEach(form => {
                      if (caseDetails.includes(form)){
                          formNumber = form;
                          return formNumber  
                      } 
                      });
                      if (typeof formNumber === "undefined") {
                              formNumber = "Form Not Interested";
                              return formNumber 
                      }
                }
              
                parseFormNumber(caseDetails,forms);
                
                const scrapedResult = [{
                    receipt:receipt,
                    formNumber: formNumber, 
                    caseStatus: caseStatus, 
                    caseDetails: caseDetails,
                    timeStamp: timeStamp.toLocaleDateString()
                }]
                return scrapedResult
            }).then(scrapedResult => {
            console.log(scrapedResult, `writing ${i+1} results to csv at ${((i+1) * 3 / 60 /60).toFixed(2)} hours`)
            const csv = new ObjectsToCsv(scrapedResult)
            // csv.toDisk('./uscis_small_laptop.csv', { append: true })
            csv.toDisk('./uscis_large_laptop.csv', { append: true })
            })
        }, i * 3000);
    })

}

checkCasesInBatches("2090450000")


// 2 cron jobs; one is running on odd days for the first batch and the other is running on even day on the second batch

// odd days for msc2090450000 - msc2090480000 
const firstBatch = cron.schedule("9 11 1-31/2 * *", function() {
  console.log("---------------------");
  console.log("Running Cron Job On Odd Days");
  checkCasesInBatches("2090450000")
});

// even days for msc2090480000 - msc2090510000
const secondBatch = cron.schedule("* * 2-30/2 * *", function() {
  console.log("---------------------");
  console.log("Running Cron Job On Even Days");
  checkCasesInBatches("2090480000")

});

// firstBatch.start();
// secondBatch.start();


app.listen(port, () => console.log(`uscis case checker app listening at http://localhost:${port}`))