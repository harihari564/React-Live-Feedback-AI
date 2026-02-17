import { useState } from 'react'

// --- COMPONENTS ---
const GlassCard = ({ children, title }) => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black">
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl w-96 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-white">{title}</h2>
      {children}
    </div>
  </div>
)

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input 
    value={value} 
    onChange={onChange} 
    type={type} 
    placeholder={placeholder} 
    autoComplete="off"
    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" 
  />
)

const Button = ({ onClick, text, color }) => (
  <button onClick={onClick} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transform transition hover:scale-105 ${color === 'red' ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
    {text}
  </button>
)

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('signin') // signin, signup, feedback, admin, admin_settings
  
  // Forms
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [email, setEmail] = useState('')
  
  // Feedback
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [modal, setModal] = useState(null)
  
  // Admin
  const [adminData, setAdminData] = useState(null)
  
  const API_URL = "http://127.0.0.1:5000/api"

  // --- API CALLS ---
  async function handleAuth(endpoint) {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass, email })
      })
      const data = await res.json()
      
      if (data.status === 'success') {
        if (endpoint === 'signup') {
           alert("Account Created! Please Sign In."); setView('signin'); setUser(''); setPass('');
        } else {
           setUser(data.username)
           if (data.role === 'admin') { fetchAdmin(); setView('admin'); }
           else { setView('feedback'); }
        }
      } else { alert(data.error || "Failed"); }
    } catch (e) { alert("Backend Offline."); }
  }

  async function submitFeedback() {
    const res = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, comment, rating })
    })
    const data = await res.json()
    setModal(data.sentiment)
  }

  async function fetchAdmin() {
    const res = await fetch(`${API_URL}/admin`)
    const data = await res.json()
    setAdminData(data)
  }

  async function deleteUser(id) {
    if(!confirm("Delete this user?")) return;
    await fetch(`${API_URL}/admin/delete/${id}`, { method: 'DELETE' })
    fetchAdmin() 
  }

  function logout() { setUser(''); setPass(''); setView('signin'); }

  // --- VIEWS ---

  if (view === 'signin') return (
    <GlassCard title="Login Portal">
      <Input value={user} placeholder="Username" onChange={e => setUser(e.target.value)} />
      <Input value={pass} type="password" placeholder="Password" onChange={e => setPass(e.target.value)} />
      <Button onClick={() => handleAuth('signin')} text="Login" />
      <p className="text-center mt-4 text-gray-400 cursor-pointer hover:text-white" onClick={() => setView('signup')}>Register</p>
    </GlassCard>
  )

  if (view === 'signup') return (
    <GlassCard title="Create Account">
      <Input value={user} placeholder="Username" onChange={e => setUser(e.target.value)} />
      <Input value={email} placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <Input value={pass} type="password" placeholder="Password" onChange={e => setPass(e.target.value)} />
      <Button onClick={() => handleAuth('signup')} text="Register" />
      <p className="text-center mt-4 text-gray-400 cursor-pointer hover:text-white" onClick={() => setView('signin')}>Back to Login</p>
    </GlassCard>
  )

  if (view === 'feedback') return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-gray-900 to-black text-white">
      <nav className="w-full max-w-2xl flex justify-between p-4 bg-white/5 rounded-xl mb-10 border border-white/10 backdrop-blur-md">
        <h1 className="font-bold text-xl tracking-wider">AI FEEDBACK</h1>
        <button onClick={logout} className="text-red-400 font-bold hover:text-red-300">Logout</button>
      </nav>

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-2">We value your opinion</h2>
        <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-4 h-32 mb-6 text-white" placeholder="Type here..." onChange={e => setComment(e.target.value)}></textarea>
        
        <div className="mb-6">
          <label className="block mb-2 font-bold text-gray-300">Rate Us</label>
          <select className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" onChange={(e) => setRating(e.target.value)} value={rating}>
            <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
            <option value="4">⭐⭐⭐⭐ (Good)</option>
            <option value="3">⭐⭐⭐ (Average)</option>
            <option value="2">⭐⭐ (Poor)</option>
            <option value="1">⭐ (Terrible)</option>
          </select>
        </div>
        <Button onClick={submitFeedback} text="Analyze & Submit" />
      </div>

      {/* Result*/}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-10 rounded-3xl text-center border border-gray-600 animate-bounce">
            <div className="text-5xl mb-4">
              {['joy','love','happy'].some(x=>modal.toLowerCase().includes(x)) ? '😍' :
               ['anger','hate','sad'].some(x=>modal.toLowerCase().includes(x)) ? '😡' : '😐'}
            </div>
            <p className="text-xl text-gray-200">
              Our AI detected your feedback expresses
              <span className="font-bold text-green-400"> {modal}</span>.
            </p>
            <button onClick={() => setModal(null)} className="mt-6 bg-white text-black px-8 py-2 rounded-full font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  )

  // ADMIN PANEL (Includes Dashboard & Settings Tabs)
  if ((view === 'admin' || view === 'admin_settings') && adminData) return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-black/40 p-6 flex flex-col border-r border-white/10">
        <h2 className="text-2xl font-bold text-purple-400 mb-10">ADMIN PANEL</h2>
        
        {/* TABS */}
        <div className="space-y-2">
          <div onClick={() => setView('admin')} className={`p-3 rounded cursor-pointer ${view === 'admin' ? 'bg-white/10 font-bold border-l-4 border-purple-500' : 'text-gray-400 hover:text-white'}`}>Dashboard</div>
          <div onClick={() => setView('admin_settings')} className={`p-3 rounded cursor-pointer ${view === 'admin_settings' ? 'bg-white/10 font-bold border-l-4 border-purple-500' : 'text-gray-400 hover:text-white'}`}>Settings</div>
        </div>

        <button onClick={logout} className="text-red-400 mt-auto border border-red-500/50 py-2 rounded hover:bg-red-500/20">Logout</button>
      </aside>
      
      <main className="flex-1 p-10 overflow-y-auto">
        {view === 'admin' ? (
          <>
            <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-3 gap-6 mb-10">
               <div className="bg-white/5 p-6 rounded-xl border border-white/10"><h3 className="text-gray-400 text-sm font-bold">TOTAL</h3><p className="text-4xl font-bold">{adminData.stats.total}</p></div>
               <div className="bg-white/5 p-6 rounded-xl border border-white/10"><h3 className="text-gray-400 text-sm font-bold">AVG RATING</h3><p className="text-4xl font-bold text-yellow-400">{adminData.stats.rating}</p></div>
               <div className="bg-white/5 p-6 rounded-xl border border-white/10"><h3 className="text-gray-400 text-sm font-bold">DOMINANT EMOTION</h3><p className="text-4xl font-bold text-green-400 capitalize">{adminData.stats.emotion}</p></div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
               <h3 className="p-6 font-bold bg-white/5 border-b border-white/10">Recent Feedback</h3>
               <table className="w-full text-left">
                 <thead className="text-gray-400 text-xs uppercase bg-black/20"><tr><th className="p-4">User</th><th className="p-4">Comment</th><th className="p-4">Rating</th><th className="p-4">Sentiment</th></tr></thead>
                 <tbody>
                   {adminData.reviews.map((r, i) => (
                     <tr key={i} className="border-t border-white/10">
                       <td className="p-4 font-bold">{r[1]}</td>
                       <td className="p-4 text-gray-400">"{r[2]}"</td>
                       <td className="p-4 text-yellow-400">{r[3]} ★</td>
                       <td className="p-4">{r[4]}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8">Settings</h1>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
               <h3 className="p-6 font-bold bg-white/5 border-b border-white/10 text-red-400">Manage Users</h3>
               <table className="w-full text-left">
                 <thead className="text-gray-400 text-xs uppercase bg-black/20"><tr><th className="p-4">ID</th><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Action</th></tr></thead>
                 <tbody>
                   {adminData.users.map((u) => (
                     <tr key={u[0]} className="border-t border-white/10">
                        <td className="p-4 text-gray-500">#{u[0]}</td>
                        <td className="p-4 font-bold">{u[1]}</td>
                        <td className="p-4 text-gray-400">{u[3]}</td>
                        <td className="p-4"><button onClick={() => deleteUser(u[0])} className="text-red-400 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500 hover:text-white">Delete</button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </>
        )}
      </main>
    </div>
  )

  return <div className="text-white text-center mt-20 text-xl">Loading...</div>
}