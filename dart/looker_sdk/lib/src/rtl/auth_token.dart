class AuthAccessToken {
  String _accessToken;
  String _tokenType;
  int _expiresIn;

  AuthAccessToken.fromJson(Map map)
      : _accessToken = map["access_token"],
        _tokenType = map["token_type"],
        _expiresIn = map["expires_in"];

  get accessToken {
    return _accessToken;
  }

  get tokenType {
    return _tokenType;
  }

  get expiresIn {
    return _expiresIn;
  }
}

class AuthToken {
  AuthAccessToken accessToken;

  AuthToken() {}

  AuthToken.withToken(AuthAccessToken this.accessToken) {}

  bool isActive() {
    return accessToken != null;
  }

  void setAccessToken(AuthAccessToken accessToken) {
    this.accessToken = accessToken;
  }

  void reset() {
    accessToken = null;
  }
}
