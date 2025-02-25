import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time
import threading
from datetime import datetime

# Simulate real-time flotation circuit data with a timestamp
def simulate_flotation_data(anomaly_rate=0.05):
    while True:
        feed_rate = np.random.normal(100, 5)  # tons per hour
        air_flow = np.random.normal(50, 2)     # m^3/min
        pH = np.random.normal(7.5, 0.2)          # pH level
        recovery_rate = 85 + 0.5 * feed_rate + 0.2 * air_flow - 3 * (pH - 7.5)
        
        # Introduce anomalies occasionally
        anomaly = 0
        if np.random.rand() < anomaly_rate:
            recovery_rate -= np.random.uniform(10, 20)
            anomaly = 1
        
        yield {
            'Timestamp': datetime.now(),
            'Feed Rate (tph)': feed_rate,
            'Air Flow (m3/min)': air_flow,
            'pH Level': pH,
            'Recovery Rate (%)': recovery_rate,
            'Anomaly': anomaly
        }

# Shared data buffer and lock for thread-safe operations
data_buffer = []
buffer_lock = threading.Lock()

# Create a single generator instance for the simulation
data_gen = simulate_flotation_data()

# Function to continuously update the data buffer and print new data points
def data_updater():
    count = 0
    while True:
        new_data = next(data_gen)
        with buffer_lock:
            data_buffer.append(new_data)
            # Keep only the latest 100 points
            if len(data_buffer) > 100:
                data_buffer.pop(0)
        count += 1
        print(f"{count}: {new_data}")
        time.sleep(1)

# Animation update function for plotting the data
def update_plot(frame):
    with buffer_lock:
        df = pd.DataFrame(data_buffer)
    ax.cla()  # Clear the current axis
    if not df.empty:
        # Plot recovery rate over time using timestamps
        ax.plot(df['Timestamp'], df['Recovery Rate (%)'], label='Recovery Rate (%)')
        # Highlight anomalies with red markers
        anomalies = df[df['Anomaly'] == 1]
        if not anomalies.empty:
            ax.plot(anomalies['Timestamp'], anomalies['Recovery Rate (%)'], 'ro', label='Anomaly')
        ax.set_xlabel('Time')
        ax.set_ylabel('Recovery Rate (%)')
        ax.set_title('Real-Time Flotation Process Simulation')
        ax.legend()
        for label in ax.get_xticklabels():
            label.set_rotation(45)
        plt.tight_layout()

# Start the data updater thread as a daemon so it exits when the main program closes
updater_thread = threading.Thread(target=data_updater, daemon=True)
updater_thread.start()

# Setup real-time visualization using Matplotlib animation
fig, ax = plt.subplots()
ani = animation.FuncAnimation(fig, update_plot, interval=1000, cache_frame_data=False)
plt.show()