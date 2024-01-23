const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/moviestore', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Movie Schema
const movieSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  // ... other fields
});

const Movie = mongoose.model('Movie', movieSchema);

// Create a movie
app.post('/movies', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).send(movie);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all movies with filters
app.get('/movies', async (req, res) => {
  try {
    const { title, rating, q, sortBy, page, limit } = req.query;

    const filter = {};
    if (title) filter.title = title;
    if (rating) filter.rating = rating;
    if (q) filter.title = { $regex: q, $options: 'i' }; // Case-insensitive search

    const sort = {};
    if (sortBy) sort[sortBy] = 1; // 1 for ascending, -1 for descending

    const movies = await Movie.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).send(movies);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read a specific movie
app.get('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) res.status(404).send({ error: 'Movie not found' });
    res.status(200).send(movie);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a movie
app.patch('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) res.status(404).send({ error: 'Movie not found' });
    res.status(200).send(movie);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a movie
app.delete('/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) res.status(404).send({ error: 'Movie not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
