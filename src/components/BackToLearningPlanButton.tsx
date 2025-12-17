import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface BackToLearningPlanButtonProps {
  onPress: () => void;
  languageName?: string;
}

export const BackToLearningPlanButton: React.FC<BackToLearningPlanButtonProps> = ({
  onPress,
  languageName,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>←</Text>
      <Text style={styles.text}>
        {languageName
          ? `Back to My Plan (${languageName})`
          : 'Back to My Plan'
        }
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0FDFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
    color: '#0F766E',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F766E',
  },
});
