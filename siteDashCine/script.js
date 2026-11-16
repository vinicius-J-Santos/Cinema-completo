const API_URL = "https://cinema-api-hs2h.onrender.com/api";
const content = document.querySelector("#content");
const pageTitle = document.querySelector("#page-title");
const navigationButtons = document.querySelectorAll("[data-page]");
const refreshButton = document.querySelector("#refresh-button");

const pageNames = {
    inicio: "Visão geral",
    filmes: "Filmes",
    sessoes: "Sessões e preços",
    vendas: "Vendas"
};

const classifications = [
    { value: 0, label: "Livre" },
    { value: 10, label: "10 anos" },
    { value: 12, label: "12 anos" },
    { value: 14, label: "14 anos" },
    { value: 16, label: "16 anos" },
    { value: 18, label: "18 anos" }
];

const movieStatuses = [
    { value: 0, label: "Em cartaz" },
    { value: 1, label: "Em breve" },
    { value: 2, label: "Indisponível" }
];

const sessionStatuses = [
    { value: 1, label: "Disponível" },
    { value: 0, label: "Cancelada" },
    { value: 2, label: "Finalizada" }
];

let currentPage = "inicio";
let cachedMovies = [];
let cachedRooms = [];
let cachedSessions = [];

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    const text = await response.text();
    let result = null;

    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            result = null;
        }
    }

    if (!response.ok) {
        throw new Error(
            result?.mensagem
            || result?.message
            || result?.title
            || (response.status === 0
                ? "Não foi possível conectar à API."
                : `A API respondeu com erro (${response.status}).`)
        );
    }

    return result;
}

function showNotice(message, type = "error") {
    let notice = content.querySelector(".notice");

    if (!notice) {
        notice = document.createElement("p");
        notice.className = "notice";
        notice.setAttribute("role", "status");
        content.prepend(notice);
    }

    notice.className = `notice ${type}`;
    notice.textContent = message;
}

function showLoading() {
    content.innerHTML = '<p class="loading">Carregando dados da API...</p>';
}

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function makePageHeading(title, description, buttonText, buttonAction) {
    const heading = makeElement("div", "page-heading");
    const text = document.createElement("div");
    text.append(
        makeElement("h2", "", title),
        makeElement("p", "", description)
    );
    heading.append(text);

    if (buttonText) {
        const button = makeElement("button", "primary-button", buttonText);
        button.type = "button";
        button.addEventListener("click", buttonAction);
        heading.append(button);
    }

    return heading;
}

function makeTable(headers, rows, emptyMessage) {
    const panel = makeElement("div", "panel");
    const wrapper = makeElement("div", "table-wrap");
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(header => headerRow.append(makeElement("th", "", header)));
    thead.append(headerRow);
    table.append(thead);

    if (rows.length === 0) {
        panel.append(makeElement("p", "empty-state", emptyMessage));
        return panel;
    }

    const tbody = document.createElement("tbody");
    rows.forEach(row => tbody.append(row));
    table.append(tbody);
    wrapper.append(table);
    panel.append(wrapper);
    return panel;
}

function makeStatus(label, kind = "") {
    return makeElement("span", `status ${kind}`, label);
}

function addCell(row, value) {
    const cell = document.createElement("td");
    if (value instanceof Node) {
        cell.append(value);
    } else {
        cell.textContent = value == null ? "—" : String(value);
    }
    row.append(cell);
    return cell;
}

function makeActionButton(text, className, onClick) {
    const button = makeElement("button", className, text);
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString("pt-BR");
}

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });
}

function formatDateTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
}

function enumLabel(options, value) {
    return options.find(option => Number(option.value) === Number(value))?.label
        || "Não informado";
}

async function loadPage(page = currentPage) {
    currentPage = page;
    pageTitle.textContent = pageNames[page];
    navigationButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
        button.setAttribute("aria-current", button.dataset.page === page ? "page" : "false");
    });
    showLoading();

    try {
        if (page === "inicio") await renderOverview();
        if (page === "filmes") await renderMovies();
        if (page === "sessoes") await renderSessions();
        if (page === "vendas") await renderSales();
    } catch (error) {
        content.replaceChildren();
        showNotice(`${error.message} Confira se a API está em execução e se o banco de dados está configurado.`, "error");
    }
}

