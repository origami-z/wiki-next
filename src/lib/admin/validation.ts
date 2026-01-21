/**
 * Validation Logic for Admin Forms
 * Validates entity data against schema definitions
 */

import type {
  EntitySchema,
  SchemaField,
  ValidationError,
  FieldValidation,
} from '@/types/admin';

/**
 * Validate a single field value against its schema definition
 */
function validateField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, type, required, label, validation } = field;

  // Check required fields
  if (required && (value === undefined || value === null || value === '')) {
    return {
      field: name,
      message: `${label} is required`,
    };
  }

  // Skip validation if value is empty and field is not required
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // Type-specific validation
  switch (type) {
    case 'string':
    case 'text':
    case 'url':
      return validateStringField(field, value);

    case 'number':
      return validateNumberField(field, value);

    case 'boolean':
      return validateBooleanField(field, value);

    case 'select':
      return validateSelectField(field, value);

    case 'multiselect':
      return validateMultiSelectField(field, value);

    case 'array':
      return validateArrayField(field, value);

    case 'date':
      return validateDateField(field, value);

    default:
      return null;
  }
}

/**
 * Validate string fields
 */
function validateStringField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label, validation } = field;

  if (typeof value !== 'string') {
    return {
      field: name,
      message: `${label} must be a string`,
    };
  }

  if (validation) {
    // Min length validation
    if (validation.minLength && value.length < validation.minLength) {
      return {
        field: name,
        message: `${label} must be at least ${validation.minLength} characters`,
      };
    }

    // Max length validation
    if (validation.maxLength && value.length > validation.maxLength) {
      return {
        field: name,
        message: `${label} must be at most ${validation.maxLength} characters`,
      };
    }

    // Pattern validation
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return {
          field: name,
          message: `${label} format is invalid`,
        };
      }
    }

    // Custom validation
    if (validation.custom) {
      const result = validation.custom(value);
      if (result !== true && typeof result === 'string') {
        return {
          field: name,
          message: result,
        };
      }
    }
  }

  // URL-specific validation
  if (field.type === 'url') {
    try {
      // Allow relative URLs starting with /
      if (!value.startsWith('/')) {
        new URL(value);
      }
    } catch {
      return {
        field: name,
        message: `${label} must be a valid URL or relative path starting with /`,
      };
    }
  }

  return null;
}

/**
 * Validate number fields
 */
function validateNumberField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label, validation } = field;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    return {
      field: name,
      message: `${label} must be a number`,
    };
  }

  if (validation) {
    // Min value validation
    if (validation.min !== undefined && num < validation.min) {
      return {
        field: name,
        message: `${label} must be at least ${validation.min}`,
      };
    }

    // Max value validation
    if (validation.max !== undefined && num > validation.max) {
      return {
        field: name,
        message: `${label} must be at most ${validation.max}`,
      };
    }

    // Custom validation
    if (validation.custom) {
      const result = validation.custom(num);
      if (result !== true && typeof result === 'string') {
        return {
          field: name,
          message: result,
        };
      }
    }
  }

  return null;
}

/**
 * Validate boolean fields
 */
function validateBooleanField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label } = field;

  if (typeof value !== 'boolean') {
    return {
      field: name,
      message: `${label} must be true or false`,
    };
  }

  return null;
}

/**
 * Validate select fields
 */
function validateSelectField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label, options } = field;

  if (typeof value !== 'string') {
    return {
      field: name,
      message: `${label} must be a string`,
    };
  }

  if (options && !options.some((opt) => opt.value === value)) {
    return {
      field: name,
      message: `${label} must be one of the available options`,
    };
  }

  return null;
}

/**
 * Validate multiselect fields
 */
function validateMultiSelectField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label, options } = field;

  if (!Array.isArray(value)) {
    return {
      field: name,
      message: `${label} must be an array`,
    };
  }

  if (options) {
    const validValues = options.map((opt) => opt.value);
    for (const item of value) {
      if (!validValues.includes(item)) {
        return {
          field: name,
          message: `${label} contains invalid option: ${item}`,
        };
      }
    }
  }

  return null;
}

/**
 * Validate array fields
 */
function validateArrayField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label } = field;

  // Accept both arrays and objects (for nested structures)
  if (!Array.isArray(value) && typeof value !== 'object') {
    return {
      field: name,
      message: `${label} must be an array or object`,
    };
  }

  return null;
}

/**
 * Validate date fields
 */
function validateDateField(
  field: SchemaField,
  value: any
): ValidationError | null {
  const { name, label } = field;

  if (typeof value !== 'string') {
    return {
      field: name,
      message: `${label} must be a date string`,
    };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      field: name,
      message: `${label} must be a valid date`,
    };
  }

  return null;
}

/**
 * Validate an entire entity against its schema
 */
export function validateEntity(
  schema: EntitySchema,
  data: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate each field in the schema
  for (const field of schema.fields) {
    // Skip conditional fields that shouldn't be shown
    if (field.showWhen && !field.showWhen(data)) {
      continue;
    }

    const value = data[field.name];
    const error = validateField(field, value);

    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Check if slug is unique in the entity collection
 */
export function validateUniqueSlug(
  slug: string,
  entityData: any[],
  currentEntityId?: string
): boolean {
  return !entityData.some(
    (entity) => entity.slug === slug && entity.id !== currentEntityId
  );
}

/**
 * Check if ID is unique in the entity collection
 */
export function validateUniqueId(
  id: string,
  entityData: any[],
  currentEntityId?: string
): boolean {
  return !entityData.some((entity) => entity.id === id && entity.id !== currentEntityId);
}

/**
 * Validate that required relationships exist
 */
export function validateRelationships(
  data: Record<string, any>,
  schema: EntitySchema,
  relatedData: Record<string, any[]>
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check fields that reference other entities
  for (const field of schema.fields) {
    if (field.type === 'array' && data[field.name]) {
      const value = data[field.name];

      // Check if this looks like an array of IDs (e.g., skills, synergies)
      if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
        // Try to determine the related entity type from field name
        const relatedType = field.name.replace(/s$/, ''); // Remove trailing 's'

        if (relatedData[relatedType]) {
          const validIds = relatedData[relatedType].map((entity) => entity.id);

          for (const id of value) {
            if (!validIds.includes(id)) {
              errors.push({
                field: field.name,
                message: `${field.label} contains invalid reference: ${id}`,
              });
            }
          }
        }
      }
    }
  }

  return errors;
}
