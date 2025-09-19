# 🎵 Music Integration Guide for Tetris Game

## 📁 File Structure
Place your music files in the following directories:
```
public/audio/
├── neon/          # Synthwave/Retrowave tracks (120-140 BPM)
├── cityscape/     # Lo-fi/Jazz-hop tracks (urban evening vibes)
└── aurora/        # Ambient cinematic tracks (warm, uplifting)
```

## 🎼 Music Recommendations by Theme

### 🌃 Neon Theme (Synthwave/Retrowave)
**Style**: Energetic, 120-140 BPM, synthesizer-heavy
**Mood**: Futuristic, cyberpunk, nostalgic 80s
**Sources**:
- Pixabay Music: Search "synthwave", "retrowave", "cyberpunk"
- YouTube Audio Library: Genre "Electronic", Mood "Energetic" 
- Free Music Archive: "synthwave", "retro electronic"
**Filename examples**: `neon_odyssey_1.mp3`, `synthwave_drive.mp3`, `cyber_nights.mp3`

### 🏙️ Cityscape Theme (Lo-fi/Jazz-hop)
**Style**: Smooth groove, urban, evening atmosphere
**Mood**: Relaxed, sophisticated, metropolitan
**Sources**:
- Pixabay Music: Search "lo-fi", "jazz hop", "urban chill"
- YouTube Audio Library: Genre "Hip Hop" or "Jazz", Mood "Calm"
- Free Music Archive: "lo-fi hip hop", "jazz fusion"
**Filename examples**: `cityscape_dusk_1.mp3`, `urban_groove.mp3`, `jazzhop_evening.mp3`

### 🌌 Aurora Theme (Ambient Cinematic)  
**Style**: Atmospheric pads, subtle bells, cinematic
**Mood**: Uplifting but calming, ethereal, peaceful
**Sources**:
- Pixabay Music: Search "ambient", "cinematic", "atmospheric"
- YouTube Audio Library: Genre "Ambient", Mood "Happy" or "Calm"
- Free Music Archive: "ambient", "atmospheric", "new age"
**Filename examples**: `aurora_borealis_1.mp3`, `northern_lights.mp3`, `ambient_dreams.mp3`

## 🔧 Integration Steps

### 1. Download Music Files
- Use only royalty-free/CC0 licensed tracks
- Recommended file format: MP3 (good compression, wide support)
- File size: Keep under 5MB per track for faster loading

### 2. Organize Files
Place downloaded tracks in the appropriate theme folders:
```bash
# Example structure after adding files:
public/audio/neon/neon_odyssey_1.mp3
public/audio/neon/synthwave_drive.mp3
public/audio/cityscape/cityscape_dusk_1.mp3
public/audio/cityscape/urban_groove.mp3
public/audio/aurora/aurora_borealis_1.mp3
public/audio/aurora/northern_lights.mp3
```

### 3. Update Configuration
The `THEME_PLAYLISTS` in `src/components/game/GameAudio.tsx` has been updated with example filenames. Replace them with your actual filenames:

```typescript
const THEME_PLAYLISTS: Record<string, string[]> = {
  neon: [
    "/audio/neon/your_actual_filename_1.mp3",
    "/audio/neon/your_actual_filename_2.mp3",
    // Add more tracks...
  ],
  cityscape: [
    "/audio/cityscape/your_actual_filename_1.mp3", 
    "/audio/cityscape/your_actual_filename_2.mp3",
    // Add more tracks...
  ],
  aurora: [
    "/audio/aurora/your_actual_filename_1.mp3",
    "/audio/aurora/your_actual_filename_2.mp3", 
    // Add more tracks...
  ],
};
```

### 4. Test Integration
1. Start your development server: `npm run dev`
2. Switch between themes in the game settings
3. Verify that music plays and transitions between tracks
4. Check that volume controls work properly
5. Ensure mute functionality works correctly

## 🎯 Audio Behavior
- **Auto-play**: Music starts when game is running and not muted
- **Seamless transitions**: Tracks transition automatically when one ends
- **Theme switching**: Music changes immediately when theme is switched
- **Volume control**: Respects global volume settings (max 60% to avoid being too loud)
- **Error handling**: Skips broken/missing tracks automatically

## 📝 Licensing Notes
⚠️ **Important**: Only use music you have rights to distribute:
- **CC0 (Public Domain)**: No attribution required
- **Creative Commons**: Check specific license requirements
- **Royalty-free**: Ensure commercial use is allowed if applicable
- **Licensed**: Must have proper distribution rights

## 🔍 Recommended Free Music Sources
1. **Pixabay Music** - High quality, CC0 licensed
2. **YouTube Audio Library** - Free for creators
3. **Free Music Archive** - Various Creative Commons licenses
4. **Zapsplat** - Free with account, royalty-free
5. **Epidemic Sound** - Subscription service with high quality tracks

## 🎵 Pro Tips
- **Variety**: Add 3-5 tracks per theme to avoid repetition
- **Consistency**: Keep similar energy levels within each theme
- **File size**: Optimize MP3 files for web (128-192 kbps is usually sufficient)
- **Loop points**: Choose tracks that transition well when looping
- **Volume levels**: Ensure all tracks have similar volume levels