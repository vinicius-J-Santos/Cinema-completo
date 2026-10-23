
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const titulo = document.getElementById("titulo");
const generoTexto = document.getElementById("genero-texto");
const cartaz = document.getElementById("cartaz-filme");
const detalhe = document.getElementById("detalhe-filme");
const mensagemErro = document.getElementById("mensagem-erro");
const nomesGeneros = {
    Acao: "Ação",
    Terror: "Terror",
    Comedia: "Comédia",
    Documentario: "Documentários"
};

fetch("filmes.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }
        return response.json();
    })
    .then(filmes => {
        const filme = filmes.find(item => String(item.id) === id);
        if (!filme) {
            throw new Error("Filme não encontrado.");
        }

        const nomeGenero = nomesGeneros[filme.genero] || filme.genero;
        document.title = `${filme.titulo} | C!NEMA`;
        titulo.textContent = filme.titulo;
        generoTexto.textContent = nomeGenero;

        if (filme.imagem) {
            const imagem = document.createElement("img");
            imagem.src = filme.imagem;
            imagem.alt = `Cartaz de ${filme.titulo}`;
            imagem.addEventListener("error", () => imagem.remove(), { once: true });
            cartaz.append(imagem);
        }
    })
    .catch(() => {
        detalhe.hidden = true;
        mensagemErro.hidden = false;
        mensagemErro.textContent = "Não encontramos esse filme. Volte à lista e escolha outro título.";
    });
