#!/usr/bin/env python3
"""
configure_companies.py

Researches and configures tracked_companies entries in portals.yml
using the Anthropic API with built-in web_search tool.

Usage:
  python3 configure_companies.py               # Process all TODO entries
  python3 configure_companies.py --batch 10    # Process first 10
  python3 configure_companies.py --dry-run     # Preview without writing
  python3 configure_companies.py --company "Airbnb"  # Single company
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import anthropic

PORTALS_YML = Path(__file__).parent / "portals.yml"
REVIEW_REPORT = Path(__file__).parent / "review_report.md"
MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are a career data researcher. Your task is to research company careers pages and determine the correct configuration for an automated job scanner system.

## Your Goal

For each company you are given, you will:
1. Search for the company's official careers page
2. Identify which Applicant Tracking System (ATS) hosts their jobs
3. Choose the correct configuration type
4. Return a valid JSON configuration block

## Configuration Types

### Type 1: Greenhouse API

Use when the company uses Greenhouse ATS. You can identify Greenhouse by these URL patterns:
- job-boards.greenhouse.io/company-slug
- boards.greenhouse.io/company-slug
- job-boards.eu.greenhouse.io/company-slug (European boards)

For Greenhouse, the `careers_url` should ideally be the branded company careers page (e.g., https://company.com/careers) if they have one, but you can also use the Greenhouse board URL directly. The `api_url` is always derived from the Greenhouse slug.

Example: if the board URL is https://job-boards.greenhouse.io/anthropic, the slug is "anthropic" and the API URL is https://boards-api.greenhouse.io/v1/boards/anthropic/jobs

Required JSON:
```json
{
  "config_type": "greenhouse",
  "careers_url": "https://job-boards.greenhouse.io/slug",
  "api_url": "https://boards-api.greenhouse.io/v1/boards/slug/jobs",
  "notes": "optional: city, country, focus area, or other useful context"
}
```

### Type 2: Websearch

Use when the company uses an ATS that does not support structured API access, or when the company's careers page benefits from search-engine discovery.

ATS platforms that require websearch:
- Workday (myworkdayjobs.com)
- Workable (apply.workable.com)
- SmartRecruiters (jobs.smartrecruiters.com)
- BambooHR (jobs.bamboohr.com)
- Rippling ATS (ats.rippling.com)
- Jobvite (jobs.jobvite.com)
- ICIMS (careers.icims.com, icims.com/jobs)
- Wellfound (wellfound.com/jobs)
- WelcomeToTheJungle (welcometothejungle.com)
- Custom branded careers pages with good search indexing (large companies)

The `scan_query` must be a valid Google-style search query. See below for formatting rules.

Required JSON:
```json
{
  "config_type": "websearch",
  "careers_url": "https://verified-careers-page-url.com",
  "scan_query": "search query string here",
  "notes": "optional: context about company, region, or ATS uncertainty"
}
```

### Type 3: Default Playwright

Use when the company uses Ashby or Lever ATS, or when direct page scraping is reliable and clean.

ATS platforms that use Playwright by default:
- Ashby (jobs.ashbyhq.com/company)
- Lever (jobs.lever.co/company)

Required JSON:
```json
{
  "config_type": "playwright",
  "careers_url": "https://verified-careers-url",
  "notes": "optional: context about company, region, or ATS uncertainty"
}
```

### Type 4: NEEDS_REVIEW

Use when:
- You cannot confidently verify the careers URL
- The ATS is unclear or uses a platform not listed above
- Multiple conflicting results make it impossible to determine the correct config
- The company appears to have no active careers page

Required JSON:
```json
{
  "config_type": "needs_review",
  "review_reason": "specific reason: e.g., could not verify careers page, ATS unclear, custom platform"
}
```

## ATS Quick Reference

| ATS Platform | URL Pattern | Config Type |
|---|---|---|
| Greenhouse | job-boards.greenhouse.io | greenhouse |
| Greenhouse EU | job-boards.eu.greenhouse.io | greenhouse |
| Ashby | jobs.ashbyhq.com | playwright |
| Lever | jobs.lever.co | playwright |
| Workday | myworkdayjobs.com | websearch |
| Workable | apply.workable.com | websearch |
| SmartRecruiters | jobs.smartrecruiters.com | websearch |
| BambooHR | jobs.bamboohr.com | websearch |
| Rippling | ats.rippling.com | websearch |
| Jobvite | jobs.jobvite.com | websearch |
| ICIMS | careers.icims.com | websearch |
| Wellfound | wellfound.com | websearch |
| WelcomeToTheJungle | welcometothejungle.com | websearch |

## Scan Query Rules (websearch only)

Build a scan_query that targets technical customer-facing roles. Keep it company-specific and focused.

**Primary target roles to include:**
- "Solutions Engineer"
- "Technical Account Manager" (TAM)
- "Customer Success Engineer"
- "Sales Engineer"
- "Implementation Manager"
- "Forward Deployed Engineer"
- "Customer Engineer"

**Roles to AVOID in scan_query:**
- Solutions Architect, Technical Architect
- Backend Engineer, Frontend Engineer, Platform Engineer
- ML Engineer, ML Researcher, Data Scientist
- Firmware, Embedded, Infrastructure

### Scan Query Patterns

Pattern A — ATS-specific (for Ashby, Workable, etc. when the board is clean):
```
site:jobs.ashbyhq.com/company
site:apply.workable.com/company
```

Pattern B — Branded careers search (for large companies with indexed pages):
```
site:company.com/careers "Solutions Engineer" OR "Customer Engineer" OR "Forward Deployed"
```

Pattern C — Mixed (branded + ATS fallback):
```
site:company.com/careers OR site:job-boards.greenhouse.io/slug "Solutions" OR "Engineer"
```

Pattern D — Broad (when specific pages aren't reliably indexed):
```
"company name" "Solutions Engineer" OR "Customer Success" careers site:company.com OR site:linkedin.com
```

## careers_url Rules

- Prefer the branded company careers URL (e.g., https://company.com/careers) over raw ATS URLs
- Use raw ATS URL only when no branded page exists
- Never guess — verify the URL actually resolves to a live careers page
- If in doubt, flag as NEEDS_REVIEW

## Output Format

After your research, you MUST end your response with exactly one JSON code block containing your configuration. The JSON must be valid and complete.

```json
{
  "config_type": "one of: greenhouse | websearch | playwright | needs_review",
  "careers_url": "...",
  ...other fields based on config_type...
}
```

Do not include multiple JSON blocks. Only the final configuration block matters.
"""