async function renderOverview() {
    const [movies, sessions, rooms] = await Promise.all([
        apiRequest("/Filme"),
        apiRequest("/Sessao"),
        apiRequest("/Sala")
    ]);

    cachedMovies = movies;
    cachedSessions = sessions;
    cachedRooms = rooms;
    const now = new Date();
    const upcoming = sessions
        .filter(session => Number(session.status) === 1 && new Date(session.dataHora) > now)
        .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

    content.replaceChildren();
    const stats = makeElement("section", "stats-grid");
    [
        ["Filmes cadastrados", movies.length],
        ["Sessões futuras", upcoming.length],
        ["Salas cadastradas", rooms.length]
    ].forEach(([label, count]) => {
        const card = makeElement("article", "stat-card");
        card.append(makeElement("p", "", label), makeElement("strong", "", count));
        stats.append(card);
    });

    content.append(
        stats,
        makeElement("h2", "section-title", "Próximas sessões"),
        makeTable(
            ["Filme", "Sala", "Data e horário", "Preço", "Status"],
            upcoming.slice(0, 8).map(session => {
                const row = document.createElement("tr");
                const movie = movies.find(item => item.id === session.idFilme);
                const room = rooms.find(item => item.id === session.idSala);
                addCell(row, movie?.titulo || `Filme ${session.idFilme}`);
                addCell(row, room?.nomeSala || `Sala ${session.idSala}`);
                addCell(row, formatDateTime(session.dataHora));
                addCell(row, formatCurrency(session.preco));
                addCell(row, makeStatus("Disponível", "available"));
                return row;
            }),
            "Não há sessões futuras disponíveis."
        )
    );
}

function selectOptions(options, selectedValue = "", placeholder = null) {
    const select = document.createElement("select");
    if (placeholder) {
        const option = new Option(placeholder, "");
        option.disabled = true;
        option.selected = !selectedValue;
        select.append(option);
    }
    options.forEach(item => {
        const option = new Option(item.label, item.value);
        option.selected = String(item.value) === String(selectedValue);
        select.append(option);
    });
    return select;
}

function makeField(labelText, name, control, fullWidth = false) {
    const wrapper = makeElement("div", fullWidth ? "field full-width" : "field");
    const label = makeElement("label", "", labelText);
    label.htmlFor = control.id = `field-${name}`;
    control.name = name;
    wrapper.append(label, control);
    return wrapper;
}

function makeTextInput(type, name, options = {}) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    if (options.required) input.required = true;
    if (options.min !== undefined) input.min = String(options.min);
    if (options.max !== undefined) input.max = String(options.max);
    if (options.maxLength) input.maxLength = options.maxLength;
    if (options.step) input.step = options.step;
    return input;
}

function buildMovieForm(movie = null) {
    const form = makeElement("form", "form-card");
    form.id = "movie-form";
    form.dataset.id = movie ? String(movie.id) : "";
    form.append(makeElement("h3", "", movie ? "Editar filme" : "Adicionar filme"));

    const grid = makeElement("div", "form-grid");
    const title = makeTextInput("text", "titulo", { required: true, maxLength: 150 });
    title.value = movie?.titulo || "";
    const duration = makeTextInput("number", "duracao", { required: true, min: 1 });
    duration.value = movie?.duracao ?? "";
    const release = makeTextInput("date", "dataLancamento", { required: true });
    release.value = movie?.dataLancamento?.slice(0, 10) || "";
    const poster = makeTextInput("url", "posterUrl", { required: true });
    poster.value = movie?.posterUrl || "";
    const classification = selectOptions(classifications, movie?.classificacao ?? 0);
    const status = selectOptions(movieStatuses, movie?.status ?? 0);
    const synopsis = document.createElement("textarea");
    synopsis.name = "sinopse";
    synopsis.value = movie?.sinopse || "";

    grid.append(
        makeField("Título", "titulo", title),
        makeField("Duração (minutos)", "duracao", duration),
        makeField("Data de lançamento", "dataLancamento", release),
        makeField("URL do pôster", "posterUrl", poster, true),
        makeField("Classificação", "classificacao", classification),
        makeField("Status", "status", status),
        makeField("Sinopse", "sinopse", synopsis, true)
    );

    const actions = makeElement("div", "form-actions");
    const save = makeElement("button", "primary-button", movie ? "Salvar alterações" : "Cadastrar filme");
    save.type = "submit";
    actions.append(save);
    if (movie) {
        actions.append(makeActionButton("Cancelar", "secondary-button", () => renderMovies()));
    }
    form.append(grid, actions);
    form.addEventListener("submit", saveMovie);
    return form;
}

