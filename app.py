from flask import Flask, render_template, request, redirect, url_for, flash
import monitor
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

CONFIG_FILE = 'config.json'
DATA_FILE = 'response_data.json'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/config', methods=['GET', 'POST'])
def config():
    if request.method == 'POST':
        action = request.form.get('action')
        url = request.form.get('url')
        config_data = monitor.load_data(CONFIG_FILE)

        if action == 'add':
            if len(config_data['urls']) < config_data['limit']['max_urls']:
                config_data['urls'].append(url)
                flash(f'URL added: {url}', 'success')
            else:
                flash(f'Maximum number of URLs reached. Cannot add more.', 'danger')
        elif action == 'delete':
            config_data['urls'].remove(url)
            flash(f'URL deleted: {url}', 'success')

        monitor.save_data(CONFIG_FILE, config_data)

    config_data = monitor.load_data(CONFIG_FILE)
    return render_template('config.html', config_data=config_data)

@app.route('/chart', methods=['GET', 'POST'])
def chart():
    config_data = monitor.load_data(CONFIG_FILE)
    response_data = monitor.load_data(DATA_FILE)
    return render_template('chart.html', config_data=config_data, response_data=response_data)


if __name__ == '__main__':
    app.run(debug=True)

