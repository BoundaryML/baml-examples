// All baml projects require a main.baml file in the root directory
// Tip: Make sure you've got the VSCode extension for .baml files installed

generator Default {
    language "python"
    project_root "../"
    test_command "poetry run python -m pytest"
    install_command "poetry add baml@latest"
    package_version_command "poetry show baml"
}

// Add your functions down here from the tutorials in 
// https://docs.boundaryml.com/v3/guides/hello_world/level0