import csv
import time

import click

import looker


@click.command()
@click.argument("filename", type=click.File("r"), required=True)
@click.argument("hackathon", required=True)
@click.argument("limit", default=0, required=True)
def main(filename: str, hackathon: str, limit: int):
    registrants = csv.DictReader(filename)

    count = 0
    for registrant in registrants:
        registrant["hackathon"] = hackathon
        click.secho(f"Registering {registrant['email']}", fg="green")

        try:
            looker.register_user(
                hackathon=hackathon,
                first_name=registrant["first_name"],
                last_name=registrant["last_name"],
                email=registrant["email"],
            )
        except looker.RegisterError as ex:
            click.secho(
                f"Failed to add to Looker. Stopping after {count} users", fg="red"
            )
            raise ex
        count += 1
        if limit and count == int(limit):
            break
        time.sleep(60)
    click.secho(f"Registered {count} users", fg="green")


if __name__ == "__main__":
    main()
