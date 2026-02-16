import { FieldConfig } from "../types/fields";

// API base URL
const API_URL = "http://localhost:3000";

// Detect environment
const isDev = import.meta.env.MODE === "development";

// LocalStorage helpers
const getFieldsFromStorage = (): FieldConfig[] => {
  const data = localStorage.getItem("fields");
  return data ? JSON.parse(data) : [];
};

const saveFieldsToStorage = (fields: FieldConfig[]) => {
  localStorage.setItem("fields", JSON.stringify(fields));
};

export const FieldStore = {
  // Get all fields
  getFields: async (): Promise<FieldConfig[]> => {
    if (isDev) {
      try {
        const response = await fetch(`${API_URL}/fields`);
        if (!response.ok) throw new Error("Failed to fetch fields");
        return await response.json();
      } catch (error) {
        console.error("Error fetching fields:", error);
        return [];
      }
    }

    // Production → localStorage
    return getFieldsFromStorage();
  },

  // Replace all fields
  setFields: async (fields: FieldConfig[]): Promise<void> => {
    if (isDev) {
      await fetch(`${API_URL}/fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      return;
    }

    saveFieldsToStorage(fields);
  },

  // Add a field
  addField: async (field: FieldConfig): Promise<void> => {
    if (isDev) {
      await fetch(`${API_URL}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(field),
      });
      return;
    }

    const fields = getFieldsFromStorage();
    fields.push(field);
    saveFieldsToStorage(fields);
  },

  // Remove a field
  removeField: async (fieldId: string): Promise<void> => {
    if (isDev) {
      await fetch(`${API_URL}/fields/${fieldId}`, {
        method: "DELETE",
      });
      return;
    }

    let fields = getFieldsFromStorage();
    fields = fields.filter((f) => f.id !== fieldId);
    saveFieldsToStorage(fields);
  },

  // Update a field
  updateField: async (
    fieldId: string,
    updates: Partial<FieldConfig>
  ): Promise<void> => {
    if (isDev) {
      await fetch(`${API_URL}/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return;
    }

    let fields = getFieldsFromStorage();
    fields = fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    saveFieldsToStorage(fields);
  },

  // Reset to default fields
  resetToDefault: async (): Promise<void> => {
    const DEFAULT_FIELDS: FieldConfig[] = [
      {
        id: "firstName",
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "Enter first name",
      },
      {
        id: "lastName",
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Enter last name",
      },
      {
        id: "phoneNumber",
        name: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "+1 (555) 000-0000",
      },
      {
        id: "email",
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "example@email.com",
      },
    ];

    if (isDev) {
      // Delete existing
      const existing = await FieldStore.getFields();
      await Promise.all(
        existing.map((f) => FieldStore.removeField(f.id))
      );

      // Add defaults
      await Promise.all(
        DEFAULT_FIELDS.map((f) => FieldStore.addField(f))
      );
      return;
    }

    // Production → localStorage
    saveFieldsToStorage(DEFAULT_FIELDS);
  },
};
