import React, { useEffect, useRef } from 'react';
import './style.scss';
import classNames from 'classnames';

export interface CircleDiagram {
  data: any;
  className?: string;
  width?: number;
  height?: number;
}

const data = [
  {
    type: 'btc',
    amount: 10,
  },
  {
    type: 'liquid',
    amount: 7,
  },
];

const CircleDiagram: React.FC<CircleDiagram> = ({
  className,
  width = 240,
  height = 240,
}) => {
  const canvasRef: any = useRef(null);

  const renderCircle = () => {
    const ctx = canvasRef.current.getContext('2d');

    let total = 0;
    data.forEach((item: any) => {
      total += item.amount;
    });

    const grad = ctx.createLinearGradient(100, 0, 200, 200);
    grad.addColorStop(0, 'rgb(37, 197, 253)');
    grad.addColorStop(1, 'rgb(16, 147, 249)');
    let length: number, start: number;

    data.forEach((item: any, index: number) => {
      if (index === data.length - 1) {
        start = length + 0.4;
        length = (item.amount / total) * Math.PI * 2 - 0.4;
      } else if (index === 0) {
        start = 0;
        length = (item.amount / total) * Math.PI * 2;
      } else {
        start = length + 0.4;
        length = 1;
      }

      ctx.beginPath();
      ctx.arc(120, 120, 110, start, length);
      ctx.lineWidth = 17;
      ctx.lineCap = 'round';
      ctx.strokeStyle = grad;
      ctx.stroke();
    });
  };

  useEffect(() => {
    renderCircle();
  });

  return (
    <canvas
      width="240"
      height="240"
      ref={canvasRef}
      id="#canvas"
      className={classNames('canvas', className)}
    />
  );
};

export default CircleDiagram;
