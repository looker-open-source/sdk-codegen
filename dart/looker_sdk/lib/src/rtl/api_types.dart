class DelimList<T> {
  final List<T> _items;
  final String _separator;
  final String _prefix;
  final String _suffix;

  DelimList(List<T> items,
      [String separator = ',', String prefix = '', String suffix = ''])
      : _items = items,
        _separator = separator,
        _prefix = prefix,
        _suffix = suffix;

  @override
  String toString() {
    return '$_prefix${_items.join((_separator))}$_suffix';
  }
}
