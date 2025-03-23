from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
import threading
import time
import traceback
import datetime

app = Flask(__name__)
CORS(app)
MODEL_FILE_PATH = 'mock/model.json'
ALGORITHM_FILE_PATH = 'mock/train.json'
DATASET_FILE_PATH = 'mock/dataset.json'
SCENARIO_FILE_PATH = 'mock/db.json'
Decision_FILE_PATH = 'mock/dc.json'
training_thread = None
training_stop_flag = False
training_status = "idle"
training_result = None


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
                "content": "测试2",
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
                "content": "测试3",
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

@app.route('/offlineEvaluation', methods=['POST'])
def offline_evaluation():
    data = request.json
    print("[离线数据接收]:", data)
    return '数据发送成功，后台正在评估中•••'

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
        with open(Decision_FILE_PATH, 'r', encoding='utf-8') as f:
            decision_models = json.load(f)
        return jsonify(decision_models)
    except Exception as e:
        print(f'Error reading decision models: {str(e)}')
        return jsonify({'error': 'Failed to read decision models'}), 500

@app.route('/get_algorithm', methods=['POST'])
def get_algorithm():
    try:
        # 读取 JSON 文件
        with open(ALGORITHM_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # 确保 data 是一个列表
        if not isinstance(data, list):
            return jsonify({'error': 'Invalid JSON format'}), 500

        # 返回算法信息
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
                model_path = 'ppo_model.pkl'
                model.save(model_path)
                print(f"Model saved to {model_path}")

                trained_model = {
                    "AGENT_MODEL_ID": str(int(time.time())),  # 使用时间戳作为唯一ID
                    "AGENT_NAME": data.get('agentInfo', {}).get('agentName', 'Unknown'),
                    "SCENARIO_NAME": data.get('scenarioEditInfo', {}).get('scenarioName', 'Unknown'),
                    "ROLE_NAME": data.get('agentInfo', {}).get('agentRoleID', 'Unknown'),
                    "AGENT_MODEL_VERSION": "1.0",
                    "NN_MODEL_TYPE": data.get('algorithmInfo', {}).get('algorithmType', 'Unknown'),
                    "MODEL_PATH": model_path,
                    "IMG_URL": "http://example.com/image",  # 效果图片URL
                    "CREAT_TIME": datetime.datetime.now().isoformat(),
                }

                # 将训练结果保存到 dc.json
                with open(Decision_FILE_PATH, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                existing_data.append(trained_model)
                with open(Decision_FILE_PATH, 'w', encoding='utf-8') as f:
                    json.dump(existing_data, f, ensure_ascii=False, indent=2)

                training_result = {"status": "success", "message": "Training completed and model saved.", "model": trained_model}
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

    # 设置停止标志
    training_stop_flag = True
    return jsonify({"status": "success", "message": "Training stop request sent."})

@app.route('/training_status', methods=['GET'])
def get_training_status():
    global training_status, training_result
    if training_status == "completed":
        return jsonify({"status": training_status, "result": training_result})
    return jsonify({"status": training_status})

@app.route('/get_effect', methods=['POST'])
def get_effect_image():
    data = request.json
    decision_model_id = data.get('decisionModelID')

    try:
        with open(Decision_FILE_PATH, 'r', encoding='utf-8') as f:
            decision_models = json.load(f)

        model = next((m for m in decision_models if m['AGENT_MODEL_ID'] == decision_model_id), None)
        if model:
            return jsonify({"status": "success", "img_url": model['IMG_URL']})
        else:
            return jsonify({"status": "error", "message": "Model not found"}), 404
    except Exception as e:
        print(f'Error getting effect image: {str(e)}')
        return jsonify({"status": "error", "message": str(e)}), 500
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


@app.route('/searchAll', methods=['POST'])
def search_all():
    try:
        data = request.json
        search_type = data.get('type')
        field = data.get('field')
        value = data.get('value')

        # 根据 type 确定要搜索的文件路径
        if search_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
        elif search_type == 'dataset':
            file_path = DATASET_FILE_PATH
        elif search_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
        elif search_type == 'decision':
            file_path = Decision_FILE_PATH
        elif search_type == 'model':
            file_path = MODEL_FILE_PATH
        else:
            return jsonify({'status': 'error', 'message': 'Invalid search type'})

        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)

        filtered_data = []
        for item in existing_data:
            if field in item and str(item[field]).find(str(value)) != -1:
                filtered_data.append(item)

        # 确保返回的是一个数组
        return jsonify(filtered_data)
    except Exception as e:
        print(f'Error searching: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/deleteAll', methods=['POST'])
def delete_item():
    try:
        data = request.json
        delete_type = data.get('type')  # 指定要删除的类型
        item_id = data.get('id')  # 要删除的项的ID

        # 根据类型确定要删除的文件路径
        if delete_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
        elif delete_type == 'dataset':
            file_path = DATASET_FILE_PATH
        elif delete_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
        elif delete_type == 'decision':
            file_path = Decision_FILE_PATH
        elif delete_type == 'model':
            file_path = MODEL_FILE_PATH
        else:
            return jsonify({'status': 'error', 'message': 'Invalid delete type'}), 400

        # 读取现有数据
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)

        # 过滤掉要删除的项
        if delete_type == 'algorithm':
            existing_data = [item for item in existing_data if item.get('algorithm_id') != item_id]
        elif delete_type == 'dataset':
            existing_data = [item for item in existing_data if item.get('OFFLINE_DATA_ID') != item_id]
        elif delete_type == 'scenario':
            existing_data = [item for item in existing_data if item.get('id') != item_id]
        elif delete_type == 'decision':
            existing_data = [item for item in existing_data if item.get('AGENT_MODEL_ID') != item_id]
        elif delete_type == 'model':
            existing_data = [item for item in existing_data if item.get('agentID') != item_id]

        # 保存更新后的数据
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
        update_type = data.get('type')  # 指定要更新的类型
        item_id = data.get('id')  # 要更新的项的ID
        updated_data = data.get('data', {})  # 更新的数据

        # 根据类型确定要更新的文件路径
        if update_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
        elif update_type == 'dataset':
            file_path = DATASET_FILE_PATH
        elif update_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
        elif update_type == 'decision':
            file_path = Decision_FILE_PATH
        elif update_type == 'model':
            file_path = MODEL_FILE_PATH
        else:
            return jsonify({'status': 'error', 'message': 'Invalid update type'}), 400

        # 读取现有数据
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)

        # 查找并更新对应的项
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
            elif update_type == 'decision' and item.get('AGENT_MODEL_ID') == item_id:
                item.update(updated_data)
                updated = True
            elif update_type == 'model' and item.get('agentID') == item_id:
                item.update(updated_data)
                updated = True

        if not updated:
            return jsonify({'status': 'error', 'message': f'{update_type.capitalize()} not found'}), 404

        # 保存更新后的数据
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
        add_type = data.get('type')  # 指定要增加的类型
        new_item = data.get('data', {})  # 新增的数据

        # 根据类型确定要操作的文件路径
        if add_type == 'algorithm':
            file_path = ALGORITHM_FILE_PATH
            id_field = 'algorithm_id'  # 算法ID字段
        elif add_type == 'dataset':
            file_path = DATASET_FILE_PATH
            id_field = 'OFFLINE_DATA_ID'  # 数据集ID字段
        elif add_type == 'scenario':
            file_path = SCENARIO_FILE_PATH
            id_field = 'id'  # 场景ID字段
        elif add_type == 'decision':
            file_path = Decision_FILE_PATH
            id_field = 'AGENT_MODEL_ID'  # 决策模型ID字段
        elif add_type == 'model':
            file_path = MODEL_FILE_PATH
            id_field = 'agentID'  # 模型ID字段
        else:
            return jsonify({'status': 'error', 'message': 'Invalid add type'}), 400

        # 读取现有数据
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)

        # 检查ID是否已存在
        if any(item.get(id_field) == new_item.get(id_field) for item in existing_data):
            return jsonify({'status': 'error', 'message': f'{add_type.capitalize()} ID already exists'}), 400


        # 添加新数据
        existing_data.append(new_item)

        # 保存更新后的数据
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

        # 读取 db.json 文件
        with open(SCENARIO_FILE_PATH, 'r', encoding='utf-8') as file:
            scenarios = json.load(file)

        # 找到对应的场景
        scenario = next((s for s in scenarios if s['id'] == scenario_id), None)
        if scenario:
            # 找到对应的实体
            entity = next((e for e in scenario['env_params'] if e['name'] == entity_name), None)
            if entity:
                # 找到对应的属性并更新值
                for param in entity['params']:
                    if param[0] == attribute_key:
                        param[2] = new_value

                # 写回 db.json 文件
                with open(SCENARIO_FILE_PATH, 'w', encoding='utf-8') as file:
                    json.dump(scenarios, file, ensure_ascii=False, indent=2)

                # 返回更新后的场景数据
                return jsonify({"message": "更新成功", "updatedScenario": scenario}), 200
            else:
                return jsonify({"message": "未找到对应的实体"}), 404
        else:
            return jsonify({"message": "未找到对应的场景"}), 404
    except Exception as e:
        return jsonify({"message": f"更新失败: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)