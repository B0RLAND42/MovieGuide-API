const searchBox = document.getElementById('search-box');
const searchBarList = document.getElementById('search-bar-list');
const infoLayout = document.getElementById('info-layout');

async function loadMovies(searchTerm) {
  const URL =  `https://www.omdbapi.com/?s=${searchTerm}&page=1&apikey=65ae4c4d`;
  const res = await fetch(`${URL}`);
  const data = await res.json();
  // console.log(data.Search);
  if(data.Response == "True") displayMovieList(data.Search);
}

function findMovies() {
  let searchTerm = (searchBox.value).trim();
  if(searchTerm.length > 0) {
    searchBarList.classList.remove('hide-search-bar-list');
    loadMovies(searchTerm);
  } else {
    searchBarList.classList.add('hide-search-bar-list');
  }
}

function displayMovieList(movies) {
  searchBarList.innerHTML = "";
  for(let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement('div');
    movieListItem.dataset.id = movies[idx].imdbID;
    movieListItem.classList.add('search-bar-thumb');
    if(movies[idx].Poster != "N/A")
      moviePoster = movies[idx].Poster;
    else
      moviePoster = "./images/clapperboard.png";
    
      movieListItem.innerHTML = `
      <div class="poster-thumb">
              <img src="${moviePoster}">
            </div>
            <div class="search-movie-title">
              <h3>${movies[idx].Title}</h3>
              <p>${movies[idx].Year}</p>
            </div>
      `;
      searchBarList.appendChild(movieListItem);
  }
  loadMovieDetails();
}

function loadMovieDetails() {
  const searchListMovies = searchBarList.querySelectorAll('.search-bar-thumb');
  searchListMovies.forEach(movie => {
    movie.addEventListener('click', async () => {
      // console.log(movie.dataset.id);
      searchBarList.classList.add('hide-search-bar-list');
      searchBox.value = "";
      const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=65ae4c4d`);
      const movieDetails = await result.json();
      // console.log(movieDetails);
      displayMovieDetails(movieDetails);
    });
  })
}

function displayMovieDetails(details) {
  infoLayout.innerHTML = `
  <div class="movie-poster">
            <img src="${(details.Poster != "N/A") ? details.Poster : "./images/clapperboard.png"}" alt="Movie poster">
          </div>
          <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
            <ul class="movie-data">
              <li class="year">Year: ${details.Year}</li>
              <li class="rated">Rating: ${details.Rated}</li>
              <li class="released">Released: ${details.Released}</li>
            </ul>
            <p class="genre"><b>Genre: </b>${details.Genre}</p>
            <p class="plot"><b>Plot: </b>${details.Plot}</p>
          </div>
  `;
}

window.addEventListener('click', (event) => {
  if(event.target.className != "form-control") {
    searchBarList.classList.add('hide-search-bar-list');
  }
});