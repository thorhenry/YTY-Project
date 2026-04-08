import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api, setAuthToken } from './lib/api'
import type { Item, User } from './lib/api'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [me, setMe] = useState<User | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    price: '',
    stock: '0',
  })

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const loadItems = async () => {
    const response = await api.get<Item[]>('/items')
    setItems(response.data)
  }

  const loadMe = async () => {
    if (!token) {
      setMe(null)
      return
    }
    try {
      const response = await api.get<User>('/auth/me')
      setMe(response.data)
    } catch {
      setMe(null)
    }
  }

  useEffect(() => {
    loadItems().catch(() => setMessage('Could not load catalog'))
    loadMe().catch(() => setMessage('Could not load user profile'))
  }, [token])

  const onAuth = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    try {
      if (isRegisterMode) {
        await api.post('/auth/register', {
          email,
          password,
          full_name: fullName || null,
        })
        setMessage('Registration successful. Login now.')
        setIsRegisterMode(false)
        return
      }

      const body = new URLSearchParams()
      body.set('username', email)
      body.set('password', password)
      const response = await api.post('/auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      localStorage.setItem('token', response.data.access_token)
      setToken(response.data.access_token)
      setMessage('Logged in successfully.')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? 'Authentication failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setMe(null)
  }

  const onCreateItem = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    try {
      await api.post('/items', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      })
      setForm({ name: '', description: '', category: '', image_url: '', price: '', stock: '0' })
      await loadItems()
      setMessage('Item created.')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? 'Failed to create item')
    }
  }

  const onDeleteItem = async (itemId: number) => {
    try {
      await api.delete(`/items/${itemId}`)
      await loadItems()
      setMessage('Item deleted.')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? 'Failed to delete item')
    }
  }

  const onUpdateStock = async (itemId: number, stock: number) => {
    try {
      await api.put(`/items/${itemId}`, { stock: Math.max(0, stock) })
      await loadItems()
      setMessage('Item updated.')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail ?? 'Failed to update item')
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Clothing Brand Admin + Storefront</h1>
      {message && <p className="mb-4 rounded bg-slate-800 p-3 text-sm">{message}</p>}

      <section className="mb-8 grid gap-4 rounded border border-slate-800 p-4 md:grid-cols-2">
        <form className="space-y-3" onSubmit={onAuth}>
          <h2 className="text-xl font-semibold">{isRegisterMode ? 'Register' : 'Login'}</h2>
          {isRegisterMode && (
            <input
              className="w-full rounded bg-slate-900 p-2"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            className="w-full rounded bg-slate-900 p-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded bg-slate-900 p-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="rounded bg-indigo-600 px-4 py-2" type="submit">
            {isRegisterMode ? 'Create account' : 'Sign in'}
          </button>
          <button
            className="ml-2 rounded border border-slate-700 px-4 py-2"
            type="button"
            onClick={() => setIsRegisterMode((prev) => !prev)}
          >
            {isRegisterMode ? 'Switch to login' : 'Switch to register'}
          </button>
        </form>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Session</h2>
          {me ? (
            <>
              <p>{me.email}</p>
              <p>Role: {me.is_admin ? 'Admin' : 'User'}</p>
              <button className="rounded bg-rose-600 px-4 py-2" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <p>Not logged in.</p>
          )}
        </div>
      </section>

      {me?.is_admin && (
        <section className="mb-8 rounded border border-slate-800 p-4">
          <h2 className="mb-3 text-xl font-semibold">Add Item</h2>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreateItem}>
            {Object.entries(form).map(([key, value]) => (
              <input
                key={key}
                className="rounded bg-slate-900 p-2"
                placeholder={key}
                value={value}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                required={key === 'name' || key === 'price' || key === 'stock'}
              />
            ))}
            <button className="rounded bg-emerald-600 px-4 py-2 md:col-span-2" type="submit">
              Create item
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">Catalog</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article className="rounded border border-slate-800 p-4" key={item.id}>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-slate-300">{item.description || 'No description'}</p>
              <p className="mt-2">Category: {item.category || 'General'}</p>
              <p>Price: ${item.price.toFixed(2)}</p>
              <p>Stock: {item.stock}</p>
              {me?.is_admin && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="rounded bg-slate-700 px-2 py-1 text-sm"
                    onClick={() => onUpdateStock(item.id, item.stock + 1)}
                  >
                    + Stock
                  </button>
                  <button
                    className="rounded bg-rose-700 px-2 py-1 text-sm"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
