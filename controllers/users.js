const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");

// Show GET /users/profile
router.get("/profile", async (req, res) => {
  try {
    const myListings = await Listing.find({
      owner: req.session.user._id,
    }).populate("owner");

    const myFavoriteListings = await Listing.find({
      favoritedByUsers: req.session.user._id,
    }).populate("owner");

    res.render("users/show.ejs", {
      myListings,
      myFavoriteListings,
    });
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

module.exports = router;
