import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RatingComponentProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  icon: string; // Emoji to use (🍺, £, 🥧, etc.)
  emptyIcon?: string; // Optional empty state icon
}

const RatingComponent: React.FC<RatingComponentProps> = ({
  rating,
  onRatingChange,
  icon,
  emptyIcon = '○',
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(value => (
        <TouchableOpacity
          key={value}
          onPress={() => onRatingChange(value)}
          style={styles.iconButton}
        >
          <Text style={styles.icon}>{value <= rating ? icon : emptyIcon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  iconButton: {
    padding: 4,
  },
});

export default RatingComponent;
