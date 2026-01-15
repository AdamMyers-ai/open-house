const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const formatCurrency = require("../utils/formatCurrency");

// Index GET /listings
router.get("/", async (req, res) => {
  const listings = await Listing.find().populate("owner");
  res.render("listings/index.ejs", { listings });
});

// New GET /listings/new
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Delete DELETE /listings/:listingId
router.delete("/:listingId", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId);
    if (!foundListing)
      throw new Error(
        `Failed to find a property with id ${req.params.listingId}`
      );

    if (!foundListing.owner._id.equals(req.session.user._id)) {
      throw new Error("You must own this property to delete it.");
    }

    await foundListing.deleteOne();

    res.redirect(`/listings`);
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect(`/listings/${req.params.listingId}`);
    });
  }
});

// Update
router.put("/:listingId", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId);
    if (!foundListing)
      throw new Error(
        `Failed to find a property with id ${req.params.listingId}`
      );
    if (!foundListing.owner._id.equals(req.session.user._id)) {
      throw new Error("You must own this property to update it.");
    }

    await foundListing.updateOne(req.body);

    res.redirect("/listings");
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect(`/listings/${req.params.listingId}`);
    });
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    const { city, streetAddress, price, size } = req.body;
    if (!city.trim()) throw new Error("City requires a proper city");
    if (!streetAddress.trim())
      throw new Error("Street Address requires a proper address");
    if (size < 0 || size === "")
      throw new Error("Invalid size, please input a size greater than 0.");
    if (price < 0 || price === "")
      throw new Error("Invalid price, please input a price greater than 0.");

    req.body.owner = req.session.user._id;

    await Listing.create(req.body);
    res.redirect("/listings");
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings/new");
    });
  }
});

// Edit
router.get("/:listingId/edit", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId);
    console.log(req.params);
    if (!foundListing)
      throw new Error(
        `Failed to find a property with id ${req.params.listingId}`
      );
    res.render("listings/edit.ejs", { listing: foundListing });
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

// Show
router.get("/:listingId", async (req, res) => {
  try {
    const foundListing = await Listing.findById(req.params.listingId).populate(
      "owner"
    );

    const userHasLikedItem = foundListing.favoritedByUsers.some((user) => {
      return user.equals(req.session.user._id);
    });

    const currency = formatCurrency(foundListing.price, "USD");
    foundListing.price = currency;

    if (!foundListing)
      throw new Error(
        `Failed to find a property with id ${req.params.listingId}`
      );

    res.render("listings/show.ejs", {
      listing: {
        listing: foundListing,
        price: currency,
        size: foundListing.size,
        streetAddress: foundListing.streetAddress,
        city: foundListing.city,
        owner: foundListing.owner,
        favoritedByUsers: foundListing.favoritedByUsers,
      },
      userHasLikedItem,
    });
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

router.post("/:listingId/favorited-by/:userId", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $push: { favoritedByUsers: req.params.userId },
    });

    res.redirect(`/listings/${req.params.listingId}`);
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

router.delete("/:listingId/favorited-by/:userId", async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $pull: { favoritedByUsers: req.params.userId },
    });

    res.redirect(`/listings/${req.params.listingId}`);
  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    req.session.save(() => {
      res.redirect("/listings");
    });
  }
});

module.exports = router;
