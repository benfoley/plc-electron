import os
import json
import requests

from typing import Dict, List, Tuple, Any
from datetime import datetime
from dotenv import load_dotenv
from google.cloud import storage
from utils import parse_query, string_fits_query, format_datetime
from dropbox_lib import get_dropbox, get_files
from dropbox.files import FolderMetadata, PathOrLink, ThumbnailArg, ThumbnailFormat, ThumbnailSize

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

def dropbox_search(dbx, include=[], exclude=[], optional=[], all_files=None, path="",
                   recursive=True, index_location: str = "", include_folders=False):
    # saves having to get all files every time
    if not all_files:
        all_files = get_files(dbx, path, recursive, include_folders)
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
    if isinstance(dbx.files_get_metadata(source_path), FolderMetadata):
        results = dropbox_search(dbx, path=source_path)
        for res in results:
            if res.startswith(source_path):
                if res.startswith(os.path.sep):
                    path = res[1:]
                result_destination_path = os.path.join("..", "downloads", path)
                create_destination_folders(result_destination_path)
                dbx.files_download_to_file(result_destination_path, res)
    else:
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
    
    local = search_dir_from_lists(local_path, include, exclude, optional)
    dbx_matches = [path for path in dropbox_search(
        dbx, include, exclude, optional, include_folders=True)]
    archive_matches = []
    # TEMP disable archive search
    # storage_client = storage.Client()
    # blobs = storage_client.list_blobs(bucket_name)
    # archive_matches = search_blobs_from_lists(blobs, include, exclude, optional)
    return [local, dbx_matches, archive_matches]

def explain_translation(query: str, index_location: str):
    query = query.lower()
    if len(index_location) > 0:
        include, exclude, optional = translate_query(query, index_location)
    else: 
        return "no translations found"
    return(exclude, include+optional)


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

# TODO put these somewhere else so they more obvious
load_dotenv()
index_location = "./search_terms.json"
# dbx = get_dropbox(os.getenv("APP_KEY"), os.getenv("REFRESH_TOKEN"))
# print(str(search_for_file("", dbx, "./files", buckets["ANNUAL"])))
# get_files(dbx, os.path.join(os.path.sep, "Shared", "Folder C"))


def get_dropbox_thumbs(dbx, source: str):
    # Seems like this just gets metadata - not the file data :(
    # source_path = PathOrLink.path(source)
    # thumb = dbx.files_get_thumbnail_v2(source_path)

    # url = "https://content.dropboxapi.com/2/files/get_thumbnail_v2"
    # headers = {
    #     "Authorization": "Bearer uat.AE-zzibQ983Wj8MJ_exSDiFwdMKb3ASnquz1_mFoWYSgPs5caqvs9wtiKESvn5ESg1IXbEfVGzhjY6DUianDjvGMUpfAcbYuObtcMUtpChDFUkGjIyUCkx87YiwH5UMwyvg4lThV1v_VRAUAUunSdxHhAo064tuC11K0pYk81Ig0UmHRZlEyjwA2GzhYoL-MgcKZ7MQi3ZpbroVm68sOHSdIy2RqQSET6Kvnstvg-tq8r6zzpSkb0WUXjdPg3xeIfonvwzGxHkWPB1sfTcyFiq2UrSu3brn9PDUBDoXRPsiXwXIa3aTDe4S9t07TyXmM4KaVN9fBBExjn3_WAPZOfxyApsfYb_haL8TCQgf_japZ077DVWd0wNf-HGV4_-6-3EEn76xUJh6p4f75sKh5xG1kFaKR7YGx6PrTK_62Fi4ZL7RqoVPSXukUXGcypmrQBTesgk73KawO0Hh4rTD4fEAnUmlLCLSMVdjzTtO-E0ZlBpIjOtoHGsViR0mxJyIj2XUxHm5V4mx-WyekZ-3cI17h2XsF-oP0q5GTEfU6e2_NONWC_J9sY8SEE66NW0EMRkasz6ODbDfHhAmPC96L3nklY3IHDwJScCjIiOYmZDzuiWpcrnn7kKMhgaCPWWXpx89HldkKrNdKssiTqx1v2WzdocKzXjL-sDUqDmfT-H28dxRXYM7Fwic3OPBp-yBDLNBDN50jME7XtdVCsYivvWtj9ewsGGk5Adzg5RDqC9hq2UJKS2LHVdPiyVI1B3Bxl0r8ecubvuzQbqzm5A1HNFYgsfy0TtgivTK3Y-_xdk5hrQg7LlayZFQms4GGOq9aFbVdZtl190_GpnIIQSnrC3drST1saJN_unUgKIVjX8XiO0rYCq20HsW62JOBMaftnpwBKPmDyQpeTEYyWGHrcEE-LJe0289KZaoJzB4CoUO3bCYpnE33L2V0f1P0pjg1MQnxjDe_LxMkxzkJkXIrJgPlh2kKALzwFlhMjqFsGz7e0iZf3LxWJ6nEnYiwtm-ZIyOuKBU3YCJwhcrL1nBdLBZyUCp3F_IsbW1ZMcFtSgZxG9IH8ksWS25skB5JlgbcV9lS_hHhRULHb5j2-eqLvrmw3fQqZ_VZ9IhyAe2lWLlqEkId8tlzmd6MduNPt0xBd-o5UcsNxOGg8SN7Sh5zBDYZK7rQN_JromeSiWi-MCegFjpfRzkgtdk6zuOW1xE9nMFAtjFLCuLLGAEG3g4QWUOqDMId-frQm9_L2FqrWWSl-mWDBMiTOZ42-qbe3NUewTU",
    #     "Dropbox-API-Arg": "{\"resource\":{\".tag\":\"path\",\"path\":\"/bird.jpg\"}}"
    # }
    # response = requests.post(url, headers=headers)
    entries = [
        ThumbnailArg(path=source, format=ThumbnailFormat.png, size=ThumbnailSize.w128h128),
    ]
    batch_result = dbx.files_get_thumbnail_batch(entries=entries)
    entries = batch_result.entries
    return entries

