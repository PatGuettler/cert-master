"""Canonical URL replacements for stale or incorrect doc links."""

# old_url -> new_url (verified reachable and topic-appropriate)
URL_REPLACEMENTS: dict[str, str] = {
    # CLF Skill Builder course ID changed; use stable training landing page
    "https://explore.skillbuilder.aws/learn/course/external/view/elearning/16434/cloud-practitioner-essentials": (
        "https://aws.amazon.com/training/learn-about/cloud-practitioner/"
    ),
    # Support plans index (old /plans/ path still works but normalize)
    "https://aws.amazon.com/premiumsupport/plans/": "https://aws.amazon.com/premiumsupport/",
    "https://aws.amazon.com/premiumsupport/plans": "https://aws.amazon.com/premiumsupport/",
    # Wrong doc for GenAI caching question (404)
    "https://aws.amazon.com/builders-library/implementing-health-aware-load-balancing/": (
        "https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html"
    ),
    # CompTIA cert landing pages (locale-stable)
    "https://www.comptia.org/certifications/a": "https://www.comptia.org/en-us/certifications/a/",
    "https://www.comptia.org/certifications/network": (
        "https://www.comptia.org/en-us/certifications/network/"
    ),
    "https://www.comptia.org/certifications/security": (
        "https://www.comptia.org/en-us/certifications/security/"
    ),
    "https://www.comptia.org/certifications/cybersecurity-analyst": (
        "https://www.comptia.org/en-us/certifications/cybersecurity-analyst/"
    ),
    "https://www.comptia.org/certifications/linux": (
        "https://www.comptia.org/en-us/certifications/linux/"
    ),
    # Broken or retired URLs found by audit_doc_links.py
    "https://aws.amazon.com/devops/dora-metrics/": (
        "https://docs.aws.amazon.com/codepipeline/latest/userguide/metrics.html"
    ),
    "https://aws.amazon.com/kubernetes/gitops/": (
        "https://docs.aws.amazon.com/eks/latest/userguide/argocd.html"
    ),
    "https://docs.aws.amazon.com/opsworks/latest/userguide/welcome.html": (
        "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-state.html"
    ),
    "https://docs.aws.amazon.com/prescriptive-guidance/latest/generative-ai-nlp-security/introduction.html": (
        "https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/ai-ml.html"
    ),
    "https://docs.aws.amazon.com/vmc/latest/userguide/what-is-vmware-cloud-on-aws.html": (
        "https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html"
    ),
    "https://docs.aws.amazon.com/whitepapers/latest/architecting-for-the-cloud/data-privacy.html": (
        "https://docs.aws.amazon.com/whitepapers/latest/introduction-aws-security/data-protection.html"
    ),
    "https://docs.aws.amazon.com/whitepapers/latest/pci-dss-payment-applications-on-aws/pci-dss-payment-applications-on-aws.html": (
        "https://docs.aws.amazon.com/securityhub/latest/userguide/pci-standard.html"
    ),
}
