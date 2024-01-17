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

@app.route('/download/archive/<path:filename>')
def download_from_archive(filename=""):
    try:
        download_blob(bucket_name=buckets["ANNUAL"],
                      source_blob_name=filename,
                      destination_path=os.path.join("..", "downloads", filename))
        return {'status': 200}
    except Exception:
        return {'status': 500}
    
@app.route('/download/dropbox/<path:filename>')
def download_from_dropbox(filename=""):
    breakpoint()
    try:
        download_dropbox(
            source_path=filename,
            destination_path=os.path.join("..", "downloads", filename))
        return {'status': 200}
    except Exception:
        return {'status': 500}
