const movieCatalogs = document.getElementById("movie-catalogs");
const featuredSlider = document.getElementById("featured-slider");
const sliderPrevious = document.getElementById("slider-previous");
const sliderNext = document.getElementById("slider-next");
const categories = [
    { genre: "Action", title: "Ação" },
    { genre: "Horror", title: "Terror" },
    { genre: "Comedy", title: "Comédia" },
    { genre: "Documentary", title: "Documentários" }
];

fetch("filmes.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }
        return response.json();
    })
    .then(movies => {
        const uniqueMovies = [...new Map(movies.map(movie => [movie.id, movie])).values()];
        uniqueMovies.slice(0, 5).forEach(movie => {
            const movieLink = document.createElement("a");
            movieLink.className = "featured-card";
            movieLink.href = `filme.html?id=${encodeURIComponent(movie.id)}`;

            const poster = document.createElement("div");
            poster.className = "featured-poster";
            if (movie.image) {
                const posterImage = document.createElement("img");
                posterImage.src = movie.image;
                posterImage.alt = "";
                posterImage.loading = "lazy";
                posterImage.addEventListener("error", () => posterImage.remove(), { once: true });
                poster.append(posterImage);
            }

            const movieTitle = document.createElement("h2");
            movieTitle.textContent = movie.title;
            movieLink.setAttribute("aria-label", `${movie.title}, ${movie.genre}`);
            movieLink.append(poster, movieTitle);
            featuredSlider.append(movieLink);
        });
        categories.forEach(category => {
            const categoryMovies = movies.filter(movie => movie.genre === category.genre);
            if (categoryMovies.length === 0) return;

            const catalogSection = document.createElement("section");
            catalogSection.className = "catalog";

            const categoryTitle = document.createElement("h2");
            categoryTitle.className = "catalog-title";
            categoryTitle.textContent = category.title;

            const movieGrid = document.createElement("div");
            movieGrid.className = "movie-grid";

            categoryMovies.forEach(movie => {
                const movieLink = document.createElement("a");
                movieLink.className = "movie-card";
                movieLink.href = `filme.html?id=${encodeURIComponent(movie.id)}`;
                movieLink.setAttribute("aria-label", `${movie.title}, ${category.title}`);

                const poster = document.createElement("div");
                poster.className = "poster";

                if (movie.image) {
                    const posterImage = document.createElement("img");
                    posterImage.src = movie.image;
                    posterImage.alt = "";
                    posterImage.loading = "lazy";
                    posterImage.addEventListener("error", () => posterImage.remove(), { once: true });
                    poster.append(posterImage);
                }

                const movieTitle = document.createElement("h3");
                movieTitle.textContent = movie.title;
                movieLink.append(poster, movieTitle);
                movieGrid.append(movieLink);
            });

            const catalogSlider = document.createElement("div");
            catalogSlider.className = "catalog-slider";

            const previousButton = document.createElement("button");
            previousButton.className = "catalog-slider-button previous";
            previousButton.type = "button";
            previousButton.setAttribute("aria-label", `Filmes anteriores: ${category.title}`);
            previousButton.innerHTML = '<ion-icon name="arrow-back-outline"></ion-icon>';

            const nextButton = document.createElement("button");
            nextButton.className = "catalog-slider-button next";
            nextButton.type = "button";
            nextButton.setAttribute("aria-label", `Próximos filmes: ${category.title}`);
            nextButton.innerHTML = '<ion-icon name="arrow-forward-outline"></ion-icon>';

            const updateSliderButtons = () => {
                const hasOverflow = movieGrid.scrollWidth > movieGrid.clientWidth + 1;
                catalogSlider.classList.toggle("no-overflow", !hasOverflow);
                previousButton.disabled = movieGrid.scrollLeft <= 0;
                nextButton.disabled = !hasOverflow
                    || movieGrid.scrollLeft + movieGrid.clientWidth >= movieGrid.scrollWidth - 1;
            };

            previousButton.addEventListener("click", () => {
                movieGrid.scrollBy({ left: -movieGrid.clientWidth, behavior: "smooth" });
            });
            nextButton.addEventListener("click", () => {
                movieGrid.scrollBy({ left: movieGrid.clientWidth, behavior: "smooth" });
            });
            movieGrid.addEventListener("scroll", updateSliderButtons);
            window.addEventListener("resize", updateSliderButtons);

            catalogSlider.append(previousButton, movieGrid, nextButton);
            catalogSection.append(categoryTitle, catalogSlider);
            movieCatalogs.append(catalogSection);
            updateSliderButtons();
        });
    })
    .catch(() => {
        const errorNotice = document.createElement("p");
        errorNotice.className = "error-message";
        errorNotice.textContent = "Não foi possível carregar os filmes agora.";
        movieCatalogs.append(errorNotice);
    });

sliderPrevious.addEventListener("click", () => {
    featuredSlider.scrollBy({ left: -featuredSlider.clientWidth, behavior: "smooth" });
});

sliderNext.addEventListener("click", () => {
    featuredSlider.scrollBy({ left: featuredSlider.clientWidth, behavior: "smooth" });
});
