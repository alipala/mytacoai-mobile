/**
 * Typed Message Component
 * =======================
 * Displays text with typing animation effect for AI messages.
 * User messages appear instantly (speed = 0).
 */

import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

interface TypedMessageProps {
  text: string;
  speed?: number; // milliseconds per character (0 = instant)
  style?: any;
}

export const TypedMessage: React.FC<TypedMessageProps> = ({
  text,
  speed = 20,
  style,
}) => {
  const [displayedText, setDisplayedText] = useState(() => speed === 0 ? text : '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastText = React.useRef('');

  // Initialize on mount
  useEffect(() => {
    if (speed === 0) {
      setDisplayedText(text);
      lastText.current = text;
    }
  }, []);

  // Typing animation
  useEffect(() => {
    // Instant display for speed = 0
    if (speed === 0) {
      if (displayedText !== text) {
        setDisplayedText(text);
        lastText.current = text;
      }
      return;
    }

    // Type character by character
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length) {
      lastText.current = text;
    }
  }, [currentIndex, text, speed, displayedText]);

  // Reset when text changes
  useEffect(() => {
    if (text !== lastText.current) {
      if (speed === 0) {
        setDisplayedText(text);
        lastText.current = text;
      } else {
        setDisplayedText('');
        setCurrentIndex(0);
      }
    }
  }, [text, speed]);

  return (
    <Text style={[styles.text, style]}>
      {displayedText}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22,
  },
});

export default TypedMessage;
