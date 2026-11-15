
const API_URL = "http://localhost:5172/api";
const saleDialog = document.getElementById("sale-dialog");
const saleForm = document.getElementById("sale-form");
const saleQuantity = document.getElementById("sale-quantity");
const saleTotal = document.getElementById("sale-total");
const saleMessage = document.getElementById("sale-message");
const saleConfirm = document.getElementById("sale-confirm");
const saleSessionDetails = document.getElementById("sale-session-details");
const closeSaleDialog = document.getElementById("close-sale-dialog");
const openSaleDialog = document.getElementById("open-sale-dialog");
const backToSessions = document.getElementById("back-to-sessions");
const sessionsContainer = document.getElementById("sessions-container");
const saleTitle = document.getElementById("sale-title");
let sessaoSelecionada = null;

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

async function carregarSessoes() {
    try {
        const response = await fetch(
            `${API_URL}/Sessao/filme/${movieId}`
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar sessões.");
        }

        const sessoes = await response.json();
        const sessoesDisponiveis = sessoes.filter(sessao =>
            Number(sessao.status) === 1
            && new Date(sessao.dataHora) > new Date()
        );

        sessionsContainer.replaceChildren();

        if (sessoesDisponiveis.length === 0) {
            const aviso = document.createElement("p");
            aviso.textContent = "Nenhuma sessão disponível.";
            sessionsContainer.append(aviso);
            return;
        }

        sessoesDisponiveis.forEach(sessao => {
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
            botao.textContent = sessao.ingressosDisponiveis > 0
                ? "Selecionar sessão"
                : "Esgotado";
            botao.type = "button";

            if (sessao.ingressosDisponiveis <= 0) {
                botao.disabled = true;
            }

            botao.addEventListener("click", () => {
                selecionarSessao(sessao);
            });

            card.append(
                sala,
                horario,
                dataTexto,
                preco,
                disponibilidade,
                botao
            );

            sessionsContainer.append(card);
        });

    } catch (error) {
        console.error(error);
        sessionsContainer.replaceChildren();
        const aviso = document.createElement("p");
        aviso.className = "error-message";
        aviso.textContent = "Não foi possível carregar as sessões. Verifique a conexão com a API e tente novamente.";
        sessionsContainer.append(aviso);
    }
}

function abrirSelecaoSessoes() {
    saleTitle.textContent = "Escolha uma sessão";
    saleForm.hidden = true;
    sessionsContainer.hidden = false;
    saleMessage.hidden = true;
    saleMessage.classList.remove("success");
    saleMessage.textContent = "";
    sessionsContainer.replaceChildren();

    const loadingMessage = document.createElement("p");
    loadingMessage.textContent = "Carregando sessões...";
    sessionsContainer.append(loadingMessage);
    saleDialog.showModal();
    carregarSessoes();
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function atualizarTotal() {
    const quantidade = Number(saleQuantity.value);

    saleTotal.textContent = sessaoSelecionada
        && Number.isInteger(quantidade)
        && quantidade > 0
        ? formatarMoeda(Number(sessaoSelecionada.preco) * quantidade)
        : formatarMoeda(0);
}

function selecionarSessao(sessao) {
    const dataHora = formatarDataHora(sessao.dataHora);
    sessaoSelecionada = sessao;
    saleSessionDetails.replaceChildren();

    [
        `${sessao.nomeSala}`,
        `${dataHora.data} às ${dataHora.horario}`,
        `${formatarMoeda(sessao.preco)} por ingresso`,
        `${sessao.ingressosDisponiveis} ingressos disponíveis`
    ].forEach(texto => {
        const detalhe = document.createElement("p");
        detalhe.textContent = texto;
        saleSessionDetails.append(detalhe);
    });

    saleQuantity.value = "1";
    saleQuantity.max = String(sessao.ingressosDisponiveis);
    saleMessage.hidden = true;
    saleMessage.textContent = "";
    saleMessage.classList.remove("success");
    saleConfirm.disabled = false;
    saleConfirm.textContent = "Confirmar compra";
    saleTitle.textContent = "Comprar ingressos";
    sessionsContainer.hidden = true;
    saleForm.hidden = false;
    atualizarTotal();
}

openSaleDialog.addEventListener("click", abrirSelecaoSessoes);

saleQuantity.addEventListener("input", atualizarTotal);

backToSessions.addEventListener("click", () => {
    sessaoSelecionada = null;
    saleForm.hidden = true;
    sessionsContainer.hidden = false;
    saleTitle.textContent = "Escolha uma sessão";
});

closeSaleDialog.addEventListener("click", () => {
    saleDialog.close();
});

saleDialog.addEventListener("click", event => {
    if (event.target === saleDialog) {
        saleDialog.close();
    }
});

saleForm.addEventListener("submit", async event => {
    event.preventDefault();

    const quantidade = Number(saleQuantity.value);

    if (!sessaoSelecionada || !Number.isInteger(quantidade) || quantidade < 1
        || quantidade > Number(sessaoSelecionada.ingressosDisponiveis)) {
        saleMessage.hidden = false;
        saleMessage.classList.remove("success");
        saleMessage.textContent = "Informe uma quantidade dentro da disponibilidade da sessão.";
        return;
    }

    saleConfirm.disabled = true;
    saleMessage.hidden = true;

    try {
        const response = await fetch(`${API_URL}/Venda`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idSessao: sessaoSelecionada.idSessao,
                quantidade
            })
        });
        const resultado = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(resultado?.mensagem || "Não foi possível concluir a compra.");
        }

        saleMessage.hidden = false;
        saleMessage.classList.add("success");
        saleMessage.textContent = "Compra realizada com sucesso!";
        saleConfirm.textContent = "Compra concluída";
        await carregarSessoes();
        saleForm.hidden = true;
        sessionsContainer.hidden = false;
        saleTitle.textContent = "Compra realizada";
    } catch (error) {
        saleMessage.hidden = false;
        saleMessage.classList.remove("success");
        saleMessage.textContent = error.message;
        saleConfirm.disabled = false;
    }
});