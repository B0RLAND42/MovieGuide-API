const API_KEY = "65ae4c4d";  // <--- replace with your key

const searchBox = document.getElementById('search-box');
const searchBarList = document.getElementById('search-bar-list');
const infoLayout = document.getElementById('info-layout');

// ---------------------------------------------
//  Debounce (prevents 10 requests per keystroke)
// ---------------------------------------------
function debounce(func, delay = 400) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// ---------------------------------------------
//  Search movies
// ---------------------------------------------
async function loadMovies(searchTerm) {
  if (!searchTerm) return;

  const URL = `https://www.omdbapi.com/?s=${searchTerm}&page=1&apikey=${API_KEY}`;

  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (data.Response === "True") {
      displayMovieList(data.Search);
    } else {
      searchBarList.innerHTML = `<p class="no-results">No results found</p>`;
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// ---------------------------------------------
//  Handle typing (debounced)
// ---------------------------------------------
const handleSearch = debounce(() => {
  const searchTerm = searchBox.value.trim();

  if (searchTerm.length > 0) {
    searchBarList.classList.remove('hide-search-bar-list');
    loadMovies(searchTerm);
  } else {
    searchBarList.classList.add('hide-search-bar-list');
  }
});

searchBox.addEventListener("keyup", handleSearch);

// ---------------------------------------------
//  Render movie list
// ---------------------------------------------
function displayMovieList(movies) {
  searchBarList.innerHTML = "";

  movies.forEach(movie => {
    const item = document.createElement('div');
    item.classList.add('search-bar-thumb');
    item.dataset.id = movie.imdbID;

    const poster = movie.Poster !== "N/A" ? movie.Poster : "./images/clapperboard.png";

    item.innerHTML = `
      <div class="poster-thumb">
        <img src="${poster}">
      </div>
      <div class="search-movie-title">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `;

    item.addEventListener("click", () => loadMovieDetails(movie.imdbID));
    searchBarList.appendChild(item);
  });
}

// ---------------------------------------------
//  Movie details fetch
// ---------------------------------------------
async function loadMovieDetails(id) {
  searchBarList.classList.add('hide-search-bar-list');
  searchBox.value = "";

  const URL = `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`;

  try {
    const response = await fetch(URL);
    const details = await response.json();
    displayMovieDetails(details);
  } catch (err) {
    console.error(err);
  }
}

// ---------------------------------------------
//   Render movie details
// ---------------------------------------------
function displayMovieDetails(details) {
  const poster = details.Poster !== "N/A" ? details.Poster : "./images/clapperboard.png";

  infoLayout.innerHTML = `
    <div class="movie-poster">
      <img src="${poster}">
    </div>

    <div class="movie-info">
      <h3 class="movie-title">${details.Title}</h3>

      <ul class="movie-data">
        <li class="year">Year: ${details.Year}</li>
        <li class="rated">Rating: ${details.Rated}</li>
        <li class="released">Released: ${details.Released}</li>
      </ul>

      <p class="genre"><b>Genre:</b> ${details.Genre}</p>
      <p class="plot"><b>Plot:</b> ${details.Plot}</p>
    </div>
  `;
}

// ---------------------------------------------
//  Hide search list when clicking outside
// ---------------------------------------------
window.addEventListener("click", (e) => {
  if (e.target !== searchBox) {
    searchBarList.classList.add('hide-search-bar-list');
  }
});