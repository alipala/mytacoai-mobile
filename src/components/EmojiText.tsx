import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { EMOJIS, EmojiName } from '../assets/emojis';

interface EmojiTextProps {
  text: string;
  style?: any;
  emojiSize?: number;
}

/**
 * Component that parses text containing {{emoji:name}} markers
 * and renders them as SVG emojis inline with the text.
 *
 * Usage:
 * <EmojiText text="Do you like coffee? {{emoji:coffee}}" />
 *
 * Renders: "Do you like coffee? [☕ SVG]"
 */
export const EmojiText: React.FC<EmojiTextProps> = ({
  text,
  style,
  emojiSize = 36,
}) => {
  // Parse text and split by emoji markers
  const parseTextWithEmojis = () => {
    // Normalize all emoji formats to {{emoji:name}}
    // Handle: {{emoji:name}}, {{{emoji:name}}}, {{{{emoji:name}}}}, {emoji:name}
    // Also strip out any unicode emojis that appear before "emoji:"
    let normalizedText = text
      .replace(/\{\{\s*\{\{\s*emoji:(\w+)\s*\}\}\s*\}\}/g, '{{emoji:$1}}') // {{{{emoji:name}}}} -> {{emoji:name}}
      .replace(/\{\{\s*\{\s*emoji:(\w+)\s*\}\s*\}\}/g, '{{emoji:$1}}')     // {{{emoji:name}}} -> {{emoji:name}}
      .replace(/\{[^\}]*emoji:(\w+)\}/g, '{{emoji:$1}}');                   // {🛤️emoji:name} or {emoji:name} -> {{emoji:name}}

    const parts = normalizedText.split(/({{emoji:\w+}})/g);

    return parts.map((part, index) => {
      // Check if this part is an emoji marker
      const emojiMatch = part.match(/{{emoji:(\w+)}}/);

      if (emojiMatch) {
        const emojiName = emojiMatch[1] as EmojiName;
        const EmojiSvg = EMOJIS[emojiName];

        if (EmojiSvg) {
          return (
            <View
              key={`emoji-${index}`}
              style={styles.emojiContainer}
            >
              <EmojiSvg width={emojiSize} height={emojiSize} />
            </View>
          );
        } else {
          // Emoji not found, render nothing (silently skip)
          console.log(`[EmojiText] Unknown emoji: ${emojiName}`);
          return null;
        }
      }

      // Skip empty strings
      if (!part || part.trim() === '') {
        return null;
      }

      // Regular text - wrap in Text component
      return (
        <Text key={`text-${index}`} style={style}>
          {part}
        </Text>
      );
    });
  };

  // Use View with flex-row instead of Text to properly mix text and SVGs
  return (
    <View style={styles.wrapper}>
      {parseTextWithEmojis()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  emojiContainer: {
    marginHorizontal: 5,
    marginVertical: 3,
    // Subtle glow effect
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
    borderRadius: 18,
  },
});
