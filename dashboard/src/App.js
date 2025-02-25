import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';  // Import the date adapter

function App() {
  const [dataPoints, setDataPoints] = useState([]);
  const n = 600; // n is number of elements in buffer

  // Function to fetch data from the API every second
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/data');
      const data = await response.json();
      if (data && data.length > 0) {
        setDataPoints(prevData => {
          const newData = [...prevData, data[0]];
          // Keep only the last n data points
          return newData.length > n ? newData.slice(newData.length - n) : newData;
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert raw data points to { x, y } format using Date objects
  const recoveryData = dataPoints.map(point => ({
    x: new Date(point.Timestamp),
    y: point["Recovery Rate (%)"]
  }));

  const anomalyData = dataPoints
    .filter(point => point.Anomaly === 1)
    .map(point => ({
      x: new Date(point.Timestamp),
      y: point["Recovery Rate (%)"]
    }));

  const feedRateData = dataPoints.map(point => ({
    x: new Date(point.Timestamp),
    y: point["Feed Rate (tph)"]
  }));

  const airFlowData = dataPoints.map(point => ({
    x: new Date(point.Timestamp),
    y: point["Air Flow (m3/min)"]
  }));

  const pHLevelData = dataPoints.map(point => ({
    x: new Date(point.Timestamp),
    y: point["pH Level"]
  }));

  // Chart data configurations (no "labels" property needed when using time scales)
  const recoveryChartData = {
    datasets: [
      {
        label: 'Recovery Rate (%)',
        data: recoveryData,
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

  const feedRateChartData = {
    datasets: [{
      label: 'Feed Rate (tph)',
      data: feedRateData,
      borderColor: 'rgba(255,99,132,1)',
      fill: false,
      tension: 0.1,
    }]
  };

  const airFlowChartData = {
    datasets: [{
      label: 'Air Flow (m³/min)',
      data: airFlowData,
      borderColor: 'rgba(54,162,235,1)',
      fill: false,
      tension: 0.1,
    }]
  };

  const pHLevelChartData = {
    datasets: [{
      label: 'pH Level',
      data: pHLevelData,
      borderColor: 'rgba(255,206,86,1)',
      fill: false,
      tension: 0.1,
    }]
  };

  // Chart options without the internal title (general dashboard title is shown separately)
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
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          },
          tooltipFormat: 'HH:mm:ss'
        },
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
      {/* General dashboard title */}
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Flotation Process</h1>

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
          <Line key="recovery" data={recoveryChartData} options={chartOptions} />
        </div>
      </div>

      {/* Row 2: Separate charts for Feed Rate, Air Flow, and pH Level */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <Line key="feedRate" data={feedRateChartData} options={chartOptions} />
        </div>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <Line key="airFlow" data={airFlowChartData} options={chartOptions} />
        </div>
        <div style={{ flex: '1' }}>
          <Line key="pHLevel" data={pHLevelChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default App;