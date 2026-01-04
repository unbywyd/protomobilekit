import { faker } from '@faker-js/faker'
import type { FieldType, FieldDefinition, FieldsDefinition, EnumFieldDefinition } from './types'

// Generate fake value for a field type
export function generateFakeValue(type: FieldType, definition?: FieldDefinition): unknown {
  // If custom faker path is provided
  if (definition && 'faker' in definition && definition.faker) {
    return getFakerValue(definition.faker)
  }

  switch (type) {
    case 'string':
      return faker.lorem.words(3)
    case 'number':
      return faker.number.int({ min: 1, max: 1000 })
    case 'boolean':
      return faker.datatype.boolean()
    case 'date':
      return faker.date.recent().getTime()
    case 'email':
      return faker.internet.email()
    case 'phone':
      return faker.phone.number()
    case 'url':
      return faker.internet.url()
    case 'image':
      return faker.image.url()
    case 'uuid':
      return faker.string.uuid()
    case 'enum':
      if (definition && 'values' in definition && definition.values.length > 0) {
        return faker.helpers.arrayElement(definition.values as readonly string[])
      }
      return ''
    case 'relation':
      // Relations should be set explicitly
      return null
    default:
      return null
  }
}

// Get faker value by path like "person.firstName"
function getFakerValue(path: string): unknown {
  const parts = path.split('.')
  let current: unknown = faker

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return null
    }
  }

  if (typeof current === 'function') {
    return current()
  }

  return current
}

// Generate fake data for all fields
export function generateFakeData(fields: FieldsDefinition): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, fieldDef] of Object.entries(fields)) {
    if (typeof fieldDef === 'string') {
      result[key] = generateFakeValue(fieldDef)
    } else {
      // Check if has default value
      if ('default' in fieldDef && fieldDef.default !== undefined) {
        result[key] = fieldDef.default
      } else {
        result[key] = generateFakeValue(fieldDef.type, fieldDef)
      }
    }
  }

  return result
}

// Generate multiple fake records
export function generateFakeRecords(
  fields: FieldsDefinition,
  count: number,
  customMock?: () => Record<string, unknown>
): Record<string, unknown>[] {
  return Array.from({ length: count }, () => {
    const baseData = generateFakeData(fields)
    if (customMock) {
      return { ...baseData, ...customMock() }
    }
    return baseData
  })
}
