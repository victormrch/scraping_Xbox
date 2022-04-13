require("dotenv").config();
var cron = require("node-cron");

const { chromium } = require("playwright-chromium");
const axios = require("axios");

const shops = [
  {
    vendor: "Game",
    url: "https://www.game.es/HARDWARE/PACK-CONSOLA/PACKS/XBOX-ALL-ACCESS-XBOX-SERIES-X/195998",
    checkStock: async ({ page }) => {
      const content = await page.textContent(".product-quick-actions");
      return content.includes("Producto no disponible") === false;
    },
  },
  {
    vendor: "Worten",
    url: "https://www.worten.es/productos/consolas-juegos/xbox/consolas/xbox-series-x-s/consola-xbox-series-x-1-tb-7240976",
    checkStock: async ({ page }) => {
      const content = await page.textContent(".iss-product-stock-button");
      return content.includes("Avisar cuando esté disponible") === false;
    },
  },
  {
    vendor: "Microsoft",
    url: "https://www.xbox.com/es-es/configure/8WJ714N3RBTL",
    checkStock: async ({ page }) => {
      const content = await page.textContent(
        '[aria-label="Finalizar la compra del pack"]'
      );
      return content.includes("Sin existencias") === false;
    },
  },
];

cron.schedule("*/10 * * * *", () => {
  (async () => {
    const browser = await chromium.launch({ chromiumSandbox: false });

    for (const shop of shops) {
      const { checkStock, vendor, url } = shop;
      const page = await browser.newPage();
      await page.goto(url);

      const hasStock = await checkStock({ page });

      const date = new Date().toUTCString();

      console.log(
        `🔹 ${date}--> ${vendor}: ${
          hasStock ? "In Stock 💸 " : "Out of stock 😢 "
        }`
      );

      if (hasStock) {
        await axios.post(process.env.URL_DISCORD, {
          content: `🏃🏻‍♂️🏃🏻‍♂️Run!!!. There are stock in ${vendor}!!!! Buy the Xbox Serie - X, NOW!!!! Buy Link: '${url}' `,
        });
      }
    }

    await browser.close();
  })();
});
