export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum";

export type ListField = {
  name: string;
  type: FieldType;
  comment?: string;
};

export type ListItem = {
  [field: string]: unknown;
};

export type ListSection = {
  id: string;
  title: string;
  comment?: string;
  itemDefinition: ListField[];
  items: ListItem[];
};

export type List = {
  metadata: {
    name: string;
    comment?: string;
  };

  sections: ListSection[];
};