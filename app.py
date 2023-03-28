from flask import Flask, jsonify, render_template, request, redirect, url_for, flash, Markup
import monitor
import threading
import time
import json

app = Flask(__name__)
output_data = []

@app.route('/chart', methods=['GET', 'POST'])
def chart_page():
    config = monitor.load_config()
    selected_url = None
    data = monitor.load_data()

    if request.method == 'POST':
        selected_url = request.form.get('url')

    timestamps = []
    status_codes = []


    if selected_url:
        url_data = data.get(selected_url, [])
        timestamps = [entry['timestamp'] for entry in url_data]
        status_codes = [entry['status_code'] for entry in url_data]

    if request.is_json or request.headers.get('Accept') == 'application/json':
        return jsonify(timestamps=timestamps, status_codes=status_codes)

    return render_template('chart.html', config=config, timestamps=timestamps, status_codes=status_codes, selected_url=selected_url)
 
def update_config(config):
    with open('config.json', 'w') as config_file:
        json.dump(config, config_file, indent=4)

@app.route('/config', methods=['GET', 'POST'])
def config_page():
    config = monitor.load_config()

    if request.method == 'POST':
        action = request.form.get('action')
        url = request.form.get('url')

        if action == 'add' and url not in config['urls']:
            if len(config['urls']) < config['url_limit']:
                config['urls'].append(url)
                update_config(config)
        elif action == 'delete' and url in config['urls']:
            config['urls'].remove(url)
            update_config(config)
        return redirect(url_for('config_page'))

    return render_template('config.html', config=config)

def load_output_data():
    data = []
    try:
        with open('output.json', 'r') as output_file:
            content = output_file.read().strip()
            if content:
                for line in content.split('\n'):
                    data.append(json.loads(line.strip()))
    except FileNotFoundError:
        pass
    return data

def monitor_thread():
    global output_data
    config = monitor.load_config()
    while True:
        new_data = monitor.monitor(config['urls'][:config['url_limit']])
        output_data.extend(new_data)
        monitor.save_to_file(new_data)
        time.sleep(60)

@app.route('/status')
def status():
    return jsonify(output_data)

if __name__ == '__main__':
    output_data = load_output_data()
    monitor_thread = threading.Thread(target=monitor_thread, daemon=True)
    monitor_thread.start()
    app.run(debug=True)

