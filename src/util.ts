"use strict";

import { Uri, workspace } from "vscode";

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

  return pathComponents;
}

function getPathComponentsFromComposerJson(wsPath: string) {
  const composerJson = require(wsPath + "/composer.json");
  const livewireVersion =
    +composerJson.require["livewire/livewire"].match(/\d/);

  if (livewireVersion === 2) {
    return "app/Http/Livewire";
  }
  if (livewireVersion === 3) {
    return "app/Livewire";
  }
}

export async function convertToFilePath(wsPath: string, s: string) {
  s = s
    .replace(/-./g, (x) => x[1].toUpperCase())
    .replace(/\../g, (x) => "/" + x[1].toUpperCase());
  s = s[0].toUpperCase() + s.substring(1) + ".php";

  let pathComponents = null;

  try {
    // throws error if composer.json does not exist
    pathComponents = getPathComponentsFromComposerJson(wsPath);
    // throws error if file does not exist
    if (pathComponents) {
      await workspace.fs.stat(
        Uri.joinPath(Uri.file(wsPath), pathComponents, s)
      );
    }
  } catch (err) {
    pathComponents = null;
  }

  if (!pathComponents) {
    try {
      // throws error if livewire.php does not exist
      pathComponents = await getPathComponentsFromLivewireConfig(wsPath);
      // throws error if file does not exist
      if (pathComponents) {
        await workspace.fs.stat(
          Uri.joinPath(Uri.file(wsPath), pathComponents, s)
        );
      }
    } catch (err) {
      pathComponents = null;
    }
  }

  if (!pathComponents) {
    // fallback to configuration
    pathComponents = workspace.getConfiguration("livewire-goto").pathComponents;
    if (pathComponents) {
      try {
        // throws error if file does not exist
        await workspace.fs.stat(
          Uri.joinPath(Uri.file(wsPath), pathComponents, s)
        );
      } catch (err) {
        pathComponents = null;
      }
    }
  }

  if (pathComponents) {
    return Uri.joinPath(Uri.file(wsPath), pathComponents, s).fsPath;
  }
}
