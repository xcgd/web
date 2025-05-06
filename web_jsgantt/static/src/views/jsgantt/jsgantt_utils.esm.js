/** @odoo-module **/

export const DEFAULT_TIME_FORMAT = "day";

export const FIELDS_MAPPING = [
  ["pName", "name"],
  ["pStart", "start_date"],
  ["pEnd", "end_date"],
  ["pPlanStart", "plan_start_date"],
  ["pPlanEnd", "plan_end_date"],
  ["pMile", "is_milestone", "integer"],
  ["pRes", "resource_id", "many2one_str"],
  ["pComp", "completion", "percent"],
  ["pGroup", "is_parent", "integer"],
  ["pParent", "parent_id", "many2one_id"],
  ["pOpen", "is_expanded", "integer"],
  ["pDepend", "dependency_ids", "many2many"],
  ["pClass", "class"],
  ["pCaption", "caption"],
  ["pNotes", "notes"],
  ["pCost", "cost"],
  ["pBarText", "bar_text"],
];

export const FIELD_COLUMN_DISPLAY_FUNCTIONS = {
  start_date: "setShowStartDate",
  end_date: "setShowEndDate",
  plan_start_date: "setShowPlanStartDate",
  plan_end_date: "setShowPlanEndDate",
  resource_id: "setShowRes",
  completion: "setShowComp",
  cost: "setShowCost",
};

export const FIELD_TASK_INFO_DISPLAY_FUNCTIONS = {
  start_date: "setShowTaskInfoStartDate",
  end_date: "setShowTaskInfoEndDate",
  resource_id: "setShowTaskInfoRes",
  completion: "setShowTaskInfoComp",
  notes: "setShowTaskInfoNotes",
};

export const FIELD_TRANSLATION_NAMES = {
  resource_id: "res",
  completion: ["comp", "completion"],
  start_date: "startdate",
  end_date: "enddate",
  plan_start_date: "planstartdate",
  plan_end_date: "planenddate",
  cost: "cost",
};

export const TASK_CLASSES = [
  "gtaskblue",
  "gtaskred",
  "gtaskgreen",
  "gtaskyellow",
  "gtaskpurple",
  "gtaskpink",
];

export const CAPTION_TYPE_MAPPING = {
  none: "None",
  caption: "Caption",
  resource_id: "Resource",
  duration: "Duration",
  completion: "Complete",
};

export const GROUP_TASK_CLASS = "ggroupblack";
export const MILESTONE_CLASS = "gmilestone";

export function processTaskData(record, fieldsMapping = {}) {
  const task = { pID: record.resId };
  for (const [jsTaskField, mappingField, fieldType] of FIELDS_MAPPING) {
    const fieldName = fieldsMapping[mappingField] || mappingField;
    let value = record.data[fieldName];
    if (value === undefined) continue;

    switch (fieldType) {
      case "many2one_str":
        value = value ? value[1] : "";
        break;
      case "many2one_id":
        value = value ? value[0] : 0;
        break;
      case "many2many":
        value = value.currentIds;
        break;
      case "percent":
        value *= 100;
        break;
      case "integer":
        value = Number(value);
        break;
      default:
        if (!value) value = "";
    }
    task[jsTaskField] = value;
  }

  if (task.pStart && !task.pEnd) {
    task.pEnd = task.pStart;
    task.pMile = 1;
  }

  task.pClass = (task.pClass) ? task.pClass : computeTaskClass(task);
  return task;
}

export function computeTaskClass(task) {
  if (task.pGroup > 0) {
    return GROUP_TASK_CLASS;
  } else if (task.pMile === 1) {
    return MILESTONE_CLASS;
  }
  return TASK_CLASSES[task.pID % TASK_CLASSES.length];
}
