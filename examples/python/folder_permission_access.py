"""
This script will construct and output an object detailing content access metadata for each folder, 
providing an example of how to recursively traverse the folder tree. For each folder, the object will
contain a list of Groups and Users who have either been explicitly been granted view/edit access to 
the folder, or implicitly given via inheritence from a parent folder.

To include personal and/or the embed shared folders, modify the parameters below. 
"""

import looker_sdk
import pprint as pp

sdk = looker_sdk.init40()

# includes both folders under folders/users "People" folder and folders/embed_users "Embed Users"
INCLUDE_PERSONAL = False
# include folders under folders/embed_shared "Embed Groups" folder
INCLUDE_EMBED_SHARED = False


def get_folders():
    print('** gathering folder info **')
    all_folders = sdk.all_folders()  # get all folder metadata
    folder_access = {}

    for f in all_folders:
        personal = f.is_personal or f.is_personal_descendant
        if (personal or f.is_users_root or f.is_embed_users_root) and not INCLUDE_PERSONAL:
            continue
        if (not personal and f.is_embed) and not INCLUDE_EMBED_SHARED:
            continue
        folder_access[f.id] = {"folder_id": f.id,
                               "name": f.name,
                               "parent_id": f.parent_id,
                               "content_metadata_id": f.content_metadata_id,
                               "personal": personal,
                               "child_count": f.child_count}

    folder_access.pop('lookml')  # remove lookml dashboard folder
    return folder_access


def grab_folder_permissions(f: str, folders: object):
    print('checking folder: {}'.format(f))

    if 'access' in folders[f]:
        print('skipping folder {}: already have access details'.format(f))
    else:
        # groups / users can view / edit in folder (content_metadata_id)
        cmgu = sdk.all_content_metadata_accesses(
            content_metadata_id=folders[f]["content_metadata_id"], fields='group_id,user_id,permission_type')

        access = {"groups": [], "users": []}
        access["groups"] = [{"id": i.group_id, "permission_type": i.permission_type.value}
                            for i in cmgu if i.group_id is not None]
        access["users"] = [{"id": i.user_id, "permission_type": i.permission_type.value}
                           for i in cmgu if i.user_id is not None]
        folders[f]['access'] = access

    # folders / dash / looks in folder (content_metadata_id). use to check if folder 'inherits' content access
    cm = sdk.all_content_metadatas(
        parent_id=folders[f]['content_metadata_id'], fields='folder_id,inherits')

    # add access to all inheriting folders
    for c in cm:
        if c.folder_id is not None:
            try:
                if c.inherits:
                    print('{} inherits as parent {}'.format(c.folder_id, f))
                    folders[c.folder_id]['access'] = folders[f]['access']
                # recursively set child folders (depth first)
                grab_folder_permissions(c.folder_id, folders)
            except:
                # most likely the folder has been deleted
                print('skipping folder {}: no access data'.format(c.folder_id))

    return folders


def main():
    """Construct a dictionary of folder objects with access permissions:

    folder_id: {
        folder_id: string
        name: string
        parent_id: string
        content_metadata_id: string
        personal: bool based on is_personal or is_personal_descendant
        child_count: number of folders inside the folder
        access: {groups:[{id: int,permission_type: 'view' | 'edit'}], users:[{id: int,permission_type: 'view' | 'edit'}]}
    }

    admins have access to all content folders and are not included"""
    folders = get_folders()
    print('** gathering shared folders **')
    folder_access = grab_folder_permissions(
        '1', folders)  # start at folders/home
    if INCLUDE_PERSONAL or INCLUDE_EMBED_SHARED:
        print('** gathering personal and/or embed folders **')
        for f in folders:
            if 'access' not in folders[f]:
                folder_access = grab_folder_permissions(f, folders)

    pp.pprint(folder_access, sort_dicts=False)


main()
