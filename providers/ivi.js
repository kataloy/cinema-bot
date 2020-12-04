const axios = require('axios');
const Abstract = require('./abstract');

class Ivi extends Abstract {
  async getFilms(title) {
    const { data } = await axios.get('https://api.ivi.ru/mobileapi/autocomplete/common/v7', {
      params: {
        query: title,
        fields: 'object_type,title,id,kind,content_paid_types,used_to_be_paid,country,year,duration_minutes,genres,years',
        app_version: 870,
      }
    });

    const prices = [];

    await Promise.all(
      data.result.map(async (item) => {
        if (item.object_type !== 'video') return;

        const { data } = await axios.get('https://api.ivi.ru/mobileapi/billing/v1/purchase/content/options', {
          params: {
            id: item.id,
            user_ab_bucket: 4700,
            app_version: 870,
            session: 'ecdf4d0f1808854317_1622558242-329031677Ub1mzxokjxl_XsB0K4eYHA',
          }
        });

        prices.push({
          title: item.title,
          year: item.years ? item.years : [item.year],
          provider: 'ivi',
          price: +data.result.price_ranges.user_price.min,
        });
      })
    );

    return prices;
  }
}

module.exports = new Ivi();