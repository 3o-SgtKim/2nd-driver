import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 800;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const fadeOut = new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    50: {
      opacity: 1,
      transform: [{ scale: 1.05 }],
      easing: Easing.out(Easing.ease),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 0.9 }],
      easing: Easing.in(Easing.ease),
    },
  });

  const icon = (
    <Image
      style={styles.splashIcon}
      source={require('@/assets/images/icon.png')}
      contentFit="contain"
    />
  );

  return animate ? (
    <Animated.View
      entering={fadeOut.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {icon}
      <View style={styles.splashTitle}>
        <Animated.View
          entering={new Keyframe({
            0: { opacity: 1 },
            100: { opacity: 0 },
          }).duration(DURATION / 2)}>
          <Animated.Text style={styles.splashTitleText}>2nd Driver</Animated.Text>
        </Animated.View>
      </View>
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {icon}
      <View style={styles.splashTitle}>
        <Animated.Text style={styles.splashTitleText}>2nd Driver</Animated.Text>
      </View>
    </View>
  );
}

const enterIcon = new Keyframe({
  0: {
    transform: [{ scale: 0.5 }],
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.1 }],
    opacity: 1,
    easing: Easing.out(Easing.ease),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.8),
  },
});

const enterText = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: 10 }],
  },
  50: {
    opacity: 0,
    transform: [{ translateY: 10 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }],
    easing: Easing.out(Easing.ease),
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={enterIcon.duration(DURATION)} style={styles.iconWrapper}>
        <Image
          style={styles.iconImage}
          source={require('@/assets/images/icon.png')}
          contentFit="contain"
        />
      </Animated.View>
      <Animated.Text entering={enterText.duration(DURATION)} style={styles.iconLabel}>
        2nd Driver
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#3C3CDC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    gap: 16,
  },
  splashIcon: {
    width: 140,
    height: 140,
    borderRadius: 30,
  },
  splashTitle: {},
  splashTitleText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.9,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 100,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
  },
  iconImage: {
    width: 100,
    height: 100,
  },
  iconLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});
