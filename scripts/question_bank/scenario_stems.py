"""Turn fact-bank entries into exam-style scenario stems (original wording)."""
from __future__ import annotations

import random
import re

# (template with {task}, optional qualifier keyword)
NARRATIVE_TEMPLATES: tuple[str, ...] = (
    "A company needs to {task}. Which option meets the requirement with the LEAST implementation effort?",
    "Operations reports a need to {task}. What is the MOST operationally efficient solution?",
    "After a design review, leadership requires the team to {task}. Which approach is MOST reliable?",
    "During peak traffic, the platform team must {task}. What should they do FIRST?",
    "A regulated workload requires the organization to {task}. Which solution is BEST?",
    "The DevOps team is automating releases and must {task}. Which design fits best?",
    "An audit found gaps: the organization must {task}. Which option addresses this?",
    "For cost and security, the team must {task}. What is the recommended approach?",
    "A hybrid environment must support a goal to {task} without changing application code. What should you implement?",
    "While troubleshooting latency, engineers determine they must {task}. Which action is appropriate?",
)

COMPARISON_TEMPLATE = (
    "Two designs were proposed. Design A would {task_a}. Design B would {task_b}. "
    "The team must pick the approach aligned with vendor best practices. Which choice is correct?"
)


def _clean_task(text: str) -> str:
    t = text.strip().rstrip(".")
    if t.lower().startswith("to "):
        t = t[3:].strip()
    return t


def scenario_stem_from_fact(
    fact_task: str,
    rng: random.Random,
) -> str:
    """Build a short scenario stem from a fact-bank task phrase."""
    task = _clean_task(fact_task)
    template = rng.choice(NARRATIVE_TEMPLATES)
    stem = template.format(task=task)
    if fact_task in stem and stem.count(fact_task) > 1:
        stem = stem.replace(f"? {fact_task}", "?").replace(f". {fact_task}", ".")
    return stem


def comparison_stem_from_facts(task_a: str, task_b: str) -> str:
    return COMPARISON_TEMPLATE.format(
        task_a=_clean_task(task_a),
        task_b=_clean_task(task_b),
    )
