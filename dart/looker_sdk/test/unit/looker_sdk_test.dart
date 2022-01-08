import 'package:test/test.dart';
import 'package:looker_sdk/looker_sdk.dart';

void main() {
  test('DelimList', () {
    var d = DelimList([]);
    expect(d.toString(), equals(''));
    d = DelimList(['X']);
    expect(d.toString(), equals('X'));
    d = DelimList(['X', 'Y']);
    expect(d.toString(), equals('X,Y'));
    d = DelimList(['X', 'Y'], ' ');
    expect(d.toString(), equals('X Y'));
    d = DelimList(['X', 'Y'], ',', '\\');
    expect(d.toString(), equals('\\X,Y'));
    d = DelimList(['X', 'Y'], ',', '', '/');
    expect(d.toString(), equals('X,Y/'));
    d = DelimList(['X', 'Y'], ',', '"', '"');
    expect(d.toString(), equals('"X,Y"'));
  });

  test('model non json fromResponse', () {
    var td = '';
    var v = AlertAppliedDashboardFilter.fromResponse(td, 'application/json');
    expect(v.apiResponseContentType, equals('application/json'));
    expect(v.apiRawResponse, equals(td));
    expect(v.filterTitle, isNull);
    expect(v.getApiRawValue('filter_title'), isNull);
    expect(v.fieldName, isNull);
  });

  test('model basic json fromResponse', () {
    var td = {'filter_title': 'Filter Title'};
    var v = AlertAppliedDashboardFilter.fromResponse(td, 'application/json');
    expect(v.apiResponseContentType, equals('application/json'));
    expect(v.apiRawResponse, equals(td));
    expect(v.filterTitle, equals('Filter Title'));
    expect(v.getApiRawValue('filter_title'), equals('Filter Title'));
    expect(v.fieldName, isNull);
  });

  test('model basic toJson fromResponse constructor', () {
    var td = {'filter_title': 'Filter Title'};
    var v = AlertAppliedDashboardFilter.fromResponse(td, 'application/json');
    expect(v.toJson(), equals(td));
  });

  test('model basic toJson fromResponse constructor updated', () {
    var td = {'filter_title': 'Filter Title'};
    var v = AlertAppliedDashboardFilter.fromResponse(td, 'application/json');
    v.filterTitle = null;
    v.filterDescription = 'No filter';
    expect(v.toJson(),
        equals({'filter_title': null, 'filter_description': 'No filter'}));
  });

  test('model basic toJson default constructor', () {
    var v = AlertAppliedDashboardFilter();
    expect(v.toJson(), equals({}));
  });

  test('property named default', () {
    var json = {'default': 'DEFAULT'};
    var v = DataActionFormField.fromResponse(json, 'application/json');
    expect(v.defaultValue, equals('DEFAULT'));
    expect(v.toJson(), equals(json));
    v.defaultValue = 'UPDATED_DEFAULT';
    expect(v.defaultValue, equals('UPDATED_DEFAULT'));
    expect(v.toJson(), equals({'default': 'UPDATED_DEFAULT'}));
  });

  test('DateTime property', () {
    var v = Board();
    expect(v.createdAt, isNull);
    expect(v.toJson(), equals({}));
    v.createdAt = DateTime(2022, 1, 11, 20, 42, 59);
    expect(v.createdAt, equals(DateTime(2022, 1, 11, 20, 42, 59)));
    expect(v.toJson(), {'created_at': '2022-01-11T20:42:59.000'});
    v = Board.fromResponse({'created_at': '2021-08-13T19:04:02.308+00:00'}, '');
    expect(v.createdAt.toIso8601String(), equals('2021-08-13T19:04:02.308Z'));
  });

  test('primitive array', () {
    var v = DBConnection();
    expect(v.userAttributeFields, isNull);
    expect(v.toJson(), equals({}));
    var a = <String>[];
    v.userAttributeFields = a;
    expect(v.userAttributeFields, equals([]));
    a.add('ABCD');
    expect(v.userAttributeFields, equals(['ABCD']));
    expect(
        v.toJson(),
        equals({
          'user_attribute_fields': ['ABCD']
        }));
    v = DBConnection.fromResponse({
      'user_attribute_fields': ['WXYX']
    }, '');
    expect(v.userAttributeFields, equals(['WXYX']));
    expect(
        v.toJson(),
        equals({
          'user_attribute_fields': ['WXYX']
        }));
  });

  test('enum type', () {
    var v = ProjectWorkspace();
    expect(v.dependencyStatus, isNull);
    v.dependencyStatus = DependencyStatus.installNone;
    expect(v.dependencyStatus, DependencyStatus.installNone);
    expect(v.toJson(), equals({'dependency_status': 'install_none'}));
    v = ProjectWorkspace.fromResponse(
        {'dependency_status': 'lock_optional'}, '');
    expect(v.dependencyStatus, DependencyStatus.lockOptional);
  });

  test('Map type', () {
    var v = DBConnection();
    expect(v.can, isNull);
    expect(v.toJson(), equals({}));
    var p = {'index': true};
    v.can = p;
    expect(v.can, equals({'index': true}));
    expect(
        v.toJson(),
        equals({
          'can': {'index': true}
        }));
    v = DBConnection.fromResponse({
      'can': {'show': true}
    }, '');
    expect(v.can, equals({'show': true}));
    expect(
        v.toJson(),
        equals({
          'can': {'show': true}
        }));
  });

  test('Custom property', () {
    var v = DataActionForm();
    expect(v.state, isNull);
    expect(v.toJson(), equals({}));
    v.state = DataActionUserState();
    expect(v.state, isNotNull);
    expect(v.toJson(), equals({'state': {}}));
    v.state.data = 'ABCD';
    expect(
        v.toJson(),
        equals({
          'state': {'data': 'ABCD'}
        }));
    v = DataActionForm.fromResponse({
      'state': {'data': 'WXYZ'}
    }, '');
    expect(v.state.toJson(), equals({'data': 'WXYZ'}));
  });

  test('Custom property array', () {
    var v = DataActionForm();
    v.fields = [];
    expect(v.fields, equals([]));
    expect(v.toJson(), equals({'fields': []}));
    v.fields.add(DataActionFormField());
    expect(
        v.toJson(),
        equals({
          'fields': [{}]
        }));
    v.fields[0].label = 'test label';
    expect(
        v.toJson(),
        equals({
          'fields': [
            {'label': 'test label'}
          ]
        }));
    v = DataActionForm.fromResponse({
      'fields': [
        {'label': 'label test 1'},
        {'label': 'label test 2'}
      ]
    }, '');
    expect(v.fields[0].label, equals('label test 1'));
    expect(v.fields[1].label, equals('label test 2'));
  });
}
