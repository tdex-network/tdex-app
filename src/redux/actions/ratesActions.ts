export const UPDATE_PRICES = 'UPDATE_PRICES';
export const SET_PRICES = 'SET_PRICES';
export const SET_DIAGRAM_PRICES = 'SET_DIAGRAM_PRICES';

export const updatePrices = () => {
  return {
    type: UPDATE_PRICES,
  };
};

export const setPrices = (prices: Record<string, number>) => {
  return {
    type: SET_PRICES,
    payload: prices,
  };
};

export const setDiagramPrices = (prices: Record<string, number>) => {
  return {
    type: SET_DIAGRAM_PRICES,
    payload: prices,
  };
};
