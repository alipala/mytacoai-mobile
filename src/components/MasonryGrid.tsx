import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SPACING = 12;
const CONTAINER_PADDING = 16;
const COLUMN_COUNT = 2;
const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING * 2 - CARD_SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

interface MasonryGridProps {
  children: React.ReactNode[];
}

interface CardItem {
  element: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ children }) => {
  // Convert children to card items with varying sizes
  const cardItems: CardItem[] = children.map((child, index) => {
    // Assign sizes in a pattern for visual interest
    let size: 'small' | 'medium' | 'large' | 'full' = 'medium';

    // Make first 2 items FULL WIDTH (hero cards)
    if (index < 2) {
      size = 'full';
    }
    // Create masonry pattern for remaining cards
    // Pattern: [medium, small, medium, large, small, medium, small, large] repeating
    else {
      const position = (index - 2) % 8;
      switch (position) {
        case 0:
        case 2:
        case 5:
          size = 'medium';
          break;
        case 1:
        case 4:
        case 6:
          size = 'small';
          break;
        case 3:
        case 7:
          size = 'large';
          break;
      }
    }

    return { element: child, size };
  });

  // Render cards with column-based masonry layout
  const renderCards = () => {
    const elements: React.ReactNode[] = [];
    const leftColumn: React.ReactNode[] = [];
    const rightColumn: React.ReactNode[] = [];

    let itemIndex = 0;

    // Render full-width cards first
    while (itemIndex < cardItems.length && cardItems[itemIndex].size === 'full') {
      elements.push(
        <View key={`full-${itemIndex}`} style={styles.fullWidthRow}>
          {cardItems[itemIndex].element}
        </View>
      );
      itemIndex++;
    }

    // Distribute remaining cards into two columns
    // Alternate between columns to balance the layout
    let isLeftColumn = true;
    while (itemIndex < cardItems.length) {
      const item = cardItems[itemIndex];

      if (isLeftColumn) {
        leftColumn.push(
          <View key={`left-${itemIndex}`} style={{ marginBottom: CARD_SPACING }}>
            {item.element}
          </View>
        );
      } else {
        rightColumn.push(
          <View key={`right-${itemIndex}`} style={{ marginBottom: CARD_SPACING }}>
            {item.element}
          </View>
        );
      }

      isLeftColumn = !isLeftColumn;
      itemIndex++;
    }

    // Add columns if they have content
    if (leftColumn.length > 0 || rightColumn.length > 0) {
      elements.push(
        <View key="columns" style={styles.columnsContainer}>
          <View style={styles.column}>
            {leftColumn}
          </View>
          <View style={styles.column}>
            {rightColumn}
          </View>
        </View>
      );
    }

    return elements;
  };

  return (
    <View style={styles.container}>
      {renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: CONTAINER_PADDING,
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: CARD_SPACING,
  },
  column: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  fullWidthRow: {
    marginBottom: CARD_SPACING,
  },
});

export { CARD_WIDTH };
