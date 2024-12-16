import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import StateVector from './StateVector.jsx';
import ActionSpace from './ActionSpace.jsx';
import RewardFunction from "./RewardFunction.jsx";
import ModelFunction from './ModelButton.jsx';
import './AgentEditor.css';

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);

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

    const handleEntitiesChange = (entities) => {
        setSelectedEntities(entities);
    };

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} onEntitiesChange={handleEntitiesChange} />
            <div className="gradient-box">
                <StateVector entities={selectedEntities} />
                <ActionSpace entities={selectedEntities} />
                {/*<RewardFunction />*/}
                <ModelFunction />
            </div>
        </div>
    );
};

export default AgentEditor;