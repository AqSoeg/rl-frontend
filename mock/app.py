from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
import threading
import time
import datetime

app = Flask(__name__)
CORS(app)
MODEL_FILE_PATH = 'mock/model.json'
ALGORITHM_FILE_PATH = 'mock/train.json'
DATASET_FILE_PATH = 'mock/dataset.json'
SCENARIO_FILE_PATH = 'mock/db.json'
DECISION_FILE_PATH = 'mock/dc.json'
EVALUATE_FILE_PATH = 'mock/evaluatetable.json'
EVALUATION_DATA_PATH = 'mock/dc.json'
EVALUATION_RESULT_PATH = 'mock/evaluation_result.json'
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
    try:
        with open(EVALUATION_DATA_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        print(f'Error reading evaluation data: {str(e)}')
        return jsonify({'error': 'Failed to read evaluation data'}), 500

@app.route('/startEvaluation', methods=['POST'])
def start_evaluation():
    try:
        data = request.json
        evaluation_type = data.get('evaluationType')
        evaluation_data = data.get('evaluationData', {})

        if evaluation_type == '在线评估':
            model_id = evaluation_data.get('modelId')
            print(f"Starting online evaluation for model: {model_id}")
        else:
            print("离线评估模式：\n验证基础结构，验证模型信息、验证场景信息、验证智能体信息、验证训练信息•••\n验证成功！")
            print("Starting offline evaluation with data:", evaluation_data)

        return '数据发送成功，后台正在评估中•••'

    except Exception as e:
        print(f'Error during evaluation: {str(e)}')
        return '数据发送失败，请检查网络连接！'

@app.route('/loadEvaluationResult', methods=['POST'])
def load_evaluation_result():
    try:
        data = request.json
        model_id = data.get('modelId')
        evaluation_type = data.get('evaluationType')

        with open(EVALUATION_RESULT_PATH, 'r', encoding='utf-8') as file:
            results = json.load(file)

        result = next((item for item in results if item['modelID'] == model_id), None)
        if not result:
            return jsonify({'error': 'Evaluation result not found for model ID'}), 404

        return jsonify({
            'chart_data': result['chart_data'],
            'event_data': result['event_data'],
            'radar_chart_data': result['radar_chart_data'],
            'eval_score': result['eval_score'],
            'eval_suggestion': result['eval_suggestion']
        })
    except Exception as e:
        print(f'Error loading evaluation result: {str(e)}')
        return jsonify({'error': 'Failed to load evaluation result'}), 500

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
                trained_model = {
                    "AGENT_MODEL_ID": str(int(time.time())),
                    "AGENT_NAME": data.get('agentInfo', {}).get('agentName', 'Unknown'),
                    "SCENARIO_NAME": data.get('scenarioEditInfo', {}).get('scenarioName', 'Unknown'),
                    "ROLE_NAME": data.get('agentInfo', {}).get('agentRoleID', 'Unknown'),
                    "AGENT_MODEL_VERSION": "1.0",
                    "NN_MODEL_TYPE": data.get('algorithmInfo', {}).get('algorithmType', 'Unknown'),
                    "MODEL_PATH": model_path,
                    "IMG_URL": "http://example.com/image",
                    "CREAT_TIME": datetime.datetime.now().isoformat(),
                    "STATE":"未发布",
                }
                with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                existing_data.append(trained_model)
                with open(DECISION_FILE_PATH, 'w', encoding='utf-8') as f:
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
        with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as f:
            decision_models = json.load(f)
        model = next((m for m in decision_models if m['model']['id'] == decision_model_id), None)
        if model:
            return jsonify({"status": "success", "img_url": model['model']['img_url']})
        else:
            return jsonify({"status": "error", "message": "Model not found"}), 404
    except Exception as e:
        print(f'Error getting effect image: {str(e)}')
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/publish_model', methods=['POST'])
def publish_model():
    data = request.json
    decision_model_id = data.get('decisionModelID')
    try:
        with open(DECISION_FILE_PATH, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        model_found = False
        for model in existing_data:
            if model['model']['id'] == decision_model_id:
                model['model']['state'] = '已发布'  # 更新状态为已发布
                model_found = True
                break

        # 保存更新后的数据
        with open(DECISION_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        
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
            return jsonify({'status': 'error', 'message': 'Invalid search type'})
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        filtered_data = []
        for item in existing_data:
            if field in item and str(item[field]).find(str(value)) != -1:
                filtered_data.append(item)
        return jsonify(filtered_data)
    except Exception as e:
        print(f'Error searching: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)})

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
        elif search_type == 'evaluate':
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
            existing_data = [item for item in existing_data if item.get('AGENT_MODEL_ID') != item_id]
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
        elif search_type == 'evaluate':
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
            elif update_type == 'decision' and item.get('AGENT_MODEL_ID') == item_id:
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
            id_field = 'AGENT_MODEL_ID'
        elif add_type == 'model':
            file_path = MODEL_FILE_PATH
            id_field = 'agentID'
        else:
            return jsonify({'status': 'error', 'message': 'Invalid add type'}), 400
        with open(file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
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
    
    return jsonify({
        "status": "success",
        "img_url": f"mock/scenarios/{scenario_id}.jpeg"  # 或者返回完整的URL
    })

@app.route('/get_process_data', methods=['POST'])
def get_process_data():
    data = request.get_json()
    agent_id = data.get('agentId')
    scenario_id = data.get('scenarioId')
    
    if not agent_id or not scenario_id:
        return jsonify({"status": "error", "message": "Missing parameters"}), 400

    animation_url = f"mock/process/{scenario_id}_{agent_id}.webp"
    
    return jsonify({
        "status": "success",
        "animationUrl": animation_url
    })
if __name__ == '__main__':
    app.run(port=5000, debug=True)