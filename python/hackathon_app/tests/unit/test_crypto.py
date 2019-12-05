from sheets import decrypt, encrypt, get_crypto_key


def test_crypto_key():
    """Test for creation and retrieval of the crypto key"""
    key = get_crypto_key()
    assert key is not None


def test_encrypt_decrypt():
    """Test that decrypt works for encrypted values"""
    value = 'This is my test string!'
    encrypted = encrypt(value)
    decrypted = decrypt(encrypted)
    assert decrypted == value
