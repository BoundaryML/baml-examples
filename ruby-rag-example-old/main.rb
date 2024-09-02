#!/usr/bin/env ruby

require 'io/console'
require 'pp'
require 'stringio'

require_relative 'baml_client/client'
require_relative 'document'

$b = Baml.Client

def main
  puts "Welcome to our Ruby RAG demo!"
  puts "-----"

  print "Ask a question: "
  process_input gets.strip

  puts "-----"
  puts "Thank you for using our Ruby RAG demo!"
end

def backspace(prev_answer)
  term_width = IO.console.winsize[1]
  newline_count = prev_answer.split("\n").map { |line| line.length / term_width + 1 }.sum
  "\e[A" * (newline_count) + "\e[0J"
end

def process_input(input)
  # Here, you can define what you want to do with the input
  puts "You entered: #{input}"

  sio = StringIO.new
  prev_answer = ""
  # BUG: we don't handle SIGINT / SIGTERM correctly at all inside the FFI layer
  $b.stream.AnswerQuestion(question: input, context: Baml::Types::Context.new(documents: DOCUMENTS)).each_with_index do |partial_answer, i|
      begin
        citations = partial_answer.answersInText.map { |c| "[#{c.number}] #{c.relevantTextFromDocument}" }.join("\n")

        answer = <<~ANSWER
    Answer:
    #{partial_answer.answer}

    Citations:
    #{citations}

    (meta: #{i + 1} stream events received) 
    ANSWER

        print backspace(prev_answer)
        puts answer
        prev_answer = answer
      rescue => error
        puts "Uh-oh- an error happened!"
        puts error
      end
  end
end

# Run the application if this file is the direct script being executed
main if __FILE__ == $0