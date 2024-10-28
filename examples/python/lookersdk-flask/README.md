# Looker SDK & Flask Example

This is a small demo Flask application, almost entirely based on the official [Flask tutorial](https://flask.palletsprojects.com/en/1.1.x/tutorial/). If you are curious about a piece of non-Looker-specific code or a design decision, refer to the tutorial for full explanations.

This example is likely not suitable for repurposing to production use cases (Flask is not great in production without tweaks), but it is a very easy way to begin working with and understanding the [Looker Python SDK](https://github.com/looker-open-source/sdk-codegen/tree/main/python) in a real-world application.

## Running

1. Clone this entire repository and `cd sdk-codegen/examples/python/lookersdk-flask`
2. _Recommended: Set up a virtual environment. I use virtualenv:_ `virtualenv venv && source venv/bin/activate`.
3. Rename `looker.ini.sample` to `looker.ini` and fill in your credentials **OR** set environment variables (see [Python SDK docs](https://github.com/looker-open-source/sdk-codegen/tree/main/python) for more).
4. Make a mental note to not check `looker.ini` into source control, ever.
5. Run the following commands to set Flask environment variables. `export FLASK_APP=app` and `export FLASK_ENV=development`.
6. Install required libraries by running `pip install -r requirements.txt`.
7. Initialize the database by running `flask init-db`.
8. Start the app by running `flask run`.
9. Have fun!

## What's Next

This is an intentionally "incomplete" application that has room to grow! Often the best way to learn is to dig in and implement new functionality. If you also learn best by doing, try some of these ideas to get you started exploring:

- Allow a user to select between visualization or table when creating a new post.
- What happens if a user creates a post with a broken Look?
- Why is it so slow to create a new post? Or to just load the /create page in the first place?
- Allow a user to view the Looks and Dashboards they've Favorited in Looker, in the app.
- Harder: What would it take to add appropriate Looker permissions to this app?
- Sky's the limit :)
