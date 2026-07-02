import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedBackdrop from '../../components/ThemedBackdrop';
import { useAuth } from '../../context/AuthContext';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { resolveTheme, Theme, THEMES, ThemeKey, radius, spacing } from '../../theme';

export default function ThemeSettingsScreen() {
  const { partner } = useAuth();
  const { theme, ownThemeKey, syncWithPartner, setThemeKey, setSyncWithPartner } =
    useTheme();
  const styles = useThemedStyles(makeStyles);
  const c = theme.colors;

  const partnerTheme = partner?.theme ? resolveTheme(partner.theme) : null;

  return (
    <View style={styles.flex}>
      <ThemedBackdrop />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.sectionTitle}>Pick your vibe</Text>
        {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
          const t = THEMES[key];
          const active = ownThemeKey === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.themeCard, active && { borderColor: c.primary, borderWidth: 2 }]}
              onPress={() => setThemeKey(key)}
              activeOpacity={0.85}
            >
              <Text style={styles.themeEmoji}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.themeLabel}>{t.label}</Text>
                <View style={styles.swatches}>
                  {[
                    t.colors.primary,
                    t.colors.background,
                    t.colors.card,
                    t.colors.food,
                    t.colors.activity,
                    t.colors.place,
                  ].map((color, i) => (
                    <View
                      key={i}
                      style={[styles.swatch, { backgroundColor: color }]}
                    />
                  ))}
                </View>
              </View>
              {active && <Ionicons name="checkmark-circle" size={22} color={c.primary} />}
            </TouchableOpacity>
          );
        })}

        {partner && (
          <>
            <Text style={styles.sectionTitle}>Partner</Text>
            <View style={styles.syncCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>Sync with {partner.name}</Text>
                <Text style={styles.syncText}>
                  {partnerTheme
                    ? `Follow their theme automatically (currently ${partnerTheme.emoji} ${partnerTheme.label}).`
                    : "They haven't picked a theme yet — you'll follow it once they do."}
                </Text>
              </View>
              <Switch
                value={syncWithPartner}
                onValueChange={setSyncWithPartner}
                trackColor={{ true: c.primary, false: c.border }}
                thumbColor="#fff"
              />
            </View>
            {partnerTheme && !syncWithPartner && partnerTheme.key !== ownThemeKey && (
              <TouchableOpacity
                style={styles.copyRow}
                onPress={() => setThemeKey(partnerTheme.key)}
              >
                <Text style={styles.copyText}>
                  Switch to their theme once ({partnerTheme.emoji} {partnerTheme.label})
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    themeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    themeEmoji: { fontSize: 28 },
    themeLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    swatches: { flexDirection: 'row', gap: 6, marginTop: 6 },
    swatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    syncCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    syncTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    syncText: { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 17 },
    copyRow: { alignItems: 'center', padding: spacing.md },
    copyText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  });
