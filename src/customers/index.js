const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const header = require("./header");

const CUSTOMERS_TO_IMPORT = "../../import/HAZARDs.csv";
const RESULT_PATH = `../../results/shopify_customers.csv`;

class CustomerImport {
  #results;
  constructor() {
    this.importFile = CUSTOMERS_TO_IMPORT;
    this.resultPath = RESULT_PATH;
    this.#results = [];
  }

  extract() {
    if (!this.isFileExists()) {
      console.log('The file does not exist.');
      process.exit();
    }
    fs.createReadStream(CUSTOMERS_TO_IMPORT)
      .pipe(csv())
      .on("data", (data) => this.#results.push(data))
      .on("end", () => {
        //process(results);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
      });
  }

  isFileExists() {
    return fs.existsSync(CUSTOMERS_TO_IMPORT);
  }

  run() {
    this.extract();
  }
}

const c = new CustomerImport();
c.run();
