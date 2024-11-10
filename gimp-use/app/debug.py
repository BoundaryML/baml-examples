from baml_client.types import HistoryEntry

import pydantic
from pydantic_core import to_json
from typing import List

import json

def print_state(state: List[HistoryEntry]):
    print("locs:")
    print(state.important_locations)
    for (ind, entry) in enumerate([entry for entry in state.state_entries if entry is not None]):
        print("Ind: " + str(ind))
        print(f"request: {entry.request}")
        print(f"response: {to_json(entry.response)}")