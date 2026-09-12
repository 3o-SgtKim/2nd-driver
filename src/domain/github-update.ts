import Constants from 'expo-constants';

import { GITHUB_RELEASES_API } from '@/constants/github';

export type GithubUpdate = {
  tag: string;
  current: string;
  url: string;
  apkUrl: string | null;
  name: string | null;
};

type GithubAsset = {
  name?: string;
  browser_download_url?: string;
  content_type?: string;
};

type GithubReleaseJson = {
  tag_name?: string;
  html_url?: string;
  name?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets?: GithubAsset[];
};

export function pickApkUrl(assets?: GithubAsset[]): string | null {
  if (!assets?.length) return null;
  const apk = assets.find((asset) => {
    const name = asset.name?.toLowerCase() ?? '';
    return name.endsWith('.apk') || asset.content_type === 'application/vnd.android.package-archive';
  });
  return apk?.browser_download_url?.trim() || null;
}

export function parseVersion(raw: string): number[] {
  return raw
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((part) => {
      const digits = part.match(/\d+/);
      return digits ? Number.parseInt(digits[0], 10) : 0;
    });
}

export function isNewerVersion(remote: string, local: string): boolean {
  const a = parseVersion(remote);
  const b = parseVersion(local);
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

export function getInstalledVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

export async function checkGithubRelease(): Promise<GithubUpdate | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(GITHUB_RELEASES_API, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': '2nd-driver-app',
      },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as GithubReleaseJson;
    if (data.draft || data.prerelease) return null;

    const tag = data.tag_name?.trim();
    const url = data.html_url?.trim();
    if (!tag || !url) return null;

    const current = getInstalledVersion();
    if (!isNewerVersion(tag, current)) return null;

    return {
      tag,
      current,
      url,
      apkUrl: pickApkUrl(data.assets),
      name: data.name?.trim() || null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
