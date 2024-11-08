// analyze3Parameters.js
const vscode = require('vscode');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');


let characterChangeCount = 0;
const CHANGE_THRESHOLD = 40;

function activate(context,diagnosticCollection) {

  

   function detectSwiftDocument(document) {
        if (document && document.languageId === 'swift') {
            //vscode.window.showInformationMessage('Swift file detected: ' + document.fileName);
            vscode.commands.executeCommand('swiftDetect3.2parameters')
        }
    }

    // Detect when a Swift file is opened or active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor,document) => {
        if (editor) {
            detectSwiftDocument(document)
        }
    });
    
    vscode.workspace.onDidSaveTextDocument(document => {
            detectSwiftDocument(document)
    });
    
    vscode.workspace.onDidChangeTextDocument(event => {
        const changes = event.contentChanges;
        //console.log(changes)
        changes.forEach(change => {
            characterChangeCount += change.text.length;
        });

        if (characterChangeCount >= CHANGE_THRESHOLD) {
            characterChangeCount = 0; // Reset counter after reaching the threshold
            vscode.commands.executeCommand('swiftDetect3.2parameters')// Run your analysis
        }
    });

    // Detect already open Swift files when the extension is activated
    vscode.workspace.textDocuments.forEach(detectSwiftDocument);

	const runCodeFile = vscode.commands.registerCommand('swiftDetect3.2parameters', function () {
		// The code you place here will be executed every time your command is executed
		const activeEditor = vscode.window.activeTextEditor;
        const analysisRootPath = '/home/abdulraheem/swiftDetect3/SWAN-static-analysis-'
		// Display a message box to the user
        if (activeEditor) {

        const documentContent = activeEditor.document.getText();
        const outputChannel = vscode.window.createOutputChannel('Swift Analysis');

        // Create a temporary file to store unsaved document content
        const tempFilePath = path.join(os.tmpdir(), `tempSwiftFile_${Date.now()}.swift`);
        fs.writeFileSync(tempFilePath, documentContent)

        //vscode.window.showInformationMessage('Running analysis on temporary file: ' + tempFilePath);

            cp.exec(`cd ${analysisRootPath} && swift run 2params ${tempFilePath}`, (error, stdout, stderr) => { 
                if (error) {
                    outputChannel.show();
                    outputChannel.appendLine(`Error: ${stderr}`);
                } else if (stdout) {
                    try {
                        const flaggedMethods = JSON.parse(stdout);  // Parse JSON output
                        let diagnostics = []
                        if (flaggedMethods.length > 0) {
                            flaggedMethods.forEach(method => {
                               // outputChannel.appendLine(`Flagged Method: ${method.name} at Line: ${method.line}`);
                                const range = new vscode.Range(new vscode.Position(method.line - 1, method.column -1), new vscode.Position(method.line - 1, method.column -1));
                                const diagnostic = new vscode.Diagnostic(range, `Method ${method.name} has more than 3 parameters`, vscode.DiagnosticSeverity.Warning); 
                                diagnostics.push(diagnostic) 
                            });
                            diagnosticCollection.set(activeEditor.document.uri, diagnostics);
                        } else {
                            //outputChannel.show();
                            //outputChannel.appendLine("No methods with more than 3 parameters were found.");
                        }
                    } catch (parseError) {
                        outputChannel.show();
                        outputChannel.appendLine(`Failed to parse output: ${parseError.message}`);
                    }
                }
                fs.unlinkSync(tempFilePath);
            });
        } else {
            vscode.window.showWarningMessage('No active editor with an open file.');
        }
    });
	
	context.subscriptions.push(runCodeFile,diagnosticCollection);
}

function deactivate() {
   
}

module.exports = { activate, deactivate };
