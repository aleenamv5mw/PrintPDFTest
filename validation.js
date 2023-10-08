const axios = require("axios");
const fs = require('fs')


async function cleanPdf(){
        try {
          const path = './'
          fs.readdirSync(path).forEach((file) => {
              if (file.split('.').pop().toLowerCase() === 'pdf') {
                fs.unlinkSync(path + file)
              }
            });
          return true;
        } catch (err) {
          console.error("Error in deleting files");
        }
}
exports.cleanPdf = cleanPdf;






//Aleena


async function mediacFileRetrieve(latestNewsletterPatternResult) 
{
  const servers = ["4", "3"];
  const mediacPdfResultsArray = [];
  console.log("Trying to fetch all the print articles-order")  
  console.time("Time taken")

  //queue
  const queue =[...latestNewsletterPatternResult];

  async function fetchEL(server,element,index)
  {
  try{
   
    const response = await axios.get(`https://meltwaternews.com/ext/mediac${server}/${element}.pdf`, {
      responseType: 'arraybuffer'
    });
  
  console.log('Fetching PDF from Mediac'+server);
    mediacPdfResultsArray[index] = response.data;
  
  } 
  catch(error)
  {

  }
  }

//mapping..
  await Promise.all(queue.map(async(element,index) => {
  const fetchPromises = servers.map((server) => fetchEL(server,element,index));
    await Promise.all(fetchPromises);
})
  );

console.log("Total files downloaded:"+mediacPdfResultsArray.length);
  console.timeEnd("Time taken")
  return mediacPdfResultsArray;
}

exports.mediacFileRetrieve = mediacFileRetrieve; 

//megha
async function mediacFileRetrieve(latestNewsletterPatternResult) {
  const servers = ["4", "3"];
  const mediacPdfResultsArray = [];
  console.log("Trying to fetch all the print articles at once and run the two servers simultaneously")  
  console.time("Time taken")
  const elementPromises = []
  for (const element of latestNewsletterPatternResult) {
    const resultsPromises = servers.map(async (server) => {
      try {
        const response = await axios.get(`https://meltwaternews.com/ext/mediac${server}/${element}.pdf`, {
          responseType: 'arraybuffer'
        });
        console.log('Fetching PDF from Mediac'+server);
        return response.data;
      } catch (error) {
      }
    })
    elementPromises.push(resultsPromises)
  }
  i = 0
  for (const element_promise of elementPromises){ 
  const results = await Promise.all(element_promise);
    const foundResult = results.find(r => r !== undefined);
    if (foundResult) {
      mediacPdfResultsArray.push(foundResult);
    } else {
      console.log(`Print article ${latestNewsletterPatternResult[i]}.pdf not received from Mediac/Does not exist`);
    }
    i++
  }
  console.log("Total files downloaded:"+mediacPdfResultsArray.length)
  console.timeEnd("Time taken")
  return mediacPdfResultsArray;
}

exports.mediacFileRetrieve = mediacFileRetrieve;


/* async function mediacFileRetrieve(latestNewsletterPatternResult) {
  const servers = ["4", "3", "2"];
  const mediacPdfResultsArray = [];

  for (const element of latestNewsletterPatternResult) {
    const resultsPromises = servers.map(async (server) => {
      try {
        const response = await axios.get(`https://meltwaternews.com/ext/mediac${server}/${element}.pdf`, { 
          responseType: 'arraybuffer'
        });

        return response.data;
      } catch (error) {
        
      }
    });

    const results = await Promise.all(resultsPromises);

    const foundResult = results.find(result => result !== undefined);

    if (foundResult) {
      mediacPdfResultsArray.push(foundResult);
    } else {
      console.log(`File ${element}.pdf not received from Mediac/Does not exist`);
    }
  }

  return mediacPdfResultsArray;
}

exports.mediacFileRetrieve = mediacFileRetrieve; */