async function renderMovies(editId = null, successMessage = "") {
    const movies = await apiRequest("/Filme");
    cachedMovies = movies;
    content.replaceChildren();

    if (successMessage) showNotice(successMessage, "success");
    content.append(makePageHeading(
        "Catálogo de filmes",
        "Cadastre títulos e mantenha seus dados e status atualizados.",
        editId === null ? "Adicionar filme" : null,
        () => {
            content.querySelector("#movie-form")?.remove();
            content.prepend(buildMovieForm());
            content.querySelector("#field-titulo").focus();
        }
    ));

    if (editId !== null) {
        const movie = movies.find(item => Number(item.id) === Number(editId));
        if (!movie) throw new Error("O filme selecionado não foi encontrado.");
        content.append(buildMovieForm(movie));
    }

    const rows = movies.map(movie => {
        const row = document.createElement("tr");
        addCell(row, movie.titulo);
        addCell(row, `${movie.duracao} min`);
        addCell(row, formatDate(movie.dataLancamento));
        addCell(row, enumLabel(classifications, movie.classificacao));
        const statusKind = Number(movie.status) === 0 ? "available" : "";
        addCell(row, makeStatus(enumLabel(movieStatuses, movie.status), statusKind));
        const actions = makeElement("div", "table-actions");
        actions.append(
            makeActionButton("Editar", "text-button", () => renderMovies(movie.id)),
            makeActionButton("Excluir", "danger-button", () => deleteMovie(movie))
        );
        addCell(row, actions);
        return row;
    });

    content.append(makeTable(
        ["Título", "Duração", "Lançamento", "Classificação", "Status", "Ações"],
        rows,
        "Nenhum filme cadastrado."
    ));
}

async function saveMovie(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = {
        titulo: String(data.get("titulo")).trim(),
        sinopse: String(data.get("sinopse")).trim(),
        duracao: Number(data.get("duracao")),
        classificacao: Number(data.get("classificacao")),
        dataLancamento: data.get("dataLancamento"),
        posterUrl: String(data.get("posterUrl")).trim() || "",
        status: Number(data.get("status"))
    };

    try {
        const id = form.dataset.id;
        await apiRequest(id ? `/Filme/${id}` : "/Filme", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(body)
        });
        await renderMovies(null, id ? "Filme atualizado." : "Filme cadastrado.");
    } catch (error) {
        showNotice(error.message, "error");
    }
}

async function deleteMovie(movie) {
    if (!window.confirm(`Excluir "${movie.titulo}"? A API pode impedir a exclusão se houver sessões vinculadas.`)) return;
    try {
        await apiRequest(`/Filme/${movie.id}`, { method: "DELETE" });
        await renderMovies(null, "Filme excluído.");
    } catch (error) {
        showNotice(error.message, "error");
    }
}

async function renderSessions(editId = null, successMessage = "") {
    const [sessions, movies, rooms] = await Promise.all([
        apiRequest("/Sessao"),
        apiRequest("/Filme"),
        apiRequest("/Sala")
    ]);
    cachedSessions = sessions;
    cachedMovies = movies;
    cachedRooms = rooms;
    content.replaceChildren();

    if (successMessage) showNotice(successMessage, "success");
    content.append(makePageHeading(
        "Programação e preços",
        "Crie sessões, defina sala, horário, preço e status.",
        editId === null ? "Adicionar sessão" : null,
        () => {
            content.querySelector("#session-form")?.remove();
            content.prepend(buildSessionForm());
            content.querySelector("#field-idFilme").focus();
        }
    ));

    if (editId !== null) {
        const session = sessions.find(item => Number(item.id) === Number(editId));
        if (!session) throw new Error("A sessão selecionada não foi encontrada.");
        content.append(buildSessionForm(session));
    }

    const rows = sessions
        .slice()
        .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
        .map(session => {
            const row = document.createElement("tr");
            const movie = movies.find(item => Number(item.id) === Number(session.idFilme));
            const room = rooms.find(item => Number(item.id) === Number(session.idSala));
            addCell(row, movie?.titulo || `Filme ${session.idFilme}`);
            addCell(row, room?.nomeSala || `Sala ${session.idSala}`);
            addCell(row, formatDateTime(session.dataHora));
            addCell(row, formatCurrency(session.preco));
            const statusName = enumLabel(sessionStatuses, session.status);
            const statusKind = Number(session.status) === 1
                ? "available"
                : Number(session.status) === 0 ? "cancelled" : "";
            addCell(row, makeStatus(statusName, statusKind));
            const actions = makeElement("div", "table-actions");
            actions.append(
                makeActionButton("Editar", "text-button", () => renderSessions(session.id)),
                makeActionButton("Excluir", "danger-button", () => deleteSession(session))
            );
            addCell(row, actions);
            return row;
        });

    content.append(makeTable(
        ["Filme", "Sala", "Data e horário", "Preço", "Status", "Ações"],
        rows,
        "Nenhuma sessão cadastrada."
    ));
}

