from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
import threading
import time
import datetime
import math
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
MODEL_FILE_PATH = 'mock/model.json'
ALGORITHM_FILE_PATH = 'mock/train.json'
DATASET_FILE_PATH = 'mock/dataset.json'
SCENARIO_FILE_PATH = 'mock/db.json'
DECISION_FILE_PATH = 'mock/dc.json'
EVALUATE_FILE_PATH = 'mock/evaluatetable.json'
EVALUATION_DATA_PATH = 'mock/evaluation_data.json'
training_thread = None
training_stop_flag = False
training_status = "idle"
training_result = None
client_threads = {}
@socketio.on('connect')
def handle_connect():
    print(f'客户端连接成功: {request.sid}')
    emit('connection_response', {'data': '已连接到 WebSocket'})

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    print(f'客户端断开连接: {sid}')
    stop_event = client_threads.pop(sid, None)
    if stop_event:
        stop_event.set()
        print(f"已停止为客户端 {sid} 的后台任务")

@socketio.on('start_process')
def handle_start_process(data):
    sid = request.sid
    agent_id = data.get('agentId', 'unknown_agent')
    scenario_id = data.get('scenarioId', 'unknown_scenario')
    print(f"为客户端 {sid} 启动过程,Agent: {data['agentId']}, Scenario: {data['scenarioId']}")
    stop_event = threading.Event()
    client_threads[sid] = stop_event

    def generate_process_data(agent_id, scenario_id, stop_flag):
        frame = 0
        while not stop_flag.is_set():
            dynamic_data = {
                "screen": {"width": 800, "height": 600},
                "entities": [
                    {
                        "name": f"Agent_{data['agentId']}",  # 使用 data 中的 agentId
                        "type": {
                            "type": "circle",
                            "radius": 3 + math.sin(frame * 0.1) * 0.5,
                            "center": [
                                5 + 5 * math.sin(frame * 0.05),
                                5 + 5 * math.cos(frame * 0.07)
                            ],
                            "fill": True,
                            "color": [255, 0, 0],
                            "opacity": 1.0
                        }
                    },
                    {
                        "name": "line",
                        "type": {
                            "type": "line",
                            "start": [0, 0],
                            "end": [
                                10 + 3 * math.sin(frame * 0.1),
                                10 + 3 * math.cos(frame * 0.1)
                            ],
                            "color": [0, 0, 255],
                            "width": 2.0
                        }
                    }
                ],
                "info": [
                    {"key": "场景编号", "value": data['scenarioId']},  # 使用 data 中的 scenarioId
                    {"key": "帧数", "value": frame},
                    {"key": "更新时间", "value": datetime.datetime.now().strftime("%H:%M:%S")}
                ]
            }
            socketio.emit('process_data', dynamic_data, room=sid)
            frame += 1
            socketio.sleep(0.1)
        print(f"为客户端 {sid} 的数据生成循环已停止。")

    socketio.start_background_task(
        target=generate_process_data,
        agent_id=data['agentId'],
        scenario_id=data['scenarioId'],
        stop_flag=stop_event
    )

    emit('process_response', { "status": "success", "message": "动态数据流已启动" })

    emit('process_response', {
        "status": "success",
        "message": "Dynamic data stream started",
        "scenarioId": data['scenarioId'],
        "agentId": data['agentId']
    })
def get_nested_field(item, field):
    try:
        keys = field.split('.')
        value = item
        for key in keys:
            value = value[key]
        return value
    except (KeyError, TypeError):
        return None

