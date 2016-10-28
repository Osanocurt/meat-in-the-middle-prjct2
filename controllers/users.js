const Pub = require('../models/pub');

function pubsIndex(req, res) {
  Pub.find((err, pubs) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(200).json(pubs);
  });
}

function pubsShow(req, res) {
  Pub.findById(req.params.id, (err, pub) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!pub) return res.status(404).json({ message: "Pub not found." });
    return res.status(200).json(pub);
  });
}

function pubsUpdate(req, res) {
  Pub.findByIdAndUpdate(req.params.id, req.body, { new: true },  (err, pub) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!pub) return res.status(404).json({ message: "Pub not found." });
    return res.status(200).json(pub);
  });
}

function pubsDelete(req, res) {
  Pub.findByIdAndRemove(req.params.id, (err, pub) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!pub) return res.status(404).json({ message: "Pub not found." });
    return res.status(204).send();
  });
}

module.exports = {
  index:  pubsIndex,
  show:   pubsShow,
  update: pubsUpdate,
  delete: pubsDelete
};
