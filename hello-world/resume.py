from baml_client import baml as b
import asyncio

async def main():
  resume = await b.ExtractResume(resume_text="""John Doe
Python, Rust
University of California, Berkeley, B.S. in Computer Science, 2020""")

  assert resume.name == "John Doe"
  assert len(resume.education) == 1

if __name__ == "__main__":
  asyncio.run(main())