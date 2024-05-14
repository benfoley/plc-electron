from flask import Flask
from folders import *

app = Flask(__name__)
dbx = get_dropbox(os.getenv("APP_KEY"), os.getenv("REFRESH_TOKEN"))

@app.route('/get_all_files')
def get_all_files():
    ls = search_for_file("", dbx, "../files", buckets["ANNUAL"], index_location)
    
    return {
        'results': ls
    }

@app.route('/search/<path:query>')
def search_files(query=""):
    try:
        ls = search_for_file(query, dbx, "../files", buckets["ANNUAL"], index_location)
        return {
            'results': ls
        }
    except Exception as e:
        print("Exception: " + str(e))
        return {'status': 500}

@app.route('/search/explain/<path:query>')
def search_explain(query=""):
    try:
        ls = explain_translation(query, index_location)
        return {
            'explanation': ls
        }
    except Exception as e:
        print("Exception: " + str(e))
        return {'status': 500}

@app.route('/download/archive/<path:filename>')
def download_from_archive(filename=""):
    try:
        download_blob(bucket_name=buckets["ANNUAL"],
                      source_blob_name=filename,
                      destination_path=os.path.join("..", "downloads", filename))
        return {'status': 200}
    except Exception as e:
        print("Exception: " + str(e))
        return {'status': 500}
    
@app.route('/download/dropbox/<path:filename>')
def download_from_dropbox(filename=""):
    try:
        if not filename.startswith("/"):
            source = "/" + filename
        else:
            source = filename
        download_dropbox(
            dbx,
            source_path=source,
            destination_path=os.path.join("..", "downloads", filename))
        return {'status': 200}
    except Exception as e:
        print("Exception: " + str(e))
        return {'status': 500}

@app.route('/preview/dropbox/<path:filename>')
def preview_from_dropbox(filename=""):
    if not filename.startswith("/"):
        source = "/" + filename
    else:
        source = filename
    thumbnails = []
    entries = get_dropbox_thumbs(dbx, source)
    for entry in entries:
        thumbnails.append(entry.get_success().thumbnail  )
    return {'status': 200, 'thumbnails': thumbnails}
