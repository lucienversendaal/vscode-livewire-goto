"use strict";

import {
  DocumentLink,
  DocumentLinkProvider as vsDocumentLinkProvider,
  Position,
  ProviderResult,
  Range,
  TextDocument,
  Uri,
  workspace,
} from "vscode";
import * as util from "../util";

export default class DocumentLinkProvider implements vsDocumentLinkProvider {
  async provideDocumentLinks(document: TextDocument) {
    let documentLinks: DocumentLink[] = [];

    const wsPath = workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;

    if (!wsPath) return;

    // const cacheMap = util.getLivewireCacheMap(wsPath);
    for (let index = 0; index < document.lineCount; index++) {
      const line = document.lineAt(index);
      const matches = line.text.matchAll(util.regexJumpFile);
      for (const match of matches) {
        const matchedPath = match[3];

        const startColumn = new Position(
          line.lineNumber,
          line.text.indexOf(matchedPath)
        );
        const endColumn = startColumn.translate(0, matchedPath.length);

        const jumpPath = await util.convertToFilePath(wsPath, matchedPath);

        if (jumpPath == undefined) continue;

        documentLinks.push(
          new DocumentLink(
            new Range(startColumn, endColumn),
            Uri.file(jumpPath)
          )
        );
      }
    }

    return documentLinks;
  }
}
