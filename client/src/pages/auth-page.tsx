import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertTriangle, Copy, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setLanguage, getLanguage, t } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

// Helper function to calculate age
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Function to generate seed phrase
const generateSeedPhrase = (): string => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
    'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
    'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
    'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
    'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
    'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also',
    'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient',
    'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antique',
    'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
    'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
    'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
    'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction'
  ];
  
  // Generate 12 random words
  const seedWords = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    seedWords.push(words[randomIndex]);
  }
  
  return seedWords.join(' ');
};

// Dynamic schemas that adapt to current language
const createLoginSchema = () => z.object({
  email: z.string().email(t('emailValidation')),
  password: z.string().min(1, t('passwordRequired')),
});

const createRegisterSchema = () => z.object({
  email: z.string().email(t('emailValidation')),
  password: z.string().min(8, t('passwordMinChars')),
  confirmPassword: z.string(),
  name: z.string().min(1, t('nameRequired')),
  phoneNumber: z.string().min(1, t('phoneRequired')).regex(/^(\+66|0)[0-9]{8,9}$/, getLanguage() === 'th' ? 'กรุณากรอกหมายเลขโทรศัพท์ไทยที่ถูกต้อง (เช่น 081-234-5678 หรือ +66812345678)' : 'Please enter a valid Thai phone number (e.g., 081-234-5678 or +66812345678)'),
  dateOfBirth: z.string().min(1, t('dateOfBirthRequired'))
    .refine(date => {
      const age = calculateAge(date);
      return age >= 18;
    }, {
      message: getLanguage() === 'th' ? 'คุณต้องอายุ 18 ปีขึ้นไปเพื่อลงทะเบียน' : 'You must be at least 18 years old to register'
    }),
  terms: z.boolean().refine(val => val === true, t('termsRequired')),
}).refine(data => data.password === data.confirmPassword, {
  message: t('passwordMismatch'),
  path: ["confirmPassword"],
});

