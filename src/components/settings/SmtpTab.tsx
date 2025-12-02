import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Save, Mail, Send, Copy, AlertTriangle } from 'lucide-react'
import { apiService } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

const SmtpTab = () => {
  const [form, setForm] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    useTls: true,
    useSsl: false,
    fromEmail: ''
  })
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const [testing, setTesting] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [showFullError, setShowFullError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getSmtpConfig()
        if (res.success && res.data) {
          setForm({
            host: res.data.host || '',
            port: res.data.port || '',
            username: res.data.username || '',
            password: res.data.password || '',
            useTls: !!res.data.use_tls || true,
            useSsl: !!res.data.use_ssl || false,
            fromEmail: res.data.from_email || ''
          })
        }
      } catch (e) {}
    }
    load()
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onSave = async () => {
    try {
      const res = await apiService.saveSmtpConfig(form)
      if (res.success) {
        toast({ title: '✅ SMTP salvo', description: 'Configurações de email salvas com sucesso.' })
      }
    } catch (e) {
      toast({ title: 'Erro ao salvar SMTP', description: 'Verifique os campos e tente novamente.', variant: 'destructive' })
    }
  }

  const onTest = async () => {
    if (!currentUser?.email) {
      toast({ title: 'Usuário não identificado', description: 'Faça login para testar o envio.', variant: 'destructive' })
      return
    }
    setTesting(true)
    try {
      const res = await apiService.sendSmtpTest(currentUser.email)
      if (res.success) {
        toast({ title: '✅ Teste enviado', description: `Verifique seu e-mail (${currentUser.email}).` })
      } else {
        setErrorText(String(res.error || 'Verifique as configurações e conectividade.'))
        setShowFullError(false)
        setErrorOpen(true)
      }
    } catch (e) {
      setErrorText(String((e as any)?.message || 'Erro ao enviar teste. Verifique as configurações SMTP e tente novamente.'))
      setShowFullError(false)
      setErrorOpen(true)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <Mail className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Configurações SMTP</h2>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Servidor de Email</CardTitle>
          <CardDescription>Configure SMTP para recuperação de senha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="host" className="text-gray-300">Host</Label>
              <Input id="host" name="host" value={form.host} onChange={onChange} className="bg-gray-700/50 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port" className="text-gray-300">Porta</Label>
              <Input id="port" name="port" value={form.port} onChange={onChange} className="bg-gray-700/50 border-gray-600 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Usuário</Label>
              <Input id="username" name="username" value={form.username} onChange={onChange} className="bg-gray-700/50 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={onChange} className="bg-gray-700/50 border-gray-600 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fromEmail" className="text-gray-300">Remetente (From)</Label>
              <Input id="fromEmail" name="fromEmail" value={form.fromEmail} onChange={onChange} className="bg-gray-700/50 border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Segurança</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="useTls" checked={form.useTls} onCheckedChange={(c) => setForm(prev => ({ ...prev, useTls: c }))} />
                  <Label htmlFor="useTls" className="text-gray-300">TLS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="useSsl" checked={form.useSsl} onCheckedChange={(c) => setForm(prev => ({ ...prev, useSsl: c }))} />
                  <Label htmlFor="useSsl" className="text-gray-300">SSL</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onTest} disabled={testing} variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20">
              <Send className="w-4 h-4 mr-2" />
              {testing ? 'Testando...' : 'Testar envio'}
            </Button>
            <Button onClick={onSave} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-md shadow-green-500/15">
              <Save className="w-4 h-4 mr-2" />
              Salvar SMTP
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              Erro ao enviar teste SMTP
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detalhes do erro. Se for muito extenso, visualize parcialmente ou copie para análise.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-800/60 border border-gray-700 rounded p-3 max-h-80 overflow-auto text-sm">
            <pre className="whitespace-pre-wrap break-words">
              {showFullError ? errorText : `${errorText.slice(0, 2000)}${errorText.length > 2000 ? '…' : ''}`}
            </pre>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => navigator.clipboard.writeText(errorText)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
            <Button
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-900/20"
              onClick={() => setShowFullError(!showFullError)}
            >
              {showFullError ? 'Mostrar menos' : 'Mostrar completo'}
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              onClick={() => setErrorOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SmtpTab