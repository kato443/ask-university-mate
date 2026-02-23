import { useState, useEffect } from "react";
import { Bell, Shield, Globe, Save, ScanLine, ShieldCheck, ShieldOff, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type TwoFAStep = "idle" | "enrolling" | "verifying" | "active";

const Settings = () => {
  const { toast } = useToast();

  // General settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    messageAlerts: true,
    weeklyDigest: true,
    sessionTimeout: "30",
    language: "en",
    timezone: "africa-nairobi",
  });

  // 2FA state
  const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>("idle");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [checkingMFA, setCheckingMFA] = useState(true);

  // Check if 2FA is already enrolled on mount
  useEffect(() => {
    const checkMFAStatus = async () => {
      setCheckingMFA(true);
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const totp = data?.totp?.find((f) => f.status === "verified");
        if (totp) {
          setFactorId(totp.id);
          setTwoFAStep("active");
        }
      } catch {
        // ignore
      } finally {
        setCheckingMFA(false);
      }
    };
    checkMFAStatus();
  }, []);

  // Start enrollment — get QR code from Supabase
  const handleEnable2FA = async () => {
    setTwoFALoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "BBUC Portal", friendlyName: "Authenticator" });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setTwoFAStep("enrolling");
    } catch (err: unknown) {
      toast({ title: "Failed to start 2FA setup", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setTwoFALoading(false);
    }
  };

  // Verify the OTP entered by user to complete enrollment
  const handleVerify2FA = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Invalid code", description: "Please enter the 6-digit code from your authenticator app.", variant: "destructive" });
      return;
    }
    setTwoFALoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code: otpCode });
      if (verifyError) throw verifyError;

      setTwoFAStep("active");
      setOtpCode("");
      setQrCode("");
      setSecret("");
      toast({ title: "2FA Enabled ✅", description: "Your account is now protected with two-factor authentication." });
    } catch (err: unknown) {
      toast({ title: "Verification failed", description: err instanceof Error ? err.message : "Incorrect code. Please try again.", variant: "destructive" });
    } finally {
      setTwoFALoading(false);
    }
  };

  // Unenroll / disable 2FA
  const handleDisable2FA = async () => {
    setTwoFALoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setTwoFAStep("idle");
      setFactorId("");
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been removed from your account." });
    } catch (err: unknown) {
      toast({ title: "Failed to disable 2FA", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated successfully." });
  };

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>
        <Button variant="accent" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Control how you receive alerts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
              { key: "messageAlerts", label: "Message Alerts", desc: "Get notified for new messages" },
              { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of your weekly activity" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{label}</Label>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={settings[key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Timeout */}
            <div className="space-y-2">
              <Label className="font-medium">Session Timeout</Label>
              <Select value={settings.sessionTimeout} onValueChange={(v) => setSettings({ ...settings, sessionTimeout: v })}>
                <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Two-Factor Authentication */}
            <div className="border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {twoFAStep === "active"
                    ? <ShieldCheck className="w-6 h-6 text-green-500" />
                    : <Shield className="w-6 h-6 text-muted-foreground" />
                  }
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFAStep === "active"
                        ? "2FA is active — your account is protected"
                        : "Add an extra layer of security with an authenticator app"}
                    </p>
                  </div>
                </div>
                {/* Status badge */}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${twoFAStep === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {twoFAStep === "active" ? "Enabled" : "Disabled"}
                </span>
              </div>

              {checkingMFA ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Checking 2FA status…
                </div>
              ) : twoFAStep === "idle" && (
                <Button variant="accent" onClick={handleEnable2FA} disabled={twoFALoading} className="w-full sm:w-auto">
                  <ScanLine className="w-4 h-4 mr-2" />
                  {twoFALoading ? "Setting up…" : "Enable Two-Factor Authentication"}
                </Button>
              )}

              {/* Step 1: Show QR code */}
              {twoFAStep === "enrolling" && (
                <div className="space-y-4">
                  <p className="text-sm text-foreground font-medium">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {qrCode && (
                      <img src={qrCode} alt="2FA QR Code" className="w-44 h-44 border-2 border-border rounded-xl bg-white p-2" />
                    )}
                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-muted-foreground">Or enter this secret key manually:</p>
                      <code className="block bg-muted rounded-lg p-3 text-xs font-mono break-all select-all text-foreground">
                        {secret}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp-code">Enter the 6-digit code from your app to verify</Label>
                    <div className="flex gap-3">
                      <Input
                        id="otp-code"
                        placeholder="123456"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-36 text-center text-lg font-mono tracking-widest"
                      />
                      <Button variant="accent" onClick={handleVerify2FA} disabled={twoFALoading || otpCode.length !== 6}>
                        {twoFALoading ? "Verifying…" : "Verify & Activate"}
                      </Button>
                      <Button variant="ghost" onClick={() => { setTwoFAStep("idle"); setQrCode(""); setSecret(""); setOtpCode(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Already active — show disable option */}
              {twoFAStep === "active" && (
                <Button
                  variant="ghost"
                  onClick={handleDisable2FA}
                  disabled={twoFALoading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                >
                  <ShieldOff className="w-4 h-4 mr-2" />
                  {twoFALoading ? "Disabling…" : "Disable Two-Factor Authentication"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Globe className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-medium">Language</Label>
              <Select value={settings.language} onValueChange={(v) => setSettings({ ...settings, language: v })}>
                <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                <SelectTrigger className="w-full md:w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa-nairobi">East Africa Time – EAT (UTC+3)</SelectItem>
                  <SelectItem value="africa-kampala">Kampala, Uganda (UTC+3)</SelectItem>
                  <SelectItem value="africa-kigali">Kigali, Rwanda (UTC+3)</SelectItem>
                  <SelectItem value="africa-bujumbura">Bujumbura, Burundi (UTC+3)</SelectItem>
                  <SelectItem value="europe-london">London, UK (UTC+0)</SelectItem>
                  <SelectItem value="america-new-york">Eastern Time, US (UTC-5)</SelectItem>
                  <SelectItem value="america-los-angeles">Pacific Time, US (UTC-8)</SelectItem>
                  <SelectItem value="asia-tokyo">Tokyo, Japan (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