def find_todo_entries(lines: list) -> list:
    """Find all TODO-marked company entries in tracked_companies section."""
    entries = []
    in_tracked = False

    for i, line in enumerate(lines):
        if line.rstrip() == "tracked_companies:":
            in_tracked = True
            continue

        if not in_tracked:
            continue

        if '    careers_url: "TODO' in line:
            # Search backward for the - name: line
            start = i
            for j in range(i - 1, max(0, i - 8), -1):
                if lines[j].startswith("  - name:"):
                    start = j
                    break

            # Search forward for enabled: false
            end = i
            for j in range(i, min(len(lines), i + 10)):
                if "    enabled: false" in lines[j]:
                    end = j
                    break

            name_line = lines[start].strip()
            name = re.sub(r"^-\s*name:\s*", "", name_line).strip()

            entries.append({
                "name": name,
                "start_line": start,
                "end_line": end,
            })

    return entries


def build_yaml_entry(name: str, result: dict) -> str:
    """Build the YAML text for a configured company entry."""
    config_type = result.get("config_type", "needs_review")
    parts = [f"  - name: {name}"]

    def clean_notes(text):
        if not text:
            return ""
        # Escape double quotes inside notes value
        return text.replace('"', '\\"')

    if config_type == "greenhouse":
        careers_url = result.get("careers_url", "").strip()
        api_url = result.get("api_url", "").strip()
        notes = clean_notes(result.get("notes", ""))
        parts.append(f"    careers_url: {careers_url}")
        parts.append(f"    api: {api_url}")
        if notes:
            parts.append(f'    notes: "{notes}"')
        parts.append("    enabled: true")

    elif config_type == "websearch":
        careers_url = result.get("careers_url", "").strip()
        scan_query = result.get("scan_query", "").strip()
        notes = clean_notes(result.get("notes", ""))
        # Remove wrapping quotes from scan_query if Claude added them
        if scan_query.startswith(("'", '"')) and scan_query.endswith(("'", '"')):
            scan_query = scan_query[1:-1]
        # Escape single quotes in query by doubling them (YAML single-quote style)
        scan_query_yaml = scan_query.replace("'", "''")
        parts.append(f"    careers_url: {careers_url}")
        parts.append("    scan_method: websearch")
        parts.append(f"    scan_query: '{scan_query_yaml}'")
        if notes:
            parts.append(f'    notes: "{notes}"')
        parts.append("    enabled: true")

    elif config_type == "playwright":
        careers_url = result.get("careers_url", "").strip()
        notes = clean_notes(result.get("notes", ""))
        parts.append(f"    careers_url: {careers_url}")
        if notes:
            parts.append(f'    notes: "{notes}"')
        parts.append("    enabled: true")

    else:  # needs_review
        reason = result.get("review_reason", "Could not verify careers page or ATS platform")
        # Sanitize reason: remove double quotes
        reason = reason.replace('"', "'")
        parts.append(f'    careers_url: "NEEDS_REVIEW: {reason}"')
        parts.append("    enabled: false")
        parts.append(f'    notes: "Flagged for manual review: {reason}"')

    return "\n".join(parts)


