/*
  # Create scrape_results table

  ## Summary
  Creates the main data storage table for WebScrape application.

  ## New Tables

  ### `scrape_results`
  Stores every scrape that has been performed.
  - `id` — UUID primary key, auto-generated
  - `url` — The URL that was scraped
  - `titles` — JSONB array of page titles found
  - `headings` — JSONB array of headings found
  - `links` — JSONB array of links found
  - `ai_summary` — OpenAI-generated plain-English summary of the content
  - `total_items` — Total count of all titles + headings + links combined
  - `created_at` — Timestamp of when the scrape was performed

  ## Security
  - RLS is enabled on the table
  - A public SELECT and INSERT policy is added since this app has no user authentication
    (read the spec: "No login or user accounts required")
  - Policies are scoped to anon role only (not service_role)

  ## Notes
  1. The app has no authentication by design — all users share one data store
  2. JSONB is used for arrays to allow flexible querying and storage
  3. total_items is stored redundantly for fast History Screen queries
*/

CREATE TABLE IF NOT EXISTS scrape_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  titles jsonb NOT NULL DEFAULT '[]',
  headings jsonb NOT NULL DEFAULT '[]',
  links jsonb NOT NULL DEFAULT '[]',
  ai_summary text NOT NULL DEFAULT '',
  total_items integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scrape_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scrape results"
  ON scrape_results
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert scrape results"
  ON scrape_results
  FOR INSERT
  TO anon
  WITH CHECK (true);
