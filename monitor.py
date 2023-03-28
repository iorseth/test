import requests
import time
import os
import json
from datetime import datetime

DATA_FILE = 'data.json'

# Add this function to your existing monitor.py file
def load_data(filename):
    try:
        with open(filename, 'r') as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    return data

def load_config():
    with open('config.json') as config_file:
        return json.load(config_file)

def monitor(urls):
    results = []
    for url in urls:
        try:
            start_time = time.time()
            response = requests.get(url)
            elapsed_time = time.time() - start_time

            results.append({
                'timestamp': datetime.now().isoformat(),
                'url': url,
                'status_code': response.status_code,
                'response_time': elapsed_time
            })
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    return results

def save_to_file(data):
    with open('output.json', 'a') as output_file:
        for item in data:
            json.dump(item, output_file)
            output_file.write('\n')

