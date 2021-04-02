const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const header = require("./header");
const utf8 = require('utf8');

const CUSTOMERS_TO_IMPORT = "../../import/magento_customers_sample.csv";
const RESULT_PATH = `../../results/shopify_customers_sample.csv`;

class CustomerImport {
  constructor() {
    this.importFile = CUSTOMERS_TO_IMPORT;
    this.resultPath = RESULT_PATH;
  }

  extract = () => {
    if (!this.isFileExists()) {
      console.log("The file does not exist.");
      process.exit();
    }
    let rawData = [];
    fs.createReadStream(CUSTOMERS_TO_IMPORT)
      .pipe(csv())
      .on("data", async (data) => rawData.push(data))
      .on("end", () => this.convert(rawData))
      .on("end", () => console.log("CSV file successfully processed"));
  };

  isFileExists = () => fs.existsSync(CUSTOMERS_TO_IMPORT);

  convert = (rawData) => {
    const records = [];
    rawData.forEach((data) => {
      const {
        email,
        firstname,
        lastname,
        billing_company,
        billing_street1,
        billing_street2,
        billing_city,
        billing_region,
        billing_country,
        billing_postcode,
        billing_telephone,
        is_subscribed,
      } = data;
      records.push({
        first_name: firstname,
        last_name: lastname,
        email: email,
        company: billing_company,
        address1: billing_street1,
        address2: billing_street2,
        city: utf8.decode(billing_city),
        province: billing_region,
        province_code: "",
        country: billing_country,
        country_code: "",
        zip: billing_postcode,
        phone: billing_telephone,
        accepts_marketing: is_subscribed === "0" ? "no" : "yes",
        total_spent: 0,
        total_orders: 0,
        tags: "",
        note: "",
        tax_exempt: "no",
      });
    });
    ;
    this.writer().writeRecords(records).then(() => {
      console.log("...Done");
    });
  };

  writer = () => createCsvWriter({ path: RESULT_PATH, header: header.header });

  run = () => {
    this.extract();
  };
}

new CustomerImport().run();
