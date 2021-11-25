"""This Cloud Function accomplishes the following tasks:
1. Get data from a Looker query in CSV format
2. Transform columns' names by replacing a white space with an underscore 
("User Name" to "User_Name") since BigQuery does not accept a white space inside columns' names
3. Write the modified column name and data to a CSV file stored in Cloud Functions' temporary disk
4. Load the CSV file to a BigQuery table

Last modified: November 2021 
"""

from google.cloud import bigquery
import looker_sdk
client = bigquery.Client()
sdk = looker_sdk.init40()

def main(request):
  get_data_from_looker()
  write_to_file()
  load_to_bq()
  return("Successfully loaded data from Looker to BigQuery")

def get_data_from_looker(query_id=1):
  query = sdk.run_query(
    query_id=query_id,
    result_format="csv",
    limit= 5000
  )  
  print("Successfully retrieved data from Looker")
  return query

def write_to_file():
  data = get_data_from_looker() 
  # Transform the columns' name (i.e: "User ID" to become "User_ID") because 
  # BigQuery does not accept a white space inside columns' name 
  cnt = 0 # cnt is to find the index of the character after the last character of columns'names
  for i in data: 
    if i == "\n":
        break
    else: 
        cnt += 1
  header = data[:cnt]
  header_to_write = header.replace(" ", "_")
  data_to_write = data[cnt:]
  # Write header and data to temporary disk
  with open('/tmp/table.csv', "w") as csv: # Files can only be modified/written inside tmp/
    csv.write(header_to_write)
    csv.write(data_to_write)
  print("Successfully wrote data to a CSV file stored in temporary disk")

def load_to_bq():
    # Set up the table inside BQ in advance: The names and types of columns in BQ must match the 
    # names and types of the query result from Looker (for example: User_ID, type: Integer). 
    # Optionally, write additional logic to make an empty table with matching columns' names 
    # Example: https://github.com/googleapis/python-bigquery/blob/main/samples/create_table.py
    table_id = "myproject.myschema.mytable" 
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV, skip_leading_rows=1, autodetect=True,
    )
    with open("/tmp/table.csv", "rb") as source_file:
        job = client.load_table_from_file(source_file, table_id, job_config=job_config)
    job.result()  # Wait for the job to complete.
    table = client.get_table(table_id)  # Make an API request.
    print(
        "Loaded {} rows and {} columns to {}".format(
            table.num_rows, len(table.schema), table_id
        )
    )
    