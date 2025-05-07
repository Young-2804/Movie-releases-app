// ✅ Main script for TMDb Movie App with genre filtering and dark mode

document.getElementById('loadBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const sortOption = document.getElementById('sortOption').value;
    const selectedGenre = document.getElementById('genreSelect').value;

    hideError();

    if (!apiKey) {
        showError('⚠️ Please enter your TMDb API key.');
        return;
    }

    // Load genres once API key is available
    await loadGenres(apiKey);

    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const toDate = today.toISOString().split('T')[0];
    const fromDate = oneWeekAgo.toISOString().split('T')[0];

    let url = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${fromDate}&primary_release_date.lte=${toDate}&sort_by=${sortOption}&vote_count.gte=1&api_key=${apiKey}`;
    if (selectedGenre) {
        url += `&with_genres=${selectedGenre}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        const movieList = document.getElementById('movies');
        movieList.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            showError('No movies released recently.');
            return;
        }

        const topMovies = data.results
            .filter(movie => typeof movie.vote_average === 'number')
            .slice(0, 20);

        sessionStorage.setItem('movieData', JSON.stringify(topMovies));
        displayMovies(topMovies);
        sessionStorage.setItem('tmdbApiKey', apiKey);
    } catch (error) {
        showError('Invalid API key or error fetching data.');
        console.error(error);
    }
});

function displayMovies(movies) {
    const movieList = document.getElementById('movies');
    movieList.innerHTML = '';

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie';

        const title = document.createElement('h3');
        title.textContent = movie.title;

        const date = document.createElement('p');
        date.textContent = `Release Date: ${movie.release_date}`;
        date.className = 'release-date';

        const rating = document.createElement('p');
        rating.className = 'rating';
        rating.textContent = `Rating: ${movie.vote_average ?? 'N/A'}`;

        const overview = document.createElement('p');
        overview.className = 'overview';
        overview.textContent = movie.overview ? movie.overview : 'No overview available.';

        const poster = document.createElement('img');
        if (movie.poster_path) {
            poster.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
            poster.alt = `${movie.title} poster`;
        } else {
            poster.alt = 'No image available';
        }

        movieItem.appendChild(title);
        movieItem.appendChild(poster);
        movieItem.appendChild(date);
        movieItem.appendChild(rating);
        movieItem.appendChild(overview);

        movieList.appendChild(movieItem);
    });
}

// 🔍 Search by keyword

document.getElementById('searchInput').addEventListener('input', () => {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const storedData = sessionStorage.getItem('movieData');
    if (!storedData) return;

    const allMovies = JSON.parse(storedData);
    const filtered = allMovies.filter(movie => movie.title.toLowerCase().includes(keyword));
    displayMovies(filtered);
});

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }
}

// 🌙 Toggle dark mode

document.getElementById('toggleDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    sessionStorage.setItem('theme', mode);
});

// 🌗 Apply dark mode & load genres on startup

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = sessionStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    const savedApiKey = document.getElementById('apiKey').value.trim();
    if (savedApiKey) {
        loadGenres(savedApiKey);
    }
});

// 🎬 Genre list loader

async function loadGenres(apiKey) {
    const genreSelect = document.getElementById('genreSelect');
    if (!genreSelect || genreSelect.options.length > 1) return;

    try {
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        const data = await res.json();

        data.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Genre loading failed:', error);
    }
}
