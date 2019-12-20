from looker_sdk import client, models
from looker_sdk.rtl import transport
import configparser
import hashlib
import csv
from pprint import pprint

config_file = '../looker.ini'
sdk = client.setup(config_file)

def main():
    """Compare the output of content validator runs
    in production and development mode. Additional
    broken content in development mode will be
    outputted to a csv file.

    Use this script to test whether LookML changes
    will result in new broken content."""
    base_url = get_base_url()
    space_data = get_space_data()
    print('Checking for broken content in production.')
    broken_content_prod = parse_broken_content(
        base_url,
        get_broken_content(),
        space_data
    )
    checkout_dev_branch()
    print('Checking for broken content in dev branch.')
    broken_content_dev = parse_broken_content(
        base_url,
        get_broken_content(),
        space_data
    )
    new_broken_content = compare_broken_content(
        broken_content_prod, broken_content_dev
    )
    if new_broken_content:
        write_broken_content_to_file(
            new_broken_content,
            'new_broken_content.csv'
        )
    else:
        print('No new broken content in development branch.')

def get_base_url():
    """ Pull base url from looker.ini, remove port"""
    config = configparser.ConfigParser()
    config.read(config_file)
    full_base_url = config.get('Looker', 'base_url')
    base_url = sdk.auth.settings.base_url[:full_base_url.index(":19999")]
    return base_url

def get_space_data():
    """Collect all space information"""
    space_data = sdk.all_spaces(fields='id, parent_id, name')
    return space_data

def get_broken_content():
    """Collect broken content"""
    broken_content  = sdk.content_validation(
        transport_options=transport.TransportSettings(timeout=600)
    ).content_with_errors
    return broken_content

def parse_broken_content(base_url, broken_content, space_data):
    """Parse and return relevant data from content validator"""
    output = []
    for item in broken_content:
        if item.dashboard:
            content_type = 'dashboard'
        else:
            content_type = 'look'
        item_content_type = getattr(item, content_type)
        id = item_content_type.id
        name = item_content_type.title
        space_id = item_content_type.space.id
        space_name = item_content_type.space.name
        errors = item.errors
        url =  f'{base_url}/{content_type}s/{id}'
        space_url = '{}/spaces/{}'.format(base_url,space_id)
        if content_type == 'look':
                element = None
        else:
            dashboard_element = item.dashboard_element
            element = dashboard_element.title if dashboard_element else None
        # Lookup additional space information
        space = next(i for i in space_data if str(i.id) == str(space_id))
        parent_space_id = space.parent_id
        # Old version of API  has issue with None type for all_space() call
        if  parent_space_id is None or parent_space_id == 'None':
            parent_space_url = None
            parent_space_name = None
        else:
            parent_space_url = '{}/spaces/{}'.format(
                base_url,
                parent_space_id
            )
            parent_space = next((
                i for i in space_data if str(i.id) == str(parent_space_id)
            ),None)
            # Handling an edge case where space has no name. This can happen
            # when users are improperly generated with the API
            try:
                parent_space_name = parent_space.name
            except AttributeError:
                parent_space_name = None
        # Create a unique hash for each record. This is used to compare
        # results across content validator runs
        unique_id = hashlib.md5(
            '-'.join(
                    [str(id),str(element),str(name),str(errors),str(space_id)]
                ).encode()
        ).hexdigest()
        data = {
                'unique_id' : unique_id,
                'content_type' : content_type,
                'name' : name,
                'url' : url,
                'dashboard_element': element,
                'space_name' : space_name,
                'space_url' : space_url,
                'parent_space_name': parent_space_name,
                'parent_space_url': parent_space_url,
                'errors': str(errors)
               }
        output.append(data)
    return output

def compare_broken_content(broken_content_prod, broken_content_dev):
    """Compare output between 2 content_validation runs"""
    unique_ids_prod = set([i['unique_id'] for i in broken_content_prod])
    unique_ids_dev = set([i['unique_id'] for i in broken_content_dev])
    new_broken_content_ids = unique_ids_dev.difference(unique_ids_prod)
    new_broken_content = []
    for item in broken_content_dev:
        if item['unique_id'] in new_broken_content_ids:
            new_broken_content.append(item)
    return new_broken_content

def checkout_dev_branch():
    """Enter dev workspace"""
    sdk.update_session(models.WriteApiSession(workspace_id='dev'))

def write_broken_content_to_file(broken_content, output_csv_name):
    """Export new content errors in dev branch to csv file"""
    try:
        with open(output_csv_name, 'w') as csvfile:
            writer = csv.DictWriter(
                csvfile,
               fieldnames=list(broken_content[0].keys())
            )
            writer.writeheader()
            for data in broken_content:
                writer.writerow(data)
        print('Broken content information outputed to {}'.format(
            output_csv_name
        ))
    except IOError:
        print('I/O error')

main()
