import { FieldConfig } from '../types/fields';

// API base URL
const API_URL ='http://localhost:3000';

export const FieldStore = {
  // Get all configured fields
  getFields: async (): Promise<FieldConfig[]> => {
    try {
      console.log('🔍 Fetching fields from:', `${API_URL}/fields`);
      const response = await fetch(`${API_URL}/fields`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fields: ${response.status} ${response.statusText}`);
      }
      
      const fields = await response.json();
      console.log('✅ Fetched fields:', fields);
      return fields;
    } catch (error) {
      console.error('❌ Error reading fields from db.json:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  },

  // Set all fields
  setFields: async (fields: FieldConfig[]): Promise<void> => {
    try {
      // Since json-server doesn't have a direct "replace all" endpoint,
      // we need to delete all existing fields and create new ones
      // Or use a custom endpoint if available
      
      // For simplicity with json-server, we'll update the entire db
      const response = await fetch(`${API_URL}/fields`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fields),
      });

      if (!response.ok) {
        throw new Error('Failed to save fields');
      }
    } catch (error) {
      console.error('Error saving fields to db.json:', error);
      throw error;
    }
  },

  // Add a new field
  addField: async (field: FieldConfig): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(field),
      });

      if (!response.ok) {
        throw new Error('Failed to add field');
      }
    } catch (error) {
      console.error('Error adding field:', error);
      throw error;
    }
  },

  // Remove a field by id
  removeField: async (fieldId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/fields/${fieldId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove field');
      }
    } catch (error) {
      console.error('Error removing field:', error);
      throw error;
    }
  },

  // Update a field
  updateField: async (fieldId: string, updates: Partial<FieldConfig>): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/fields/${fieldId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update field');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  },

  // Reset to default fields
  resetToDefault: async (): Promise<void> => {
    const DEFAULT_FIELDS: FieldConfig[] = [
      {
        id: 'firstName',
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'Enter first name',
        validation: {
          minLength: 2,
          maxLength: 50,
        },
      },
      {
        id: 'lastName',
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Enter last name',
        validation: {
          minLength: 2,
          maxLength: 50,
        },
      },
      {
        id: 'phoneNumber',
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        placeholder: '+1 (555) 000-0000',
        validation: {
          pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$',
        },
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'example@email.com',
      },
    ];

    // Delete all existing fields and add defaults
    try {
      const existingFields = await FieldStore.getFields();
      
      // Delete all existing fields
      await Promise.all(
        existingFields.map(field => FieldStore.removeField(field.id))
      );

      // Add default fields
      await Promise.all(
        DEFAULT_FIELDS.map(field => FieldStore.addField(field))
      );
    } catch (error) {
      console.error('Error resetting to default:', error);
      throw error;
    }
  },
};