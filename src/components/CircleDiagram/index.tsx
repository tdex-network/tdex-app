import React, { useEffect, useRef } from 'react';
import './style.scss';
import classNames from 'classnames';

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
  otherColors: any;
}

const CircleDiagram: React.FC<CircleDiagram> = ({
  className,
  data,
  total,
  otherColors,
}) => {
  const canvasRef: any = useRef(null);

  const renderCircle = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 240, 240);

    const shift = -0.5 * Math.PI;
    const minWidthPercent = 3.382042540702776;
    const minWidth = 0.0125;
    const lengthList: number[] = [];
    let length: number, start: number, end: number;
    let minimalCount = 0;
    let minimalWidthSum = 0;

    const checkSmallElements = () => {
      const marginsSum = data.length * 0.2;
      data.forEach((item: any, index: number) => {
        const part = item.amount / total;
        const realLength = part * (2 * Math.PI - marginsSum);
        if (part * 100 < minWidthPercent) {
          minimalCount++;
          minimalWidthSum += realLength;
          lengthList.push(minWidth);
        } else {
          lengthList.push(realLength);
        }
      });
    };

    const getElementPosition = (
      item: any,
      index: number,
      discrepancy: number
    ) => {
      if (index === 0) {
        start = shift + 0.1;
      } else if (index === data.length - 1) {
        start = start + length + 0.2;
      } else {
        start = start + length + 0.2;
      }

      length =
        lengthList[index] > minWidthPercent / 100
          ? lengthList[index] - discrepancy
          : lengthList[index];
      end =
        start + length > 2 * Math.PI + shift
          ? 2 * Math.PI + shift - 0.1
          : start + length;
    };

    const fillColor = (item: any, grad: any) => {
      if (colors[item.type.toLowerCase()]) {
        const [first, second] = colors[item.type.toLowerCase()];
        grad.addColorStop(0, first);
        grad.addColorStop(1, second);
      } else if (otherColors[item.type.toLowerCase()]) {
        const color = otherColors[item.type.toLowerCase()];
        grad.addColorStop(0, color);
        grad.addColorStop(1, color);
      } else {
        grad.addColorStop(0, '#CCCCCC');
        grad.addColorStop(1, '#CCCCCC');
      }
    };

    const drawDiagram = (grad: any) => {
      const withData = data.length;
      ctx.beginPath();
      ctx.arc(
        120,
        120,
        110,
        withData ? start : -0.5 * Math.PI,
        withData ? end : 2 * Math.PI
      );
      ctx.lineWidth = 17;
      ctx.lineCap = 'round';
      ctx.strokeStyle = grad;
      ctx.stroke();
    };

    if (data.length) {
      checkSmallElements();
      const discrepancy =
        (minimalCount * minWidth - minimalWidthSum) /
        (data.length - minimalCount);
      data.forEach((item: any, index: number) => {
        const grad = ctx.createLinearGradient(100, 0, 200, 200);
        getElementPosition(item, index, discrepancy);
        fillColor(item, grad);
        drawDiagram(grad);
      });
    } else {
      const grad = ctx.createLinearGradient(100, 0, 200, 200);
      drawDiagram(grad);
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
