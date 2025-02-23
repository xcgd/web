/** @odoo-module **/

import { Component, onMounted, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { useService } from "@web/core/utils/hooks";
import {
  DEFAULT_TIME_FORMAT,
  CAPTION_TYPE_MAPPING,
  processTaskData,
} from "./jsgantt_utils.esm";

const JSGantt = window.JSGantt;

export class JSGanttWidget extends Component {
  setup() {
    this.ganttDiv = useRef("jsgantt-div");
    this.orm = useService("orm");
    this.actionService = useService("action");
    this.chart = null;

    onMounted(() => {
      this.setupChart();
      this.setTasks();
      this.chart.Draw();
      this.applyHoverCursor(); // Apply cursor styling after rendering
    });
  }

  get records() {
    return this.props.record.data[this.props.name]?.records || [];
  }

  setupChart() {
    const timeFormat = this.props.timeFormat || DEFAULT_TIME_FORMAT;
    this.chart = new JSGantt.GanttChart(this.ganttDiv.el, timeFormat);

    const showDuration = this.props.showDuration !== false;
    this.chart.setShowDur(Number(showDuration));
    this.chart.setShowTaskInfoDur(Number(showDuration));

    const captionType = CAPTION_TYPE_MAPPING[this.props.captionType];
    if (captionType !== undefined) this.chart.setCaptionType(captionType);

    const lang = this.env.services.user.lang;
    this.chart.setLang(lang);

    // Set up click event handler to open project.task records
    // Note: As this widget is designed to work with project.task records,
    // we set up a click event handler on each Gantt chart row. When a
    // user clicks a row representing a task record, we call doAction to
    // open the form view of the corresponding project.task record.
    this.chart.setEventClickRow((task) => this.openTaskRecord(task));
  }

  applyHoverCursor() {
    // Add CSS to change cursor to pointer on hover over task bars and rows
    const style = document.createElement("style");
    style.textContent = `
            .gtaskbarcontainer:hover,
            .gname:hover {
                cursor: pointer;
            }
        `;
    document.head.appendChild(style);
  }

  async openTaskRecord(task) {
    // JSGantt applies an offset (default 1000000) to task IDs.
    // Subtract this offset to get the actual project.task res_id.
    const offset = this.props.taskIdOffset || 1000000;
    const resId = parseInt(task.getOriginalID(), 10) - offset;

    await this.actionService.doAction({
      type: "ir.actions.act_window",
      res_model: "project.task", // Hardcode to project.task
      res_id: resId,
      views: [[false, "form"]], // Open in form view
      target: "current", // Open in the current window
      context: {
        create: false,
        edit: false,
      },
    });
  }

  setTasks() {
    if (!this.records.length) return;

    const taskMap = new Map();
    this.records.forEach((record) => {
      taskMap.set(record.resId, record);
    });

    for (const record of this.records) {
      const task = processTaskData(record);
      // Validate and fix pParent
      if (task.pParent && !taskMap.has(task.pParent)) {
        console.warn(
          `Task ${task.pID} has invalid parent ID ${task.pParent}, setting to 0`,
        );
        task.pParent = 0; // Default to root level if parent doesn't exist
      }
      this.chart.AddTaskItemObject(task);
    }
  }
}

JSGanttWidget.template = "web_jsgantt.JSGanttWidget";
JSGanttWidget.props = {
  ...standardFieldProps,
  timeFormat: { type: String, optional: true },
  showDuration: { type: Boolean, optional: true },
  captionType: { type: String, optional: true },
  taskIdOffset: { type: Number, optional: true, default: 1000000 }, // New prop for task ID offset
};
JSGanttWidget.displayName = "JS Gantt";
JSGanttWidget.supportedTypes = ["many2many"];
JSGanttWidget.extractProps = ({ attrs }) => ({
  timeFormat: attrs.time_format,
  showDuration: attrs.show_duration !== "0" && attrs.show_duration !== "false",
  captionType: attrs.caption_type,
  taskIdOffset: attrs.task_id_offset
    ? parseInt(attrs.task_id_offset, 10)
    : undefined, // Extract offset from XML attribute
});

registry.category("fields").add("jsgantt", JSGanttWidget, {
  loadOnTypes: ["many2many"],
});
