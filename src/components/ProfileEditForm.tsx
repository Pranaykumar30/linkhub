
import { useState } from 'react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  custom_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileEditFormProps {
  profile: Profile | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const ProfileEditForm = ({ profile, onClose, onUpdate }: ProfileEditFormProps) => {
  const { toast } = useToast();
  const { uploadAvatar, removeAvatar, uploading } = useAvatarUpload();
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    custom_url: profile?.custom_url || '',
    avatar_url: profile?.avatar_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    const avatarUrl = await uploadAvatar(file);
    if (avatarUrl) {
      setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    }
  };

  const handleRemoveAvatar = async () => {
    const success = await removeAvatar();
    if (success) {
      setFormData(prev => ({ ...prev, avatar_url: '' }));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: 'No profile found' };

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up website URL
    let website = formData.website.trim();
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      website = `https://${website}`;
    }

    // Clean up custom URL - remove spaces and special characters, make lowercase
    let customUrl = formData.custom_url.trim().toLowerCase();
    customUrl = customUrl.replace(/[^a-z0-9-_]/g, '');

    const updates = {
      ...formData,
      website: website || null,
      custom_url: customUrl || null,
      full_name: formData.full_name.trim() || null,
      username: formData.username.trim() || null,
      bio: formData.bio.trim() || null,
    };

    const { error } = await updateProfile(updates);
    if (!error) {
      // Trigger callback to parent to refresh data
      if (onUpdate) {
        setTimeout(() => {
          onUpdate();
        }, 200);
      }
      onClose();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button type="button" variant="outline" size="sm" disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </div>
              {formData.avatar_url && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_url">Custom URL</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">yourdomain.com/</span>
                <Input
                  id="custom_url"
                  name="custom_url"
                  value={formData.custom_url}
                  onChange={handleChange}
                  placeholder="your-custom-url"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your unique public profile URL. Only letters, numbers, hyphens, and underscores allowed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://your-website.com"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updating || uploading} className="flex-1">
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditForm;
