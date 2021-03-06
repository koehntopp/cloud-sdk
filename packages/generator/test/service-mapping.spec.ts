import { serviceMapping, VdmMapping } from '../src/service-mapping';
import { VdmServiceMetadata } from '../src/vdm-types';

describe('service-mapping', () => {
  it('generates a valid VdmMapping from service metadata', () => {
    const serviceMetadata: VdmServiceMetadata[] = [
      {
        originalFileName: 'API_A_SERV',
        directoryName: 'a-serv',
        npmPackageName: '@sap/a-serv',
        servicePath: '/path/to/serv',
        complexTypes: [],
        entities: [],
        functionImports: [],
        namespace: 'fghjkl',
        speakingModuleName: 'fghjk',
        className: 'AService',
        edmxPath: 'fghjkl'
      },
      {
        originalFileName: 'API_B_SERV',
        directoryName: 'b-serv',
        npmPackageName: '@sap/b-serv',
        servicePath: '/path/to/serv',
        complexTypes: [],
        entities: [],
        functionImports: [],
        namespace: 'fghjkl',
        speakingModuleName: 'fghjk',
        className: 'BService',
        edmxPath: 'fghjkl'
      }
    ];

    const expectedVdmMapping: VdmMapping = {
      API_A_SERV: {
        directoryName: 'a-serv',
        servicePath: '/path/to/serv',
        npmPackageName: '@sap/a-serv'
      },
      API_B_SERV: {
        directoryName: 'b-serv',
        servicePath: '/path/to/serv',
        npmPackageName: '@sap/b-serv'
      }
    };

    expect(serviceMapping(serviceMetadata)).toEqual(expectedVdmMapping);
  });
});
