import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import type { UserProfileData } from '../types';

interface ProfileEditFormProps {
  profile: UserProfileData;
  onSave: (updatedProfile: Partial<UserProfileData>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    email: profile.email || '',
    website: profile.socialLinks?.website || '',
    linkedin: profile.socialLinks?.linkedin || '',
    github: profile.socialLinks?.github || '',
    twitter: profile.socialLinks?.twitter || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website URL must start with http:// or https://';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedProfile: Partial<UserProfileData> = {
      bio: formData.bio,
      email: formData.email,
      socialLinks: {
        website: formData.website,
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
      },
    };

    try {
      await onSave(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" component="h2" gutterBottom>
            Edit Profile
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Bio Section */}
          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              error={!!errors.bio}
              helperText={errors.bio || `${formData.bio.length}/500`}
              FormHelperTextProps={{
                sx: { display: 'flex', justifyContent: 'space-between' }
              }}
              sx={{ mb: 2 }}
            />
          </Box>

          {/* Contact Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Social Links */}
          <Box mb={3}>
            <Typography variant="h5" component="h3" gutterBottom sx={{ mb: 2 }}>
              Social Links
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="url"
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                  error={!!errors.website}
                  helperText={errors.website}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="url"
                  label="LinkedIn"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="url"
                  label="GitHub"
                  value={formData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="url"
                  label="Twitter"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourusername"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end" pt={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ minWidth: 150, py: 1.5 }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileEditForm;