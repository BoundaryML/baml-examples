from baml_client import baml as b
import asyncio

async def main():
  verb_list = await b.ExtractVerbs(
    "This is a paragraph"
  )

  if len(verb_list) == 1:
      print("There is 1 verb in this paragraph")
  else:
      print(f"There are {len(verb_list)} verb(s) in this paragraph")

if __name__ == "__main__":
  asyncio.run(main())