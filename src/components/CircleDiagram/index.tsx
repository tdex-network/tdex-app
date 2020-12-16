import React, { useEffect, useRef } from 'react';
import './style.scss';
import classNames from 'classnames';
import { getRandomColor } from '../../utils/helpers';

const colors: {
  [key: string]: [string, string];
} = {
  lbtc: ['#f89a2a', '#fcca56'],
  lcad: ['#ee1c23', '#f83c48'],
  usdt: ['#02a578', '#04d0af'],
  btse: ['#1093f9', '#25c5fc'],
};

export interface CircleDiagram {
  data: any;
  className?: string;
  width?: number;
  total: number;
  height?: number;
}

const CircleDiagram: React.FC<CircleDiagram> = ({
  className,
  data,
  total,
  width = 240,
  height = 240,
}) => {
  const canvasRef: any = useRef(null);

  const renderCircle = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 240, 240);

    const shift = -0.5 * Math.PI;
    let length: number, start: number, end: number;

    if (data.length) {
      data.forEach((item: any, index: number) => {
        if (index === 0) {
          start = shift + 0.1;
          length = (item.amount / total) * 2 * Math.PI;
        } else if (index === data.length - 1) {
          start = start + length + 0.2;
          length = (item.amount / total) * 2 * Math.PI - 0.4;
        } else {
          start = start + length + 0.2;
          length = (item.amount / total) * 2 * Math.PI - 0.2;
        }
        const grad = ctx.createLinearGradient(100, 0, 200, 200);
        if (colors[item.type.toLowerCase()]) {
          const [first, second] = colors[item.type.toLowerCase()];
          grad.addColorStop(0, first);
          grad.addColorStop(1, second);
        } else {
          const rdmColor = getRandomColor();
          grad.addColorStop(0, rdmColor);
          grad.addColorStop(1, rdmColor);
        }
        length = length < 0 ? 0.0125 : length;
        end =
          start + length > 2 * Math.PI + shift
            ? 2 * Math.PI + shift - 0.1
            : start + length;

        if (length > 0) {
          ctx.beginPath();
          ctx.arc(120, 120, 110, start, end);
          ctx.lineWidth = 17;
          ctx.lineCap = 'round';
          ctx.strokeStyle = grad;
          ctx.stroke();
        }
      });
    } else {
      const grad = ctx.createLinearGradient(100, 0, 200, 200);
      grad.addColorStop(0, '#CCCCCC');
      grad.addColorStop(1, '#CCCCCC');
      ctx.beginPath();
      ctx.arc(120, 120, 110, -0.5 * Math.PI, 2 * Math.PI);
      ctx.lineWidth = 17;
      ctx.lineCap = 'round';
      ctx.strokeStyle = grad;
      ctx.stroke();
    }
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
