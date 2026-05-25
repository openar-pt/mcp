<img src="banner.svg" alt="openAR" width="100%"/>

# @openar/mcp

Servidor MCP para o [openAR](https://openar.pt) — dados abertos da Assembleia da República.

Permite a agentes de IA aceder a iniciativas legislativas, deputados, votações em plenário, petições e comissões parlamentares.

## Utilização

### Claude Desktop

Adiciona ao ficheiro de configuração do Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openar": {
      "command": "npx",
      "args": ["-y", "@openar/mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add --scope user openar -- npx -y @openar/mcp
```

### Outros clientes MCP

```json
{
  "command": "npx",
  "args": ["-y", "@openar/mcp"]
}
```

## Ferramentas disponíveis

| Ferramenta | Descrição |
|------------|-----------|
| `get_meta` | Valores disponíveis para filtros: legislaturas, grupos parlamentares, tipos de iniciativa |
| `list_iniciativas` | Pesquisar iniciativas legislativas por legislatura, tipo, estado, grupo, palavra-chave |
| `get_iniciativa` | Detalhe completo de uma iniciativa: autores, eventos, votações, publicações e fases em comissão |
| `list_deputados` | Pesquisar deputados por legislatura, grupo parlamentar, nome ou situação |
| `get_deputado` | Perfil do deputado com todos os mandatos e iniciativas recentes |
| `get_deputado_atividade` | Actividade parlamentar completa: intervenções, comissões, requerimentos, relatorias |
| `list_votacoes` | Votações em plenário filtradas por legislatura, resultado ou intervalo de datas |
| `get_votacao` | Detalhe de uma votação com resultado por grupo parlamentar |
| `list_peticoes` | Petições filtradas por legislatura, situação ou palavra-chave |
| `get_peticao` | Detalhe de uma petição com comissões, relatores e documentos |
| `list_comissoes` | Listar comissões parlamentares, com filtro por legislatura ou nome |
| `get_comissao` | Detalhe de uma comissão com todas as iniciativas apreciadas e respetivos relatores |

## Dados

Todos os dados provêm de [api.openar.pt](https://api.openar.pt) — uma API gratuita e aberta com cobertura da I à XVII Legislatura (1976–presente). Não requer autenticação.

Especificação OpenAPI: [api.openar.pt/openapi.json](https://api.openar.pt/openapi.json)

## Licença

MIT
