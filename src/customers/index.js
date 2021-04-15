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
    let customers = rawData.slice(0, 3);
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
        tags: "",
        note: "",
        tax_exempt: "no",
      });
    });

    fs.readFile("magesales_flat_order.json", (err, data) => {
      if (err) throw err;
      let orders = JSON.parse(data);
      let newRecords = [];
      records.forEach(p => {
        let filtered = orders.filter(r => r.customer_email === p.email);
        let totalSpent = 0;
        let totalNumberOfOrders = 0;
        filtered.forEach(k => {
          if (k.state !== "canceled") {
            totalSpent += k.base_grand_total * 1;
          }
          totalNumberOfOrders++;
        });
        newRecords.push({
          ...p,
          total_spent: totalSpent+"",
          total_orders: totalNumberOfOrders+""
        });
      });
      this.write(newRecords);
      // console.log(newRecords);
    });
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

// https://help.shopify.com/en/manual/customers/import-export-customers
// https://community.shopify.com/c/Shopify-Discussion/Customers-CSV-Import-System-ignoring-Total-Spent-and-Total/td-p/138416
// https://community.shopify.com/c/Shopify-Discussion/importing-total-order-and-total-spend-of-customer/td-p/766877
/**
 * Shopify Staff (Retired)
 * ... these fields are calculated based on orders in the system and can't be overridden when importing existing customers.
 */
/**
 * Some of your customers' information can't be transferred between platforms. 
 * Shopify tracks only what customers order and spend through your online store. 
 * It's not possible to import customer data for orders placed and money spent 
 * on another store or ecommerce platform. You can’t edit the Total Spent 
 * and Total Orders columns, as they represent what that customer has spent 
 * and ordered from your online store.
 */