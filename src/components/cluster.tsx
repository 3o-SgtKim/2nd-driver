import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AccentColors, Chrome, Radius, Shadows } from '@/constants/theme';

export type ClusterMeta = {
  label: string;
  value: string;
};

type ClusterProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: 'fuel' | 'maintenance';
  size?: 'default' | 'display';
  meta?: ClusterMeta[];
  imageUri?: string;
  outlined?: boolean;
  children?: ReactNode;
};

export function Cluster({
  eyebrow,
  title,
  subtitle,
  accent = 'fuel',
  size = 'default',
  meta,
  imageUri,
  outlined = false,
  children,
}: ClusterProps) {
  const colors = AccentColors[accent].hero;
  const overlay = imageUri
    ? (['rgba(12, 10, 8, 0.28)', 'rgba(12, 10, 8, 0.78)'] as const)
    : colors;

  return (
    <View
      style={[
        styles.cluster,
        Shadows.raised,
        outlined
          ? { borderWidth: 2, borderColor: AccentColors[accent].solid }
          : null,
      ]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.photo} contentFit="cover" />
      ) : null}
      <LinearGradient colors={overlay} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.overlay}>
        {!imageUri ? (
          <View
            style={[
              styles.glow,
              {
                backgroundColor:
                  accent === 'maintenance' ? 'rgba(59, 130, 246, 0.28)' : 'rgba(245, 158, 11, 0.26)',
              },
            ]}
          />
        ) : null}
        <ThemedText type="eyebrow" style={styles.eyebrow}>
          {eyebrow}
        </ThemedText>
        <ThemedText type={size === 'display' ? 'display' : 'heading'} style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="smallBold" style={[styles.subtitle, { color: AccentColors[accent].solid }]}>
            {subtitle}
          </ThemedText>
        ) : null}
        {meta && meta.length > 0 ? (
          <View style={styles.metaRow}>
            {meta.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 ? <View style={styles.metaDivider} /> : null}
                <View style={styles.metaItem}>
                  <ThemedText type="eyebrow" style={styles.metaLabel}>
                    {item.label}
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.metaValue}>
                    {item.value}
                  </ThemedText>
                </View>
              </Fragment>
            ))}
          </View>
        ) : null}
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cluster: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  photo: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    padding: 22,
    gap: 6,
  },
  glow: {
    position: 'absolute',
    top: -70,
    right: -36,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  eyebrow: {
    color: Chrome.muted,
  },
  title: {
    color: Chrome.text,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Chrome.line,
    gap: 16,
  },
  metaDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: Chrome.line,
  },
  metaItem: {
    gap: 4,
    flex: 1,
  },
  metaLabel: {
    color: Chrome.faint,
  },
  metaValue: {
    color: Chrome.text,
    fontSize: 15,
  },
});
