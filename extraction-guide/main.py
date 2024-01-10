from baml_client import baml as b
# Import your generated Email model. 
# We generate this pydantic model for you.
from baml_client.baml_types import Email
import asyncio

# You can call a specific version using
# b.GetOrderInfoV1.get_impl("version1").run(Email(...). Otherwise it will use the default_impl in the function definition.
async def main():
  order_info = await b.GetOrderInfo(Email(
      subject="Order #1234",
      body="Your order has been shipped. It will arrive on 1st Jan 2022. Product: iPhone 13. Cost: $999.99"
  ))

  # This is all fully typed for you:
  if order_info.cost > 1000:
      print("You spent a lot of money!")
  elif order_info.cost > 500:
      print("You spent a moderate amount of money!")
  else:
      print("You spent a little money!")

if __name__ == "__main__":
  asyncio.run(main())