const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const utf8 = require("utf8");
const header = require("./header");
const countries = require("i18n-iso-countries");

const CUSTOMERS_TO_IMPORT = "../../import/magento_customers_sample.csv";
const RESULT_PATH = `../../results/shopify_customers_sample.csv`;

class CustomerImport {
  constructor() {
    this.importFile = CUSTOMERS_TO_IMPORT;
    this.resultPath = RESULT_PATH;
  }

  process = () => {
    this.validateImportFileExists();
    let rawData = [];
    fs.createReadStream(this.importFile)
      .pipe(csv())
      .on("data", async (data) => rawData.push(data))
      .on("end", () => this.convert(rawData))
      .on("end", () => console.log("CSV file successfully processed"));
  };

  validateImportFileExists = () => {
    if (!this.isFileExists()) {
      console.log("The file does not exist.");
      process.exit();
    }
  };

  isFileExists = () => fs.existsSync(this.importFile);

  decode = (data) => utf8.decode(data);

  convert = async (rawData) => {
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
        billing_region, // Quebec
        billing_country, // CA
        billing_postcode,
        billing_telephone,
        is_subscribed,
      } = data;
      const _t = this;
      records.push({
        first_name: _t.decode(firstname),
        last_name: _t.decode(lastname),
        email: _t.decode(email),
        company: _t.decode(billing_company),
        address1: _t.decode(billing_street1),
        address2: billing_street2,
        city: _t.decode(billing_city),
        province: _t.decode(billing_region),
        province_code: "",
        country: _t.getCountryName(billing_country),
        country_code: billing_country,
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
    this.write(records);
  };

  getCountryName = (code) => {
    const isValid = countries.isValid(code);
    return isValid
      ? countries.getName(code, "en", { select: "official" })
      : code;
  };

  write = (records) => {
    createCsvWriter({ path: this.resultPath, header: header.header })
      .writeRecords(records)
      .then(() => console.log("...Done writing"));
  };

  run = () => {
    this.process();
  };
}

new CustomerImport().run();
