import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  student_id: string;
  department: string;
  program: string;
  year: string;
  enrollment_date: string;
  avatar_url: string;
}

const defaultProfile: ProfileData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  student_id: "",
  department: "",
  program: "",
  year: "",
  enrollment_date: "",
  avatar_url: "",
};

export const useProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
        if (session?.user?.id) {
          fetchProfile(session.user.id);
        } else {
          setProfile(defaultProfile);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (data && !error) {
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        student_id: data.student_id || "",
        department: data.department || "",
        program: data.program || "",
        year: data.year || "",
        enrollment_date: data.enrollment_date || "",
        avatar_url: data.avatar_url || "",
      });
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!userId) {
      toast({ title: "Not logged in", description: "Please log in to update your profile.", variant: "destructive" });
      return false;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save profile changes.", variant: "destructive" });
      return false;
    }
    setProfile((prev) => ({ ...prev, ...updates }));
    toast({ title: "Profile updated", description: "Your changes have been saved successfully." });
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) {
      toast({ title: "Not logged in", description: "Please log in to upload an avatar.", variant: "destructive" });
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Append cache-buster
    const url = `${publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: url });
    return url;
  };

  return { profile, setProfile, loading, saving, userId, updateProfile, uploadAvatar };
};
