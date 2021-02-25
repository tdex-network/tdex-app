export const UPDATE_RATES = 'GET_RATES';
export const SET_RATES = 'SET_RATES';

export const updateRates = () => {
  return {
    type: UPDATE_RATES,
  };
};

export const setRates = (rates: Record<string, number>) => {
  return {
    type: SET_RATES,
    payload: rates,
  };
};
