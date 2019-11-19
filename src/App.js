import React, { Component } from "react";
import TodoItem from "./components/TodoItem/TodoItem";
import "./App.css";

import firebase from "firebase/app";
import { firebaseConfig } from "./secret.firebase";
require("firebase/firestore");

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

class App extends Component {
  state = {
    todoList: [],
    newTodoContent: ""
  };

  componentDidMount() {
    // set up a listener for the 'todos' collection in Firestore
    // once there's any changes made to this collection, the listener function will run
    this.unsubscribeTodos = db.collection("todos").onSnapshot(querySnapshot => {
      // the listener function will
      // 1. receive the latest version of the 'todo' collection
      // 2. loop through all the todo items in the collection
      // 3. push them in a temporary list stored in memory
      // 4. update the state with the new todo list
      let todos = [];
      querySnapshot.forEach(snapshot => {
        // each todo item looks like: {content: 'xxxxx', finished: true, id: 3unuq9yt4ndas}
        todos.push({
          ...snapshot.data(),
          id: snapshot.id
        });
      });
      this.setState({ todoList: todos });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeTodos) {
      // it's a good practice to unsubscribe the listeners to prevent memory leaks
      this.unsubscribeTodos();
    }
  }

  todoContentInputHandler = event => {
    this.setState({
      newTodoContent: event.target.value
    });
  };

  addItemToList = () => {
    if (this.state.newTodoContent === "") {
      return;
    }

    let newTodoList = [...this.state.todoList];
    newTodoList.push({
      content: this.state.newTodoContent,
      finished: false
    });

    this.setState({
      todoList: newTodoList,
      newTodoContent: ""
    });
  };

  removeItemFromList = (event, idx) => {
    event.stopPropagation();
    let newTodoList = [...this.state.todoList];
    newTodoList.splice(idx, 1);
    this.setState({
      todoList: newTodoList
    });
  };

  switchItemCheckedStatus = idx => {
    let newTodoList = [...this.state.todoList];
    newTodoList[idx].finished = !newTodoList[idx].finished;
    this.setState({
      todoList: newTodoList
    });
  };

  render() {
    return (
      <div className="App">
        <div className="Header">
          <h2>Simple To Do</h2>
          <input
            type="text"
            value={this.state.newTodoContent}
            onChange={e => this.todoContentInputHandler(e)}
            placeholder="new to do..."
          />
          <span
            onClick={() => this.addItemToList()}
            className="AddNewToDoButton"
          >
            Add
          </span>
        </div>

        <ul>
          {this.state.todoList.map((todoItem, idx) => {
            return (
              <TodoItem
                key={idx}
                idx={idx}
                todoItem={todoItem}
                remove={this.removeItemFromList}
                switchCheckedStatus={this.switchItemCheckedStatus}
              />
            );
          })}
        </ul>
      </div>
    );
  }
}

export default App;
