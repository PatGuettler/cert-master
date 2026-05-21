"""KeyTrain's Key Training — practice, workshop, and formal cert categories."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class KeyTrainingDomain:
    id: str
    name: str
    weight: int


@dataclass(frozen=True)
class KeyTrainingCategory:
    id: str
    name: str
    code: str
    certificate_title: str
    level: str
    domains: tuple[KeyTrainingDomain, ...]
    tagline: str


KEY_TRAINING_CATEGORIES: tuple[KeyTrainingCategory, ...] = (
    KeyTrainingCategory(
        id="keytrain-identity-access",
        name="Identity & Access Security",
        code="KT-IAS",
        certificate_title="KeyTrain Certified Identity & Access Security",
        level="Core",
        tagline="Authentication, MFA, privilege escalation, account misuse, and credential abuse.",
        domains=(
            KeyTrainingDomain("authentication", "Authentication", 20),
            KeyTrainingDomain("mfa", "Multi-factor authentication (MFA)", 20),
            KeyTrainingDomain("privilege-escalation", "Privilege escalation", 20),
            KeyTrainingDomain("account-misuse", "Account misuse", 20),
            KeyTrainingDomain("credential-abuse", "Credential abuse", 20),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-email-security",
        name="Email Security",
        code="KT-EMS",
        certificate_title="KeyTrain Certified Email Security",
        level="Core",
        tagline="Phishing, spoofing, malicious attachments, and business email compromise (BEC).",
        domains=(
            KeyTrainingDomain("phishing", "Phishing", 25),
            KeyTrainingDomain("spoofing", "Spoofing", 25),
            KeyTrainingDomain("malicious-attachments", "Malicious attachments", 25),
            KeyTrainingDomain("bec", "Business email compromise (BEC)", 25),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-data-protection",
        name="Data Protection",
        code="KT-DP",
        certificate_title="KeyTrain Certified Data Protection",
        level="Core",
        tagline="Sensitive data exposure, encryption, DLP, removable media, and backups.",
        domains=(
            KeyTrainingDomain("sensitive-exposure", "Sensitive data exposure", 20),
            KeyTrainingDomain("encryption", "Encryption", 20),
            KeyTrainingDomain("dlp", "Data loss prevention (DLP)", 20),
            KeyTrainingDomain("removable-media", "Removable media", 20),
            KeyTrainingDomain("backups", "Backups", 20),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-endpoint-security",
        name="Endpoint Security",
        code="KT-EPS",
        certificate_title="KeyTrain Certified Endpoint Security",
        level="Core",
        tagline="Malware, ransomware, process analysis, persistence, and antivirus status.",
        domains=(
            KeyTrainingDomain("malware", "Malware", 20),
            KeyTrainingDomain("ransomware", "Ransomware", 20),
            KeyTrainingDomain("process-analysis", "Process analysis", 20),
            KeyTrainingDomain("persistence", "Startup persistence", 20),
            KeyTrainingDomain("av-status", "Antivirus status", 20),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-network-security",
        name="Network Security",
        code="KT-NET",
        certificate_title="KeyTrain Certified Network Security",
        level="Core",
        tagline="IDS/IPS, port anomalies, beaconing, ARP spoofing, DNS tunneling, and traffic inspection.",
        domains=(
            KeyTrainingDomain("ids-ips", "IDS/IPS alerts", 17),
            KeyTrainingDomain("port-anomalies", "Port anomalies", 17),
            KeyTrainingDomain("beaconing", "Beaconing", 17),
            KeyTrainingDomain("arp-spoofing", "ARP spoofing", 17),
            KeyTrainingDomain("dns-tunneling", "DNS tunneling", 16),
            KeyTrainingDomain("traffic-inspection", "Traffic inspection", 16),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-system-hygiene",
        name="System Hygiene",
        code="KT-SYS",
        certificate_title="KeyTrain Certified System Hygiene",
        level="Core",
        tagline="Patch management, outdated software, configuration drift, update compliance, and unsupported OSs.",
        domains=(
            KeyTrainingDomain("patching", "Patch management", 20),
            KeyTrainingDomain("outdated-software", "Outdated software", 20),
            KeyTrainingDomain("config-drift", "Configuration drift", 20),
            KeyTrainingDomain("update-compliance", "Update compliance", 20),
            KeyTrainingDomain("unsupported-os", "Unsupported operating systems", 20),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-application-security",
        name="Application Security",
        code="KT-APP",
        certificate_title="KeyTrain Certified Application Security",
        level="Core",
        tagline="Vulnerable applications, insecure coding, software exploits, and SAST findings.",
        domains=(
            KeyTrainingDomain("vulnerable-apps", "Vulnerable applications", 25),
            KeyTrainingDomain("insecure-coding", "Insecure coding", 25),
            KeyTrainingDomain("exploits", "Software exploits", 25),
            KeyTrainingDomain("sast", "SAST findings", 25),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-financial-security",
        name="Financial Security",
        code="KT-FIN",
        certificate_title="KeyTrain Certified Financial Security",
        level="Core",
        tagline="Fraud indicators, accounting integrity, financial workflow protection, and invoice/payment manipulation.",
        domains=(
            KeyTrainingDomain("fraud-indicators", "Fraud indicators", 25),
            KeyTrainingDomain("accounting-integrity", "Accounting integrity", 25),
            KeyTrainingDomain("workflow-protection", "Financial workflow protection", 25),
            KeyTrainingDomain("invoice-manipulation", "Invoice and payment manipulation", 25),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-physical-security",
        name="Physical Security",
        code="KT-PHY",
        certificate_title="KeyTrain Certified Physical Security",
        level="Core",
        tagline="Unauthorized access, device theft, badge/access control, and CCTV-related concerns.",
        domains=(
            KeyTrainingDomain("unauthorized-access", "Unauthorized access", 25),
            KeyTrainingDomain("device-theft", "Device theft", 25),
            KeyTrainingDomain("badge-access", "Badge and access control", 25),
            KeyTrainingDomain("cctv", "CCTV-related concerns", 25),
        ),
    ),
    KeyTrainingCategory(
        id="keytrain-compliance-governance",
        name="Compliance & Governance",
        code="KT-CG",
        certificate_title="KeyTrain Certified Compliance & Governance",
        level="Core",
        tagline="HIPAA, policy adherence, audit readiness, documentation, and risk management alignment.",
        domains=(
            KeyTrainingDomain("hipaa", "HIPAA", 20),
            KeyTrainingDomain("policy-adherence", "Policy adherence", 20),
            KeyTrainingDomain("audit-readiness", "Audit readiness", 20),
            KeyTrainingDomain("documentation", "Documentation", 20),
            KeyTrainingDomain("risk-management", "Risk management alignment", 20),
        ),
    ),
)

BY_ID = {c.id: c for c in KEY_TRAINING_CATEGORIES}
