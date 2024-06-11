
from dotenv import load_dotenv

load_dotenv()

from baml_client.type_builder import TypeBuilder
from baml_client import b

def dynamicBuilder():
    tb = TypeBuilder()
    tb.DynamicOutput.add_property("name_of_property", tb.string().list())
    class_builder = tb.add_class("ClassIWant")
    class_builder.add_property("property1", tb.string().list())
    tb.DynamicOutput.add_property("MyClass", class_builder.type().list())
    print(tb.DynamicOutput.list_properties())

    output = b.TestFunction("My name is Harrison. My hair is black and I'm 6 feet tall.", {"tb": tb})
    print(output)