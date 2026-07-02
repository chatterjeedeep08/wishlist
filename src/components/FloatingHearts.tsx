import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';

const HEARTS = ['❤️', '💖', '💕', '💘', '💗', '💞', '💓', '❤️'];

interface Props {
  onDone?: () => void;
}

/**
 * One-shot celebration: hearts float from the bottom to the top of the
 * screen, drifting and fading out. Used when the user first opens their
 * profile after pairing.
 */
export default function FloatingHearts({ onDone }: Props) {
  const { width, height } = Dimensions.get('window');
  const animations = useRef(HEARTS.map(() => new Animated.Value(0))).current;

  const hearts = useMemo(
    () =>
      HEARTS.map((emoji, i) => ({
        emoji,
        x: (i / HEARTS.length) * width * 0.85 + 20,
        drift: (i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 14),
        size: 26 + (i % 4) * 8,
        delay: i * 260,
      })),
    [width]
  );

  useEffect(() => {
    const runs = animations.map((value, i) =>
      Animated.sequence([
        Animated.delay(hearts[i].delay),
        Animated.timing(value, {
          toValue: 1,
          duration: 2600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(runs).start(() => onDone?.());
  }, []);

  return (
    <>
      {hearts.map((heart, i) => {
        const progress = animations[i];
        return (
          <Animated.Text
            key={i}
            pointerEvents="none"
            style={[
              styles.heart,
              {
                left: heart.x,
                fontSize: heart.size,
                opacity: progress.interpolate({
                  inputRange: [0, 0.1, 0.75, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height - 140, 80],
                    }),
                  },
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, heart.drift, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {heart.emoji}
          </Animated.Text>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  heart: { position: 'absolute', zIndex: 50 },
});
