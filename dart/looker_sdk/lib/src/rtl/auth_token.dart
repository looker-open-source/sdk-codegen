class AuthAccessToken {
  final String _accessToken;
  final String _tokenType;
  final int _expiresIn;

  AuthAccessToken.fromResponse(Map map, String contentType)
      : _accessToken = map['access_token'],
        _tokenType = map['token_type'],
        _expiresIn = map['expires_in'];

  String get accessToken {
    return _accessToken;
  }

  String get tokenType {
    return _tokenType;
  }

  int get expiresIn {
    return _expiresIn;
  }
}

class AuthToken {
  AuthAccessToken accessToken;

  AuthToken();

  AuthToken.withToken(this.accessToken);

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
