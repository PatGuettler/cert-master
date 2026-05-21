"""Build practice exams for any cloud vendor from fact banks + official domain resources."""
from __future__ import annotations

import itertools
import random
from dataclasses import dataclass
from typing import Any, Callable

from question_bank.common import RawQuestion, build_questions, dedupe_raw
from question_bank.official_docs import is_official_url

Fact = tuple[str, str, tuple[str, str, str], str, str, str]


@dataclass(frozen=True)
class VendorBuildConfig:
    vendor: str
    product_label: str
    stem_best: str  # format with {suffix}
    stem_alt: tuple[str, ...]
    scenario_prefixes: tuple[str, ...]
    official_prep_phrase: str


AWS_CONFIG = VendorBuildConfig(
    vendor="aws",
    product_label="AWS",
    stem_best="Which AWS service or feature is BEST to {suffix}?",
    stem_alt=(
        "Which service should you use to {suffix}?",
        "What is the MOST appropriate AWS solution to {suffix}?",
        "A team must {suffix}. Which option meets the requirement?",
    ),
    scenario_prefixes=(
        "A solutions architect needs to",
        "A development team must",
        "An organization wants to",
        "For a regulated workload, you should",
    ),
    official_prep_phrase="official AWS exam guides and documentation",
)

AZURE_CONFIG = VendorBuildConfig(
    vendor="azure",
    product_label="Microsoft Azure",
    stem_best="Which Azure service or capability is BEST to {suffix}?",
    stem_alt=(
        "Which Azure offering should you use to {suffix}?",
        "What is the recommended Azure approach to {suffix}?",
        "Your team must {suffix}. Which Azure option fits best?",
    ),
    scenario_prefixes=(
        "A cloud administrator needs to",
        "An Azure architect must",
        "Your organization plans to",
        "For a hybrid workload, you should",
    ),
    official_prep_phrase="official Microsoft Learn and Azure documentation",
)

GOOGLE_CONFIG = VendorBuildConfig(
    vendor="google",
    product_label="Google Cloud",
    stem_best="Which Google Cloud product or feature is BEST to {suffix}?",
    stem_alt=(
        "Which Google Cloud service should you use to {suffix}?",
        "What is the recommended Google Cloud solution to {suffix}?",
        "A platform team must {suffix}. Which option aligns with Google best practices?",
    ),
    scenario_prefixes=(
        "A cloud engineer needs to",
        "A data team must",
        "Your startup is building on Google Cloud and needs to",
        "For cost-aware operations, you should",
    ),
    official_prep_phrase="official Google Cloud documentation and exam guides",
)

COMPTIA_CONFIG = VendorBuildConfig(
    vendor="comptia",
    product_label="CompTIA",
    stem_best="Which approach BEST supports the objective to {suffix}?",
    stem_alt=(
        "What should you do FIRST to {suffix}?",
        "Which option is MOST appropriate to {suffix}?",
        "A technician must {suffix}. What is the best choice?",
    ),
    scenario_prefixes=(
        "On the job, you need to",
        "Per CompTIA best practices, you should",
        "During troubleshooting, you must",
        "For compliance, the team must",
    ),
    official_prep_phrase="official CompTIA exam objectives and study resources",
)

CONFIG_BY_VENDOR = {
    "aws": AWS_CONFIG,
    "azure": AZURE_CONFIG,
    "google": GOOGLE_CONFIG,
    "comptia": COMPTIA_CONFIG,
}


def _fact_mcq(
    domain: str,
    fact: Fact,
    cfg: VendorBuildConfig,
    stem: str | None = None,
) -> RawQuestion:
    stem_suffix, correct, wrong, explanation, doc_title, doc_url = fact
    text = stem or cfg.stem_best.format(suffix=stem_suffix)
    return (
        domain,
        "multiple-choice",
        text,
        [("a", correct), ("b", wrong[0]), ("c", wrong[1]), ("d", wrong[2])],
        ["a"],
        explanation,
        [(doc_title, doc_url)],
    )


def _resource_questions(spec: dict, cfg: VendorBuildConfig) -> list[RawQuestion]:
    """Original practice items anchored to each official domain resource link."""
    raw: list[RawQuestion] = []
    vendor = spec.get("vendor", cfg.vendor)
    exam_name = spec["name"]
    for domain in spec["domains"]:
        did = domain["id"]
        dname = domain.get("name", did)
        for res in domain.get("resources", []):
            url = res["url"]
            if not is_official_url(url, vendor):
                raise ValueError(f"Non-official resource URL in {spec['id']}: {url}")
            title = res["title"]
            raw.append(
                (
                    did,
                    "multiple-choice",
                    f"Per {cfg.official_prep_phrase}, which source should you use when studying "
                    f"{dname.split(':')[-1].strip()} for {exam_name}?",
                    [
                        ("a", title),
                        ("b", "Unofficial leaked exam dumps"),
                        ("c", "Anonymous forum answer keys only"),
                        ("d", "Random blogs without vendor citations"),
                    ],
                    ["a"],
                    f"Use {title} and other official materials listed in the exam guide—not copied exam items.",
                    [(title, url)],
                )
            )
            raw.append(
                (
                    did,
                    "multiple-choice",
                    f"According to '{title}', what is a documented best practice for "
                    f"{dname.split(':')[-1].strip()}?",
                    [
                        ("a", "Follow the vendor documentation and exam objective domains"),
                        ("b", "Disable logging to reduce storage cost"),
                        ("c", "Share administrative credentials in chat"),
                        ("d", "Skip change management for speed"),
                    ],
                    ["a"],
                    f"{title} reflects official guidance; designs should align with documented objectives.",
                    [(title, url)],
                )
            )
    return raw


