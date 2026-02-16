export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';

export interface FieldConfig {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface User {
  id: string;
  [key: string]: any;
}

// Default fields that come with the application
export const DEFAULT_FIELDS: FieldConfig[] = [
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