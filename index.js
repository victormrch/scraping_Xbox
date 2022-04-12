const express = require("express");

const app = express();

let PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
  require("dotenv").config();
  var cron = require("node-cron");

  const { chromium } = require("playwright");
  const axios = require("axios");

  const shops = [
    {
      vendor: "Game",
      url: "https://www.game.es/OFERTAS/PACK/PACKS/PACK-SEMINUEVO-NINTENDO-SWITCH-2-JOY-CON-A-ELEGIR/P02075",
      checkStock: async ({ page }) => {
        const content = await page.textContent(".product-quick-actions");
        return content.includes("Producto no disponible") === false;
      },
    },
  ];

  cron.schedule("*/1 * * * *", () => {
    (async () => {
      const browser = await chromium.launch();

      for (const shop of shops) {
        const { checkStock, vendor, url } = shop;
        const page = await browser.newPage();
        await page.goto(url);

        const hasStock = await checkStock({ page, url });

        console.log(
          `${vendor}: ${hasStock ? "In Stock 💸 " : "Out of stock 😢 "}`
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
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
