import argparse
import os
from datetime import datetime
from typing import Optional

import discord
from dotenv import load_dotenv
from notion_client import AsyncClient

from baml_client import b
from baml_client.types import MessageType

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

discord_client = discord.Client(intents=intents)
notion_client = AsyncClient(auth=os.environ["NOTION_API_KEY"])

# TODO: Env var.
GENERAL_CHANNEL_ID = 1119375594984050779
NOTION_PAGE_ID = "135bb2d2621680a99929f9a31e96c4bc"
NOTION_DATABASE_ID = "135bb2d2621680078c17e5a4334cb855"


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


@discord_client.event
async def on_ready():
    print(f'We have logged in as {discord_client.user}')

    channel = discord_client.get_channel(GENERAL_CHANNEL_ID)

    async for message in channel.history(after=args.after, before=args.before):
        # Skip messages like "user created thread"
        if message.type != discord.MessageType.default:
            continue

        # Skip empty messages
        if message.content.strip() == "":
            continue

        # Classify message
        message_type = await b.ClassifyMessage(message.content)

        # Skip uncategorized messages
        if message_type == MessageType.Uncategorized:
            continue

        # Insert row into Notion DB
        await notion_client.pages.create(
            parent={"database_id": NOTION_DATABASE_ID},
            properties={
                "Message": {
                    "rich_text": [{"text": {"content": message.content}}]
                },
                "Category": {
                    "select": {"name": notion_message_category(message_type)}
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

    print(f"\n\nBatch {args.after} to {args.before or datetime.now()} completed")
    await discord_client.close()

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
