import { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, Edit, Camera, BookOpen, Save, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile, ProfileData } from "@/hooks/useProfile";

const Profile = () => {
  const { profile, setProfile, loading, saving, userId, updateProfile, uploadAvatar } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft({ ...profile });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draft) return;
    const success = await updateProfile(draft);
    if (success) {
      setIsEditing(false);
      setDraft(null);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
  };

  const current = isEditing && draft ? draft : profile;
  const initials = current.name
    ? current.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-8 pt-12 lg:pt-0">
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Not Logged In</h2>
            <p className="text-muted-foreground">Please log in to view and edit your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Student Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEditing}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card className="shadow-card">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-32 h-32 rounded-2xl">
                  {current.avatar_url ? (
                    <AvatarImage src={current.avatar_url} alt={current.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="rounded-2xl bg-primary text-4xl font-display font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-md hover:scale-105 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-sm font-medium text-primary mt-4">{current.student_id || "No ID"}</p>
              <p className="text-xs text-muted-foreground">{current.year || "—"}</p>
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid md:grid-cols-2 gap-6">
              <ProfileField
                icon={User}
                label="Full Name"
                value={current.name}
                editing={isEditing}
                onChange={(v) => setDraft((d) => d ? { ...d, name: v } : d)}
              />
              <ProfileField
                icon={Mail}
                label="Email"
                value={current.email}
                editing={isEditing}
                type="email"
                onChange={(v) => setDraft((d) => d ? { ...d, email: v } : d)}
              />
              <ProfileField
                icon={Phone}
                label="Phone"
                value={current.phone}
                editing={isEditing}
                onChange={(v) => setDraft((d) => d ? { ...d, phone: v } : d)}
              />
              <ProfileField
                icon={MapPin}
                label="Location"
                value={current.location}
                editing={isEditing}
                onChange={(v) => setDraft((d) => d ? { ...d, location: v } : d)}
              />
              <ProfileField
                icon={GraduationCap}
                label="Department"
                value={current.department}
                editing={isEditing}
                onChange={(v) => setDraft((d) => d ? { ...d, department: v } : d)}
              />
              <ProfileField
                icon={BookOpen}
                label="Program"
                value={current.program}
                editing={isEditing}
                onChange={(v) => setDraft((d) => d ? { ...d, program: v } : d)}
              />
              <ProfileField
                icon={Calendar}
                label="Enrollment Date"
                value={current.enrollment_date}
                editing={isEditing}
                onChange={(v) => setDraft((d) => d ? { ...d, enrollment_date: v } : d)}
                className="md:col-span-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProfileFieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
  editing: boolean;
  type?: string;
  className?: string;
  onChange: (value: string) => void;
}

const ProfileField = ({ icon: Icon, label, value, editing, type = "text", className, onChange }: ProfileFieldProps) => (
  <div className={`space-y-2 ${className || ""}`}>
    <Label className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-4 h-4" /> {label}
    </Label>
    {editing ? (
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <p className="font-medium text-foreground">{value || "—"}</p>
    )}
  </div>
);

export default Profile;
