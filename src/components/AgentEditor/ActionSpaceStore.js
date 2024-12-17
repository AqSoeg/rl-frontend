// ActionSpaceStore.js
import { observable, action, makeObservable } from 'mobx';

class ActionSpaceStore {
    actionSpaces = observable.array([]); // 动态存储每个下拉框的状态

    constructor() {
        makeObservable(this, {
            actionSpaces: observable,
            initializeActionSpaces: action,
            toggleVisibility: action,
            toggleRuleVisibility: action,
            setSelectedOption: action,
            setMeaning: action,
            setRuleType: action,
            setCondition1: action,
            setCondition2: action,
            setExecution1: action,
            setExecution2: action,
            resetSelection: action,
        });
    }

    initializeActionSpaces(count) {
        // 根据下拉框的数量初始化状态
        this.actionSpaces.replace(
            Array.from({ length: count }, () => ({
                visible: false,
                ruleVisible: false,
                selectedOption: null,
                meaning: '',
                ruleType: null,
                condition1: '',
                condition2: '',
                execution1: '',
                execution2: '',
            }))
        );
    }

    toggleVisibility(index) {
        // 切换指定下拉框的可见性
        this.actionSpaces[index].visible = !this.actionSpaces[index].visible;
    }

    toggleRuleVisibility(index) {
        // 切换指定下拉框的规则可见性
        this.actionSpaces[index].ruleVisible = !this.actionSpaces[index].ruleVisible;
    }

    setSelectedOption(index, option) {
        // 设置指定下拉框的选中选项
        this.actionSpaces[index].selectedOption = option;
    }

    setMeaning(index, meaning) {
        // 设置指定下拉框的含义
        this.actionSpaces[index].meaning = meaning;
    }

    setRuleType(index, ruleType) {
        // 设置指定下拉框的规则类型
        this.actionSpaces[index].ruleType = ruleType;
    }

    setCondition1(index, value) {
        // 设置指定下拉框的条件1
        this.actionSpaces[index].condition1 = value;
    }

    setCondition2(index, value) {
        // 设置指定下拉框的条件2
        this.actionSpaces[index].condition2 = value;
    }

    setExecution1(index, value) {
        // 设置指定下拉框的执行内容1
        this.actionSpaces[index].execution1 = value;
    }

    setExecution2(index, value) {
        // 设置指定下拉框的执行内容2
        this.actionSpaces[index].execution2 = value;
    }

    resetSelection(index) {
        // 重置指定下拉框的选中状态
        this.actionSpaces[index].selectedOption = null;
        this.actionSpaces[index].meaning = '';
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;