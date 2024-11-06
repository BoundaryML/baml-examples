import os
from datetime import datetime, timedelta

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


def notion_message_category(message: MessageType) -> str:
    match message:
        case MessageType.FeatureRequest:
            return "Feature Request"
        case MessageType.BugReport:
            return "Bug Report"
        case MessageType.Uncategorized:
            return "Uncategorized"


@discord_client.event
async def on_ready():
    print(f'We have logged in as {discord_client.user}')

    # Fetch messages from the last week
    start_date = datetime.now() - timedelta(weeks=1)

    async for message in discord_client.get_channel(GENERAL_CHANNEL_ID).history(after=start_date):
        message_type = await b.ClassifyMessage(message.content)

        # Skip uncategorized messages
        if message_type == MessageType.Uncategorized:
            continue

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


discord_client.run(os.environ['DISCORD_BOT_TOKEN'])
