import React from 'react';

import './style.scss';

const ShowMnemonic: React.FC<{ mnemonic: string }> = ({ mnemonic }) => {
  const Word: React.FC<{ index: number; word: string }> = ({ word, index }) => (
    <div>
      <span className="word-index">{index + 1}</span>
      {word}
    </div>
  );

  return (
    <div className="container">
      {mnemonic.split(' ').map((word, index) => Word({ index, word }))}
    </div>
  );
};

export default ShowMnemonic;