def extract_json_from_response(text: str):
    """Extract the last JSON code block from Claude's response."""
    # Find all ```json ... ``` blocks
    matches = list(re.finditer(r"```json\s*(.*?)\s*```", text, re.DOTALL))
    if not matches:
        # Try bare JSON object at end of response
        bare = re.search(r"(\{[^{}]*\"config_type\"[^{}]*\})\s*$", text, re.DOTALL)
        if bare:
            try:
                return json.loads(bare.group(1))
            except json.JSONDecodeError:
                pass
        return None

    # Use the last match (the final configuration)
    last = matches[-1].group(1)
    try:
        return json.loads(last)
    except json.JSONDecodeError:
        return None


def research_company(client: anthropic.Anthropic, company_name: str) -> dict:
    """Call Claude with web_search to research a company and return config."""
    user_message = (
        f"Research the company: **{company_name}**\n\n"
        f"Steps:\n"
        f"1. Search for \"{company_name} careers\" to find their official careers page\n"
        f"2. Click into an actual job listing to see the ATS URL (this is critical)\n"
        f"3. Match the ATS URL to the configuration type table\n"
        f"4. Choose the correct config type and build the entry\n\n"
        f"Important reminders:\n"
        f"- Verify the careers_url actually resolves — do not guess\n"
        f"- For Greenhouse: extract the slug from the board URL to build the api_url\n"
        f"- For websearch scan_query: target Solutions Engineer, TAM, CSE, Forward Deployed roles\n"
        f"- Do NOT include Solutions Architect, Backend/Frontend Engineer in scan_query\n"
        f"- If the ATS is ambiguous or the page is unverifiable, use needs_review\n\n"
        f"End your response with a single ```json ... ``` block containing your configuration."
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[{"type": "web_search_20260209", "name": "web_search"}],
        messages=[{"role": "user", "content": user_message}],
    )

    text = ""
    for block in response.content:
        if hasattr(block, "text"):
            text += block.text

    result = extract_json_from_response(text)
    if result is None:
        return {
            "config_type": "needs_review",
            "review_reason": "Claude did not return a parseable JSON configuration block",
        }

    # Validate required fields
    config_type = result.get("config_type")
    if config_type not in ("greenhouse", "websearch", "playwright", "needs_review"):
        return {
            "config_type": "needs_review",
            "review_reason": f"Unknown config_type returned: {config_type!r}",
        }

    if config_type == "greenhouse" and not result.get("api_url"):
        return {
            "config_type": "needs_review",
            "review_reason": "Greenhouse config missing api_url",
        }

    if config_type in ("greenhouse", "websearch", "playwright") and not result.get("careers_url"):
        return {
            "config_type": "needs_review",
            "review_reason": f"{config_type} config missing careers_url",
        }

    return result


def apply_replacement(lines: list, start: int, end: int, new_yaml: str) -> list:
    """Replace lines[start:end+1] with new_yaml lines."""
    new_lines = new_yaml.split("\n")
    return lines[:start] + new_lines + lines[end + 1:]


