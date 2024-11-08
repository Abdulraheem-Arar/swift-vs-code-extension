// The Swift Programming Language
// https://docs.swift.org/swift-book

import Foundation
import SwiftParser
import SwiftSyntax



//print("test ,the file should print this")
//fflush(stdout)

class MethodVisitor: SyntaxVisitor {
    var methods: [(name: String, line: Int, column:Int)] = []
    var arguments: [(parameterType: String, line: Int)] = []
    private var insideClass: Bool = false
    private let sourceLocationConverter: SourceLocationConverter

    init(sourceLocationConverter: SourceLocationConverter) {
        self.sourceLocationConverter = sourceLocationConverter
        super.init(viewMode: .all)
    }

     override func visit(_ node: ClassDeclSyntax) -> SyntaxVisitorContinueKind {
    
        insideClass = true
        //print("Entered class: \(node.name.text)")
        return .visitChildren
    }
    
    override func visitPost(_ node: ClassDeclSyntax) {

        insideClass = false
        //print("Exited class: \(node.name.text)")
    }

    override func visit(_ node: FunctionDeclSyntax) -> SyntaxVisitorContinueKind {
      /*
      if(insideClass){
        if(node.signature.parameterClause.parameters.count>3){
          methods.append(node.name.text)
          let parameters = node.signature.parameterClause.parameters
          for parameter in parameters {
            arguments.append(parameter.type.description)
          }
          }
          //print("Found Method: \(node.name.text)")
          //print(node.signature.parameterClause.parameters.count)
      } 
      */
      if (insideClass && node.signature.parameterClause.parameters.count > 2) {
            let methodName = node.name.text
            let methodStartLoc = sourceLocationConverter.location(for: node.positionAfterSkippingLeadingTrivia)

            methods.append((name: methodName, line: methodStartLoc.line , column:methodStartLoc.column))

            let parameters = node.signature.parameterClause.parameters
            for parameter in parameters {
              let paramLoc = sourceLocationConverter.location(for: parameter.positionAfterSkippingLeadingTrivia)
                arguments.append((parameterType: parameter.type.description, line: paramLoc.line))
            }
      }
        return .visitChildren
    }
}



 func main() {
    guard CommandLine.arguments.count > 1 else {
    print("Usage: SWAN <path_to_file>")
    exit(1)
}
     let filePath = CommandLine.arguments[1] 
     //print(filePath)
  // let filePath = "./testing/tester.swift";

    guard FileManager.default.fileExists(atPath: filePath) else {
      print("File doesn't exist at path: \(filePath)")
      return
    }


    guard let file = try? String(contentsOfFile: filePath) else {
      print("File at path isn't readable: \(filePath)")
      return
    }

   let sourceFile = formatImports(in: file)
    let sourceLocationConverter = SourceLocationConverter(fileName: filePath, tree: sourceFile)
    let arguments = findArguments(in: sourceFile, sourceLocationConverter: sourceLocationConverter)
    let methods = findMethods(in: sourceFile, sourceLocationConverter: sourceLocationConverter)
    if let jsonData = try? JSONSerialization.data(withJSONObject: methods.map { ["name": $0.name, "line": $0.line, "column": $0.column] }, options: .prettyPrinted),
       let jsonString = String(data: jsonData, encoding: .utf8) {
        print(jsonString)
    }
}


 func formatImports(in file: String) -> SourceFileSyntax {
    let sourceFile = Parser.parse(source: file)
    return sourceFile
  }

 func findArguments(in file: SourceFileSyntax, sourceLocationConverter: SourceLocationConverter) -> [(parameterType: String, line: Int)] {
    let visitor = MethodVisitor(sourceLocationConverter: sourceLocationConverter)
    visitor.walk(file)
    return visitor.arguments
 }

   func findMethods(in file: SourceFileSyntax, sourceLocationConverter: SourceLocationConverter) -> [(name: String, line: Int, column: Int)] {
    let visitor = MethodVisitor(sourceLocationConverter: sourceLocationConverter)
    visitor.walk(file)
    return visitor.methods
 }
main()

