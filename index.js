require("dotenv").config();
var cron = require("node-cron");

const { chromium } = require("playwright-chromium");
const axios = require("axios");

const shops = [
  {
    vendor: "Game",
    url: "https://www.game.es/VIDEOJUEGOS/DEPORTES/PLAYSTATION-4/FIFA-22/191605",
    checkStock: async ({ page }) => {
      const content = await page.textContent(".product-quick-actions");
      return content.includes("Producto no disponible") === false;
    },
  },
];

cron.schedule("*/1 * * * *", () => {
  (async () => {
    const browser = await chromium.launch({ chromiumSandbox: false });

    for (const shop of shops) {
      const { checkStock, vendor, url } = shop;
      const page = await browser.newPage();
      await page.goto(url);

      const hasStock = await checkStock({ page, url });

      const date = new Date().toUTCString();

      console.log(
        `🔹 ${date}--> ${vendor}: ${
          hasStock ? "In Stock 💸 " : "Out of stock 😢 "
        }`
      );

      if (hasStock) {
        await axios.post(process.env.URL_DISCORD, {
          content:
            "🏃🏻‍♂️🏃🏻‍♂️Run!!!. There are stock in Game!!!! Buy the Xbox Serie - X, NOW!!!! Buy Link: 'https://bit.ly/3vd5Xyb'  ",
        });
      }
    }

    await browser.close();
  })();
});
