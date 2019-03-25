import React, {Component} from 'react';
import ReaderPanel from './components/reader-panel.js';

class App extends Component {
    render() {
        return(
            <div>
                <h1>MicroSense Dashboard</h1>
                <ReaderPanel />
            </div>
        );
    }
}

export default App;