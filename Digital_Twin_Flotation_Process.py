import numpy as np
import time
import threading
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

class FlotationProcessSimulator:
    def __init__(self, buffer_size=1, anomaly_rate=0.05):
        self.buffer_size = buffer_size
        self.anomaly_rate = anomaly_rate
        self.data_buffer = []
        self.buffer_lock = threading.Lock()
        self.data_gen = self._simulate_flotation_data()
        self.updater_thread = threading.Thread(target=self._data_updater, daemon=True)
        self.updater_thread.start()

    def _simulate_flotation_data(self):
        while True:
            feed_rate = np.random.normal(100, 5)
            air_flow = np.random.normal(50, 2)
            pH = np.random.normal(7.5, 0.2)
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
        while True:
            new_data = next(self.data_gen)
            with self.buffer_lock:
                self.data_buffer.append(new_data)
                if len(self.data_buffer) > self.buffer_size:
                    self.data_buffer.pop(0)
            print(new_data)
            time.sleep(1)

    def get_data(self):
        with self.buffer_lock:
            return list(self.data_buffer)

simulator = FlotationProcessSimulator()

app = FastAPI()

# Enable CORS for all origins (adjust this for production)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # You can restrict this to your frontend domain(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/data")
async def get_flotation_data():
    return simulator.get_data()

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)