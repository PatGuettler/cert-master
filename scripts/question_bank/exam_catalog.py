"""AWS certification exam metadata aligned to official exam guide domain weights."""
from __future__ import annotations

from typing import Any

ASSOCIATE_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 50,
    "timeLimitMinutes": 130,
    "passingScore": 720,
    "maxScore": 1000,
    "selectionMode": "weighted-random",
}

PROFESSIONAL_EXAM = {
    "totalQuestions": 75,
    "scoredQuestions": 60,
    "timeLimitMinutes": 180,
    "passingScore": 750,
    "maxScore": 1000,
    "selectionMode": "weighted-random",
}

SPECIALTY_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 50,
    "timeLimitMinutes": 180,
    "passingScore": 750,
    "maxScore": 1000,
    "selectionMode": "weighted-random",
}

FOUNDATIONAL_EXAM = {
    "totalQuestions": 65,
    "scoredQuestions": 50,
    "timeLimitMinutes": 90,
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


EXAMS: list[dict[str, Any]] = [
    {
        "id": "ai-practitioner",
        "name": "AWS Certified AI Practitioner",
        "code": "AIF-C01",
        "min_questions": 70,
        "exam": FOUNDATIONAL_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-ai-practitioner/AWS-Certified-AI-Practitioner_Exam-Guide.pdf",
        "domains": [
            domain(
                "ai-ml-fundamentals",
                "Domain 1: Fundamentals of AI and ML",
                20,
                [
                    ("AIF-C01 Exam Guide", "https://aws.amazon.com/certification/certified-ai-practitioner/"),
                    ("Amazon SageMaker", "https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html"),
                    ("AWS Machine Learning", "https://aws.amazon.com/machine-learning/"),
                ],
            ),
            domain(
                "generative-ai-fundamentals",
                "Domain 2: Fundamentals of Generative AI",
                24,
                [
                    ("Amazon Bedrock", "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"),
                    ("Generative AI on AWS", "https://aws.amazon.com/generative-ai/"),
                ],
            ),
            domain(
                "foundation-model-applications",
                "Domain 3: Applications of Foundation Models",
                28,
                [
                    ("Amazon Bedrock Agents", "https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html"),
                    ("Knowledge Bases for Amazon Bedrock", "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html"),
                ],
            ),
            domain(
                "responsible-ai",
                "Domain 4: Guidelines for Responsible AI",
                14,
                [
                    ("Responsible AI", "https://aws.amazon.com/machine-learning/responsible-ai/"),
                    ("Amazon SageMaker Clarify", "https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-fairness-and-explainability.html"),
                ],
            ),
            domain(
                "ai-security-governance",
                "Domain 5: Security, Compliance, and Governance for AI Solutions",
                14,
                [
                    ("AWS IAM", "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html"),
                    ("Amazon Macie", "https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html"),
                ],
            ),
        ],
    },
    {
        "id": "solutions-architect-associate",
        "name": "AWS Certified Solutions Architect – Associate",
        "code": "SAA-C03",
        "min_questions": 70,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf",
        "domains": [
            domain(
                "resilient-architectures",
                "Domain 1: Design Resilient Architectures",
                30,
                [
                    ("SAA-C03 Exam Guide", "https://aws.amazon.com/certification/certified-solutions-architect-associate/"),
                    ("Reliability pillar", "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html"),
                    ("Amazon Route 53", "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html"),
                ],
            ),
            domain(
                "high-performing-architectures",
                "Domain 2: Design High-Performing Architectures",
                28,
                [
                    ("Performance Efficiency pillar", "https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html"),
                    ("Amazon CloudFront", "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html"),
                ],
            ),
            domain(
                "secure-architectures",
                "Domain 3: Design Secure Architectures",
                24,
                [
                    ("Security pillar", "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"),
                    ("AWS KMS", "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html"),
                ],
            ),
            domain(
                "cost-optimized-architectures",
                "Domain 4: Design Cost-Optimized Architectures",
                18,
                [
                    ("Cost Optimization pillar", "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html"),
                    ("AWS Cost Explorer", "https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html"),
                ],
            ),
        ],
    },
    {
        "id": "developer-associate",
        "name": "AWS Certified Developer – Associate",
        "code": "DVA-C02",
        "min_questions": 70,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-dev-associate/AWS-Certified-Developer-Associate_Exam-Guide.pdf",
        "domains": [
            domain(
                "development-services",
                "Domain 1: Development with AWS Services",
                32,
                [
                    ("DVA-C02 Exam Guide", "https://aws.amazon.com/certification/certified-developer-associate/"),
                    ("AWS Lambda", "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"),
                    ("Amazon API Gateway", "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html"),
                ],
            ),
            domain(
                "security",
                "Domain 2: Security",
                26,
                [
                    ("IAM best practices", "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"),
                    ("AWS Secrets Manager", "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html"),
                ],
            ),
            domain(
                "deployment",
                "Domain 3: Deployment",
                24,
                [
                    ("AWS CodePipeline", "https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html"),
                    ("AWS CloudFormation", "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html"),
                ],
            ),
            domain(
                "troubleshooting-optimization",
                "Domain 4: Troubleshooting and Optimization",
                18,
                [
                    ("Amazon CloudWatch", "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html"),
                    ("AWS X-Ray", "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html"),
                ],
            ),
        ],
    },
    {
        "id": "machine-learning-engineer-associate",
        "name": "AWS Certified Machine Learning Engineer – Associate",
        "code": "MLA-C01",
        "min_questions": 70,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/",
        "domains": [
            domain(
                "data-preparation",
                "Domain 1: Data Preparation for Machine Learning",
                28,
                [
                    ("Amazon SageMaker Data Wrangler", "https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html"),
                    ("AWS Glue", "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html"),
                ],
            ),
            domain(
                "model-development",
                "Domain 2: ML Model Development",
                26,
                [
                    ("Amazon SageMaker training", "https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html"),
                    ("SageMaker Model Registry", "https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html"),
                ],
            ),
            domain(
                "deployment-orchestration",
                "Domain 3: Deployment and Orchestration of ML Workflows",
                24,
                [
                    ("SageMaker endpoints", "https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints.html"),
                    ("Amazon SageMaker Pipelines", "https://docs.aws.amazon.com/sagemaker/latest/dg/pipelines.html"),
                ],
            ),
            domain(
                "monitoring-security",
                "Domain 4: ML Solution Monitoring, Maintenance, and Security",
                22,
                [
                    ("SageMaker Model Monitor", "https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html"),
                    ("Amazon SageMaker Clarify", "https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-fairness-and-explainability.html"),
                ],
            ),
        ],
    },
    {
        "id": "data-engineer-associate",
        "name": "AWS Certified Data Engineer – Associate",
        "code": "DEA-C01",
        "min_questions": 70,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://aws.amazon.com/certification/certified-data-engineer-associate/",
        "domains": [
            domain(
                "ingestion-transformation",
                "Domain 1: Data Ingestion and Transformation",
                34,
                [
                    ("AWS Glue", "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html"),
                    ("Amazon Kinesis Data Streams", "https://docs.aws.amazon.com/streams/latest/dev/introduction.html"),
                ],
            ),
            domain(
                "data-store-management",
                "Domain 2: Data Store Management",
                26,
                [
                    ("Amazon Redshift", "https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html"),
                    ("Amazon S3", "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html"),
                ],
            ),
            domain(
                "data-operations",
                "Domain 3: Data Operations and Support",
                22,
                [
                    ("Amazon EMR", "https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html"),
                    ("AWS Lake Formation", "https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html"),
                ],
            ),
            domain(
                "data-security-governance",
                "Domain 4: Data Security and Governance",
                18,
                [
                    ("AWS Lake Formation permissions", "https://docs.aws.amazon.com/lake-formation/latest/dg/access-control-overview.html"),
                    ("Amazon Macie", "https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html"),
                ],
            ),
        ],
    },
    {
        "id": "cloudops-engineer-associate",
        "name": "AWS Certified CloudOps Engineer – Associate",
        "code": "SOA-C02",
        "min_questions": 70,
        "exam": ASSOCIATE_EXAM,
        "guide_url": "https://aws.amazon.com/certification/certified-cloudops-engineer-associate/",
        "domains": [
            domain(
                "monitoring-logging",
                "Domain 1: Monitoring, Logging, Analysis, Remediation, and Performance Optimization",
                22,
                [
                    ("Amazon CloudWatch", "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html"),
                    ("AWS Systems Manager", "https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html"),
                ],
            ),
            domain(
                "reliability-continuity",
                "Domain 2: Reliability and Business Continuity",
                22,
                [
                    ("AWS Backup", "https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html"),
                    ("Elastic Disaster Recovery", "https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html"),
                ],
            ),
            domain(
                "deployment-automation",
                "Domain 3: Deployment, Provisioning, and Automation",
                22,
                [
                    ("AWS CloudFormation", "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html"),
                    ("Systems Manager State Manager", "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state.html"),
                ],
            ),
            domain(
                "security-compliance",
                "Domain 4: Security and Compliance",
                16,
                [
                    ("AWS Config", "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html"),
                    ("Amazon Inspector", "https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html"),
                ],
            ),
            domain(
                "networking-content",
                "Domain 5: Networking and Content Delivery",
                18,
                [
                    ("Amazon VPC", "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html"),
                    ("Elastic Load Balancing", "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html"),
                ],
            ),
        ],
    },
    {
        "id": "solutions-architect-professional",
        "name": "AWS Certified Solutions Architect – Professional",
        "code": "SAP-C02",
        "min_questions": 75,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-sa-pro/AWS-Certified-Solutions-Architect-Professional_Exam-Guide.pdf",
        "domains": [
            domain(
                "organizational-complexity",
                "Domain 1: Design Solutions for Organizational Complexity",
                26,
                [
                    ("SAP-C02 Exam Guide", "https://aws.amazon.com/certification/certified-solutions-architect-professional/"),
                    ("AWS Organizations", "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html"),
                ],
            ),
            domain(
                "new-solutions",
                "Domain 2: Design for New Solutions",
                29,
                [
                    ("AWS Well-Architected Framework", "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html"),
                    ("AWS Service Catalog", "https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html"),
                ],
            ),
            domain(
                "continuous-improvement",
                "Domain 3: Continuous Improvement for Existing Solutions",
                25,
                [
                    ("AWS Compute Optimizer", "https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html"),
                    ("Migration Evaluator", "https://aws.amazon.com/migration-evaluator/"),
                ],
            ),
            domain(
                "migration-modernization",
                "Domain 4: Accelerate Workload Migration and Modernization",
                20,
                [
                    ("AWS Migration Hub", "https://docs.aws.amazon.com/migrationhub/latest/ug/what-is-migrationhub.html"),
                    ("AWS Application Migration Service", "https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html"),
                ],
            ),
        ],
    },
    {
        "id": "devops-engineer-professional",
        "name": "AWS Certified DevOps Engineer – Professional",
        "code": "DOP-C02",
        "min_questions": 70,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-devops-pro/AWS-Certified-DevOps-Engineer-Professional_Exam-Guide.pdf",
        "domains": [
            domain(
                "sdlc-automation",
                "Domain 1: SDLC Automation",
                22,
                [
                    ("DOP-C02 Exam Guide", "https://aws.amazon.com/certification/certified-devops-engineer-professional/"),
                    ("AWS CodePipeline", "https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html"),
                ],
            ),
            domain(
                "config-management-iac",
                "Domain 2: Configuration Management and Infrastructure as Code",
                17,
                [
                    ("AWS CloudFormation", "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html"),
                    ("AWS CDK", "https://docs.aws.amazon.com/cdk/v2/guide/home.html"),
                ],
            ),
            domain(
                "resilient-cloud-solutions",
                "Domain 3: Resilient Cloud Solutions",
                15,
                [
                    ("Auto Scaling", "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html"),
                    ("Amazon Route 53 routing", "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html"),
                ],
            ),
            domain(
                "monitoring-logging",
                "Domain 4: Monitoring, Logging, and Incident Response",
                18,
                [
                    ("Amazon CloudWatch", "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html"),
                    ("AWS CloudTrail", "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html"),
                ],
            ),
            domain(
                "incident-event-response",
                "Domain 5: Incident and Event Response",
                14,
                [
                    ("Amazon EventBridge", "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html"),
                    ("AWS Systems Manager Incident Manager", "https://docs.aws.amazon.com/incident-manager/latest/userguide/what-is-incident-manager.html"),
                ],
            ),
            domain(
                "reliability-resilience",
                "Domain 6: Reliability and Resilience",
                14,
                [
                    ("AWS Fault Injection Service", "https://docs.aws.amazon.com/fis/latest/userguide/fis-intro.html"),
                    ("AWS Resilience Hub", "https://docs.aws.amazon.com/resilience-hub/latest/userguide/what-is.html"),
                ],
            ),
        ],
    },
    {
        "id": "generative-ai-developer-professional",
        "name": "AWS Certified Generative AI Developer – Professional",
        "code": "AIP-C01",
        "min_questions": 70,
        "exam": PROFESSIONAL_EXAM,
        "guide_url": "https://aws.amazon.com/certification/",
        "domains": [
            domain(
                "foundation-model-integration",
                "Domain 1: Foundation Model Integration and Architecture",
                28,
                [
                    ("Amazon Bedrock", "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"),
                    ("Amazon Bedrock Runtime API", "https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html"),
                ],
            ),
            domain(
                "rag-knowledge",
                "Domain 2: RAG and Knowledge Integration",
                24,
                [
                    ("Knowledge Bases for Amazon Bedrock", "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html"),
                    ("Amazon OpenSearch Serverless", "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless.html"),
                ],
            ),
            domain(
                "agents-orchestration",
                "Domain 3: Agents, Tools, and Orchestration",
                24,
                [
                    ("Amazon Bedrock Agents", "https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html"),
                    ("Amazon Step Functions", "https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html"),
                ],
            ),
            domain(
                "security-governance-genai",
                "Domain 4: Security, Testing, and Governance for GenAI Applications",
                24,
                [
                    ("Amazon Bedrock Guardrails", "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html"),
                    ("IAM for Bedrock", "https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html"),
                ],
            ),
        ],
    },
    {
        "id": "advanced-networking-specialty",
        "name": "AWS Certified Advanced Networking – Specialty",
        "code": "ANS-C01",
        "min_questions": 70,
        "exam": SPECIALTY_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-networking-specialty/AWS-Certified-Advanced-Networking-Specialty_Exam-Guide.pdf",
        "domains": [
            domain(
                "network-design",
                "Domain 1: Network Design",
                30,
                [
                    ("ANS-C01 Exam Guide", "https://aws.amazon.com/certification/certified-advanced-networking-specialty/"),
                    ("Amazon VPC", "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html"),
                    ("AWS Transit Gateway", "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html"),
                ],
            ),
            domain(
                "network-implementation",
                "Domain 2: Network Implementation",
                26,
                [
                    ("AWS Direct Connect", "https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html"),
                    ("AWS Site-to-Site VPN", "https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html"),
                ],
            ),
            domain(
                "network-management",
                "Domain 3: Network Management and Operation",
                20,
                [
                    ("VPC Flow Logs", "https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html"),
                    ("AWS Network Manager", "https://docs.aws.amazon.com/network-manager/latest/tgwnm/what-are-network-manager-cloudwan.html"),
                ],
            ),
            domain(
                "network-security",
                "Domain 4: Network Security, Compliance, and Governance",
                24,
                [
                    ("AWS Network Firewall", "https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html"),
                    ("AWS PrivateLink", "https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html"),
                ],
            ),
        ],
    },
    {
        "id": "security-specialty",
        "name": "AWS Certified Security – Specialty",
        "code": "SCS-C02",
        "min_questions": 70,
        "exam": SPECIALTY_EXAM,
        "guide_url": "https://d1.awsstatic.com/training-and-certification/docs-security-specialty/AWS-Certified-Security-Specialty_Exam-Guide.pdf",
        "domains": [
            domain(
                "detection",
                "Domain 1: Detection",
                18,
                [
                    ("SCS-C02 Exam Guide", "https://aws.amazon.com/certification/certified-security-specialty/"),
                    ("Amazon GuardDuty", "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html"),
                ],
            ),
            domain(
                "incident-response",
                "Domain 2: Incident Response",
                14,
                [
                    ("AWS Security Hub", "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html"),
                    ("Amazon Detective", "https://docs.aws.amazon.com/detective/latest/userguide/what-is-detective.html"),
                ],
            ),
            domain(
                "iam",
                "Domain 3: Identity and Access Management",
                20,
                [
                    ("AWS IAM", "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html"),
                    ("IAM Identity Center", "https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html"),
                ],
            ),
            domain(
                "infrastructure-security",
                "Domain 4: Infrastructure Security",
                17,
                [
                    ("AWS WAF", "https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html"),
                    ("AWS Shield", "https://docs.aws.amazon.com/waf/latest/developerguide/shield-chapter.html"),
                ],
            ),
            domain(
                "data-protection",
                "Domain 5: Data Protection",
                20,
                [
                    ("AWS KMS", "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html"),
                    ("Amazon Macie", "https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html"),
                ],
            ),
            domain(
                "security-governance",
                "Domain 6: Security Foundations and Governance",
                11,
                [
                    ("AWS Config", "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html"),
                    ("AWS Audit Manager", "https://docs.aws.amazon.com/audit-manager/latest/userguide/what-is.html"),
                ],
            ),
        ],
    },
]


EXAM_BY_ID = {e["id"]: e for e in EXAMS}
