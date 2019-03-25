import React, {Component} from 'react';

class ReaderPanel extends Component {

    constructor(props) {
        super(props);
        this.getReaders = this.getRequest.bind(this);
        this.searchArray = this.searchArray.bind(this);
        this.selectChange = this.selectChange.bind(this);
        this.sendJobs = this.sendJobs.bind(this);
        this.state = {
            readers: [],
            operations: [],
            runOperations: []
        }
    }

    componentDidMount() {
        this.getRequest("/readers").then((readers) => {
            this.getRequest("/health").then((health) => {
                readers = readers.map((reader) => {
                    var returnedHealth = this.searchArray(health, "reader", reader.name);
                    reader.status = returnedHealth ? returnedHealth.status : "active";
                    reader.message = returnedHealth ? returnedHealth.message : "This reader is currently running.";
                    return reader;
                });
                this.setState({readers: readers});
            });
        });
        this.getRequest("/operations").then((operations) => {
            operations = operations.map((operation) => {
                operation = {
                    name: operation.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
                    value: operation
                }
                return operation;
            });
            this.setState({operations: operations});
        });
    }

    searchArray(arr, field, value) {
        var result = false;
        arr.forEach(element => {
            if (element[field] == value) {
                result = element;
            }
        });
        return result;
    }

    getRequest(uri) {
        return new Promise((resolve, reject) => {
            fetch(uri)
              .then(res => res.json())
              .then((result) => {resolve(result)},(error) => {reject(error)})
        });
    }

    selectChange(name, event) {
        var operation = event.target.value;
        this.state.runOperations.forEach((element, index) => { // remove the changed value if it already exists
            if (element.name == name) {
                var arr = this.state.runOperations;
                arr = arr.splice(index, 1);
                this.setState({runOperations: arr});
            }
        });
        var newArr = this.state.runOperations;
        var job = {
            name: name,
            operation: operation
        };
        newArr.push(job);
    }

    sendJobs() {
        this.state.operations.forEach((operation) => {
            var readers = [];
            var log = `${operation.name} Operations:\n`;
            var counter = 0;
            var max = 0;
            this.state.runOperations.forEach((job) => {
                if (job.operation == operation.value) {
                    readers.push(job.name);
                    log += `\nReader ${job.name} has received your job request.`;
                }
            });
            if (readers.length > 0) {
                max++;
                fetch('/jobs', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        operation: operation.value,
                        readers: readers
                    })
                })
                .then(this.handleErrors)
                .then(() => {
                    counter++;
                    if (counter == max && max > 0) {
                        alert(log);
                    }
                })
            }
        });
    }

    handleErrors(response) {
        if (!response.ok) {
            alert(response.statusText);
        }
        return response;
    }

    render() {
        return(
            <div id="readers-panel">
                <h2>Readers</h2>
                <table>
                    <thead>
                        <tr><th>Status</th><th>Reader</th><th>Address</th><th>Status Message</th><th>Operation</th></tr>
                    </thead>
                    <tbody>
                            {this.state.readers.length > 0 && this.state.operations.length > 0 ? this.state.readers.map(reader => (
                                <tr key={reader.name}>
                                    <td><div className={"status " + reader.status} /></td>
                                    <td>{reader.name}</td>
                                    <td>{reader.address}</td>
                                    <td>{reader.message}</td>
                                    <td>
                                        <select disabled={reader.status == "ERROR"} onChange={(e) => this.selectChange(reader.name, e)} >
                                            <option value="">No Operation</option>
                                            {this.state.operations.map(operation => (
                                                <option key={operation.value} value={operation.value}>{operation.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            )) : null }
                            <tr><td></td><td></td><td></td><td></td><td><button onClick={this.sendJobs}>Run Operations</button></td></tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ReaderPanel;