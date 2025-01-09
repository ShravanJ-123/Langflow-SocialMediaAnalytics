from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Flask, render_template
import requests
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to call API

# Define account-specific configuration
account_config = {
    "ranveer": {
        "BASE_API_URL": "https://api.langflow.astra.datastax.com",
        "LANGFLOW_ID": "50f59f86-16d5-46db-abe2-c0995d97f2b0",
        "FLOW_ID": "3030aad7-cea9-4049-956c-bc5c7486ad0a",
        "APPLICATION_TOKEN": os.getenv('TOKEN1')
    },
    "hitesh": {
        "BASE_API_URL": "https://api.langflow.astra.datastax.com",
        "LANGFLOW_ID": "50f59f86-16d5-46db-abe2-c0995d97f2b0",
        "FLOW_ID": "ed7e98d8-933c-4cf8-811b-86d56ddaf262",
        "APPLICATION_TOKEN": os.getenv('TOKEN2')
    }
}

@app.route('/api/message', methods=['POST'])
def get_message():
    """Handle chat messages."""
    message = request.json.get('message')
    account = request.json.get('account')

    if not message or not account:
        return jsonify({"error": "Message and account are required"}), 400

    if account not in account_config:
        return jsonify({"error": "Invalid account selected"}), 400

    response = run_flow(message, account)
    return jsonify(response)

def run_flow(message, account):
    """Send message to the appropriate Langflow API."""
    config = account_config[account]
    api_url = f"{config['BASE_API_URL']}/lf/{config['LANGFLOW_ID']}/api/v1/run/{config['FLOW_ID']}"

    payload = {
        "input_value": f"{account}: {message}",  # Pass account context
        "output_type": "chat",
        "input_type": "chat",
    }
    headers = {
        "Authorization": f"Bearer {config['APPLICATION_TOKEN']}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)
