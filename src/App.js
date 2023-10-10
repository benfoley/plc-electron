// import logo from './logo.svg';
import './App.css';
import SearchBar from './components/SearchBar';
import ResultsPanel from './components/ResultsPanel';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      
        <SearchBar />
      </header>

      <ResultsPanel />
    </div>
  );
}

export default App;
