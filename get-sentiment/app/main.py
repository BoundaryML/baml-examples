import asyncio
from baml_client import baml as b

async def run_program():
  sentiment = await b.GetDetailedSentiment("I'm feeling ok today..")
  sentiment.senti


if __name__ == "__main__":
  asyncio.run(run_program())