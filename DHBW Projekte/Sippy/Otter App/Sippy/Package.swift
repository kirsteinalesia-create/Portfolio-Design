// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Sippy",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "Sippy", targets: ["Sippy"])
    ],
    targets: [
        .executableTarget(
            name: "Sippy",
            path: "Sources/Sippy",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
