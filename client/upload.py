import requests
import pandas as pd
import numpy as np
import sys
import os.path


def create_json(df):
    json = [
        dict([(colname, row[i]) for i, colname in enumerate(df.columns)])
        for row in df.values
    ]
    return json


def post_to_json_bin(df, bucket):
    return requests.put(
        f"https://api.jsonbin.io/b/{bucket}", json=create_json(df)
    ).json()


def main():
    if len(sys.argv) < 2:
        print("Error: Missing file!")
        print("Usage: upload [filename] ...")
        print("Example: upload hello.txt")
        return 1

    df = pd.DataFrame()

    for i, arg in enumerate(sys.argv[1:]):
        if not os.path.exists(arg):
            print(f"Error: File {arg} does not exist.")
            return 1

        print(f"Extracting {arg}...")
        df = df.append(pd.read_csv(arg, sep="\t"))

    df.drop_duplicates(inplace=True)
    df.dropna(subset=["state", "status"], inplace=True)

    summary = (
        pd.DataFrame(df[["state", "status"]].state.value_counts())
        .reset_index()
        .rename(columns={"index": "state", "state": "count"})
    )

    details = pd.DataFrame(
        {"count": df[["state", "status"]].groupby(["state", "status"]).size()}
    ).reset_index()

    appointments = df[["state", "call_date"]].loc[df["status"] == "APP"]
    appointments.sort_values(by=["call_date"], inplace=True)
    appointments[["date", "time"]] = df["call_date"].str.split(
        " ", expand=True,)
    appointments = appointments[["date", "time", "state"]]

    print("Uploading summary.")
    response = post_to_json_bin(summary, "5f4c81c2514ec5112d12aa06")
    print("Success? %s" % response["success"])

    print("Uploading details.")
    response = post_to_json_bin(details, "5f4c8259993a2e110d3ad302")
    print("Success? %s" % response["success"])

    print("Uploading appointments.")
    response = post_to_json_bin(appointments, "5f7209b465b18913fc5564d5")
    print("Success? %s" % response["success"])

    print("Upload done.")


if __name__ == "__main__":
    main()
