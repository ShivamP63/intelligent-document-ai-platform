# AWS deployment notes

The backend deployment workflow in `.github/workflows/deploy-aws.yml` is designed
for the shared EC2 foundation defined in the companion workflow repository.
It uses GitHub Actions OIDC and does not require long-lived AWS access keys.

Required GitHub configuration after Terraform is applied:

- Repository variable `AWS_ACCOUNT_ID`
- Repository secret `AWS_DEPLOY_ROLE_ARN`

The application must not be exposed publicly until JWT authentication,
per-user document ownership, and private S3 object handling are implemented and
tested. The current Vercel preview remains browser-only and is unaffected.
