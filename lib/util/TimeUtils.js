const moment = require('moment-timezone');

module.exports = {
  format: (dateStr, fmt, timezone) => moment.tz(dateStr, timezone).format(fmt),
};
