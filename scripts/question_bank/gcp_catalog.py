"""Google Cloud certification exams aligned to official exam guides (practice items only)."""
from __future__ import annotations

from typing import Any

GOOGLE_VENDOR = "google"

FOUNDATIONAL_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 55,
    "timeLimitMinutes": 90,
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

PROFESSIONAL_EXAM = {
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


GCP_EXAMS: list[dict[str, Any]] = [
    {
        "id": "cloud-digital-leader",
        "name": "Google Cloud Digital Leader",
        "code": "CDL",
        "vendor": GOOGLE_VENDOR,
        "min_questions": 58,
        "exam": FOUNDATIONAL_EXAM,
        "guide_url": "https://cloud.google.com/learn/certification/cloud-digital-leader",
        "domains": [
            domain("digital-transformation", "Digital transformation with Google Cloud", 30, [
                ("Cloud Digital Leader guide", "https://cloud.google.com/learn/certification/guides/cloud-digital-leader"),
                ("Why Google Cloud", "https://cloud.google.com/why-google-cloud"),
            ]),
            domain("innovating", "Innovating with data and Google Cloud", 30, [
                ("BigQuery overview", "https://cloud.google.com/bigquery/docs/introduction"),
            ]),
            domain("infrastructure", "Infrastructure and application modernization", 25, [
                ("Compute Engine", "https://cloud.google.com/compute/docs"),
            ]),
            domain("security-ops", "Understanding Google Cloud security and operations", 15, [
                ("Security overview", "https://cloud.google.com/security"),
            ]),
        ],
    },
    {
        "id": "associate-cloud-engineer",
        "name": "Google Associate Cloud Engineer",
        "code": "ACE",
        "vendor": GOOGLE_VENDOR,
        "min_questions": 58,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://cloud.google.com/learn/certification/cloud-engineer",
        "domains": [
            domain("planning", "Setting up a cloud solution environment", 15, [
                ("ACE exam guide", "https://cloud.google.com/learn/certification/guides/cloud-engineer"),
                ("Resource hierarchy", "https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy"),
            ]),
            domain("compute-storage", "Planning and configuring compute and storage", 25, [
                ("Compute Engine", "https://cloud.google.com/compute/docs"),
                ("Cloud Storage", "https://cloud.google.com/storage/docs/introduction"),
            ]),
            domain("networking", "Planning and configuring cloud network solutions", 20, [
                ("VPC networks", "https://cloud.google.com/vpc/docs/vpc"),
                ("Cloud Load Balancing", "https://cloud.google.com/load-balancing/docs/load-balancing-overview"),
            ]),
            domain("security-iam", "Configuring access and security", 20, [
                ("IAM overview", "https://cloud.google.com/iam/docs/overview"),
            ]),
            domain("operations", "Deploying and implementing solutions", 20, [
                ("Cloud Run", "https://cloud.google.com/run/docs/overview/what-is-cloud-run"),
                ("GKE", "https://cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview"),
            ]),
        ],
    },
    {
        "id": "professional-cloud-architect",
        "name": "Google Professional Cloud Architect",
        "code": "PCA",
        "vendor": GOOGLE_VENDOR,
        "min_questions": 58,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://cloud.google.com/learn/certification/cloud-architect",
        "domains": [
            domain("design-plan", "Designing and planning a cloud solution architecture", 30, [
                ("PCA exam guide", "https://cloud.google.com/learn/certification/guides/cloud-architect"),
                ("Architecture Framework", "https://cloud.google.com/architecture/framework"),
            ]),
            domain("manage-provision", "Managing and provisioning a solution infrastructure", 20, [
                ("Terraform on Google Cloud", "https://cloud.google.com/docs/terraform"),
            ]),
            domain("security-compliance", "Designing for security and compliance", 20, [
                ("Security foundations", "https://cloud.google.com/architecture/framework/security"),
            ]),
            domain("reliability", "Analyzing and optimizing technology and business processes", 15, [
                ("Reliability pillar", "https://cloud.google.com/architecture/framework/reliability"),
            ]),
            domain("implementation", "Managing implementation", 15, [
                ("Deployment Manager", "https://cloud.google.com/deployment-manager/docs"),
            ]),
        ],
    },
    {
        "id": "professional-data-engineer",
        "name": "Google Professional Data Engineer",
        "code": "PDE",
        "vendor": GOOGLE_VENDOR,
        "min_questions": 58,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://cloud.google.com/learn/certification/data-engineer",
        "domains": [
            domain("data-lifecycle", "Designing data processing systems", 30, [
                ("PDE exam guide", "https://cloud.google.com/learn/certification/guides/data-engineer"),
                ("Dataflow", "https://cloud.google.com/dataflow/docs/concepts/beam-programming-model"),
            ]),
            domain("ingestion-storage", "Ingesting and processing data", 25, [
                ("Pub/Sub", "https://cloud.google.com/pubsub/docs/overview"),
                ("BigQuery", "https://cloud.google.com/bigquery/docs/introduction"),
            ]),
            domain("analysis-modeling", "Storing and analyzing data", 25, [
                ("Bigtable", "https://cloud.google.com/bigtable/docs/overview"),
            ]),
            domain("reliability-ops", "Reliability, policies, and processes", 20, [
                ("Dataplex", "https://cloud.google.com/dataplex/docs"),
            ]),
        ],
    },
    {
        "id": "professional-cloud-security-engineer",
        "name": "Google Professional Cloud Security Engineer",
        "code": "PCSE",
        "vendor": GOOGLE_VENDOR,
        "min_questions": 58,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://cloud.google.com/learn/certification/cloud-security-engineer",
        "domains": [
            domain("org-governance", "Configuring access within a cloud solution environment", 25, [
                ("PCSE exam guide", "https://cloud.google.com/learn/certification/guides/cloud-security-engineer"),
                ("Organization policy", "https://cloud.google.com/resource-manager/docs/organization-policy/overview"),
            ]),
            domain("network-security", "Configuring network security", 25, [
                ("Cloud Armor", "https://cloud.google.com/armor/docs/cloud-armor-overview"),
                ("VPC Service Controls", "https://cloud.google.com/vpc-service-controls/docs/overview"),
            ]),
            domain("data-protection", "Ensuring data protection", 25, [
                ("Cloud KMS", "https://cloud.google.com/kms/docs"),
                ("Secret Manager", "https://cloud.google.com/secret-manager/docs/overview"),
            ]),
            domain("operations", "Managing operations in a cloud solution environment", 25, [
                ("Security Command Center", "https://cloud.google.com/security-command-center/docs"),
            ]),
        ],
    },
    {
        "id": "professional-cloud-devops-engineer",
        "name": "Google Professional Cloud DevOps Engineer",
        "code": "PCDO",
        "vendor": GOOGLE_VENDOR,
        "min_questions": 58,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://cloud.google.com/learn/certification/cloud-devops-engineer",
        "domains": [
            domain("cicd", "Bootstrapping a Google Cloud organization for DevOps", 20, [
                ("PCDO exam guide", "https://cloud.google.com/learn/certification/guides/cloud-devops-engineer"),
                ("Cloud Build", "https://cloud.google.com/build/docs/overview"),
            ]),
            domain("sre", "Building and implementing CI/CD pipelines", 30, [
                ("Artifact Registry", "https://cloud.google.com/artifact-registry/docs/overview"),
            ]),
            domain("monitoring", "Implementing service monitoring strategies", 25, [
                ("Cloud Monitoring", "https://cloud.google.com/monitoring/docs"),
            ]),
            domain("optimization", "Optimizing service performance and cost", 25, [
                ("SRE workbook", "https://sre.google/workbook/table-of-contents/"),
            ]),
        ],
    },
]

GCP_BY_ID = {e["id"]: e for e in GCP_EXAMS}
