const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const results = [];
const header = require("./header");
const customFieldsHeader = require("./custom_fields_header");
const MAGENTO_IMAGE_LOCATION_URI =
  "https://shop.mariesaintpierre.com/media/catalog/product";
const FILES_TO_IMPORT_PATH = "../../import/TODO";
const RESULT_CSV_FILE = "../../results/csv_to_import_shopify.csv";

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
  // is the main (root) product
  let configurable = result.filter(
    (r) =>
      r.size === "" &&
      r.image !== "" &&
      r.small_image !== "" &&
      r.thumbnail !== "" &&
      r.has_options === "1"
  );

  // rows that contains other images
  let configurableImages = result.filter((r) => r.name === "");
  let productImages = configurableImages.concat(configurable);

  // is it's variants products
  let simple = result.filter(
    (r) => r.name !== "" && r.size !== "" && r.color !== ""
  );
  simple.sort(function (a, b) {
    return a.sku.localeCompare(b.sku);
  });

  let records = [];
  let custom_fields_records = [];
  for (let i = 0; i < simple.length; i++) {
    let data = simple[i];
    records.push({
      handle: getTitle(configurable, data.name).toLowerCase(),
      title: getTitle(configurable, data.name),
      body: getCorrectDescription(configurable, data),
      vendor: "mariesaintpierre",
      published: "TRUE",
      option1_name: "Size",
      option1_value: data.size,
      option2_name: "Color",
      option2_value: data.color,
      option3_name: "",
      option3_value: "",
      variant_sku: data.sku,
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
      image_src: createImageSrc(data, configurable),
      variant_image: createImageSrc(data, configurable),
      tags: data.material + ", " + data.occasion,
    });
    custom_fields_records.push({
      handle: createTitle(data.name).toLowerCase(),
      title: createTitle(data.name),
      vendor: "mariesaintpierre",
      published: "FALSE",
      option1_name: "Size",
      option1_value: data.size,
      option2_name: "Color",
      option2_value: data.color,
      option3_name: "",
      option3_value: "",
      sku: data.sku,
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
      image_src: createImageSrc(data, configurable),
      p3_description_fr: "Description francaise",
    });
  }
  // console.log(configurable);
  // console.log(productImages[productImages.length - 1]);
  // productImages.forEach(r => console.log(r.name, r.sku));

  productImages.forEach((r) => {
    records.push({
      handle: r.name === "" ? configurable.filter(c => c.sku === r.sku)[0].name.toLowerCase() : r.name.toLowerCase(),
      title: "",
      body: "",
      vendor: "",
      published: "",
      option1_name: "",
      option1_value: "",
      option2_name: "",
      option2_value: "",
      option3_name: "",
      option3_value: "",
      variant_sku: "",
      variant_inventory_qty: "",
      variant_price: "",
      variant_requires_shipping: "",
      variant_inventory_tracker: "",
      variant_taxable: "",
      variant_fulfillment_service: "",
      variant_grams: "",
      variant_weight_unit: "",
      status: "",
      seo_title: "",
      gift_card: "",
      collection: "",
      image_src: r.small_image !== "" ? magentoImageLink(r.small_image) : magentoImageLink(r._media_image),
      variant_image: "",
      tags: "",
    });
  });
  csvWriter.writeRecords(records).then(() => {
    console.log("...Done");
  });
  // csvWriterCustomFields.writeRecords(custom_fields_records).then(() => {
  //   console.log("...Custom fields records done");
  // });
};

const csvWriter = createCsvWriter({
  path: RESULT_CSV_FILE,
  header: header.header,
});

const csvWriterCustomFields = createCsvWriter({
  path: `../../results/shopify_import_products_custom_fields.csv`,
  header: customFieldsHeader.custom_fields_header,
});
const createImageSrc = (data, main) => {
  let trimSkuData = data.sku.substring(0, data.sku.lastIndexOf("-"));
  let mainFilter = main.filter((m) => m.sku === trimSkuData); // this will return the row with images
  let imageSrc;
  if (mainFilter.length > 0) {
    const { small_image, image, thumbnail } = mainFilter[0];
    if (small_image !== "" && image !== "" && thumbnail !== "") {
      imageSrc = magentoImageLink(image);
    }
  }
  return imageSrc;
};

const magentoImageLink = (imgPath) => MAGENTO_IMAGE_LOCATION_URI + imgPath;

const createTitle = (rawName) => {
  let first = rawName.lastIndexOf("-");
  return first === -1 ? rawName : rawName.substring(0, first);
};

const getTitle = (configurable, dataName) => {
  let configName = configurable.filter((c) =>
    c.name.split(" ").includes(createTitle(dataName))
  );
  if (configName.length > 0) {
    return configName[0].name;
  } else {
    return createTitle(dataName);
  }
};

const getCorrectDescription = (configurable, data) => {
  let configName = configurable.filter((c) =>
    c.name.split(" ").includes(createTitle(data.name))
  );
  if (configName.length > 0) {
    return configName[0].description;
  } else {
    return data.description;
  }
};

// color: Black, Green
