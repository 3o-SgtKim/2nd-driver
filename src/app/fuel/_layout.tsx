import { Stack } from 'expo-router';

export default function FuelLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="index" options={{ title: 'Combustível', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Novo abastecimento', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar abastecimento', presentation: 'modal' }} />
    </Stack>
  );
}
