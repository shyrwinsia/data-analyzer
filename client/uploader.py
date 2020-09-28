import tkinter as tk
from tkinter import filedialog, messagebox
import requests
import pandas as pd
import numpy as np
import sys
import os.path


root= tk.Tk()
root.title("Stafftronix Data Uploader")

canvas = tk.Canvas(root, width = 300, height = 300)
canvas.pack()


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


def upload():  
    root.filename = filedialog.askopenfilename(initialdir="", title="Select a file", filetypes=(("Text files", "*.txt"),))
    if root.filename:
        choose_btn.destroy()
        label_file = tk.Label(text="Uploading file: " + root.filename, wraplength=200)
        canvas.create_window(150, 130, window=label_file)

        try:
            df = pd.read_csv(root.filename, sep="\t")

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

            done_message = tk.Label(canvas, text="Upload finished.") 
            canvas.create_window(150, 220, window=done_message)
        
        except Exception as e:
            messagebox.showerror("Error", "Check the file or your internet connection.")
            error_message = tk.Label(canvas, text="Failed! Close window and try again.")
            canvas.create_window(150, 150, window=error_message)
   
choose_btn = tk.Button(text='Choose file...', command=upload)
canvas.create_window(150, 150, window=choose_btn)

root.mainloop()