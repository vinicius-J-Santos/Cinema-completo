CREATE DATABASE IF NOT EXISTS cinema;
USE cinema;

CREATE TABLE IF NOT EXISTS categorias (
    idCategoria INT AUTO_INCREMENT PRIMARY KEY,
    nomeCategoria VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS filmes (
    idFilme INT AUTO_INCREMENT PRIMARY KEY,
    tituloFilme VARCHAR(150) NOT NULL,
    sinopse TEXT,
    duracao INT NOT NULL,
    classificacao INT NOT NULL,
    dataLancamento DATE NOT NULL,
    poster VARCHAR(500) NOT NULL,
    statusFilme INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS filme_categorias (
    idFilme_FK INT NOT NULL,
    idCategoria_FK INT NOT NULL,

    PRIMARY KEY (idFilme_FK, idCategoria_FK),

    FOREIGN KEY (idFilme_FK)
        REFERENCES filmes(idFilme),

    FOREIGN KEY (idCategoria_FK)
        REFERENCES categorias(idCategoria)
);

INSERT INTO filmes
    (tituloFilme, sinopse, duracao, classificacao, dataLancamento, poster, statusFilme)
VALUES
    (
        'A Cidade Perdida',
        'Um explorador busca uma cidade escondida em uma floresta misteriosa.',
        115, 12, '2026-03-15',
        'https://placehold.co/300x450?text=A+Cidade+Perdida',
        0
    ),
    (
        'Robôs do Amanhã',
        'Em um futuro distante, robôs precisam proteger a humanidade.',
        98, 10, '2026-11-20',
        'https://placehold.co/300x450?text=Robos+do+Amanha',
        1
    ),
    (
        'O Último Mistério',
        'Uma detetive investiga acontecimentos estranhos em uma pequena cidade.',
        130, 14, '2025-08-10',
        'https://placehold.co/300x450?text=O+Ultimo+Misterio',
        0
    ),
    (
        'Pequenos Heróis',
        'Um grupo de amigos embarca em uma aventura para salvar seu bairro.',
        90, 0, '2026-01-05',
        'https://placehold.co/300x450?text=Pequenos+Herois',
        2
    ),
    (
        'Além das Estrelas',
        'Uma equipe de astronautas parte em uma missão para explorar um planeta desconhecido.',
        140, 10, '2026-12-18',
        'https://placehold.co/300x450?text=Alem+das+Estrelas',
        1
    );