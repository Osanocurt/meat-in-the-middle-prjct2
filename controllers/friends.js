const Friend = require('../models/friend');

function friendsIndex(req, res) {
  Friend.find((err, friend) => {
    if(err) return res.status(500).json({ error: "500: Server Error" });
    res.json(friend);
  });
}

function friendsCreate(req, res) {
  console.log(req.body);
  Friend.create(req.body, (err, friend) => {
    if(err) return res.status(400).json({ error: "400: Invalid data" });
    res.status(201).json(friend);
  });
}

function friendsShow(req, res) {
  Friend.findById(req.params.id, (err, friend) => {
    if(err) return res.status(500).json({ error: "500: Server Error" });
    res.json(friend);
  });
}

function friendsUpdate(req, res) {
  Friend.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, friend) => {
    if(err) return res.status(400).json({ error: "400: Invaid data" });
    res.json(friend);
  });
}

function friendsDelete(req, res) {
  Friend.findByIdAndRemove(req.params.id, (err) => {
    if(err) return res.status(500).json({ error: "500: Server Error" });
    res.status(204).send();
  });
}

module.exports = {
  index: friendsIndex,
  create: friendsCreate,
  show: friendsShow,
  update: friendsUpdate,
  delete: friendsDelete
};
