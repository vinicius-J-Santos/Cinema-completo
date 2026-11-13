
const API_URL = "http://localhost:5172/api";

const queryParameters = new URLSearchParams(window.location.search);
const movieId = queryParameters.get("id");

const movieTitle = document.getElementById("movie-title");
const movieGenre = document.getElementById("movie-genre");
const moviePoster = document.getElementById("movie-poster");
const movieDetails = document.getElementById("movie-details");
const errorMessage = document.getElementById("error-message");

const detailContent = document.querySelector(".detail-content");
const detailText = document.querySelector(".detail-text");
const ticketNotice = document.querySelector(".ticket-notice");

const classificacoes = {
    0: "Livre",
    10: "10 anos",
    12: "12 anos",
    14: "14 anos",
    16: "16 anos",
    18: "18 anos"
};

// Formata a data para o padrão brasileiro
function formatarData(data) {
    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}

// Busca e carrega o filme
async function carregarFilme() {
    try {

        if (!movieId || !Number.isInteger(Number(movieId)) || Number(movieId) <= 0) {
            throw new Error("ID de filme inválido.");
        }

        // 1. Buscar filme
        const respostaFilme = await fetch(
            `${API_URL}/Filme/${movieId}`
        );

        if (!respostaFilme.ok) {
            throw new Error("Filme não encontrado.");
        }

        const filme = await respostaFilme.json();

        // 2. Buscar categorias
        const respostaCategorias = await fetch(
            `${API_URL}/CategoriaFilme/${movieId}`
        );

        let categorias = [];

        if (respostaCategorias.ok) {
            categorias = await respostaCategorias.json();
        } else if (respostaCategorias.status !== 404) {
            throw new Error("Erro ao buscar categorias.");
        }

        // 3. Preencher título
        document.title = `${filme.titulo} | C!NEMA`;
        movieTitle.textContent = filme.titulo;

        // 4. Preencher categorias
        movieGenre.textContent = categorias.length > 0
            ? categorias.map(categoria => categoria.nome).join(", ")
            : "Sem categoria";

        // 5. Preencher poster
        moviePoster.replaceChildren();

        if (filme.posterUrl) {
            const posterImage = document.createElement("img");

            posterImage.src = filme.posterUrl;
            posterImage.alt = `Cartaz de ${filme.titulo}`;

            posterImage.addEventListener("error", () => {
                posterImage.remove();
            }, { once: true });

            moviePoster.append(posterImage);
        }

        // 6. Preencher sinopse
        detailText.textContent = filme.sinopse || "Sinopse não disponível.";

        // 7. Criar informações adicionais
        const metadata = document.createElement("div");
        metadata.className = "movie-metadata";

        const duracao = document.createElement("p");
        duracao.textContent = `Duração: ${filme.duracao} minutos`;

        const classificacao = document.createElement("p");
        classificacao.textContent =
            `Classificação: ${classificacoes[filme.classificacao] ?? "Não informada"}`;

        const lancamento = document.createElement("p");
        lancamento.textContent =
            `Lançamento: ${formatarData(filme.dataLancamento)}`;

        metadata.append(duracao, classificacao, lancamento);

        // Insere os dados sem apagar os elementos existentes
        detailContent.insertBefore(metadata, ticketNotice);

    } catch (erro) {

        console.error("Erro ao carregar filme:", erro);

        movieDetails.hidden = true;
        errorMessage.hidden = false;

        errorMessage.textContent =
            "Não encontramos esse filme. Volte à lista e escolha outro título.";
    }
}

carregarFilme();
