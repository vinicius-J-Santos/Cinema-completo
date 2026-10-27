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
CREATE TABLE IF NOT EXISTS salas (
	idSala int primary key auto_increment,
    nomeSala varchar(100) not null,
    capacidade int not null
);

CREATE TABLE IF NOT EXISTS sessoes(
    idSessao int primary key auto_increment,
    idFilme_FK int not null,
    idSala_FK int not null,
    dataHora datetime not null,
    preco float(10,2) not null,

    FOREIGN KEY (idFilme_FK) REFERENCES filmes(idFilme),
    FOREIGN KEY (idSala_FK) REFERENCES salas(idSala)
);

INSERT INTO salas (nomeSala, capacidade)
VALUES
    ('Sala 1 - Tradicional', 80),
    ('Sala 2 - Tradicional', 100),
    ('Sala 3 - VIP', 40),
    ('Sala 4 - IMAX', 120),
    ('Sala 5 - 3D', 90),
    ('Sala 6 - Premium', 50),
    ('Sala 7 - Família', 120),
    ('Sala 8 - Compacta', 30),
    ('Sala 9 - Dolby Atmos', 110),
    ('Sala 10 - Mega', 120);

INSERT INTO categorias (nomeCategoria)
VALUES
    ('Ação'),
    ('Aventura'),
    ('Animação'),
    ('Comédia'),
    ('Drama'),
    ('Ficção Científica'),
    ('Mistério'),
    ('Suspense'),
    ('Fantasia'),
    ('Família');
    
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
    ),
    (
        'A Sombra do Passado',
        'Um investigador precisa solucionar um crime ligado a segredos de sua própria família.',
        122, 16, '2024-06-21',
        'https://placehold.co/300x450?text=A+Sombra+do+Passado',
        1
    ),
    (
        'Corrida Contra o Tempo',
        'Um piloto precisa impedir um desastre antes que o tempo acabe.',
        105, 12, '2025-09-12',
        'https://placehold.co/300x450?text=Corrida+Contra+o+Tempo',
        1
    ),
    (
        'O Reino Encantado',
        'Uma jovem descobre um reino mágico escondido além das montanhas.',
        110, 0, '2023-12-14',
        'https://placehold.co/300x450?text=O+Reino+Encantado',
        1
    ),
    (
        'Risadas em Dobro',
        'Dois irmãos completamente diferentes se envolvem em situações hilárias.',
        95, 10, '2024-02-08',
        'https://placehold.co/300x450?text=Risadas+em+Dobro',
        1
    ),
    (
        'O Planeta Esquecido',
        'Uma equipe de cientistas encontra sinais de vida em um planeta abandonado.',
        135, 12, '2025-11-06',
        'https://placehold.co/300x450?text=O+Planeta+Esquecido',
        1
    );
    
    INSERT INTO filme_categorias (idFilme_FK, idCategoria_FK)
SELECT f.idFilme, c.idCategoria
FROM filmes f
JOIN categorias c
    ON (
        (f.tituloFilme = 'A Cidade Perdida'
            AND c.nomeCategoria IN ('Aventura', 'Fantasia'))

        OR (f.tituloFilme = 'Robôs do Amanhã'
            AND c.nomeCategoria IN ('Ficção Científica', 'Ação'))

        OR (f.tituloFilme = 'O Último Mistério'
            AND c.nomeCategoria IN ('Mistério', 'Suspense'))

        OR (f.tituloFilme = 'Pequenos Heróis'
            AND c.nomeCategoria IN ('Aventura', 'Família', 'Animação'))

        OR (f.tituloFilme = 'Além das Estrelas'
            AND c.nomeCategoria IN ('Ficção Científica', 'Aventura'))

        OR (f.tituloFilme = 'A Sombra do Passado'
            AND c.nomeCategoria IN ('Mistério', 'Drama', 'Suspense'))

        OR (f.tituloFilme = 'Corrida Contra o Tempo'
            AND c.nomeCategoria IN ('Ação', 'Suspense'))

        OR (f.tituloFilme = 'O Reino Encantado'
            AND c.nomeCategoria IN ('Fantasia', 'Aventura', 'Família'))

        OR (f.tituloFilme = 'Risadas em Dobro'
            AND c.nomeCategoria IN ('Comédia', 'Família'))

        OR (f.tituloFilme = 'O Planeta Esquecido'
            AND c.nomeCategoria IN ('Ficção Científica', 'Aventura'))
    );
    