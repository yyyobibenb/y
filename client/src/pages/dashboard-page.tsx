import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Wallet, TrendingUp, Clock, Settings, ArrowDown, ArrowUp, Target, ArrowLeft, Key, Shield, MessageCircle } from "lucide-react";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { getLanguage } from "@/lib/i18n";
import { formatDateWith2025, getLocaleForDateFormatting } from "@/lib/utils";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function DashboardPage() {
  const { user } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const language = getLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'th' ? "เปลี่ยนรหัสผ่านสำเร็จ" : "Password Changed Successfully",
        description: language === 'th' ? "รหัสผ่านของคุณได้รับการอัปเดตแล้ว" : "Your password has been updated"
      });
      changePasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: language === 'th' ? "เปลี่ยนรหัสผ่านไม่สำเร็จ" : "Failed to Change Password",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleChangePassword = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const { data: userStats } = useQuery<any>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: userBets = [] } = useQuery<any[]>({
    queryKey: ["/api/bets/user"],
    enabled: !!user,
  });

  const { data: userDeposits = [] } = useQuery<any[]>({
    queryKey: ["/api/deposits/user"],
    enabled: !!user,
  });

  const { data: userWithdrawals = [] } = useQuery<any[]>({
    queryKey: ["/api/withdrawals/user"],
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { 
        color: "bg-yellow-500", 
        text: language === 'th' ? "รอดำเนินการ" : "Pending" 
      },
      confirmed: { 
        color: "bg-green-500", 
        text: language === 'th' ? "ยืนยันแล้ว" : "Confirmed" 
      },
      processed: { 
        color: "bg-green-500", 
        text: language === 'th' ? "สำเร็จ" : "Successful" 
      },
      failed: { 
        color: "bg-red-500", 
        text: language === 'th' ? "ไม่สำเร็จ" : "Failed" 
      },
      rejected: { 
        color: "bg-red-500", 
        text: language === 'th' ? "ปฏิเสธ" : "Rejected" 
      },
      won: { 
        color: "bg-green-500", 
        text: language === 'th' ? "ชนะ" : "Won" 
      },
      lost: { 
        color: "bg-red-500", 
        text: language === 'th' ? "แพ้" : "Lost" 
      },
      void: { 
        color: "bg-gray-500", 
        text: language === 'th' ? "ยกเลิก" : "Void" 
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: "bg-gray-500", text: status };

    return (
      <Badge className={`${statusInfo.color} text-white`} data-testid={`status-${status}`}>
        {statusInfo.text}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background emoji-background">
      {/* Фоновые плавающие эмодзи для личного кабинета */}
      <div className="floating-emojis">
        <div className="floating-emoji">💰</div>
        <div className="floating-emoji">💎</div>
        <div className="floating-emoji">🏆</div>
        <div className="floating-emoji">⭐</div>
        <div className="floating-emoji">🔥</div>
        <div className="floating-emoji">🚀</div>
        <div className="floating-emoji">💸</div>
        <div className="floating-emoji">🎯</div>
        <div className="floating-emoji">💳</div>
        <div className="floating-emoji">💵</div>
        <div className="floating-emoji">📈</div>
        <div className="floating-emoji">🎲</div>
      </div>
      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Back to Main Button */}
        <div className="mb-6">
          <Link href="/">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              data-testid="button-back-to-main"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{language === 'th' ? 'กลับไปหน้าเดิมพัน' : 'Back to Betting'}</span>
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold" data-testid="user-email">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: <span className="font-mono" data-testid="user-account-id">{user.accountId}</span>
                    </div>
                  </div>
                </div>
                
                {/* Balance Card */}
                <div className="betting-gradient rounded-lg p-4 mb-6">
                  <div className="text-primary-foreground/80 text-sm">{language === 'th' ? 'ยอดเงินคงเหลือ' : 'Balance'}</div>
                  <div className="text-2xl font-bold text-primary-foreground" data-testid="user-balance">
                    ฿{parseFloat(user.balance || '0').toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      onClick={() => setShowDepositModal(true)}
                      data-testid="button-deposit"
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      {language === 'th' ? 'ฝากเงิน' : 'Deposit'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary-foreground text-primary hover:bg-primary-foreground/10"
                      onClick={() => setShowWithdrawModal(true)}
                      data-testid="button-withdraw"
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {language === 'th' ? 'ถอนเงิน' : 'Withdraw'}
                    </Button>
                  </div>
                </div>
                
                {/* Statistics */}
                {userStats && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm">{language === 'th' ? 'การเดิมพันทั้งหมด' : 'Total Bets'}</span>
                      </div>
                      <span className="font-semibold" data-testid="total-bets">{userStats?.totalBets || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-secondary" />
                        <span className="text-sm">{language === 'th' ? 'อัตราชนะ' : 'Win Rate'}</span>
                      </div>
                      <span className="font-semibold text-secondary" data-testid="win-rate">{userStats?.winRate || 0}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span className="text-sm">{language === 'th' ? 'กำไรรวม' : 'Total Profit'}</span>
                      </div>
                      <span className={`font-semibold ${parseFloat(userStats?.totalProfit || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="total-profit">
                        ฿{parseFloat(userStats?.totalProfit || '0').toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bets" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="bets" data-testid="tab-bets">{language === 'th' ? 'ประวัติการเดิมพัน' : 'Betting History'}</TabsTrigger>
                <TabsTrigger value="deposits" data-testid="tab-deposits">{language === 'th' ? 'ประวัติการฝาก' : 'Deposit History'}</TabsTrigger>
                <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">{language === 'th' ? 'ประวัติการถอน' : 'Withdrawal History'}</TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">{language === 'th' ? 'ตั้งค่า' : 'Settings'}</TabsTrigger>
              </TabsList>

              <TabsContent value="bets">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>{language === 'th' ? 'ประวัติการเดิมพัน' : 'Betting History'}</span>
                    </CardTitle>
                    <CardDescription>{language === 'th' ? 'การเดิมพันล่าสุดของคุณ' : 'Your recent bets'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userBets.filter((betData: any) => betData.bets.status !== 'pending').length > 0 ? (
                        userBets.filter((betData: any) => betData.bets.status !== 'pending').map((betData: any) => {
                          const bet = betData.bets;
                          const fixture = betData.fixture;
                          return (
                          <div key={bet.id} className="p-4 bg-muted rounded-lg border border-border hover:shadow-md transition-shadow" data-testid={`bet-${bet.id}`}>
                            {/* Заголовок матча */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm text-foreground" data-testid={`bet-match-${bet.id}`}>
                                  {bet.customHomeTeam && bet.customAwayTeam 
                                    ? `${bet.customHomeTeam} vs ${bet.customAwayTeam}`
                                    : fixture?.homeTeam && fixture?.awayTeam
                                      ? `${fixture.homeTeam} vs ${fixture.awayTeam}`
                                      : ''}
                                </h3>
                                <p className="text-xs text-muted-foreground" data-testid={`bet-league-${bet.id}`}>
                                  {bet.customLeague || fixture?.league || ''} • {fixture?.sport?.toUpperCase() || bet.customLeague ? '' : 'ФУТБОЛ'}
                                </p>
                              </div>
                              {getStatusBadge(bet.status)}
                            </div>

                            {/* Информация о ставке */}
                            <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {language === 'th' ? 'ตลาด' : 'Market'}
                                </p>
                                <p className="font-medium" data-testid={`bet-market-${bet.id}`}>
                                  {bet.market}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {language === 'th' ? 'ราคา' : 'Odds'}
                                </p>
                                <p className="font-medium" data-testid={`bet-odds-${bet.id}`}>
                                  {bet.odds}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {language === 'th' ? 'เงินเดิมพัน' : 'Stake'}
                                </p>
                                <p className="font-medium" data-testid={`bet-stake-${bet.id}`}>
                                  ฿{parseFloat(bet.stake).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {language === 'th' ? 'อาจได้รับ' : 'Potential'}
                                </p>
                                <p className="font-medium text-blue-500" data-testid={`bet-potential-${bet.id}`}>
                                  ฿{(parseFloat(bet.stake) * parseFloat(bet.odds)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>

                            {/* Счет матча и результат */}
                            {(fixture?.status === 'finished' || (bet.customHomeScore !== null && bet.customAwayScore !== null)) && (
                              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">
                                    {language === 'th' ? 'ผลการแข่งขัน' : 'Final Score'}
                                  </p>
                                  <p className="font-medium" data-testid={`bet-score-${bet.id}`}>
                                    {bet.customHomeScore !== null && bet.customAwayScore !== null
                                      ? `${bet.customHomeScore} - ${bet.customAwayScore}`
                                      : `${fixture?.homeScore} - ${fixture?.awayScore}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">
                                    {language === 'th' ? 'กำไร/ขาดทุน' : 'Profit/Loss'}
                                  </p>
                                  {bet.status === 'won' && (
                                    <p className="font-medium text-green-500" data-testid={`bet-profit-${bet.id}`}>
                                      +฿{(parseFloat(bet.stake) * parseFloat(bet.odds) - parseFloat(bet.stake)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </p>
                                  )}
                                  {bet.status === 'lost' && (
                                    <p className="font-medium text-red-500" data-testid={`bet-loss-${bet.id}`}>
                                      -฿{parseFloat(bet.stake).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                    </p>
                                  )}
                                  {bet.status === 'void' && (
                                    <p className="font-medium text-gray-500" data-testid={`bet-void-${bet.id}`}>
                                      ฿0.00
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Дата и время */}
                            <div className="pt-3 border-t border-border flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {formatDateWith2025(bet.placedAt, language === 'th' ? 'th-TH' : 'en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                              {fixture?.status === 'live' && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-red-500 font-medium">
                                    {language === 'th' ? 'กำลังแข่ง' : 'LIVE'} {fixture?.currentMinute || 0}'
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground" data-testid="no-bets">
                          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{language === 'th' ? 'ยังไม่มีการเดิมพัน' : 'No bets yet'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deposits">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowDown className="h-5 w-5" />
                      <span>{language === 'th' ? 'ประวัติการฝาก' : 'Deposit History'}</span>
                    </CardTitle>
                    <CardDescription>{language === 'th' ? 'การฝากเงินล่าสุดของคุณ' : 'Your recent deposits'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userDeposits.length > 0 ? (
                        userDeposits.map((deposit: any) => (
                          <div key={deposit.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`deposit-${deposit.id}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{deposit.method.toUpperCase()}</div>
                              {deposit.txId && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  TX: {deposit.txId.substring(0, 20)}...
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {formatDateWith2025(deposit.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-sm font-semibold">฿{parseFloat(deposit.amount).toFixed(2)}</div>
                              {getStatusBadge(deposit.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground" data-testid="no-deposits">
                          <ArrowDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{language === 'th' ? 'ยังไม่มีการฝากเงิน' : 'No deposits yet'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdrawals">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowUp className="h-5 w-5" />
                      <span>{language === 'th' ? 'ประวัติการถอน' : 'Withdrawal History'}</span>
                    </CardTitle>
                    <CardDescription>{language === 'th' ? 'การถอนเงินล่าสุดของคุณ' : 'Your recent withdrawals'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userWithdrawals.length > 0 ? (
                        userWithdrawals.map((withdrawal: any) => (
                          <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`withdrawal-${withdrawal.id}`}>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{withdrawal.method.toUpperCase()}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {withdrawal.address.substring(0, 20)}...
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDateWith2025(withdrawal.createdAt, getLocaleForDateFormatting(), { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-sm font-semibold">฿{parseFloat(withdrawal.amount).toFixed(2)}</div>
                              {getStatusBadge(withdrawal.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground" data-testid="no-withdrawals">
                          <ArrowUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{language === 'th' ? 'ยังไม่มีการถอนเงิน' : 'No withdrawals yet'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>{language === 'th' ? 'ตั้งค่าบัญชี' : 'Account Settings'}</span>
                    </CardTitle>
                    <CardDescription>{language === 'th' ? 'จัดการการตั้งค่าบัญชีและความปลอดภัย' : 'Manage your account settings and security'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Change Password Section */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Key className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{language === 'th' ? 'เปลี่ยนรหัสผ่าน' : 'Change Password'}</h3>
                      </div>
                      
                      <Form {...changePasswordForm}>
                        <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                          <FormField
                            control={changePasswordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === 'th' ? 'รหัสผ่านปัจจุบัน' : 'Current Password'}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={language === 'th' ? 'รหัสผ่านปัจจุบัน' : 'Current Password'}
                                    {...field}
                                    data-testid="input-current-password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={changePasswordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === 'th' ? 'รหัสผ่านใหม่' : 'New Password'}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={language === 'th' ? 'รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัว)' : 'New Password (min 8 chars)'}
                                    {...field}
                                    data-testid="input-new-password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={changePasswordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder={language === 'th' ? 'ยืนยันรหัสผ่านใหม่' : 'Confirm New Password'}
                                    {...field}
                                    data-testid="input-confirm-password"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={changePasswordMutation.isPending}
                            className="w-full"
                            data-testid="button-change-password"
                          >
                            {changePasswordMutation.isPending 
                              ? (language === 'th' ? 'กำลังเปลี่ยน...' : 'Changing...') 
                              : (language === 'th' ? 'เปลี่ยนรหัสผ่าน' : 'Change Password')
                            }
                          </Button>
                        </form>
                      </Form>
                    </div>

                    <hr />

                    {/* Account Information */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{language === 'th' ? 'ข้อมูลบัญชี' : 'Account Information'}</h3>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{language === 'th' ? 'อีเมล:' : 'Email:'}</span>
                          <span className="font-medium" data-testid="settings-email">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{language === 'th' ? 'รหัสบัญชี:' : 'Account ID:'}</span>
                          <span className="font-mono font-medium" data-testid="settings-account-id">{user.accountId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{language === 'th' ? 'สีดเฟรส:' : 'Seed Phrase:'}</span>
                          <span className="font-mono text-xs bg-background px-2 py-1 rounded border max-w-48 truncate" data-testid="settings-seed-phrase">{user.seedPhrase}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <p>{language === 'th' 
                          ? '⚠️ โปรดเก็บรักษา Seed Phrase ไว้อย่างปลอดภัย คุณสามารถใช้เพื่อเปลี่ยนรหัสผ่านได้' 
                          : '⚠️ Keep your seed phrase safe. You can use it to reset your password if needed'
                        }</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <DepositModal open={showDepositModal} onOpenChange={setShowDepositModal} />
      <WithdrawModal open={showWithdrawModal} onOpenChange={setShowWithdrawModal} />
    </div>
  );
}
