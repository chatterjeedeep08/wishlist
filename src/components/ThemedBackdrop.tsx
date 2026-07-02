import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Deterministic scatter positions (percentages) and sizes for the
// decorative background emoji.
const SPOTS = [
  { top: '6%', left: '68%', size: 90, rotate: '-12deg' },
  { top: '26%', left: '-6%', size: 110, rotate: '18deg' },
  { top: '47%', left: '72%', size: 76, rotate: '-20deg' },
  { top: '66%', left: '8%', size: 96, rotate: '10deg' },
  { top: '84%', left: '58%', size: 120, rotate: '-8deg' },
] as const;

/**
 * Theme-flavored background: fills its parent with the theme background
 * color plus large, faint emoji graphics. Place as the first child of a
 * screen container (with a transparent container background).
 */
export default function ThemedBackdrop() {
  const { theme } = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
      {SPOTS.map((spot, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            top: spot.top,
            left: spot.left,
            fontSize: spot.size,
            opacity: theme.dark ? 0.1 : 0.08,
            transform: [{ rotate: spot.rotate }],
          }}
        >
          {theme.bgEmojis[i % theme.bgEmojis.length]}
        </Text>
      ))}
    </View>
  );
}
