generator lang_typescript {
  output_type "python/pydantic"
  output_dir "../"
  version "0.53.0"
}

class DynamicOutput {
  @@dynamic
} 