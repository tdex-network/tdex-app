import axios from 'axios';

export const APIURL = process.env.EXPLORER || `http://localhost:3001`;

async function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function faucet(address: string, amount?: number, asset?: string): Promise<any> {
  try {
    const { status, data } = await axios.post(`${APIURL}/faucet`, {
      address,
      amount,
      asset,
    });
    if (status !== 200) {
      throw new Error('faucet network error: ' + status);
    }
    const { txId } = data;
    await sleep(5000);
    return txId;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
