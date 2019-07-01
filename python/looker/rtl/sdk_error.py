class SDKError(Exception):
    """Base class for all SDK errors"""
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
