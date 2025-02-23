/** @odoo-module **/

import { Component, onMounted, onWillRender, useRef } from "@odoo/owl";

import {
  DEFAULT_TIME_FORMAT,
  FIELDS_MAPPING,
  FIELD_COLUMN_DISPLAY_FUNCTIONS,
  FIELD_TASK_INFO_DISPLAY_FUNCTIONS,
  FIELD_TRANSLATION_NAMES,
  CAPTION_TYPE_MAPPING,
  processTaskData,
} from "./jsgantt_utils.esm";

const JSGantt = window.JSGantt;

export class JSGanttRenderer extends Component {
  setup() {
    this.ganttDiv = useRef("jsgantt-div");
    this.chart = null;
    onMounted(() => {
      this.setupChart();
      this.setTasks();
      this.chart.Draw();
    });
    onWillRender(() => {
      this.updateChart();
    });
  }

  setupChart() {
    let timeFormat = this.props.archInfo.timeFormat;
    if (!timeFormat) {
      timeFormat = DEFAULT_TIME_FORMAT;
    }
    this.chart = new JSGantt.GanttChart(this.ganttDiv.el, timeFormat);
    this.chart.setEventClickRow((task) => this.rowClicked(task));
    const showDuration = this.props.archInfo.showDuration;
    this.chart.setShowDur(Number(showDuration));
    this.chart.setShowTaskInfoDur(Number(showDuration));
    const captionType = CAPTION_TYPE_MAPPING[this.props.archInfo.captionType];
    if (captionType !== undefined) {
      this.chart.setCaptionType(captionType);
    }
    // FIXME: use a cleaner way to set the language
    const lang = this.env.searchModel._context.lang.substring(0, 2);
    this.chart.setLang(lang);
    this.processFields(this.props.archInfo.fieldNodes, lang);
  }

  async rowClicked(task) {
    await this.props.openRecord({ resId: parseInt(task.getOriginalID(), 10) });
  }

  processFields(fieldNodes, lang) {
    const fieldsMapping = {};
    const defaultLangTerms = this.chart.vLangs[lang];
    const langTerms = {};
    if (defaultLangTerms !== undefined) {
      for (const [key, value] of Object.entries(defaultLangTerms)) {
        langTerms[key] = value;
      }
    }
    for (const field of Object.values(fieldNodes)) {
      this.processField(field, fieldsMapping, langTerms);
    }
    // Hide unused fields
    for (const [, mappingField] of FIELDS_MAPPING) {
      if (fieldsMapping[mappingField] === undefined) {
        this.setFieldVisible(mappingField, false);
      }
    }
    if (this.chart.vLang === "en") {
      // This is a workaround to allow to modify the english language
      // terms. Just calling setCustomLang() does not work because it
      // would start by deleting the current terms before iterating on
      // them.
      this.chart.vLang = "en_";
      this.chart.setCustomLang(langTerms);
      this.chart.vLangs.en = this.chart.vLangs.en_;
      delete this.chart.vLangs.en_;
      this.chart.vLang = "en";
    } else {
      this.chart.setCustomLang(langTerms);
    }
    this.fieldsMapping = fieldsMapping;
  }

  processField(field, fieldsMapping, langTerms) {
    const mapping = field.rawAttrs.mapping;
    if (mapping === undefined) {
      return;
    }
    fieldsMapping[mapping] = field.name;
    this.setFieldVisible(mapping, !field.modifiers.invisible);
    const fieldTranslationName = FIELD_TRANSLATION_NAMES[mapping];
    if (fieldTranslationName === undefined) {
      return;
    }
    if (Array.isArray(fieldTranslationName)) {
      for (const f of fieldTranslationName) {
        langTerms[f] = field.string;
      }
    } else {
      langTerms[fieldTranslationName] = field.string;
    }
  }

  setFieldVisible(mappingField, visible) {
    const colDisplayFunc = FIELD_COLUMN_DISPLAY_FUNCTIONS[mappingField];
    if (colDisplayFunc !== undefined) {
      this.chart[colDisplayFunc](Number(visible));
    }
    const taskInfoDisplayFunc = FIELD_TASK_INFO_DISPLAY_FUNCTIONS[mappingField];
    if (taskInfoDisplayFunc !== undefined) {
      this.chart[taskInfoDisplayFunc](Number(visible));
    }
  }

  setTasks() {
    for (const record of this.props.list.records) {
      const task = processTaskData(record, this.fieldsMapping);
      this.chart.AddTaskItemObject(task);
    }
  }

  updateChart() {
    if (this.chart === null) {
      return;
    }
    this.chart.ClearTasks();
    this.chart.Draw();
    this.setTasks();
    this.chart.Draw();
  }
}

JSGanttRenderer.template = "web_jsgantt.JSGanttRenderer";
