def parse_phone_number(phone: str) -> dict:
    """
    Parse a phone number with country code into country code and local number.
    
    Args:
        phone (str): Phone number with optional country code (e.g., '+91 8462866771')
    
    Returns:
        dict: A dictionary with 'country_code' and 'number' keys
    """
    # Remove leading '+' and split
    if phone.startswith('+'):
        phone = phone.lstrip('+')
    
    parts = phone.split(' ', 1)
    
    if len(parts) > 1:
        country_code = parts[0]
        number = parts[1].replace(' ', '')
    else:
        country_code = '1'
        number = phone.replace(' ', '')
    
    return {
        'country_code': country_code,
        'number': number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    }
