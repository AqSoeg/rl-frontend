// ActionSpaceStore.js
import { makeAutoObservable, reaction } from 'mobx';
import sidebarStore from './SidebarStore';

class ActionSpaceStore {
    actionSpaces = {}; // 存储每个实体的动作空间信息
    isSingleAgent = false; // 是否选择了单智能体

    constructor() {
        makeAutoObservable(this);

        // 监听 SidebarStore 中的智能体类型变化
        reaction(
            () => sidebarStore.type,
            (type) => {
                this.isSingleAgent = type === '单智能体';
                if (!this.isSingleAgent) {
                    this.clearActionSpaces(); // 如果不是单智能体，清空记录
                }
            }
        );
    }

    // 更新动作空间信息
    updateActionSpace(entityName, actionIndex, actionName, actionType, options, meaning, ruleType, condition1, condition2, execution1, execution2) {
        if (!this.isSingleAgent) return; // 如果不是单智能体，不记录

        if (!this.actionSpaces[entityName]) {
            this.actionSpaces[entityName] = [];
        }

        this.actionSpaces[entityName][actionIndex] = {
            actionName,
            actionType,
            options,
            meaning,
            ruleType,
            condition1,
            condition2,
            execution1,
            execution2,
        };
    }

    // 清空动作空间信息
    clearActionSpaces() {
        this.actionSpaces = {};
    }

    // 获取所有动作空间信息
    getActionSpaces() {
        return this.actionSpaces;
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;