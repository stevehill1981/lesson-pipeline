# Pattern Library - ARCHIVED

**Date Archived:** 2025-01-17

**Reason:** Pattern library now maintained exclusively in website as MDX files.

**Current Location:** `/website/src/pages/commodore-64/phase-0/patterns/`

**What This Was:**
This directory contained the original extracted pattern library from 64 validated C64 BASIC lessons. The patterns were initially documented here in markdown format during the extraction and analysis phase.

**Why It Was Archived:**
Having two versions of the pattern library (one in lesson-pipeline, one in website) created maintenance burden and risk of divergence. The website MDX versions are what learners actually see and use, making them the canonical source.

**What To Do Instead:**
- Edit pattern files directly in `/website/src/pages/commodore-64/phase-0/patterns/`
- Pattern changes are immediately visible on the published website
- Single source of truth, no duplication

**Historical Value:**
This archived version preserves the extraction methodology and documentation from the initial pattern library creation. The extraction notes, completion summaries, and pattern library plan remain valuable historical context.

**Key Archived Files:**
- `README.md` - Original pattern library overview with extraction methodology
- `STATUS.md` - Completion tracking during extraction phase
- `COMPLETION_SUMMARY.md` - Final extraction summary
- `pattern-library-plan.md` - Original extraction plan
- Individual pattern `.md` files in category subdirectories

**See Also:**
- Current pattern library: `/website/src/pages/commodore-64/phase-0/patterns/`
- Extraction notes preserved in this archive for historical reference
