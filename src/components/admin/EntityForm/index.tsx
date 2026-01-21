/**
 * Entity Form Component
 * Dynamic form generation based on entity schema
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { EntitySchema, SchemaField, ValidationError } from '@/types/admin';
import { JsonPreview } from '../JsonPreview';
import styles from './EntityForm.module.css';

interface EntityFormProps {
  gameSlug: string;
  entityType: string;
  schema: EntitySchema;
  entityId?: string;
  initialData?: any;
  mode: 'create' | 'edit';
}

export function EntityForm({
  gameSlug,
  entityType,
  schema,
  entityId,
  initialData,
  mode,
}: EntityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  function handleFieldChange(fieldName: string, value: any) {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field
    setErrors((prev) => prev.filter((err) => err.field !== fieldName));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const url =
        mode === 'create'
          ? `/api/admin/${gameSlug}/${entityType}`
          : `/api/admin/${gameSlug}/${entityType}?id=${entityId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.error || 'Failed to save entity');
        }
        return;
      }

      // Success - redirect to list
      router.push(`/admin/${gameSlug}/${entityType}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save entity');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push(`/admin/${gameSlug}/${entityType}`);
  }

  function getFieldError(fieldName: string): string | null {
    const error = errors.find((err) => err.field === fieldName);
    return error ? error.message : null;
  }

  function renderField(field: SchemaField) {
    const error = getFieldError(field.name);
    const value = formData[field.name];

    // Check conditional display
    if (field.showWhen && !field.showWhen(formData)) {
      return null;
    }

    return (
      <div key={field.name} className={styles.field}>
        <label className={styles.label}>
          {field.label}
          {field.required && <span className={styles.required}>*</span>}
        </label>

        {field.description && (
          <div className={styles.description}>{field.description}</div>
        )}

        {renderInput(field, value)}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  function renderInput(field: SchemaField, value: any) {
    switch (field.type) {
      case 'string':
      case 'url':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={styles.input}
            disabled={field.name === 'id' && mode === 'edit'}
          />
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={styles.textarea}
            rows={4}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) =>
              handleFieldChange(
                field.name,
                e.target.value ? parseFloat(e.target.value) : ''
              )
            }
            placeholder={field.placeholder}
            className={styles.input}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'boolean':
        return (
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) =>
                handleFieldChange(field.name, e.target.checked)
              }
            />
            <span>Enabled</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={styles.select}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={value || []}
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              handleFieldChange(field.name, selected);
            }}
            className={styles.multiselect}
            size={Math.min(field.options?.length || 5, 8)}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'array':
        return (
          <textarea
            value={
              value
                ? typeof value === 'string'
                  ? value
                  : JSON.stringify(value, null, 2)
                : ''
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(field.name, parsed);
              } catch {
                // Allow invalid JSON while typing
                handleFieldChange(field.name, e.target.value);
              }
            }}
            placeholder={field.placeholder || 'Enter JSON array or object'}
            className={styles.textarea}
            rows={6}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={styles.input}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={styles.input}
          />
        );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {mode === 'create' ? 'Create' : 'Edit'} {schema.label}
        </h1>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={styles.previewButton}
        >
          {showPreview ? 'Hide' : 'Show'} JSON Preview
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {schema.fields.map((field) => renderField(field))}

            {errors.length > 0 && (
              <div className={styles.errorSummary}>
                <strong>Please fix the following errors:</strong>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>
                      {error.field}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading
                  ? 'Saving...'
                  : mode === 'create'
                  ? 'Create'
                  : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {showPreview && (
          <div className={styles.previewContainer}>
            <JsonPreview data={formData} title="Entity Data" />
          </div>
        )}
      </div>
    </div>
  );
}
