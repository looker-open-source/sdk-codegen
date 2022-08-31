import looker_sdk
from looker_sdk import models
import configparser
import hashlib
import csv
from looker_sdk.rtl import transport

config_file = "../../looker.ini"

class MyTransportOptions(transport.PTransportSettings): timeout = 600

sdk = looker_sdk.init40(config_file)


def main():
    """Compare the output of content validator runs
    in production and development mode. Additional
    broken content in development mode will be
    outputted to a csv file.

    Use this script to test whether LookML changes
    will result in new broken content."""
    base_url = get_base_url()
    folder_data = get_folder_data()
    print("Checking for broken content in production.")
    broken_content_prod = parse_broken_content(
        base_url, get_broken_content(), folder_data
    )
    checkout_dev_branch()
    print("Checking for broken content in dev branch.")
    broken_content_dev = parse_broken_content(
        base_url, get_broken_content(), folder_data
    )
    new_broken_content = compare_broken_content(broken_content_prod, broken_content_dev)
    if new_broken_content:
        write_broken_content_to_file(new_broken_content, "new_broken_content.csv")
    else:
        print("No new broken content in development branch.")


def get_base_url():
    """ Pull base url from looker.ini, remove port"""
    config = configparser.ConfigParser()
    config.read(config_file)
    full_base_url = config.get("Looker", "base_url")
    base_url = sdk.auth.settings.base_url[: full_base_url.index(":19999")]
    return base_url


def get_folder_data():
    """Collect all folder information"""
    folder_data = sdk.all_folders(fields="id, parent_id, name")
    return folder_data


def get_broken_content():
    """Collect broken content"""
    broken_content = sdk.content_validation(
        transport_options=MyTransportOptions
    ).content_with_errors
    return broken_content


def parse_broken_content(base_url, broken_content, folder_data):
    """Parse and return relevant data from content validator"""
    output = []
    for item in broken_content:
        if item.dashboard:
            content_type = "dashboard"
        else:
            content_type = "look"
        item_content_type = getattr(item, content_type)
        id = item_content_type.id
        name = item_content_type.title
        folder_id = item_content_type.folder.id
        folder_name = item_content_type.folder.name
        errors = item.errors
        url = f"{base_url}/{content_type}s/{id}"
        folder_url = "{}/folders/{}".format(base_url, folder_id)
        if content_type == "look":
            element = None
        else:
            dashboard_element = item.dashboard_element
            element = dashboard_element.title if dashboard_element else None
        # Lookup additional folder information
        folder = next(i for i in folder_data if str(i.id) == str(folder_id))
        parent_folder_id = folder.parent_id
        # Old version of API  has issue with None type for all_folders() call
        if parent_folder_id is None or parent_folder_id == "None":
            parent_folder_url = None
            parent_folder_name = None
        else:
            parent_folder_url = "{}/folders/{}".format(base_url, parent_folder_id)
            parent_folder = next(
                (i for i in folder_data if str(i.id) == str(parent_folder_id)), None
            )
            # Handling an edge case where folder has no name. This can happen
            # when users are improperly generated with the API
            try:
                parent_folder_name = parent_folder.name
            except AttributeError:
                parent_folder_name = None
        # Create a unique hash for each record. This is used to compare
        # results across content validator runs
        unique_id = hashlib.md5(
            "-".join(
                [str(id), str(element), str(name), str(errors), str(folder_id)]
            ).encode()
        ).hexdigest()
        data = {
            "unique_id": unique_id,
            "content_type": content_type,
            "name": name,
            "url": url,
            "dashboard_element": element,
            "folder_name": folder_name,
            "folder_url": folder_url,
            "parent_folder_name": parent_folder_name,
            "parent_folder_url": parent_folder_url,
            "errors": str(errors),
        }
        output.append(data)
    return output


def compare_broken_content(broken_content_prod, broken_content_dev):
    """Compare output between 2 content_validation runs"""
    unique_ids_prod = set([i["unique_id"] for i in broken_content_prod])
    unique_ids_dev = set([i["unique_id"] for i in broken_content_dev])
    new_broken_content_ids = unique_ids_dev.difference(unique_ids_prod)
    new_broken_content = []
    for item in broken_content_dev:
        if item["unique_id"] in new_broken_content_ids:
            new_broken_content.append(item)
    return new_broken_content


def checkout_dev_branch():
    """Enter dev workspace"""
    sdk.update_session(models.WriteApiSession(workspace_id="dev"))


def write_broken_content_to_file(broken_content, output_csv_name):
    """Export new content errors in dev branch to csv file"""
    try:
        with open(output_csv_name, "w") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=list(broken_content[0].keys()))
            writer.writeheader()
            for data in broken_content:
                writer.writerow(data)
        print("Broken content information outputed to {}".format(output_csv_name))
    except IOError:
        print("I/O error")


main()
