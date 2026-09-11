import { Stack } from 'expo-router';

export default function MaintenanceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="index" options={{ title: 'Manutenção', headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Nova manutenção', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar manutenção', presentation: 'modal' }} />
    </Stack>
  );
}
