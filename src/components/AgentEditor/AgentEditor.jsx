import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import StateVector from './StateVector.jsx';
import ActionSpace from './ActionSpace.jsx';
import ModelFunction from './ModelButton.jsx';
import './AgentEditor.css';
import entityAssignmentStore from './EntityAssignmentStore';
import RewardFunction from "./RewardFunction.jsx";

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [selectedActionTypes, setSelectedActionTypes] = useState([]);
    const [selectedParams, setSelectedParams] = useState([]); // 新增：选中的 params

    useEffect(() => {
        entityAssignmentStore.clearAssignment();
    }, []);

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const response = await axios.get('http://localhost:3000/scenarios');
                setScenarios(response.data);
            } catch (error) {
                console.error('Error fetching scenarios:', error);
            }
        };

        fetchScenarios();
    }, []);

    useEffect(() => {
        const updateSelectedEntities = () => {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            if (selectedAgent) {
                const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
                const fullEntities = scenarios
                    .flatMap(scenario => scenario.roles)
                    .flatMap(role => role.entities)
                    .filter(entity => assignedEntities.includes(entity.name));
                setSelectedEntities(fullEntities);

                const selectedRole = scenarios
                    .flatMap(scenario => scenario.roles)
                    .find(role => role.entities.some(entity => assignedEntities.includes(entity.name)));
                setSelectedActionTypes(selectedRole ? selectedRole.actionTypes : []);
                setSelectedParams(selectedRole ? selectedRole.params : []); // 新增：设置选中的 params
            } else {
                setSelectedEntities([]);
                setSelectedActionTypes([]);
                setSelectedParams([]); // 新增：清空选中的 params
            }
        };

        updateSelectedEntities();
        const unsubscribe = entityAssignmentStore.subscribe(updateSelectedEntities);
        return () => unsubscribe();
    }, [scenarios]);

    const handleEntitiesChange = (entities) => {
        setSelectedEntities(entities);
    };

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} onEntitiesChange={handleEntitiesChange} />
            <div className="gradient-box">
                <StateVector entities={selectedEntities} />
                <ActionSpace entities={selectedEntities} actionTypes={selectedActionTypes} />
                <RewardFunction selectedParams={selectedParams} /> {/* 新增：传递 selectedParams */}
                <ModelFunction scenarios={scenarios} />
            </div>
        </div>
    );
};

export default AgentEditor;