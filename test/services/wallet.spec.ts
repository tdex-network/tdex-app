import axios from 'axios';

import { getRecommendedFees } from '../../src/redux/services/walletService';
import { APIURL } from '../test-utils';

describe('Wallet Service', () => {
  it('should return the expected target fees for CustomFeeModal', async () => {
    const recommendedFees = await getRecommendedFees(APIURL);

    expect(recommendedFees).toHaveProperty('1');
    expect(recommendedFees).toHaveProperty('10');
    expect(recommendedFees).toHaveProperty('25');
  });

  it('should return default target fees on error', async () => {
    // Simulate connection error inside getRecommendFees
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('error'));
    jest.spyOn(console, 'error').mockImplementation();

    const recommendedFees = await getRecommendedFees(APIURL);

    expect(recommendedFees['1']).toEqual(0.1);
    expect(recommendedFees['10']).toEqual(0.1);
    expect(recommendedFees['25']).toEqual(0.1);
  });
});