/* async function mediacFileRetrieve(latestNewsletterPatternResult) {
  const mediacPdfResults = [];

  const fetchPdf = (element, version) => {
    const url = `https://meltwaternews.com/ext/mediac${version}/${element}.pdf`;

    return axios.get(url, { responseType: 'arraybuffer' })
      .then((response) => response.data)
      .catch((error) => {
        console.log(`Error fetching file from Mediac${version}: ${error.message}`);
        return null; // Return null to indicate error
      });
  };

  const fetchPromises = latestNewsletterPatternResult.map(async (element) => {
    const versions = [4, 3, 2];

    for (const version of versions) {
      const pdfData = await fetchPdf(element, version);
      if (pdfData) {
        return pdfData;
      }
    }

    return null;
  });

  const results = await Promise.all(fetchPromises);

  // Filter any null values (indicating errors) from the results.
  const validResults = results.filter((pdfData) => pdfData !== null);

  return validResults;
}

exports.mediacFileRetrieve = mediacFileRetrieve; */




async function extractDistributionID(nl_Id,token,companyId,date){
  try{
        var options = 
        {
            method: 'GET',
            url: `https://app.meltwater.com/api/newsletters/newsletter/distribution/${nl_Id}/distributions`,
            headers: {
              authority: 'app.meltwater.com',
              accept: 'application/json, text/plain, */*',
              authorization: String(token)
            }
        };

        let ress = await axios.request(options)
        for(let i=ress.data.length-1; i>=0; i--){
          if(ress.data[i].status === 'sent'){
            try{
                const aa = await axios("https://app.meltwater.com/api/public/newsletters/"+companyId+"/newsletter/distribution/"+ress.data[i]._id+"/html");
                let characteristics = aa.data.indexOf(nl_Id+"&&company_id="+companyId+"&&date="+date);
                if(characteristics < 1) {
                  continue;
                } else{
                  console.log("Found distribution ",ress.data[i]._id)
                  return ress.data[i]._id;
                  }
            }catch (e) {
                console.log("Cannot find Distribution")
                return false;
            }
          }
        }
    } catch(e) {
        return false;
    }
}
exports.extractDistributionID = extractDistributionID;


async function extractPrintPdfId(distribution_Id,token){
  try{
        let printIds = [];
        var options = 
        {
          method: 'GET',
          url: `https://app.meltwater.com/api/newsletters/newsletter/distribution/${distribution_Id}`,
          headers: {
            Authorization: String(token)
          }
        };
        let result = await axios.request(options)
        let dataD = result.data;
              for(let i=0; i<dataD.sections.length; i++){
                  for(j=0; j<dataD.sections[i].data.length; j++) {
                  //   if(!dataD.sections[i].data[j].url.includes("nzprint")){
                  //     if(dataD.sections[i].data[j].url.includes('/print_clip_previewer/')){
                  //       printIds.push(dataD.sections[i].data[j].url.match(/\d+/)[0])
                  //     }else if(dataD.sections[i].data[j].url.includes('print_clip_previewer%2F')){
                  //       printIds.push(dataD.sections[i].data[j].url.match(/print_clip_previewer%2F(.*?)%/g)[0].slice(23,-1))
                  //     }
                  // }
                  if(dataD.sections[i].data[j].url.includes('ausprint.meltwater.com/print_clip_previewer/')){
                    printIds.push(dataD.sections[i].data[j].url.match(/\d+/)[0])
                  }else if(dataD.sections[i].data[j].url.includes('mwTransition?url=https%3A%2F%2Fausprint.meltwater.com%2Fprint_clip_previewer%')){
                    printIds.push(dataD.sections[i].data[j].url.match(/print_clip_previewer%2F(.*?)%/g)[0].slice(23,-1))
                  }
                }
             }
        return printIds;
      } catch(e) {
        return false;
      }
}
exports.extractPrintPdfId = extractPrintPdfId;












