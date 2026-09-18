import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Circle, Edit3, Moon, Plus, Search, Sun, Trash2, X } from 'lucide-react';
import './App.css';

const STORAGE_KEY='taskflow-todos-v1';
const THEME_KEY='taskflow-theme-v1';

function loadTodos(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export default function App(){
  const [todos,setTodos]=useState(loadTodos);
  const [text,setText]=useState('');
  const [priority,setPriority]=useState('medium');
  const [dueDate,setDueDate]=useState('');
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [editingId,setEditingId]=useState(null);
  const [editText,setEditText]=useState('');
  const [theme,setTheme]=useState(()=>localStorage.getItem(THEME_KEY)||'light');

  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(todos)),[todos]);
  useEffect(()=>{ document.documentElement.dataset.theme=theme; localStorage.setItem(THEME_KEY,theme); },[theme]);

  const addTodo=e=>{
    e.preventDefault();
    const value=text.trim();
    if(!value) return;
    setTodos(prev=>[{id:crypto.randomUUID(),text:value,completed:false,priority,dueDate,createdAt:Date.now()},...prev]);
    setText(''); setDueDate(''); setPriority('medium');
  };

  const toggle=id=>setTodos(prev=>prev.map(t=>t.id===id?{...t,completed:!t.completed}:t));
  const remove=id=>setTodos(prev=>prev.filter(t=>t.id!==id));
  const clearCompleted=()=>setTodos(prev=>prev.filter(t=>!t.completed));

  const startEdit=t=>{setEditingId(t.id);setEditText(t.text)};
  const saveEdit=id=>{
    const value=editText.trim();
    if(value) setTodos(prev=>prev.map(t=>t.id===id?{...t,text:value}:t));
    setEditingId(null);setEditText('');
  };

  const visible=useMemo(()=>{
    const q=search.toLowerCase().trim();
    return todos.filter(t=>{
      const matchesFilter=filter==='all'||(filter==='active'&&!t.completed)||(filter==='completed'&&t.completed);
      return matchesFilter && (!q||t.text.toLowerCase().includes(q));
    });
  },[todos,filter,search]);

  const remaining=todos.filter(t=>!t.completed).length;
  const completed=todos.length-remaining;
  const progress=todos.length?Math.round(completed/todos.length*100):0;

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="brandIcon"><Check size={20}/></div><span>TaskFlow</span></div>
      <button className="iconButton" onClick={()=>setTheme(theme==='light'?'dark':'light')} aria-label="Toggle theme">
        {theme==='light'?<Moon size={19}/>:<Sun size={19}/>}
      </button>
    </header>

    <main className="container">
      <section className="hero">
        <div><p className="eyebrow">YOUR PERSONAL WORKSPACE</p><h1>Get things done.</h1><p className="subtitle">Plan your day, focus on what matters, and keep moving.</p></div>
        <div className="statsCard"><div><strong>{remaining}</strong><span>tasks left</span></div><div className="progress"><div className="progressTrack"><div style={{width:`${progress}%`}}/></div><small>{progress}% complete</small></div></div>
      </section>

      <section className="composer">
        <form onSubmit={addTodo}>
          <div className="inputRow"><Plus size={20}/><input value={text} onChange={e=>setText(e.target.value)} placeholder="What needs to be done?" autoFocus/><button className="addButton" type="submit">Add task</button></div>
          <div className="options">
            <label>Priority <select value={priority} onChange={e=>setPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            <label>Due date <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label>
          </div>
        </form>
      </section>

      <section className="toolbar">
        <div className="tabs">{[['all','All'],['active','Active'],['completed','Completed']].map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{label}<span>{key==='all'?todos.length:key==='active'?remaining:completed}</span></button>)}</div>
        <div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."/></div>
      </section>

      <section className="taskList">
        {visible.length===0 ? <div className="empty"><CheckCircle2 size={44}/><h3>{search?'No matching tasks':'Nothing here yet'}</h3><p>{search?'Try a different search.':'Add a task above and make today productive.'}</p></div> :
          visible.map(todo=><article className={`task ${todo.completed?'done':''}`} key={todo.id}>
            <button className="check" onClick={()=>toggle(todo.id)} aria-label={todo.completed?'Mark active':'Mark completed'}>{todo.completed?<CheckCircle2 size={23}/>:<Circle size={23}/>}</button>
            <div className="taskBody">
              {editingId===todo.id?<div className="editRow"><input value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveEdit(todo.id)} autoFocus/><button onClick={()=>saveEdit(todo.id)}><Check size={18}/></button><button onClick={()=>setEditingId(null)}><X size={18}/></button></div>:
                <><div className="taskTitle">{todo.text}</div><div className="meta"><span className={`priority ${todo.priority}`}>{todo.priority}</span>{todo.dueDate&&<span>Due {new Date(todo.dueDate+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span>}</div></>}
            </div>
            {editingId!==todo.id&&<div className="actions"><button onClick={()=>startEdit(todo)} aria-label="Edit"><Edit3 size={17}/></button><button onClick={()=>remove(todo.id)} aria-label="Delete"><Trash2 size={17}/></button></div>}
          </article>)
        }
      </section>

      {completed>0&&<button className="clear" onClick={clearCompleted}>Clear completed</button>}
    </main>
    <footer><span>TaskFlow</span><span>Built for a focused day</span></footer>
  </div>
}