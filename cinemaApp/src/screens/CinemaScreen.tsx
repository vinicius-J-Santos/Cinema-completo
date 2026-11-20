import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { request } from '../api/api';
import {
  STATUS_FILME,
  STATUS_SESSAO,
  type Movie,
  type Category,
  type MovieCategory,
  type Session,
} from '../types/cinema';
import {
  classification,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../utils/formatters';
import { MovieCard } from '../components/MovieCard';
import { Poster } from '../components/Poster';
import { COLORS, styles } from '../styles/cinemaStyles';

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
