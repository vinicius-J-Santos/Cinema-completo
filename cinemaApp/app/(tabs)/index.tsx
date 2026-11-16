import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';

const API_URL = 'https://cinema-api-hs2h.onrender.com/api';
const STATUS_FILME = { EM_CARTAZ: 0, EM_BREVE: 1, INDISPONIVEL: 2 } as const;
const STATUS_SESSAO = { CANCELADO: 0, DISPONIVEL: 1, FINALIZADO: 2 } as const;
const COLORS = {
  page: '#17181c',
  surface: '#222329',
  line: '#383a40',
  text: '#f1f1f3',
  muted: '#b6b8bf',
  red: '#ff2032',
  gold: '#d99b35',
  error: '#ff8b95',
  success: '#8fe0aa',
};

type Movie = {
  id: number;
  titulo: string;
  sinopse: string;
  duracao: number;
  classificacao: number;
  dataLancamento: string;
  posterUrl: string;
  status: number;
};

type Category = { id: number; nome: string };
type MovieCategory = { idFilme: number; idCategoria: number };
type Session = {
  idSessao: number;
  idFilme: number;
  idSala: number;
  nomeSala: string;
  dataHora: string;
  preco: number;
  status: number;
  ingressosDisponiveis: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      'Não foi possível conectar à API. Verifique o endereço e se o servidor está em execução.',
    );
  }

  const text = await response.text();
  let result: { mensagem?: string; message?: string; title?: string } | null = null;
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = null;
    }
  }
  if (!response.ok) {
    throw new Error(
      result?.mensagem ||
        result?.message ||
        result?.title ||
        `A API respondeu com erro (${response.status}).`,
    );
  }
  return (result ?? []) as T;
}

