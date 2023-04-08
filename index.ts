import { inns } from "./csvjson";
import axios from "axios";
import fs from "fs";

const a = axios.create({});

// let rawdata = fs.readFileSync("usedInns.json");
let is = [];

let curIdx = -1;
const dIs = inns.filter((inn) => !is.includes(inn));

function getInn() {
  curIdx += 1;
  return dIs[curIdx];
}

let responses: any[] = [];
let usedInns: any[] = [];

async function push(inn, res) {
  usedInns.push(inn);
  if (res) {
    responses.push(res);
  }

  if (usedInns.length % 10 && usedInns.length) {
    return;
  }

  // stringify JSON Object
  var jsonContent = JSON.stringify(responses);
  var jsonInns = JSON.stringify(usedInns);

  fs.writeFile("output.json", jsonContent, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });

  fs.writeFile("usedInns.json", jsonInns, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });
}

(async () => {
  await Promise.all(
    Array(4)
      .fill(null)
      .map(async (_, idx) => {
        await new Promise((r) => setTimeout(r, idx * 1000));
        let qratorMsid = "";

        while (true) {
          const inn = getInn();
          if (!inn) break;
          console.log(curIdx);

          await a
            .get("https://bankrot.fedresurs.ru/backend/cmpbankrupts", {
              params: {
                searchString: inn,
                isActiveLegalCase: null,
                limit: 15,
                offset: 0,
              },
              headers: {
                Cookie: `_ym_d=1680824346, _ym_isad=1,_ym_uid=1680824346961770536,_ym_visorc=w,qrator_msid=${qratorMsid}`,
                Host: "bankrot.fedresurs.ru",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "no-cors",
                "Sec-Fetch-Site": "same-origin",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0",
                Accept: "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                Pragma: "no-cache",
                Referer: `https://bankrot.fedresurs.ru/bankrupts?searchString=%${inn}%20&regionId=all&isActiveLegalCase=null&offset=0&limit=15`,
              },
            })
            .then((response) => {
              const r = response.data.pageData?.[0];
              push(inn, r);
            })
            .catch((response) => {
              console.log("error");
              if (!response.response?.headers?.["set-cookie"]?.length) return;

              const setCookie = response.response.headers["set-cookie"][0];
              const newQratorMsid = setCookie.match(/qrator_msid=(.*?);/)[1];
              qratorMsid = newQratorMsid;
            });
          // console.log((await response).headers);
        }
      })
  );
})();

// import csvToJson from "convert-csv-to-json";

// let json = csvToJson.getJsonFromCsv("data.csv");

// fs.writeFile("usedInns.json", JSON.stringify(json), "utf8", function (err) {
//   if (err) {
//     console.log("An error occured while writing JSON Object to File.");
//     return console.log(err);
//   }

//   console.log("JSON file has been saved.");
// });
