import { Stack } from 'expo-router';

import { Chrome, Fonts } from '@/constants/theme';

export default function FuelLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        animation: 'slide_from_right',
        animationDuration: 280,
        headerStyle: { backgroundColor: Chrome.surface },
        headerTintColor: Chrome.text,
        headerTitleStyle: {
          fontFamily: Fonts.display,
          fontSize: 22,
          color: Chrome.text,
        },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ title: 'Combustível', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Novo abastecimento', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar abastecimento', presentation: 'modal' }} />
    </Stack>
  );
}
