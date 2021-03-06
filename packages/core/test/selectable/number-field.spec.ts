import { ComplexTypeNumberPropertyField, Entity, FieldType, Filter, NumberField } from '../../src';
import { TestEntity } from '../test-util/test-services/test-service';

export function checkFilter<EntityT extends Entity, FieldT extends FieldType>(
  filter: Filter<EntityT, FieldT>,
  fieldName: string,
  operator: string,
  value: any
): void {
  expect(filter.field).toBe(fieldName);
  expect(filter.operator).toBe(operator);
  expect(filter.value).toBe(value);
}

describe('Number Field', () => {
  const fieldName = 'SomeField';
  const filterValue = 100;

  describe('edm type field', () => {
    const field = new NumberField(fieldName, TestEntity, 'Edm.Decimal');

    it('should create filter for "equals"', () => {
      const filter = field.equals(filterValue);
      checkFilter(filter, fieldName, 'eq', filterValue);
    });

    it('should create filter for "notEquals"', () => {
      const filter = field.notEquals(filterValue);
      checkFilter(filter, fieldName, 'ne', filterValue);
    });

    it('should create filter for "lessThen"', () => {
      const filter = field.lessThan(filterValue);
      checkFilter(filter, fieldName, 'lt', filterValue);
    });

    it('should create filter for "lessOrEqual"', () => {
      const filter = field.lessOrEqual(filterValue);
      checkFilter(filter, fieldName, 'le', filterValue);
    });

    it('should create filter for "greaterThan"', () => {
      const filter = field.greaterThan(filterValue);
      checkFilter(filter, fieldName, 'gt', filterValue);
    });

    it('should create filter for "greaterOrEqual"', () => {
      const filter = field.greaterOrEqual(filterValue);
      checkFilter(filter, fieldName, 'ge', filterValue);
    });
  });

  describe('complex type field', () => {
    const parentTypeName = 'complexType';
    const field = new ComplexTypeNumberPropertyField(fieldName, TestEntity, parentTypeName, 'Edm.Single');

    it('should create filter for "equals" (complex property string)', () => {
      const filter = field.equals(filterValue);
      expect(field._fieldName).toBe(fieldName);
      checkFilter(filter, `${parentTypeName}/${fieldName}`, 'eq', filterValue);
    });

    it('should create filter for "notEquals" (complex property string)', () => {
      const filter = field.notEquals(filterValue);
      expect(field._fieldName).toBe(fieldName);
      checkFilter(filter, `${parentTypeName}/${fieldName}`, 'ne', filterValue);
    });

    it('should create filter for "lessThen"', () => {
      const filter = field.lessThan(filterValue);
      expect(field._fieldName).toBe(fieldName);
      checkFilter(filter, `${parentTypeName}/${fieldName}`, 'lt', filterValue);
    });

    it('should create filter for "lessOrEqual"', () => {
      const filter = field.lessOrEqual(filterValue);
      expect(field._fieldName).toBe(fieldName);
      checkFilter(filter, `${parentTypeName}/${fieldName}`, 'le', filterValue);
    });

    it('should create filter for "greaterThan"', () => {
      const filter = field.greaterThan(filterValue);
      expect(field._fieldName).toBe(fieldName);
      checkFilter(filter, `${parentTypeName}/${fieldName}`, 'gt', filterValue);
    });

    it('should create filter for "greaterOrEqual"', () => {
      const filter = field.greaterOrEqual(filterValue);
      expect(field._fieldName).toBe(fieldName);
      checkFilter(filter, `${parentTypeName}/${fieldName}`, 'ge', filterValue);
    });
  });
});
