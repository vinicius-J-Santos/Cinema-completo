const API_URL = "http://localhost:5172/api";

// Status conforme os enums da API
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

// Elementos do pop-up
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
let filmeAtual = null;

// Parâmetros da URL
const queryParameters = new URLSearchParams(window.location.search);
const movieId = queryParameters.get("id");

// Elementos dos detalhes do filme
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

// Formata valores em reais
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Busca e carrega o filme
async function carregarFilme() {
    try {
        if (
            !movieId ||
            !Number.isInteger(Number(movieId)) ||
            Number(movieId) <= 0
        ) {
            throw new Error("ID de filme inválido.");
        }

        // Busca o filme
        const respostaFilme = await fetch(
            `${API_URL}/Filme/${movieId}`
        );

        if (!respostaFilme.ok) {
            throw new Error("Filme não encontrado.");
        }

        const filme = await respostaFilme.json();

        // Impede a visualização de filmes indisponíveis
        if (
            Number(filme.status) === STATUS_FILME.INDISPONIVEL
        ) {
            throw new Error(
                "Este filme não está disponível no momento."
            );
        }

        // Só reconhecemos os status definidos na API
        if (
            Number(filme.status) !== STATUS_FILME.EM_CARTAZ &&
            Number(filme.status) !== STATUS_FILME.EM_BREVE
        ) {
            throw new Error("Status do filme inválido.");
        }

        // Busca categorias
        const respostaCategorias = await fetch(
            `${API_URL}/CategoriaFilme/${movieId}`
        );

        let categorias = [];

        if (respostaCategorias.ok) {
            categorias = await respostaCategorias.json();
        } else if (respostaCategorias.status !== 404) {
            throw new Error("Erro ao buscar categorias.");
        }

        // Preenche título
        document.title = `${filme.titulo} | C!NEMA`;
        movieTitle.textContent = filme.titulo;

        // Preenche categorias
        movieGenre.textContent = categorias.length > 0
            ? categorias.map(categoria => categoria.nome).join(", ")
            : "Sem categoria";

        // Preenche poster
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

        // Preenche sinopse
        detailText.textContent =
            filme.sinopse || "Sinopse não disponível.";

        // Remove metadados anteriores, se existirem
        detailContent
            .querySelector(".movie-metadata")
            ?.remove();

        // Cria informações adicionais
        const metadata = document.createElement("div");
        metadata.className = "movie-metadata";

        const duracao = document.createElement("p");
        duracao.textContent =
            `Duração: ${filme.duracao} minutos`;

        const classificacao = document.createElement("p");
        classificacao.textContent =
            `Classificação: ${
                classificacoes[filme.classificacao] ?? "Não informada"
            }`;

        const lancamento = document.createElement("p");
        lancamento.textContent =
            `Lançamento: ${formatarData(filme.dataLancamento)}`;

        metadata.append(duracao, classificacao, lancamento);

        detailContent.insertBefore(metadata, ticketNotice);

        // Configura o botão de acordo com o status
        if (Number(filme.status) === STATUS_FILME.EM_BREVE) {
            ticketNotice.hidden = false;
            ticketNotice.disabled = true;
            ticketNotice.textContent = "Ingressos em breve!";
        } else {
            ticketNotice.hidden = false;
            ticketNotice.disabled = false;
            ticketNotice.textContent = "Escolher sessão";
        }

        // Guarda o filme carregado
        filmeAtual = filme;

        movieDetails.hidden = false;
        errorMessage.hidden = true;

        return filme;

    } catch (erro) {
        console.error("Erro ao carregar filme:", erro);

        movieDetails.hidden = true;
        errorMessage.hidden = false;

        errorMessage.textContent = erro.message ||
            "Não foi possível carregar este filme.";

        return null;
    }
}

