const http = require("http");

const csv = require("csv-parser");
const fs = require("fs");
const results = [];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const header = require("./header");

// console.log(header.header());

fs.createReadStream("./ZORN_products_export.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    // name !== null
    // console.log(results[1]);
    console.log(results.length);

    // let records = [{ handle: "" }];
    process(results);

    // console.log(records);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

const process = (result) => {
  let res = result.filter((r) => r.name !== "");
  console.log(res.length);
  let records = [];
  res.sort();
  for (let i = 0; i < res.length; i++) {
    // res[i].name = createHandler(res[i].name);
    let data = res[i];
    records.push({
      handle: createHandler(data.sku),
      title: createTitle(data.name),
      variant_sku: data.sku,
      body: data.description,
      vendor: "mariesaintpierre",
      published: "FALSE",
      option1_name: "Size",
      option1_value: data.size,
      option2_name: "Color",
      option2_value: data.color,
      variant_inventory_qty: data.qty,
      variant_price: data.price,
      variant_requires_shipping: "TRUE",
      variant_taxable: "TRUE",
      variant_fulfillment_service: "manual",
      variant_grams: data.weight * 1000,
      variant_weight_unit: "g",
      status: "draft",
      seo_title: createTitle(data.name),
      gift_card: "FALSE",
      image_src: data.image
    });
    // recods[i].handle = createHandler(res[i].name);
  }
  csvWriter
    .writeRecords(records) // returns a promise
    .then(() => {
      console.log("...Done");
    });
};

const csvWriter = createCsvWriter({
  path: "src/test.csv",
  header: header.header()
});

const createHandler = (sku) => {
  let last = sku.lastIndexOf("-");
  return last === -1 ? sku : sku.substring(0, last);
};

const createTitle = (rawName) => {
  let first = rawName.lastIndexOf("-");
  return first === -1 ? rawName : rawName.substring(0, first);
};

http
  .createServer(function (req, res) {
    res.write("Hello World!"); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
