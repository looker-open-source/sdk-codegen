class DelimList<T> {
  List<T> _items;
  String _separator;
  String _prefix;
  String _suffix;

  DelimList(List<T> items,
      [String separator = ',', String prefix = '', String suffix = ''])
      : _items = items,
        _separator = separator,
        _prefix = prefix,
        _suffix = suffix;

  String toString() {
    return "$_prefix${_items.join((_separator))}$_suffix";
  }
}