// Busca e carrega sessões
async function carregarSessoes() {
    try {
        // Proteção adicional: só filmes em cartaz podem ter compra
        if (
            !filmeAtual ||
            Number(filmeAtual.status) !== STATUS_FILME.EM_CARTAZ
        ) {
            sessionsContainer.replaceChildren();
            return;
        }

        const response = await fetch(
            `${API_URL}/Sessao/filme/${movieId}`
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar sessões.");
        }

        const sessoes = await response.json();

        // Filtra somente sessões disponíveis e futuras
        const sessoesDisponiveis = sessoes.filter(sessao => {
            const status = Number(sessao.status);
            const data = new Date(sessao.dataHora);

            return (
                status === STATUS_SESSAO.DISPONIVEL &&
                !Number.isNaN(data.getTime()) &&
                data.getTime() > Date.now()
            );
        });

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
            preco.textContent = formatarMoeda(sessao.preco);

            const disponibilidade = document.createElement("p");

            const ingressosDisponiveis =
                Number(sessao.ingressosDisponiveis);

            const botao = document.createElement("button");
            botao.type = "button";

            if (ingressosDisponiveis <= 0) {
                disponibilidade.textContent = "Ingressos esgotados";

                botao.textContent = "Esgotado";
                botao.disabled = true;

            } else {
                disponibilidade.textContent =
                    `${ingressosDisponiveis} ingressos disponíveis`;

                botao.textContent = "Selecionar sessão";

                botao.addEventListener("click", () => {
                    selecionarSessao(sessao);
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

            sessionsContainer.append(card);
        });

    } catch (error) {
        console.error(error);

        sessionsContainer.replaceChildren();

        const aviso = document.createElement("p");
        aviso.className = "error-message";
        aviso.textContent =
            "Não foi possível carregar as sessões. Verifique a conexão com a API e tente novamente.";

        sessionsContainer.append(aviso);
    }
}

// Abre o pop-up de seleção de sessões
function abrirSelecaoSessoes() {

    // Impede abertura se o filme não estiver em cartaz
    if (
        !filmeAtual ||
        Number(filmeAtual.status) !== STATUS_FILME.EM_CARTAZ
    ) {
        return;
    }

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

// Atualiza o valor total
function atualizarTotal() {
    const quantidade = Number(saleQuantity.value);

    saleTotal.textContent =
        sessaoSelecionada &&
        Number.isInteger(quantidade) &&
        quantidade > 0
            ? formatarMoeda(
                Number(sessaoSelecionada.preco) * quantidade
            )
            : formatarMoeda(0);
}

// Seleciona uma sessão
function selecionarSessao(sessao) {

    // Confere novamente se a sessão ainda é válida
    const data = new Date(sessao.dataHora);

    if (
        Number(sessao.status) !== STATUS_SESSAO.DISPONIVEL ||
        Number.isNaN(data.getTime()) ||
        data.getTime() <= Date.now() ||
        Number(sessao.ingressosDisponiveis) <= 0
    ) {
        return;
    }

    sessaoSelecionada = sessao;

    const dataHora = formatarDataHora(sessao.dataHora);

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

// Eventos do pop-up
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

// Envia a compra
saleForm.addEventListener("submit", async event => {
    event.preventDefault();

    const quantidade = Number(saleQuantity.value);

    // Confere o filme novamente
    if (
        !filmeAtual ||
        Number(filmeAtual.status) !== STATUS_FILME.EM_CARTAZ
    ) {
        saleMessage.hidden = false;
        saleMessage.textContent =
            "Este filme não está disponível para compra.";
        return;
    }

    // Confere quantidade e sessão
    if (
        !sessaoSelecionada ||
        !Number.isInteger(quantidade) ||
        quantidade < 1 ||
        quantidade > Number(sessaoSelecionada.ingressosDisponiveis)
    ) {
        saleMessage.hidden = false;
        saleMessage.classList.remove("success");
        saleMessage.textContent =
            "Informe uma quantidade dentro da disponibilidade da sessão.";
        return;
    }

    // Confere status e data da sessão
    const dataSessao = new Date(sessaoSelecionada.dataHora);

    if (
        Number(sessaoSelecionada.status) !== STATUS_SESSAO.DISPONIVEL ||
        Number.isNaN(dataSessao.getTime()) ||
        dataSessao.getTime() <= Date.now()
    ) {
        saleMessage.hidden = false;
        saleMessage.classList.remove("success");
        saleMessage.textContent =
            "Esta sessão não está mais disponível.";
        return;
    }

    saleConfirm.disabled = true;
    saleMessage.hidden = true;

    try {
        const response = await fetch(`${API_URL}/Venda`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                idSessao: sessaoSelecionada.idSessao,
                quantidade
            })
        });

        const resultado = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                resultado?.mensagem ||
                "Não foi possível concluir a compra."
            );
        }

        saleMessage.hidden = false;
        saleMessage.classList.add("success");
        saleMessage.textContent = "Compra realizada com sucesso!";

        saleConfirm.textContent = "Compra concluída";

        // Atualiza a disponibilidade das sessões
        await carregarSessoes();

        saleForm.hidden = true;
        sessionsContainer.hidden = false;

        saleTitle.textContent = "Compra realizada";

        sessaoSelecionada = null;

    } catch (error) {
        saleMessage.hidden = false;
        saleMessage.classList.remove("success");
        saleMessage.textContent = error.message;

        saleConfirm.disabled = false;
    }
});

// Inicialização da página
async function iniciarPagina() {

    // Esconde o botão até descobrir o status do filme
    openSaleDialog.hidden = true;
    openSaleDialog.disabled = true;

    movieDetails.hidden = true;
    errorMessage.hidden = true;

    const filme = await carregarFilme();

    if (!filme) {
        return;
    }

    // Filme em breve: mostra aviso, mas não libera compra
    if (Number(filme.status) === STATUS_FILME.EM_BREVE) {
        return;
    }

    // Filme em cartaz: libera a seleção de sessões
    if (Number(filme.status) === STATUS_FILME.EM_CARTAZ) {
        openSaleDialog.hidden = false;
        openSaleDialog.disabled = false;
    }
}

iniciarPagina();