import React from 'react';
import './style.scss';

export type Alignments = 'left' | 'center' | 'right';

export interface PageDescriptionInterface {
  title: string;
  align?: Alignments;
}

const PageDescription: React.FC<PageDescriptionInterface> = ({
  title,
  children,
  align = 'center',
}) => {
  return (
    <div className="page-description">
      <h2>{title}</h2>
      <div style={{ textAlign: align }}>{children}</div>
    </div>
  );
};

export default PageDescription;
