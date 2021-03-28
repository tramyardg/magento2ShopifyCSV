var http = require("http");

const csv = require("csv-parser");
const fs = require("fs");

fs.createReadStream("./ZORN_products_export.csv")
  .pipe(csv())
  .on("data", (row) => {
    console.log(row.price);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });

http
  .createServer(function (req, res) {
    res.write("Hello World!"); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
