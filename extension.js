const vscode = require('vscode');
const analyze3Parameters = require('./analyze3Parameters');
const analyze2Parameters = require('./analyze2Parameters');

let currentModule;

function activate(context) {
    console.log('Extension is now active!');
   let diagnosticCollection = vscode.languages.createDiagnosticCollection('analyzeMethods')
    const analysisOptions = [
        { label: 'Analyze methods with more than 3 parameters', value: '3parameters' },
        { label: 'Analyze methods with more than 2 parameters', value: '2parameters' },
    ];

    const disposable = vscode.commands.registerCommand('swiftDetect3.menu', function () {
		showAnalysisOptions()
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from swift detect 3!');
	});

    function showAnalysisOptions() {
        vscode.window.showQuickPick(analysisOptions, { placeHolder: 'Select an analysis option' }).then(selection => {
            if (selection) {
                deactivateCurrentModule(); // Deactivate any currently active module

                // Activate the selected module
                if (selection.value === '3parameters') {
                    currentModule = analyze3Parameters;
                    currentModule.activate(context,diagnosticCollection);
                } else if (selection.value === '2parameters') {
                    currentModule = analyze2Parameters;
                    currentModule.activate(context,diagnosticCollection);
                }
            }
        });
    }

    function deactivateCurrentModule() {
        if (currentModule && currentModule.deactivate) {
            currentModule.deactivate();
        }
        currentModule = null;
    }

    context.subscriptions.push(disposable,{ dispose: deactivateCurrentModule });
    showAnalysisOptions();
}

function deactivate() {
    if (currentModule && currentModule.deactivate) {
        currentModule.deactivate();
    }
}

module.exports = { activate, deactivate };
