def without_z1k1s(zobject):
    new_object = {}
    for key, value in zobject.items():
        if key == "Z1K1":
            continue
        if isinstance(value, dict):
            value = without_z1k1s(value)
        new_object[key] = value
    return new_object
