/*!
 * Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { createLogger } from '@sap-cloud-sdk/util';
import { readFile } from 'fs';
import { resolve } from 'path';
import { Directory, SourceFile, SourceFileStructure } from 'ts-morph';

const logger = createLogger({
  package: 'generator',
  messageContext: 'file-generator'
});

export function sourceFile(directory: Directory, relativePath: string, content: SourceFileStructure, overwrite: boolean): SourceFile {
  const file = directory.createSourceFile(`${relativePath}.ts`, addFileComment(content), {
    overwrite
  });

  file.formatText({ insertSpaceAfterCommaDelimiter: true });
  return file;
}

export function otherFile(directory: Directory, relativePath: string, content: string, overwrite: boolean): SourceFile {
  return directory.createSourceFile(relativePath, content, {
    overwrite
  });
}

export function copyFile(fromPath: string, toRelativePath: string, toDirectory: Directory, overwrite: boolean): void {
  return readFile(resolve(fromPath), { encoding: 'utf8' }, (err, changeLogContents) => {
    if (err) {
      logger.error(err);
    } else {
      toDirectory.createSourceFile(toRelativePath, changeLogContents, { overwrite });
    }
  });
}

function addFileComment(content: SourceFileStructure): SourceFileStructure {
  content.leadingTrivia = [
    '/*!',
    ' * Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.',
    ' *',
    ' * This is a generated file powered by the SAP Cloud SDK for JavaScript.',
    ' */',
    ''
  ].join('\n');
  return content;
}
