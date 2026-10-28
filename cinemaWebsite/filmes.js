
const queryParameters = new URLSearchParams(window.location.search);
const movieId = queryParameters.get("id");

const movieTitle = document.getElementById("movie-title");
const movieGenre = document.getElementById("movie-genre");
const moviePoster = document.getElementById("movie-poster");
const movieDetails = document.getElementById("movie-details");
const errorMessage = document.getElementById("error-message");
const genreNames = {
    Action: "Ação",
    Horror: "Terror",
    Comedy: "Comédia",
    Documentary: "Documentários"
};

fetch("filmes.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }
        return response.json();
    })
    .then(movies => {
        const movie = movies.find(item => String(item.id) === movieId);
        if (!movie) {
            throw new Error("Filme não encontrado.");
        }

        const genreName = genreNames[movie.genre] || movie.genre;
        document.title = `${movie.title} | C!NEMA`;
        movieTitle.textContent = movie.title;
        movieGenre.textContent = genreName;

        if (movie.image) {
            const posterImage = document.createElement("img");
            posterImage.src = movie.image;
            posterImage.alt = `Cartaz de ${movie.title}`;
            posterImage.addEventListener("error", () => posterImage.remove(), { once: true });
            moviePoster.append(posterImage);
        }
    })
    .catch(() => {
        movieDetails.hidden = true;
        errorMessage.hidden = false;
        errorMessage.textContent = "Não encontramos esse filme. Volte à lista e escolha outro título.";
    });
