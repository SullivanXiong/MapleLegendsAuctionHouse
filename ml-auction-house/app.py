from flask import Flask, jsonify, render_template
# app = Flask(__name__, static_folder="frontend/build", static_url_path="")
app = Flask(__name__)
app.config['DEBUG'] = True

# Root route to check app status
@app.route('/')
def index():
    return render_template('./index.html')

# API route
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({'message': 'Hello from Flask with FlaskUI!'})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
