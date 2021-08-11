import { IonLoading } from '@ionic/react';
import React from 'react';

import { useDelayedRender } from '../../hooks/useDelayedRender';

interface LoaderProps {
  delay?: number;
  message?: string;
  showLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ delay, message, showLoading }) => {
  return useDelayedRender(
    delay ?? 500,
    showLoading
  )(() => <IonLoading isOpen={showLoading} message={message || 'Please wait...'} spinner="lines" />);
};

export default Loader;
