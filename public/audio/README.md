# 🎵 Tetris Game Audio Files

Place your background music files here, grouped by theme:

## 📁 Directory Structure
- `/public/audio/neon/` - Synthwave/Retrowave tracks (120-140 BPM, energetic)
- `/public/audio/cityscape/` - Lo-fi/Jazz-hop tracks (urban evening vibes)  
- `/public/audio/aurora/` - Ambient cinematic tracks (warm, uplifting atmosphere)

## 🎼 Music Requirements
- **Format**: MP3 (recommended for web compatibility)
- **Licensing**: Only royalty-free/CC0 or properly licensed tracks
- **File size**: Keep under 5MB per track for optimal loading
- **Quality**: 128-192 kbps is sufficient for game audio

## 🔧 Configuration
After adding your music files, update the `THEME_PLAYLISTS` object in:
`src/components/game/GameAudio.tsx`

Example filenames currently configured:
- Neon: `neon_odyssey_1.mp3`, `synthwave_drive.mp3`, `cyber_nights.mp3`
- Cityscape: `cityscape_dusk_1.mp3`, `urban_groove.mp3`, `jazzhop_evening.mp3`
- Aurora: `aurora_borealis_1.mp3`, `northern_lights.mp3`, `ambient_dreams.mp3`

Replace these with your actual filenames in the THEME_PLAYLISTS configuration.

## 📚 Full Integration Guide
See `MUSIC_INTEGRATION_GUIDE.md` in the root directory for complete setup instructions.
