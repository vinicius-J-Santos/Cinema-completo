const content = document.querySelector("#content");
const pageButtons = document.querySelectorAll("[data-page]");

const pages = {
  criar: `
    <h1>Criar filme</h1>
    <p>Preencha os dados abaixo para cadastrar um novo filme.</p>
    <form>
      <label>
        Título
        <input type="text" name="titulo" placeholder="Ex.: Noite no cinema">
      </label>
      <label>
        Gênero
        <input type="text" name="genero" placeholder="Ex.: Aventura">
      </label>
      <label>
        Duração (minutos)
        <input type="number" name="duracao" placeholder="120">
      </label>
      <button class="page-button" type="submit">Cadastrar filme</button>
    </form>
  `,
  deletar: `
    <h1>Deletar filme</h1>
    <p>Escolha um filme da lista de exemplo para removê-lo do catálogo.</p>
    <form>
      <label>
        Filme
        <select name="filme">
          <option value="">Selecione um filme</option>
          <option value="aventura">A Grande Aventura</option>
          <option value="misterio">Mistério da Meia-Noite</option>
          <option value="comedia">Uma Comédia Qualquer</option>
        </select>
      </label>
      <button class="page-button" type="submit">Deletar filme</button>
    </form>
  `,
  alterar: `
    <h1>Alterar filme</h1>
    <p>Escolha um filme da lista de exemplo para alterar seus dados.</p>
    <form>
      <label>
        Filme
        <select name="filme">
          <option value="">Selecione um filme</option>
          <option value="aventura">A Grande Aventura</option>
          <option value="misterio">Mistério da Meia-Noite</option>
          <option value="comedia">Uma Comédia Qualquer</option>
        </select>
      </label>
      <button class="page-button" type="submit">Alterar filme</button>
    </form>
    `
};

pageButtons.forEach(button => {
  button.addEventListener("click", () => {
    content.innerHTML = pages[button.dataset.page];

    pageButtons.forEach(pageButton => {
      pageButton.setAttribute("aria-pressed", String(pageButton === button));
    });

    content.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      const message = document.createElement("p");
      if (message.textContent = button.dataset.page === "criar") {
        message.textContent = "Filme cadastrado com sucesso!";
      } else if (message.textContent = button.dataset.page === "deletar") {
        message.textContent = "Filme deletado com sucesso!";
      } else {
        message.textContent = "Filme alterado com sucesso!";
      }
      content.querySelector("form").replaceWith(message);
    });
  });
});
