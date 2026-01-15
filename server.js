require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require("morgan");
const methodOverride = require("method-override");
const authRoutes = require("./controllers/auth");
const listingController = require("./controllers/listing");
const usersController = require("./controllers/users");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const isSignedIn = require("./middleware/is-signed-in");
const passDataToView = require("./middleware/pass-data-to-view");

// Middlewares
require("./db/connection");
app.use(morgan("tiny"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passDataToView);

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use("/auth", authRoutes);

// Routes below this you must be signed in
app.use(isSignedIn);
app.use("/listings", listingController);
app.use("/users", usersController);

app.listen(PORT, () => {
  console.log("This ship sailing on port", PORT);
});
