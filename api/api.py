import time
from flask import Flask
from folders import *

app = Flask(__name__)

@app.route('/get_all_files')
def get_all_files():
    dbx = get_dropbox(os.getenv("APP_KEY"), os.getenv("REFRESH_TOKEN"))
    ls = search_for_file("", dbx, "./files", buckets["ANNUAL"])
    
    return {
        'results': ls
    }

@app.route('/search/<query>')
def search_files(query=""):
    dbx = get_dropbox(os.getenv("APP_KEY"), os.getenv("REFRESH_TOKEN"))
    ls = search_for_file(query, dbx, "./public", buckets["ANNUAL"])
    
    return {
        'results': ls
    }

@app.route('/download/archive/<path>')
def download_from_archive(path=""):
    breakpoint()
    try:
        download_blob(bucket_name=buckets["ANNUAL"],
                      source_blob_name=path,
                      destination_file_name=os.path.join("..", "downloads", path))
        return {'status': 200}
    except Exception:
        return {'status': 500}
