// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Use dynamic imports for ESM/CJS compatibility during bundling and to avoid activation-time crashes
async function loadPrettier(): Promise<any> {
  const mod: any = await import('prettier');
  return mod?.default ?? mod;
}

async function loadPhpPlugin(): Promise<any> {
  const mod: any = await import('@prettier/plugin-php');
  return mod?.default ?? mod;
}

async function bladeFormatDynamic(input: string, options: any): Promise<string> {
  const mod: any = await import('blade-formatter');
  const fn = mod?.format ?? mod?.default ?? mod;
  return await fn(input, options);
}

type SupportedLanguageId = 'html' | 'javascript' | 'php' | 'blade';

function getWorkspacePrettierOptions(): any {
  const cfg = vscode.workspace.getConfiguration('pbhjFormatter');
  return {
    printWidth: cfg.get<number>('printWidth', 100),
    tabWidth: cfg.get<number>('tabWidth', 2),
    useTabs: cfg.get<boolean>('useTabs', false),
    semi: cfg.get<boolean>('semi', true),
    singleQuote: cfg.get<boolean>('singleQuote', true),
  };
}

async function formatWithPrettier(
  document: vscode.TextDocument,
  language: SupportedLanguageId
): Promise<string> {
  const prettier = await loadPrettier();
  const text = document.getText();
  const options = getWorkspacePrettierOptions();
  const filepath = document.uri.fsPath;
  const parser = language === 'javascript' ? 'babel' : language === 'html' ? 'html' : 'babel';
  const phpPlugin = await loadPhpPlugin();
  const result = await prettier.format(text, {
    ...options,
    filepath,
    parser,
    plugins: [phpPlugin],
  });
  return result;
}

async function formatPhp(document: vscode.TextDocument): Promise<string> {
  const prettier = await loadPrettier();
  const text = document.getText();
  const options = getWorkspacePrettierOptions();
  const filepath = document.uri.fsPath;
  const phpPlugin = await loadPhpPlugin();
  const result = await prettier.format(text, {
    ...options,
    filepath,
    parser: 'php',
    plugins: [phpPlugin],
  } as any);
  return result;
}

async function formatBlade(document: vscode.TextDocument): Promise<string> {
  const cfg = vscode.workspace.getConfiguration('pbhjFormatter');
  const wrapAttributes = cfg.get<string>('blade.wrapAttributes', 'auto');
  const content = document.getText();
  const result = await bladeFormatDynamic(content, {
    indentSize: cfg.get<number>('tabWidth', 2),
    wrapAttributes: wrapAttributes as any,
  });
  return result;
}

function replaceWholeDocument(document: vscode.TextDocument, newText: string): vscode.TextEdit[] {
  const start = new vscode.Position(0, 0);
  const lastLine = Math.max(document.lineCount - 1, 0);
  const end = new vscode.Position(lastLine, document.lineAt(lastLine).text.length);
  return [vscode.TextEdit.replace(new vscode.Range(start, end), newText)];
}

// Debug visuals (status, background, simple closing-tag highlight)
let debugEnabled = false;
let statusBar: vscode.StatusBarItem | undefined;
let backgroundDecoration: vscode.TextEditorDecorationType | undefined;
let closingTagDecoration: vscode.TextEditorDecorationType | undefined;

function initDebugUI(context: vscode.ExtensionContext) {
  const cfg = vscode.workspace.getConfiguration('pbhjFormatter');
  debugEnabled = cfg.get<boolean>('debug.enable', false);

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = debugEnabled ? 'PBHJ Debug: ON' : 'PBHJ Debug: OFF';
  statusBar.tooltip = 'PBHJ Advanced Formatter debug visuals';
  statusBar.command = 'pbhj-advanced-formatter.toggleDebug';
  statusBar.show();
  context.subscriptions.push(statusBar);

  backgroundDecoration = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: 'rgba(255,0,0,0.08)'
  });
  closingTagDecoration = vscode.window.createTextEditorDecorationType({
    border: '1px solid rgba(255,0,0,0.6)',
    borderRadius: '2px',
    overviewRulerColor: 'rgba(255,0,0,0.9)',
    overviewRulerLane: vscode.OverviewRulerLane.Right
  });
  context.subscriptions.push(backgroundDecoration, closingTagDecoration);

  const refresh = () => refreshDebugDecorations();
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(refresh),
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidCloseTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument(refresh),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('pbhjFormatter.debug.enable')) {
        debugEnabled = vscode.workspace.getConfiguration('pbhjFormatter').get('debug.enable', false);
        if (statusBar) statusBar.text = debugEnabled ? 'PBHJ Debug: ON' : 'PBHJ Debug: OFF';
        refreshDebugDecorations();
      }
    })
  );

  // Command to toggle
  const toggleDebug = vscode.commands.registerCommand('pbhj-advanced-formatter.toggleDebug', async () => {
    const target = !debugEnabled;
    await vscode.workspace.getConfiguration('pbhjFormatter').update('debug.enable', target, vscode.ConfigurationTarget.Global);
  });
  context.subscriptions.push(toggleDebug);

  setTimeout(refreshDebugDecorations, 0);
}

