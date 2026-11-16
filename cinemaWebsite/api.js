
const API_URL = "https://cinema-api-hs2h.onrender.com";

async function buscarFilmes() {
    const resposta = await fetch(`${API_URL}/api/Filme`);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar filmes");
    }

    return await resposta.json();
}

async function buscarCategorias() {
    const resposta = await fetch(`${API_URL}/api/Categoria`);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar categorias");
    }

    return await resposta.json();
}

async function buscarRelacoes() {
    const resposta = await fetch(`${API_URL}/api/CategoriaFilme`);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar relações");
    }

    return await resposta.json();
}
