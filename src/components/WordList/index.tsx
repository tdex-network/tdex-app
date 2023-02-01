import './style.scss';

const WordList: React.FC<{ mnemonic: string }> = ({ mnemonic }) => {
  return (
    <div className="word-list-container">
      {mnemonic.split(' ').map((word, index) => (
        <div className="word-row" key={index}>
          <span className="word-index">{index + 1}.</span>
          <span className="word">{word}</span>
        </div>
      ))}
    </div>
  );
};

export default WordList;
