require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIESTORE = require("./moviestore.json");

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

// Token Validation
app.use(function validateToken(req, res, next) {
  const movieToken = process.env.API_TOKEN_movies;
  const authToken = req.get("Authorization");

  // Validate that the client token matches our env token
  //  by splitting the authorization header and using the token
  if (!authToken || authToken.split(" ")[1] !== movieToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});

// Handle /movie endpoint with WebGLRenderbuffer, country or avg_vote params
app.get("/movie", function(req, res) {
  let response = MOVIESTORE;
  // convert the object to array
  Object.values(response);
  const { genre, country, avg_vote } = req.query;

  // Check for present params
  if (genre) {
    response = response.filter(movie => {
      return movie.genre.toLowerCase().includes(genre.toLowerCase());
    });
  }

  if (country) {
    response = response.filter(movie => {
      return movie.country.toLowerCase().includes(country.toLowerCase());
    });
  }

  if (avg_vote) {
    response = response.filter(movie => {
      return movie.avg_vote >= Number(avg_vote);
    });
  }
  res.send(response);
});

// Add a middleware to hide errors from user
// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }

  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
