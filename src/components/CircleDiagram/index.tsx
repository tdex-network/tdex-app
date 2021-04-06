import React, { useEffect, useRef } from 'react';
import { createColorFromHash } from '../../utils/helpers';

import './style.scss';

const colors: {
  [key: string]: [string, string];
} = {
  lbtc: ['#f89a2a', '#fcca56'],
  lcad: ['#ee1c23', '#f83c48'],
  usdt: ['#02a578', '#04d0af'],
  btse: ['#1093f9', '#25c5fc'],
};

export interface CircleDiagramProps {
  data: Array<{ asset: string; ticker: string; amount: number }>;
}

const CircleDiagram: React.FC<CircleDiagramProps> = ({ data }) => {
  const canvasRef = useRef<any>(null);
  const total = data.reduce((acc, balance) => acc + balance.amount, 0);

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
      data.forEach((item: { asset: string; amount: number }, index: number) => {
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

    const getElementPosition = (index: number, discrepancy: number) => {
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

    const fillColor = (grad: any, item?: { asset: string; ticker: string }) => {
      if (!item) {
        grad.addColorStop(0, '#CCCCCC');
        grad.addColorStop(1, '#CCCCCC');
      } else if (colors[item.ticker.toLowerCase()]) {
        const [first, second] = colors[item.ticker.toLowerCase()];
        grad.addColorStop(0, first);
        grad.addColorStop(1, second);
      } else {
        const color = createColorFromHash(item.asset);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color);
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
      data.forEach((item, index: number) => {
        const grad = ctx.createLinearGradient(100, 0, 200, 200);
        getElementPosition(index, discrepancy);
        fillColor(grad, item);
        drawDiagram(grad);
      });
    } else {
      const grad = ctx.createLinearGradient(100, 0, 200, 200);
      fillColor(grad);
      drawDiagram(grad);
    }
  };

  useEffect(() => {
    renderCircle();
  }, [data]);

  return (
    <canvas
      width="240"
      height="240"
      ref={canvasRef}
      id="#canvas"
      className="canvas"
    />
  );
};

export default CircleDiagram;
