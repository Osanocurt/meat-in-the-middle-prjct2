const Pub = require('../models/pub');

function pubsIndex(req, res) {
  Pub.find((err, pub) => {
    if(err) return res.status(500).json({ error: "500: Server Error" });
    res.json(pub);
  });
}

function pubsCreate(req, res) {
  console.log(req.body);
  Pub.create(req.body, (err, pub) => {
    if(err) return res.status(400).json({ error: "400: Invalid data" });
    res.status(201).json(pub);
  });
}

function pubsShow(req, res) {
  Pub.findById(req.params.id, (err, pub) => {
    if(err) return res.status(500).json({ error: "500: Server Error" });
    res.json(pub);
  });
}

function pubsUpdate(req, res) {
  Pub.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, pub) => {
    if(err) return res.status(400).json({ error: "400: Invaid data" });
    res.json(pub);
  });
}

function pubsDelete(req, res) {
  Pub.findByIdAndRemove(req.params.id, (err) => {
    if(err) return res.status(500).json({ error: "500: Server Error" });
    res.status(204).send();
  });
}

module.exports = {
  index: pubsIndex,
  create: pubsCreate,
  show: pubsShow,
  update: pubsUpdate,
  delete: pubsDelete
};
