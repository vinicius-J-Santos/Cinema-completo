
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from '../styles/cinemaStyles';
import { API_BASE_URL } from '../api/api';

export function Poster({
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

  const imageUrl = `${API_BASE_URL}/imagens/${uri}`;

  return (
    <Image
      source={{ uri: imageUrl }}
      resizeMode="cover"
      onError={() => setFailed(true)}
      style={posterStyle}
      accessibilityLabel="Pôster do filme"
    />
  );
}
