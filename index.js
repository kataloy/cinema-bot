const { Telegraf } = require('telegraf');
const config = require('./config');
const kinopoisk = require('./providers/kinopoisk');
const ivi = require('./providers/ivi');

const bot = new Telegraf(config.BOT_TOKEN);

const PROVIDER_NAMES = {
  kinopoisk: 'кинопоиске',
  ivi: 'иви',
};

bot.start((ctx) => {
  ctx.reply('👀 Привет! Напиши название фильма, и я подскажу, где лучше его смотреть. 😎📺');
});

bot.on('text', async (ctx) => {
  const { text } = ctx.message;

  const [kinopoiskResult, iviResult] = await Promise.all([
    kinopoisk.getFilms(text),
    ivi.getFilms(text)
  ]);

  if (kinopoiskResult.length === 0 && iviResult.length === 0) {
    return ctx.reply('Фильм не найден! 😢');
  }

  const prices = {};

  [...iviResult, ...kinopoiskResult].forEach((item) => {
    const { title, price, provider, year } = item;
    const key = `${title}_${year.join('-')}`;

    if (!prices[key]) {
      prices[key] = {
        ...item,
        year: year.join('-'),
      };
    } else if (prices[key] && prices[key].price > price) {
      prices[key].price = price;
      prices[key].provider = provider;
    }
  });

  const message = Object.values(prices)
    .map((item) => {
      let text = `🎦 ${item.title} (${item.year} г.)\n\nМожно посмотреть на ${PROVIDER_NAMES[item.provider]}`;

      text += item.price ? ` за ${item.price} рублей.` : ' по подписке.';

      return text;
    })
    .join('\n\n—\n\n');

  ctx.reply(message);
})

bot.launch();