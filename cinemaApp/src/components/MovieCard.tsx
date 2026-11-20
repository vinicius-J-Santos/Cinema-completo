import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { STATUS_FILME, type Movie } from '../types/cinema';
import { styles } from '../styles/cinemaStyles';
import { Poster } from './Poster';

export function MovieCard({
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
