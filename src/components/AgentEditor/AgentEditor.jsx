import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StateVector from './StateVector';
import ActionSpace from './ActionSpace';
import RewardFunction from "./RewardFunction";
import ModelFunction from './ModelButton';
import entityAssignmentStore from './EntityAssignmentStore';
import './AgentEditor.css';

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [selectedActionTypes, setSelectedActionTypes] = useState([]);
    const [selectedParams, setSelectedParams] = useState([]);

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const response = await fetch(__APP_CONFIG__.scenarios, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setScenarios(data);
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
                setSelectedParams(selectedRole ? selectedRole.RewardParams : []);
            } else {
                setSelectedEntities([]);
                setSelectedActionTypes([]);
                setSelectedParams([]);
            }
        };

        updateSelectedEntities();
        const unsubscribe = entityAssignmentStore.subscribe(updateSelectedEntities);
        return () => unsubscribe();
    }, [scenarios]);

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} />
            <div className="gradient-box">
                <StateVector entities={selectedEntities} />
                <ActionSpace entities={selectedEntities} actionTypes={selectedActionTypes} />
                <RewardFunction selectedParams={selectedParams} />
                <ModelFunction scenarios={scenarios} />
            </div>
        </div>
    );
};

export default AgentEditor;