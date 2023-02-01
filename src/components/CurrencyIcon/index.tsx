import { memo, useState } from 'react';

import UNKNOWN_ASSET_ICON from '../../assets/img/coins/currency-placeholder.svg';
import { getAssetImagePath } from '../../utils/constants';

interface ImgProps {
  className?: string;
  onClick?: () => void;
  onError?: (event: any) => void;
  size?: number;
}

const AssetImg: React.FC<{ path: string } & ImgProps> = ({ path, className, onClick, onError, size = 24 }) => {
  return (
    <img
      className={className}
      src={path}
      alt="asset logo"
      onError={onError}
      onClick={onClick}
      width={size}
      height={size}
    />
  );
};

const CurrencyIcon: React.FC<{ assetHash: string } & ImgProps> = ({ assetHash, className, size }) => {
  const [err, setError] = useState(false);

  if (err) {
    return <AssetImg path={UNKNOWN_ASSET_ICON} className={className} size={size} />;
  }

  return (
    <AssetImg path={getAssetImagePath(assetHash)} className={className} onError={() => setError(true)} size={size} />
  );
};

export default memo(CurrencyIcon);