@app.route('/scenarios', methods=['POST'])
def get_scenarios():
    try:
        with open(SCENARIO_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        print(f'Error reading JSON file: {str(e)}')
        return jsonify({'error': 'Failed to read JSON file'}), 500

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

@app.route('/evaluateDataGenerate', methods=['POST'])
def evaluate_data_generate():
    try:
        data = request.json
        model_data = data.get('model')

        print("Received model information:", model_data)
        print("Starting data generation for evaluation...")

        new_entry = {
            "AGENT_MODEL_ID": model_data['id'],
            "AGENT_NAME": model_data['name'],
            "SCENARIO_NAME": model_data['scenario_name'],
            "ROLE_NAME": model_data['role_name'],
            "AGENT_MODEL_VERSION": model_data['version'],
            "NN_MODEL_TYPE": model_data['nn_model_type'],
            "MODEL_PATH": model_data['model_path'],
            "SELECT_MODEL": model_data['select_model'],
            "EPISODES": model_data['episodes'],
            "DATA_FILE": f"./mock/{model_data['id']}.json",
            "CREAT_TIME": datetime.datetime.now().isoformat()
        }

        try:
            with open(EVALUATE_FILE_PATH, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                if not isinstance(existing_data, list):
                    existing_data = []
        except FileNotFoundError:
            existing_data = []

        existing_data.append(new_entry)

        with open(EVALUATE_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)

        print("Data generation completed and saved to evaluatetable.json")

        return jsonify({"status": "success", "message": "Evaluation data generated successfully"})
    except Exception as e:
        print(f"Error generating evaluation data: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/loadEvaluationData', methods=['POST'])
def load_evaluation_data():
    try:
        with open(EVALUATION_DATA_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        print(f'Error reading evaluation data: {str(e)}')
        return jsonify({'error': 'Failed to read evaluation data'}), 500

@app.route('/viewEvaluationData', methods=['POST'])
def view_evaluation_data():
    try:
        data = request.json
        print("View evaluation data:", data)
        train_id = data.get('trainID')
        if not train_id:
            return jsonify({'error': 'Missing trainID'}), 400

        with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as file:
            dc_data = json.load(file)

        matched_model = next((item for item in dc_data if item['model']['id'] == train_id), None)
        if not matched_model:
            return jsonify({'error': 'Model not found'}), 404

        return jsonify(matched_model)
    except Exception as e:
        print(f'Error fetching evaluation data: {str(e)}')
        return jsonify({'error': 'Failed to fetch evaluation data'}), 500

@app.route('/startEvaluation', methods=['POST'])
def start_evaluation():
    try:
        data = request.json
        print("Starting evaluation:", data)
        evaluate_data = data.get('evaluateData')
        if not evaluate_data:
            return jsonify({'error': 'Missing evaluateData'}), 400

        return jsonify({
            "chart_data": [
              {
                "content": "京沪车流量周对比分析",
                "x_label": "星期",
                "y_label": "车流量",
                "data_legend": ["北京", "上海"],
                "chart_data": [
                  {"x": "周一", "y": 87, "legend": "北京"},
                  {"x": "周二", "y": 55, "legend": "北京"},
                  {"x": "周三", "y": 70, "legend": "北京"},
                  {"x": "周一", "y": 66, "legend": "上海"},
                  {"x": "周二", "y": 95, "legend": "上海"},
                  {"x": "周三", "y": 89, "legend": "上海"}
                ]
              },
              {
                "content": "高峰时段路网流量分布",
                "x_label": "时间段",
                "y_label": "车流量（辆/小时）",
                "data_legend": ["早高峰", "午高峰", "晚高峰"],
                "chart_data": [
                  {"x": "主干道", "y": 3200, "legend": "早高峰"},
                  {"x": "主干道", "y": 2800, "legend": "午高峰"},
                  {"x": "主干道", "y": 4100, "legend": "晚高峰"},
                  {"x": "快速路", "y": 2500, "legend": "早高峰"},
                  {"x": "快速路", "y": 2100, "legend": "午高峰"},
                  {"x": "快速路", "y": 3800, "legend": "晚高峰"}
                ]
              },
              {
                "content": "交通事故同期对比统计",
                "x_label": "事故类型",
                "y_label": "发生次数",
                "data_legend": ["本周", "上周"],
                "chart_data": [
                  {"x": "追尾", "y": 15, "legend": "本周"},
                  {"x": "追尾", "y": 22, "legend": "上周"},
                  {"x": "侧翻", "y": 8, "legend": "本周"},
                  {"x": "侧翻", "y": 12, "legend": "上周"},
                  {"x": "闯红灯", "y": 30, "legend": "本周"},
                  {"x": "闯红灯", "y": 45, "legend": "上周"}
                ]
              }
            ],
            "event_data": [
              "系统初始化完成",
              "传感器校准成功",
              "路径规划更新"
            ],
            "radar_chart_data": {
              "indicator": [
                {"name": "销售", "max": 6500},
                {"name": "管理", "max": 16000},
                {"name": "信息技术", "max": 30000}
              ],
              "data": {
                "预算分配": {"销售": 4300, "管理": 10000, "信息技术": 25000},
                "实际开销": {"销售": 5000, "管理": 14000, "信息技术": 28000}
              }
            },
            "eval_score": 96.5,
            "eval_suggestion": [
              "建议调整刹车参数",
              "优化路径规划算法"
            ]
        })
    except Exception as e:
        print(f'Error during evaluation: {str(e)}')
        return jsonify({'error': 'Failed to evaluate'}), 500

@app.route('/get_datasets', methods=['POST'])
def get_offline_datasets():
    try:
        with open(DATASET_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        print(f'Error reading JSON file: {str(e)}')
        return jsonify({'error': 'Failed to read JSON file'}), 500

@app.route('/getDecisionModels', methods=['POST'])
def get_decision_models():
    try:
        with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as f:
            decision_models = json.load(f)
        return jsonify(decision_models)
    except Exception as e:
        print(f'Error reading decision models: {str(e)}')
        return jsonify({'error': 'Failed to read decision models'}), 500

@app.route('/getEvaluateTables', methods=['POST'])
def get_evaluate_tables():
    try:
        with open(EVALUATE_FILE_PATH, 'r', encoding='utf-8') as f:
            evaluate_tables = json.load(f)
        return jsonify(evaluate_tables)
    except Exception as e:
        print(f'Error reading evaluate tables: {str(e)}')
        return jsonify({'error': 'Failed to read evaluate tables'}), 500

@app.route('/get_algorithm', methods=['POST'])
def get_algorithm():
    try:
        with open(ALGORITHM_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
        if not isinstance(data, list):
            return jsonify({'error': 'Invalid JSON format'}), 500
        return jsonify(data)
    except Exception as e:
        print(f'Error reading JSON file: {str(e)}')
        return jsonify({'error': 'Failed to read JSON file'}), 500

@app.route('/train', methods=['POST'])
def train():
    global training_thread, training_stop_flag, training_status, training_result
    if training_status == "running":
        return jsonify({"status": "error", "message": "A training task is already running."}), 400
    training_stop_flag = False
    training_status = "running"
    training_result = None
    data = request.json
    print(data)
    hyper_parameters = data.get('hyperParametersValues', {})
    env = make_vec_env('CartPole-v1', n_envs=4)
    model = PPO('MlpPolicy', env, verbose=1, **{k: v for k, v in hyper_parameters.items() if k != 'total_timesteps'})

    def train_task():
        global training_stop_flag, training_status, training_result
        try:
            total_timesteps = hyper_parameters.get('total_timesteps', 10000)
            for i in range(0, total_timesteps, 1000):
                if training_stop_flag:
                    print("Training stopped by user request.")
                    training_result = {"status": "stopped", "message": "Training stopped by user request."}
                    break
                model.learn(total_timesteps=min(1000, total_timesteps - i))
                print(f"Training progress: {i + 1000}/{total_timesteps}")
            else:
                model_path = 'mock/ppo_model.pkl'
                model.save(model_path)
                print(f"Model saved to {model_path}")

                model_id = str(int(time.time()))
                env_params = data.get('scenarioEditInfo', {}).get('env_params', 'Unknown')
                rewards_list = data.get('agentInfo', {}).get('reward', 'Unknown')
                env_param = {}
                reward = {}
                for param in env_params:
                    for p in param.get('params', []):
                        env_param[p.get('label', f'unknown_label_{len(env_param)}')] = p.get('value', None)
                for i, reward_item in enumerate(rewards_list, 1):
                    reward[f"reward{i}"] = reward_item.get('rewardValue', f"unknown_reward_{i}")
                trained_model = {
                    "model": {
                        "id": model_id,
                        "name": data.get('agentInfo', {}).get('agentName', 'Unknown'),
                        "version": data.get('agentInfo', {}).get('agentVersion', 'Unknown'),
                        "nn_model_type": data.get('algorithmInfo', {}).get('algorithmType', 'Unknown'),
                        "time": datetime.datetime.now().isoformat(),
                        "img_url": "http://example.com/image",
                        "model_path": model_path,
                        "model_list": [f"{model_id}-0", f"{model_id}-20"],
                        "role_name": data.get('scenarioEditInfo', {}).get('agentRoleName', 'Unknown'),
                        "scenario_name": data.get('scenarioEditInfo', {}).get('scenarioName', 'Unknown'),
                        "agentID":data.get('agentInfo', {}).get('agentID', 'Unknown'),
                    },
                    "env_param":env_param,
                    "algorithm": {
                        "id":data.get('algorithmInfo', {}).get('algorithmID', 'Unknown'),
                        "name":data.get('algorithmInfo', {}).get('algorithmName', 'Unknown'),
                        "mode":data.get('algorithmInfo', {}).get('algorithmType', 'Unknown'),
                        "hyper-parameters": data.get('algorithmInfo', {}).get('hyperParameters', 'Unknown'),
                    },
                    "reward": reward
                }

                with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                existing_data.append(trained_model)

                with open(DECISION_FILE_PATH, 'w', encoding='utf-8') as f:
                    json.dump(existing_data, f, ensure_ascii=False, indent=2)

                training_result = {
                    "status": "success",
                    "message": "Training completed and model saved.",
                    "model": trained_model
                }
        except Exception as e:
            print(f"Training error: {e}")
            training_result = {"status": "error", "message": str(e)}
        finally:
            training_status = "completed"

    training_thread = threading.Thread(target=train_task)
    training_thread.start()
    return jsonify({"status": "success", "message": "Training started."})

@app.route('/stop_training', methods=['POST'])
def stop_training():
    global training_stop_flag
    training_stop_flag = True
    return jsonify({"status": "success", "message": "Training stop request sent."})

@app.route('/training_status', methods=['GET'])
def get_training_status():
    global training_status, training_result
    if training_status == "completed":
        return jsonify({"status": training_status, "result": training_result})
    return jsonify({"status": training_status})

@app.route('/publish_model', methods=['POST'])
def publish_model():
    data = request.json
    decision_model_id = data.get('decisionModelID')
    try:
        return jsonify({"status": "success", "message": f"Model {decision_model_id} published successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to publish model: {str(e)}"})

    model_info = data.get('modelInfo')
    print(f"Received request to publish model: {decision_model_id}")
    print(f"Model info: {model_info}")
    return jsonify({"status": "success", "message": f"Model {decision_model_id} published successfully"})

@app.route('/searchAll', methods=['POST'])
def search_all():
    try:
        data = request.json
        search_type = data.get('type')
        field = data.get('field')
        value = data.get('value')
        if search_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
        elif search_type == 'dataset':
            file_path = DATASET_FILE_PATH
        elif search_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
        elif search_type == 'decision':
            file_path = DECISION_FILE_PATH
        elif search_type == 'model':
            file_path = MODEL_FILE_PATH
        elif search_type == 'evaluate':
            file_path = EVALUATE_FILE_PATH
        else:
            return jsonify({'status': 'error', 'message': 'Invalid search type'}), 400
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        filtered_data = []
        for item in existing_data:
            item_value = get_nested_field(item, field) if search_type == 'decision' else item.get(field)
            if item_value and str(item_value).find(str(value)) != -1:
                filtered_data.append(item)
        return jsonify(filtered_data)
    except Exception as e:
        print(f'Error searching: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/deleteAll', methods=['POST'])
def delete_item():
    try:
        data = request.json
        delete_type = data.get('type')
        item_id = data.get('id')
        if delete_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
        elif delete_type == 'dataset':
            file_path = DATASET_FILE_PATH
        elif delete_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
        elif delete_type == 'decision':
            file_path = DECISION_FILE_PATH
        elif delete_type == 'model':
            file_path = MODEL_FILE_PATH
        elif delete_type == 'evaluate':
            file_path = EVALUATE_FILE_PATH
        else:
            return jsonify({'status': 'error', 'message': 'Invalid delete type'}), 400
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        if delete_type == 'algorithm':
            existing_data = [item for item in existing_data if item.get('algorithm_id') != item_id]
        elif delete_type == 'dataset':
            existing_data = [item for item in existing_data if item.get('OFFLINE_DATA_ID') != item_id]
        elif delete_type == 'scenario':
            existing_data = [item for item in existing_data if item.get('id') != item_id]
        elif delete_type == 'decision':
            existing_data = [item for item in existing_data if item.get('model', {}).get('id') != item_id]
        elif delete_type == 'model':
            existing_data = [item for item in existing_data if item.get('agentID') != item_id]
        elif delete_type == 'evaluate':
            existing_data = [item for item in existing_data if item.get('AGENT_MODEL_ID') != item_id]
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        return jsonify({'status': 'success', 'message': f'{delete_type.capitalize()} deleted successfully'})
    except Exception as e:
        print(f'Error deleting {delete_type}: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/updateAll', methods=['POST'])
def update_item():
    try:
        data = request.json
        update_type = data.get('type')
        item_id = data.get('id')
        updated_data = data.get('data', {})
        if update_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
        elif update_type == 'dataset':
            file_path = DATASET_FILE_PATH
        elif update_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
        elif update_type == 'decision':
            file_path = DECISION_FILE_PATH
        elif update_type == 'model':
            file_path = MODEL_FILE_PATH
        elif update_type == 'evaluate':
            file_path = EVALUATE_FILE_PATH
        else:
            return jsonify({'status': 'error', 'message': 'Invalid update type'}), 400
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        updated = False
        for item in existing_data:
            if update_type == 'algorithm' and item.get('algorithm_id') == item_id:
                item.update(updated_data)
                updated = True
            elif update_type == 'dataset' and item.get('OFFLINE_DATA_ID') == item_id:
                item.update(updated_data)
                updated = True
            elif update_type == 'scenario' and item.get('id') == item_id:
                item.update(updated_data)
                updated = True
            elif update_type == 'decision' and item.get('model', {}).get('id') == item_id:
                item.update(updated_data)
                updated = True
            elif update_type == 'model' and item.get('agentID') == item_id:
                item.update(updated_data)
                updated = True
            elif update_type == 'evaluate' and item.get('AGENT_MODEL_ID') == item_id:
                item.update(updated_data)
                updated = True
        if not updated:
            return jsonify({'status': 'error', 'message': f'{update_type.capitalize()} not found'}), 404
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        return jsonify({'status': 'success', 'message': f'{update_type.capitalize()} updated successfully'})
    except Exception as e:
        print(f'Error updating {update_type}: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/addAll', methods=['POST'])
def add_item():
    try:
        data = request.json
        add_type = data.get('type')
        new_item = data.get('data', {})
        if add_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
            id_field = 'algorithm_id'
        elif add_type == 'dataset':
            file_path = DATASET_FILE_PATH
            id_field = 'OFFLINE_DATA_ID'
        elif add_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
            id_field = 'id'
        elif add_type == 'decision':
            file_path = DECISION_FILE_PATH
            id_field = 'model.id'
        elif add_type == 'model':
            file_path = MODEL_FILE_PATH
            id_field = 'agentID'
        elif add_type == 'evaluate':
            file_path = EVALUATE_FILE_PATH
            id_field = 'AGENT_MODEL_ID'
        else:
            return jsonify({'status': 'error', 'message': 'Invalid add type'}), 400
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        if add_type == 'decision':
            if any(get_nested_field(item, id_field) == get_nested_field(new_item, id_field) for item in existing_data):
                return jsonify({'status': 'error', 'message': f'{add_type.capitalize()} ID already exists'}), 400
        else:
            if any(item.get(id_field) == new_item.get(id_field) for item in existing_data):
                return jsonify({'status': 'error', 'message': f'{add_type.capitalize()} ID already exists'}), 400
        existing_data.append(new_item)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        return jsonify({'status': 'success', 'message': f'{add_type.capitalize()} added successfully'})
    except Exception as e:
        print(f'Error adding {add_type}: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/updateDbJson', methods=['POST'])
def update_db_json():
    try:
        data = request.get_json()
        scenario_id = data.get('scenarioId')
        entity_name = data.get('entityName')
        attribute_key = data.get('attributeKey')
        new_value = data.get('newValue')
        with open(SCENARIO_FILE_PATH, 'r', encoding='utf-8') as file:
            scenarios = json.load(file)
        scenario = next((s for s in scenarios if s['id'] == scenario_id), None)
        if scenario:
            entity = next((e for e in scenario['env_params'] if e['name'] == entity_name), None)
            if entity:
                for param in entity['params']:
                    if param[0] == attribute_key:
                        param[2] = new_value
                with open(SCENARIO_FILE_PATH, 'w', encoding='utf-8') as file:
                    json.dump(scenarios, file, ensure_ascii=False, indent=2)
                return jsonify({"message": "更新成功", "updatedScenario": scenario}), 200
            else:
                return jsonify({"message": "未找到对应的实体"}), 404
        else:
            return jsonify({"message": "未找到对应的场景"}), 404
    except Exception as e:
        return jsonify({"message": f"更新失败: {str(e)}"}), 500

@app.route('/get_deployment_image', methods=['POST'])
def get_deployment_image():
    data = request.get_json()
    scenario_id = data.get('scenarioId')
    if not scenario_id:
        return jsonify({"status": "error", "message": "Missing scenarioId"}), 400

    # 构造绘图数据，类似于你提供的JSON
    deployment_data = {
        "screen": {"width": 800, "height": 600},
        "entities": [
            {
                "name": "DH1",
                "type": {
                    "type": "circle",
                    "radius": 3,
                    "center": [0, 0],
                    "fill": True,
                    "color": [255, 0, 0],
                    "opacity": 1.0
                }
            },
            {
                "name": "Line1",
                "type":{
                    "type": "line",
                    "start": [0, 0],
                    "end": [10, 10],
                    "color": [255, 0, 0],
                    "width": 1.0
                }
            },
            {   
                "name": "Fan1",
                "type":{
                    "type": "fan",
                    "center": [0.9, 1],
                    "startAngle": 1.1,
                    "endAngle":2,
                    "color": [255, 9, 0]
                }
            },
            {
                "name": "DH2",
                "type":{
                    "type": "circle",
                    "radius": 2,
                    "center": [10, 10],
                    "fill": True,
                    "color": [255, 255, 0],
                    "opacity": 0.5
                }
            }
        ],
        "info": [
            {"key": "场景编号", "value": scenario_id, "datetime": datetime.datetime.now().isoformat()},
            {"key": "创建时间", "value": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        ]
    }

    return jsonify({
        "status": "success",
        "deployment_data": deployment_data
    })

@app.route('/get_process_data', methods=['POST'])
def get_process_data():
    data = request.get_json()
    scenario_id = data.get('scenarioId', "default")
    agent_id = data.get('agentId', "default")
    
    # 直接返回成功响应，实际数据将通过socket.io发送
    return jsonify({
        "status": "success",
        "message": "Dynamic data stream started",
        "scenarioId": scenario_id,
        "agentId": agent_id
    })

@app.route('/load_dataset', methods=['POST'])
def load_dataset():
    try:
        data = request.get_json()
        return jsonify({
            "success": True,
            "dataset": data,
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"服务器错误: {str(e)}"
        }), 500
@app.route('/get_model_list', methods=['POST'])
def get_model_list():
    try:
        # 获取请求参数
        request_data = request.get_json()
        scenario_id = request_data.get('scenarioId')
        scenario_name = request_data.get('scenarioName')
        agent_role_id = request_data.get('agentRoleId')
        agent_role_name = request_data.get('agentRoleName')
        algorithm_name = request_data.get('algorithmName')
        agent_id = request_data.get('agentId')
        if not scenario_id or not scenario_name or not agent_role_id or not agent_role_name:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameters: scenarioId, scenarioName, agentRoleId, agentRoleName'
            }), 400

        with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as f:
            all_models = json.load(f)

        filtered_models = []
        for model in all_models:
            scenario_match = (model['model']['scenario_name'] == scenario_name)
            role_match = (model['model']['role_name'] == agent_role_name)
            algorithm_match = (model['algorithm']['name'] == algorithm_name)
            agent_match = (str(model['model']['agentID']) == str(agent_id))
            print(algorithm_match,scenario_match,role_match,agent_match)
            if scenario_match and role_match and algorithm_match and agent_match:
                filtered_models.append(model)

        return jsonify({
            'status': 'success',
            'models': filtered_models
        })

    except FileNotFoundError:
        return jsonify({
            'status': 'error',
            'message': 'Model data file not found'
        }), 500
    except json.JSONDecodeError:
        return jsonify({
            'status': 'error',
            'message': 'Invalid model data file format'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True)