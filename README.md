## Visão Geral

O WireGuard Multi-Router Manager é uma aplicação web completa para gerenciar conexões WireGuard em múltiplos tipos de roteadores (Mikrotik, OPNsense, pfSense, Unifi).

### Componentes do Sistema:
- **Frontend**: React + TypeScript + Vite (porta 3000/80)
- **Backend**: Python Flask API (porta 5000)
- **Banco de Dados**: SQLite (`wireguard_manager.db`)
- **Proxy Web**: Nginx (produção)

## Requisitos do Sistema

### Desenvolvimento Local:
- Node.js 18+
- Python 3.11+
- 2GB RAM mínimo
- 1GB espaço em disco

### Produção:
- Docker + Docker Compose
- 4GB RAM recomendado
- 10GB espaço em disco
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+

## Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend       │────│   Roteadores    │
│   (React/Nginx) │    │   (Flask API)   │    │   (Diversos)    │
│   Porta 80/3000 │    │   Porta 5000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │
          └───────────────────────┼─────────────────┐
                                  │                 │
                        ┌─────────────────┐ ┌─────────────────┐
                        │   SQLite DB     │ │   Volumes       │
                        │   wireguard_    │ │   Persistentes  │
                        │   manager.db    │ │                 │
                        └─────────────────┘ └─────────────────┘
```
