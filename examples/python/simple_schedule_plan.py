from looker_sdk import methods, models40
import looker_sdk
import exceptions
sdk = looker_sdk.init40("../looker.ini")


def create_simple_schedule(dashboard_id:int,user_id:int,schedule_title:str, format:str, email:str,type:str, message:str, crontab:str):
    ### For more information on the Params accepted https://github.com/looker-open-source/sdk-codegen/blob/master/python/looker_sdk/sdk/api31/methods.py#L2144
    ### And for schedule destination go: https://github.com/looker-open-source/sdk-codegen/blob/master/python/looker_sdk/sdk/api31/models.py#L4601
    ### Supported formats vary by destination, but include: "txt", "csv", "inline_json", "json", "json_detail", "xlsx", "html", "wysiwyg_pdf", "assembled_pdf", "wysiwyg_png"
    ### type: Type of the address ('email', 'webhook', 's3', or 'sftp')
    schedule = sdk.create_scheduled_plan(
        body=models40.WriteScheduledPlan(
            name=schedule_title,
            dashboard_id=dashboard_id,
            user_id=user_id,
            run_as_recipient=True,
            crontab=crontab,
            scheduled_plan_destination = [
                models40.ScheduledPlanDestination(
                    format=format,
                    apply_formatting=True,
                    apply_vis=True,
                    address=email,
                    type=type,
                    message=message
                )
            ]
        )
    )

create_simple_schedule(
    1234,
    453,
    "This is an automated test",
    "assembled_pdf",
    "test@looker.com",
    "email",
    "Hi Looker User!",
    "0 1 * * *"
)
