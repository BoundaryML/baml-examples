enum ActionType {
    MouseMove @description("Move the mouse to the given coordinate")
    LeftClick
    LeftClickDrag @description("Drag the mouse to the given coordinate, creating a line")
    Screenshot @description("Take a screenshot")
    CursorPosition @description("Get the current position of the cursor")
}

class Coordinate {
    x int @description("Pixels to the left")
    y int @description("Pixels down")
}

class Action {
  action_type ActionType
  coordinate Coordinate?
}

// A pair of request from the LLM and response from the tool,
// that occurred some time in the past.
class HistoryEntry {
    request Action
    response Coordinate | image | null
}

// The LLM's job is to perform an action, given a memory of its
// past input and past working memory.
function GenerateAction(history: HistoryEntry[]) -> Action {
  client Claude
  prompt #"
    
    Use a mouse and keyboard to interact with a computer, and take screenshots.
    * This is an interface to a desktop GUI. GIMP is started but it is not the focused window. You have to click it to focus it.
    * Some applications may take time to start or process actions, so you may need to wait and take successive screenshots to see the results of your actions. E.g. if you click on Firefox and a window doesn't open, try taking another screenshot.
    * The screen's resolution is 800x600.
    * The display number is 0
    * Whenever you intend to move the cursor to click on an element like an icon, you should consult a screenshot to determine the coordinates of the element before moving the cursor.
    * If you tried clicking on a program or link but it failed to load, even after waiting, try adjusting your cursor position so that the tip of the cursor visually falls on the element that you want to click.
    * Make sure to click any buttons, links, icons, etc with the cursor tip in the center of the element. Don't click boxes on their edges unless asked.
    * When seeking a target in the image, always prefer MouseNudge over MouseMove. If the mouse (blue circle)
      is above your target, nudge with a small positive y. If the mouse is to the left of the target, use a small
      positive x.

    { _.role("user")}
    Here is the list of previous commands you issued and their results (most recent is first):

    --- 
    {% for entry in history %}
    Request:
    {{ entry.request }}

    Response:
    {{ entry.response }}

    {% endfor %}

    When you generate an action, explain your reasoning. Is the current mouse position below the target?
    If so, is that why you are issuing a MouseMove with a higher y coordinate? Is your mouse on the target?
    Is this why you are clicking? Be sure to use a screenshot to verify any claims you make. Be as specific
    as possible. Screenshots will have a black grid overlayed, with a gridline every 100 pixels. Count gridlines
    from the left and top to get a rough estimate of the x and y coordinates of your target, then do your best
    to precisely interpolate the target's position between the grid markers.

    Always put your reasoning first, and specify the action to select at the end. Do not use JSON syntax
    when discussing future actions. Only put the one desired action in JSON.

    When choosing your next action, analyze your most recent intention to see if
    it's satisfied and you can move to the next step, or if you still have work to do
    to meet that intention.

    "Screenshot" should be used frequently to understand the current state of the canvas.
    "MouseMove" is the command for setting your paintbrush's starting location.
    "LeftClickDrag" is the command for creating a line. If your intention is to draw, this should be your action.

    If your previous action was "LeftClickDrag", take a screenshot to evaluate your line.
    If your previous intent was to move the mouse, and you did move it, take a screenshot
    to verify the cursor position matches your intent.
    If the n-2 intention was to move the mouse in preparation for the line, and n-1 screenshot
    produced a good start position, then go ahead and draw a line now.

    If your goal stack doesn't have something specific like "Move the cursor to (123,456)" at the top of the
    stack, generate a highly detailed goal stack. If you detect that the goal at the top of the stack has
    been met, pop it off for your generated action. Add a new sub-goal only if needed.

    Again, if you are drawing a line that satisfies your current goal, delete that goal from your goal
    stack in the next action you produce.

    Here is an example of a good goal stack:
    ["Drag to (234,345)", "Asses head line with screenshot", "Draw the horse's head", "Assess head with screenshot", "Draw the horse's body", "Draw a horse")]

    Here is another example of a good goal stack:
    ["Move the mouse near the nose location", "Find coordinates where the nose should go", "Draw a nose"]

    If you encounter this goal stack, you should execute the draw command and put a new goal on the
    stack that will help you draw the rest of the horse's head.

    If your history is empty, get your cursor to 400,400 and your goal stack should be ["Draw a horse"].

    Otherwise, continue working down your goal stack.

    {{ ctx.output_format }}
  "#
}

test TestInit {
  functions [GenerateAction]
  args {
    state {
        state_entries []
        goal_stack ["understand current canvas state"]
        important_locations {}
    }
  }
}

test TestSingleEntry {
  functions [GenerateAction]
  args {
    state {
        important_locations {}
        state_entries [
            {
                notes []
                sample_result {
                    image {
                        url "https://example.com/image"
                    }
                }
            },
            null
        ]
        goal_stack ["understand current canvas state"]
    }
  }
}
