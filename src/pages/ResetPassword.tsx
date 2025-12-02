import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'
import { apiService } from '@/services/api'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const t = searchParams.get('token') || ''
    setToken(t)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (password !== confirm) {
      setMessage('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      const res = await apiService.resetPassword(token, password)
      if (res.success) {
        setMessage('Senha redefinida com sucesso')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (e) {
      setMessage('Falha ao redefinir senha. O token pode estar inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-wireguard-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Redefinir senha</CardTitle>
          <CardDescription className="text-gray-400">Digite a nova senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Nova senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-700/50 border-gray-600 text-white" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-gray-300">Confirmar nova senha</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-gray-700/50 border-gray-600 text-white" required />
            </div>
            {message && (
              <div className="text-emerald-400 text-sm bg-emerald-900/20 p-3 rounded-md border border-emerald-800">
                {message}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword