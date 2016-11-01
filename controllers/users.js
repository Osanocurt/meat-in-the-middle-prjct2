const User = require('../models/user');

function usersIndex(req, res) {
  User.find((err, users) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(200).json(users);
  });
}

function usersShow(req, res) {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json(user);
  });
}

function usersUpdate(req, res) {
  User.findByIdAndUpdate(req.params.id, req.body.user, { new: true },  (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json(user);
  });
}

function usersDelete(req, res) {
  User.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(204).send();
  });
}

function usersFriendsIndex(req, res) {
  User.findById(req.params.id , (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json(user.friends);
  });
}

function usersFriendsCreate(req, res) {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.friends.push(req.body);
    user.save((err, user) => {
      if (err) return res.status(500).json({ message: "Something went wrong." });
      return res.status(201).json(user.friends);
    });
  });
}

function usersFriendsShow(req, res) {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });

    let friend = user.friends.id(req.params.friendId);
    if (!friend) return res.status(404).json({ message: "Friend not found." });
    return res.json(friend);
  });
}

function usersFriendsUpdate(req, res) {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });

    let friend = user.friends.id(req.params.friendId);
    friend.name = req.body.name;
    friend.lat = req.body.lat;
    friend.lng = req.body.lng;
    friend.address = req.body.address;
    user.save((err, user) => {
      if (err) return res.status(500).json({ message: "Something went wrong. " + err });
      return res.status(200).json(user.friends);
    });
  });
}

function usersFriendsDelete(req, res) {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!user) return res.status(404).json({ message: "User not found." });

    let friend = user.friends.id(req.params.friendId);
    friend.remove();
    user.save((err, user) => {
      if (err) return res.status(500).json({ message: "Something went wrong." });
      return res.status(204).json(user.friends);
    });
  });
}

module.exports = {
  index:  usersIndex,
  show:   usersShow,
  update: usersUpdate,
  delete: usersDelete,
  friendsIndex: usersFriendsIndex,
  friendsShow: usersFriendsShow,
  friendsCreate: usersFriendsCreate,
  friendsUpdate: usersFriendsUpdate,
  friendsDelete: usersFriendsDelete,
};
