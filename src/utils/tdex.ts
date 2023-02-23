export const DEFAULT_TOR_PROXY = 'https://proxy.tdex.network';

export function getClearTextTorProxyUrl(torProxyEndpoint: string, url: URL): string {
  // get just_onion_host_without_dot_onion
  const splitted = url.hostname.split('.');
  splitted.pop();
  const onionPubKey = splitted.join('.');

  return `${torProxyEndpoint}/${onionPubKey}`;
}
