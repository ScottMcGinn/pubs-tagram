import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BeerGlassRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const BeerGlassRating: React.FC<BeerGlassRatingProps> = ({
  rating,
  onRatingChange,
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(value => (
        <TouchableOpacity
          key={value}
          onPress={() => onRatingChange(value)}
          style={styles.glassButton}
        >
          <Text style={styles.glass}>{value <= rating ? '🍺' : '○'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  glassButton: {
    padding: 4,
  },
  glass: {
    fontSize: 32,
  },
});

export default BeerGlassRating;
