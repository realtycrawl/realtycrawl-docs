# RealtyCrawl documentation

Mintlify source for [docs.realtycrawl.dev](https://docs.realtycrawl.dev). The public OpenAPI contract includes proposed operations: check live capabilities before calling a source.

## Develop

```bash
npm test
npx mint validate
npx mint dev
```

`docs.json` defines the navigation and styling. Each API page binds to an operation in `openapi.json`. Guides cover authentication, credits, coverage, pagination, errors, REST examples, MCP and agent skills. `npm run check:live` compares the public operation contract without credentials or paid calls.

## Publish

Connect this repository in Mintlify with branch `main` and content directory `/`. Set the custom domain to `docs.realtycrawl.dev` and use the DNS record provided by Mintlify. Commits to the connected branch deploy the site. The application redirects its former `/docs` routes here.

[Documentation](https://docs.realtycrawl.dev) · [MCP](https://github.com/realtycrawl/realtycrawl-mcp) · [Agent skills](https://github.com/realtycrawl/realtycrawl-agent-skills) · [Examples](https://github.com/realtycrawl/realtycrawl-api-examples)
