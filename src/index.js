const http = require("http");

const csv = require("csv-parser");
const fs = require("fs");
const results = [];

// const header = require("./header");

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
      vendor: "mariesaintpierre",
      published: "FALSE",
      option1_name: "Size",
      option1_value: data.size,
      variant_inventory_qty: data.qty,
      variant_price: data.price
    });
    // recods[i].handle = createHandler(res[i].name);
  }
  console.log(records);
};

const createHandler = (sku) => {
  let last = sku.lastIndexOf("-");
  return last === -1 ? sku : sku.substring(0, last);
};

const createTitle = (rawName) => {
  let first = rawName.lastIndexOf("-");
  return first === -1 ? rawName : rawName.substring(0, first);
};

const getSize = (sku) => {
  let last = sku.lastIndexOf("-");
  return last === -1 ? "" : sku.substring(last + 1, sku.length);
};

http
  .createServer(function (req, res) {
    res.write("Hello World!"); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
