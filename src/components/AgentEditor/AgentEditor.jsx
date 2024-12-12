import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StateVector from './StateVector';
import ActionSpace from './ActionSpace';
import RewardFunction from './RewardFunction';
import ModelFunction from "./ModelButton.jsx";
import './AgentEditor.css';
import {observer} from "mobx-react";
import scenarioStore from "../../store/ScenarioStore.js";

const AgentEditor = observer(({ scenarios }) => {
    return (
        <div className="container">
            <Sidebar scenarios={scenarios} scenarioStore={scenarioStore}/>
            <div className="gradient-box">
                {/*<StateVector simulation={mockState} />*/}
                {/*<ActionSpace mockAction={mockAction} />*/}
                {/*<RewardFunction mockReward={mockReward} />*/}
                <ModelFunction />
            </div>
        </div>
    );
});

export default AgentEditor;