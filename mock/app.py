from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
import threading
import time
import base64

app = Flask(__name__)
CORS(app)
MODEL_FILE_PATH = 'mock/model.json'
training_thread = None
training_stop_flag = False
training_status = "idle"
training_result = None

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

@app.route('/get_datasets', methods=['POST'])
def get_offline_datasets():
    try:
        with open('public/dataset.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        print(f'Error reading JSON file: {str(e)}')
        return jsonify({'error': 'Failed to read JSON file'}), 500

@app.route('/get_algorithm', methods=['POST'])
def get_algorithm():
    try:
        # 读取 JSON 文件
        with open('public/train.json', 'r', encoding='utf-8') as file:
            data = json.load(file)

        # 返回算法信息
        return jsonify(data['algorithms'])
    except Exception as e:
        print(f'Error reading JSON file: {str(e)}')
        return jsonify({'error': 'Failed to read JSON file'}), 500

@app.route('/train', methods=['POST'])
def train():
    global training_thread, training_stop_flag, training_status, training_result

    # 如果已经有训练任务在运行，则返回错误
    if training_status == "running":
        return jsonify({"status": "error", "message": "A training task is already running."}), 400

    # 重置停止标志和状态
    training_stop_flag = False
    training_status = "running"
    training_result = None

    # 获取超参数
    data = request.json
    hyper_parameters = data.get('hyperParametersValues', {})

    # 创建环境，这里以 CartPole-v1 为例
    env = make_vec_env('CartPole-v1', n_envs=4)

    # 初始化 PPO 模型
    model = PPO('MlpPolicy', env, verbose=1, **{k: v for k, v in hyper_parameters.items() if k != 'total_timesteps'})

    # 定义训练任务
    def train_task():
        global training_stop_flag, training_status, training_result
        try:
            # 训练模型，定期检查是否收到停止请求
            total_timesteps = hyper_parameters.get('total_timesteps', 10000)
            for i in range(0, total_timesteps, 1000):  # 每 1000 步检查一次
                if training_stop_flag:
                    print("Training stopped by user request.")
                    training_result = {"status": "stopped", "message": "Training stopped by user request."}
                    break
                model.learn(total_timesteps=min(1000, total_timesteps - i))
                print(f"Training progress: {i + 1000}/{total_timesteps}")
            else:
                # 训练完成，保存模型
                model_path = 'ppo_model.pkl'
                model.save(model_path)
                print(f"Model saved to {model_path}")
                training_result = {"status": "success", "message": "Training completed and model saved."}
        except Exception as e:
            print(f"Training error: {e}")
            training_result = {"status": "error", "message": str(e)}
        finally:
            training_status = "completed"  # 更新训练状态为完成

    # 启动训练任务
    training_thread = threading.Thread(target=train_task)
    training_thread.start()

    return jsonify({"status": "success", "message": "Training started."})

@app.route('/stop_training', methods=['POST'])
def stop_training():
    global training_stop_flag

    # 设置停止标志
    training_stop_flag = True
    return jsonify({"status": "success", "message": "Training stop request sent."})

@app.route('/training_status', methods=['GET'])
def get_training_status():
    global training_status, training_result
    if training_status == "completed":
        return jsonify({"status": training_status, "result": training_result})
    return jsonify({"status": training_status})

@app.route('/get_effect', methods=['GET'])
def get_effect_image():
    # 这里可以添加逻辑来生成或获取图片
    image_path = "v2-1a6b99afa539e303ba1474f9c572c4bb_r.jpg"
    return send_file(image_path, mimetype='image/jpg')

@app.route('/publish_model', methods=['POST'])
def publish_model():
    data = request.json
    decision_model_id = data.get('decisionModelID')
    model_info = data.get('modelInfo')

    # 这里可以添加发布模型的逻辑
    print(f"Received request to publish model: {decision_model_id}")
    print(f"Model info: {model_info}")
    # 模拟发布成功
    return jsonify({"status": "success", "message": f"Model {decision_model_id} published successfully"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)