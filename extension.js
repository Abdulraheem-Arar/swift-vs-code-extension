// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cp = require('child_process');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "swiftDetect3" is now active!');

	function detectSwiftDocument(document) {
        if (document && document.languageId === 'swift') {
            vscode.window.showInformationMessage('Swift file detected: ' + document.fileName);
        }
    }

    // Detect when a Swift file is opened or active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            detectSwiftDocument(editor.document);
        }
    });

    // Detect already open Swift files when the extension is activated
    vscode.workspace.textDocuments.forEach(detectSwiftDocument);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('swiftDetect3.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from swift detect 3!');
	});

	const runCodeFile = vscode.commands.registerCommand('swiftDetect3.3parameters', function () {
		// The code you place here will be executed every time your command is executed
		const activeEditor = vscode.window.activeTextEditor;
        const analysisRootPath = '/home/abdulraheem/swiftDetect3/SWAN-static-analysis-'
		// Display a message box to the user
        if (activeEditor) {
            const filePath = activeEditor.document.fileName;
            const scriptPath = '/home/abdulraheem/swiftDetect3/SWAN-static-analysis-/Sources/main.swift';
            // Show a message that the file is running
            vscode.window.showInformationMessage('Running: ' + filePath);
            const outputChannel = vscode.window.createOutputChannel('Swift Analysis');
            outputChannel.show(); // Opens the output channel in the editor

            // Run the file using child_process (assuming it's a script or program that can be executed)
            cp.exec(`cd ${analysisRootPath} && swift run tests ${filePath}`, (error, stdout, stderr) => { // You can change 'node' to the appropriate command, e.g., 'swift' for Swift files
                if (error) {
                    outputChannel.appendLine(`Error: ${stderr}`);
                } else {
                    if (stdout) {
                        outputChannel.appendLine(`Output: ${stdout}`);
                    } else {
                        outputChannel.appendLine("No output returned from the script.");
                    }
                }
            });
        } else {
            vscode.window.showWarningMessage('No active editor with an open file.');
        }
		vscode.window.showInformationMessage('Hello World from swift detect 3!');
	});
	
	context.subscriptions.push(disposable,runCodeFile);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
