import os
import json
from typing import Dict, List, Tuple, Any
from datetime import datetime
from dotenv import load_dotenv
from google.cloud import storage
from utils import parse_query, string_fits_query, format_datetime
from dropbox_lib import get_dropbox, get_files

def search_dir_from_query(dir: str, query: str) -> List[str]:
    include, exclude, optional = parse_query(query)
    result = []
    for root, dirs, files in os.walk(dir):
        for file in files:
            if string_fits_query(file, include, exclude, optional):
                result.append(os.path.join(root, file))
    return result

def search_dir_from_lists(dir: str, include, exclude, optional) -> List[str]:
    result = []
    for root, dirs, files in os.walk(dir):
        for file in files:
            if string_fits_query(file, include, exclude, optional):
                result.append(os.path.abspath(os.path.join(root, file)))
                # result.append(os.path.join(root, file))
    return result

def dropbox_search(dbx, include, exclude, optional, all_files=None, path="",
                   recursive=True, index_location: str = ""):
    # saves having to get all files every time
    if not all_files:
        all_files = get_files(dbx, path, recursive)
    result = []

    for path_lower, metadata in all_files.items():
        if string_fits_query(path_lower, include, exclude, optional):
            result.append(path_lower)
    return result

def search_blobs_from_query(blobs: List[Any], query: str) -> List[str]:
    include, exclude, optional = parse_query(query)
    result = []
    files = [blob.name for blob in blobs]
    for file in files:
        if string_fits_query(file, include, exclude, optional):
            result.append(file)
    return result

def search_blobs_from_lists(blobs: List[Any], include, exclude, optional) -> List[str]:
    result = []
    files = [blob.name for blob in blobs]
    for file in files:
        if string_fits_query(file, include, exclude, optional):
            result.append(file)
    return result

### Files & metadata
# TODO find out metadata format
def get_filenames_from(dir: str) -> Dict[str, str]:
    all_file_paths = dict()
    for root, dirs, files, in os.walk(dir):
        for file in files:
            path = os.path.join(root, file)
            while '//' in path:
                path = path.replace('//', '/')
            all_file_paths[path] = file
    return all_file_paths

def add_metadata(existing_files: List[str]):
    for filename in existing_files:
        if not filename.endswith(".json"):
            # TODO look for metadata files that havent been moved with their base files
            # also if theres some stored already?
            if not (filename + ".json") in existing_files:
                metadata_path = filename + ".json"
                contents = {
                    "json_path": metadata_path,
                    "name": os.path.basename(filename),
                    "path": filename,
                    "file_last_modified": format_datetime(datetime.fromtimestamp(os.path.getmtime(filename))),
                    "file_created": format_datetime(datetime.fromtimestamp(os.path.getctime(filename))),
                    "topics": [],
                    "category": [],
                    "location": [],
                    "permissions": []
                }
                # with open(metadata_path, 'w', encoding='utf-8') as new_file:
                #     json.dump(contents, new_file, indent=2, default=str)

### Google Cloud Storage
buckets = {
    "STANDARD": "archive-0000-standard-bucket",
    "MONTHLY": "archive-0000-nearline-bucket",
    "QUARTERLY": "archive-0000-coldline-bucket",
    "ANNUAL": "archive-0000-archive-bucket",
}

def upload_file(bucket_name, source_file_name, destination_blob_name=""):
    """Uploads a file to the bucket."""
    if len(destination_blob_name) == 0:
        destination_blob_name = source_file_name

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)
    print(f"File {source_file_name} uploaded to {destination_blob_name}.")

def get_name_from_root(full_path: str, root: str) -> str:
    full_path = os.path.abspath(full_path)
    root = os.path.abspath(root)
    short = full_path.split(root)[-1]
    if short.startswith("/") or short.startswith("\\"):
        short = short[1:]
    return short

### General
def create_destination_folders(destination_path):
    head, tail = os.path.split(destination_path)
    tails = []
    while len(tail) > 0:
        head, tail = os.path.split(head)
        if len(tail) > 0:
            tails = [tail] + tails

    if len(head) > 0 and head not in tails:
        tails = [head] + tails

    for i in range(0, len(tails)):
        if i > 0:
            partial_path = os.path.join(*tails[:i+1])
        else:
            partial_path = tails[0]
        if not os.path.isdir(partial_path):
            os.mkdir(partial_path)

def download_dropbox(dbx, source_path, destination_path):
    create_destination_folders(destination_path)
    dbx.files_download_to_file(destination_path, source_path)

def download_blob(bucket_name, source_blob_name, destination_path):
    """Downloads a blob from the bucket.
    Source: https://cloud.google.com/storage/docs/downloading-objects#storage-download-object-python
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    blob = bucket.blob(source_blob_name)
    create_destination_folders(destination_path)
    blob.download_to_filename(destination_path)

    print(
        "Downloaded storage object {} from bucket {} to local file {}.".format(
            source_blob_name, bucket_name, destination_path
        )
    )

def upload_to_gcloud_archive(dir: str, bucket_name: str):
    files = get_filenames_from(dir)

    for path, filename in files.items():
        blob_name = get_name_from_root(path, dir)
        print(f"path: {path}, filename: {filename}, blob: {blob_name}")
        upload_file(bucket_name, path, blob_name)

def search_for_file(query: str, dbx, local_path: str, bucket_name: str, index_location: str = ""):
    query = query.lower()
    if len(index_location) > 0:
        include, exclude, optional = translate_query(query, index_location)
    else:
        include, exclude, optional = parse_query(query)
    
    # local = search_dir_from_query(local_path, query) # TODO fix this
    # dbx_matches = [file.metadata.path_lower for file in dbx.files_search("", query).matches]
    # storage_client = storage.Client()
    # blobs = storage_client.list_blobs(bucket_name)
    # archive_matches = search_blobs_from_query(blobs, query)
    local = search_dir_from_lists(local_path, include, exclude, optional)
    dbx_matches = [path for path in dropbox_search(dbx, include, exclude, optional)]
    storage_client = storage.Client()
    blobs = storage_client.list_blobs(bucket_name)
    archive_matches = search_blobs_from_lists(blobs, include, exclude, optional)
    return [local, dbx_matches, archive_matches]
    # return local + dbx_matches + archive_matches

def translate_query(query: str, index_location: str) -> Tuple[List[str], List[str], List[str]]:
    include, exclude, optional = parse_query(query)

    index = None
    with open(index_location, "r") as file:
        index = json.load(file)
    if not index:
        print("error loading index")
        return

    # I don't think we actually need this bit
    temp = set(exclude)
    for e in exclude:
        res = index.get(e)
        if not res:
            res = set()
            for i in index:
                entry = index.get(i)
                if e in entry:
                    res.update([i] + entry)
        temp.update(res)
    exclude = list(temp)

    temp = set(optional)
    for e in include + optional:
        res = index.get(e)
        if not res:
            res = set()
            for i in index:
                entry = index.get(i)
                if e in entry:
                    res.update([i] + entry)
        temp.update(res)
    optional = list(temp)

    include = [i for i in include if i not in optional]
    return include, exclude, optional

load_dotenv()
index_location = "./search_terms.json"
# dbx = get_dropbox(os.getenv("APP_KEY"), os.getenv("REFRESH_TOKEN"))
# print(str(search_for_file("", dbx, "./files", buckets["ANNUAL"])))
# get_files(dbx, os.path.join(os.path.sep, "Shared", "Folder C"))
