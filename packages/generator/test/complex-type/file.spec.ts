import { StructureKind } from 'ts-morph';
import { complexTypeSourceFile } from '../../src/complex-type';
import { complexMeal, complexMealWithDesert } from '../test-util/data-model';

describe('file', () => {
  it('complexTypeSourceFile', () => {
    const actual = complexTypeSourceFile(complexMeal);
    const imports = (actual.statements as any[]).filter(element => element.kind === StructureKind.ImportDeclaration);

    expect(imports.length).toBe(1);

    const entities = (actual.statements as any[]).filter(element => element.kind === StructureKind.Class);

    expect(entities.length).toBe(1);

    const interfaces = (actual.statements as any[]).filter(element => element.kind === StructureKind.Interface);

    expect(interfaces.length).toBe(1);

    const namespaces = (actual.statements as any[]).filter(element => element.kind === StructureKind.Namespace);

    expect(namespaces.length).toBe(1);
  });

  it('complexTypeSourceFile with nested complex types', () => {
    const actual = complexTypeSourceFile(complexMealWithDesert);
    const imports = (actual.statements as any[]).filter(element => element.kind === StructureKind.ImportDeclaration);

    expect(imports.length).toBe(2); // the only deviation with the previous test

    const entities = (actual.statements as any[]).filter(element => element.kind === StructureKind.Class);

    expect(entities.length).toBe(1);

    const interfaces = (actual.statements as any[]).filter(element => element.kind === StructureKind.Interface);

    expect(interfaces.length).toBe(1);

    const namespaces = (actual.statements as any[]).filter(element => element.kind === StructureKind.Namespace);

    expect(namespaces.length).toBe(1);
  });
});
