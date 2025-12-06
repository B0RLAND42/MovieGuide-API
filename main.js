// -----------------------------
// CONFIG
// -----------------------------
const TMDB_KEY = "2c16319b3fd8960e442db493ecee1773";
const OMDB_KEY = "65ae4c4d"; // optional

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";

const searchBox = document.getElementById("search-box");
const searchBarList = document.getElementById("search-bar-list");
const infoLayout = document.getElementById("info-layout");

const toggleBtn = document.getElementById("popular-toggle");
const toggleIcon = document.getElementById("toggle-icon");
const popularList = document.getElementById("popular-movies-list");

toggleBtn.addEventListener("click", () => {
  popularList.classList.toggle("collapsed");
  toggleIcon.classList.toggle("rotated");
});

// Hide the popular movies list when a movie is selected (from search or popular list)
function hidePopularMovies() {
  document.getElementById("popular-movies-container").style.display = "none";
}

// -----------------------------
// SEARCH (debounced)
// -----------------------------
function debounce(func, delay = 350) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const handleSearch = debounce(() => {
  const term = searchBox.value.trim();
  if (term.length > 0) {
    searchBarList.classList.remove("hide-search-bar-list");
    searchTMDB(term);
  } else {
    searchBarList.classList.add("hide-search-bar-list");
  }
});

searchBox.addEventListener("keyup", handleSearch);

// -----------------------------
// TMDB SEARCH
// -----------------------------
async function searchTMDB(query) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    query
  )}&include_adult=false&language=en-US&page=1&api_key=${TMDB_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      searchBarList.innerHTML = `<p class="no-results">No results found.</p>`;
      return;
    }
    displayMovieList(data.results);
  } catch (e) {
    console.error(e);
  }
}

// -----------------------------
// RENDER SEARCH DROPDOWN
// -----------------------------
function displayMovieList(results) {
  searchBarList.innerHTML = "";

  results.forEach((movie) => {
    const poster = movie.poster_path
      ? `${TMDB_IMAGE}${movie.poster_path}`
      : "./images/clapperboard.png";

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";

    const item = document.createElement("div");
    item.classList.add("search-bar-thumb");
    item.dataset.id = movie.id;

    item.innerHTML = `
      <div class="poster-thumb">
        <img src="${poster}">
      </div>
      <div class="search-movie-title">
        <h3>${movie.title}</h3>
        <p>${year}</p>
      </div>
    `;

    item.addEventListener("click", () => {
      searchBarList.classList.add("hide-search-bar-list");
      searchBox.value = "";
      loadMovieDetails(movie.id);
    });

    searchBarList.appendChild(item);
  });
}

// Fetch all genres from TMDB (only once, then cached)
let genres = [];

async function fetchGenres() {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    genres = data.genres; // Save the genres globally
  } catch (err) {
    console.error("Error fetching genres:", err);
  }
}

// Function to fetch a random movie from a random genre and year
async function fetchRandomMovie() {
  // Ensure genres are loaded first
  if (genres.length === 0) {
    await fetchGenres(); // Fetch genres if they haven't been fetched yet
  }

  // Get a random genre (pick from available genres)
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];

  // Get a random year between 1960 and 2025
  const randomYear = Math.floor(Math.random() * (2025 - 1960 + 1)) + 1960;

  // Fetch movies based on the random genre and random year
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&year=${randomYear}&with_genres=${randomGenre.id}&sort_by=popularity.desc&page=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      // Pick a random movie from the results
      const randomMovie =
        data.results[Math.floor(Math.random() * data.results.length)];
      loadMovieDetails(randomMovie.id); // Display movie details
    } else {
      console.log(
        "No movies found for the selected genre and year, trying again..."
      );
      fetchRandomMovie(); // Retry if no movies were found
    }
  } catch (err) {
    console.error("Error fetching random movie:", err);
  }
}

// -----------------------------
// FETCH POPULAR MOVIES
// -----------------------------
async function fetchPopularMovies() {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      displayPopularMovies(data.results.slice(0, 5)); // Show top 5 movies
    }
  } catch (err) {
    console.error("Error fetching popular movies:", err);
  }
}

// -----------------------------
// RENDER POPULAR MOVIES
// -----------------------------
function displayPopularMovies(movies) {
  const popularMoviesList = document.getElementById("popular-movies-list");

  // Clear any existing content
  popularMoviesList.innerHTML = "";

  movies.forEach((movie) => {
    const poster = movie.poster_path
      ? `${TMDB_IMAGE}${movie.poster_path}`
      : "./images/clapperboard.png";

    const item = document.createElement("div");
    item.classList.add("popular-movies-item");
    item.dataset.id = movie.id;

    item.innerHTML = `
      <img src="${poster}" alt="${movie.title} Poster">
      <h4>${movie.title}</h4>
    `;

    item.addEventListener("click", () => {
      // Hide popular movies section
      hidePopularMovies();
      // Load movie details
      loadMovieDetails(movie.id);
    });

    popularMoviesList.appendChild(item);
  });

  // Show the popular movies section
  document.getElementById("popular-movies-container").style.display = "block";
}

