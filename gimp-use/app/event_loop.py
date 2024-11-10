from baml_client.types import HistoryEntry, Coordinate, Action, ActionType
from baml_client import b
from baml_py import Image

from screen import screen_grab, click, moveTo, move, stroke
from debug import print_state

import pyautogui

from typing import List, Optional


async def respond(action) -> Coordinate | Image | None:
    """
    For a single state and action, execute the action and
    update the state accordingly
    """

    match action.action_type:
        case ActionType.LeftClick:
            click()
            return None

        case ActionType.LeftClickDrag:
            coordinate = action.coordinate
            pyautogui.mouseDown(button='left')
            pyautogui.moveTo(coordinate.x, coordinate.y, 0.5)
            pyautogui.mouseUp(button='left')
            return None

        case ActionType.MouseMove:
            coordinate = action.coordinate
            moveTo(coordinate.x, coordinate.y)
            return None

        case ActionType.Screenshot:
            screen = screen_grab(False)
            return screen
        
        case ActionType.CursorPosition:
            x,y = pyautogui.position()
            return Coordinate(x=x, y=y)

        case _:
            print(f"UNKNOWN COMMAND {action.action_type}")
            return None