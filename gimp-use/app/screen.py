from baml_client.types import Coordinate
from baml_py import Image
import base64
from io import BytesIO
from typing import Optional, Tuple

import pyautogui


from PIL import ImageGrab, ImageDraw
import PIL

def screen_grab(compress: bool) -> Image:
    """
    Grab a screenshot, draw a fake mouse on it, and optionally compress it.
    """
    mousePos = pyautogui.position()
    screenshot = ImageGrab.grab(bbox=(0,0,800,600))
    x, y = mousePos
    draw = ImageDraw.Draw(screenshot)
    draw.ellipse([ x - 10,
                    y - 10,
                    x + 10,
                    y + 10
                    ],
                    fill="#007AFF"
                    )
    draw.ellipse([ x - 7,
                    y - 7,
                    x + 7,
                    y +7 
                    ],
                    fill="#FFFFFF"
                    )

    draw = ImageDraw.Draw(screenshot)
    for x in range(100,800, 100):
        draw.line((x,0,x,600),fill=0)
    for y in range(100,600,100):
        draw.line((0, y, 800, y),fill=0)
        
    # screenshot.show()
    image = image_to_base64(screenshot, compress)
    return image

def image_to_base64(image, compress):

    if image.mode == "RGBA":
        image = image.convert("RGB")

    buffer = BytesIO()
    quality = 10 if compress else 75
    image.save(buffer, format="JPEG", quality=quality)
    img_bytes = buffer.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode()
    return Image.from_base64(base64=img_base64, media_type="image/jpeg")


def screen_grab_with_grid() -> Image:
    screenshot = ImageGrab.grab(bbox=(0,0,800,600))
    draw = ImageDraw.Draw(screenshot)
    for x in range(100,800, 100):
        draw.line((x,0,x,600),fill=0)
    for y in range(100,600,100):
        draw.line((0, y, 800, y),fill=0)
    screenshot.show()

def click():
    pyautogui.click()

def moveTo(x: int, y: int):
    pyautogui.moveTo(x,y,0.5)

def move(x: int, y: int):
    pyautogui.move(x,y)

def stroke():
    pass
# def stroke(req: StrokeRequest):
#     def to_coord(v: Vector) -> Tuple[float, float]:
#         return (float(v.x), float(v.y))
#     x_0, y_0 = to_coord(req.start)
#     dx_1, dy_1 = to_coord(req.momentum)
#     x_1, y_1 = (x_0 + dx_1, y_0 + dy_1)
#     x_2, y_2 = to_coord(req.end)
# 
#     pyautogui.moveTo(round(x_0), round(y_0))
#     pyautogui.mouseDown(button='left')
#     def bezier(p_0,p_1,p_2,t):
#         return (1.0 - t**2.0)*p_0 + 2.0*(1.0 - t)*t*p_1 + t**2.0*p_2
# 
#     ts = [t/100.0 for t in range(0,100)]
#     for t in ts:
#         x = bezier(x_0, x_1, x_2, t)
#         y = bezier(y_0, y_1, y_2, t)
#         pyautogui.moveTo(round(x),round(y), 0.1)
#     pyautogui.mouseUp()