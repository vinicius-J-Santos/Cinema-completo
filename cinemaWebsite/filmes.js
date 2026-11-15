
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

const STATUS_FILME = {
    EM_CARTAZ: 0,
    EM_BREVE: 1,
    INDISPONIVEL: 2
};

const STATUS_SESSAO = {
    CANCELADO: 0,
    DISPONIVEL: 1,
    FINALIZADO: 2
};

const sessionsSection = document.getElementById("sessions-section");
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
// Formata data e horário de uma sessão
function formatarDataHora(dataUTC) {
    const data = new Date(dataUTC);

    return {
        horario: data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Sao_Paulo"
        }),

        data: data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "America/Sao_Paulo"
        })
    };
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

        // Verifica se o filme está indisponível
        if (Number(filme.status) === STATUS_FILME.INDISPONIVEL) {
            movieDetails.hidden = true;
            sessionsSection.hidden = true;

            errorMessage.hidden = false;
            errorMessage.textContent =
                "Este filme não está disponível no momento.";

            return null;
        }

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

        if (Number(filme.status) === STATUS_FILME.EM_BREVE) {
            ticketNotice.hidden = false;
            ticketNotice.textContent = "Ingressos em breve!";

            sessionsSection.hidden = true;
        } else {
            ticketNotice.hidden = true;
            sessionsSection.hidden = false;
        }

        // Devolve os dados do filme para quem chamou a função
        return filme;

    } catch (erro) {

        console.error("Erro ao carregar filme:", erro);

        movieDetails.hidden = true;
        errorMessage.hidden = false;

        errorMessage.textContent =
            "Não encontramos esse filme. Volte à lista e escolha outro título.";
        
        return null;
    }
}


async function carregarSessoes() {
    const container = document.getElementById("sessions-container");

    try {
        const response = await fetch(
            `http://localhost:5172/api/Sessao/filme/${movieId}`
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar sessões.");
        }

        const sessoes = await response.json();

        // Filtra somente sessões disponíveis e futuras
        const sessoesValidas = sessoes.filter(sessao => {
            const status = Number(sessao.status);
            const data = new Date(sessao.dataHora);

            return (
                status === STATUS_SESSAO.DISPONIVEL &&
                !Number.isNaN(data.getTime()) &&
                data.getTime() > Date.now()
            );
        });

        container.innerHTML = "";

        if (sessoesValidas.length === 0) {
            container.textContent = "Nenhuma sessão disponível.";
            return;
        }

        sessoesValidas.forEach(sessao => {
            const dataFormatada = formatarDataHora(sessao.dataHora);

            const card = document.createElement("article");
            card.className = "session-card";

            const sala = document.createElement("h3");
            sala.textContent = sessao.nomeSala;

            const horario = document.createElement("p");
            horario.textContent = dataFormatada.horario;

            const dataTexto = document.createElement("p");
            dataTexto.textContent = dataFormatada.data;

            const preco = document.createElement("p");
            preco.textContent = Number(sessao.preco).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            const disponibilidade = document.createElement("p");
            disponibilidade.textContent =
                `${sessao.ingressosDisponiveis} ingressos disponíveis`;

            const botao = document.createElement("button");
            botao.textContent = "Selecionar sessão";
            botao.type = "button";

            const ingressosDisponiveis = Number(
                sessao.ingressosDisponiveis
            );

            if (ingressosDisponiveis <= 0) {
                botao.disabled = true;
                botao.textContent = "Esgotado";

                disponibilidade.textContent = "Ingressos esgotados";
            } else {
                botao.addEventListener("click", () => {
                    window.location.href =
                        `confirmar.html?idSessao=${sessao.idSessao}`;
                });
            }

            card.append(
                sala,
                horario,
                dataTexto,
                preco,
                disponibilidade,
                botao
            );

            container.append(card);
        });

    } catch (error) {
        console.error(error);
        container.textContent =
            "Não foi possível carregar as sessões.";
    }
}

// Inicia o carregamento da página
async function iniciarPagina() {
    const filme = await carregarFilme();

    if (!filme) return;

    if (Number(filme.status) === STATUS_FILME.EM_BREVE) {
        return;
    }

    await carregarSessoes();
}

iniciarPagina();