import os
import json
import time
import requests
from datetime import datetime


def safe_load_json(file):
    try:
        return json.load(file)
    except json.JSONDecodeError:
        return []


def load_data(file_path, create_if_missing=True):
    default_data = {
        "urls": [],
        "max_urls": 3
    }

    if create_if_missing and not os.path.exists(file_path):
        save_data(file_path, default_data)

    with open(file_path, 'r') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = default_data

    return data

def save_data(filename, data):
    with open(filename, 'w') as file:
        json.dump(data, file)


def monitor_websites(config_file, data_file):
    config_data = load_data(config_file)
    response_data = load_data(data_file)

    for url in config_data["urls"]:
        try:
            start_time = time.time()
            response = requests.get(url)
            elapsed_time = time.time() - start_time

            timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            status_code = response.status_code
            response_time = round(elapsed_time * 1000, 2)

            entry = {
                "url": url,
                "timestamp": timestamp,
                "status_code": status_code,
                "response_time": response_time,
            }

            response_data.append(entry)
            print(f"{timestamp} - {url} - {status_code} - {response_time} ms")

        except requests.exceptions.RequestException as e:
            print(f"Error monitoring {url}: {e}")

    save_data(data_file, response_data)

    return response_data


if __name__ == "__main__":
    while True:
        monitor_websites("config.json", "response_data.json")
        time.sleep(60)

