import { DarkTheme, DefaultTheme, Redirect, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { GarageProvider, useGarage } from '@/hooks/use-garage';

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
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GarageProvider>
        <AnimatedSplashOverlay />
        <AppContent />
      </GarageProvider>
    </ThemeProvider>
  );
}