function refreshDebugDecorations() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const doc = editor.document;
  const isTarget = ['html', 'javascript', 'php', 'blade'].includes(doc.languageId);

  if (!debugEnabled || !isTarget) {
    if (backgroundDecoration) editor.setDecorations(backgroundDecoration, []);
    if (closingTagDecoration) editor.setDecorations(closingTagDecoration, []);
    return;
  }

  if (backgroundDecoration) {
    editor.setDecorations(backgroundDecoration, [
      new vscode.Range(0, 0, Math.max(doc.lineCount - 1, 0), 0)
    ]);
  }

  if (closingTagDecoration && (doc.languageId === 'html' || doc.languageId === 'blade')) {
    const text = doc.getText();
    const regex = /<\/(\w[\w:-]*)\s*>/g; // simple closing tag finder
    const ranges: vscode.Range[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const startPos = doc.positionAt(match.index);
      const endPos = doc.positionAt(match.index + match[0].length);
      ranges.push(new vscode.Range(startPos, endPos));
    }
    editor.setDecorations(closingTagDecoration, ranges);
  } else if (closingTagDecoration) {
    editor.setDecorations(closingTagDecoration, []);
  }
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  initDebugUI(context);

  const commandDisposable = vscode.commands.registerCommand('pbhj-advanced-formatter.formatDocument', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const { document } = editor;
    try {
      let formatted: string | undefined;
      if (document.languageId === 'php') {
        formatted = await formatPhp(document);
      } else if (document.languageId === 'blade') {
        formatted = await formatBlade(document);
      } else if (document.languageId === 'html' || document.languageId === 'javascript') {
        formatted = await formatWithPrettier(document, document.languageId as SupportedLanguageId);
      }
      if (formatted !== undefined) {
        const edits = replaceWholeDocument(document, formatted);
        await editor.edit((editBuilder) => {
          edits.forEach((e) => editBuilder.replace(e.range, e.newText));
        });
      } else {
        vscode.window.showWarningMessage('PBHJ Formatter: Unsupported language for manual command.');
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`PBHJ Formatter error: ${err?.message ?? String(err)}`);
    }
  });
  context.subscriptions.push(commandDisposable);

  const htmlProvider = vscode.languages.registerDocumentFormattingEditProvider({ language: 'html' }, {
    provideDocumentFormattingEdits: async (document) => {
      try { return replaceWholeDocument(document, await formatWithPrettier(document, 'html')); } catch (e: any) {
        vscode.window.showErrorMessage(`PBHJ HTML format error: ${e?.message ?? String(e)}`);
        return [];
      }
    },
  });
  const jsProvider = vscode.languages.registerDocumentFormattingEditProvider({ language: 'javascript' }, {
    provideDocumentFormattingEdits: async (document) => {
      try { return replaceWholeDocument(document, await formatWithPrettier(document, 'javascript')); } catch (e: any) {
        vscode.window.showErrorMessage(`PBHJ JS format error: ${e?.message ?? String(e)}`);
        return [];
      }
    },
  });
  const phpProvider = vscode.languages.registerDocumentFormattingEditProvider({ language: 'php' }, {
    provideDocumentFormattingEdits: async (document) => {
      try { return replaceWholeDocument(document, await formatPhp(document)); } catch (e: any) {
        vscode.window.showErrorMessage(`PBHJ PHP format error: ${e?.message ?? String(e)}`);
        return [];
      }
    },
  });
  const bladeProvider = vscode.languages.registerDocumentFormattingEditProvider({ language: 'blade' }, {
    provideDocumentFormattingEdits: async (document) => {
      try { return replaceWholeDocument(document, await formatBlade(document)); } catch (e: any) {
        vscode.window.showErrorMessage(`PBHJ Blade format error: ${e?.message ?? String(e)}`);
        return [];
      }
    },
  });

  context.subscriptions.push(htmlProvider, jsProvider, phpProvider, bladeProvider);
}

export function deactivate() {}
