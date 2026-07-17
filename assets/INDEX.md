# Asset library index

Three libraries of hand-drawn, brand-neutral 24×24 glyphs (stroke
`currentColor`, width 1.7). Generated diagrams stay self-contained: only the
symbols a diagram uses get inlined into its `<defs>`.

Pull symbols with the CLI:

```bash
node scripts/icons.mjs list                 # all libraries + icons
node scripts/icons.mjs grep db              # search ids
node scripts/icons.mjs pick i-kubernetes i-vector-db   # print defs-ready markup
```

## core.svg — category glyphs (already in the template)

| Icon | Use for |
|---|---|
| `i-client` | browsers, web apps, desktop clients |
| `i-gateway` | API gateways, proxies, routers, load-balancer (generic) |
| `i-compute` | services, workers, generic runtime |
| `i-storage` | generic databases, blob stores |
| `i-queue` | message buses, streams |
| `i-security` | auth, guards, policies |
| `i-external` | third-party SaaS, clouds |
| `i-observe` | metrics, tracing, logging |

## tech.svg — specific technologies

| Icon | Semantic labels |
|---|---|
| `i-kubernetes` | kubernetes, k8s, aws.eks, gcp.gke, azure.aks, nomad |
| `i-container` | docker, containerd, aws.ecs, container runtime |
| `i-function` | aws.lambda, gcp.functions, azure.functions, serverless, edge-function |
| `i-gpu` | gpu, gpu-pool, training-job, cuda, aws.p4/p5 |
| `i-vector-db` | pinecone, weaviate, qdrant, pgvector, milvus, vector search |
| `i-cache` | redis, memcached, aws.elasticache, cdn-cache |
| `i-warehouse` | snowflake, bigquery, redshift, clickhouse, data-lake |
| `i-search` | elasticsearch, opensearch, algolia, meilisearch |
| `i-ml-model` | ml-model, feature-store, sagemaker, mlflow, training |
| `i-llm` | openai, anthropic, claude, gemini, llm, genai, copilot |
| `i-mobile` | ios, android, flutter, react-native |
| `i-terminal` | cli, ssh, shell, developer tooling |
| `i-git` | git, github, gitlab, bitbucket, monorepo |
| `i-pipeline` | ci, cd, github-actions, jenkins, argo, buildkite |
| `i-registry` | container-registry, artifactory, npm, package registry |
| `i-cdn` | cdn, cloudflare, aws.cloudfront, fastly, dns, edge |
| `i-lb` | load-balancer, aws.alb, aws.nlb, haproxy (dedicated LB nodes) |
| `i-key` | vault, kms, secrets-manager, api-keys, certificates |
| `i-user` | user, customer, actor, admin |
| `i-team` | team, org, tenant, reviewers, approvers |
| `i-email` | email, ses, sendgrid, smtp, newsletters |
| `i-payment` | stripe, paypal, billing, checkout, cards |
| `i-plug` | webhook, integration, connector, mcp, plugin |
| `i-scheduler` | cron, scheduler, temporal, airflow trigger, timer jobs |
| `i-file` | documents, contracts, uploads, reports, config files |
| `i-analytics` | analytics, bi, dashboards, mixpanel, amplitude |
| `i-notification` | push, alerts, pagerduty, sns notifications |
| `i-config` | config service, feature flags, launchdarkly, settings |
| `i-robot` | agent, bot, automation, ai-assistant, crawler |

## shapes.svg — workflow / lifecycle markers

| Icon | Use for |
|---|---|
| `s-decision` | decision/branch points |
| `s-start` | workflow start, trigger |
| `s-end` | terminal state, done |
| `s-check` | success, approved, passed |
| `s-error` | failure, rejected, alert state |
| `s-retry` | retry loops, reconciliation |
| `s-cancel` | cancelled, aborted, skipped |
| `s-doc` | manual step, document/approval artifact |
| `s-timer` | wait states, timeouts, delays |

## Adding a library

Drop `assets/<name>.svg` containing only `<symbol id="..." viewBox="0 0 24 24">`
entries (stroke `currentColor`, width 1.7, no fills, no external refs), add its
table here, and the CLI picks it up automatically. Do not use real brand
logomarks — glyphs must be brand-neutral (trademark safety).
