# Semantic tech labels → visual category

Users describe components with semantic labels (`aws.lambda`, `postgres`,
`github-actions`). Map each to one of the eight visual categories — the
category supplies the color and a default glyph; the label itself goes in the
node's `.node-sub` line. For a sharper glyph than the category default
(kubernetes wheel, vector-db, LLM sparkle, …), check `assets/INDEX.md` and
inline the symbol via `node scripts/icons.mjs pick <id>`.

| Category (`cat-*`) | Glyph | Semantic labels |
|---|---|---|
| `cat-client` | browser | web, react, vue, angular, nextjs-client, mobile, ios, android, flutter, react-native, cli, desktop, electron, browser-extension, iot-device |
| `cat-gateway` | router | api-gateway, aws.apigateway, kong, nginx, envoy, traefik, haproxy, istio, load-balancer, aws.alb, aws.nlb, cloudflare, cdn, aws.cloudfront, fastly, dns, aws.route53, reverse-proxy, graphql-gateway, apollo-router, bff |
| `cat-compute` | chip | service, microservice, api, backend, node.js, python, go, java, spring, django, fastapi, rails, dotnet, aws.lambda, aws.ecs, aws.eks, aws.ec2, gcp.cloudrun, gcp.gke, gcp.functions, azure.functions, azure.aks, kubernetes, k8s, docker, worker, cron, batch, spark, flink, gpu, training-job, inference-server, vllm, triton |
| `cat-storage` | cylinder | postgres, mysql, mariadb, aws.rds, aws.aurora, sqlite, mongodb, dynamodb, cassandra, cockroachdb, redis, memcached, elasticsearch, opensearch, clickhouse, bigquery, snowflake, redshift, s3, aws.s3, gcs, azure.blob, minio, hdfs, vector-db, pinecone, weaviate, qdrant, pgvector, feature-store, data-warehouse, data-lake |
| `cat-queue` | stacked bars | kafka, aws.sqs, aws.sns, aws.kinesis, rabbitmq, nats, pulsar, gcp.pubsub, azure.servicebus, celery, sidekiq, bullmq, temporal, airflow, dagster, prefect, event-bus, stream, webhook-relay |
| `cat-external` | cloud | openai, anthropic, claude, gemini, huggingface, stripe, paypal, twilio, sendgrid, ses, slack-api, github, github-actions*, gitlab, jira, salesforce, auth0*, firebase, supabase, algolia, maps-api, third-party, partner-api, saas |
| `cat-security` | shield | auth, auth-service, oauth2, oidc, jwt, sso, saml, auth0, aws.cognito, keycloak, vault, aws.kms, secrets-manager, waf, firewall, iam, mfa, pii-vault, encryption, certificate-authority |
| `cat-observe` | pulse line | prometheus, grafana, datadog, newrelic, sentry, otel, opentelemetry, jaeger, zipkin, loki, elk, cloudwatch, gcp.monitoring, pagerduty, alerting, logging, metrics, tracing, audit-log |

Rules of thumb:
- Entries marked `*` are context-dependent: `github-actions` as a CI *runner
  stage* in a workflow diagram → `cat-compute`; as an external trigger →
  `cat-external`. `auth0` self-hosted/identity tier → `cat-security`; as an
  outbound SaaS dependency → `cat-external`.
- Unknown label? Infer from role: stores bytes → storage; moves messages →
  queue; runs code you own → compute; code you don't own → external.
- A database used purely as a queue (e.g. postgres SKIP LOCKED) keeps its
  storage look; say `postgres · job queue` in the sub-label.
