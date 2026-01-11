import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const EmailChart = ({ type, data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Common legend configuration for consistent alignment
    const legendConfig = {
      position: 'bottom',
      align: 'center',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        boxHeight: 8,
        padding: 16,
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        },
        color: '#94a3b8'
      }
    };

    if (type === 'pie') {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: data.colors,
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          layout: {
            padding: {
              bottom: 10
            }
          },
          plugins: {
            legend: legendConfig,
            tooltip: {
              displayColors: false,
              backgroundColor: 'rgba(30, 37, 56, 0.95)',
              titleColor: '#f8fafc',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              titleFont: {
                size: 12,
                weight: '600'
              },
              bodyFont: {
                size: 12
              },
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } else if (type === 'line') {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color,
            backgroundColor: `${dataset.color}15`,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: dataset.color,
            pointBorderColor: dataset.color,
            pointBorderWidth: 0,
            pointRadius: 3,
            pointHoverRadius: 5
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          layout: {
            padding: {
              bottom: 10
            }
          },
          plugins: {
            legend: legendConfig,
            tooltip: {
              backgroundColor: 'rgba(30, 37, 56, 0.95)',
              titleColor: '#f8fafc',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              titleFont: {
                size: 12,
                weight: '600'
              },
              bodyFont: {
                size: 12
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                font: {
                  size: 10
                },
                color: '#64748b'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(42, 53, 72, 0.5)',
                drawBorder: false
              },
              border: {
                dash: [4, 4]
              },
              ticks: {
                precision: 0,
                font: {
                  size: 10
                },
                color: '#64748b'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default EmailChart;
