import React, { useMemo, createContext } from 'react'
import { useTheme } from '../ui/theme'
import { getEntityDefinition } from '../entity'
import type { FieldType, FieldDefinition } from '../entity/types'
import { useForm, type Validator } from './useForm'
import { Form, FormField, FormActions } from './Form'
import { validators } from './validators'

// Input components
import { Input, Select } from '../ui/Input'

// Field override render function type
type FieldRenderFn = (props: { value: any; onChange: (value: any) => void; error: string | null }) => React.ReactNode

// Field override component
interface EntityFormFieldProps {
  name: string
  render: FieldRenderFn
}

function EntityFormField(_props: EntityFormFieldProps): null {
  // This component is used to collect overrides, not render directly
  return null
}

// EntityForm context for field overrides
interface EntityFormContextValue {
  entity: string
  fields: string[]
  overrides: Record<string, FieldRenderFn>
}

const EntityFormContext = createContext<EntityFormContextValue | null>(null)

// Get input component for field type
function getInputForType(
  fieldType: FieldType,
  fieldDef: FieldDefinition | undefined,
  name: string
): React.ReactElement {
  switch (fieldType) {
    case 'string':
    case 'uuid':
      return <Input placeholder={`Enter ${name}`} />

    case 'email':
      return <Input type="email" placeholder="email@example.com" />

    case 'phone':
      return <Input type="tel" placeholder="+7 999 123 45 67" />

    case 'url':
    case 'image':
      return <Input type="url" placeholder="https://" />

    case 'number':
      return <Input type="number" placeholder="0" />

    case 'boolean':
      // For boolean, we'll handle it specially in render
      return <Input type="text" placeholder="true/false" />

    case 'date':
      return <Input type="date" placeholder="Select date" />

    case 'enum':
      if (fieldDef && 'values' in fieldDef && fieldDef.values) {
        return (
          <Select
            options={fieldDef.values.map((v: string) => ({ value: v, label: v }))}
            value=""
            onChange={() => {}}
          />
        )
      }
      return <Input placeholder={`Enter ${name}`} />

    case 'relation':
      return <Input placeholder={`Select ${fieldDef && 'collection' in fieldDef ? fieldDef.collection : 'item'}`} />

    default:
      return <Input placeholder={`Enter ${name}`} />
  }
}

// Get validator for field type
function getValidatorForType(
  fieldType: FieldType,
  fieldDef: FieldDefinition | undefined,
  name: string
): Validator | undefined {
  const isRequired = fieldDef?.required !== false

  const baseValidator = (() => {
    switch (fieldType) {
      case 'email':
        return validators.email()
      case 'phone':
        return validators.phone('ru')
      case 'url':
      case 'image':
        return validators.url()
      default:
        return undefined
    }
  })()

  if (isRequired && baseValidator) {
    return validators.compose(validators.required(), baseValidator)
  }
  if (isRequired) {
    return validators.required()
  }
  if (baseValidator) {
    return validators.optional(baseValidator)
  }
  return undefined
}

// Get label from field name
function getLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// EntityForm props
export interface EntityFormProps<T extends Record<string, any> = Record<string, any>> {
  /** Entity name (must be registered with entity()) */
  entity: string
  /** Initial data (for edit mode) */
  data?: Partial<T>
  /** Fields to show (defaults to all) */
  fields?: string[]
  /** Fields to exclude */
  exclude?: string[]
  /** Submit handler */
  onSubmit?: (values: T) => void | Promise<void>
  /** Cancel handler */
  onCancel?: () => void
  /** Submit button text */
  submitText?: string
  /** Cancel button text */
  cancelText?: string
  /** Show cancel button */
  showCancel?: boolean
  /** Disable all fields */
  disabled?: boolean
  /** Additional validation */
  validate?: Partial<Record<keyof T, Validator>>
  /** Children for field overrides */
  children?: React.ReactNode
  /** Additional class name */
  className?: string
}

/**
 * EntityForm - Auto-generate form from entity schema
 *
 * @example
 * ```tsx
 * // Simple usage - generates all fields
 * <EntityForm entity="User" onSubmit={(v) => users.create(v)} />
 *
 * // With specific fields
 * <EntityForm
 *   entity="User"
 *   fields={['name', 'email', 'role']}
 *   onSubmit={handleSubmit}
 * />
 *
 * // With field override
 * <EntityForm entity="User" fields={['name', 'avatar']}>
 *   <EntityForm.Field name="avatar" render={({ value, onChange }) => (
 *     <ImageUploader value={value} onChange={onChange} />
 *   )} />
 * </EntityForm>
 * ```
 */
