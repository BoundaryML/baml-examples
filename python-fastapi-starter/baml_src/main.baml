generator lang_typescript {
  output_type "python/pydantic"
  output_dir "../"
  version "0.72.0"
  default_client_mode "sync"
}

class DynamicOutput {
  @@dynamic
} 