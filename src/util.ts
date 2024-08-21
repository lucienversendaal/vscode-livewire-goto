"use strict";

import { workspace } from "vscode";

export const regexJumpFile =
  /((@livewire\([ \t\n]{0,}[\'\"])|<livewire:)(.*?)([\'\"][\),]|([ \t\n]|>))/g;

async function getPathComponentsFromLivewireConfig(wsPath: string) {
  const livewireConfigDoc = await workspace.openTextDocument(
    wsPath + "/config/livewire.php"
  );
  const docText = livewireConfigDoc.getText();

  let pathComponents = docText
    .match(/App\\.*?Livewire/)?.[0]
    .replace(/\\\\/g, "/")
    .replace(/App\//, "app/");

  if (pathComponents) {
    return pathComponents + "/";
  }
}

export async function convertToFilePath(wsPath: string, s: string) {
  s = s
    .replace(/-./g, (x) => x[1].toUpperCase())
    .replace(/\../g, (x) => "/" + x[1].toUpperCase());
  s = s[0].toUpperCase() + s.substring(1) + ".php";

  const pathComponents = await getPathComponentsFromLivewireConfig(wsPath);

  if (pathComponents) {
    return wsPath + "/" + pathComponents + s;
  }
}
