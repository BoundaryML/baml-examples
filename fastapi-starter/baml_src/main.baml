generator lang_typescript {
  output_type "python/pydantic"
  output_dir "../"
}

class DynamicOutput {
  @@dynamic
} 