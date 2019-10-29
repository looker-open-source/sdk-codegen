import base64
import csv
import os

import click

import looker
import sheets


@click.command()
@click.option("--filename", help="CSV file containing registrations")
@click.option("--hackathon", help="Hackathon name")
def main(filename: str, hackathon: str):
    f = open(filename)
    registrants = csv.DictReader(f)

    count = 0
    for registrant in registrants:
        first_name = registrant["first_name"]
        last_name = registrant["last_name"]
        email = registrant["email"]

        click.secho(f"Registering {email}", fg="green")

        sheets_user = sheets.User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            organization=registrant.get("organization", ""),
            tshirt_size=registrant.get("tshirt_size", ""),
        )
        sheets_client = sheets.Sheets(
            spreadsheet_id=os.environ["GOOGLE_SHEET_ID"],
            cred_file=os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
        )
        try:
            sheets_client.register_user(hackathon=hackathon, user=sheets_user)
        except sheets.SheetError as ex:
            click.secho(
                f"Failed to add to sheet. Stopping after {count} users", fg="red"
            )
            f.close()
            raise ex
        else:
            try:
                looker.register_user(
                    hackathon=hackathon,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                )
            except looker.RegisterError as ex:
                f.close()
                click.secho(
                    f"Failed to add to Looker. Stopping after {count} users", fg="red"
                )
                raise ex
        count += 1
    click.secho(f"Registered {count} users", fg="green")
    f.close()


if __name__ == "__main__":
    google_creds = os.environ["GOOGLE_APPLICATION_CREDENTIAL_ENCODED"]
    assert google_creds
    with open("./google-creds.json", "wb") as f:
        f.write(base64.b64decode(google_creds))
    main()
