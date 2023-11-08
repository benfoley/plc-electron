import time
from flask import Flask
from folders import *

app = Flask(__name__)

# @app.route('/time')
# def get_current_time():
#     return {'time': time.time()}

@app.route('/get_all_files')
def get_all_files():
    dbx = get_dropbox(os.getenv("APP_KEY"), os.getenv("REFRESH_TOKEN"))
    ls = search_for_file("", dbx, "./files", buckets["ANNUAL"])