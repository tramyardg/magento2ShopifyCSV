const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const results = [];
const header = require("./header");
const MAGENTO_IMAGE_LOCATION_URI = "https://shop.mariesaintpierre.com/media/catalog/product";
const FILES_TO_IMPORT_PATH = "../import/TODO";

fs.readdir(FILES_TO_IMPORT_PATH, async (err, files) => {
  if (err) console.log(err);
  else {
    console.log("\nCurrent directory filenames:");
    files.forEach((file) => {
      fs.createReadStream(`${FILES_TO_IMPORT_PATH}/${file}`)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          process(results);
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
        });
    });
  }
});
const process = (result) => {
  let main = result.filter((r) => r.name === "" && r.size === "");
  let res = result.filter(
    (r) => r.name !== "" && r.size !== "" && r.color !== ""
  );
  let records = [];
  res.sort(function (a, b) {
    return a.sku - b.sku;
  });

  for (let i = 0; i < res.length; i++) {
    let data = res[i];
    records.push({
      handle: createTitle(data.name),
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
      status: "active",
      seo_title: createTitle(data.name),
      gift_card: "FALSE",
      collection: data.subtitle,
    });

    // let imgSrc = MAGENTO_IMAGE_LOCATION_URI + createImageSrc(main, records[i])[0]._image_src;
    // let imgPos = createImageSrc(main, records[i])[0]._image_position;
    // records[i].image_src = imgSrc;
    // records[i].image_position = imgPos;
  }
  // console.log(records);
  csvWriter.writeRecords(records).then(() => {
    console.log("...Done");
  });
};
const csvWriter = createCsvWriter({
  path: `../results/test1_result.csv`,
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
      _image_position: larr[i]._media_position,
    });
  }
  // console.log(arr);
  return arr;
};

const createTitle = (rawName) => {
  let first = rawName.lastIndexOf("-");
  return first === -1 ? rawName : rawName.substring(0, first);
};
