from baml_client import baml as b

# Import your generated Email model.
# We generate this pydantic model for you.
from baml_client.baml_types import Category
import asyncio


# You can call a specific version using
# b.GetOrderInfoV1.get_impl("version1").run(Email(...). Otherwise it will use the default_impl in the function definition.
async def main():
    category = await b.ClassifyMessage("I want to cancel my order")
    if category == Category.CancelOrder:
        print("Customer wants to cancel order")
    else:
        print("Customer wants to {}".format(category))


if __name__ == "__main__":
    asyncio.run(main())
