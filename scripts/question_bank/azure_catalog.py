"""Microsoft Azure certification exams aligned to official exam study guides (practice items only)."""
from __future__ import annotations

from typing import Any

AZURE_VENDOR = "azure"

FUNDAMENTALS_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 55,
    "timeLimitMinutes": 65,
    "passingScore": 700,
    "maxScore": 1000,
    "selectionMode": "weighted-random",
}

ASSOCIATE_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 55,
    "timeLimitMinutes": 120,
    "passingScore": 700,
    "maxScore": 1000,
    "selectionMode": "weighted-random",
}

EXPERT_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 55,
    "timeLimitMinutes": 120,
    "passingScore": 700,
    "maxScore": 1000,
    "selectionMode": "weighted-random",
}


def domain(
    did: str,
    name: str,
    weight: int,
    resources: list[tuple[str, str]],
) -> dict[str, Any]:
    return {
        "id": did,
        "name": name,
        "weight": weight,
        "resources": [{"title": t, "url": u} for t, u in resources],
    }


AZURE_EXAMS: list[dict[str, Any]] = [
    {
        "id": "az-900",
        "name": "Microsoft Azure Fundamentals",
        "code": "AZ-900",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": FUNDAMENTALS_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
        "domains": [
            domain("cloud-concepts", "Describe cloud concepts", 25, [
                ("AZ-900 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900"),
                ("Benefits of cloud computing", "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/fundamental-concepts"),
            ]),
            domain("azure-architecture", "Describe Azure architecture and services", 35, [
                ("Azure compute options", "https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/compute-decision-tree"),
                ("Azure storage services", "https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction"),
            ]),
            domain("azure-management", "Describe Azure management and governance", 30, [
                ("Microsoft Entra ID", "https://learn.microsoft.com/en-us/entra/fundamentals/whatis"),
                ("Azure Resource Manager", "https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview"),
            ]),
        ],
    },
    {
        "id": "az-104",
        "name": "Microsoft Azure Administrator",
        "code": "AZ-104",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
        "domains": [
            domain("identity-governance", "Manage Azure identities and governance", 20, [
                ("AZ-104 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104"),
                ("Role-based access control", "https://learn.microsoft.com/en-us/azure/role-based-access-control/overview"),
            ]),
            domain("storage", "Implement and manage storage", 20, [
                ("Azure Blob Storage", "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-overview"),
                ("Azure Files", "https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction"),
            ]),
            domain("compute", "Deploy and manage Azure compute resources", 25, [
                ("Azure Virtual Machines", "https://learn.microsoft.com/en-us/azure/virtual-machines/overview"),
                ("Azure App Service", "https://learn.microsoft.com/en-us/azure/app-service/overview"),
            ]),
            domain("networking", "Implement and manage virtual networking", 20, [
                ("Azure Virtual Network", "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview"),
                ("Azure VPN Gateway", "https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways"),
            ]),
            domain("monitor-backup", "Monitor and maintain Azure resources", 15, [
                ("Azure Monitor", "https://learn.microsoft.com/en-us/azure/azure-monitor/overview"),
                ("Azure Backup", "https://learn.microsoft.com/en-us/azure/backup/backup-overview"),
            ]),
        ],
    },
    {
        "id": "az-204",
        "name": "Microsoft Azure Developer Associate",
        "code": "AZ-204",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/",
        "domains": [
            domain("compute-solutions", "Develop Azure compute solutions", 25, [
                ("AZ-204 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-204"),
                ("Azure Functions", "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview"),
            ]),
            domain("storage-solutions", "Develop for Azure storage", 15, [
                ("Blob storage SDK", "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python"),
            ]),
            domain("security", "Implement Azure security", 20, [
                ("Microsoft Graph", "https://learn.microsoft.com/en-us/graph/overview"),
                ("Managed identities", "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview"),
            ]),
            domain("monitor-optimize", "Monitor, troubleshoot, and optimize", 15, [
                ("Application Insights", "https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview"),
            ]),
            domain("connect-consume", "Connect to and consume Azure services", 25, [
                ("Azure Service Bus", "https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview"),
                ("Azure Event Hubs", "https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about"),
            ]),
        ],
    },
    {
        "id": "az-305",
        "name": "Microsoft Azure Solutions Architect Expert",
        "code": "AZ-305",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": EXPERT_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/",
        "domains": [
            domain("identity-data", "Design identity, governance, and monitoring", 25, [
                ("AZ-305 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305"),
                ("Azure landing zones", "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/"),
            ]),
            domain("data-solutions", "Design data solutions", 25, [
                ("Azure SQL Database", "https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview"),
                ("Azure Cosmos DB", "https://learn.microsoft.com/en-us/azure/cosmos-db/introduction"),
            ]),
            domain("business-continuity", "Design business continuity solutions", 10, [
                ("Azure Site Recovery", "https://learn.microsoft.com/en-us/azure/site-recovery/site-recovery-overview"),
            ]),
            domain("infrastructure", "Design infrastructure solutions", 40, [
                ("Azure Kubernetes Service", "https://learn.microsoft.com/en-us/azure/aks/intro-kubernetes"),
                ("Azure Application Gateway", "https://learn.microsoft.com/en-us/azure/application-gateway/overview"),
            ]),
        ],
    },
    {
        "id": "az-400",
        "name": "Microsoft Azure DevOps Engineer Expert",
        "code": "AZ-400",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": EXPERT_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/devops-engineer/",
        "domains": [
            domain("devops-process", "Design and implement DevOps processes", 20, [
                ("AZ-400 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-400"),
                ("Azure DevOps", "https://learn.microsoft.com/en-us/azure/devops/user-guide/what-is-azure-devops"),
            ]),
            domain("source-control", "Implement source control", 15, [
                ("Git workflows", "https://learn.microsoft.com/en-us/azure/devops/repos/git/gitworkflow"),
            ]),
            domain("ci-cd", "Design and implement build and release pipelines", 40, [
                ("Azure Pipelines", "https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/what-is-azure-pipelines"),
            ]),
            domain("dependency-security", "Develop security and compliance plan", 10, [
                ("Microsoft Defender for Cloud", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction"),
            ]),
            domain("instrumentation", "Implement instrumentation strategy", 15, [
                ("Monitor Azure Pipelines", "https://learn.microsoft.com/en-us/azure/devops/pipelines/integrations/azure-monitor"),
            ]),
        ],
    },
    {
        "id": "az-500",
        "name": "Microsoft Azure Security Engineer Associate",
        "code": "AZ-500",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/",
        "domains": [
            domain("identity-access", "Secure identity and access", 25, [
                ("AZ-500 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-500"),
                ("Conditional Access", "https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview"),
            ]),
            domain("platform-security", "Secure networking, compute, and storage", 30, [
                ("Azure Firewall", "https://learn.microsoft.com/en-us/azure/firewall/overview"),
                ("Azure Key Vault", "https://learn.microsoft.com/en-us/azure/key-vault/general/overview"),
            ]),
            domain("security-operations", "Secure operations", 25, [
                ("Microsoft Sentinel", "https://learn.microsoft.com/en-us/azure/sentinel/overview"),
            ]),
            domain("security-posture", "Secure data and applications", 20, [
                ("Defender for Cloud recommendations", "https://learn.microsoft.com/en-us/azure/defender-for-cloud/implement-security-recommendations"),
            ]),
        ],
    },
    {
        "id": "sc-900",
        "name": "Microsoft Security, Compliance, and Identity Fundamentals",
        "code": "SC-900",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": FUNDAMENTALS_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/",
        "domains": [
            domain("security-concepts", "Describe security, compliance concepts", 25, [
                ("SC-900 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900"),
                ("Zero Trust", "https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview"),
            ]),
            domain("entra", "Describe Microsoft Entra capabilities", 30, [
                ("Microsoft Entra ID", "https://learn.microsoft.com/en-us/entra/fundamentals/whatis"),
            ]),
            domain("defender", "Describe Microsoft security solutions", 35, [
                ("Microsoft Defender XDR", "https://learn.microsoft.com/en-us/microsoft-365/security/defender/microsoft-365-defender"),
            ]),
            domain("compliance", "Describe compliance capabilities", 10, [
                ("Microsoft Purview", "https://learn.microsoft.com/en-us/purview/purview"),
            ]),
        ],
    },
    {
        "id": "dp-900",
        "name": "Microsoft Azure Data Fundamentals",
        "code": "DP-900",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": FUNDAMENTALS_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/",
        "domains": [
            domain("data-concepts", "Describe core data concepts", 25, [
                ("DP-900 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-900"),
                ("Types of data", "https://learn.microsoft.com/en-us/training/modules/explore-core-data-concepts/"),
            ]),
            domain("relational", "Describe relational data workloads", 25, [
                ("Azure SQL", "https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview"),
            ]),
            domain("nonrelational", "Describe non-relational data workloads", 25, [
                ("Azure Cosmos DB", "https://learn.microsoft.com/en-us/azure/cosmos-db/introduction"),
            ]),
            domain("analytics", "Describe analytics workloads", 25, [
                ("Azure Synapse Analytics", "https://learn.microsoft.com/en-us/azure/synapse-analytics/overview-what-is"),
            ]),
        ],
    },
    {
        "id": "ai-900",
        "name": "Microsoft Azure AI Fundamentals",
        "code": "AI-900",
        "vendor": AZURE_VENDOR,
        "min_questions": 58,
        "exam": FUNDAMENTALS_EXAM,
        "guide_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        "domains": [
            domain("ai-workloads", "Describe AI workloads and considerations", 30, [
                ("AI-900 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-900"),
                ("Responsible AI", "https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai"),
            ]),
            domain("machine-learning", "Describe fundamental ML principles", 30, [
                ("Azure Machine Learning", "https://learn.microsoft.com/en-us/azure/machine-learning/overview-what-is-azure-machine-learning"),
            ]),
            domain("computer-vision", "Describe computer vision workloads", 20, [
                ("Azure AI Vision", "https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview"),
            ]),
            domain("nlp", "Describe natural language processing workloads", 20, [
                ("Azure OpenAI", "https://learn.microsoft.com/en-us/azure/ai-services/openai/overview"),
            ]),
        ],
    },
]

AZURE_BY_ID = {e["id"]: e for e in AZURE_EXAMS}
