import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Cluster, type ClusterMeta } from '@/components/cluster';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormHeroProps = {
  eyebrow: string;
  title: string;
  accent?: 'fuel' | 'maintenance';
  meta?: ClusterMeta[];
  imageUri?: string;
  outlined?: boolean;
};

export function FormHero({ eyebrow, title, accent, meta, imageUri, outlined }: FormHeroProps) {
  return (
    <Cluster
      eyebrow={eyebrow}
      title={title}
      accent={accent}
      meta={meta}
      imageUri={imageUri}
      outlined={outlined}
    />
  );
}

type FormSectionProps = {
  title?: string;
  children: ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  const theme = useTheme();
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.sectionWrap}>
      {title ? (
        <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      ) : null}
      <View style={[styles.card, Shadows.card, { backgroundColor: theme.backgroundElement }]}>
        {items.map((child, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />}
            <View style={styles.pad}>{child}</View>
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    gap: 8,
  },
  sectionTitle: {
    marginLeft: 4,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  pad: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three,
  },
});
