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
  {
    vendor: "El Corte Inglés",
    url: "https://www.elcorteingles.es/videojuegos/A37047078-xbox-series-x/",
    checkStock: async ({ page }) => {
      const content = await page.textContent("#js_add_to_cart_desktop");
      return content.includes("Agotado temporalmente") === false;
    },
  },
  {
    vendor: "Amazon",
    url: "https://www.amazon.es/dp/B08H93ZRLL/ref=cm_sw_r_cp_apa_glt_i_91H0Z62WVDRT6FMW033Z?tag=eol00-21",
    checkStock: async ({ page }) => {
      const addToCartButton = await page.$$("#add-to-cart-button");
      return addToCartButton.length > 0;
    },
  },
  {
    vendor: "PCComponentes",
    url: "https://www.pccomponentes.com/microsoft-xbox-series-x-1tb",
    checkStock: async ({ page }) => {
      const content = await page.textContent("#buy-buttons-section");
      return content && content.includes("Añadir al carrito") === true;
    },
  },
];

cron.schedule("*/10 * * * *", () => {
  (async () => {
    const browser = await chromium.launch({ chromiumSandbox: false });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
    });
    const date = new Date().toUTCString();

    try {
      for (const shop of shops) {
        const { checkStock, vendor, url } = shop;

        await page.goto(url);

        const hasStock = await checkStock({ page });

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
    } catch (error) {
      console.log("An error ocurred:", error);

      await page.screenshot({ path: `errors/${date}_error.png` });
      await browser.close();
    }

    await browser.close();
  })();
});
