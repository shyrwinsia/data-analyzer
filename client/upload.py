import requests
import pandas as pd
import numpy as np
import sys
import os.path
import requests

def create_json(df):
  json = [
      dict([(colname, row[i]) for i, colname in enumerate(df.columns)])
      for row in df.values
  ]
  return json

def post_to_json_bin(df, bucket):
  headers = {"secret-key": '$2b$10$AGZPv9GXTGfAE7Vnku2jWeltY3uvRy/BM30CeewFotub8lRbxQL1C'}
  return requests.put('https://api.jsonbin.io/b/'+bucket, json=create_json(df), headers=headers).json()

if len(sys.argv) < 2:
  print("Error: Missing file!")
  print("Usage: upload [filename]")
  print("Example: upload hello.txt")
  quit(1)

file_name = sys.argv[1]
if not os.path.exists(file_name):
  print("Error: File does not exist.")
  quit(1)

print("Extracting data.")
df = pd.read_csv(file_name, sep='\t')
df.drop_duplicates(inplace=True)
df.dropna(subset=['state','status'])
df = df[['state','status']]

summary = pd.DataFrame(df.state.value_counts()).reset_index().rename(columns={'index': 'state', 'state': 'count'})
details = pd.DataFrame({'count': df.groupby(['state', 'status']).size()}).reset_index()

print("Uploading summary.")
response = post_to_json_bin(summary, "5f4a9bf6514ec5112d10f73b")
print("Success? %s" % response['success'])

print("Uploading details.")
response = post_to_json_bin(details, "5f4a9e8e4d8ce41113837c01")
print("Success? %s" % response['success'])

print("Uploaded " + file_name)
