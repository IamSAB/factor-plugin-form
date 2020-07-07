import { applyFilters } from "@factor/api"

export interface InputType {
  name: string,
  label?: string,
  placeholder?: string,
  attrs: string[]
}

export interface InputAttr {
  name: string,
  label?: string,
  description?: string,
  list?: string[] | Record<string,any>
  settings?: Array<Record<string,any>>
}

export const inputTypes: InputType[] = applyFilters("plugin-form-input-types", [
  {
    name: "text",
    attrs: [ "placeholder"]
  },
  {
    name: "textarea",
    attrs: [ "placeholder"]
  },
  {
    name: "email",
    attrs: [ "placeholder"]
  },
  {
    name: "phone",
    attrs: [ "placeholder"]
  },
  {
    name: "editor",
    attrs: []
  },
  {
    name: "tags",
    attrs: ["list"]
  },
  {
    name: "select",
    attrs: ["placeholder", "list"]
  },
  {
    name: "date",
    attrs: []
  },
  {
    name: "sortable",
    attrs: ["itemLabel", "settings"]
  }
])

export const inputAttrs = applyFilters("plugin-form-input-attrs", [
  {
    name: "placeholder",
    input: "text",
    label: "Placeholder",
  },
  {
    name: "list",
    input: "list",
    label: "List",
  },
  {
    name: "settings",
    input: "fields",
    label: "Fields",
  },
  {
    name: "itemLabel",
    input: "text",
    label: "Item Label",
  }
])

export const templateSettings = [
  {
    _id: "title",
    input: "text",
    label: "Title of the send email"
  },
  {
    _id: "notifyTo",
    input: "text",
    label: "Notify To",
    description: "Choose which field you want to use to send a notificaiton email.",
    required: true,
  },
  {
    _id: "fields",
    input: "fields",
    label: "Fields",
    description: "Add fields to your form."
  }
]