function buildSessionForm(session = null) {
    const form = makeElement("form", "form-card");
    form.id = "session-form";
    form.dataset.id = session ? String(session.id) : "";
    form.append(makeElement("h3", "", session ? "Editar sessão" : "Adicionar sessão"));

    const grid = makeElement("div", "form-grid");
    const movieSelect = selectOptions(
        cachedMovies.map(movie => ({ value: movie.id, label: movie.titulo })),
        session?.idFilme,
        "Selecione um filme"
    );
    movieSelect.required = true;
    const roomSelect = selectOptions(
        cachedRooms.map(room => ({ value: room.id, label: `${room.nomeSala} (${room.capacidade} lugares)` })),
        session?.idSala,
        "Selecione uma sala"
    );
    roomSelect.required = true;
    const dateTime = makeTextInput("datetime-local", "dataHora", { required: true });
    dateTime.value = formatDateTimeInput(session?.dataHora);
    const price = makeTextInput("number", "preco", { required: true, min: 0.01, step: "0.01" });
    price.value = session?.preco ?? "";
    const status = selectOptions(sessionStatuses, session?.status ?? 1);

    grid.append(
        makeField("Filme", "idFilme", movieSelect),
        makeField("Sala", "idSala", roomSelect),
        makeField("Data e horário", "dataHora", dateTime),
        makeField("Preço do ingresso (R$)", "preco", price)
    );
    if (session) grid.append(makeField("Status", "status", status));

    const actions = makeElement("div", "form-actions");
    const save = makeElement("button", "primary-button", session ? "Salvar alterações" : "Cadastrar sessão");
    save.type = "submit";
    actions.append(save);
    if (session) {
        actions.append(makeActionButton("Cancelar", "secondary-button", () => renderSessions()));
    }
    form.append(grid, actions);
    form.addEventListener("submit", saveSession);
    return form;
}

async function saveSession(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const localDate = new Date(String(data.get("dataHora")));
    const body = {
        idFilme: Number(data.get("idFilme")),
        idSala: Number(data.get("idSala")),
        dataHora: localDate.toISOString(),
        preco: Number(data.get("preco")),
        status: Number(data.get("status") ?? 1)
    };

    try {
        const id = form.dataset.id;
        await apiRequest(id ? `/Sessao/${id}` : "/Sessao", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(body)
        });
        await renderSessions(null, id ? "Sessão atualizada." : "Sessão cadastrada.");
    } catch (error) {
        showNotice(error.message, "error");
    }
}

async function deleteSession(session) {
    if (!window.confirm("Excluir esta sessão? Sessões que já possuem vendas não podem ser excluídas.")) return;
    try {
        await apiRequest(`/Sessao/${session.id}`, { method: "DELETE" });
        await renderSessions(null, "Sessão excluída.");
    } catch (error) {
        showNotice(error.message, "error");
    }
}

async function renderSales() {
    const [sales, sessions, movies, rooms] = await Promise.all([
        apiRequest("/Venda"),
        apiRequest("/Sessao"),
        apiRequest("/Filme"),
        apiRequest("/Sala")
    ]);
    content.replaceChildren();
    content.append(makePageHeading(
        "Vendas registradas",
        "Consulte ingressos vendidos e valores registrados pela API."
    ));

    const totalTickets = sales.reduce((total, sale) => total + Number(sale.quantidade || 0), 0);
    const totalRevenue = sales.reduce((total, sale) => total + Number(sale.valorTotal || 0), 0);
    const stats = makeElement("section", "stats-grid");
    [
        ["Vendas", sales.length],
        ["Ingressos vendidos", totalTickets],
        ["Valor total", formatCurrency(totalRevenue)]
    ].forEach(([label, value]) => {
        const card = makeElement("article", "stat-card");
        card.append(makeElement("p", "", label), makeElement("strong", "", value));
        stats.append(card);
    });

    const rows = sales
        .slice()
        .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
        .map(sale => {
            const session = sessions.find(item => Number(item.id) === Number(sale.idSessao));
            const movie = movies.find(item => Number(item.id) === Number(session?.idFilme));
            const room = rooms.find(item => Number(item.id) === Number(session?.idSala));
            const row = document.createElement("tr");
            addCell(row, sale.id);
            addCell(row, movie?.titulo || `Sessão ${sale.idSessao}`);
            addCell(row, room?.nomeSala || "—");
            addCell(row, sale.quantidade);
            addCell(row, formatCurrency(sale.valorTotal));
            addCell(row, formatDateTime(sale.dataVenda));
            return row;
        });

    content.append(stats, makeElement("h2", "section-title", "Histórico"), makeTable(
        ["Venda", "Filme", "Sala", "Ingressos", "Total", "Data da venda"],
        rows,
        "Nenhuma venda registrada."
    ));
}

navigationButtons.forEach(button => {
    button.addEventListener("click", () => loadPage(button.dataset.page));
});

refreshButton.addEventListener("click", () => loadPage());
loadPage();
