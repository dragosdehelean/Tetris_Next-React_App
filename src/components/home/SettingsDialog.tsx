"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Slider,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/features/store/hooks";
import { 
  selectSettings,
  selectVolume,
  selectMuted,
  selectGhostPiece,
  selectRightHanded,
  selectRotationDirection,
  selectEffectsIntensity,
  setVolume,
  setMuted,
  setGhostPiece,
  setRightHanded,
  setRotationDirection,
  setEffectsIntensity,
} from "@/features/settings/settingsSlice";
import {
  selectThemeName,
  setTheme,
} from "@/features/theme/themeSlice";
import { THEME_OPTIONS } from "@/features/theme/themeOptions";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const dispatch = useAppDispatch();
  const volume = useAppSelector(selectVolume);
  const muted = useAppSelector(selectMuted);
  const ghostPiece = useAppSelector(selectGhostPiece);
  const rightHanded = useAppSelector(selectRightHanded);
  const rotationDirection = useAppSelector(selectRotationDirection);
  const effectsIntensity = useAppSelector(selectEffectsIntensity);
  const themeName = useAppSelector(selectThemeName);

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    dispatch(setVolume(newValue as number));
  };

  const handleMutedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMuted(event.target.checked));
  };

  const handleGhostPieceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setGhostPiece(event.target.checked));
  };

  const handleHandPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRightHanded(event.target.value === 'right'));
  };

  const handleRotationDirectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRotationDirection(event.target.value as 'CW' | 'CCW'));
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTheme(event.target.value));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(20, 25, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1 
      }}>
        ⚙️ Setări
        <IconButton 
          onClick={onClose}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          ✕
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Setări temă - PRIMUL */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.light' }}>
              🎨 Teme
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                value={themeName}
                onChange={handleThemeChange}
                sx={{ '& .MuiRadio-root': { color: 'white' } }}
              >
                {THEME_OPTIONS.map((theme) => (
                  <FormControlLabel
                    key={theme.id}
                    value={theme.id}
                    control={<Radio />}
                    label={theme.label}
                    sx={{ color: 'white' }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Setări de control */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.light' }}>
              🎮 Controale
            </Typography>
            
            {/* Hand Preference */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ color: 'white', mb: 1 }}>
                Preferință mână
              </FormLabel>
              <RadioGroup
                value={rightHanded ? 'right' : 'left'}
                onChange={handleHandPreferenceChange}
                sx={{ '& .MuiRadio-root': { color: 'white' } }}
              >
                <FormControlLabel 
                  value="right" 
                  control={<Radio />} 
                  label="Dreptaci (Hard Drop → Soft Drop)"
                  sx={{ color: 'white' }}
                />
                <FormControlLabel 
                  value="left" 
                  control={<Radio />} 
                  label="Stângaci (Soft Drop → Hard Drop)"
                  sx={{ color: 'white' }}
                />
              </RadioGroup>
            </FormControl>

            {/* Rotation Direction */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ color: 'white', mb: 1 }}>
                Direcție rotație
              </FormLabel>
              <RadioGroup
                value={rotationDirection}
                onChange={handleRotationDirectionChange}
                sx={{ '& .MuiRadio-root': { color: 'white' } }}
              >
                <FormControlLabel 
                  value="CW" 
                  control={<Radio />} 
                  label="⟳ Clockwise (în sensul acelor)"
                  sx={{ color: 'white' }}
                />
                <FormControlLabel 
                  value="CCW" 
                  control={<Radio />} 
                  label="⟲ Counter-Clockwise (invers acelor)"
                  sx={{ color: 'white' }}
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Setări audio */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.light' }}>
              🔊 Audio
            </Typography>
            
            {/* Volume Slider */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                Volum: {Math.round(volume * 100)}%
              </Typography>
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                disabled={muted}
                sx={{
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
            </Box>

            {/* Muted Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={muted}
                  onChange={handleMutedChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'primary.main',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              }
              label="Dezactivează sunetul"
              sx={{ color: 'white', mb: 2 }}
            />
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Setări efecte */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.light' }}>
              ✨ Efecte
            </Typography>
            
            {/* Effects Intensity Slider */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                Intensitatea efectelor: {Math.round(effectsIntensity * 100)}%
              </Typography>
              <Slider
                value={effectsIntensity}
                onChange={(_, value) => dispatch(setEffectsIntensity(value as number))}
                min={0}
                max={1}
                step={0.01}
                sx={{
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Controlează intensitatea efectelor vizuale și sonore la câștigarea punctelor
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Setări vizuale */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.light' }}>
              👻 Vizuale
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={ghostPiece}
                  onChange={handleGhostPieceChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'primary.main',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              }
              label="Afișează piesa fantomă"
              sx={{ color: 'white', mb: 2 }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} autoFocus data-testid="settings-close">
          Închide
        </Button>
      </DialogActions>
    </Dialog>
  );
}