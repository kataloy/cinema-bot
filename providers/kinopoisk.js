const axios = require('axios');
const Abstract = require('./abstract');

class Kinopoisk extends Abstract {
  async getFilms(title) {
    const { data } = await axios.get('https://api.ott.kinopoisk.ru/v12/suggested-data', {
      params: {
        query: title,
        serviceId: 25,
      }
    });

    return data.films.map((item) => {
      const { title } = item;
      const { type, price, minimumPrice } = item.watchingOption;
      const year = item.year.split('-').map(item => +item);
      const result = { title, year, provider: 'kinopoisk', price: 0 };

      if (type === 'PAID') {
        result.price = Math.round(price * 0.7);
      } else if (type === 'PAID_MULTIPLE') {
        result.price = Math.round(minimumPrice * 0.7);
      }

      return result;
    });
  }
}

module.exports = new Kinopoisk();