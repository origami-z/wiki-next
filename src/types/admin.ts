/**
 * Admin System Type Definitions
 * Schema-based dynamic form generation for entity management
 */

/**
 * Field types supported by the admin form system
 */
export type SchemaFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'array'
  | 'text'
  | 'url'
  | 'date';

/**
 * Validation rules for schema fields
 */
export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => boolean | string;
}

/**
 * Option for select/multiselect fields
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Schema field definition
 */
export interface SchemaField {
  name: string;
  type: SchemaFieldType;
  required: boolean;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: SelectOption[];
  validation?: FieldValidation;
  dependsOn?: string;  // Field name this depends on
  showWhen?: (formData: any) => boolean;  // Conditional display
}

/**
 * Entity schema for dynamic form generation
 */
export interface EntitySchema {
  entityType: string;
  label: string;
  pluralLabel: string;
  fields: SchemaField[];
  displayField: string;  // Field to show in lists
  slugField: string;     // Field used for URL slug
  searchFields?: string[];  // Fields to search in
  sortField?: string;    // Default sort field
  sortOrder?: 'asc' | 'desc';
}

/**
 * Game schema collection
 */
export interface GameSchemas {
  gameId: string;
  gameSlug: string;
  gameName: string;
  entities: Record<string, EntitySchema>;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

/**
 * Entity CRUD operation types
 */
export type EntityOperation = 'list' | 'get' | 'create' | 'update' | 'delete';

/**
 * Entity list filters
 */
export interface EntityListFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
