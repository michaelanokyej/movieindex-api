require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIESTORE = require("./moviestore.json");

// console.log(MOVIESTORE);

app.use(morgan("dev"));
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
  // change the object to be and array
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

app.listen(8000, () => {
  console.log("Server is listening on PORT 8000");
});
