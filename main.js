// -----------------------------
// CONFIG
// -----------------------------
const TMDB_KEY = "2c16319b3fd8960e442db493ecee1773";
const OMDB_KEY = "65ae4c4d";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";

const searchBox = document.getElementById("search-box");
const searchBarList = document.getElementById("search-bar-list");
const infoLayout = document.getElementById("info-layout");

// -----------------------------
// UNIVERSAL COLLAPSIBLE SECTION HANDLER
// -----------------------------

document.querySelectorAll(".popular-movies-container").forEach(container => {
  const title = container.querySelector(".collapsible-title");
  const list = container.querySelector(".popular-movies-list");
  const icon = title.querySelector("i");

  title.addEventListener("click", () => {
    list.classList.toggle("collapsed");
    icon.classList.toggle("rotated");
  });
});

// -----------------------------
// Hide all collapsible sections
// -----------------------------
function hidePopularMovies() {
  document.querySelectorAll(".popular-movies-container").forEach(sec => {
    sec.style.display = "none";
  });
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
      hidePopularMovies();
      loadMovieDetails(movie.id);
    });

    searchBarList.appendChild(item);
  });
}

// -----------------------------
// GENRES FOR RANDOM MOVIE
// -----------------------------
let genres = [];

async function fetchGenres() {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    genres = data.genres;
  } catch (err) {
    console.error("Error fetching genres:", err);
  }
}

// -----------------------------
// RANDOM MOVIE (button)
// -----------------------------
async function fetchRandomMovie() {
  if (genres.length === 0) await fetchGenres();

  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  const randomYear = Math.floor(Math.random() * (2025 - 1960 + 1)) + 1960;

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&year=${randomYear}&with_genres=${randomGenre.id}&sort_by=popularity.desc&page=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const movie = data.results[Math.floor(Math.random() * data.results.length)];
      loadMovieDetails(movie.id);
    } else {
      fetchRandomMovie();
    }
  } catch (err) {
    console.error("Error fetching random movie:", err);
  }
}

