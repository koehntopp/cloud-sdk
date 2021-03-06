import { GlobalNameFormatter } from '../../src/global-name-formatter';
import { parseAllServices, parseService } from '../../src/parser';
import { ServiceMapping } from '../../src/service-mapping';
import { VdmFunctionImportReturnTypeCategory } from '../../src/vdm-types';
import { createOptions } from '../test-util/create-generator-options';

describe('service-parser', () => {
  describe('chooses package name source', () => {
    it('namespace by default', () => {
      const serviceMetadata = parseService(
        {
          edmxPath: '../../test-resources/service-specs/API_TEST_SRV/API_TEST_SRV.edmx'
        },
        createOptions(),
        {},
        new GlobalNameFormatter(undefined)
      );
      expect(serviceMetadata.directoryName).toBe('test-service');
    });

    it('prioritizes mapping over original names', () => {
      const serviceMapping: ServiceMapping = {
        directoryName: 'custom-directory-name',
        servicePath: '/path/to/service',
        npmPackageName: 'custom-package-name'
      };

      const serviceMetadata = parseService(
        { edmxPath: '../../test-resources/service-specs/API_TEST_SRV/API_TEST_SRV.edmx' },
        createOptions(),
        {
          API_TEST_SRV: serviceMapping
        },
        new GlobalNameFormatter({ API_TEST_SRV: serviceMapping })
      );

      expect(serviceMetadata.directoryName).toBe(serviceMapping.directoryName);
      expect(serviceMetadata.servicePath).toBe(serviceMapping.servicePath);
      expect(serviceMetadata.npmPackageName).toBe(serviceMapping.npmPackageName);
    });
  });

  describe('parses services', () => {
    it('generates vdm from edmx', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: false
        })
      );

      expect(services[0].namespace).toBe('API_TEST_SRV');
      expect(services[0].directoryName).toBe('test-service');
      expect(services[0].npmPackageName).toBe('test-service');
      expect(services[0].servicePath).toBe('/sap/opu/odata/sap/API_TEST_SRV');
      expect(services[0].entities.length).toBe(10);
    });

    it('generates vdm from edmx using swagger', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: true
        })
      );

      expect(services[0].entities.length).toBe(10);
      expect(services[0].apiBusinessHubMetadata!.businessDocumentationUrl).toBeDefined();
    });

    it('entities are read correctly', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV'
        })
      );

      expect(
        services[0].entities.map(entity => ({
          entitySetName: entity.entitySetName,
          className: entity.className,
          numProperties: entity.properties.length,
          numKeys: entity.keys.length
        }))
      ).toEqual([
        { entitySetName: 'A_TestEntity', className: 'TestEntity', numKeys: 2, numProperties: 18 },
        { entitySetName: 'A_TestEntityMultiLink', className: 'TestEntityMultiLink', numKeys: 1, numProperties: 5 },
        { entitySetName: 'A_TestEntityOtherMultiLink', className: 'TestEntityOtherMultiLink', numKeys: 1, numProperties: 1 },
        { entitySetName: 'A_TestEntityLvl2MultiLink', className: 'TestEntityLvl2MultiLink', numKeys: 1, numProperties: 5 },
        { entitySetName: 'A_TestEntitySingleLink', className: 'TestEntitySingleLink', numKeys: 1, numProperties: 5 },
        { entitySetName: 'A_TestEntityLvl2SingleLink', className: 'TestEntityLvl2SingleLink', numKeys: 1, numProperties: 5 },
        { entitySetName: 'A_TestEntityCircularLinkParent', className: 'TestEntityCircularLinkParent', numKeys: 1, numProperties: 1 },
        { entitySetName: 'A_TestEntityCircularLinkChild', className: 'TestEntityCircularLinkChild', numKeys: 1, numProperties: 1 },
        { entitySetName: 'A_TestEntityEndsWithCollection', className: 'TestEntityEndsWith', numKeys: 1, numProperties: 1 },
        { entitySetName: 'A_TestEntityEndsWithSomethingElse', className: 'TestEntityEndsWithSomethingElse', numKeys: 1, numProperties: 1 }
      ]);
    });

    it('complex types are parsed correctly', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV'
        })
      );

      const complexTypes = services[0].complexTypes;
      const complexType = complexTypes[0];

      expect(complexTypes.length).toBe(2);
      expect(complexType.typeName).toBe('TestComplexType');
      expect(complexType.originalName).toBe('A_TestComplexType');
      expect(complexType.factoryName).toBe('createTestComplexType_1');
      expect(complexType.fieldType).toBe('TestComplexTypeField');
      expect(complexType.properties.length).toBe(16);
    });

    it('complex type properties are read correctly', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: false
        })
      );

      const testEntity = services[0].entities[0];
      const complexProperty = testEntity.properties.find(prop => prop.originalName === 'ComplexTypeProperty');
      const expected = {
        instancePropertyName: 'complexTypeProperty',
        staticPropertyName: 'COMPLEX_TYPE_PROPERTY',
        propertyNameAsParam: 'complexTypeProperty',
        originalName: 'ComplexTypeProperty',
        edmType: 'API_TEST_SRV.A_TestComplexType',
        jsType: 'TestComplexType',
        fieldType: 'TestComplexTypeField',
        description: '',
        nullable: true,
        isComplex: true
      };
      expect(complexProperty).toEqual(expected);
    });

    it('does not clash with complex type builder function', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: false
        })
      );

      const functionImport = services[0].functionImports.find(f => f.originalName === 'CreateTestComplexType')!;
      const complexType = services[0].complexTypes.find(c => c.originalName === 'A_TestComplexType')!;

      const complexTypeName = 'TestComplexType';
      const functionImportName = 'createTestComplexType';
      const factoryName = 'createTestComplexType_1';
      const expectedReturnType = {
        returnTypeCategory: VdmFunctionImportReturnTypeCategory.COMPLEX_TYPE,
        returnType: 'TestComplexType',
        builderFunction: 'TestComplexType.build',
        isMulti: false
      };

      expect(functionImport.functionName).toBe(functionImportName);
      expect(functionImport.returnType).toEqual(expectedReturnType);

      expect(complexType.typeName).toBe(complexTypeName);
      expect(complexType.factoryName).toBe(factoryName);
    });

    it('does not clash with reserved JavaScript keywords', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: false
        })
      );

      const functionImport = services[0].functionImports.find(f => f.originalName === 'Continue')!;

      expect(functionImport.functionName).toBe('fContinue');
    });

    it('function imports edm return types are read correctly', () => {
      const [service] = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: false
        })
      );

      const functionImport = service.functionImports.find(f => f.originalName === 'TestFunctionImportEdmReturnType')!;

      expect(functionImport.functionName).toBe('testFunctionImportEdmReturnType');
      expect(functionImport.returnType.builderFunction).toBe("(val) => edmToTs(val, 'Edm.Boolean')");
    });

    it('should parse C4C service definitions with proper class names.', () => {
      const services = parseAllServices(
        createOptions({
          inputDir: '../../test-resources/service-specs/API_TEST_SRV',
          useSwagger: false
        })
      );

      const entities = services[0].entities;

      const entityEndsWithCollection = entities.find(e => e.entitySetName === 'A_TestEntityEndsWithCollection')!;
      const entityEndsWithSthElse = entities.find(e => e.entitySetName === 'A_TestEntityEndsWithSomethingElse')!;

      expect(entityEndsWithCollection.className).toBe('TestEntityEndsWith');
      expect(entityEndsWithSthElse.className).toBe('TestEntityEndsWithSomethingElse');
    });
  });

  it('should skip entity types when not defined in any entity sets', () => {
    const services = parseAllServices(
      createOptions({
        inputDir: '../../test-resources/service-specs/API_TEST_SRV',
        useSwagger: false
      })
    );

    const entity = services[0].entities.find(e => e.entityTypeName === 'Unused');

    expect(entity).toBeUndefined();
  });

  it('parses multiple schemas', () => {
    const services = parseAllServices(
      createOptions({
        inputDir: '../../test-resources/service-specs/API_MULTIPLE_SCHEMAS_SRV',
        useSwagger: false
      })
    );

    expect(services[0].entities.length).toBe(1);
  });
});
