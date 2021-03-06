import { StructureKind } from 'ts-morph';
import { complexTypeNamespace } from '../../src/complex-type/namespace';
import { complexMeal, complexMealWithDesert } from '../test-util/data-model';

describe('namespace', () => {
  it('complexTypeSourceFile', () => {
    const actual = complexTypeNamespace(complexMeal);
    expect(actual).toEqual({
      kind: StructureKind.Namespace,
      name: 'ComplexMeal',
      isExported: true,
      statements: [
        {
          kind: StructureKind.Function,
          name: 'build',
          returnType: 'ComplexMeal',
          parameters: [{ name: 'json', type: '{ [keys: string]: FieldType }' }],
          statements:
            "return createComplexType(json, {\nComplexity: (complexity: string) => ({ complexity: edmToTs(complexity, 'Edm.String') }),\nAmount: (amount: number) => ({ amount: edmToTs(amount, 'Edm.Int16') })\n});",
          isExported: true
        }
      ]
    });
  });

  it('should generate a builder when a complex type includes a complex type property', () => {
    const actual = complexTypeNamespace(complexMealWithDesert);
    expect(actual).toEqual({
      kind: StructureKind.Namespace,
      name: 'ComplexMealWithDesert',
      isExported: true,
      statements: [
        {
          kind: StructureKind.Function,
          name: 'build',
          returnType: 'ComplexMealWithDesert',
          parameters: [{ name: 'json', type: '{ [keys: string]: FieldType }' }],
          statements:
            "return createComplexType(json, {\nComplexDesert: (complexDesert: ComplexDesert) => ({ complexDesert: ComplexDesert.build(complexDesert) }),\nAmount: (amount: number) => ({ amount: edmToTs(amount, 'Edm.Int16') })\n});",
          isExported: true
        }
      ]
    });
  });
});
