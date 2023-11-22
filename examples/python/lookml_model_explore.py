"""Port of ruby "Creating a Data Dictionary"

https://github.com/llooker/powered_by_modules/blob/master/Use%20Cases/Data%20Dictionary.md
"""

import looker_sdk


def get_field_values(model_name, explore_name):

    sdk = looker_sdk.init40()

    # API Call to pull in metadata about fields in a particular explore
    explore = sdk.lookml_model_explore(
        lookml_model_name=model_name,
        explore_name=explore_name,
        fields="id, name, description, fields",
    )

    my_fields = []

    # Iterate through the field definitions and pull in the description, sql,
    # and other looker tags you might want to include in  your data dictionary.
    if explore.fields and explore.fields.dimensions:
        for dimension in explore.fields.dimensions:
            dim_def = {
                "field_type": "Dimension",
                "view_name": dimension.view_label,
                "field_name": dimension.label_short,
                "type": dimension.type,
                "description": dimension.description,
                "sql": dimension.sql,
            }
            my_fields.append(dim_def)
    if explore.fields and explore.fields.measures:
        for measure in explore.fields.measures:
            mes_def = {
                "field_type": "Measure",
                "view_name": measure.view_label,
                "field_name": measure.label_short,
                "type": measure.type,
                "description": measure.description,
                "sql": measure.sql,
            }
            my_fields.append(mes_def)

    return my_fields
