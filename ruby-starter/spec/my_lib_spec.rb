# frozen_string_literal: true

RSpec.describe MyLib do
  it "has a version number" do
    expect(MyLib::VERSION).not_to be nil
  end

  it "does something useful" do
    expect(false).to eq(true)
  end

  it "says hello" do
    expect(MyLib.hello).to eq("Hello World")
  end
end
