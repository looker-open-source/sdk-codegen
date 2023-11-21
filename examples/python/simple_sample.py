import looker_sdk
sdk = looker_sdk.init40(config_file='../../looker.ini')

instance_url = sdk.get_setting(fields="host_url")
print(instance_url['host_url'])

my_user = sdk.me()
print(my_user["first_name"])