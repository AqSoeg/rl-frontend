from flask import Flask, request, jsonify
from flask_cors import CORS  # 导入 CORS
import json
import os

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求
MODEL_FILE_PATH = 'C:/Users/21830/Desktop/Project/agent/frontend/mock/model.json'

# 读取 db.json 文件
with open('C:/Users/21830/Desktop/Project/agent/frontend/public/db.json', 'r', encoding='utf-8') as f:
    db_data = json.load(f)

@app.route('/scenarios', methods=['POST'])
def get_scenarios():
    data = request.json
    scenario_id = data.get('scenario_id')

    if scenario_id:
        scenarios = [scenario for scenario in db_data['scenarios'] if scenario['id'] == scenario_id]
        return jsonify(scenarios)
    else:
        return jsonify(db_data['scenarios'])

@app.route('/getModels', methods=['POST'])
def get_models():
    try:
        if os.path.exists(MODEL_FILE_PATH):
            with open(MODEL_FILE_PATH, 'r', encoding='utf-8') as f:
                models = json.load(f)
                if not isinstance(models, list):
                    models = []
        else:
            models = []

        return jsonify({'models': models})
    except Exception as e:
        print(f'Error reading models: {str(e)}')
        return jsonify({'models': []})

@app.route('/saveModel', methods=['POST'])
def save_model():
    try:
        model_data = request.json

        # 读取现有数据
        existing_data = []
        if os.path.exists(MODEL_FILE_PATH):
            with open(MODEL_FILE_PATH, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = []

        # 添加新数据
        existing_data.append(model_data)

        # 保存文件
        os.makedirs(os.path.dirname(MODEL_FILE_PATH), exist_ok=True)
        with open(MODEL_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        return jsonify({'status': 'success'})
    except Exception as e:
        print(f'Error saving model: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(port=5000, debug=True)