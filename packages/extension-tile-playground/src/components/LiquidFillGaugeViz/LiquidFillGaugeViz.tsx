/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import React, { useEffect, useRef } from 'react';
import { Span } from '@looker/components';
import {
  createSvg,
  defaultConfig,
  liquidFillGauge,
} from './liquid_fill_gauge.js';

export interface LiquidFillGaugeVizProps {
  renderComplete?: () => void;
  value: any;
  valueFormat?: any;
  config?: any;
  width: number | string;
  height: number | string;
}

export const LiquidFillGaugeViz: React.FC<LiquidFillGaugeVizProps> = ({
  renderComplete = () => {
    // default noop
  },
  value,
  valueFormat = null,
  config = {},
  height,
  width,
}) => {
  const ctrRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ctrRef.current) {
      const element = ctrRef.current as any;
      const svg = createSvg(element);
      const cfg = { ...defaultConfig, config };
      liquidFillGauge(svg, value, cfg, valueFormat);
      renderComplete();
    }
  }, [renderComplete, value, valueFormat, config]);

  return <Span style={{ width, height }} ref={ctrRef}></Span>;
};
