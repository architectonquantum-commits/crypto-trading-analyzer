import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function Chart({ data, symbol }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !data.historico || data.historico.length === 0) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const candleData = data.historico.map(item => ({
      time: item.timestamp / 1000,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    }));

    candleSeries.setData(candleData);

    if (data.ema_12 && data.ema_26) {
      const ema12Series = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        title: 'EMA 12',
      });

      const ema26Series = chart.addLineSeries({
        color: '#FF9800',
        lineWidth: 2,
        title: 'EMA 26',
      });

      const lastTime = candleData[candleData.length - 1].time;
      
      ema12Series.setData([{ time: lastTime, value: data.ema_12 }]);
      ema26Series.setData([{ time: lastTime, value: data.ema_26 }]);
    }

    if (data.sma_20 && data.sma_50) {
      const sma20Series = chart.addLineSeries({
        color: '#9C27B0',
        lineWidth: 1,
        lineStyle: 2,
        title: 'SMA 20',
      });

      const sma50Series = chart.addLineSeries({
        color: '#4CAF50',
        lineWidth: 1,
        lineStyle: 2,
        title: 'SMA 50',
      });

      const lastTime = candleData[candleData.length - 1].time;
      
      sma20Series.setData([{ time: lastTime, value: data.sma_20 }]);
      sma50Series.setData([{ time: lastTime, value: data.sma_50 }]);
    }

    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>{symbol}</h2>
        <div className="chart-info">
          {data && (
            <>
              <span><strong>Precio:</strong> ${data.precio?.toFixed(2)}</span>
              <span><strong>RSI:</strong> {data.rsi?.toFixed(2)}</span>
              <span><strong>ADX:</strong> {data.adx?.toFixed(2)}</span>
              <span><strong>Volumen:</strong> {data.volumen?.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
      <div ref={chartContainerRef} className="chart-wrapper" />
    </div>
  );
}
