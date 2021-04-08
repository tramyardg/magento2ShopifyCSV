const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const header = require("./header");
const countries = require("i18n-iso-countries");

const CUSTOMERS_TO_IMPORT = "../../import/customers_exports_p3.csv";
const RESULT_PATH = `../../results/shopify_customers_to_import.csv`;

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
      .on("data", (data) => rawData.push(data))
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

  convert = async (rawData) => {
    // you can set a limit so that you are not importing all customers
    // however, if you want to process all just use rawData
    let customers = rawData.slice(0, 10);
    const records = [];
    customers.forEach((data) => {
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
        first_name: firstname,
        last_name: lastname,
        email: email,
        company: billing_company !== "" ? billing_company : "",
        address1: billing_street1 !== "" ? billing_street1 : "",
        address2: billing_street2 !== "" ? billing_street2 : "",
        city: billing_city !== "" ? billing_city : "",
        province: billing_region !== "" ? billing_region : "",
        province_code: "",
        country: billing_country !== "" ? billing_country : "",
        country_code: billing_country !== "" ? billing_country : "",
        zip: billing_postcode !== "" ? billing_postcode : "",
        phone: billing_telephone !== "" ? billing_telephone : "",
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
    return countries.isValid(code)
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

// https://stackoverflow.com/questions/41758870/how-to-convert-result-table-to-json-array-in-mysql
// SELECT CONCAT( '[', GROUP_CONCAT(JSON_OBJECT('emp_no', emp_no)), ']' ) FROM employees
// SELECT json_object('emp_no', emp_no) FROM employees INTO OUTFILE 'passwd.json'
//  Warning: #1287 '<select expression> INTO <destination>;' is deprecated and will be removed in a future release. Please use 'SELECT <select list> INTO <destination> FROM...' instead
// C:\xampp\mysql\data\employees\passwd.json