# NIB Agendas - Router Worker

Worker Cloudflare que roteia requisições para os diferentes serviços do sistema de agendamentos.

## Rotas

| Caminho | Destino |
|---------|---------|
| `/administracao/*` | nibagendas-adm.pages.dev |
| `/paciente/*` | nibagendas-paciente.pages.dev |
| `/medico/*` | nibagendas-medico.pages.dev |
| `/documentacao/*` | nibagendas-docs.pages.dev |
| `/api/*` | nibagendas-api.command-systems.workers.dev |

## Desenvolvimento

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

## Configuração

O deploy automático é feito via GitHub Actions. Ao fazer push na branch `main`, o worker é automaticamente deployado no Cloudflare.
