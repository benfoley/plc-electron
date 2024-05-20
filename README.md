# Demo app for file searching


## Installation

Get DropBox credentials. Go to `https://www.dropbox.com/developers/apps` and make an App in App Console, or select existing app. 
Set the permissions. Will likely need all the Files and folders read & write, and the Collaboration sharing read & write permissions. Go to the DropBox App settings and copy the `APP_KEY`. Maybe need to generate and copy the `ACCESS_TOKEN` too.. I forgot. Add the APP_KEY and ACCESS_TOKEN to `api/.env`

Back to this repo. Install the GUI.

```
npm install
```


Install the server.

```
cd api
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```


### Run the app


First get the server going.
```
flask --app api --debug run
```

Then, start the GUI. Preview the app in a browser.
```
npm start
```

Or run the Electron app.
```
npm run dev
```


### Mods from Savita's original

- replaced `react-loading-overlay` package with `react-loading-overlay-ts` for React 18 compatibility.


### TODO 

Make api.py "../files" configurable
Make the Download button save to OS Downloads folder
