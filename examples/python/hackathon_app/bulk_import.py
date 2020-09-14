import base64
import csv
import os
import time

import click

import looker
import sheets


@click.command()
@click.option("--filename", help="CSV file containing registrations")
@click.option("--hackathon", help="Hackathon name")
@click.option("--limit", help="limit current run", default=0)
@click.option(
    "--enable/--no-enable",
    default=False,
    help="Enable user accounts in hack.looker.com",
)
def main(filename: str, hackathon: str, enable: bool, limit: int):
    f = open(filename)
    registrants = csv.DictReader(f)

    sheets_client = sheets.Sheets(
        spreadsheet_id=os.environ["GOOGLE_SHEET_ID"],
        cred_file=os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
    )
    count = 0
    for registrant in registrants:
        registrant["hackathon"] = hackathon
        click.secho(f"Registering {registrant['email']}", fg="green")

        register_user = sheets.RegisterUser(**registrant)
        try:
            sheets_user = sheets_client.register_user(register_user)
        except sheets.SheetError as ex:
            click.secho(
                f"Failed to add to sheet. Stopping after {count} users", fg="red"
            )
            f.close()
            raise ex
        else:
            try:
                client_id = looker.register_user(
                    hackathon=hackathon,
                    first_name=register_user.first_name,
                    last_name=register_user.last_name,
                    email=register_user.email,
                )
            except looker.RegisterError as ex:
                f.close()
                click.secho(
                    f"Failed to add to Looker. Stopping after {count} users", fg="red"
                )
                raise ex
            sheets_user.client_id = client_id
            sheets_client.users.save(sheets_user)
        count += 1
        if limit and count == int(limit):
            break
    click.secho(f"Registered {count} users", fg="green")

    if enable:
        for email, reset in looker.enable_users_by_hackathons([hackathon]).items():
            sheets_user = sheets_client.users.find(email)
            if not sheets_user:
                click.secho(f"Failed to find {email} in spreadsheet", fg="red")
                continue
            sheets_user.setup_link = reset
            sheets_client.users.save(sheets_user)
            time.sleep(1)
        click.secho(f"Enabled {count} users", fg="green")
    f.close()


if __name__ == "__main__":
    google_creds = os.environ["GOOGLE_APPLICATION_CREDENTIAL_ENCODED"]
    assert google_creds
    with open("./google-creds.json", "wb") as f:
        f.write(base64.b64decode(google_creds))
    main()
