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
from baml_client.types import Message, MessageType, ThreadMessage

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


class ClassifiedMessage:
    def __init__(self, message: discord.Message, type: MessageType):
        self.message = message
        self.message_type = type


class SummerizedThread:
    def __init__(self, messages: list[discord.Message], summary: str):
        self.messages = messages
        self.thread_summary = summary


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


async def send_notion_requests(
    database_id: str,
    request_queue: asyncio.Queue[ClassifiedMessage | SummerizedThread]
):
    # Maps a message ID to the corresponding Notion page ID. That way we can
    # grab the page ID when we get the thread summary and append a block to the
    # notion page without querying the Notion database.
    threads: dict[int, str] = {}

    while True:
        request = await request_queue.get()

        if isinstance(request, ClassifiedMessage):
            message = request.message
            category = notion_message_category(request.message_type)

            response = await notion_client.pages.create(
                parent={"database_id": database_id},
                properties={
                    "Message": {
                        "rich_text": [{"text": {"content": message.content}}]
                    },
                    "Category": {
                        "select": {"name": category}
                    },
                    "Message Type": {
                        "select": {"name": "Thread" if message.thread else "Default"}
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
            )

            if message.thread is not None:
                threads[message.id] = response["id"]
        elif isinstance(request, SummerizedThread):
            try:
                page_id = threads.pop(request.messages[0].id)
                await notion_client.blocks.children.append(page_id, children=[
                    {
                        "object": "block",
                        "type": "heading_2",
                        "heading_2": {
                            "rich_text": [{ "type": "text", "text": { "content": "Summary" } }]
                        }
                    },
                    {
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [
                                {"type": "text", "text": {"content": request.thread_summary}}
                            ]
                        },
                    },
                ])
            except KeyError:
                print(f"Failed to find page ID for message {request.messages[0].id}", file=sys.stderr)
        else:
            print(f"Ignoring unknown task type: {type(request)}", file=sys.stderr)

        # TODO: Add retry and backoff.
        # asyncio.sleep(NOTION_RATE_LIMIT)

        request_queue.task_done()


async def pull_discord_threads(
    thread_reading_queue: asyncio.Queue[discord.Message],
    thread_summary_queue: asyncio.Queue[list[discord.Message]]
):
    while True:
        message = await thread_reading_queue.get()

        if message.thread is None:
            continue

        thread = [message]
        async for thread_message in message.thread.history():
            thread.append(thread_message)
        
        thread_summary_queue.put_nowait(thread)

        thread_reading_queue.task_done()


async def summerize_threads(
    thread_summary_queue: asyncio.Queue[list[discord.Message]],
    notion_request_queue: asyncio.Queue[SummerizedThread | ClassifiedMessage]
):
    while True:
        thread = await thread_summary_queue.get()
        summary = await b.SummerizeThread(
            [ThreadMessage(user_id=m.author.id, content=m.content) for m in thread]
        )

        notion_request_queue.put_nowait(SummerizedThread(thread, summary))

        thread_summary_queue.task_done()


async def classify_discord_messages(
    message_queue: asyncio.Queue[list[discord.Message]],
    notion_request_queue: asyncio.Queue[ClassifiedMessage | SummerizedThread],
    thread_reading_queue: asyncio.Queue[discord.Message],
):
    while True:
        messages = await message_queue.get()

        mapping = {message.id: message for message in messages}
        batch = [Message(id=m.id, content=m.content) for m in messages]

        for classification in await b.ClassifyMessages(batch):
            # This should not happen but the LLM might return the wrong ID.
            if classification.message_id not in mapping:
                print(f"Ignoring message with unknown ID: {classification.message_id}", file=sys.stderr)
                continue

            # Skip uncategorized messages
            if classification.message_type == MessageType.Uncategorized:
                continue

            # Get the message object back.
            message = mapping[classification.message_id]

            # Put message in the queue for Notion.
            notion_request_queue.put_nowait(ClassifiedMessage(message, classification.message_type))

            # Now that we've put the message request in the notion queue we can
            # safely pull the thread and summerize it, since notion requests are
            # processed in order which means by the time we get the thread
            # summary the Notion page for that thread will already exist.
            if message.thread is not None:
                thread_reading_queue.put_nowait(message)

        message_queue.task_done()


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
                    ]
                },
            },
            "Message": {"rich_text": {}},
            "Message Type": {
                "select": {
                    "options": [
                        {"name": "Thread", "color": "green"},
                        {"name": "Default", "color": "blue"},
                    ]
                },
            },
            "Link": {"url": {}},
            "Created Date": {"date": {}},
        }
    )

    print(f"Created database: {database['url']}")

    message_queue = asyncio.Queue()
    thread_reading_queue = asyncio.Queue()
    thread_summary_queue = asyncio.Queue()
    notion_request_queue = asyncio.Queue()

    async with asyncio.TaskGroup() as tg:
        # Spawn workers.
        workers = [tg.create_task(t) for t in (
            send_notion_requests(database["id"], notion_request_queue),
            classify_discord_messages(message_queue, notion_request_queue, thread_reading_queue),
            pull_discord_threads(thread_reading_queue, thread_summary_queue),
            summerize_threads(thread_summary_queue, notion_request_queue),
        )]

        batch = []

        channel = discord_client.get_channel(GENERAL_CHANNEL_ID)

        # Read messages in batches.
        async for message in channel.history(after=args.after, before=args.before):
            # Skip messages like "user created thread"
            if message.type != discord.MessageType.default:
                continue

            # Skip empty messages
            if message.content.strip() == "":
                continue

            batch.append(message)

            # Put batch in the queue and continue reading messages.
            if len(batch) >= MESSAGES_BATCH_SIZE:
                message_queue.put_nowait(batch)
                batch = []

        # Process remaining messages.
        if len(batch) > 0:
            message_queue.put_nowait(batch)

        # Wait for all requests to finish.
        for queue in [message_queue, thread_reading_queue, thread_summary_queue, notion_request_queue]:
            await queue.join()

        # Cancel workers.
        for worker in workers:
            worker.cancel()

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
