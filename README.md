# Multy Agent Generative System - Digital Twin for Flotation Process

## Introduction
This project implements a **Digital Twin** for a mining flotation process, integrating **AI agent Advisor** for real-time monitoring and decision-making. The system consists of a Python-based simulator, an AI-powered analytical engine, and a React-based dashboard for data visualization.

## Background: Digital Twin, AI Agent Advisor, and Mining Flotation Process

### Digital Twin
A Digital Twin is a virtual representation of the flotation process that continuously updates with real-time data.

### AI Agent Advisor
The AI Agent Advisor serves as a continuous expert, delivering in-depth analysis of recommendations and system performance while assisting users in interpreting complex data in real time.

### Mining Flotation Process
Flotation is a mineral processing method that separates valuable minerals from ore based on their hydrophobic properties. The process involves:
- Feeding crushed ore into flotation tanks
- Adding air and reagents to create bubbles
- Attaching hydrophobic minerals to bubbles and separating them from hydrophilic materials
- Recovering the concentrate for further refinement

## Implementation

### Python Simulation (Back-end)
The **Digital Twin Flotation Process Simulator** (see `Digital_Twin_Flotation_Process.py`) generates synthetic process data, including:
- **Feed Rate (tph)**: Ore input per hour
- **Air Flow (m³/min)**: Air supply to flotation cells
- **pH Level**: Acidity/alkalinity of the flotation environment
- **Recovery Rate (%)**: Efficiency of valuable mineral separation
- **Anomaly Detection**: Identifies process deviations. This feature is not visible to the AI Agent Advisor.

The simulator runs continuously and provides real-time data via a **FastAPI** server, accessible at `http://localhost:8000/data`.

### Dashboard (Front-end)
The **dashboard (App.js)** visualizes flotation process metrics using **Chart.js** and provides AI-driven insights. Features include:
- Real-time plotting of recovery rate, feed rate, air flow, and pH level
- Anomaly markers for process deviations
- AI-generated insights on system performance

### AI Agent Advisor
The AI agent in **React (App.js)** monitors incoming data and triggers **Google Gemini AI** once a threshold of new data points is reached. The AI Agent Advisor provides:
- Summary Statistics
- Potential Factors Influencing Recovery Rate Fluctuations
- Recommendations for Further Investigations

The AI-generated reports are displayed in markdown format within the dashboard.

## How to Start
1. **Install Required Software**:
   - Install [Node.js](https://nodejs.org/) and ensure `npm` is available.
   - Install [Python](https://www.python.org/) and ensure `pip` is available.

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/BurgosSaavedra/MAGS-in-Flotation-Digital-Twin.git
   cd MAGS-in-Flotation-Digital-Twin
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   npm install
   ```
4. **Create an API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Generate an API key
   - Save the key in a `.env` file:
     ```bash
     REACT_APP_GEMINI_API_KEY="your_api_key_here"
     ```
5. **Start the Backend Server**:
   ```bash
   python Digital_Twin_Flotation_Process.py
   ```
6. **Run the Frontend Dashboard**:
   ```bash
   npm start
   ```
7. **Access the Dashboard** at `http://localhost:3000`.

## Video Demonstration
Watch the following video to see the web application in action:

[![Watch the video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=fDig66ccFe4)

## Conclusion
This project establishes a **Multy Agent Generative System** as a **Digital Twin for Flotation Process**, integrating **real-time data analysis, AI-driven advisory, and interactive visualization**. The **AI Agent Advisor** acts as an expert system, providing comprehensive insights and recommendations based on system behavior. Through continuous monitoring, statistical analysis, and anomaly detection, this system enhances operational efficiency and decision-making in flotation processing. Future developments may focus on refining AI models, improving anomaly detection, and integrating real-world industrial data sources for higher accuracy and scalability.