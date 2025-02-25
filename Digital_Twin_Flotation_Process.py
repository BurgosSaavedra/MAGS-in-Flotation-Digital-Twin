import numpy as np
import time
import threading
from datetime import datetime
from fastapi import FastAPI
import uvicorn

class FlotationProcessSimulator:
    """
    This class simulates a real-time flotation process.
    It generates process data (with occasional anomalies) and stores
    the most recent data in an internal buffer.
    """
    def __init__(self, buffer_size=1, anomaly_rate=0.05):
        self.buffer_size = buffer_size
        self.anomaly_rate = anomaly_rate
        self.data_buffer = []
        self.buffer_lock = threading.Lock()
        self.data_gen = self._simulate_flotation_data()
        self.updater_thread = threading.Thread(target=self._data_updater, daemon=True)
        self.updater_thread.start()

    def _simulate_flotation_data(self):
        """
        Generator function that simulates the flotation process.
        """
        while True:
            feed_rate = np.random.normal(100, 5)  # tons per hour
            air_flow = np.random.normal(50, 2)     # m^3/min
            pH = np.random.normal(7.5, 0.2)          # pH level
            recovery_rate = 85 + 0.5 * feed_rate + 0.2 * air_flow - 3 * (pH - 7.5)
            
            anomaly = 0
            if np.random.rand() < self.anomaly_rate:
                recovery_rate -= np.random.uniform(10, 20)
                anomaly = 1
            
            yield {
                'Timestamp': datetime.now().isoformat(),
                'Feed Rate (tph)': feed_rate,
                'Air Flow (m3/min)': air_flow,
                'pH Level': pH,
                'Recovery Rate (%)': recovery_rate,
                'Anomaly': anomaly
            }

    def _data_updater(self):
        """
        Continuously retrieves new data from the generator and updates the data buffer.
        """
        while True:
            new_data = next(self.data_gen)
            with self.buffer_lock:
                self.data_buffer.append(new_data)
                if len(self.data_buffer) > self.buffer_size:
                    self.data_buffer.pop(0)
            print(new_data)
            time.sleep(1)

    def get_data(self):
        """
        Returns a copy of the current data buffer.
        """
        with self.buffer_lock:
            return list(self.data_buffer)

# Create an instance of the simulator. This will start the data update thread.
simulator = FlotationProcessSimulator()

# Setup FastAPI to serve the real-time data via an API endpoint.
app = FastAPI()

@app.get("/data")
async def get_flotation_data():
    """
    API endpoint to retrieve the latest flotation process data.
    """
    return simulator.get_data()

if __name__ == '__main__':
    # Run the API server. Other codes can access real-time data at:
    # http://localhost:8000/data
    uvicorn.run(app, host="0.0.0.0", port=8000)
