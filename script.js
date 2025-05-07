document.getElementById('loadBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
        alert('Please enter your TMDb API key.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${today}&primary_release_date.lte=${today}&api_key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const movieList = document.getElementById('movies');
        movieList.innerHTML = '';

        if (!data.results || data.results.length === 0) {
            movieList.innerHTML = '<p>No movies released today.</p>';
            return;
        }

        // 저장해두기: 검색 기능에 사용
        sessionStorage.setItem('movieData', JSON.stringify(data.results));

        displayMovies(data.results);

        sessionStorage.setItem('tmdbApiKey', apiKey);
    } catch (error) {
        alert('Invalid API key or error fetching data.');
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
        movieList.appendChild(movieItem);
    });
}

// Search filter
document.getElementById('searchInput').addEventListener('input', () => {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const storedData = sessionStorage.getItem('movieData');
    if (!storedData) return;

    const allMovies = JSON.parse(storedData);
    const filtered = allMovies.filter(movie => movie.title.toLowerCase().includes(keyword));
    displayMovies(filtered);
});