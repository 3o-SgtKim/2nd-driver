import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const GITHUB_OWNER = (extra.githubOwner as string | undefined) ?? '3o-SgtKim';
export const GITHUB_REPO = (extra.githubRepo as string | undefined) ?? '2nd-driver';
export const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
