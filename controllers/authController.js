const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');

const trackOpen = async (req, res) => {
  try {
    const { campaignId, customerId } = req.params;
    const customer = await Customer.findById(customerId);
    if (customer && !customer.opened) {
      customer.opened = true;
      customer.openedAt = new Date();
      await customer.save();
    }

    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQImWNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
      'base64'
    );

    res.set('Content-Type', 'image/png');
    res.send(pixel);
  } catch (err) {
    console.error('Open track failed', err.message);
    res.sendStatus(204); // don't block email render
  }
};

const trackClick = async (req, res) => {
  try {
    const { campaignId, customerId } = req.params;
    const customer = await Customer.findById(customerId);
    if (customer && !customer.clicked) {
      customer.clicked = true;
      customer.clickedAt = new Date();
      await customer.save();
    }

    // Redirect to destination
    const { url } = req.query;
    res.redirect(url || 'https://yourdomain.com'); // fallback
  } catch (err) {
    console.error('Click track failed', err.message);
    res.redirect('https://yourdomain.com');
  }
};

module.exports = { trackOpen, trackClick };
