"""CompTIA exam metadata aligned to official exam objectives (practice items only)."""
from __future__ import annotations

from typing import Any

COMPTIA_VENDOR = "comptia"

# CompTIA scaled scores (max 900); passing scores from exam guides
A_PLUS_EXAM = {
    "totalQuestions": 85,
    "scoredQuestions": 75,
    "timeLimitMinutes": 90,
    "passingScore": 675,
    "maxScore": 900,
    "selectionMode": "weighted-random",
}

NETWORK_PLUS_EXAM = {
    "totalQuestions": 90,
    "scoredQuestions": 80,
    "timeLimitMinutes": 90,
    "passingScore": 720,
    "maxScore": 900,
    "selectionMode": "weighted-random",
}

SECURITY_PLUS_EXAM = {
    "totalQuestions": 90,
    "scoredQuestions": 80,
    "timeLimitMinutes": 90,
    "passingScore": 750,
    "maxScore": 900,
    "selectionMode": "weighted-random",
}

CYSA_EXAM = {
    "totalQuestions": 85,
    "scoredQuestions": 75,
    "timeLimitMinutes": 165,
    "passingScore": 750,
    "maxScore": 900,
    "selectionMode": "weighted-random",
}

LINUX_PLUS_EXAM = {
    "totalQuestions": 90,
    "scoredQuestions": 80,
    "timeLimitMinutes": 90,
    "passingScore": 720,
    "maxScore": 900,
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


COMPTIA_EXAMS: list[dict[str, Any]] = [
    {
        "id": "comptia-a-plus",
        "name": "CompTIA A+",
        "code": "220-1101 / 1102",
        "vendor": COMPTIA_VENDOR,
        "min_questions": 75,
        "exam": A_PLUS_EXAM,
        "guide_url": "https://www.comptia.org/en-us/certifications/a",
        "domains": [
            domain("mobile-devices", "Domain 1: Mobile Devices", 15, [
                ("A+ Exam Objectives", "https://www.comptia.org/en-us/certifications/a"),
            ]),
            domain("networking", "Domain 2: Networking", 20, [
                ("A+ Exam Objectives", "https://www.comptia.org/en-us/certifications/a"),
            ]),
            domain("hardware", "Domain 3: Hardware", 25, [
                ("A+ Exam Objectives", "https://www.comptia.org/en-us/certifications/a"),
            ]),
            domain("virtualization-cloud", "Domain 4: Virtualization and Cloud", 11, [
                ("A+ Exam Objectives", "https://www.comptia.org/en-us/certifications/a"),
            ]),
            domain("troubleshooting", "Domain 5: Hardware and Network Troubleshooting", 29, [
                ("A+ Exam Objectives", "https://www.comptia.org/en-us/certifications/a"),
            ]),
        ],
    },
    {
        "id": "comptia-network-plus",
        "name": "CompTIA Network+",
        "code": "N10-009",
        "vendor": COMPTIA_VENDOR,
        "min_questions": 75,
        "exam": NETWORK_PLUS_EXAM,
        "guide_url": "https://www.comptia.org/en-us/certifications/network",
        "domains": [
            domain("concepts", "Domain 1: Networking Concepts", 24, [
                ("Network+ Exam Objectives", "https://www.comptia.org/en-us/certifications/network"),
            ]),
            domain("implementation", "Domain 2: Network Implementation", 19, [
                ("Network+ Exam Objectives", "https://www.comptia.org/en-us/certifications/network"),
            ]),
            domain("operations", "Domain 3: Network Operations", 16, [
                ("Network+ Exam Objectives", "https://www.comptia.org/en-us/certifications/network"),
            ]),
            domain("security", "Domain 4: Network Security", 19, [
                ("Network+ Exam Objectives", "https://www.comptia.org/en-us/certifications/network"),
            ]),
            domain("troubleshooting", "Domain 5: Network Troubleshooting", 22, [
                ("Network+ Exam Objectives", "https://www.comptia.org/en-us/certifications/network"),
            ]),
        ],
    },
    {
        "id": "comptia-security-plus",
        "name": "CompTIA Security+",
        "code": "SY0-701",
        "vendor": COMPTIA_VENDOR,
        "min_questions": 75,
        "exam": SECURITY_PLUS_EXAM,
        "guide_url": "https://www.comptia.org/en-us/certifications/security",
        "domains": [
            domain("general", "Domain 1: General Security Concepts", 12, [
                ("Security+ Exam Objectives", "https://www.comptia.org/en-us/certifications/security"),
            ]),
            domain("threats", "Domain 2: Threats, Vulnerabilities, and Mitigations", 22, [
                ("Security+ Exam Objectives", "https://www.comptia.org/en-us/certifications/security"),
            ]),
            domain("architecture", "Domain 3: Security Architecture", 18, [
                ("Security+ Exam Objectives", "https://www.comptia.org/en-us/certifications/security"),
            ]),
            domain("operations", "Domain 4: Security Operations", 28, [
                ("Security+ Exam Objectives", "https://www.comptia.org/en-us/certifications/security"),
            ]),
            domain("program", "Domain 5: Security Program Management", 20, [
                ("Security+ Exam Objectives", "https://www.comptia.org/en-us/certifications/security"),
            ]),
        ],
    },
    {
        "id": "comptia-cysa-plus",
        "name": "CompTIA CySA+",
        "code": "CS0-003",
        "vendor": COMPTIA_VENDOR,
        "min_questions": 75,
        "exam": CYSA_EXAM,
        "guide_url": "https://www.comptia.org/en-us/certifications/cybersecurity-analyst",
        "domains": [
            domain("operations", "Domain 1: Security Operations", 33, [
                ("CySA+ Exam Objectives", "https://www.comptia.org/en-us/certifications/cybersecurity-analyst"),
            ]),
            domain("vulnerability", "Domain 2: Vulnerability Management", 30, [
                ("CySA+ Exam Objectives", "https://www.comptia.org/en-us/certifications/cybersecurity-analyst"),
            ]),
            domain("incident", "Domain 3: Incident Response and Management", 20, [
                ("CySA+ Exam Objectives", "https://www.comptia.org/en-us/certifications/cybersecurity-analyst"),
            ]),
            domain("reporting", "Domain 4: Reporting and Communication", 17, [
                ("CySA+ Exam Objectives", "https://www.comptia.org/en-us/certifications/cybersecurity-analyst"),
            ]),
        ],
    },
    {
        "id": "comptia-linux-plus",
        "name": "CompTIA Linux+",
        "code": "XK0-005",
        "vendor": COMPTIA_VENDOR,
        "min_questions": 75,
        "exam": LINUX_PLUS_EXAM,
        "guide_url": "https://www.comptia.org/en-us/certifications/linux",
        "domains": [
            domain("management", "Domain 1: System Management", 32, [
                ("Linux+ Exam Objectives", "https://www.comptia.org/en-us/certifications/linux"),
            ]),
            domain("security", "Domain 2: Security", 21, [
                ("Linux+ Exam Objectives", "https://www.comptia.org/en-us/certifications/linux"),
            ]),
            domain("automation", "Domain 3: Scripting, Containers, and Automation", 29, [
                ("Linux+ Exam Objectives", "https://www.comptia.org/en-us/certifications/linux"),
            ]),
            domain("troubleshooting", "Domain 4: Troubleshooting", 18, [
                ("Linux+ Exam Objectives", "https://www.comptia.org/en-us/certifications/linux"),
            ]),
        ],
    },
]

COMPTIA_BY_ID = {e["id"]: e for e in COMPTIA_EXAMS}
