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
  ### Transform headers and data ("User Name" to become "User_Name")
  cnt = 0
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
    # Prepare the table inside BQ in advance. Additional logic can be written to create a table 
    # Example: https://github.com/googleapis/python-bigquery/blob/35627d145a41d57768f19d4392ef235928e00f72/samples/create_table.py
    table_id = "myproject.myschema.mytable" 
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV, skip_leading_rows=1, autodetect=True,
    )
    with open("/tmp/table1.csv", "rb") as source_file:
        job = client.load_table_from_file(source_file, table_id, job_config=job_config)
    job.result()  # Wait for the job to complete.
    table = client.get_table(table_id)  # Make an API request.
    print(
        "Loaded {} rows and {} columns to {}".format(
            table.num_rows, len(table.schema), table_id
        )
    )