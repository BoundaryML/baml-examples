from datetime import datetime

def unix_now() -> int:
    return int(datetime.now().timestamp())