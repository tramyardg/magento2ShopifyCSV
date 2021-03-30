const http = require("http");

const csv = require("csv-parser");
const fs = require("fs");
const results = [];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const header = require("./header");

fs.createReadStream("../ABACO_JACKET.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    console.log(results.length);
    process(results);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

const process = (result) => {
  let main = result.filter((r) => r.name === "" && r.size === "");
  // console.log(main);
  // console.log(main.length)

  let res = result.filter((r) => r.name !== "" && r.size !== "" && r.color !== "");
  console.log(res.length);
  let records = [];
  res.sort(function(a, b) {
    return a.sku - b.sku;
  });

  for (let i = 0; i < res.length; i++) {
    let data = res[i];
    records.push({
      handle: "abaco",
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
      variant_inventory_tracker: "shopify",
      variant_taxable: "TRUE",
      variant_fulfillment_service: "manual",
      variant_grams: data.weight * 1000,
      variant_weight_unit: "g",
      status: "draft",
      seo_title: createTitle(data.name),
      gift_card: "FALSE"
    });
    
    records[i].image_src = "https://shop.mariesaintpierre.com/media/catalog/product"+
    createImageSrc(main, records[i])[Math.floor(Math.random() * createImageSrc(main, records[i]).length - 1)+ 1]._image_src;
    // console.log(records[i].image_src)
    records[i].image_position = createImageSrc(main, records[i])[0]._image_position;
    
  }
  console.log(records);
  csvWriter.writeRecords(records).then(() => {
    console.log("...Done");
  });
};

const csvWriter = createCsvWriter({
  path: "../result.csv",
  header: header.header(),
});


const createImageSrc = (main, records) => {
  let larr = main.filter(
    (r) =>
      r.sku.substring(0, r.sku.indexOf("-")) ===
      records.variant_sku.substring(0, records.variant_sku.indexOf("-"))
  );
  let arr = [];
  for (let i = 0; i < larr.length; i++) { 
    arr.push({
      _image_src: larr[i]._media_image,
      _image_position: larr[i]._media_position
    });
  }
  console.log(arr);
  return arr;
}  

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
