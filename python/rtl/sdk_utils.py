import json

"""
    LookerSDK Python Utility functions
"""


def toJson(value):
    """Converts any value to a JSON object, not the stringify version"""
    dump = json.dumps(value)
    return json.loads(dump)


def selfLess(dictionary: dict, exclude=None) -> dict:  # TODO : list[str] = []) -> dict:
    """Used to strip 'self' and None values from a dictionary, probably from a call to `locals()`
    :rtype: dict
    """
    if exclude is None:
        exclude = []
    return {k: v for (k, v) in dictionary.items() if v is not None and k is not 'self' and k not in exclude}


def noNones(dictionary: dict, exclude=None) -> dict:
    """Used to strip None values from a dictionary
    :rtype: dict
    """
    return {k: v for (k, v) in dictionary.items() if v is not None and k not in exclude}

