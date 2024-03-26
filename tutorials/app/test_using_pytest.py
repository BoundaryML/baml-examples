from baml_client import baml as b
from baml_client.baml_types import Email
from baml_client.testing import baml_test

# For adding assertions or adding more complex test, you can
# use pytest and @baml_test decorator.
# Run `poetry run python -m pytest -m baml_test` in this directory.
# Setup Boundary Studio to see test details!
@baml_test
async def test_get_order_info():
  order_info = await b.GetOrderInfo(Email(
      subject="Order #1234",
      body="Your order has been shipped. It will arrive on 1st Jan 2022. Product: iPhone 13. Cost: $999.99"
  ))

  assert order_info.cost == 999.99

      