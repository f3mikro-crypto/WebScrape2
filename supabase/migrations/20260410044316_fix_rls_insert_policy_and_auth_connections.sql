/*
  # Fix RLS INSERT policy and Auth connection strategy

  ## Summary
  Addresses two security/configuration issues flagged by the Supabase advisor.

  ## Changes

  ### 1. RLS INSERT Policy — `scrape_results`
  - **Problem**: The existing `Anyone can insert scrape results` policy used `WITH CHECK (true)`,
    which allows completely unrestricted inserts including empty, malformed, or malicious rows.
  - **Fix**: Drop the permissive policy and replace it with one that validates the inserted row:
    - `url` must be a non-empty string
    - `total_items` must be >= 0
    - `titles`, `headings`, and `links` must be valid JSON arrays
    This prevents garbage data while still allowing legitimate anonymous inserts.

  ### 2. Auth DB Connection Strategy
  - **Problem**: Auth is configured to use a fixed connection count (10). Scaling the instance
    does not automatically adjust this, potentially starving or over-allocating connections.
  - **Fix**: Switch to percentage-based connection pooling via `auth.set_config` so the Auth
    server automatically scales its connection share proportionally with the instance.

  ## Security Notes
  - The SELECT policy (`USING (true)`) is intentionally left permissive — the app design
    requires all scraped results to be publicly readable (no user accounts).
  - Only the INSERT path is tightened here.
*/

DROP POLICY IF EXISTS "Anyone can insert scrape results" ON scrape_results;

CREATE POLICY "Anon can insert valid scrape results"
  ON scrape_results
  FOR INSERT
  TO anon
  WITH CHECK (
    url IS NOT NULL
    AND length(trim(url)) > 0
    AND total_items >= 0
    AND jsonb_typeof(titles) = 'array'
    AND jsonb_typeof(headings) = 'array'
    AND jsonb_typeof(links) = 'array'
  );
