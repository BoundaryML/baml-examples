from event_loop import respond
from screen import screen_grab

from baml_py import Image
from baml_client.types import HistoryEntry
from baml_client.type_builder import TypeBuilder
from baml_client import b
from concurrent.futures import ThreadPoolExecutor
import threading
import asyncio

import asyncio
import os
import pyautogui
from pydantic_core import to_json

from app_dash import app, counter, MAX_COUNT, state


async def run():
    """
    Generate an initial state, make the LLM propose an action,
    and handle the action request, until the action responder
    detects that we are done (which it signals by returning
    None as the new state).
    """
    global state
    global counter

    while counter < MAX_COUNT:
        action = await b.GenerateAction(state)
        print(action)
        response = await respond(action)
        state.insert(0,HistoryEntry(request=action, response=response))
        counter = counter + 1
        print(counter)
        # print_state(state)

def run_async_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run())
    loop.close()

if __name__ == "__main__":
    if os.environ.get("DASH") is not None:
        executor = ThreadPoolExecutor(max_workers=1)
        future = executor.submit(run_async_loop)
        app.run_server(debug=False)
        executor.shutdown(wait=True)
    else:
        asyncio.run(run())