import { useState } from "react";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { text: input, completed: false }]);
      setInput("");
    }
  };

  const toggleTodo = (index) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

  const deleteTodo = (index) => {
    setTodos(todos.filters((_, i) => i !== index));
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h1>Todo App</h1>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo"
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li
            key={index}
            style={{ textDecoration: todo.completed ? "line-through" : "none" }}
          >
            <span onClick={() => toggleTodo(index)}>{todo.text}</span>
            <button onClick={() => deleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todo;