def _pad_domain(
    domain_id: str,
    facts: list[Fact],
    target: int,
    cfg: VendorBuildConfig,
    rng: random.Random,
) -> list[RawQuestion]:
    raw: list[RawQuestion] = []
    for fact in facts:
        raw.append(_fact_mcq(domain_id, fact, cfg))
    for fact in facts:
        if len(raw) >= target:
            break
        for alt in cfg.stem_alt:
            raw.append(_fact_mcq(domain_id, fact, cfg, alt.format(suffix=fact[0])))
    for fact in facts:
        if len(raw) >= target:
            break
        prefix = rng.choice(cfg.scenario_prefixes)
        stem = f"{prefix} {fact[0]}."
        raw.append(_fact_mcq(domain_id, fact, cfg, stem))
    idx = 0
    while len(raw) < target and len(facts) >= 2:
        f1, f2 = facts[idx % len(facts)], facts[(idx + 1) % len(facts)]
        idx += 1
        _, c1, w1, e1, t1, u1 = f1
        _, c2, _, e2, t2, u2 = f2
        stem = (
            f"Which capability is provided by {c1} rather than {c2} when you need to {f1[0]}?"
        )
        raw.append(
            (
                domain_id,
                "multiple-choice",
                stem,
                [("a", c1), ("b", c2), ("c", w1[0]), ("d", w1[1])],
                ["a"],
                f"{e1} Compare with {c2}: {e2}",
                [(t1, u1), (t2, u2)],
            )
        )
    return raw[: max(target, len(raw))]


def build_raw_questions(
    exam_id: str,
    spec: dict,
    banks: dict[str, dict[str, list[Fact]]],
    cfg: VendorBuildConfig,
    min_total: int,
    seed: int = 42,
) -> list[RawQuestion]:
    domains = spec["domains"]
    rng = random.Random(seed + hash(exam_id) % 10000)
    exam_facts = banks.get(exam_id, {})
    raw: list[RawQuestion] = list(_resource_questions(spec, cfg))
    total_weight = sum(d["weight"] for d in domains)

    for domain in domains:
        did = domain["id"]
        weight = domain["weight"]
        target = max(8, int(min_total * weight / total_weight) + 3)
        facts = exam_facts.get(did, [])
        if not facts and exam_facts:
            facts = exam_facts.get(next(iter(exam_facts.keys())), [])
        raw.extend(_pad_domain(did, facts, target, cfg, rng))

    raw = dedupe_raw(raw)
    fact_pool = list(itertools.chain.from_iterable(exam_facts.values()))
    attempt = 0
    seen = {r[2] for r in raw}
    while len(raw) < min_total and fact_pool and attempt < min_total * 5:
        fact = fact_pool[attempt % len(fact_pool)]
        domain_id = domains[attempt % len(domains)]["id"]
        prefix = rng.choice(cfg.scenario_prefixes)
        candidate = _fact_mcq(domain_id, fact, cfg, f"{prefix} {fact[0]}.")
        if candidate[2] not in seen:
            raw.append(candidate)
            seen.add(candidate[2])
        attempt += 1

    if len(raw) < min_total:
        raise SystemExit(
            f"{exam_id}: generated {len(raw)} unique questions, need {min_total}. "
            "Add facts to the vendor fact bank."
        )
    return raw


ID_PREFIX: dict[str, str] = {
    "az-900": "az9",
    "az-104": "az104",
    "az-204": "az204",
    "az-305": "az305",
    "az-400": "az400",
    "az-500": "az500",
    "sc-900": "sc9",
    "dp-900": "dp9",
    "ai-900": "ai9",
    "cloud-digital-leader": "cdl",
    "associate-cloud-engineer": "ace",
    "professional-cloud-architect": "pca",
    "professional-data-engineer": "pde",
    "professional-cloud-security-engineer": "pcse",
    "professional-cloud-devops-engineer": "pcdo",
    "database-specialty": "dbs",
    "machine-learning-specialty": "mls",
    "comptia-cloud-plus": "cptcld",
    "comptia-data-plus": "cptdat",
    "comptia-pentest-plus": "cptpen",
}


def build_vendor_payload(
    exam_id: str,
    catalog_by_id: dict[str, dict],
    banks: dict[str, dict[str, list[Fact]]],
    cfg: VendorBuildConfig | None = None,
) -> dict[str, Any]:
    spec = catalog_by_id[exam_id]
    cfg = cfg or CONFIG_BY_VENDOR.get(spec.get("vendor", "aws"), AWS_CONFIG)
    min_q = spec.get("min_questions", 70)
    raw = build_raw_questions(exam_id, spec, banks, cfg, min_q)
    prefix = ID_PREFIX.get(exam_id, exam_id.replace("-", "")[:6])
    questions = build_questions(raw, prefix)
    payload = {
        "id": spec["id"],
        "name": spec["name"],
        "code": spec["code"],
        "vendor": spec.get("vendor", cfg.vendor),
        "exam": spec["exam"],
        "domains": spec["domains"],
        "questions": questions,
    }
    if spec.get("guide_url"):
        payload["guideUrl"] = spec["guide_url"]
    if spec.get("acronyms"):
        payload["acronyms"] = spec["acronyms"]
    return payload
