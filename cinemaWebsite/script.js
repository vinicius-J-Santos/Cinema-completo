const catalogos = document.getElementById("catalogos");
const categorias = [
    { genero: "Acao", titulo: "Ação" },
    { genero: "Terror", titulo: "Terror" },
    { genero: "Comedia", titulo: "Comédia" },
    { genero: "Documentario", titulo: "Documentários" }
];

fetch("filmes.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }
        return response.json();
    })
    .then(filmes => {
        categorias.forEach(categoria => {
            const filmesDaCategoria = filmes.filter(filme => filme.genero === categoria.genero);
            if (filmesDaCategoria.length === 0) return;

            const secao = document.createElement("section");
            secao.className = "catalogo";

            const titulo = document.createElement("h2");
            titulo.className = "catalogo-titulo";
            titulo.textContent = categoria.titulo;

            const grade = document.createElement("div");
            grade.className = "grade-filmes";

            filmesDaCategoria.forEach(filme => {
                const link = document.createElement("a");
                link.className = "filme-card";
                link.href = `filme.html?id=${encodeURIComponent(filme.id)}`;
                link.setAttribute("aria-label", `${filme.titulo}, ${categoria.titulo}`);

                const cartaz = document.createElement("div");
                cartaz.className = "cartaz";

                if (filme.imagem) {
                    const imagem = document.createElement("img");
                    imagem.src = filme.imagem;
                    imagem.alt = "";
                    imagem.loading = "lazy";
                    imagem.addEventListener("error", () => imagem.remove(), { once: true });
                    cartaz.append(imagem);
                }

                const tituloCard = document.createElement("h3");
                tituloCard.textContent = filme.titulo;
                link.append(cartaz, tituloCard);
                grade.append(link);
            });

            secao.append(titulo, grade);
            catalogos.append(secao);
        });
    })
    .catch(() => {
        const aviso = document.createElement("p");
        aviso.className = "mensagem-erro";
        aviso.textContent = "Não foi possível carregar os filmes agora.";
        catalogos.append(aviso);
    });