// -----------------------------
// FETCH: TOP 5 TRENDING HORROR MOVIES
// -----------------------------
async function fetchTrendingHorrorMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&language=en-US&with_genres=27&sort_by=popularity.desc&vote_count.gte=500`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Display top 5 trending horror movies
    displaySectionMovies("popular-movies-list", data.results.slice(0, 6));
  } catch (err) {
    console.error("Error fetching trending horror movies:", err);
  }
}

// -----------------------------
// FETCH: COMING SOON
// -----------------------------
async function fetchNowPlaying() {
  const minRating = 5.5; // optional: filter out poorly rated movies
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&language=en-US&region=US&page=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Filter by minimum vote average
    const filtered = data.results.filter(movie => movie.vote_average >= minRating);

    displaySectionMovies("coming-soon-list", filtered.slice(0, 6));
  } catch (err) {
    console.error("Error fetching now playing movies:", err);
  }
}

// -----------------------------
// FETCH: BEST OF 2025
// -----------------------------
async function fetchBest2025() {
  const url = `
    https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}
    &language=en-US
    &primary_release_year=2025
    &sort_by=popularity.desc
    &vote_count.gte=75
  `.replace(/\s+/g, '');

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Additional filter: vote_average >= 5
    const filtered = data.results.filter(movie => movie.vote_average >= 6);

    // Sort filtered movies by popularity (should already be sorted)
    const topMovies = filtered
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);

    displaySectionMovies("best-2025-list", topMovies);
  } catch (err) {
    console.error("Error fetching Best of 2025:", err);
  }
}

// -----------------------------
// FETCH: POPULAR 80s MOVIES
// -----------------------------
async function fetchPopular80sMovies() {
  const url = `
    https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}
    &language=en-US
    &sort_by=popularity.desc
    &primary_release_date.gte=1980-01-01
    &primary_release_date.lte=1989-12-31
    &vote_count.gte=700
  `.replace(/\s+/g, '');

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Pick top 5 for display
    const topMovies = data.results.slice(0, 6);

    displaySectionMovies("top-80s-list", topMovies);
  } catch (err) {
    console.error("Error fetching popular 80s movies:", err);
  }
}

// -----------------------------
// RENDER ANY SECTION LIST
// -----------------------------
function displaySectionMovies(sectionId, items) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  section.innerHTML = "";

  items.forEach(item => {
    const poster = item.poster_path
      ? `${TMDB_IMAGE}${item.poster_path}`
      : "./images/clapperboard.png";

    const div = document.createElement("div");
    div.classList.add("popular-movies-item");
    div.dataset.id = item.id;

    div.innerHTML = `
      <img src="${poster}">
      <h4>${item.title}</h4>
    `;

    div.addEventListener("click", () => {
      hidePopularMovies();
      loadMovieDetails(item.id);
    });

    section.appendChild(div);
  });

  section.parentElement.style.display = "block";
}

// -----------------------------
// MOVIE DETAILS (unchanged)
// -----------------------------
async function loadMovieDetails(movieId) {
   try {
     hidePopularMovies();
     const tmdbRes = await fetch(
       `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_KEY}&append_to_response=videos,credits`
     );
     const tmdbData = await tmdbRes.json();

     updateBackgroundImage(tmdbData.backdrop_path || tmdbData.poster_path);

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

// -----------------------------
// BACKGROUND IMAGE
// -----------------------------
function updateBackgroundImage(path) {
  if (!path) {
    document.querySelector(".main").style.backgroundImage =
      `url('/images/clapper.webp')`;
    return;
  }

  const url = `${TMDB_IMAGE}${path}`;
  const img = new Image();
  img.onload = () => {
    document.querySelector(".main").style.backgroundImage = `url('${url}')`;
  };
  img.src = url;
}

// -----------------------------
// DISPLAY MOVIE DETAILS
// -----------------------------
function displayMovieDetails(tmdb, omdb) {
  const poster = tmdb.poster_path
    ? `${TMDB_IMAGE}${tmdb.poster_path}`
    : "./images/clapperboard.png";

  const year = tmdb.release_date?.slice(0, 4) || "N/A";
  const runtime = tmdb.runtime ? `${tmdb.runtime} min` : "";
  const genres = tmdb.genres?.map(g => g.name).join(", ");
  const scoreValue = tmdb.vote_average?.toFixed(1) || "N/A";
  let scoreClass = scoreValue >= 7 ? "high" : scoreValue >= 5 ? "medium" : "low";

  const tagline = tmdb.tagline ? `<em>"${tmdb.tagline}"</em>` : "";

  const castList =
    tmdb.credits?.cast
      ?.slice(0, 5)
      .map(c => `<li>${c.name} <span class="cast-role">as ${c.character}</span></li>`)
      .join("") || "";

  const rated = omdb.Rated || "N/A";

  const trailer = tmdb.videos?.results?.find(
    v => v.type === "Trailer" && v.site === "YouTube"
  );

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
      <p class="plot">${tmdb.overview}</p>

      ${
        castList
          ? `<div class="cast"><h4>Cast</h4><ul class="cast-list">${castList}</ul></div>`
          : ""
      }

      ${
        trailer
          ? `<button id="trailer-btn" class="trailer-btn">Watch Trailer</button>`
          : ""
      }
    </div>
  `;

  // Trailer modal
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

// -----------------------------
// RANDOM MOVIE BUTTON
// -----------------------------
document.getElementById("random-movie-btn").addEventListener("click", async () => {
  const btn = document.getElementById("random-movie-btn");

  // Show spinner
  btn.classList.add("loading");

  hidePopularMovies();

  // Fetch movie
  await fetchRandomMovie();

  // Hide spinner
  btn.classList.remove("loading");
});

// -----------------------------
// CLOSE SEARCH LIST WHEN CLICKING OUTSIDE
// -----------------------------
window.addEventListener("click", (e) => {
  if (e.target !== searchBox) {
    searchBarList.classList.add("hide-search-bar-list");
  }
});

// -----------------------------
// INITIAL LOAD — load all sections
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  fetchTrendingHorrorMovies();
  fetchNowPlaying();
  fetchBest2025();
  fetchPopular80sMovies();
});