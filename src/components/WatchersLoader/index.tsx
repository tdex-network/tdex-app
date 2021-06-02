import React from 'react';

import TransactionLoader from '../TransactionLoader';

export interface WatchersLoaderProps {
  watchers: string[];
}

const WatchersLoader: React.FC<WatchersLoaderProps> = ({ watchers }) => {
  return (
    <>
      {watchers.map((txID: string, index: number) => (
        <TransactionLoader key={index} txID={txID} />
      ))}
    </>
  );
};

export default WatchersLoader;