function formatCurrency(value: number) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value: string) {
  if (!value) return 'Não informada';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('pt-BR');
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Horário não informado'
    : date.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

function classification(value: number) {
  const labels: Record<number, string> = {
    0: 'Livre',
    10: '10 anos',
    12: '12 anos',
    14: '14 anos',
    16: '16 anos',
    18: '18 anos',
  };
  return labels[value] ?? 'Não informada';
}

function Poster({
  uri,
  featured = false,
}: {
  uri: string;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const posterStyle = featured ? styles.featuredPoster : styles.poster;
  if (!uri || failed) {
    return (
      <View style={[posterStyle, styles.posterFallback]}>
        <Text style={styles.posterFallbackText}>C!NEMA</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      onError={() => setFailed(true)}
      style={posterStyle}
      accessibilityLabel="Pôster do filme"
    />
  );
}

function MovieCard({
  movie,
  onPress,
  featured = false,
}: {
  movie: Movie;
  onPress: () => void;
  featured?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${movie.titulo}`}
      onPress={onPress}
      style={[styles.movieCard, featured && styles.featuredCard]}
    >
      <View>
        <Poster uri={movie.posterUrl} featured={featured} />
        {Number(movie.status) === STATUS_FILME.EM_BREVE && (
          <Text style={styles.badge}>EM BREVE</Text>
        )}
      </View>
      <Text numberOfLines={2} style={styles.movieTitle}>
        {movie.titulo}
      </Text>
    </Pressable>
  );
}

export default function CinemaScreen() {
  const catalogScroll = useRef<ScrollViewInstance | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relations, setRelations] = useState<MovieCategory[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [movieList, categoryList, movieCategoryList] = await Promise.all([
        request<Movie[]>('/Filme'),
        request<Category[]>('/Categoria'),
        request<MovieCategory[]>('/CategoriaFilme'),
      ]);
      setMovies(movieList);
      setCategories(categoryList);
      setRelations(movieCategoryList);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os filmes.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const publicMovies = useMemo(
    () =>
      movies.filter(
        movie => Number(movie.status) !== STATUS_FILME.INDISPONIVEL,
      ),
    [movies],
  );

  const categoriesForMovie = (movieId: number) =>
    relations
      .filter(relation => Number(relation.idFilme) === Number(movieId))
      .map(relation =>
        categories.find(
          category => Number(category.id) === Number(relation.idCategoria),
        ),
      )
      .filter((category): category is Category => Boolean(category))
      .map(category => category.nome);

  const moviesForCategory = (categoryId: number) => {
    const movieIds = relations
      .filter(
        relation => Number(relation.idCategoria) === Number(categoryId),
      )
      .map(relation => Number(relation.idFilme));
    return publicMovies.filter(movie => movieIds.includes(Number(movie.id)));
  };

  const openMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedSession(null);
    setQuantity('1');
    setPurchaseMessage('');
    setError('');
    if (Number(movie.status) !== STATUS_FILME.EM_CARTAZ) {
      setSessions([]);
      return;
    }

    setLoadingSessions(true);
    try {
      setSessions(
        await request<Session[]>(`/Sessao/filme/${movie.id}`),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar as sessões.',
      );
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const visibleSessions = sessions.filter(session => {
    const date = new Date(session.dataHora);
    return (
      Number(session.status) === STATUS_SESSAO.DISPONIVEL &&
      !Number.isNaN(date.getTime()) &&
      date.getTime() > Date.now()
    );
  });

  const buyTickets = async () => {
    const ticketCount = Number(quantity);
    if (
      !selectedMovie ||
      Number(selectedMovie.status) !== STATUS_FILME.EM_CARTAZ
    ) {
      setError('Este filme não está disponível para compra.');
      return;
    }
    if (
      !selectedSession ||
      !Number.isInteger(ticketCount) ||
      ticketCount < 1 ||
      ticketCount > Number(selectedSession.ingressosDisponiveis)
    ) {
      setError(
        'Informe uma quantidade dentro da disponibilidade da sessão.',
      );
      return;
    }
    const sessionDate = new Date(selectedSession.dataHora);
    if (
      Number(selectedSession.status) !== STATUS_SESSAO.DISPONIVEL ||
      Number.isNaN(sessionDate.getTime()) ||
      sessionDate.getTime() <= Date.now()
    ) {
      setError('Esta sessão não está mais disponível.');
      return;
    }

    setPurchasing(true);
    setError('');
    try {
      await request('/Venda', {
        method: 'POST',
        body: JSON.stringify({
          idSessao: selectedSession.idSessao,
          quantidade: ticketCount,
        }),
      });
      setPurchaseMessage('Compra realizada com sucesso!');
      setSelectedSession(null);
      setQuantity('1');
    } catch (purchaseError) {
      setError(
        purchaseError instanceof Error
          ? purchaseError.message
          : 'Não foi possível concluir a compra.',
      );
      setPurchasing(false);
      return;
    }

    try {
      setSessions(
        await request<Session[]>(`/Sessao/filme/${selectedMovie.id}`),
      );
    } catch (refreshError) {
      setError(
        `Compra realizada, mas não foi possível atualizar as sessões: ${
          refreshError instanceof Error
            ? refreshError.message
            : 'erro desconhecido.'
        }`,
      );
    } finally {
      setPurchasing(false);
    }
  };

  const goBack = () => {
    setSelectedMovie(null);
    setSelectedSession(null);
    setError('');
    setPurchaseMessage('');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.brand}>C!NEMA</Text>
        <Text style={styles.headerLink}>Filmes</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => catalogScroll.current?.scrollToEnd({ animated: true })}
          style={styles.headerAbout}
        >
          <Text style={styles.headerLink}>Sobre</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setError('')}
            hitSlop={8}
          >
            <Text style={styles.dismiss}>×</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.red} />
          <Text style={styles.muted}>Carregando filmes...</Text>
        </View>
      ) : selectedMovie ? (
        <ScrollView contentContainerStyle={styles.detailPage}>
          <Pressable
            accessibilityRole="button"
            onPress={goBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹  Voltar aos filmes</Text>
          </Pressable>
          <Poster uri={selectedMovie.posterUrl} />
          <Text style={styles.detailTitle}>{selectedMovie.titulo}</Text>
          <Text style={styles.genre}>
            {categoriesForMovie(selectedMovie.id).join(', ') || 'Sem categoria'}
          </Text>
          <Text style={styles.synopsis}>
            {selectedMovie.sinopse || 'Sinopse não disponível.'}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Duração: {selectedMovie.duracao} minutos
            </Text>
            <Text style={styles.metadataText}>
              Classificação: {classification(selectedMovie.classificacao)}
            </Text>
            <Text style={styles.metadataText}>
              Lançamento: {formatDate(selectedMovie.dataLancamento)}
            </Text>
          </View>

          {Number(selectedMovie.status) === STATUS_FILME.EM_BREVE ? (
            <View style={styles.comingSoonNotice}>
              <Text style={styles.comingSoonText}>Ingressos em breve!</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Escolha uma sessão</Text>
              {loadingSessions ? (
                <ActivityIndicator color={COLORS.red} />
              ) : visibleSessions.length === 0 ? (
                <Text style={styles.muted}>Nenhuma sessão disponível.</Text>
              ) : (
                visibleSessions.map(session => (
                  <View key={session.idSessao} style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>{session.nomeSala}</Text>
                    <Text style={styles.muted}>
                      {formatDateTime(session.dataHora)}
                    </Text>
                    <Text style={styles.sessionPrice}>
                      {formatCurrency(session.preco)}
                    </Text>
                    <Text style={styles.muted}>
                      {Number(session.ingressosDisponiveis) > 0
                        ? `${session.ingressosDisponiveis} ingressos disponíveis`
                        : 'Ingressos esgotados'}
                    </Text>
                    {Number(session.ingressosDisponiveis) > 0 && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setSelectedSession(session);
                          setQuantity('1');
                          setError('');
                        }}
                        style={[
                          styles.button,
                          selectedSession?.idSessao === session.idSessao &&
                            styles.secondaryButton,
                        ]}
                      >
                        <Text style={styles.buttonText}>
                          {selectedSession?.idSessao === session.idSessao
                            ? 'Sessão selecionada'
                            : 'Selecionar sessão'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))
              )}
              {selectedSession && (
                <View style={styles.purchaseCard}>
                  <Text style={styles.sessionTitle}>Comprar ingressos</Text>
                  <Text style={styles.fieldLabel}>
                    Quantidade (máx. {selectedSession.ingressosDisponiveis})
                  </Text>
                  <TextInput
                    accessibilityLabel="Quantidade de ingressos"
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                    style={styles.quantityInput}
                  />
                  <Text style={styles.total}>
                    Total:{' '}
                    {formatCurrency(
                      Number(quantity || 0) * Number(selectedSession.preco),
                    )}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={purchasing}
                    onPress={buyTickets}
                    style={[styles.button, purchasing && styles.disabled]}
                  >
                    <Text style={styles.buttonText}>
                      {purchasing ? 'Confirmando...' : 'Confirmar compra'}
                    </Text>
                  </Pressable>
                </View>
              )}
              {purchaseMessage ? (
                <Text style={styles.successText}>{purchaseMessage}</Text>
              ) : null}
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView ref={catalogScroll} contentContainerStyle={styles.catalogPage}>
          <Text style={styles.pageTitle}>Filmes em destaque</Text>
          {publicMovies.length === 0 ? (
            <Text style={styles.muted}>Nenhum filme disponível.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            >
              {publicMovies.slice(0, 5).map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  featured
                  onPress={() => void openMovie(movie)}
                />
              ))}
            </ScrollView>
          )}

          {categories.map(category => {
            const categoryMovies = moviesForCategory(category.id);
            if (categoryMovies.length === 0) return null;
            return (
              <View key={category.id} style={styles.catalogSection}>
                <Text style={styles.sectionTitle}>{category.nome}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.movieList}
                >
                  {categoryMovies.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPress={() => void openMovie(movie)}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })}

          <View style={styles.about} nativeID="about">
            <Text style={styles.aboutTitle}>Sobre o C!NEMA</Text>
            <Text style={styles.muted}>Eita site</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.page },
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 24,
    backgroundColor: COLORS.surface,
  },
  brand: { color: COLORS.red, fontSize: 23, fontWeight: '900' },
  headerLink: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  headerAbout: { marginLeft: 'auto' },
  catalogPage: { paddingHorizontal: 18, paddingTop: 26, paddingBottom: 36 },
  pageTitle: { color: COLORS.text, fontSize: 26, fontWeight: '800', marginBottom: 16 },
  featuredList: { gap: 14, paddingBottom: 10 },
  movieList: { gap: 14, paddingBottom: 6 },
  movieCard: { width: 250, position: 'relative' },
  featuredCard: { width: 280 },
  poster: {
    width: '100%',
    aspectRatio: 2 / 2.75,
    borderRadius: 6,
    backgroundColor: '#44464d',
  },
  featuredPoster: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 6,
    backgroundColor: '#393b43',
  },
  posterFallback: { alignItems: 'center', justifyContent: 'center' },
  posterFallbackText: { color: COLORS.red, fontSize: 18, fontWeight: '900' },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '800',
  },
  movieTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 9 },
  catalogSection: { marginTop: 22 },
  sectionTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 13 },
  about: { marginTop: 26, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.line },
  aboutTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  muted: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    padding: 11,
    borderRadius: 7,
    backgroundColor: '#46232b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: { color: COLORS.error, flex: 1, fontSize: 13 },
  dismiss: { color: COLORS.text, fontSize: 21, paddingHorizontal: 5 },
  detailPage: { padding: 18, paddingBottom: 40 },
  backButton: { marginBottom: 18, alignSelf: 'flex-start' },
  backText: { color: '#d0d1d6', fontSize: 14, fontWeight: '700' },
  detailTitle: { color: COLORS.text, fontSize: 31, fontWeight: '800', marginTop: 17 },
  genre: { color: COLORS.red, fontSize: 15, fontWeight: '800', marginTop: 6 },
  synopsis: { color: COLORS.muted, fontSize: 16, lineHeight: 24, marginTop: 19 },
  metadata: { gap: 7, marginTop: 20, marginBottom: 27 },
  metadataText: { color: COLORS.muted, fontSize: 14 },
  comingSoonNotice: { alignSelf: 'flex-start', backgroundColor: COLORS.red, borderRadius: 5, padding: 13 },
  comingSoonText: { color: '#fff', fontWeight: '800' },
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 9,
    padding: 16,
    marginBottom: 12,
  },
  sessionTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800', marginBottom: 7 },
  sessionPrice: { color: COLORS.red, fontSize: 16, fontWeight: '800', marginTop: 8 },
  button: {
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red,
    borderRadius: 6,
    paddingHorizontal: 15,
    marginTop: 12,
  },
  secondaryButton: { backgroundColor: '#350616', borderWidth: 1, borderColor: COLORS.red },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  purchaseCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.red,
    borderWidth: 1,
    borderRadius: 9,
    padding: 16,
    marginTop: 6,
  },
  fieldLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  quantityInput: {
    minHeight: 44,
    backgroundColor: COLORS.page,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 6,
    color: COLORS.text,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  total: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 19 },
  disabled: { opacity: 0.6 },
  successText: { color: COLORS.success, fontWeight: '700', marginTop: 12 },
});
