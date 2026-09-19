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
  id: number;
  [field: string]: unknown;
};

export type ListSection = {
  id: string;
  title: string;
  comment?: string;
  items: ListItem[];
};

export type List = {
  id: number;
  metadata: {
    name: string;
    comment?: string;
  };
  itemDefinition: ListField[];
  sections: ListSection[];
};

export type ObjectSnapshot<T> = {
  data: T;
  name: string;
  sha: string;
  syncDate: Date;
  lastModified: Date;
};


export type PageEditData = Omit<List, 'sections'>;

