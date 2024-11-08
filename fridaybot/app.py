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
    queue: asyncio.Queue[ClassifiedMessage | SummerizedThread]
):
    # Maps a message ID to the corresponding Notion page ID. That way we can
    # grab the page ID when we get the thread summary and append a block to the
    # notion page without querying the Notion database.
    threads: dict[int, str] = {}

    while True:
        task = await queue.get()

        if isinstance(task, ClassifiedMessage):
            message = task.message
            category = notion_message_category(task.message_type)

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
        elif isinstance(task, SummerizedThread):
            try:
                page_id = threads.pop(task.messages[0].id)
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
                                {"type": "text", "text": {"content": task.thread_summary}}
                            ]
                        },
                    },
                ])
            except KeyError:
                pass
        else:
            print(f"Ignoring unknown task type: {type(task)}", file=sys.stderr)

        # TODO: Add retry and backoff.
        # asyncio.sleep(NOTION_RATE_LIMIT)

        queue.task_done()


async def summerize_thread(thread: list[discord.Message], notion_request_queue: asyncio.Queue):
    conversation = [ThreadMessage(user_id=m.author.id, content=m.content) for m in thread]
    summary = await b.SummerizeThread(conversation)
    notion_request_queue.put_nowait(SummerizedThread(thread, summary))


async def classify_discord_messages(
    message_queue: asyncio.Queue[tuple[list[discord.Message], list[list[discord.Message]]]],
    notion_request_queue: asyncio.Queue[ClassifiedMessage | SummerizedThread],
):
    while True:
        messages, threads = await message_queue.get()

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

        # Now summarize all the threads after we've put all the messages in
        # the notion queue, that way by the time we have to insert the summary
        # the page ID for the thread message will be available. Summerizing
        # threads 
        for thread in threads:
            await summerize_thread(thread, notion_request_queue)

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

    batch = []
    threads = []

    discord_message_queue = asyncio.Queue()
    notion_request_queue = asyncio.Queue()

    notion_worker = asyncio.create_task(
        send_notion_requests(database["id"], notion_request_queue)
    )

    llm_worker = asyncio.create_task(
        classify_discord_messages(discord_message_queue, notion_request_queue)
    )

    channel = discord_client.get_channel(GENERAL_CHANNEL_ID)

    async for message in channel.history(after=args.after, before=args.before):
        # Skip messages like "user created thread"
        if message.type != discord.MessageType.default:
            continue

        # Skip empty messages
        if message.content.strip() == "":
            continue

        # Add message to batch.
        batch.append(message)

        # Add all threads to a separate list for later processing.
        if discord_thread := message.thread:
            thread = [message]
            async for thread_message in discord_thread.history():
                if len(message.content.strip()) > 0:
                    thread.append(thread_message)
            threads.append(thread)

        # Spawn task in the background and continue reading messages.
        if len(batch) >= MESSAGES_BATCH_SIZE:
            discord_message_queue.put_nowait((batch, threads))
            batch = []
            threads = []

    # Process remaining messages.
    if len(batch) > 0:
        discord_message_queue.put_nowait((batch, threads))

    # Wait for all requests to finish.
    await discord_message_queue.join()
    await notion_request_queue.join()

    # Cancel worker.
    llm_worker.cancel()
    notion_worker.cancel()

    # Wait for workers to finish.
    await asyncio.gather(llm_worker, notion_worker)

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
