import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { apiService } from '@/services/api'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      await apiService.requestPasswordReset(email)
      setMessage('Se o email existir, enviaremos um link de recuperação.')
    } catch (e) {
      setMessage('Não foi possível enviar o email. Verifique as configurações SMTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-wireguard-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Recuperar senha</CardTitle>
          <CardDescription className="text-gray-400">Informe seu e-mail para receber o link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-700/50 border-gray-600 text-white" required />
            </div>
            {message && (
              <div className="text-emerald-400 text-sm bg-emerald-900/20 p-3 rounded-md border border-emerald-800">
                {message}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              {loading ? 'Enviando...' : 'Enviar link'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/login')} className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword