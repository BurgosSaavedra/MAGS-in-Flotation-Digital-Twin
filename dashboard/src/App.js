import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

Chart.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale);

function App() {
  // -----------------------------------------
  // 1) Constants and Config
  // -----------------------------------------
  const MAX_DATA_POINTS = 90;           
  const NEW_DATA_THRESHOLD = 0.6;       
  const thresholdCount = Math.floor(MAX_DATA_POINTS * NEW_DATA_THRESHOLD);

  // -----------------------------------------
  // 2) State and Refs
  // -----------------------------------------
  const [dataPoints, setDataPoints] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');
  const [newDataCount, setNewDataCount] = useState(0);
  const [geminiInProgress, setGeminiInProgress] = useState(false);

  // We'll store dataPoints also in a ref so we can reference the latest data
  // inside the Gemini callback without causing re-renders.
  const dataPointsRef = useRef([]);

  // We use a ref to ensure we only set the interval ONCE (avoid double in Strict Mode).
  const intervalRef = useRef(null);

  // Load your Gemini API key from .env
  const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // -----------------------------------------
  // 3) Set up polling interval (once)
  // -----------------------------------------
  useEffect(() => {
    if (!intervalRef.current) {
      console.log("Setting interval to fetch local data every 1s.");
      intervalRef.current = setInterval(fetchData, 1000);
    };}, []);

  // -----------------------------------------
  // 4) Data fetch logic
  // -----------------------------------------
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/data');
      const data = response.data;

      if (data && data.length > 0) {
        // We only take the first element in this example
        const newDataPoint = data[0];

        // 1) Append to main data buffer (in State and Ref)
        setDataPoints(prevData => {
          const newDataArray = [...prevData, newDataPoint];

          if (newDataArray.length > MAX_DATA_POINTS) {
            // Keep array at max length
            newDataArray.splice(0, newDataArray.length - MAX_DATA_POINTS);
          }
          
          // 🔹 Create a clean array without anomalies
          const cleanDataArray = newDataArray.map(({ Anomaly, ...rest }) => rest);
          
          // Assign only the clean data (without Anomaly) to dataPointsRef
          dataPointsRef.current = cleanDataArray;

          return newDataArray;
        });

        // 2) Check if threshold is reached. If so, call Gemini (if not already calling).
        setNewDataCount(prevCount => {
          const updatedCount = prevCount + 1;
          if (updatedCount >= thresholdCount && !geminiInProgress) {
            console.log(
              `Reached ${updatedCount} new data points (>= 60% of buffer). Calling Gemini...`
            );
            setGeminiInProgress(true); // guard on
            fetchGeminiResponse()
              .finally(() => setGeminiInProgress(false)); // guard off
            return 0; // reset the counter
          }
          return updatedCount;
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // -----------------------------------------
  // 5) Gemini AI call
  // -----------------------------------------
  const fetchGeminiResponse = useCallback(async () => {
    const startTime = new Date();
    console.log(`Gemini call START at ${startTime.toLocaleTimeString()}`);
    console.log("Datapoints: ", dataPointsRef.current)

    try {
      // Prepare prompt from REF to get the latest dataPoints
      const prompt = 
      `Evaluate the flotation recovery performance using the provided data: 
        ${JSON.stringify(dataPointsRef.current)}. 

        Present the results in **Markdown format** using:
        - Bullet points
        - **Bold text** for key terms
        - A structured analysis format with clear sections.

        ### Structure:
        1. **Summary Statistics**
        2. **Potential Factors Influencing Recovery Rate Fluctuations**
        3. **Recommendations for Further Investigations**
        `;

      // Call the Gemini model
      const result = await model.generateContent(prompt);

      // Default fallback
      let responseText = "No response";

      // Check `result.parts`
      if (result?.parts?.[0]?.text !== undefined) {
        responseText = result.parts[0].text;
      } 
      // Check fallback in `response.candidates`
      else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text !== undefined) {
        responseText = result.response.candidates[0].content.parts[0].text;
      }

      console.log("Response Gemini AI: ", responseText);

      // Store in state
      setGeminiResponse(responseText);
      setLastUpdatedTime(new Date().toLocaleTimeString());

    } catch (error) {
      console.error("Error fetching Gemini response:", error);
    }
  }, [model]);

  // -----------------------------------------
  // 6) Chart.js config + data
  // -----------------------------------------
  const chartOptions = {
    animation: false,
    responsive: true,
    plugins: {
      legend: { labels: { color: 'white' } },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: { minute: 'HH:mm' },
          tooltipFormat: 'HH:mm:ss',
        },
        title: { display: true, text: 'Time', color: 'white' },
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        title: { display: true, text: 'Value', color: 'white' },
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  // Helper to convert data for chart
  const processData = (key) => {
    return dataPoints
      .filter((point) => point.Timestamp)
      .map((point) => ({
        x: new Date(point.Timestamp),
        y: point[key]
      }));
  };

  // Prepare datasets
  const recoveryData = processData("Recovery Rate (%)");
  const anomalyData = dataPoints
    .filter((point) => point.Anomaly === 1)
    .map((point) => ({
      x: new Date(point.Timestamp),
      y: point["Recovery Rate (%)"],
    }));

  const feedRateData = processData("Feed Rate (tph)");
  const airFlowData  = processData("Air Flow (m3/min)");
  const pHLevelData  = processData("pH Level");

  // -----------------------------------------
  // 7) Render
  // -----------------------------------------
  return (
    <div style={{ padding: '20px', backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Flotation Process</h1>

      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <img src="/plant.gif" alt="Processing Plant" style={{ width: '100%', height: 'auto' }} />
        </div>
        <div style={{ flex: '2' }}>
          <Line
            key={dataPoints.length}
            data={{
              datasets: [
                {
                  label: 'Recovery Rate (%)',
                  data: recoveryData,
                  borderColor: 'rgba(75,192,192,1)',
                  fill: false,
                },
                {
                  label: 'Anomaly',
                  data: anomalyData,
                  borderColor: 'red',
                  backgroundColor: 'red',
                  pointRadius: 5,
                  showLine: false,
                  type: 'scatter',
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <Line
            key="feedRate"
            data={{
              datasets: [
                {
                  label: 'Feed Rate (tph)',
                  data: feedRateData,
                  borderColor: 'rgba(255,99,132,1)',
                  fill: false,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <Line
            key="airFlow"
            data={{
              datasets: [
                {
                  label: 'Air Flow (m³/min)',
                  data: airFlowData,
                  borderColor: 'rgba(54,162,235,1)',
                  fill: false,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
        <div style={{ flex: '1' }}>
          <Line
            key="pHLevel"
            data={{
              datasets: [
                {
                  label: 'pH Level',
                  data: pHLevelData,
                  borderColor: 'rgba(255,206,86,1)',
                  fill: false,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '10px' }}>
        <h2>Agent AI Advisor</h2>
        <ReactMarkdown>{geminiResponse || 'Waiting for assessment...'}</ReactMarkdown>
        <p style={{ fontSize: '12px', color: 'gray' }}>
          Last updated: {lastUpdatedTime || 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default App;