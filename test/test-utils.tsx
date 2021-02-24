import React, { FC, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { IdentityType, PrivateKey } from 'ldk';

const AllTheProviders: FC = ({ children }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

export { customRender as render };

// mocked values

export const fakePrices = {
  '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225': 45000,
};

export const APIURL = process.env.EXPLORER || `http://localhost:3001`;

export async function faucet(address: string): Promise<string> {
  try {
    const { status, data } = await axios.post(`${APIURL}/faucet`, { address });
    if (status !== 200) {
      throw new Error('faucet network error: ' + status);
    }
    const { txId } = data;
    sleep(5000);
    return txId;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// KEY PAIRS
export const privKeyIdentity = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    signingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    blindingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
});

export const firstAddress = privKeyIdentity.getNextAddress();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
