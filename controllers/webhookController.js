exports.receiveWebhook = async (req, res) => {
  const event = req.body;
  console.log('Received webhook event:', event);
  // Process triggers, update analytics
  res.status(200).send('Received');
};
