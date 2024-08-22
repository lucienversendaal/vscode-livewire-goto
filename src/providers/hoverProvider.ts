"use strict";

import {
  Hover,
  HoverProvider as vsHoverProvider,
  MarkdownString,
  Position,
  TextDocument,
  workspace,
} from "vscode";
import * as util from "../util";

export default class HoverProvider implements vsHoverProvider {
  async provideHover(document: TextDocument, position: Position) {
    let ranges = document.getWordRangeAtPosition(position, util.regexJumpFile);

    if (!ranges) {
      return;
    }

    const wsPath = workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;

    if (!wsPath) {
      return;
    }

    // const cacheMap = util.getLivewireCacheMap(wsPath);

    const text = document.getText(ranges);
    const matches = text.matchAll(util.regexJumpFile);

    for (const match of matches) {
      const matchedPath = match[3];
      const jumpPath = await util.convertToFilePath(wsPath, matchedPath);

      if (!jumpPath) {
        continue;
      }

      const jumpPathShow = jumpPath.replace(wsPath + "/", "");

      const markdown = "`class:`" + `[${jumpPathShow}](${jumpPath}) \n`;

      return new Hover(new MarkdownString(markdown));
    }
  }
}
