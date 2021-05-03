require("dotenv").config({ path: "../../.env" });
const { GraphQLClient, gql } = require("graphql-request");

async function main() {
  const endpoint =
    "https://mariesaintpierre.myshopify.com/api/2021-04/graphql.json";

  const graphQLClient = new GraphQLClient(endpoint);
  graphQLClient.setHeader(
    "X-Shopify-Storefront-Access-Token",
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  );
  graphQLClient.setHeader("Accept", "application/json");

  const query = gql`
    {
      products(first: 250) {
        edges {
          cursor
          node {
            id
            title
            description
            onlineStoreUrl
            priceRange {
              maxVariantPrice {
                amount
              }
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  const arr = data.products.edges;
  let priceRangeMax = arr.filter(
    (p) => p.node.priceRange.maxVariantPrice.amount < 5
  );
  let priceRangeMin = arr.filter(
    (p) => p.node.priceRange.minVariantPrice.amount <= 225
  );
  console.log(priceRangeMin);
}

main().catch((error) => console.error(error));
