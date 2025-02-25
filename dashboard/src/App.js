import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

function App() {
  const [dataPoints, setDataPoints] = useState([]);

  // Function to fetch data from the API every second
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/data');
      const data = await response.json();
      if (data && data.length > 0) {
        setDataPoints(prevData => [...prevData, data[0]]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert timestamps to a more readable format
  const timeLabels = dataPoints.map(point => new Date(point.Timestamp).toLocaleTimeString());

  // Data for the Recovery Rate chart
  const recoveryValues = dataPoints.map(point => point["Recovery Rate (%)"]);
  // Scatter points for anomalies (when Anomaly === 1)
  const anomalyData = dataPoints
    .filter(point => point.Anomaly === 1)
    .map(point => ({
      x: new Date(point.Timestamp).toLocaleTimeString(),
      y: point["Recovery Rate (%)"]
    }));

  const recoveryChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Recovery Rate (%)',
        data: recoveryValues,
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Anomaly',
        data: anomalyData,
        borderColor: 'red',
        backgroundColor: 'red',
        pointRadius: 5,
        showLine: false,
        type: 'scatter'
      }
    ]
  };

  // Data for Feed Rate chart
  const feedRateData = {
    labels: timeLabels,
    datasets: [{
      label: 'Feed Rate (tph)',
      data: dataPoints.map(point => point["Feed Rate (tph)"]),
      borderColor: 'rgba(255,99,132,1)',
      fill: false,
      tension: 0.1,
    }]
  };

  // Data for Air Flow chart
  const airFlowData = {
    labels: timeLabels,
    datasets: [{
      label: 'Air Flow (m³/min)',
      data: dataPoints.map(point => point["Air Flow (m3/min)"]),
      borderColor: 'rgba(54,162,235,1)',
      fill: false,
      tension: 0.1,
    }]
  };

  // Data for pH Level chart
  const pHLevelData = {
    labels: timeLabels,
    datasets: [{
      label: 'pH Level',
      data: dataPoints.map(point => point["pH Level"]),
      borderColor: 'rgba(255,206,86,1)',
      fill: false,
      tension: 0.1,
    }]
  };

  // Dark mode chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
          color: 'white'
        },
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          color: 'white'
        },
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        }
      }
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      {/* Row 1: Plant GIF and Recovery Rate Chart */}
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <img 
            src="/plant.gif" 
            alt="Processing Plant" 
            style={{ width: '100%', height: 'auto' }} 
          />
        </div>
        <div style={{ flex: '2' }}>
          <Line data={recoveryChartData} options={chartOptions} />
        </div>
      </div>

      {/* Row 2: Separate charts for Feed Rate, Air Flow, and pH Level */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <Line data={feedRateData} options={chartOptions} />
        </div>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <Line data={airFlowData} options={chartOptions} />
        </div>
        <div style={{ flex: '1' }}>
          <Line data={pHLevelData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default App;