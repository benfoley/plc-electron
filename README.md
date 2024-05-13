# Demo app for file searching


## Installation

Get DropBox credentials
Add APP_KEY or ACCESS_TOKEN to .env



Install the GUI

Install and run the server. Use `--debug` for hot reloading during development.

```
cd api
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
flask --app api --debug run
```


### Mods 

- replaced `react-loading-overlay` package with `react-loading-overlay-ts` for React 18 compatibility.

### TODO 
Change Flask port to 5001 for mac compatibility?
Make api.py "../files" configuratble



### Dev

Preview the app in a browser with `npm start`

Run the Electron app `npm run dev`
