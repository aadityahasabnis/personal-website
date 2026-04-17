# Structured Data Governance and Enriched Results

## Purpose

Create a unified governance model for structured data quality, enriched results, and JS-generated schema.

## Core Principles

- Structured data must reflect visible page content
- Required fields must be complete and accurate
- Recommended fields should be high quality, not filler
- Keep structured data crawlable and indexable

## Supported Formats

- JSON-LD (preferred)
- Microdata
- RDFa

Project default:

- Use JSON-LD for maintainability and consistency.

## Quality Guardrails

### Relevance

- Do not mark up irrelevant entities or misleading data.

### Completeness

- Include all required properties for target feature.
- Add recommended properties when reliable.

### Visibility

- Do not include hidden-only claims not represented to users.

### Consistency

- Keep duplicate page variants aligned.
- Keep dates, titles, and entities consistent with visible copy.

## Enriched Results Context

Enriched results are advanced rich result experiences and require:

- Correct schema type implementation
- Policy compliance
- Sufficient quality signals and completeness

## JavaScript-Generated Structured Data

Allowed, but use carefully:

- Prefer server-rendered schema when possible
- Validate rendered DOM output, not only source code
- Ensure injected schema is deterministic and not duplicated

## Testing Workflow

1. Validate syntax with Schema Markup Validator.
2. Validate eligible feature types with Rich Results Test.
3. Verify rendered HTML in URL Inspection.
4. Monitor rich result reports after deployment.

## Project Implementation Notes

- Keep central schema helper utilities as the source of truth.
- Add regression tests for critical schema outputs.
- Audit schema validity after major template or data model changes.
