-- Run once in the Neon SQL editor: adds admin-managed cassette title and captions to chapters.
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS audio_title TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS captions_url TEXT;