export function EntityForm<T extends Record<string, any> = Record<string, any>>({
  entity,
  data,
  fields: fieldsProp,
  exclude = ['id', 'createdAt', 'updatedAt'],
  onSubmit,
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  showCancel = false,
  disabled = false,
  validate: customValidate = {},
  children,
  className,
}: EntityFormProps<T>) {
  const { colors } = useTheme()

  // Get entity definition
  const entityDef = useMemo(() => {
    try {
      return getEntityDefinition(entity)
    } catch {
      console.warn(`Entity "${entity}" not found`)
      return null
    }
  }, [entity])

  // Collect field overrides from children
  const overrides = useMemo(() => {
    const result: Record<string, FieldRenderFn> = {}
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === EntityFormField) {
        const props = child.props as EntityFormFieldProps
        result[props.name] = props.render
      }
    })
    return result
  }, [children])

  // Get fields to show
  const fields = useMemo(() => {
    if (!entityDef) return []

    let fieldNames = fieldsProp || Object.keys(entityDef.fields)
    fieldNames = fieldNames.filter((name) => !exclude.includes(name))

    return fieldNames
  }, [entityDef, fieldsProp, exclude])

  // Build initial values
  const initialValues = useMemo(() => {
    if (!entityDef) return {} as T

    const values: Record<string, any> = {}
    for (const name of fields) {
      const fieldDef = entityDef.fields[name]
      const def = typeof fieldDef === 'object' ? fieldDef : undefined

      // Use data value, default, or empty
      if (data && name in data) {
        values[name] = data[name]
      } else if (def?.default !== undefined) {
        values[name] = def.default
      } else {
        const type = typeof fieldDef === 'string' ? fieldDef : fieldDef.type
        switch (type) {
          case 'boolean':
            values[name] = false
            break
          case 'number':
            values[name] = 0
            break
          default:
            values[name] = ''
        }
      }
    }
    return values as T
  }, [entityDef, fields, data])

  // Build validators
  const formValidate = useMemo(() => {
    if (!entityDef) return {}

    const result: Partial<Record<keyof T, Validator>> = {}
    for (const name of fields) {
      const fieldDef = entityDef.fields[name]
      const type = typeof fieldDef === 'string' ? fieldDef : fieldDef.type
      const def = typeof fieldDef === 'object' ? fieldDef : undefined

      // Custom validator takes precedence
      if (customValidate[name as keyof T]) {
        result[name as keyof T] = customValidate[name as keyof T]
      } else {
        const validator = getValidatorForType(type, def, name)
        if (validator) {
          result[name as keyof T] = validator
        }
      }
    }
    return result
  }, [entityDef, fields, customValidate])

  // Create form
  const form = useForm({
    values: initialValues,
    validate: formValidate,
    onSubmit,
  })

  if (!entityDef) {
    return (
      <div className="p-4 text-center" style={{ color: colors.textSecondary }}>
        Entity "{entity}" not found. Make sure it's registered with entity().
      </div>
    )
  }

  return (
    <EntityFormContext.Provider value={{ entity, fields, overrides }}>
      <Form form={form} className={className} disabled={disabled}>
        {fields.map((name) => {
          const fieldDef = entityDef.fields[name]
          const type = typeof fieldDef === 'string' ? fieldDef : fieldDef.type
          const def = typeof fieldDef === 'object' ? fieldDef : undefined
          const label = getLabel(name)
          const isRequired = def?.required !== false

          // Check for override
          const renderFn = overrides[name]
          if (renderFn) {
            return (
              <FormField key={name} name={name} label={label} optional={!isRequired}>
                {renderFn({
                  value: form.values[name],
                  onChange: (value) => form.setValue(name as keyof T, value),
                  error: form.errors[name as keyof T] || null,
                })}
              </FormField>
            )
          }

          // Generate input based on type
          const input = getInputForType(type, def, name)

          return (
            <FormField key={name} name={name} label={label} optional={!isRequired}>
              {input}
            </FormField>
          )
        })}

        <FormActions>
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            type="submit"
            disabled={form.submitting}
            className="flex-1 py-3 rounded-lg font-semibold disabled:opacity-50"
            style={{
              backgroundColor: colors.primary,
              color: '#FFFFFF',
            }}
          >
            {form.submitting ? 'Saving...' : submitText}
          </button>
        </FormActions>
      </Form>
    </EntityFormContext.Provider>
  )
}

// Attach Field component
EntityForm.Field = EntityFormField
EntityForm.displayName = 'EntityForm'
