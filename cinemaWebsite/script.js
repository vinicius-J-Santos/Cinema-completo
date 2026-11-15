const movieCatalogs = document.getElementById("movie-catalogs");
const featuredSlider = document.getElementById("featured-slider");
const sliderPrevious = document.getElementById("slider-previous");
const sliderNext = document.getElementById("slider-next");

// Status dos filmes, conforme o enum da API
const STATUS_FILME = {
    EM_CARTAZ: 0,
    EM_BREVE: 1,
    INDISPONIVEL: 2
};

// Cria a imagem do poster
function criarPoster(movie, classe) {
    const poster = document.createElement("div");
    poster.className = classe;

    if (movie.posterUrl) {
        const posterImage = document.createElement("img");

        posterImage.src = movie.posterUrl;
        posterImage.alt = `Cartaz de ${movie.titulo}`;
        posterImage.loading = "lazy";

        posterImage.addEventListener("error", () => {
            posterImage.remove();
        }, { once: true });

        poster.append(posterImage);
    }

    return poster;
}

// Cria a identificação "Em breve"
function criarIndicacaoStatus(movie) {
    if (Number(movie.status) !== STATUS_FILME.EM_BREVE) {
        return null;
    }

    const badge = document.createElement("span");
    badge.className = "movie-status-badge";
    badge.textContent = "Em breve";

    return badge;
}

// Cria um link para a página do filme
function criarLinkFilme(movie, classe, tituloClasse) {
    const movieLink = document.createElement("a");

    movieLink.className = classe;
    movieLink.href = `filme.html?id=${encodeURIComponent(movie.id)}`;
    movieLink.setAttribute("aria-label", movie.titulo);

    const poster = criarPoster(
        movie,
        classe === "featured-card" ? "featured-poster" : "poster"
    );

    const movieTitle = document.createElement(
        classe === "featured-card" ? "h2" : "h3"
    );

    movieTitle.className = tituloClasse;
    movieTitle.textContent = movie.titulo;

    const badge = criarIndicacaoStatus(movie);

    movieLink.append(poster, movieTitle);

    if (badge) {
        movieLink.append(badge);
    }

    return movieLink;
}

// Cria os filmes em destaque
function criarDestaques(filmes) {
    featuredSlider.replaceChildren();

    filmes.slice(0, 5).forEach(movie => {
        const movieLink = criarLinkFilme(
            movie,
            "featured-card",
            ""
        );

        featuredSlider.append(movieLink);
    });
}

// Cria os catálogos por categoria
function criarCatalogos(filmes, categorias, relacoes) {

    movieCatalogs.replaceChildren();

    categorias.forEach(categoria => {

        // Descobre quais filmes pertencem à categoria
        const filmesDaCategoria = relacoes
            .filter(relacao =>
                relacao.idCategoria === categoria.id
            )
            .map(relacao =>
                filmes.find(movie =>
                    movie.id === relacao.idFilme
                )
            )
            .filter(movie => movie !== undefined);

        // Não cria categorias sem filmes
        if (filmesDaCategoria.length === 0) return;

        const catalogSection = document.createElement("section");
        catalogSection.className = "catalog";

        const categoryTitle = document.createElement("h2");
        categoryTitle.className = "catalog-title";
        categoryTitle.textContent = categoria.nome;

        const movieGrid = document.createElement("div");
        movieGrid.className = "movie-grid";

        filmesDaCategoria.forEach(movie => {
            const movieLink = criarLinkFilme(
                movie,
                "movie-card",
                ""
            );

            movieLink.setAttribute(
                "aria-label",
                `${movie.titulo}, ${categoria.nome}`
            );

            movieGrid.append(movieLink);
        });

        // Estrutura do slider
        const catalogSlider = document.createElement("div");
        catalogSlider.className = "catalog-slider";

        const previousButton = document.createElement("button");
        previousButton.className = "catalog-slider-button previous";
        previousButton.type = "button";
        previousButton.setAttribute(
            "aria-label",
            `Filmes anteriores: ${categoria.nome}`
        );

        previousButton.innerHTML =
            '<ion-icon name="arrow-back-outline"></ion-icon>';

        const nextButton = document.createElement("button");
        nextButton.className = "catalog-slider-button next";
        nextButton.type = "button";
        nextButton.setAttribute(
            "aria-label",
            `Próximos filmes: ${categoria.nome}`
        );

        nextButton.innerHTML =
            '<ion-icon name="arrow-forward-outline"></ion-icon>';

        // Atualiza os botões do slider
        const updateSliderButtons = () => {
            const hasOverflow =
                movieGrid.scrollWidth > movieGrid.clientWidth + 1;

            catalogSlider.classList.toggle(
                "no-overflow",
                !hasOverflow
            );

            previousButton.disabled = movieGrid.scrollLeft <= 0;

            nextButton.disabled = !hasOverflow ||
                movieGrid.scrollLeft + movieGrid.clientWidth
                >= movieGrid.scrollWidth - 1;
        };

        previousButton.addEventListener("click", () => {
            movieGrid.scrollBy({
                left: -movieGrid.clientWidth,
                behavior: "smooth"
            });
        });

        nextButton.addEventListener("click", () => {
            movieGrid.scrollBy({
                left: movieGrid.clientWidth,
                behavior: "smooth"
            });
        });

        movieGrid.addEventListener("scroll", updateSliderButtons);

        window.addEventListener("resize", updateSliderButtons);

        catalogSlider.append(
            previousButton,
            movieGrid,
            nextButton
        );

        catalogSection.append(categoryTitle, catalogSlider);

        movieCatalogs.append(catalogSection);

        updateSliderButtons();
    });
}

// Carrega os dados da API
async function carregarCatalogo() {
    try {
        const [filmes, categorias, relacoes] = await Promise.all([
            buscarFilmes(),
            buscarCategorias(),
            buscarRelacoes()
        ]);

        console.log("Filmes:", filmes);
        console.log("Categorias:", categorias);
        console.log("Relações:", relacoes);

        // Remove filmes indisponíveis do catálogo
        const filmesPublicos = filmes.filter(movie =>
            Number(movie.status) !== STATUS_FILME.INDISPONIVEL
        );

        criarDestaques(filmesPublicos);

        criarCatalogos(
            filmesPublicos,
            categorias,
            relacoes
        );

    } catch (erro) {
        console.error("Erro ao carregar catálogo:", erro);

        const errorNotice = document.createElement("p");
        errorNotice.className = "error-message";
        errorNotice.textContent =
            "Não foi possível carregar os filmes agora.";

        movieCatalogs.append(errorNotice);
    }
}

// Controles dos filmes em destaque
sliderPrevious.addEventListener("click", () => {
    featuredSlider.scrollBy({
        left: -featuredSlider.clientWidth,
        behavior: "smooth"
    });
});

sliderNext.addEventListener("click", () => {
    featuredSlider.scrollBy({
        left: featuredSlider.clientWidth,
        behavior: "smooth"
    });
});

// Inicia o catálogo
carregarCatalogo();