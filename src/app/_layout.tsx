import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Redirect, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AccentColors, Colors } from '@/constants/theme';
import { GarageProvider, useGarage } from '@/hooks/use-garage';
import { useGithubUpdateCheck } from '@/hooks/use-github-update-check';

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    primary: AccentColors.fuel.solid,
    border: Colors.light.backgroundSelected,
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.backgroundElement,
    text: Colors.dark.text,
    primary: AccentColors.fuel.solid,
    border: Colors.dark.backgroundSelected,
  },
};

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const garage = useGarage();

  if (!garage.loading && garage.vehicles.length === 0) {
    return (
      <>
        <Redirect href="/vehicle" />
        <AppTabs />
      </>
    );
  }

  return <AppTabs />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    DMSans_500Medium,
    DMSans_700Bold,
    BebasNeue_400Regular,
  });
  useGithubUpdateCheck();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <GarageProvider>
        <AnimatedSplashOverlay />
        <AppContent />
      </GarageProvider>
    </ThemeProvider>
  );
}
