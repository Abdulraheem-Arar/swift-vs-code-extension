// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SWAN-static-analysis-",
    platforms: [
        .macOS(.v10_15) // Adjust based on your requirements
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-syntax.git", branch: "main") // Ensure this matches your Swift version
    ],
    targets: [
        .executableTarget(
            name: "tests",
            dependencies: [
                .product(name: "SwiftSyntax", package: "swift-syntax"),
                .product(name: "SwiftParser", package: "swift-syntax"),
            ],
            path: "Sources"
        ),
    ]
)
