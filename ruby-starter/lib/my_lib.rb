# frozen_string_literal: true

require_relative "my_lib/version"
require_relative "baml_client/client"

module MyLib
  class Error < StandardError; end
  
  def self.hello
    "Hello World"
  end
end

require_relative "baml_client/client"

def example(raw_resume)
    # r is an instance of Baml::Types::Resume, defined in baml_client/types
    r = Baml.Client.ExtractResume(resume: raw_resume)

    puts "ExtractResume response:"
    puts r.inspect
end

def example_stream(raw_resume)
    stream = Baml.Client.stream.ExtractResume(resume: raw_resume)

    stream.each do |msg|
        # msg is an instance of Baml::PartialTypes::Resume
        # defined in baml_client/partial_types
        puts msg.inspect
    end

    stream.get_final_response
end

example 'Grace Hopper created COBOL'
example_stream 'Grace Hopper created COBOL'

