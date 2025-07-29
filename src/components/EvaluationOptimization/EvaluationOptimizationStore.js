import { makeAutoObservable } from 'mobx';

class EvaluationOptimizationStore {
  charts = [];
  events = [];
  radarImage = null;
  dataLoaded = false;
  evalScore = undefined;
  evalSuggestion = [];
  sidebarData = {
    evaluateDataInfo: {},
    scenarioInfo: {},
    modelInfo: {},
    algorithmInfo: {}
  };
  chartSelections = [
    { content: '', shape: '' },
    { content: '', shape: '' },
    { content: '', shape: '' },
    { content: '', shape: '' },
  ];
  chartOptions = [];
  selectedLegends = {};
  isDataModalVisible = false;
  isDetailModalVisible = false;
  isModelListModalVisible = false;
  isEffectImageModalVisible = false;
  isModelInfoModalVisible = false;
  isEpisodesModalVisible = false;
  effectImageUrl = null;
  evaluationData = [];
  selectedModel = null;
  decisionModels = [];
  currentModel = null;
  selectedSubModel = null;
  episodes = 100;

  constructor() {
    makeAutoObservable(this);
  }

  handleContentChange(index, value) {
    const newSelections = [...this.chartSelections];
    newSelections[index] = { content: value, shape: '' };
    this.setChartSelections(newSelections);
  }

  handleShapeChange(index, value) {
    const newSelections = [...this.chartSelections];
    newSelections[index].shape = value;
    this.setChartSelections(newSelections);
  }

  setCharts(charts) {
    this.charts = charts;
  }

  setEvents(events) {
    this.events = events;
  }

  setRadarImage(radarImage) {
    this.radarImage = radarImage;
  }

  setDataLoaded(dataLoaded) {
    this.dataLoaded = dataLoaded;
  }

  setEvalScore(evalScore) {
    this.evalScore = evalScore;
  }

  setEvalSuggestion(evalSuggestion) {
    this.evalSuggestion = evalSuggestion;
  }

  setSidebarData(sidebarData) {
    this.sidebarData = sidebarData;
  }

  setChartSelections(chartSelections) {
    this.chartSelections = chartSelections;
  }

  setChartOptions(chartOptions) {
    this.chartOptions = chartOptions;
  }

  setSelectedLegends(selectedLegends) {
    this.selectedLegends = selectedLegends;
  }

  setIsDataModalVisible(isDataModalVisible) {
    this.isDataModalVisible = isDataModalVisible;
  }

  setIsDetailModalVisible(isDetailModalVisible) {
    this.isDetailModalVisible = isDetailModalVisible;
  }

  setIsModelListModalVisible(isModelListModalVisible) {
    this.isModelListModalVisible = isModelListModalVisible;
  }

  setIsEffectImageModalVisible(isEffectImageModalVisible) {
    this.isEffectImageModalVisible = isEffectImageModalVisible;
  }

  setIsModelInfoModalVisible(isModelInfoModalVisible) {
    this.isModelInfoModalVisible = isModelInfoModalVisible;
  }

  setIsEpisodesModalVisible(isEpisodesModalVisible) {
    this.isEpisodesModalVisible = isEpisodesModalVisible;
  }

  setEffectImageUrl(effectImageUrl) {
    this.effectImageUrl = effectImageUrl;
  }

  setEvaluationData(evaluationData) {
    this.evaluationData = evaluationData;
  }

  setSelectedModel(selectedModel) {
    this.selectedModel = selectedModel;
  }

  setDecisionModels(decisionModels) {
    this.decisionModels = decisionModels;
  }

  setCurrentModel(currentModel) {
    this.currentModel = currentModel;
  }

  setSelectedSubModel(selectedSubModel) {
    this.selectedSubModel = selectedSubModel;
  }

  setEpisodes(episodes) {
    this.episodes = episodes;
  }

  resetRightPanel() {
    this.charts = [];
    this.events = [];
    this.radarImage = null;
    this.evalScore = undefined;
    this.evalSuggestion = [];
    this.chartSelections = [
      { content: '', shape: '' },
      { content: '', shape: '' },
      { content: '', shape: '' },
      { content: '', shape: '' },
    ];
    this.chartOptions = [];
    this.selectedLegends = {};
  }
}

export default new EvaluationOptimizationStore();