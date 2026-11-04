# RealtyCrawl documentation

Mintlify source for [realtycrawl.dev/docs](https://realtycrawl.dev/docs). The public OpenAPI contract includes proposed operations: check live capabilities before calling a source.

## Develop

```bash
npm test
npx mint validate
npx mint dev
```

`docs.json` defines the navigation and styling. Each API page binds to an operation in `openapi.json`. Guides cover authentication, credits, coverage, pagination, errors, REST examples, MCP and agent skills. `npm run check:live` compares the public operation contract without credentials or paid calls.

## Publish

Connect this repository in Mintlify with branch `main` and content directory `/`. The published site uses the `/docs` base path at https://realtycrawl.dev/docs. Commits to the connected branch deploy the site. Keep documentation links under this path.

[Documentation](https://realtycrawl.dev/docs) · [MCP](https://github.com/realtycrawl/realtycrawl-mcp) · [Agent skills](https://github.com/realtycrawl/realtycrawl-agent-skills) · [Examples](https://github.com/realtycrawl/realtycrawl-api-examples)

## Release compatibility

Publish documentation against the deployed API contract. Run `npm run check:live` before a documentation cutover. Generate documentation from the reviewed application contract with `node scripts/generate-docs.mjs` in the application workspace. Use `--live-docs` when intentionally targeting the deployed contract. `coverage.json` records a dated release snapshot; live platform-operation capabilities remain authoritative. Runnable examples can use a higher `X-Max-Credits` cap than the current charge; `X-Credits-Used` reports the actual charge.

Run `npm run check:site` to verify HTTPS and every public documentation route. The manual **Verify live docs** workflow performs this check plus deployed API-contract comparison from GitHub Actions without credentials or billable requests.

## Billing and credits

Paid plans provide monthly credits: Starter $15 for 2,500, Growth $49 for 20,000, and Pro $299 for 150,000. Monthly credits expire at period end without rollover or automatic overage charges. Eligible accounts receive 500 signup credits once. Existing balances remain nonexpiring and usable without subscribing; requests spend monthly credits first. Manage billing in the [dashboard](https://realtycrawl.dev/dashboard/payments) and read the [billing guide](https://realtycrawl.dev/docs/billing). Operation costs, request budgets, and idempotency rules remain unchanged.
