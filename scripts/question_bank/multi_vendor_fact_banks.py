"""Fact banks for Azure, Google Cloud, AWS specialty, and additional CompTIA exams.

All items are original practice questions aligned to official exam objectives.
Each fact includes a link to official vendor documentation (not leaked exam content).
"""
from __future__ import annotations

from question_bank.cloud_factory import Fact

# fmt: off
def _f(s, c, w, e, t, u) -> Fact:
    return (s, c, w, e, t, u)

AZURE_BANKS: dict[str, dict[str, list[Fact]]] = {
    "az-900": {
        "cloud-concepts": [
            _f("describe consumption-based pricing", "Pay-as-you-go model", ("Fixed perpetual license only", "CapEx data center only", "No metering"), "Cloud shifts spend to operational usage-based billing.", "Azure pricing", "https://learn.microsoft.com/en-us/azure/cost-management-billing/costs-billing-overview"),
            _f("compare public vs private cloud", "Public cloud shared tenancy with isolation controls", ("Private cloud is always on laptops only", "Hybrid removes all networking", "Edge replaces cloud"), "Public cloud offers elastic shared infrastructure.", "Cloud models", "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/fundamental-concepts"),
            _f("explain high availability concepts", "Availability sets and zones", ("Single VM always sufficient", "Disable redundancy", "Ignore SLAs"), "Zones isolate failure domains within a region.", "Availability zones", "https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview"),
        ],
        "azure-architecture": [
            _f("store unstructured objects at scale", "Azure Blob Storage", ("Azure SQL only for blobs", "VPN gateway", "Entra group mail"), "Blob Storage is object storage for files and media.", "Blob Storage", "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-overview"),
            _f("run Linux VMs in Azure", "Azure Virtual Machines", ("Blob Storage", "Logic Apps only", "DNS zones only"), "VMs provide IaaS compute.", "Virtual Machines", "https://learn.microsoft.com/en-us/azure/virtual-machines/overview"),
            _f("serverless HTTP APIs", "Azure Functions", ("Virtual Network peering only", "ExpressRoute only", "Archive tier only"), "Functions run event-driven code without managing servers.", "Azure Functions", "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview"),
            _f("host managed web applications", "Azure App Service", ("Blob Storage only", "VPN SKU", "ICMP probe"), "App Service is PaaS for web apps.", "App Service", "https://learn.microsoft.com/en-us/azure/app-service/overview"),
            _f("run managed relational databases", "Azure SQL Database", ("CSV files only", "FTP share", "Telnet"), "Azure SQL Database is managed PaaS SQL.", "Azure SQL Database", "https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview"),
        ],
        "azure-management": [
            _f("deploy resources as a unit", "Azure Resource Manager templates", ("Manual portal clicks only policy", "Local AD only", "FTP deploy"), "ARM provides declarative infrastructure deployment.", "ARM templates", "https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview"),
            _f("centralize identity for Azure resources", "Microsoft Entra ID", ("Blob lease only", "NIC teaming", "VPN SKU only"), "Entra ID is the identity platform for Azure.", "Microsoft Entra ID", "https://learn.microsoft.com/en-us/entra/fundamentals/whatis"),
            _f("organize subscriptions and management groups", "Azure hierarchy with management groups", ("Flat tenant with no RBAC", "Single shared root password", "No policies"), "Management groups scale governance across subscriptions.", "Management groups", "https://learn.microsoft.com/en-us/azure/governance/management-groups/overview"),
        ],
    },
    "az-104": {
        "identity-governance": [
            _f("assign permissions at resource scope", "Azure RBAC role assignments", ("Shared admin password", "Public blob ACL only", "Disable MFA"), "RBAC grants least-privilege access to Azure resources.", "Azure RBAC", "https://learn.microsoft.com/en-us/azure/role-based-access-control/overview"),
            _f("apply policies across subscriptions", "Azure Policy", ("Manual spreadsheet tracking", "Ignore compliance", "Guest accounts only"), "Azure Policy enforces organizational standards.", "Azure Policy", "https://learn.microsoft.com/en-us/azure/governance/policy/overview"),
        ],
        "storage": [
            _f("host SMB file shares in Azure", "Azure Files", ("Blob block only for SMB", "VPN only", "DNS only"), "Azure Files provides managed SMB/NFS shares.", "Azure Files", "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction"),
            _f("tier infrequently accessed blobs", "Cool or Archive access tiers", ("Premium SSD VM disks for archives", "Hot tier only always", "Delete all versions"), "Access tiers optimize blob storage cost.", "Access tiers", "https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview"),
        ],
        "compute": [
            _f("scale VM sets automatically", "Virtual Machine Scale Sets", ("Single VM manual resize only", "Static HTML only", "ExpressRoute circuit"), "VMSS provides autoscale for identical VMs.", "VM Scale Sets", "https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview"),
            _f("host web apps without managing VMs", "Azure App Service", ("Bare metal only", "On-prem IIS only", "Archive tier"), "App Service is PaaS for web workloads.", "App Service", "https://learn.microsoft.com/en-us/azure/app-service/overview"),
        ],
        "networking": [
            _f("isolate subnets in a region", "Azure Virtual Network", ("Public internet only design", "Blob containers", "Key Vault secrets only"), "VNets provide private RFC1918 networking in Azure.", "Virtual Network", "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview"),
            _f("connect on-premises to Azure privately", "Site-to-site VPN or ExpressRoute", ("Email attachments", "Public RDP only", "Disable encryption"), "VPN/ExpressRoute extend hybrid connectivity.", "VPN Gateway", "https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways"),
        ],
        "monitor-backup": [
            _f("collect metrics and logs centrally", "Azure Monitor", ("Spreadsheet polling", "Disable diagnostics", "SNMP only on-prem"), "Azure Monitor aggregates platform and app telemetry.", "Azure Monitor", "https://learn.microsoft.com/en-us/azure/azure-monitor/overview"),
            _f("backup VMs and workloads", "Azure Backup", ("Manual USB only policy", "No retention", "Public snapshots"), "Azure Backup provides policy-driven recovery points.", "Azure Backup", "https://learn.microsoft.com/en-us/azure/backup/backup-overview"),
        ],
    },
    "az-204": {
        "compute-solutions": [
            _f("trigger code from HTTP requests", "Azure Functions with HTTP trigger", ("Static blob only", "VPN gateway", "Archive tier"), "Functions scale per invocation.", "Azure Functions", "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview"),
            _f("containerize APIs on managed Kubernetes", "Azure Kubernetes Service", ("Single process on laptop only", "FTP site", "Cool tier"), "AKS runs containerized services.", "AKS", "https://learn.microsoft.com/en-us/azure/aks/intro-kubernetes"),
        ],
        "storage-solutions": [
            _f("upload large blobs with SDK", "Azure Storage Blob SDK", ("Route 53", "Entra B2C only", "VPN SKU"), "SDKs interact with Blob REST APIs.", "Blob SDK", "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python"),
        ],
        "security": [
            _f("access Microsoft 365 data in apps", "Microsoft Graph API", ("SNMP traps", "ICMP only", "FTP"), "Graph is the unified API for Microsoft cloud data.", "Microsoft Graph", "https://learn.microsoft.com/en-us/graph/overview"),
            _f("authenticate apps without secrets in code", "Managed identities", ("Embed passwords in repo", "Shared keys in JS", "Anonymous admin"), "Managed identities use Entra tokens automatically.", "Managed identities", "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview"),
        ],
        "monitor-optimize": [
            _f("trace distributed app requests", "Application Insights", ("Ping only", "No telemetry", "Paper logs"), "App Insights provides APM for Azure apps.", "Application Insights", "https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview"),
        ],
        "connect-consume": [
            _f("decouple microservices with queues", "Azure Service Bus", ("Tight coupling only", "Shared DB table lock", "FTP polling"), "Service Bus provides reliable messaging.", "Service Bus", "https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview"),
            _f("ingest high-volume streaming events", "Azure Event Hubs", ("Email batch", "Daily CSV", "SNMP only"), "Event Hubs ingests millions of events per second.", "Event Hubs", "https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about"),
        ],
    },
    "az-305": {
        "identity-data": [
            _f("design multi-subscription governance", "Azure landing zones", ("Ad-hoc subscriptions", "No logging", "Single admin account"), "Landing zones standardize platform foundations.", "Landing zones", "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/"),
            _f("globally distributed NoSQL", "Azure Cosmos DB", ("Single-server SQLite at scale", "FTP share", "Cool tier only"), "Cosmos DB offers global distribution and SLAs.", "Cosmos DB", "https://learn.microsoft.com/en-us/azure/cosmos-db/introduction"),
        ],
        "data-solutions": [
            _f("managed relational PaaS database", "Azure SQL Database", ("Excel on desktop only", "Local tape", "ICMP"), "Azure SQL is managed SQL Server in Azure.", "Azure SQL Database", "https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview"),
        ],
        "business-continuity": [
            _f("replicate VMs for disaster recovery", "Azure Site Recovery", ("Hope for best", "No RPO", "Manual USB only"), "ASR orchestrates failover and failback.", "Site Recovery", "https://learn.microsoft.com/en-us/azure/site-recovery/site-recovery-overview"),
        ],
        "infrastructure": [
            _f("Layer 7 load balancing for web apps", "Azure Application Gateway", ("DNS CNAME only always", "Single NIC", "Archive tier"), "App Gateway provides WAF and routing.", "Application Gateway", "https://learn.microsoft.com/en-us/azure/application-gateway/overview"),
        ],
    },
    "az-400": {
        "devops-process": [
            _f("manage boards repos pipelines", "Azure DevOps organization", ("Email zip deployments", "Shared prod password", "No CI"), "Azure DevOps covers plan/build/release.", "Azure DevOps", "https://learn.microsoft.com/en-us/azure/devops/user-guide/what-is-azure-devops"),
        ],
        "source-control": [
            _f("branch policies for quality gates", "Azure Repos branch policies", ("Force push to main always", "No reviews", "Delete history"), "Branch policies enforce reviews and builds.", "Branch policies", "https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies"),
        ],
        "ci-cd": [
            _f("build and release pipelines as code", "Azure Pipelines YAML", ("Manual FTP", "Copy binaries email", "Disable tests"), "YAML pipelines version CI/CD definitions.", "Azure Pipelines", "https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/what-is-azure-pipelines"),
        ],
        "dependency-security": [
            _f("secure cloud posture continuously", "Microsoft Defender for Cloud", ("Ignore CVEs", "Disable scanning", "Public storage keys"), "Defender for Cloud assesses workload security.", "Defender for Cloud", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction"),
        ],
        "instrumentation": [
            _f("monitor pipeline runs", "Azure Monitor integration with Pipelines", ("No logs", "Spreadsheet", "Ping only"), "Monitor links pipeline failures to alerts.", "Pipeline monitoring", "https://learn.microsoft.com/en-us/azure/devops/pipelines/integrations/azure-monitor"),
        ],
    },
    "az-500": {
        "identity-access": [
            _f("require MFA based on risk signals", "Entra Conditional Access", ("Password only forever", "Shared break-glass daily", "Anonymous blob write"), "Conditional Access enforces adaptive policies.", "Conditional Access", "https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview"),
        ],
        "platform-security": [
            _f("centralize secrets and keys", "Azure Key Vault", ("Secrets in git", "Env files in blob public", "Email keys"), "Key Vault protects keys, secrets, certificates.", "Key Vault", "https://learn.microsoft.com/en-us/azure/key-vault/general/overview"),
            _f("filter traffic to Azure resources", "Azure Firewall", ("Open 0.0.0.0/0 always", "Disable NSGs", "FTP admin"), "Azure Firewall is managed cloud firewall.", "Azure Firewall", "https://learn.microsoft.com/en-us/azure/firewall/overview"),
        ],
        "security-operations": [
            _f("SIEM for cloud and on-prem signals", "Microsoft Sentinel", ("Notepad logs", "Ignore incidents", "Disable audit"), "Sentinel collects and correlates security events.", "Microsoft Sentinel", "https://learn.microsoft.com/en-us/azure/sentinel/overview"),
        ],
        "security-posture": [
            _f("prioritize remediations from secure score", "Defender for Cloud recommendations", ("Ignore findings", "Disable scanning", "Public RDP"), "Recommendations map to MITRE and best practices.", "Security recommendations", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/implement-security-recommendations"),
        ],
    },
    "sc-900": {
        "security-concepts": [
            _f("verify explicitly in Zero Trust", "Always authenticate and authorize", ("Trust intranet perimeter only", "Shared passwords", "Disable logging"), "Zero Trust assumes breach and verifies every request.", "Zero Trust", "https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview"),
        ],
        "entra": [
            _f("single sign-on for cloud apps", "Microsoft Entra ID", ("Local SAM only", "FTP auth", "SNMP"), "Entra ID provides SSO and identity governance.", "Microsoft Entra ID", "https://learn.microsoft.com/en-us/entra/fundamentals/whatis"),
        ],
        "defender": [
            _f("unified XDR across endpoints and cloud", "Microsoft Defender XDR", ("Antivirus only 1990s", "No telemetry", "Disable updates"), "Defender XDR correlates alerts across workloads.", "Defender XDR", "https://learn.microsoft.com/en-us/microsoft-365/security/defender/microsoft-365-defender"),
        ],
        "compliance": [
            _f("data governance and catalog", "Microsoft Purview", ("Shadow IT spreadsheets", "Public shares", "No classification"), "Purview discovers and governs data estate.", "Microsoft Purview", "https://learn.microsoft.com/en-us/purview/purview"),
        ],
    },
    "dp-900": {
        "data-concepts": [
            _f("structured vs semi-structured data", "Relational tables vs JSON documents", ("Only binary EXE", "ICMP packets", "DNS labels only"), "Data models drive store selection.", "Core data concepts", "https://learn.microsoft.com/en-us/training/modules/explore-core-data-concepts/"),
        ],
        "relational": [
            _f("managed SQL in cloud", "Azure SQL Database", ("Notepad CSV only", "FTP", "Ping"), "Azure SQL offers managed relational service.", "Azure SQL", "https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview"),
        ],
        "nonrelational": [
            _f("globally distributed document DB", "Azure Cosmos DB", ("Single file share only", "Local USB", "SMTP"), "Cosmos supports multiple APIs and consistency levels.", "Cosmos DB", "https://learn.microsoft.com/en-us/azure/cosmos-db/introduction"),
        ],
        "analytics": [
            _f("enterprise analytics at scale", "Azure Synapse Analytics", ("Desktop calc only", "Email reports only", "No lake"), "Synapse unifies warehousing and Spark.", "Synapse Analytics", "https://learn.microsoft.com/en-us/azure/synapse-analytics/overview-what-is"),
        ],
    },
    "ai-900": {
        "ai-workloads": [
            _f("fairness and transparency in ML", "Responsible AI principles", ("Ignore bias", "Black box only", "No documentation"), "Microsoft documents responsible AI practices.", "Responsible AI", "https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai"),
        ],
        "machine-learning": [
            _f("managed ML workspace and pipelines", "Azure Machine Learning", ("Manual Excel regression only", "No versioning", "FTP datasets"), "Azure ML covers training, deployment, monitoring.", "Azure Machine Learning", "https://learn.microsoft.com/en-us/azure/machine-learning/overview-what-is-azure-machine-learning"),
        ],
        "computer-vision": [
            _f("detect objects in images", "Azure AI Vision", ("Ping utility", "SNMP", "DNS only"), "Vision APIs classify and detect objects.", "Azure AI Vision", "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview"),
        ],
        "nlp": [
            _f("use large language models on Azure", "Azure OpenAI Service", ("Telnet to router", "ICMP flood", "Archive tier only"), "Azure OpenAI hosts foundation models with enterprise controls.", "Azure OpenAI", "https://learn.microsoft.com/en-us/azure/ai-services/openai/overview"),
        ],
    },
}

GCP_BANKS: dict[str, dict[str, list[Fact]]] = {
    "cloud-digital-leader": {
        "digital-transformation": [
            _f("explain why organizations adopt cloud", "Elastic scale and innovation velocity", ("Fixed mainframe only forever", "No internet", "Ignore SLAs"), "Cloud enables faster experimentation.", "Why Google Cloud", "https://cloud.google.com/why-google-cloud"),
            _f("describe Google Cloud regions", "Geographically isolated regions with zones", ("Single laptop datacenter", "FTP only", "SNMP hub"), "Regions provide disaster isolation.", "Regions and zones", "https://cloud.google.com/compute/docs/regions-zones"),
            _f("compare CapEx vs OpEx in cloud", "Operational expenditure with usage-based billing", ("Only CapEx", "No invoices", "Free always"), "Cloud shifts spending models.", "Cloud economics", "https://cloud.google.com/docs/overview/cloud-economics"),
            _f("enable digital transformation programs", "Modernize apps and data on cloud foundations", ("Keep legacy only", "No strategy", "Ignore users"), "Transformation uses cloud as enabler.", "Digital transformation", "https://cloud.google.com/transform"),
        ],
        "innovating": [
            _f("analyze petabytes with SQL", "BigQuery serverless warehouse", ("Desktop Excel cluster", "Email CSV only", "Local USB"), "BigQuery separates storage and compute.", "BigQuery", "https://cloud.google.com/bigquery/docs/introduction"),
            _f("build ML models on managed AI platform", "Vertex AI", ("Notepad regression", "No data", "FTP weights"), "Vertex AI unifies ML workflows.", "Vertex AI", "https://cloud.google.com/vertex-ai/docs/start/introduction-unified-platform"),
            _f("stream analytics in real time", "Pub/Sub with Dataflow", ("Batch USB weekly", "Email CSV", "Telnet"), "Streaming enables timely insights.", "Pub/Sub", "https://cloud.google.com/pubsub/docs/overview"),
        ],
        "infrastructure": [
            _f("run VMs on Google infrastructure", "Compute Engine", ("Tape backup only", "Dial-up", "ICMP only"), "GCE provides IaaS VMs.", "Compute Engine", "https://cloud.google.com/compute/docs"),
            _f("run containers on managed Kubernetes", "Google Kubernetes Engine", ("Single VM forever", "No orchestration", "Manual SSH"), "GKE manages Kubernetes.", "GKE", "https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview"),
            _f("serverless request-driven compute", "Cloud Run", ("Always-on VM", "FTP", "Ping"), "Cloud Run runs containers on demand.", "Cloud Run", "https://cloud.google.com/run/docs/overview/what-is-cloud-run"),
        ],
        "security-ops": [
            _f("shared responsibility on Google Cloud", "Google secures infrastructure; customers secure workloads", ("Google patches guest OS always", "No customer IAM", "Disable logging"), "Customers configure identity, data, apps.", "Security", "https://cloud.google.com/security"),
            _f("manage identities and roles", "Cloud IAM", ("Shared root password", "Public admin", "No audit"), "IAM controls who can do what.", "Cloud IAM", "https://cloud.google.com/iam/docs/overview"),
            _f("monitor workloads and SLOs", "Cloud Monitoring", ("No metrics", "Annual check", "Ignore alerts"), "Monitoring supports operations.", "Cloud Monitoring", "https://cloud.google.com/monitoring/docs"),
        ],
    },
    "associate-cloud-engineer": {
        "planning": [
            _f("organize projects and folders", "Resource hierarchy", ("Flat list no IAM", "Shared root password", "Public buckets"), "Hierarchy enables policy inheritance.", "Resource hierarchy", "https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy"),
        ],
        "compute-storage": [
            _f("object storage for applications", "Cloud Storage buckets", ("Block device on laptop", "SMTP relay", "DNS only"), "GCS stores objects with storage classes.", "Cloud Storage", "https://cloud.google.com/storage/docs/introduction"),
            _f("create VMs with startup scripts", "Compute Engine metadata and scripts", ("Manual GUI only policy", "No automation", "Telnet deploy"), "Startup scripts bootstrap instances.", "Compute Engine", "https://cloud.google.com/compute/docs/instances/startup-scripts"),
        ],
        "networking": [
            _f("private networking in GCP", "VPC networks and subnets", ("Public IP only design", "FTP VPN", "ICMP mesh"), "VPCs isolate workloads.", "VPC", "https://cloud.google.com/vpc/docs/vpc"),
            _f("global HTTP(S) load balancing", "Cloud Load Balancing", ("Single server", "Round robin DNS only", "No health checks"), "Google LB distributes traffic globally.", "Load balancing", "https://cloud.google.com/load-balancing/docs/load-balancing-overview"),
        ],
        "security-iam": [
            _f("grant roles to principals", "Cloud IAM bindings", ("ACL 777 on buckets", "Shared admin", "No audit"), "IAM follows least privilege on resources.", "IAM", "https://cloud.google.com/iam/docs/overview"),
        ],
        "operations": [
            _f("run containers without managing nodes", "Cloud Run", ("Bare metal only", "FTP deploy", "On-prem only"), "Cloud Run is serverless containers.", "Cloud Run", "https://cloud.google.com/run/docs/overview/what-is-cloud-run"),
            _f("managed Kubernetes control plane", "Google Kubernetes Engine", ("Manual k8s on laptop only", "No upgrades", "Disable RBAC"), "GKE manages the control plane.", "GKE", "https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview"),
        ],
    },
    "professional-cloud-architect": {
        "design-plan": [
            _f("design reliable systems on GCP", "Follow Google Cloud Architecture Framework", ("Skip monitoring", "Single zone only", "No backups"), "Framework guides design decisions.", "Architecture Framework", "https://cloud.google.com/architecture/framework"),
        ],
        "manage-provision": [
            _f("infrastructure as code on GCP", "Terraform or Deployment Manager", ("ClickOps only", "Email configs", "USB scripts"), "IaC enables repeatable environments.", "Terraform", "https://cloud.google.com/docs/terraform"),
        ],
        "security-compliance": [
            _f("encrypt data with customer-managed keys", "Cloud KMS", ("Plaintext secrets in git", "HTTP only", "Shared keys email"), "KMS manages encryption keys.", "Cloud KMS", "https://cloud.google.com/kms/docs"),
        ],
        "reliability": [
            _f("design for failure domains", "Multi-zone and multi-region patterns", ("Single VM", "No health checks", "Ignore RTO"), "Reliability pillar defines failure handling.", "Reliability", "https://cloud.google.com/architecture/framework/reliability"),
        ],
        "implementation": [
            _f("repeatable deployments", "Cloud Deployment Manager or Terraform", ("Manual only", "No versioning", "Disable rollback"), "Templates version infrastructure.", "Deployment Manager", "https://cloud.google.com/deployment-manager/docs"),
        ],
    },
    "professional-data-engineer": {
        "data-lifecycle": [
            _f("batch and stream with Apache Beam", "Cloud Dataflow", ("Cron on laptop only", "Email CSV", "FTP"), "Dataflow runs Beam pipelines serverlessly.", "Dataflow", "https://cloud.google.com/dataflow/docs/concepts/beam-programming-model"),
        ],
        "ingestion-storage": [
            _f("real-time messaging", "Pub/Sub", ("Polling FTP", "Daily USB", "Telnet"), "Pub/Sub decouples producers and consumers.", "Pub/Sub", "https://cloud.google.com/pubsub/docs/overview"),
            _f("warehouse analytics", "BigQuery", ("Local SQLite warehouse", "Paper reports", "No schema"), "BigQuery scales analytics.", "BigQuery", "https://cloud.google.com/bigquery/docs/introduction"),
        ],
        "analysis-modeling": [
            _f("wide-column low-latency store", "Cloud Bigtable", ("Relational only always", "Notepad", "ICMP"), "Bigtable suits high-throughput NoSQL.", "Bigtable", "https://cloud.google.com/bigtable/docs/overview"),
        ],
        "reliability-ops": [
            _f("govern data lakes", "Dataplex", ("Shadow catalogs", "No lineage", "Public buckets"), "Dataplex manages metadata and quality.", "Dataplex", "https://cloud.google.com/dataplex/docs"),
        ],
    },
    "professional-cloud-security-engineer": {
        "org-governance": [
            _f("restrict resource locations", "Organization policies", ("Allow all regions", "No constraints", "Public admin"), "Org policies enforce guardrails.", "Organization policy", "https://cloud.google.com/resource-manager/docs/organization-policy/overview"),
        ],
        "network-security": [
            _f("DDoS protection at edge", "Cloud Armor", ("Open all ports", "Disable TLS", "ICMP only"), "Cloud Armor filters malicious traffic.", "Cloud Armor", "https://cloud.google.com/armor/docs/cloud-armor-overview"),
            _f("service perimeter for data exfiltration", "VPC Service Controls", ("Public internet egress always", "Shared keys", "No logs"), "VPC SC limits API-based data movement.", "VPC Service Controls", "https://cloud.google.com/vpc-service-controls/docs/overview"),
        ],
        "data-protection": [
            _f("store API keys securely", "Secret Manager", ("Git commit secrets", "Env in public bucket", "Email passwords"), "Secret Manager versions secrets.", "Secret Manager", "https://cloud.google.com/secret-manager/docs/overview"),
        ],
        "operations": [
            _f("centralize security findings", "Security Command Center", ("Ignore CVEs", "Spreadsheet", "No scanning"), "SCC aggregates risk findings.", "Security Command Center", "https://cloud.google.com/security-command-center/docs"),
        ],
    },
    "professional-cloud-devops-engineer": {
        "cicd": [
            _f("build containers in CI", "Cloud Build", ("Manual docker load", "FTP artifacts", "No tests"), "Cloud Build executes build steps.", "Cloud Build", "https://cloud.google.com/build/docs/overview"),
        ],
        "sre": [
            _f("store build artifacts", "Artifact Registry", ("Public FTP", "Email zip", "USB"), "Artifact Registry hosts images and packages.", "Artifact Registry", "https://cloud.google.com/artifact-registry/docs/overview"),
        ],
        "monitoring": [
            _f("SLO-based alerting", "Cloud Monitoring alerting policies", ("Hope users call", "No metrics", "Ping script"), "Monitoring integrates metrics and SLOs.", "Cloud Monitoring", "https://cloud.google.com/monitoring/docs"),
        ],
        "optimization": [
            _f("error budgets and toil reduction", "SRE practices from Google SRE book", ("100% uptime heroics", "Manual only ops", "No postmortems"), "SRE balances reliability and velocity.", "SRE workbook", "https://sre.google/workbook/table-of-contents/"),
        ],
    },
}

AWS_EXTRA_BANKS: dict[str, dict[str, list[Fact]]] = {
    "database-specialty": {
        "workload-design": [
            _f("OLTP with MySQL compatibility on Aurora", "Amazon Aurora", ("Amazon S3 only for OLTP", "Route 53 only", "SNS email"), "Aurora provides high-performance relational storage.", "Amazon Aurora", "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html"),
            _f("key-value single-digit ms latency at scale", "Amazon DynamoDB", ("Amazon EBS for key-value", "FTP", "ICMP"), "DynamoDB is managed NoSQL key-value.", "DynamoDB", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html"),
            _f("graph relationships at scale", "Amazon Neptune", ("Relational star schema only", "Local notepad", "SMTP"), "Neptune supports graph query workloads.", "Neptune", "https://docs.aws.amazon.com/neptune/latest/userguide/intro.html"),
            _f("cache relational read workloads in memory", "Amazon ElastiCache for Redis", ("Store cache in S3 only", "Route 53 health checks only", "SNS fanout"), "ElastiCache reduces database read load.", "ElastiCache", "https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html"),
            _f("time-series IoT telemetry storage", "Amazon Timestream", ("Spreadsheet only", "Email CSV", "ICMP"), "Timestream is purpose-built for time series.", "Amazon Timestream", "https://docs.aws.amazon.com/timestream/latest/developerguide/what-is-timestream.html"),
        ],
        "deployment-migration": [
            _f("migrate databases with minimal downtime", "AWS Database Migration Service", ("Email SQL dump", "USB sneaker net only", "Disable replication"), "DMS supports homogeneous and heterogeneous migration.", "AWS DMS", "https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html"),
            _f("provision Aurora quickly from templates", "RDS Aurora cloning", ("Manual reinstall", "No backups", "Public snapshots"), "Cloning creates copy-on-write databases.", "Aurora cloning", "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Managing.Clone.html"),
            _f("blue/green database upgrades", "Amazon RDS blue/green deployments", ("In-place only always", "No testing", "Delete old"), "Blue/green reduces cutover risk.", "Blue/green deployments", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/blue-green-deployments.html"),
            _f("schema conversion Oracle to PostgreSQL", "AWS Schema Conversion Tool with DMS", ("Manual rewrite only", "Ignore types", "No assessment"), "SCT automates schema conversion.", "AWS SCT", "https://docs.aws.amazon.com/SchemaConversionTool/latest/userguide/CHAP_Welcome.html"),
            _f("ongoing replication for CDC", "DMS ongoing replication tasks", ("Nightly zip only", "FTP", "Disable logs"), "CDC keeps target in sync.", "DMS CDC", "https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html"),
            _f("export/import large datasets to RDS", "RDS snapshot export to S3", ("Email mbox", "Telnet", "Ping flood"), "Snapshot export enables analytics on backups.", "Snapshot export", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ExportSnapshot.html"),
        ],
        "management-operations": [
            _f("automate patching for RDS", "RDS maintenance windows and minor version auto-apply", ("Never patch", "Disable backups", "Root daily"), "Managed maintenance reduces operational toil.", "RDS maintenance", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html"),
            _f("monitor DB performance insights", "Amazon RDS Performance Insights", ("Guesswork only", "Disable metrics", "Ping"), "Performance Insights shows wait events.", "Performance Insights", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html"),
            _f("global read scaling for Aurora", "Aurora global database", ("Single AZ only", "No replicas", "Public write endpoint"), "Global database replicates across regions.", "Aurora global database", "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html"),
            _f("secrets rotation for database credentials", "AWS Secrets Manager with RDS integration", ("Password in code", "Email creds", "Shared admin"), "Secrets Manager rotates credentials safely.", "Secrets Manager", "https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html"),
        ],
        "monitoring-troubleshooting": [
            _f("slow query analysis for Aurora", "Database Insights and Performance Insights", ("No logs", "Telnet", "FTP"), "Insights help find bottlenecks.", "Database Insights", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DatabaseInsights.html"),
            _f("alarms on replica lag", "Amazon CloudWatch metrics for RDS", ("Ignore lag", "Email once a year", "Disable replicas"), "CloudWatch metrics trigger remediation.", "RDS CloudWatch", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html"),
            _f("audit SQL activity on RDS", "Database Activity Streams", ("Disable audit", "Public logs", "No retention"), "Activity Streams capture database audit events.", "Database Activity Streams", "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/DBActivityStreams.html"),
        ],
    },
    "machine-learning-specialty": {
        "data-engineering": [
            _f("prepare ML features at scale", "Amazon SageMaker Data Wrangler", ("Excel only forever", "Manual copy USB", "ICMP"), "Data Wrangler accelerates feature engineering.", "SageMaker Data Wrangler", "https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html"),
            _f("ETL for ML datasets", "AWS Glue", ("Cron on laptop", "Email CSV", "Public FTP"), "Glue provides serverless Spark ETL.", "AWS Glue", "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html"),
            _f("label training data at scale", "Amazon SageMaker Ground Truth", ("Manual sticky notes", "No QA", "Public bucket"), "Ground Truth manages labeling workflows.", "SageMaker Ground Truth", "https://docs.aws.amazon.com/sagemaker/latest/dg/sms.html"),
            _f("store features for reuse", "Amazon SageMaker Feature Store", ("CSV email", "No schema", "Delete versions"), "Feature Store shares consistent features.", "Feature Store", "https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html"),
            _f("ingest streaming data for ML", "Amazon Kinesis Data Firehose to S3", ("FTP batch only", "Telnet", "ICMP"), "Firehose loads streams for training pipelines.", "Kinesis Data Firehose", "https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html"),
        ],
        "eda": [
            _f("managed Jupyter for exploration", "Amazon SageMaker Studio notebooks", ("Notepad only", "No versioning", "Shared prod creds"), "Studio provides collaborative ML IDE.", "SageMaker Studio", "https://docs.aws.amazon.com/sagemaker/latest/dg/studio.html"),
            _f("query data lakes for features", "Amazon Athena", ("Manual USB", "Email zip", "Ping"), "Athena SQL explores S3 data.", "Amazon Athena", "https://docs.aws.amazon.com/athena/latest/ug/what-is.html"),
            _f("visualize dataset bias", "Amazon SageMaker Clarify", ("Ignore segments", "No metrics", "Delete logs"), "Clarify analyzes bias during EDA.", "SageMaker Clarify", "https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-fairness-and-explainability.html"),
            _f("profile large tabular datasets", "SageMaker Data Wrangler insights", ("Eyeball only", "Sample one row", "No stats"), "Profiling guides cleaning steps.", "Data Wrangler", "https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html"),
        ],
        "modeling": [
            _f("train models with built-in algorithms", "Amazon SageMaker built-in algorithms", ("Manual C only", "No evaluation", "Leak test labels"), "Built-ins cover common ML tasks.", "Built-in algorithms", "https://docs.aws.amazon.com/sagemaker/latest/dg/algos.html"),
            _f("hyperparameter tuning jobs", "Amazon SageMaker automatic model tuning", ("Guess parameters", "One manual run", "Disable validation"), "Tuning searches hyperparameter space.", "Model tuning", "https://docs.aws.amazon.com/sagemaker/latest/dg/automatic-model-tuning.html"),
            _f("distributed training on GPU clusters", "SageMaker distributed training", ("Single thread only", "No GPU", "FTP data"), "Distributed jobs scale training.", "Distributed training", "https://docs.aws.amazon.com/sagemaker/latest/dg/distributed-training.html"),
            _f("feature store for training and serving", "Amazon SageMaker Feature Store", ("CSV in email", "No versioning", "Shared prod keys"), "Feature Store shares features across teams.", "Feature Store", "https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html"),
            _f("batch transform for large inference", "SageMaker batch transform", ("Real-time only always", "Manual loop", "No S3"), "Batch transform scores large datasets.", "Batch transform", "https://docs.aws.amazon.com/sagemaker/latest/dg/batch-transform.html"),
        ],
        "ml-operations": [
            _f("deploy real-time inference endpoints", "Amazon SageMaker endpoints", ("Batch only always", "FTP model", "Email weights"), "Endpoints host models for low-latency inference.", "SageMaker endpoints", "https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints.html"),
            _f("detect model drift", "Amazon SageMaker Model Monitor", ("Ignore drift", "No baselines", "Delete logs"), "Model Monitor tracks data and quality drift.", "Model Monitor", "https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html"),
        ],
    },
}

COMPTIA_EXTRA_BANKS: dict[str, dict[str, list[Fact]]] = {
    "comptia-cloud-plus": {
        "cloud-architecture": [
            _f("design highly available cloud workloads", "Multi-region deployment with load balancing", ("Single server", "No backups", "Disable monitoring"), "HA spans failure domains.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("compare IaaS PaaS SaaS", "IaaS provides VMs; PaaS managed runtime; SaaS applications", ("IaaS is only email", "SaaS is cabling", "PaaS is DNS only"), "Models define management responsibility.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("design hybrid connectivity", "VPN or dedicated interconnect to cloud", ("Expose DB to internet", "Telnet admin", "No encryption"), "Hybrid links on-prem to cloud.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
        ],
        "security": [
            _f("apply IAM least privilege in cloud", "Role-based access with regular reviews", ("Shared admin", "Public buckets", "No MFA"), "Least privilege limits blast radius.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("encrypt data at rest in cloud", "Provider-managed encryption and customer keys", ("Plaintext only", "HTTP only", "Email secrets"), "Encryption protects stored data.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("segment workloads in cloud networks", "VPC/VNet subnets and security groups", ("Flat network", "0.0.0.0/0 admin", "Telnet"), "Segmentation limits lateral movement.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("scan images for vulnerabilities", "Pipeline scanning before deploy", ("Deploy :latest only", "Ignore CVEs", "Disable updates"), "Image scanning catches known issues.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("manage API keys securely", "Secrets vault with rotation", ("Commit keys to git", "Email keys", "Paste in chat"), "Secrets management reduces exposure.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
        ],
        "deployment": [
            _f("automate infrastructure provisioning", "Infrastructure as code templates", ("Manual clicks only", "USB scripts", "No versioning"), "IaC enables repeatable environments.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("use CI/CD for cloud releases", "Pipeline with tests and approvals", ("FTP to prod", "Skip QA", "Shared password"), "CI/CD reduces deployment risk.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("use immutable infrastructure patterns", "Replace servers instead of patching in place", ("Manual SSH drift", "Snowflake servers", "No rollback"), "Immutable infra improves consistency.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("validate templates before apply", "Policy checks in CI", ("Apply prod first", "No lint", "Skip peer review"), "Policy gates catch misconfigurations.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("blue/green or canary releases", "Gradual traffic shift", ("Big bang only", "No monitoring", "Ignore errors"), "Progressive delivery limits blast radius.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
        ],
        "operations": [
            _f("right-size resources for cost", "Monitoring utilization and scaling policies", ("Always max SKU", "Ignore metrics", "Delete logs"), "FinOps uses data to optimize spend.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("restore service after outage", "Runbooks and tested backups", ("Hope for best", "No RTO", "Ignore paging"), "Operations includes recovery procedures.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
            _f("monitor SLA and SLO metrics", "Dashboards with alerting on error budgets", ("No metrics", "Annual manual check", "Disable paging"), "SLOs guide operational focus.", "Cloud+ objectives", "https://www.comptia.org/en-us/certifications/cloud"),
        ],
    },
    "comptia-data-plus": {
        "data-concepts": [
            _f("distinguish structured and unstructured data", "Tables vs documents/media", ("Only ICMP", "DNS only", "Cable types"), "Data type drives tooling.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("describe data life cycle stages", "Collection, processing, analysis, storage, sharing", ("Only delete", "No catalog", "Random USB"), "Life cycle informs controls.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("compare relational and dimensional models", "Star/snowflake schemas for analytics", ("Only flat files", "No keys", "Random CSV"), "Models affect query performance.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
        ],
        "mining-analytics": [
            _f("visualize trends for stakeholders", "Dashboards with clear metrics", ("Raw tables only", "Hide outliers always", "No labels"), "Visualization communicates insights.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("apply basic statistics to samples", "Mean, median, variance with context", ("Cherry-pick only", "Ignore sample size", "No units"), "Statistics support decisions.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("handle missing and dirty data", "Profiling, imputation, and validation rules", ("Ignore nulls", "Drop all rows", "No documentation"), "Data quality affects analysis.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("find correlations between metrics", "Scatter plots and coefficient review", ("Guess causation", "Single metric only", "No baseline"), "Correlation guides hypotheses.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("summarize datasets with aggregates", "GROUP BY with clear grain definitions", ("Mix grains randomly", "Duplicate rows", "No keys"), "Aggregates must match business grain.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("communicate analytical limitations", "Document assumptions and sample bias", ("Hide caveats", "Overclaim accuracy", "No peer review"), "Transparency builds trust.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("select chart types appropriately", "Bar vs line vs histogram by data type", ("Pie chart for everything", "3D clutter", "No axis labels"), "Chart choice affects interpretation.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
        ],
        "governance": [
            _f("protect sensitive columns", "Masking and access controls", ("Email CSV of PII", "Public share", "No retention policy"), "Governance reduces data risk.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("document data lineage", "Catalog showing sources and transforms", ("Shadow spreadsheets", "No owners", "Delete metadata"), "Lineage supports audits.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("define data retention schedules", "Policy-based retention and deletion", ("Keep forever", "No legal review", "Public archives"), "Retention limits risk and cost.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("assign data stewards", "Named owners per dataset", ("Everyone owns nothing", "No RACI", "Ignore quality"), "Stewards accountability improves quality.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("measure data quality dimensions", "Accuracy, completeness, timeliness metrics", ("No metrics", "Guess quality", "Ignore duplicates"), "Quality metrics guide remediation.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("classify data by sensitivity", "Labels such as public, internal, confidential", ("One label for all", "No training", "Share externally"), "Classification drives controls.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
            _f("apply role-based access to datasets", "Least privilege for analysts and engineers", ("Shared admin", "Public buckets", "No reviews"), "RBAC limits exposure.", "Data+ objectives", "https://www.comptia.org/en-us/certifications/data"),
        ],
    },
    "comptia-pentest-plus": {
        "planning-scoping": [
            _f("define rules of engagement", "Written scope, RoE, and emergency contacts", ("Test prod without approval", "No logging", "Share exploits publicly"), "Rules protect legal and operational boundaries.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("obtain written authorization", "Signed scope before active testing", ("Assume implied OK", "Test any IP", "No stop conditions"), "Authorization prevents legal issues.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
        ],
        "attacks-exploits": [
            _f("validate SQL injection risk", "Parameterized queries and input validation", ("Concatenate SQL strings", "Disable WAF always", "Use admin in URL"), "Parameterization mitigates SQLi.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("test for weak password policies", "Password spraying with lockout awareness", ("Brute force prod forever", "No logging", "Disable MFA globally"), "Testing reveals auth weaknesses.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("enumerate external attack surface", "OSINT and scoped port discovery", ("Scan entire internet", "No scope", "Ignore opt-out"), "Enumeration informs prioritization.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("exploit misconfigured cloud storage", "Verify bucket/blob ACLs and policies", ("Assume private", "No evidence", "Publish findings early"), "Misconfigurations are common findings.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("test wireless segmentation", "Validate guest vs corporate isolation", ("Share PSK company-wide", "Open SSID", "No monitoring"), "Wireless tests find isolation gaps.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("use credential stuffing responsibly", "Test with approved wordlists and limits", ("Lock out all users", "No scope", "Live prod creds"), "Controlled testing validates auth controls.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("identify XSS in web apps", "Test reflected and stored XSS with safe payloads", ("Ignore input fields", "Disable CSP always", "Test prod users"), "XSS can steal sessions or deface apps.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("test for insecure deserialization", "Review parsers and object injection points", ("Trust all serialized blobs", "Disable logging", "Public admin API"), "Unsafe deserialization enables RCE.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("perform privilege escalation checks", "Validate local and domain privilege boundaries", ("Assume least privilege works", "No enumeration", "Single test user"), "Escalation paths are high impact.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("assess default credentials on appliances", "Check vendor default accounts are changed", ("Assume changed", "No scan", "Ignore IoT"), "Defaults are common in appliances.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("test LDAP injection paths", "Validate input sanitization on directory queries", ("Concatenate filters", "Disable auth", "Anonymous bind prod"), "LDAPi can bypass authentication.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
        ],
        "reporting": [
            _f("communicate findings to leadership", "Executive summary with risk rating", ("Raw tool output only", "No remediation", "Ignore business impact"), "Reports drive remediation priorities.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
            _f("map findings to remediation owners", "Clear owners and timelines", ("Vague fix later", "No severity", "Hide evidence"), "Actionable reports enable fixes.", "PenTest+ objectives", "https://www.comptia.org/en-us/certifications/pentest"),
        ],
    },
}
# fmt: on
