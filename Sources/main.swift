// The Swift Programming Language
// https://docs.swift.org/swift-book

import Foundation
import SwiftParser
import SwiftSyntax



print("test ,the file should print this")
fflush(stdout)

class MethodVisitor: SyntaxVisitor {
    var methods: [String] = []
    var arguments: [String] = []
    private var insideClass: Bool = false

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
        return .visitChildren
    }
}



 func main() {
    guard CommandLine.arguments.count > 1 else {
    print("Usage: SWAN <path_to_file>")
    exit(1)
}
     let filePath = CommandLine.arguments[1] 
     print(filePath)
  // let filePath = "./testing/tester.swift";

    guard FileManager.default.fileExists(atPath: filePath) else {
      print("File doesn't exist at path: \(filePath)")
      return
    }


    guard let file = try? String(contentsOfFile: filePath) else {
      print("File at path isn't readable: \(filePath)")
      return
    }

    let formattedFile = formatImports(in: file)
    //print(formattedFile) 
    let arguments = findArguments(in: formattedFile)
    print("Found arguments: \(arguments) where there are more than than 3 input arguments in one of your methods")
    
}


 func formatImports(in file: String) -> SourceFileSyntax {
    let sourceFile = Parser.parse(source: file)
    return sourceFile
  }

 func findArguments(in file: SourceFileSyntax) -> [String] {
    let visitor = MethodVisitor(viewMode: .all)
    visitor.walk(file)
    return visitor.arguments
 }

   
main()

