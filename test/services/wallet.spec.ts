import axios from 'axios';

import { getRecommendedFees } from '../../src/redux/services/walletService';

describe('Wallet Service', () => {
  it('should return 3 different target fees for mainnet', async () => {
    const recommendedFees = await getRecommendedFees('liquid');

    expect(recommendedFees).toHaveProperty('fastestFee');
    expect(recommendedFees).toHaveProperty('halfHourFee');
    expect(recommendedFees).toHaveProperty('hourFee');
  });
  it('should return 3 different target fees for testnet', async () => {
    const recommendedFees = await getRecommendedFees('testnet');

    expect(recommendedFees).toHaveProperty('fastestFee');
    expect(recommendedFees).toHaveProperty('halfHourFee');
    expect(recommendedFees).toHaveProperty('hourFee');
  });

  it('should return 3 different target fees for regtest', async () => {
    const recommendedFees = await getRecommendedFees('testnet');

    expect(recommendedFees).toHaveProperty('fastestFee');
    expect(recommendedFees).toHaveProperty('halfHourFee');
    expect(recommendedFees).toHaveProperty('hourFee');
  });

  it('should return default target fees on error', async () => {
    // Simulate connection error inside getRecommendFees
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('error'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const recommendedFees = await getRecommendedFees('liquid');

    expect(recommendedFees.fastestFee).toEqual(0.1);
    expect(recommendedFees.halfHourFee).toEqual(0.1);
    expect(recommendedFees.hourFee).toEqual(0.1);
  });
});
