import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Alert, AppState, Linking } from 'react-native';

import { checkGithubRelease } from '@/domain/github-update';
import { UPDATE_DISMISSED_TAG_KEY } from '@/storage/keys';

let inFlight = false;

async function promptIfNewer() {
  if (inFlight) return;
  inFlight = true;

  try {
    const update = await checkGithubRelease();
    if (!update) return;

    const dismissed = await AsyncStorage.getItem(UPDATE_DISMISSED_TAG_KEY);
    if (dismissed === update.tag) return;

    const label = update.name && update.name !== update.tag ? update.name : update.tag;

    Alert.alert(
      'Atualização disponível',
      `A versão ${label} já saiu no GitHub. Você está na ${update.current}.`,
      [
        {
          text: 'Agora não',
          style: 'cancel',
          onPress: () => {
            void AsyncStorage.setItem(UPDATE_DISMISSED_TAG_KEY, update.tag);
          },
        },
        {
          text: 'Ver atualização',
          onPress: () => {
            void Linking.openURL(update.url);
          },
        },
      ]
    );
  } finally {
    inFlight = false;
  }
}

export function useGithubUpdateCheck() {
  useEffect(() => {
    const delay = setTimeout(() => {
      void promptIfNewer();
    }, 1600);

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void promptIfNewer();
    });

    return () => {
      clearTimeout(delay);
      sub.remove();
    };
  }, []);
}
