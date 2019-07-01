# Looker API command-line interpreter script interface

import click
import pkg_resources  # part of setuptools
import looker

from api_settings import ApiSettings
from user_session import UserSession

settings = ApiSettings()
session = None

@click.version_option(prog_name='lapi', version='0.1')

@click.group()
@click.option('--config', '-c', default="looker.ini",
              help="Configuration file to use. Defaults to 'looker.ini'",
              required=False)
@click.option('--url', '-u', default=None, help="Looker API base url", required=False)
@click.option('--client_id', '-i', default=None, help="API client id", required=False)
@click.option('--secret', '-s', default=None, help="API secret key", required=False)
@click.option('--api', '-a', default=None, help="API version", required=False)
@click.option('--verbose', '-v', help="Outputs verbose information if set", is_flag=True)
def cli(config, url, client_id, secret, api, verbose):
    global settings
    settings.verbose = verbose
    if config is not None:
        settings.config_file = config
    if url is not None:
        settings.base_url = url
    if client_id is not None:
        settings.client_id = client_id
    if secret is not None:
        settings.client_secret = secret
    if api is not None:
        settings.api_version = api
    if settings.verbose:
        click.echo("verbose is on")


@cli.command()
def version():
    """Shows the version"""
    click.echo(pkg_resources.require("lapi")[0].version)

# @cli.command()
# @click.option('-target', default='World', help='The thing to greet')
# @click.option('-repeat', default=1, help='Number of times to greet')
# @click.argument('out', type=click.File('w'), default='-', required=False)
# @pass_options
# def greet(options, target, repeat, out):
#     """Greeter"""
#     for x in range(repeat):
#         click.echo("Hello %s!" % target, file=out)


@cli.command()
@click.argument('userid', type=click.STRING, required=False)
# @click.argument('password', type=click.STRING, required=True)
def login(userid):
    global session, settings
    if session is None:
        session = UserSession(settings)
    session.login()

    if userid:
        session.login_user(userid)

    click.echo(session.user_api.me())
