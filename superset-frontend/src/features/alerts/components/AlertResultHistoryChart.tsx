/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useEffect, useRef } from 'react';
import { init as echartsInit } from 'echarts';
import { t } from '@apache-superset/core/translation';

// [timestamp in ms, numeric value]
export type HistoryPoint = [number, number];

interface AlertResultHistoryChartProps {
  points: HistoryPoint[];
  height?: number;
}

export default function AlertResultHistoryChart({
  points,
  height = 400,
}: AlertResultHistoryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const chart = echartsInit(container);
    chart.setOption({
      grid: { left: 56, right: 24, top: 24, bottom: 48 },
      xAxis: { type: 'time' },
      yAxis: { type: 'value', name: t('Value') },
      tooltip: { trigger: 'axis' },
      series: [
        {
          type: 'line',
          data: points,
          showSymbol: points.length <= 100,
        },
      ],
    });

    // Keep the chart sized to its container
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => chart.resize());
      observer.observe(container);
    }

    return () => {
      observer?.disconnect();
      chart.dispose();
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      data-test="alert-result-history-chart"
      style={{ width: '100%', height }}
    />
  );
}