
const API_URL = "http://localhost:5172/api";

const params = new URLSearchParams(window.location.search);
const idSessao = params.get("idSessao");

const checkoutContent = document.getElementById("checkout-content");
const successContent = document.getElementById("success-content");
const loadingError = document.getElementById("loading-error");

const quantityInput = document.getElementById("quantity");
const totalElement = document.getElementById("checkout-total");
const confirmButton = document.getElementById("confirm-button");
const checkoutError = document.getElementById("checkout-error");

let sessaoAtual = null;
let precoIngresso = 0;

const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
};

// Buscar informações na API
async function buscarDados(url) {
    const response = await fetch(`${API_URL}${url}`);

    if (!response.ok) {
        throw new Error("Não foi possível buscar os dados.");
    }

    return await response.json();
}

// Carregar informações da sessão
async function carregarSessao() {

    if (!idSessao || !/^\d+$/.test(idSessao)) {
        throw new Error("Sessão inválida.");
    }

    sessaoAtual = await buscarDados(`/Sessao/${idSessao}`);

    const [filme, sala] = await Promise.all([
        buscarDados(`/Filme/${sessaoAtual.idFilme}`),
        buscarDados(`/Sala/${sessaoAtual.idSala}`)
    ]);

    // Informações do filme
    document.getElementById("checkout-title").textContent =
        filme.titulo;

    document.getElementById("checkout-duration").textContent =
        `${filme.duracao} minutos`;

    const poster = document.getElementById("checkout-poster");
    poster.src = filme.posterUrl;
    poster.alt = `Cartaz de ${filme.titulo}`;

    poster.addEventListener("error", () => {
        poster.hidden = true;
    }, { once: true });

    // Informações da sessão
    document.getElementById("checkout-room").textContent =
        sala.nomeSala;

    const dataHora = new Date(sessaoAtual.dataHora);

    document.getElementById("checkout-date").textContent =
        dataHora.toLocaleDateString("pt-BR");

    document.getElementById("checkout-time").textContent =
        dataHora.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });

    // Preço
    precoIngresso = Number(sessaoAtual.preco);

    document.getElementById("checkout-price").textContent =
        formatarMoeda(precoIngresso);

    // Impedir compra de sessão que já passou
    if (dataHora <= new Date()) {
        confirmButton.disabled = true;
        checkoutError.hidden = false;
        checkoutError.textContent =
            "Esta sessão já aconteceu e não está disponível para compra.";
    }

    checkoutContent.hidden = false;

    atualizarTotal();
}

// Atualizar valor total
function atualizarTotal() {

    const quantidade = Number(quantityInput.value);

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        totalElement.textContent = formatarMoeda(0);
        return;
    }

    const total = precoIngresso * quantidade;

    totalElement.textContent = formatarMoeda(total);
}

quantityInput.addEventListener("input", atualizarTotal);

// Registrar venda
async function confirmarCompra() {

    const quantidade = Number(quantityInput.value);

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        checkoutError.hidden = false;
        checkoutError.textContent =
            "Informe uma quantidade válida de ingressos.";
        return;
    }

    if (new Date(sessaoAtual.dataHora) <= new Date()) {
        checkoutError.hidden = false;
        checkoutError.textContent =
            "Esta sessão já aconteceu.";
        return;
    }

    confirmButton.disabled = true;
    checkoutError.hidden = true;

    try {

        const response = await fetch(`${API_URL}/Venda`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                idSessao: sessaoAtual.id,
                quantidade: quantidade
            })
        });

        const resultado = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                resultado?.mensagem ||
                "Não foi possível concluir sua compra."
            );
        }

        checkoutContent.hidden = true;
        successContent.hidden = false;

    } catch (error) {

        checkoutError.hidden = false;
        checkoutError.textContent = error.message;

        confirmButton.disabled = false;
    }
}

confirmButton.addEventListener("click", confirmarCompra);

// Inicialização
carregarSessao().catch(error => {
    loadingError.hidden = false;
    loadingError.textContent = error.message;
});
