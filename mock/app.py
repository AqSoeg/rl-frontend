from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import base64

app = Flask(__name__)
CORS(app)
MODEL_FILE_PATH = 'mock/model.json'

def image_to_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
            return encoded_string
    except FileNotFoundError:
        print(f"图片文件未找到: {image_path}")
        return None

@app.route('/scenarios', methods=['POST'])
def get_scenarios():
    with open('mock/db.json', 'r', encoding='utf-8') as f:
        db_data = json.load(f)

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

        existing_data = []
        if os.path.exists(MODEL_FILE_PATH):
            with open(MODEL_FILE_PATH, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = []

        existing_data.append(model_data)

        os.makedirs(os.path.dirname(MODEL_FILE_PATH), exist_ok=True)
        with open(MODEL_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        return jsonify({'status': 'success'})
    except Exception as e:
        print(f'Error saving model: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/loadEvaluationData', methods=['POST'])
def load_evaluation_data():
    return jsonify({
        "scenario_params": ["场景名称：城市交通", "场景编辑的数据："],
        "agent_info": ["智能体名称：agent", "智能体角色：红绿灯", "智能体类型：同构多智能体", "智能体版本：v1.0", "实体分配情况：智能体1代理红绿灯1和3，智能体2代理红绿灯2和4。"],
        "model_info": ["决策模型类型：", "输入信息：", "输出信息："]
    })

@app.route('/startEvaluation', methods=['POST'])
def start_evaluation():
    return jsonify({
        "chart_data": [
            {
              "content": "测试1",
              "chart_data": [
                {
                  "shape": "柱状图",
                  "base64": image_to_base64("mock/柱状图1.png")
                },
                {
                  "shape": "折线图",
                  "base64": image_to_base64("mock/折线图1.png")
                },
                {
                  "shape": "饼图",
                  "base64": image_to_base64("mock/饼图1.png")
                }
              ]
            },
            {
              "content": "测试2",
              "chart_data": [
                {
                  "shape": "柱状图",
                  "base64": image_to_base64("mock/柱状图2.png")
                },
                {
                  "shape": "折线图",
                  "base64": image_to_base64("mock/折线图2.png")
                }
              ]
            },
            {
              "content": "测试3",
              "chart_data": [
                {
                  "shape": "饼图",
                  "base64": image_to_base64("mock/饼图2.png")
                }
              ]
            }
        ],
        "event_data": [
            "系统初始化完成",
            "传感器校准成功",
            "路径规划更新"
        ],
        "radar_chart_data": image_to_base64("mock/雷达图.jpg"),
        "eval_score": 96.5,
        "eval_suggestion": [
            "建议调整刹车参数",
            "优化路径规划算法"
        ]
    })

@app.route('/offlineEvaluation', methods=['POST'])
def offline_evaluation():
    data = request.json
    print("[离线数据接收]:", data)
    return '数据发送成功，后台正在评估中•••'

if __name__ == '__main__':
    app.run(port=5000, debug=True)