def write_review_report(needs_review: list, errors: list, configured: list):
    """Write review_report.md summarizing results."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        "# Configuration Review Report",
        f"Generated: {now}",
        "",
        "## Summary",
        "",
        f"| Result | Count |",
        f"|--------|-------|",
        f"| Configured | {len(configured)} |",
        f"| Needs Review | {len(needs_review)} |",
        f"| Errors | {len(errors)} |",
        "",
    ]

    if needs_review:
        lines += ["## Companies Flagged for Manual Review", ""]
        for item in needs_review:
            lines.append(f"### {item['name']}")
            lines.append(f"**Reason:** {item['reason']}")
            lines.append("")

    if errors:
        lines += ["## Processing Errors", ""]
        for item in errors:
            lines.append(f"### {item['name']}")
            lines.append(f"**Error:** {item['error']}")
            lines.append("")

    if configured:
        lines += ["## Successfully Configured", ""]
        for item in configured:
            lines.append(f"- **{item['name']}** ({item['type']}): {item['url']}")
        lines.append("")

    REVIEW_REPORT.write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(
        description="Configure company entries in portals.yml using Claude + web_search"
    )
    parser.add_argument("--batch", type=int, metavar="N", help="Process only N TODO entries")
    parser.add_argument("--dry-run", action="store_true", help="List targets without making changes")
    parser.add_argument("--company", type=str, metavar="NAME", help="Process a single company by name")
    args = parser.parse_args()

    if not PORTALS_YML.exists():
        sys.exit(f"Error: {PORTALS_YML} not found")

    lines = PORTALS_YML.read_text().splitlines()
    entries = find_todo_entries(lines)

    if not entries:
        print("No TODO entries found — portals.yml is fully configured.")
        return

    print(f"Found {len(entries)} TODO entries.")

    if args.company:
        needle = args.company.lower()
        entries = [e for e in entries if needle in e["name"].lower()]
        if not entries:
            sys.exit(f"No TODO entry matching: {args.company!r}")

    if args.batch and args.batch > 0:
        entries = entries[: args.batch]

    if args.dry_run:
        print(f"\n[DRY RUN] Would configure {len(entries)} companies:")
        for e in entries:
            print(f"  - {e['name']} (lines {e['start_line'] + 1}–{e['end_line'] + 1})")
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("Error: ANTHROPIC_API_KEY environment variable is not set")

    client = anthropic.Anthropic(api_key=api_key)

    needs_review = []
    configured = []
    errors = []
    current_lines = lines.copy()
    line_offset = 0

    for idx, entry in enumerate(entries):
        name = entry["name"]
        print(f"\n[{idx + 1}/{len(entries)}] {name}")

        try:
            result = research_company(client, name)
            config_type = result.get("config_type", "needs_review")

            adj_start = entry["start_line"] + line_offset
            adj_end = entry["end_line"] + line_offset
            old_count = adj_end - adj_start + 1

            new_yaml = build_yaml_entry(name, result)
            new_count = len(new_yaml.split("\n"))
            line_offset += new_count - old_count

            current_lines = apply_replacement(current_lines, adj_start, adj_end, new_yaml)
            PORTALS_YML.write_text("\n".join(current_lines) + "\n")

            if config_type == "needs_review":
                reason = result.get("review_reason", "unknown")
                print(f"  NEEDS_REVIEW: {reason}")
                needs_review.append({"name": name, "reason": reason})
            else:
                url = result.get("careers_url", "?")
                print(f"  {config_type.upper()}: {url}")
                configured.append({"name": name, "type": config_type, "url": url})

        except anthropic.RateLimitError:
            print("  Rate limit hit — waiting 30s...")
            time.sleep(30)
            errors.append({"name": name, "error": "Rate limit"})
        except Exception as exc:
            print(f"  ERROR: {exc}")
            errors.append({"name": name, "error": str(exc)})

        # Polite delay between API calls
        if idx < len(entries) - 1:
            time.sleep(1.5)

    print(f"\n{'=' * 60}")
    print(f"Done: {len(configured)} configured, {len(needs_review)} need review, {len(errors)} errors")

    if needs_review or errors:
        write_review_report(needs_review, errors, configured)
        print(f"Review report → {REVIEW_REPORT}")


if __name__ == "__main__":
    main()
