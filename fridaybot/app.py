import argparse
import asyncio
import os
import sys
from datetime import datetime
from typing import Optional

import discord
from dotenv import load_dotenv
from notion_client import AsyncClient

from baml_client import b
from baml_client.types import Message, MessageType

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

discord_client = discord.Client(intents=intents)
notion_client = AsyncClient(auth=os.environ["NOTION_API_KEY"])

# TODO: Env var.
GENERAL_CHANNEL_ID = 1119375594984050779
NOTION_PAGE_ID = "135bb2d2621680a99929f9a31e96c4bc"
# NOTION_DATABASE_ID = "135bb2d2621680078c17e5a4334cb855"

# 3 requests per second.
NOTION_RATE_LIMIT = 1/3


# Number of messages to fetch and send to LLM in a single batch.
MESSAGES_BATCH_SIZE = 10


# Just for type hinting.
class Args(argparse.Namespace):
    after: datetime
    before: Optional[datetime]


args = Args()


def notion_message_category(message: MessageType) -> str:
    match message:
        case MessageType.FeatureRequest:
            return "Feature Request"
        case MessageType.BugReport:
            return "Bug Report"
        case MessageType.Question:
            return "Question"
        case MessageType.Uncategorized:
            return "Uncategorized"


def format_time_period() -> str:
    after = args.after.strftime("%Y-%m-%d")
    before = (args.before or datetime.now()).strftime("%Y-%m-%d")

    return f"{after} to {before}"


async def insert_notion_rows(queue: asyncio.Queue):
    while True:
        request = await queue.get()
        await notion_client.pages.create(**request)
        # await asyncio.sleep(NOTION_RATE_LIMIT)
        queue.task_done()


async def classify_messages(database_id, messages: list[discord.Message], queue: asyncio.Queue):
    message_map = {message.id: message for message in messages}
    message_batch = list(map(lambda m: Message(id=m.id, content=m.content), messages))

    for classification in await b.ClassifyMessages(message_batch):
        # This should not happen but the LLM might return the wrong ID.
        if classification.message_id not in message_map:
            print(f"Ignoring message with unknown ID: {classification.message_id}", file=sys.stderr)
            continue

       # Skip uncategorized messages
        if classification.message_type == MessageType.Uncategorized:
            continue

        # Get the message object back.
        message = message_map[classification.message_id]

        # Put request in the queue.
        queue.put_nowait({
            "parent": {"database_id": database_id},
            "properties": {
                "Message": {
                    "rich_text": [{"text": {"content": message.content}}]
                },
                "Category": {
                    "select": {"name": notion_message_category(classification.message_type)}
                },
                "ID": {
                    "title": [{"text": {"content": str(message.id)}}]
                },
                "Link": {
                    "url": message.jump_url
                },
                "Created Date": {
                    "date": {"start": message.created_at.isoformat()}
                }
            }
        })


@discord_client.event
async def on_ready():
    print(f'We have logged in as {discord_client.user}')

    database = await notion_client.databases.create(
        parent={"type": "page_id", "page_id": NOTION_PAGE_ID},
        title= [{
            "type": "text",
            "text": {"content": format_time_period()}
        }],
        properties={
            "ID": {"title": {}},
            "Category": {
                "select": {
                    "options": [
                        {"name": "Feature Request", "color": "blue"},
                        {"name": "Bug Report", "color": "brown"},
                        {"name": "Uncategorized", "color": "pink"},
                        {"name": "Question", "color": "yellow"},
                        {"name": "General Feedback", "color": "default"},
                    ]
                },
            },
            "Message": {"rich_text": {}},
            "Link": {"url": {}},
            "Created Date": {"date": {}},
        }
    )

    print(f"Created database: {database['url']}")

    batch = []
    channel = discord_client.get_channel(GENERAL_CHANNEL_ID)

    notion_request_queue = asyncio.Queue()
    notion_worker = asyncio.create_task(insert_notion_rows(notion_request_queue))

    async with asyncio.TaskGroup() as tg:
        async for message in channel.history(after=args.after, before=args.before):
            # Skip messages like "user created thread"
            if message.type != discord.MessageType.default:
                continue

            # Skip empty messages
            if message.content.strip() == "":
                continue

            batch.append(message)

            # Spawn task in the background and continue reading messages.
            if len(batch) >= MESSAGES_BATCH_SIZE:
                tg.create_task(classify_messages(database["id"], batch, notion_request_queue))
                batch = []

        # Process remaining messages.
        if len(batch) > 0:
            tg.create_task(classify_messages(database["id"], batch, notion_request_queue))

    # Wait for all requests to finish.
    await notion_request_queue.join()

    # Cancel worker.
    notion_worker.cancel()
    # Wait for worker to finish. Maybe asyncio.gather() is not necessary but
    # couldn't get it to work otherwise.
    await asyncio.gather(notion_worker, return_exceptions=True)

    # Close connection to Discord.
    await discord_client.close()

    print(f"\n\nBatch {format_time_period()} completed")


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--after",
        type=datetime.fromisoformat,
        help="Start date for fetching messages",
        required=True,
    )

    parser.add_argument(
        "--before",
        type=datetime.fromisoformat, 
        help="End date for fetching messages",
    )

    global args
    args = Args(**vars(parser.parse_args()))

    if args.before is not None and args.before < args.after:
        parser.error("End date must be after start date")

    discord_client.run(os.environ['DISCORD_BOT_TOKEN'])


if __name__ == "__main__":
    main()
