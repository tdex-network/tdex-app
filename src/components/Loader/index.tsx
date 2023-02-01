import { IonLoading } from '@ionic/react';

import { useDelayedRender } from '../../hooks/useDelayedRender';

interface LoaderProps {
  showLoading: boolean;
  delay?: number;
  message?: string;
  backdropDismiss?: boolean;
  onDidDismiss?: () => void;
  duration?: number;
}

const Loader: React.FC<LoaderProps> = ({
  backdropDismiss = false,
  onDidDismiss,
  duration = 0,
  delay,
  message,
  showLoading,
}) => {
  return useDelayedRender(
    delay ?? 500,
    showLoading
  )(() => (
    <IonLoading
      isOpen={showLoading}
      message={message || 'Please wait...'}
      spinner="lines"
      backdropDismiss={backdropDismiss}
      onDidDismiss={onDidDismiss}
      duration={duration}
    />
  ));
};

export default Loader;