// -----------------------------
// FETCH MOVIE DETAILS FROM TMDB
// -----------------------------
async function loadMovieDetails(movieId) {
  try {
    // Hide popular movies section when a movie is selected
    hidePopularMovies();

    // TMDB fetch
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_KEY}&append_to_response=videos,credits`
    );
    const tmdbData = await tmdbRes.json();

    // Update the background image with the movie's backdrop or poster
    updateBackgroundImage(tmdbData.backdrop_path || tmdbData.poster_path);

    // OMDB fetch using title + year
    const title = encodeURIComponent(tmdbData.title);
    const year = tmdbData.release_date?.slice(0, 4) || "";
    const omdbRes = await fetch(
      `https://www.omdbapi.com/?t=${title}&y=${year}&apikey=${OMDB_KEY}`
    );
    const omdbData = await omdbRes.json();

    displayMovieDetails(tmdbData, omdbData);
  } catch (err) {
    console.error(err);
  }
}

function updateBackgroundImage(imagePath) {
  if (imagePath) {
    const imageUrl = `${TMDB_IMAGE}${imagePath}`;
    const img = new Image(); // Create a new image object

    // Wait for the image to load
    img.onload = function () {
      // Once the image is loaded, apply the background image
      document.querySelector(
        ".main"
      ).style.backgroundImage = `url('${imageUrl}')`;
    };

    // Start loading the image
    img.src = imageUrl;
  } else {
    // Fallback to the default background image if no movie backdrop is available
    document.querySelector(
      ".main"
    ).style.backgroundImage = `url('/images/clapper.webp')`;
  }
}

// -----------------------------
// RENDER MOVIE DETAILS (with trailer modal)
// -----------------------------
function displayMovieDetails(tmdb, omdb) {
  const poster = tmdb.poster_path
    ? `${TMDB_IMAGE}${tmdb.poster_path}`
    : "./images/clapperboard.png";
  const year = tmdb.release_date?.slice(0, 4) || "N/A";
  const runtime = tmdb.runtime ? `${tmdb.runtime} min` : "";
  const tagline = tmdb.tagline ? `<em>"${tmdb.tagline}"</em>` : "";
  const genres = tmdb.genres?.map((g) => g.name).join(", ");
  const scoreValue = tmdb.vote_average ? tmdb.vote_average.toFixed(1) : "N/A";

  // TMDB top 5 cast
  const castList =
    tmdb.credits?.cast
      ?.slice(0, 5)
      .map(
        (c) =>
          `<li>${c.name} <span class="cast-role">as ${c.character}</span></li>`
      )
      .join("") || "";

  // OMDB rating
  const rated = omdb.Rated ? omdb.Rated : "N/A";

  // Score class for styling
  let scoreClass = "";
  if (scoreValue >= 7) scoreClass = "high";
  else if (scoreValue >= 5) scoreClass = "medium";
  else if (scoreValue < 5) scoreClass = "low";

  // Check if trailer exists
  const trailer = tmdb.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  // Render main content
  infoLayout.innerHTML = `
    <div class="movie-poster">
      <img src="${poster}">
    </div>

    <div class="movie-info">
      <h3 class="movie-title">${tmdb.title}</h3>
      <div class="movie-info-horizontal">
        <p class="year">${year}</p>
        <p class="released">${runtime}</p>
        <p class="genre">${genres}</p>
      </div>

      <ul class="movie-data">
        
        <li class="rated">Rating: ${rated}</li>
        <li class="score ${scoreClass}">Score: ${scoreValue}</li>
      </ul>

      ${tagline ? `<p class="tagline">${tagline}</p>` : ""}
      
      <p class="plot"> ${tmdb.overview}</p>
      ${
        castList
          ? `
  <div class="cast">
    <h4>Cast</h4>
    <ul class="cast-list">
      ${castList}
    </ul>
  </div>
`
          : ""
      }

      ${
        trailer
          ? `<button id="trailer-btn" class="trailer-btn">Watch Trailer</button>`
          : ""
      }
    </div>
  `;

  // -----------------------------
  // TRAILER MODAL LOGIC
  // -----------------------------
  if (trailer) {
    const trailerBtn = document.getElementById("trailer-btn");
    const trailerModal = document.getElementById("trailer-modal");
    const trailerClose = document.getElementById("trailer-close");
    const trailerIframe = document.getElementById("trailer-iframe");

    trailerBtn.addEventListener("click", () => {
      trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      trailerModal.classList.remove("hide");
    });

    trailerClose.addEventListener("click", () => {
      trailerIframe.src = "";
      trailerModal.classList.add("hide");
    });

    trailerModal.addEventListener("click", (e) => {
      if (e.target === trailerModal) {
        trailerIframe.src = "";
        trailerModal.classList.add("hide");
      }
    });
  }
}

// Add event listener for the "Random Movie Night" button
document.getElementById("random-movie-btn").addEventListener("click", () => {
  // Hide the popular movies section
  hidePopularMovies();

  // Fetch a random movie from TMDB
  fetchRandomMovie();
});

// -----------------------------
// CLICK OUTSIDE = CLOSE SEARCH
// -----------------------------
window.addEventListener("click", (e) => {
  if (e.target !== searchBox) {
    searchBarList.classList.add("hide-search-bar-list");
  }
});

// Initialize the popular movies section
document.addEventListener("DOMContentLoaded", () => {
  fetchPopularMovies();
});