const createForgotPasswordSchema = () => z.object({
  email: z.string().email(t('emailValidation')),
  seedPhrase: z.string().min(1, getLanguage() === 'th' ? 'กรุณากรอกรหัส Recovery Phrase' : 'Please enter your recovery phrase'),
  newPassword: z.string().min(8, t('passwordMinChars')),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: t('passwordMismatch'),
  path: ["confirmNewPassword"],
});

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());
  const [generatedSeedPhrase, setGeneratedSeedPhrase] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false);
  const [phraseRemembered, setPhraseRemembered] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = (lang: 'th' | 'en') => {
    setLanguage(lang);
    setCurrentLanguage(lang);
    // Force page reload to apply new translations
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema()),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema()),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      phoneNumber: "",
      dateOfBirth: "",
      terms: false,
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema()),
    defaultValues: {
      email: "",
      seedPhrase: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const onRegister = (data: RegisterFormData) => {
    // Generate seed phrase when form is valid
    if (!generatedSeedPhrase) {
      const seedPhrase = generateSeedPhrase();
      setGeneratedSeedPhrase(seedPhrase);
      setShowSeedPhrase(true);
      return;
    }
    
    console.log('Form data:', data); // Debug log
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      name: data.name,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      language: currentLanguage,
      seedPhrase: generatedSeedPhrase,
    });
  };

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      const response = await fetch('/api/recover-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          seedPhrase: data.seedPhrase,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: getLanguage() === 'th' ? "สำเร็จ!" : "Success!",
          description: getLanguage() === 'th' ? 
            "รหัสผ่านได้รับการอัพเดตแล้ว คุณสามารถล็อกอินได้แล้ว" :
            "Password updated successfully. You can now login.",
        });
        forgotPasswordForm.reset();
      } else {
        const errorData = await response.json();
        toast({
          title: getLanguage() === 'th' ? "ข้อผิดพลาด" : "Error",
          description: errorData.message || (getLanguage() === 'th' ? 
            "ไม่สามารถกู้คืนรหัสผ่านได้" : "Failed to recover password"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Password recovery error:', error);
      toast({
        title: getLanguage() === 'th' ? "ข้อผิดพลาด" : "Error",
        description: getLanguage() === 'th' ? 
          "เกิดข้อผิดพลาดในการเชื่อมต่อ" : "Connection error occurred",
        variant: "destructive",
      });
    }
  };

  const copySeedPhrase = async () => {
    try {
      await navigator.clipboard.writeText(generatedSeedPhrase);
      setSeedPhraseCopied(true);
      toast({
        title: getLanguage() === 'th' ? "คัดลอกแล้ว!" : "Copied!",
        description: getLanguage() === 'th' ? 
          "คัดลอก Recovery Phrase แล้ว" :
          "Recovery phrase copied to clipboard",
      });
      setTimeout(() => setSeedPhraseCopied(false), 2000);
    } catch (err) {
      toast({
        title: getLanguage() === 'th' ? "ข้อผิดพลาด" : "Error",
        description: getLanguage() === 'th' ? 
          "ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง" :
          "Could not copy automatically, please copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <div className="min-h-screen flex">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32" data-testid="language-selector-auth">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="th">🇹🇭 ไทย</SelectItem>
            <SelectItem value="en">🇺🇸 English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="betting-gradient text-primary-foreground px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-4">
              ThaiBC
            </div>
            <h1 className="text-2xl font-bold" data-testid="auth-title">{t('authTitle')}</h1>
            <p className="text-muted-foreground" data-testid="auth-subtitle">
              {t('authSubtitle')}
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" data-testid="tab-login">{t('login')}</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">{t('register')}</TabsTrigger>
              <TabsTrigger value="forgot" data-testid="tab-forgot">
                {getLanguage() === 'th' ? 'ลืมรหัสผ่าน' : 'Forgot Password'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="login-title">{t('loginTitle')}</CardTitle>
                  <CardDescription data-testid="login-description">
                    {t('loginDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        {...loginForm.register("email")}
                        data-testid="input-login-email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive" data-testid="error-login-email">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('password')}</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('passwordPlaceholder')}
                          {...loginForm.register("password")}
                          data-testid="input-login-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-login-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive" data-testid="error-login-password">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm">{t('rememberMe')}</Label>
                      </div>
                      <Button variant="link" className="px-0 text-sm" data-testid="forgot-password">
                        {t('forgotPassword')}
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full betting-gradient"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('loggingIn')}
                        </>
                      ) : (
                        t('login')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="register-title">{t('registerTitle')}</CardTitle>
                  <CardDescription data-testid="register-description">
                    {t('registerDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">{t('name')}</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder={t('namePlaceholder')}
                        {...registerForm.register("name")}
                        data-testid="input-register-name"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-destructive" data-testid="error-register-name">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('email')}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        {...registerForm.register("email")}
                        data-testid="input-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive" data-testid="error-register-email">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone">{t('phoneNumber')}</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder={getLanguage() === 'th' ? 'เช่น 081-234-5678 หรือ +66812345678' : 'e.g., 081-234-5678 or +66812345678'}
                        {...registerForm.register("phoneNumber")}
                        data-testid="input-register-phone"
                      />
                      {registerForm.formState.errors.phoneNumber && (
                        <p className="text-sm text-destructive" data-testid="error-register-phone">
                          {registerForm.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-dob">{t('dateOfBirth')}</Label>
                      <Input
                        id="register-dob"
                        type="date"
                        {...registerForm.register("dateOfBirth")}
                        data-testid="input-register-dob"
                      />
                      {registerForm.formState.errors.dateOfBirth && (
                        <p className="text-sm text-destructive" data-testid="error-register-dob">
                          {registerForm.formState.errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('password')}</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('passwordMinLength')}
                          {...registerForm.register("password")}
                          data-testid="input-register-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="toggle-register-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive" data-testid="error-register-password">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t('confirmPasswordPlaceholder')}
                          {...registerForm.register("confirmPassword")}
                          data-testid="input-confirm-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive" data-testid="error-confirm-password">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm text-muted-foreground mb-1">{t('accountIdLabel')}</div>
                      <div className="font-mono text-lg font-bold text-secondary" data-testid="generated-account-id">
                        {t('accountIdGenerate')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{t('accountIdNote')}</div>
                    </div>

                    <div className={`border rounded-lg p-3 ${registerForm.formState.errors.terms ? 'border-destructive bg-destructive/5' : 'border-muted'}`}>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={registerForm.watch("terms")}
                          onCheckedChange={(checked) => registerForm.setValue("terms", !!checked)}
                          data-testid="checkbox-terms"
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          {t('termsAccept')}{" "}
                          <Link 
                            href="/terms" 
                            className="text-primary underline hover:text-primary/80"
                            data-testid="link-terms"
                          >
                            {t('termsAndConditions')}
                          </Link>{" "}
                          {t('termsOf')}
                        </Label>
                      </div>
                      {registerForm.formState.errors.terms && (
                        <p className="text-sm text-destructive mt-2" data-testid="error-terms">
                          {registerForm.formState.errors.terms.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full betting-gradient"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('registering')}
                        </>
                      ) : (
                        t('register')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forgot" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {getLanguage() === 'th' ? 'กู้คืนรหัสผ่าน' : 'Password Recovery'}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {getLanguage() === 'th' ? 'กรุณากรอกอีเมลและ Recovery Phrase เพื่อตั้งรหัสผ่านใหม่' : 'Enter your email and recovery phrase to set a new password'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">
                        {getLanguage() === 'th' ? 'อีเมล' : 'Email'}
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder={getLanguage() === 'th' ? 'กรอกอีเมลของคุณ' : 'Enter your email'}
                        {...forgotPasswordForm.register("email")}
                        data-testid="input-forgot-email"
                      />
                      {forgotPasswordForm.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {forgotPasswordForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seed-phrase">
                        {getLanguage() === 'th' ? 'Recovery Phrase' : 'Recovery Phrase'}
                      </Label>
                      <Input
                        id="seed-phrase"
                        type="text"
                        placeholder={getLanguage() === 'th' ? 'กรอก Recovery Phrase 12 คำ' : 'Enter your 12-word recovery phrase'}
                        {...forgotPasswordForm.register("seedPhrase")}
                        data-testid="input-seed-phrase"
                      />
                      {forgotPasswordForm.formState.errors.seedPhrase && (
                        <p className="text-sm text-red-500">
                          {forgotPasswordForm.formState.errors.seedPhrase.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">
                        {getLanguage() === 'th' ? 'รหัสผ่านใหม่' : 'New Password'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder={getLanguage() === 'th' ? 'กรอกรหัสผ่านใหม่' : 'Enter new password'}
                          {...forgotPasswordForm.register("newPassword")}
                          data-testid="input-new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          data-testid="button-toggle-new-password"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {forgotPasswordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {forgotPasswordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">
                        {getLanguage() === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-new-password"
                          type={showConfirmNewPassword ? "text" : "password"}
                          placeholder={getLanguage() === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm new password'}
                          {...forgotPasswordForm.register("confirmNewPassword")}
                          data-testid="input-confirm-new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          data-testid="button-toggle-confirm-new-password"
                        >
                          {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {forgotPasswordForm.formState.errors.confirmNewPassword && (
                        <p className="text-sm text-red-500">
                          {forgotPasswordForm.formState.errors.confirmNewPassword.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      data-testid="button-recover-password"
                    >
                      {getLanguage() === 'th' ? 'ตั้งรหัสผ่านใหม่' : 'Reset Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 betting-gradient items-center justify-center p-8">
        <div className="text-center text-primary-foreground max-w-md">
          <h2 className="text-4xl font-bold mb-4" data-testid="hero-title">
            {t('heroTitle')}
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90" data-testid="hero-description">
            {t('heroDescription')}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">24/7</div>
              <div>{t('feature24h')}</div>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">100+</div>
              <div>{t('featureLeagues')}</div>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">{currentLanguage === 'th' ? 'เร็ว' : 'Fast'}</div>
              <div>{t('featureFast')}</div>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <div className="font-bold text-2xl">{currentLanguage === 'th' ? 'ปลอดภัย' : 'Safe'}</div>
              <div>{t('featureSafe')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Seed Phrase Modal */}
    {showSeedPhrase && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-lg">
                {getLanguage() === 'th' ? 'Recovery Phrase สำคัญมาก!' : 'Important Recovery Phrase!'}
              </CardTitle>
            </div>
            <CardDescription>
              {getLanguage() === 'th' ? 
                'บันทึก Recovery Phrase นี้ไว้ให้ปลอดภัย คุณจะใช้มันกู้คืนรหัสผ่านได้' :
                'Please save this recovery phrase safely. You will need it to recover your password.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <Key className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm break-words">
                {generatedSeedPhrase}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={copySeedPhrase}
              variant="outline"
              className="w-full mb-4"
              data-testid="button-copy-seed"
            >
              <Copy className="h-4 w-4 mr-2" />
              {seedPhraseCopied ? (
                getLanguage() === 'th' ? 'คัดลอกแล้ว!' : 'Copied!'
              ) : (
                getLanguage() === 'th' ? 'คัดลอก' : 'Copy'
              )}
            </Button>
            
            {/* Checkbox to confirm they remembered the phrase */}
            <div className="flex items-start space-x-3 mb-4">
              <Checkbox
                id="remembered-phrase"
                checked={phraseRemembered}
                onCheckedChange={(checked) => setPhraseRemembered(!!checked)}
                data-testid="checkbox-remembered-phrase"
                className="mt-1"
              />
              <Label htmlFor="remembered-phrase" className="text-sm leading-relaxed cursor-pointer">
                {getLanguage() === 'th' ? 
                  'ฉันได้บันทึก Recovery Phrase นี้ไว้ในที่ปลอดภัยแล้ว และเข้าใจว่าจำเป็นต้องใช้เพื่อกู้คืนบัญชี' :
                  'I have securely saved this recovery phrase and understand it is needed to recover my account'}
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowSeedPhrase(false);
                  setPhraseRemembered(false);
                  setGeneratedSeedPhrase('');
                }}
                variant="outline"
                className="flex-1"
                data-testid="button-close-seed-modal"
              >
                {getLanguage() === 'th' ? 'ปิด' : 'Close'}
              </Button>
              <Button 
                onClick={() => {
                  setShowSeedPhrase(false);
                  // Continue with registration
                  const formData = registerForm.getValues();
                  registerMutation.mutate({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    dateOfBirth: formData.dateOfBirth,
                    language: currentLanguage,
                    seedPhrase: generatedSeedPhrase,
                  });
                }}
                className="flex-1"
                disabled={!phraseRemembered}
                data-testid="button-continue-registration"
              >
                {getLanguage() === 'th' ? 'ดำเนินการต่อ' : 'Continue'}
              </Button>
            </div>
            
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {getLanguage() === 'th' ? 
                  '⚠️ หากสูญหาย Recovery Phrase จะไม่สามารถกู้คืนบัญชีได้' :
                  '⚠️ If you lose this recovery phrase, you cannot recover your account'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  );
}
