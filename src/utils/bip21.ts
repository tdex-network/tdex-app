// https://github.com/bitcoinjs/bip21
import qs from 'qs';

export function decodeBip21(uri: string, urnScheme?: string): { address: string; options: qs.ParsedQs } {
  urnScheme = urnScheme || 'bitcoin';
  let amount: number;
  const urnSchemeActual = uri.slice(0, urnScheme.length).toLowerCase();
  if (urnSchemeActual !== urnScheme || uri.charAt(urnScheme.length) !== ':') {
    throw new Error('Invalid BIP21 URI: ' + uri);
  }
  const split = uri.indexOf('?');
  const address = uri.slice(urnScheme.length + 1, split === -1 ? undefined : split);
  const query = split === -1 ? '' : uri.slice(split + 1);
  const options = qs.parse(query);
  if (options.amount) {
    amount = Number(options.amount);
    if (!isFinite(amount)) throw new Error('Invalid amount');
    if (amount < 0) throw new Error('Invalid amount');
  }
  return { address: address, options: options };
}
