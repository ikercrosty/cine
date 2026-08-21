const TMDB_API_KEY = 'bc08e17abe759b46c9a4b74c66410cef';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchTMDB(endpoint) {
    const url = `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=es-ES&region=GT`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al conectar con TMDB');
    return await response.json();
}

function renderMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("No se encontró el contenedor con ID: " + containerId);
        return;
    }

    container.innerHTML = movies.slice(0, 3).map(movie => `
        <article class="glass-card reveal">
            <div class="movie-poster" style="background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), url('${IMAGE_BASE_URL}${movie.poster_path}'); background-size: cover; background-position: center; height: 300px;">
                <span class="poster-tag right"><i data-lucide="star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
            <div class="movie-body">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${movie.release_date}</p>
            </div>
        </article>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function initCartelera() {
    try {
        const nowPlaying = await fetchTMDB('/movie/now_playing');
        renderMovies(nowPlaying.results, 'cartelera-now-playing');

        const upcoming = await fetchTMDB('/movie/upcoming');
        renderMovies(upcoming.results, 'cartelera-upcoming');

        const popular = await fetchTMDB('/movie/popular');
        renderMovies(popular.results, 'cartelera-popular');
    } catch (error) {
        console.error('Error en la carga inicial:', error);
    }
}

document.addEventListener('DOMContentLoaded', initCartelera);