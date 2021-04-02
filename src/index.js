const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const results = [];
const header = require("./header");
const MAGENTO_IMAGE_LOCATION_URI =
  "https://shop.mariesaintpierre.com/media/catalog/product";
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
  let main = result.filter((r) => r.size === "" 
  && r.image !== "" 
  && r.small_image !== "" 
  && r.thumbnail !== "" 
  && r.has_options === "1");

  let simple = result.filter((r) => r.name !== "" && r.size !== "" && r.color !== "");
  simple.sort(function(a, b) {
    return a.sku.localeCompare(b.sku);
  });

  let records = [];
  for (let i = 0; i < simple.length; i++) {
    let data = simple[i];
    records.push({
      handle: createTitle(data.name).toLowerCase(),
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
  }
  csvWriter.writeRecords(records).then(() => {
    console.log("...Done");
  });
};

const csvWriter = createCsvWriter({
  path: `../results/test1_result.csv`,
  header: header.header(),
});

// const createImageSrc = (data, main) => {
//   let trimSkuData = data.sku.substring(0, data.sku.lastIndexOf("-"));
//   let mainFilter = main.filter((m) => m.sku === trimSkuData); // this will return the row with images
//   let imageSrc;
//   if (mainFilter.length > 0) {
//     const { small_image, image, thumbnail } = mainFilter[0];
//     if (small_image !== "" && image !== "" && thumbnail !== "") {
//       imageSrc = magentoImageLink(image);
//     }
//   }
//   return imageSrc;
// };

// const magentoImageLink = (imgPath) => MAGENTO_IMAGE_LOCATION_URI + imgPath;

const createTitle = (rawName) => {
  let first = rawName.lastIndexOf("-");
  return first === -1 ? rawName : rawName.substring(0, first);
};
